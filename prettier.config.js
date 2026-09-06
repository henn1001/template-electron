// Prettier is the single source of truth for formatting.
// eslint-config-prettier (see eslint.config.js) disables all ESLint rules
// that would conflict with it, so `npm run format` and editor
// format-on-save always produce the same result.

/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  printWidth: 120,
};
