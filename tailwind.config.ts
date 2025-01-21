import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#038c7f",
        secondary: "#f2c641",
        tertiary: {
          dark: '#f27405',
          light: '#f2c641',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        exo: ['var(--font-exo)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
