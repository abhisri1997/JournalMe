import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    root: "./packages/frontend",
    test: {
      environment: "jsdom",
      globals: true,
      // Use explicit repo-relative path so workspace runner can find it reliably
      setupFiles: ["./packages/frontend/src/setupTests.ts"],
    },
  },
  {
    root: "./packages/backend",
    test: {
      environment: "node",
      globals: true,
      include: ["src/**/__tests__/**/*.ts"],
    },
  },
]);
