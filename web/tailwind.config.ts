import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obscura: {
          dark: "#0A0E1A",
          surface: "#131826",
          "surface-variant": "#1C2333",
          primary: "#6C5CE7",
          secondary: "#00CEC9",
          "on-surface": "#E2E8F0",
          "on-surface-variant": "#94A3B8",
          error: "#EF4444",
          success: "#22C55E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
