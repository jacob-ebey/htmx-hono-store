import { type MiddlewareHandler } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";

import { SESSION_SECRET } from "../config";

export const cartMiddleware: MiddlewareHandler = async (c, next) => {
  const cart = await getSignedCookie(c, SESSION_SECRET, "cart");

  c.set("cart", cart);
  await next();

  const newCart = c.get("cart");
  if (cart !== newCart) {
    await setSignedCookie(c, "cart", newCart, SESSION_SECRET, {
      httpOnly: true,
      path: "/",
      secure: c.req.url.startsWith("https://"),
    });
  }
};
