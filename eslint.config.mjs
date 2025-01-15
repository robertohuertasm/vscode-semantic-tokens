import tsPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["out", "dist", "**/*.d.ts"], // Replaces ignorePatterns
  },
  {
    files: ["**/*.{js,ts}"], // Apply to JavaScript and TypeScript files
    languageOptions: {
      parser: typescriptParser, // Specify the parser
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
];
