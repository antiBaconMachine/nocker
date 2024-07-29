import nock from "nock";
import axios from "axios";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import request from "supertest";

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

  it("should fake a response to an endpoint when the method is changed", async () => {
    const scope = nock("http://localhost:6666");
    scope.post("/").reply(200, { data: "Hello World" });
    scope.on("request", (req, interceptor, body) => {
      console.log({
        url: req.url,
        method: req.method,
        body,
        headers: req.headers,
      });
    });

    const app = express();
    app.use(
      createProxyMiddleware({
        target: "http://localhost:6666",
        on: {
          proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader("x-foo", "bar");
            proxyReq.method = "POST";
            proxyReq.end();
          },
          error: (err, req, res) => {
            console.log("ERROR", err);
          },
        },
      })
    );

    await request(app)
      .get("/")
      .expect(200)
      .then((response: any) => {
        expect(response.body).toEqual({ data: "Hello World" });
      });
  });
});
