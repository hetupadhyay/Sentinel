// frontend/.eslintrc.cjs
// Sentinel — ESLint configuration (ESLint-standard for JS/JSX)

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",       // Enables new JSX transform (no import React needed)
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "18.3",
    },
  },
  plugins: ["react-refresh"],
  rules: {
    // Warn on components that can't be fast-refreshed
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    // Allow unused vars prefixed with _ (intentional ignores)
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // Enforce consistent spacing and formatting
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "react/prop-types": "off",         // Skipped — using JSDoc/Zod for type safety instead
  },
};
