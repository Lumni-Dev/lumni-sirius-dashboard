import type { Config } from "tailwindcss";

// Paleta "ink" da Lumni (mesma da landing lumni-nipuz-landing): tema escuro,
// accent branco, bordas de 1px, cantos de 6-10px, Inter (UI) + Orbitron (marca).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#141414",
        surface: "#1e1e1e",
        elevated: "#2a2a2a",
        panel: "#1e1e1e",
        black: "#000000",
        border: "#272727",
        "border-strong": "#333333",
        "border-hi": "#3f3f3f",
        text: "#f2f2f2",
        muted: "#a6a6a6",
        faint: "#737373",
        accent: "#ffffff",
        "accent-soft": "#ffffff",
        "on-accent": "#000000",
        good: "#34c76c",
        warn: "#d9a441",
        danger: "#ef5350",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "10px",
        xl: "10px",
        "2xl": "10px",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        brand: ["Orbitron", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
