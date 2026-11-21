/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./app/globals.css",
  tailwindFunctions: ["cn"],
  printWidth: 90,
  trailingComma: "all",
  arrowParens: "always",
};

export default config;
