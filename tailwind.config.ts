import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",

    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/onborda/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-roboto-mono)"],
        montserrat: ["var(--font-montserrat)"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        verisense: "#ff847c",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {},
        },
      },
    }),
    typography(),
  ],
} satisfies Config;
