import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: false,
  treeshake: true,
  clean: true,
  dts: true,
  format: ["esm", "cjs"],
});
