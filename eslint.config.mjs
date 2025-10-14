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

      "@typescript-eslint/no-explicit-any": "off",// Disable that for now
      "@typescript-eslint/no-unsafe-member-access": "off",// Disable that for now
      "@typescript-eslint/no-unsafe-assignment": "off",// Disable that for now
      "@typescript-eslint/no-unsafe-argument": "off",// Disable that for now
      "@typescript-eslint/no-unsafe-return": "off",// Disable that for now
      "@typescript-eslint/no-redundant-type-constituents": "off",// Disable that for now
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
