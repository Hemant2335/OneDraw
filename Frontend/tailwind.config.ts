import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./Components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#EA4B8B",
      },
      boxShadow : {
        "3xl" : "box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px"
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
} satisfies Config;
