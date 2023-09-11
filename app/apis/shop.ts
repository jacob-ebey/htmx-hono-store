import {
  request as gqlRequest,
  gql,
  type RequestDocument,
  type Variables,
} from "graphql-request";

import { SHOP_URL } from "../config";

import {
  CountryCode,
  LanguageCode,
  type GetCartQuery,
  type GetCartQueryVariables,
} from "./shop-types";

export * from "./shop-types";

type Vars<V> = V extends Variables
  ? {
      [K in keyof V]: V[K] extends Record<"input", infer I> ? I : V[K];
    }
  : never;

export function request<T, V extends Variables>(
  document: RequestDocument,
  variables: Vars<V>
) {
  return gqlRequest<T>(SHOP_URL, document, variables);
}

export async function getCart(id?: string) {
  if (!id) return undefined;

  const response = await request<GetCartQuery, GetCartQueryVariables>(
    gql`
      query GetCart($id: ID!, $country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
        cart(id: $id) {
          checkoutUrl
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 250) {
            nodes {
              id
              quantity
              cost {
                subtotalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                  }
                  product {
                    title
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      id,
      country: CountryCode.Us,
      language: LanguageCode.En,
    }
  );

  return response.cart;
}
