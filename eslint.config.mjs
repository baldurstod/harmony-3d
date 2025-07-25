import tseslint from "typescript-eslint";


export default tseslint.config(
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylistic,
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/prefer-readonly-parameter-types": "error",
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
