module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: "@typescript-eslint/parser",
  },
  plugins: [
    'vue',
    "@typescript-eslint"
  ],
  rules: {
    "@typescript-eslint/ban-types":"off",
    "@typescript-eslint/no-explicit-any":"off"
  }
}
