import { gql } from "graphql-request";
import { Context } from "hono";

import {
  type AddToCartMutation,
  type AddToCartMutationVariables,
  type CreateCartMutation,
  type CreateCartMutationVariables,
  type ProductQuery,
  type ProductQueryVariables,
  type SelectedVariantQuery,
  type SelectedVariantQueryVariables,
  CountryCode,
  LanguageCode,
  request,
  getCart,
} from "../apis/shop";
import { Document, Cart } from "../layouts/document";
import * as NotFound from "./not-found";
import { URLSearchParams } from "url";

export async function Post(c: Context) {
  const formData = await c.req.formData();
  const variant = await getSelectedVariant(
    c.req.param("handle"),
    getSelectedOptions(formData)
  );

  if (variant) {
    let cartId = c.get("cart");
    if (!cartId) {
      cartId = await createCart(variant.id, 1);
    } else {
      cartId = await addToCart(cartId, variant.id, 1);
    }
    c.set("cart", cartId);
    c.set("modifiedCart", true);
  }

  return Get(c);
}

export async function Get(c: Context) {
  const url = new URL(c.req.url);

  const data = await getProduct(
    c.req.param("handle"),
    getSelectedOptions(url.searchParams)
  );

  const selectedVariant =
    data.product?.selectedVariant || data.product?.variants.nodes[0];

  if (!data.product || !selectedVariant) {
    return NotFound.Get(c);
  }

  if (
    c.req.headers.get("Hx-Request") === "true" &&
    !c.req.headers.get("HX-Boosted")
  ) {
    return c.html(
      <div>
        <ProductImages oob product={data.product} />
        <ProductSummary oob product={data.product} url={url} />
        {c.get("modifiedCart") && (
          <Cart oob cart={await getCart(c.get("cart"))} returnTo={c.req.url} />
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
      title={"DA " + data.product.title}
      description={data.product.description}
      cart={cart}
      clientEntry={c.get("entry.client")}
      tailwindCSS={c.get("tailwind.css")}
      returnTo={c.req.url}
    >
      <div class="flex-1 flex items-center">
        <main class="md:grid grid-cols-2">
          <ProductImages product={data.product} />
          <ProductSummary product={data.product} url={url} />
        </main>
      </div>
    </Document>
  );
}

function ProductImages({
  product,
  oob,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProduct>>["product"]>;
  oob?: boolean;
}) {
  const selectedVariant = product.selectedVariant || product.variants.nodes[0];

  const initialImage = selectedVariant.image?.url + "&width=767";
  const initialImageAlt = selectedVariant.image?.altText || "Product Image 1";
  const seenImages = new Set([initialImage]);

  return (
    <section
      id="product-images"
      class="w-full relative aspect-[8/10] flex overflow-x-auto snap-x snap-mandatory"
      tabindex="0"
      aria-label="Product Images"
      hx-swap-oob={oob}
    >
      <img
        class="snap-start w-full h-full object-cover"
        src={initialImage}
        alt={initialImageAlt}
      />
      {product.media.nodes.map((media, index) => {
        if (
          media.__typename !== "MediaImage" ||
          !media.image?.url ||
          seenImages.has(media.image.url + "&width=767")
        ) {
          return null;
        }
        const newImage = media.image.url + "&width=767";
        seenImages.add(newImage);

        return (
          <img
            tabindex="0"
            alt={media.alt || "Product Image " + seenImages.size}
            class="snap-start w-full h-full object-cover"
            src={newImage}
          />
        );
      })}
    </section>
  );
}

function ProductSummary({
  product,
  oob,
  url,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProduct>>["product"]>;
  oob?: boolean;
  url: URL;
}) {
  const selectedVariant = product.selectedVariant || product.variants.nodes[0];

  return (
    <section id="product-summary" class="p-4 md:p-8" hx-swap-oob={oob}>
      <h1 class="text-3xl font-bold text-gray-800 mb-8">{product.title}</h1>

      <p class="mb-8">
        <span class="text-gray-600 text-lg font-bold">
          {selectedVariant.price.amount} {selectedVariant.price.currencyCode}
        </span>
        &nbsp;
        {selectedVariant.compareAtPrice && (
          <span class="text-gray-400 text-lg line-through">
            {selectedVariant.compareAtPrice.amount}{" "}
            {selectedVariant.compareAtPrice.currencyCode}
          </span>
        )}
      </p>

      <div
        class="text-gray-600 text-lg mb-8"
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      />

      <form
        id="add-to-cart-form"
        method="POST"
        hx-get={`/product/${product.handle}`}
        hx-trigger="variantoptionchanged from:body"
        _="
          on htmx:afterSettle
            if event.detail.requestConfig.verb is 'post'
              call openCart()
            end

            set id to lastChangedInput of window
            get document.getElementById(id)
            if it
              call it.focus()
            end
          end
        "
      >
        <fieldset data-loading-disable>
          {product.options.map((option) => (
            <div class="mb-4">
              <label
                for={`product-option-${option.name}`}
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                {option.name}
              </label>
              <select
                id={`product-option-${option.name}`}
                name={option.name}
                class="product-variant-option shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline"
                _="
                  on change
                    send variantoptionchanged to body
                    set window.lastChangedInput to me.id
                  end
                "
              >
                {option.values.map((value) => (
                  <option
                    value={value}
                    selected={url.searchParams.get(option.name) === value}
                  >
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <p>
            <button
              id="add-to-cart-button"
              type="submit"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
              hx-post={url.pathname + url.search}
              data-loading-class="opacity-50 cursor-not-allowed"
              data-loading-path={url.pathname}
            >
              Add to Cart
            </button>
          </p>
        </fieldset>
      </form>
    </section>
  );
}

function getSelectedOptions(src: URLSearchParams | FormData) {
  const selectedOptions: {
    name: string;
    value: string;
  }[] = [];

  src.forEach((value, key) => {
    if (typeof value === "string") {
      selectedOptions.push({
        name: key,
        value,
      });
    }
  });

  return selectedOptions;
}

async function getSelectedVariant(
  handle: string,
  selectedOptions: SelectedVariantQueryVariables["selectedOptions"]
) {
  const response = await request<
    SelectedVariantQuery,
    SelectedVariantQueryVariables
  >(
    gql`
      query SelectedVariant(
        $country: CountryCode
        $language: LanguageCode
        $handle: String!
        $selectedOptions: [SelectedOptionInput!]!
      ) @inContext(country: $country, language: $language) {
        product(handle: $handle) {
          selectedVariant: variantBySelectedOptions(
            selectedOptions: $selectedOptions
          ) {
            id
          }
        }
      }
    `,
    {
      handle,
      selectedOptions,
      country: CountryCode.Us,
      language: LanguageCode.En,
    }
  );

  return response.product?.selectedVariant;
}

function getProduct(
  handle: string,
  selectedOptions: ProductQueryVariables["selectedOptions"]
) {
  return request<ProductQuery, ProductQueryVariables>(
    gql`
      query Product(
        $country: CountryCode
        $language: LanguageCode
        $handle: String!
        $selectedOptions: [SelectedOptionInput!]!
      ) @inContext(country: $country, language: $language) {
        product(handle: $handle) {
          id
          title
          vendor
          handle
          descriptionHtml
          description
          options {
            name
            values
          }
          selectedVariant: variantBySelectedOptions(
            selectedOptions: $selectedOptions
          ) {
            ...ProductVariantFragment
          }
          media(first: 7) {
            nodes {
              ...Media
            }
          }
          variants(first: 1) {
            nodes {
              ...ProductVariantFragment
            }
          }
          seo {
            description
            title
          }
        }
      }

      fragment ProductVariantFragment on ProductVariant {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        image {
          id
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
        sku
        title
        unitPrice {
          amount
          currencyCode
        }
        product {
          title
          handle
        }
      }

      fragment Media on Media {
        __typename
        mediaContentType
        alt
        previewImage {
          url
        }
        ... on MediaImage {
          id
          image {
            id
            url
            width
            height
          }
        }
        ... on Video {
          id
          sources {
            mimeType
            url
          }
        }
        ... on Model3d {
          id
          sources {
            mimeType
            url
          }
        }
        ... on ExternalVideo {
          id
          embedUrl
          host
        }
      }
    `,
    {
      handle,
      selectedOptions,
      country: CountryCode.Us,
      language: LanguageCode.En,
    }
  );
}

async function createCart(merchandiseId: string, quantity?: number) {
  const response = await request<
    CreateCartMutation,
    CreateCartMutationVariables
  >(
    gql`
      mutation CreateCart(
        $merchandiseId: ID!
        $quantity: Int
        $country: CountryCode
        $language: LanguageCode
      ) @inContext(country: $country, language: $language) {
        cartCreate(
          input: {
            lines: [{ merchandiseId: $merchandiseId, quantity: $quantity }]
          }
        ) {
          cart {
            id
          }
        }
      }
    `,
    {
      merchandiseId,
      quantity,
      country: CountryCode.Us,
      language: LanguageCode.En,
    }
  );

  const id = response.cartCreate?.cart?.id;

  if (!id) {
    throw new Error("Could not create cart");
  }

  return id;
}

async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity?: number
) {
  const response = await request<AddToCartMutation, AddToCartMutationVariables>(
    gql`
      mutation AddToCart(
        $cartId: ID!
        $merchandiseId: ID!
        $quantity: Int
        $country: CountryCode
        $language: LanguageCode
      ) @inContext(country: $country, language: $language) {
        cartLinesAdd(
          cartId: $cartId
          lines: [{ merchandiseId: $merchandiseId, quantity: $quantity }]
        ) {
          cart {
            id
          }
        }
      }
    `,
    {
      cartId,
      merchandiseId,
      quantity,
    }
  );

  const id = response.cartLinesAdd?.cart?.id;

  if (!id) {
    throw new Error("Could not add to cart");
  }

  return id;
}
