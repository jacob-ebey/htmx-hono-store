import { Context } from "hono";

import { getCart } from "../apis/shop";
import { Document } from "../layouts/document";

export async function Get(c: Context) {
  const cart = await getCart(c.get("cart"));

  return c.html(
    <Document
      title="Not Found"
      description="A minimalistic storefront built with Hono and HTMX."
      cart={cart}
      clientEntry={c.get("entry.client")}
      tailwindCSS={c.get("tailwind.css")}
      returnTo={c.req.url}
    >
      <h1>404 Not Found</h1>
      <p>
        <a href="/">Home</a>
      </p>
    </Document>,
    404
  );
}
