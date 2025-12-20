import { defineConfig } from "vitest/config";

export default defineConfig({
  root: ".",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/__tests__/**/*.ts?(x)",
    ],
  },
});
