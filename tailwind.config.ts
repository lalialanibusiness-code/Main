import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        parchment: "#F5F0E8",
        cream: "#EDE7D9",
        card: "#FAF7F2",
        tan: "#C4A882",
        espresso: "#1A1008",
        brown: {
          mid: "#3D2B1A",
          light: "#6B4C32",
        },
      },
    },
  },
  plugins: [],
};

export default config;
