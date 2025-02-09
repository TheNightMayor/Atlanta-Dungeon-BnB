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
        primary: "#4338ca",
        secondary: "#ca8a04",
        tertiary: {
          dark: '#4338ca',
          light: '#4338ca',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        exo: ['var(--font-exo)', ...fontFamily.sans], orbitron: ['var(--font-orbitron)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
