import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: false,
  treeshake: true,
  clean: true,
  format: "esm",
});
