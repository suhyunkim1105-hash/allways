import type { Config } from "tailwindcss";
// AllWays design tokens — 8/11 meeting palette. Change values HERE only.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0046FF",
        accent: "#FF8040",       // decoration only; black text on top; never as text color
        canvas: "#F0F2F5",
        surface: "#FFFFFF",
        ink: "#1F2328",
        muted: "#5B6470",
        line: "#E3E6EA",
        "verdict-green": "#15803d",
        "verdict-yellow": "#facc15", // background chips only
        "verdict-red": "#c62828",
        "verdict-none": "#8A97A8",
      },
      fontFamily: { aphont: ["APHont", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
