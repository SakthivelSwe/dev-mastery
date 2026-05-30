import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        surface:    "var(--bg-surface)",
        elevated:   "var(--bg-elevated)",
        border: {
          DEFAULT: "var(--border-default)",
          muted:   "var(--border-muted)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body:    ["var(--font-body)",    "sans-serif"],
        mono:    ["var(--font-code)",    "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
