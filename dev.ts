Bun.env.DEV = "true";
Bun.env.PORT = "3000";

Bun.spawn(["bun", "tailwind"], {
  stdout: "inherit",
});

await import("./server");
