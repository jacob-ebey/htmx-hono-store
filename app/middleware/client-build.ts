import * as path from "node:path";
import { type MiddlewareHandler } from "hono";

let buildResult: Awaited<ReturnType<typeof Bun.build>>;
export const clientBuildMiddleware: MiddlewareHandler = async (c, next) => {
  if (!buildResult || Bun.env.DEV) {
    buildResult = await Bun.build({
      entrypoints: ["app/entry.client.ts", "static/tailwind.css"],
      target: "browser",
      format: "esm",
      splitting: false,
      minify: true,
      sourcemap: "external",
      outdir: "static/build",
      naming: {
        entry: "[name].[hash].js",
        chunk: "[name].[hash].js",
        asset: "[name].[hash].[ext]",
      },
    });
  }

  if (buildResult.success) {
    c.set(
      "entry.client",
      "/" + path.relative(process.cwd(), buildResult.outputs[0].path)
    );
    c.set(
      "tailwind.css",
      "/" +
        path.relative(
          process.cwd(),
          buildResult.outputs[buildResult.outputs.length - 1].path
        )
    );
  }

  return next();
};
