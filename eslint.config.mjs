import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsxA11Y from "eslint-plugin-jsx-a11y";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  {
    // This ignores configuration should be in a separate object
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/drizzle/**",
      "**/public/**",
    ],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
  ),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["next.config.mjs", "postcss.config.js", "tailwind.config.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "jsx-a11y": jsxA11Y,
    },
    settings: {
      next: {
        rootDir: ".",
      },
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: typescriptEslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
];

export default eslintConfig;
