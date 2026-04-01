import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 40px rgba(8, 10, 20, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
