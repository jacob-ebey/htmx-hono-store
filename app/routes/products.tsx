import { gql } from "graphql-request";
import { Context } from "hono";

import { getPaginationCursor, getPaginationVariables } from "../pagination";
import {
  type AllProductsQuery,
  type AllProductsQueryVariables,
  CountryCode,
  LanguageCode,
  request,
  getCart,
} from "../apis/shop";
import { Document } from "../layouts/document";

export async function Get(c: Context) {
  const variables = getPaginationVariables(c.req, {
    pageBy: 8,
  });

  const products = await getProducts(variables);
  const cursor = getPaginationCursor(products.pageInfo);
  const url = new URL(c.req.url);
  const direction = url.searchParams.get("direction");

  // If we are loading next page, we want to append the products to the grid
  // and the buttons to the buttons container instead of replacing the whole
  // page.
  if (
    c.req.headers.get("Hx-Request") === "true" &&
    !c.req.headers.get("HX-Boosted")
  ) {
    return c.html(
      <div>
        {direction === "previous" && (
          <div
            hx-swap-oob="true"
            id="products-grid-previous-button"
            class="flex justify-between items-center mb-8"
          >
            {cursor.previous && (
              <a
                href={`/products${cursor.previous}`}
                class="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
                hx-get={`/products${cursor.previous}`}
              >
                Load Previous
              </a>
            )}
          </div>
        )}

        <div
          hx-swap-oob={
            direction === "previous"
              ? "afterbegin:#products-grid"
              : "beforeend:#products-grid"
          }
        >
          {products.nodes.map((product) => (
            <ProductCard
              handle={product.handle}
              title={product.title}
              description={
                product.variants.nodes[0].price.amount +
                " " +
                product.variants.nodes[0].price.currencyCode
              }
              image={product.variants.nodes[0].image?.url}
            />
          ))}
        </div>

        {direction !== "previous" && (
          <div
            hx-swap-oob="true"
            id="products-grid-next-button"
            class="flex justify-between items-center mt-8"
          >
            {cursor.next && (
              <a
                href={`/products${cursor.next}`}
                class="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
                hx-get={`/products${cursor.next}`}
              >
                Load More
              </a>
            )}
          </div>
        )}
      </div>,
      {
        headers: {
          "HX-Push": url.pathname + url.search,
        },
      }
    );
  }

  const cart = await getCart(c.get("cart"));

  return c.html(
    <Document
      title="DA Products"
      description="A minimalistic storefront built with Hono and HTMX."
      cart={cart}
      clientEntry={c.get("entry.client")}
      tailwindCSS={c.get("tailwind.css")}
      returnTo={c.req.url}
    >
      <section id="products" class="py-16">
        <div class="container mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-8">Our Products</h2>

          <div
            id="products-grid-previous-button"
            class="flex justify-between items-center mb-8"
          >
            {cursor.previous && (
              <a
                href={`/products${cursor.previous}`}
                class="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
                hx-get={`/products${cursor.previous}`}
              >
                Load Previous
              </a>
            )}
          </div>

          <div
            id="products-grid"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {products.nodes.map((product) => (
              <ProductCard
                handle={product.handle}
                title={product.title}
                description={
                  product.variants.nodes[0].price.amount +
                  " " +
                  product.variants.nodes[0].price.currencyCode
                }
                image={product.variants.nodes[0].image?.url}
              />
            ))}
          </div>

          <div
            id="products-grid-next-button"
            class="flex justify-between items-center mt-8"
          >
            {cursor.next && (
              <a
                href={`/products${cursor.next}`}
                class="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
                hx-get={`/products${cursor.next}`}
              >
                Load More
              </a>
            )}
          </div>
        </div>
      </section>
    </Document>
  );
}

function ProductCard({
  handle,
  title,
  description,
  image,
}: {
  handle: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <a
      href={`/product/${handle}`}
      class="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <img
        src={image + "&width=500"}
        alt={title + " picture"}
        class="w-full h-48 object-cover"
      />
      <div class="p-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p class="text-gray-600">{truncateDescription(description)}</p>
      </div>
    </a>
  );
}

function truncateDescription(description: string) {
  return description.length > 160
    ? description.substring(0, 160) + "..."
    : description;
}

async function getProducts(
  pagination: ReturnType<typeof getPaginationVariables>
) {
  const response = await request<AllProductsQuery, AllProductsQueryVariables>(
    gql`
      query AllProducts(
        $country: CountryCode
        $language: LanguageCode
        $first: Int
        $last: Int
        $startCursor: String
        $endCursor: String
      ) @inContext(country: $country, language: $language) {
        products(
          first: $first
          last: $last
          before: $startCursor
          after: $endCursor
        ) {
          nodes {
            ...ProductCard
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
      fragment ProductCard on Product {
        id
        title
        publishedAt
        handle
        vendor
        variants(first: 1) {
          nodes {
            id
            availableForSale
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            product {
              handle
              title
            }
          }
        }
      }
    `,
    {
      ...pagination,
      country: CountryCode.Us,
      language: LanguageCode.En,
    }
  );

  return response.products;
}
