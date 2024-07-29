import nock from "nock";
import axios from "axios";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import request from "supertest";

describe("Index", () => {
  // it("should fake a response to a simple proxied endpoint", async () => {
  //   nock("http://localhost:6666").post("/").reply(200, { data: "Hello World" });

  //   const app = express();
  //   app.use(createProxyMiddleware({ target: "http://localhost:6666" }));
  //   const server = app.listen(9234, async () => {
  //     try {
  //       await axios.post("http://localhost:9234/").then((response) => {
  //         expect(response.data).toEqual({ data: "Hello World" });
  //       });
  //     } finally {
  //       return new Promise<void>((resolve) => {
  //         server.close(() => {
  //           resolve();
  //         });
  //       });
  //     }
  //   });
  // });

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

  // it("should fake a response to an endpoint when the method is changed", async () => {
  //   const scope = nock("http://localhost:6666");
  //   scope.post("/").reply(200, { data: "Hello World" });
  //   scope.on("request", (req, interceptor, body) => {
  //     console.log({
  //       url: req.url,
  //       method: req.method,
  //       body,
  //     });
  //   });
  //   const app = express();
  //   app.use(
  //     createProxyMiddleware({
  //       target: "http://localhost:6666",
  //       selfHandleResponse: true,
  //       on: {
  //         proxyReq: (proxyReq, req, res) => {
  //           console.log(proxyReq.method);
  //           proxyReq.setHeader("x-foo", "bar");
  //           proxyReq.method = "POST";
  //           console.log(proxyReq.method);
  //           // proxyReq.end();
  //         },
  //         proxyRes: (proxyRes, req, res) => {
  //           res.send({ data: "XXXXX World" });
  //         },
  //         error: (err, req, res) => {
  //           console.error("NOOOOOOOO", err.message);
  //         },
  //       },
  //     })
  //   );
  //   const server = app.listen(9235, async () => {
  //     try {
  //       await axios.get("http://localhost:9235/").then((response) => {
  //         expect(response.data).toEqual({ data: "XXXXX World" });
  //       });
  //     } finally {
  //       return new Promise(async (resolve) => {
  //         server.close(() => {
  //           resolve();
  //         });
  //       });
  //     }
  //   });
  // });

  // it.skip("should fake a response to an endpoint when the method is changed", async () => {
  //   const fakeTarget = express();
  //   fakeTarget.all("*", (req, res) => {
  //     console.log({ method: req.method });
  //     res.send({ data: "Hello World" });
  //   });
  //   const proxyTargetReady = new Promise<void>((resolve) => {
  //     const targetServer = fakeTarget.listen(9099, resolve);
  //   });

  //   const fakeApp = express();
  //   fakeApp.use(createProxyMiddleware({ target: "http://localhost:9099" }));
  //   const appReady = new Promise<void>((resolve) => {
  //     const targetServer = fakeTarget.listen(5555, resolve);
  //   });

  //   await Promise.all([proxyTargetReady, appReady]);

  //   const response = await axios.get("http://localhost:5555/");
  //   console.log(response.data);

  //   await new Promise((resolve) => {
  //     fakeTarget.close(() => {
  //       resolve();
  //     });
  //   });
  // });
});
