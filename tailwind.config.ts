import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0a0a12",
        surface: "#12121d",
        elevated: "#1a1a28",
        border: "#262635",
        muted: "#8a8aa0",
        faint: "#5a5a70",
        text: "#e8e8f2",
        accent: "#7c6cff",
        "accent-soft": "#a89bff",
        good: "#3ecf8e",
        warn: "#f5a623",
        danger: "#ff5c5c",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
