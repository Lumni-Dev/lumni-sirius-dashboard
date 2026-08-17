import type { Config } from "tailwindcss";

// Tokens do lumni-sirius-app (tokens.css): fundo quase-preto, bordas hairline
// translucidas, accent branco (sem cor de destaque), danger/warn; radius 10/8/6;
// Space Grotesk (UI) + Orbitron (logo). Sem verde.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#050507",
        elevated: "rgba(255, 255, 255, 0.05)",
        surface: "rgba(17, 17, 17, 0.72)",
        fill: "rgba(255, 255, 255, 0.04)",
        "fill-strong": "rgba(255, 255, 255, 0.07)",
        border: "rgba(255, 255, 255, 0.06)",
        "border-strong": "rgba(255, 255, 255, 0.14)",
        text: "#f0f1f5",
        muted: "#8a8b96",
        faint: "#5c5d68",
        accent: "#ffffff",
        "accent-soft": "#ffffff",
        "on-accent": "#050507",
        danger: "#ff003c",
        warn: "#ffb020",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "10px",
        "2xl": "10px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Space Grotesk", "Segoe UI", "system-ui", "sans-serif"],
        brand: ["var(--font-brand)", "Orbitron", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
