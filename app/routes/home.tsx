import { Context } from "hono";

import { getCart } from "../apis/shop";
import { Document } from "../layouts/document";

export async function Get(c: Context) {
  const cart = await getCart(c.get("cart"));

  return c.html(
    <Document
      title="DA Store"
      description="A minimalistic storefront built with Hono and HTMX."
      cart={cart}
      clientEntry={c.get("entry.client")}
      tailwindCSS={c.get("tailwind.css")}
      returnTo={c.req.url}
    >
      <section class="bg-gray-200 py-16">
        <div class="container mx-auto text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">
            Hono HTMX Storefront
          </h1>
          <p class="text-gray-600 text-lg mb-8">
            A minimalistic storefront built with Hono and HTMX.
          </p>
          <a
            href="/products"
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
          >
            Shop Now
          </a>
          &nbsp;
          <a
            href="https://github.com/jacob-ebey/htmx-hono-store"
            class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </a>
        </div>
      </section>
    </Document>
  );
}
