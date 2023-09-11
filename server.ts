import { Hono } from "hono";
import { serveStatic } from "hono/bun";

import { cartMiddleware } from "./app/middleware/cart";
import { clientBuildMiddleware } from "./app/middleware/client-build";

import * as Cart from "./app/routes/cart";
import * as Home from "./app/routes/home";
import * as NotFound from "./app/routes/not-found";
import * as Product from "./app/routes/product";
import * as Products from "./app/routes/products";

const app = new Hono();
app.get(
  "/static/*",
  async (c, next) => {
    await next();
    if (c.res.status === 200) {
      c.res.headers.set("Cache-Control", "public, max-age=31536000");
    }
  },
  serveStatic()
);
app.use("*", clientBuildMiddleware, cartMiddleware);
app.get("/", Home.Get);
app.get("/products", Products.Get);
app.post("/product/:handle", Product.Post);
app.get("/product/:handle", Product.Get);
app.post("/cart", Cart.Post);
app.get("*", NotFound.Get);

const development = !!Bun.env.DEV;
let port = Bun.env.PORT ? parseInt(Bun.env.PORT, 10) : undefined;

if (typeof port !== "number") {
  throw new Error("No PORT environment variable found.");
}

export const server = Bun.serve({
  development,
  port,
  fetch: app.fetch,
});

console.log(`Server running at http://${server.hostname}:${server.port}`);
