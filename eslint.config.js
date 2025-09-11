// eslint.config.ts

import { defineConfig } from "eslint/config";

// ESLint base JS rules
import js from "@eslint/js";

// TypeScript parser and plugin
import tsParser from "@typescript-eslint/parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";

// React plugins
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// Prettier for code formatting (disables conflicting ESLint rules)
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    // Directories and files to ignore during linting
    ignores: ["node_modules/", "dist/", "build/"],

    // Language and parser configuration
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"], // for full type-aware linting
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        document: true,
        HTMLElement: true,
        window: true,
        localStorage: true,
        sessionStorage: true,
        console: true,
        setTimeout: true,
        fetch: true,
        clearTimeout: true,
        clearInterval: true,
        setInterval: true,
        Blob: true,
        URL: true,
        File: true,
        FileReader: true,
        FormData: true,
        Request: true,
        Response: true,
        Headers: true,
        navigator: true,
        location: true,
        getComputedStyle: true,
        requestAnimationFrame: true,
        __dirname: true,
      },
    },

    // Auto-detect React version
    settings: {
      react: {
        version: "detect",
      },
    },

    // Apply these rules only to TypeScript React files
    files: ["**/*.{ts,tsx}", "vite.config.ts"],

    // Plugin definitions
    plugins: {
      "@typescript-eslint": tseslint,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },

    // ESLint rules
    rules: {
      // Base ESLint recommended rules
      ...js.configs.recommended.rules,

      // React-specific recommended rules
      ...react.configs.recommended.rules,

      // React Hooks recommended rules
      ...reactHooks.configs.recommended.rules,

      // TypeScript ESLint recommended rules
      ...tseslint.configs.recommended.rules,

      // Prettier: disables formatting rules that might conflict
      ...prettier.rules,

      ...jsxA11y.configs.recommended.rules,

      // Enforce use of `const` where possible
      "prefer-const": "error",

      // Enforce semicolons
      semi: ["error", "always"],

      // Enforce double quotes
      quotes: ["error", "double"],

      // Disable old JS rule, prefer TS version
      "no-unused-vars": "off",

      // Warn on unused variables (ignore if name starts with _)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Disable JSX React import rule (not needed in React 17+)
      "react/react-in-jsx-scope": "off",

      // Disable props of the component as read-only
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/prefer-readonly": "off",

      // Disabled props type
      "react/prop-types": "off",
    },
  },
]);
