// @ts-expect-error
import favloader from "favloader";

(function () {
  favloader.init();
  htmx.defineExtension("favloader", {
    onEvent: function (name, evt) {
      switch (name) {
        case "htmx:beforeRequest":
          favloader.start();
          break;
        case "htmx:beforeOnLoad":
          favloader.stop();
          break;
      }
    },
  });
})();
