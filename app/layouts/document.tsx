import { type getCart } from "../apis/shop";

export function Document({
  title,
  description,
  cart,
  clientEntry,
  tailwindCSS,
  returnTo,
  children,
}: {
  title: string;
  description: string;
  cart?: Awaited<ReturnType<typeof getCart>>;
  clientEntry?: string;
  tailwindCSS?: string;
  returnTo: string;
  children?: string | string[];
}) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>{title}</title>
        <meta name="description" content={description} />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/static/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/favicon-16x16.png"
        />
        <link rel="icon" type="image/icon" href="/static/favicon.ico" />
        <link rel="manifest" href="/static/site.webmanifest" />

        <link rel="stylesheet" href={tailwindCSS || "/static/tailwind.css"} />

        <meta
          name="htmx-config"
          content='{"defaultFocusScroll": true, "globalViewTransitions": true}'
        />

        {!!clientEntry && <script src={clientEntry} />}
        <script src="/static/hyperscript.0.9.11.js" />
      </head>

      <body
        hx-ext="loading-states,favloader"
        hx-boost="true"
        hx-sync="this:replace"
        class="md:h-screen md:flex md:flex-col"
      >
        <nav class="bg-white p-4 shadow-md z-10">
          <div class="container mx-auto">
            <nav class="flex justify-between items-center">
              <a href="/" class="text-2xl font-bold text-gray-800">
                Minimal Shop
              </a>
              <ul class="flex space-x-4">
                <li>
                  <a href="/" class="text-gray-600 hover:text-gray-800">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/products" class="text-gray-600 hover:text-gray-800">
                    Products
                  </a>
                </li>
                <li>
                  <Cart cart={cart} returnTo={returnTo} />
                </li>
              </ul>
            </nav>
          </div>
        </nav>

        <div
          data-loading-class="flex"
          data-loading-class-remove="hidden"
          role="status"
          class="hidden fixed justify-center top-0 right-0 left-0 p-4"
        >
          <svg
            aria-hidden="true"
            class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>

        {children}
      </body>
    </html>
  );
}

export function Cart({
  cart,
  oob,
  open,
  returnTo,
}: {
  cart: Awaited<ReturnType<typeof getCart>>;
  oob?: boolean;
  open?: boolean;
  returnTo: string;
}) {
  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <div id="cart" hx-swap-oob={oob}>
        <span>
          <span class="sr-only">Shopping Cart</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokewidth={1.5}
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </span>
      </div>
    );
  }
  return (
    <div id="cart" hx-swap-oob={oob}>
      <script
        type="text/hyperscript"
        dangerouslySetInnerHTML={{
          __html: `
            def openCart()
              set open of #cart-dialog to true
              set x to first <input, button, a/> in #cart-dialog
              call x.focus()
            end

            def closeCart()
              set x to #close-cart-dialog
              x.submit()
            end
        `,
        }}
      />
      <a
        id="cart-dialog-button"
        hx-boost="false"
        role="button"
        href={cart.checkoutUrl}
        class="relative"
        _="
          on click
            halt the event
            call openCart()
          end"
      >
        <span class="sr-only">Shopping Cart</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokewidth={1.5}
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        <span class="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-200 flex justify-center items-center items">
          <span class="text-xs">
            {cart.lines.nodes.reduce((count, line) => {
              return count + line.quantity;
            }, 0)}
          </span>
        </span>
      </a>
      <dialog
        id="cart-dialog"
        class="fixed top-0 left-0 right-0 bottom-0 z-20 bg-transparent overflow-hidden"
        open={open}
        _="
          on keydown
            if event.key == 'Tab'
              halt the event
              if event.shiftKey
                set x to previous <input, button, a/> from document.activeElement within #cart-dialog
                if not x
                  set x to last <input, button, a/> in #cart-dialog
                end
              else
                set x to next <input, button, a/> from document.activeElement within #cart-dialog
                if not x
                  set x to first <input, button, a/> in #cart-dialog
                end
              end
              if x
                call x.focus()
              end
            end
          end
        "
      >
        <form
          id="close-cart-dialog"
          hx-boost="false"
          method="dialog"
          class="hidden"
          _="
            on submit
              set x to #cart-dialog-button
              call x.focus()
            end
          "
        />
        <div
          class="w-screen h-screen bg-[rgba(0,0,0,0.3)] flex justify-center items-center"
          _="on click closeCart()"
        >
          <div class="w-full max-h-screen flex items-center justify-center">
            <div
              class="bg-white container p-4 max-h-screen overflow-y-auto"
              _="on click event.stopPropagation()"
            >
              <header class="flex justify-between items-center mb-4 bg-white">
                <button
                  type="submit"
                  form="close-cart-dialog"
                  class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
                >
                  Close
                </button>
                <a
                  class="text-center w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-lg transition duration-300"
                  href={cart.checkoutUrl}
                >
                  Checkout
                </a>
              </header>
              <main>
                <h2 class="text-2xl font-semibold mb-4">Shopping Cart</h2>
                <ul class="space-y-4">
                  {cart.lines.nodes.map((line) => (
                    <li class="flex gap-4">
                      <img
                        class="w-24 h-24 object-cover"
                        src={line.merchandise.image?.url + "&width=96"}
                      />
                      <form
                        action={`/cart?intent=update`}
                        method="post"
                        hx-post={`/cart?intent=update`}
                        data-loading-target={`.cart-line-update-loading`}
                      >
                        <input type="hidden" name="lineId" value={line.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />

                        <p>{line.merchandise.product.title}</p>
                        <p>{line.merchandise.title}</p>
                        <p>
                          <button
                            class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 rounded-full text-lg transition duration-300"
                            name="quantity"
                            value={line.quantity - 1}
                            disabled={line.quantity < 0}
                            _="
                              on click
                                set x to next .quantity from me
                                decrement x.innerHTML by 1
                                then put x.innerHTML into me.value
                                set me.disabled to x.innerHTML < 0
                                if x.innerHTML < 0
                                  set x.innerHTML to 0
                                end
                              end
                            "
                          >
                            -
                          </button>
                          <span class="quantity">{line.quantity}</span>
                          <button
                            class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-2 rounded-full text-lg transition duration-300"
                            name="quantity"
                            value={line.quantity + 1}
                            _="
                              on click
                                set x to previous .quantity from me
                                increment x.innerHTML by 1
                                then put x.innerHTML into me.value
                              end
                            "
                          >
                            +
                          </button>
                        </p>
                        <p
                          class="cart-line-update-loading"
                          data-loading-class="animate-pulse text-gray-400"
                        >
                          {line.cost.subtotalAmount.amount}{" "}
                          {line.cost.subtotalAmount.currencyCode}
                        </p>
                      </form>
                    </li>
                  ))}
                </ul>
                <div class="flex justify-between items-center mt-4 bg-white p-4 rounded-lg shadow-md">
                  <span class="text-xl font-semibold">SubTotal:</span>
                  <span
                    class="cart-line-update-loading text-xl font-semibold"
                    data-loading-class="animate-pulse text-gray-400"
                  >
                    {cart.cost.subtotalAmount.amount}{" "}
                    {cart.cost.subtotalAmount.currencyCode}
                  </span>
                </div>
                <div class="flex justify-between items-center mt-4 bg-white p-4 rounded-lg shadow-md">
                  <span class="text-xl font-semibold">Total:</span>
                  <span
                    class="cart-line-update-loading text-xl font-semibold"
                    data-loading-class="animate-pulse text-gray-400"
                  >
                    {cart.cost.totalAmount.amount}{" "}
                    {cart.cost.totalAmount.currencyCode}
                  </span>
                </div>
              </main>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
