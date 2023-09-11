// import "htmx.org";
// import "hyperscript.org";

declare global {
  var htmx: typeof import("htmx.org");
  interface Window {
    htmx: typeof import("htmx.org");
  }
}

// window.htmx = require("htmx.org").default;

// require("htmx.org/dist/ext/loading-states");
// require("./extensions/favloader");

import("htmx.org").then(async ({ default: htmx }) => {
  window.htmx = htmx;
  const [] = await Promise.all([
    // @ts-expect-error
    import("htmx.org/dist/ext/loading-states"),
    import("./extensions/favloader"),
  ]);
});
