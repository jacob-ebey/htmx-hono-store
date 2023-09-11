import { Context } from "hono";
import { gql } from "graphql-request";

import {
  type UpdateLineItemMutation,
  type UpdateLineItemMutationVariables,
  CountryCode,
  LanguageCode,
  getCart,
  request,
} from "../apis/shop";
import { Cart } from "../layouts/document";

export async function Post(c: Context) {
  const url = new URL(c.req.url);
  const intent = url.searchParams.get("intent");
  switch (intent) {
    case "update": {
      const formData = await c.req.formData();
      const lineId = String(formData.get("lineId"));
      const quantity = Number.parseInt(String(formData.get("quantity")));
      const returnTo = String(formData.get("returnTo"));
      const cart = c.get("cart");

      if (!lineId || !Number.isSafeInteger(quantity) || !returnTo) {
        throw new Error("Invalid Request");
      }

      if (!cart) {
        throw new Error("No Cart");
      }

      await updateLineItem(cart, lineId, quantity);

      if (
        c.req.headers.get("Hx-Request") === "true" &&
        !c.req.headers.get("HX-Boosted")
      ) {
        return c.html(
          <Cart oob open cart={await getCart(cart)} returnTo={c.req.url} />
        );
      }

      return c.redirect(returnTo);
    }
    default:
      throw new Error("Invalid Intent");
  }
}

async function updateLineItem(
  cartId: string,
  lineId: string,
  quantity: number
) {
  await request<UpdateLineItemMutation, UpdateLineItemMutationVariables>(
    gql`
      mutation UpdateLineItem(
        $cartId: ID!
        $lineId: ID!
        $quantity: Int!
        $country: CountryCode
        $language: LanguageCode
      ) @inContext(country: $country, language: $language) {
        cartLinesUpdate(
          cartId: $cartId
          lines: [{ id: $lineId, quantity: $quantity }]
        ) {
          cart {
            id
          }
        }
      }
    `,
    {
      cartId,
      lineId,
      quantity,
      country: CountryCode.Us,
      language: LanguageCode.En,
    }
  );
}
