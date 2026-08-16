import path from "node:path";
import { defineConfig } from "vitest/config";

// jsdom is the single environment for the whole suite (not split per-file
// node/jsdom) - the suite is small enough that the overhead doesn't matter,
// and it lets pure-function unit tests and store/hook integration tests
// share one config with no per-file environment pragmas.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
  },
  resolve: {
    alias: {
      // Mirrors tsconfig.json's "@/*" path so tests can import the same way
      // application code does.
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
