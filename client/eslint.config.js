// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import pluginReact from "eslint-plugin-react";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ["dist", "node_modules", "coverage", "storybook-static"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
];
