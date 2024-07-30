import nock from "nock";
import axios from "axios";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import request from "supertest";

// the method property is supported by the underlying node-http module but it is not exposed in the typescript type. We augment the type here so that we can pass it in
declare module "http-proxy-middleware" {
  interface Options {
    method?: string;
  }
}

describe("Index", () => {
  it("should fake a response to a simple proxied endpoint", async () => {
    nock("http://localhost:6666").post("/").reply(200, { data: "Hello World" });

    const app = express();
    app.use(createProxyMiddleware({ target: "http://localhost:6666" }));

    request(app)
      .post("/")
      .expect(200)
      .then((response: any) => {
        expect(response.body).toEqual({ data: "Hello World" });
      });
  });

  it("should fake a response to an endpoint and fiddle with the response", async () => {
    nock("http://localhost:6666").get("/").reply(200, { data: "Hello World" });

    const app = express();
    app.use(
      createProxyMiddleware({
        target: "http://localhost:6666",
        selfHandleResponse: true,
        on: {
          proxyRes: (proxyRes, req, res) => {
            res.send({ data: "XXXXX World" });
          },
        },
      })
    );

    request(app)
      .get("/")
      .expect(200)
      .then((response: any) => {
        expect(response.body).toEqual({ data: "XXXXX World" });
      });
  });

  it("should fake a response to an endpoint when the method is changed, using an additional middleware", async () => {
    const app = express();
    // This is a hack to change the method from GET to POST. We do this literally just to support nock which doesn't work well with http-proxy-middleware because it works by mocking the http request method which is called early in the proxy lifecycle. If we use the onProxyReq method to alter the method at a later time (but still before the request is sent) nock will still be waiting for the original method as it will already have bootstrapped it's interceptor by now
    app.use((req, _, next) => {
      req.method = "POST";
      next();
    });
    app.use(
      createProxyMiddleware({
        target: "http://localhost:6666",
        on: {
          proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader("x-foo", "bar");
            proxyReq.end();
          },
        },
      })
    );

    const scope = nock("http://localhost:6666");
    scope.post("/").reply(200, { data: "Hello World" });
    scope.on("request", (req, interceptor, body) => {
      console.log({
        url: req.url,
        method: req.method,
        body,
      });
    });

    await request(app)
      .get("/")
      .expect(200)
      .then((response: any) => {
        expect(response.body).toEqual({ data: "Hello World" });
      });
  });

  it("should fake a response to an endpoint when the method is changed, using type extension and 'method' param", async () => {
    const app = express();
    app.use(
      createProxyMiddleware({
        target: "http://localhost:6666",
        method: "POST",
        on: {
          proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader("x-foo", "bar");
            proxyReq.end();
          },
        },
      })
    );

    const scope = nock("http://localhost:6666");
    scope.post("/").reply(200, { data: "Hello World" });
    scope.on("request", (req, interceptor, body) => {
      console.log({
        url: req.url,
        method: req.method,
        body,
      });
    });

    await request(app)
      .get("/")
      .expect(200)
      .then((response: any) => {
        expect(response.body).toEqual({ data: "Hello World" });
      });
  });
});
