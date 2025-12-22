module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // Point eslint to the package tsconfigs instead of a non-existent root file
    tsconfigRootDir: __dirname,
    project: [
      "./packages/frontend/tsconfig.json",
      "./packages/frontend/tsconfig.eslint.json",
      "./packages/backend/tsconfig.json",
      "./packages/backend/tsconfig.eslint.json",
    ],
    sourceType: "module",
  },
  ignorePatterns: [".eslintrc.cjs", "docker-compose.yml", "*.config.*"],
  plugins: ["@typescript-eslint", "jsx-a11y"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],
  env: { node: true, es6: true, jest: true, browser: true },
  rules: {},
};
