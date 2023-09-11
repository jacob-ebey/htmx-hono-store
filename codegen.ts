import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://mock.shop/api",
  documents: "app/**/*",
  generates: {
    "app/apis/shop-types.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        // "typescript-graphql-request",
      ],
      config: {
        rawRequest: true,
      },
    },
  },
};

export default config;
