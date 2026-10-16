

import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
        },
      },
    },
  },
  plugins: [],
};
export default config;