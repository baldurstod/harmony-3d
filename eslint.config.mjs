import tseslint from "typescript-eslint";


export default tseslint.config(
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylistic,
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-floating-promises": ["error", {
        // No Promise in harmony-3d rejects
        "allowForKnownSafePromises": [{ "from": "file", "name": "Promise" }]
      }],
    }
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
