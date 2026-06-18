import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/shared/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#0f172a",
        input: "#f8fafc",
        ring: "#e05a47",
        background: "#fcfbf9",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#e05a47",
          foreground: "#fffdfa",
        },
        secondary: {
          DEFAULT: "#ffc300",
          foreground: "#0f172a",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#ffc300",
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#d64545",
          foreground: "#fff5f5",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        panel: "6px 6px 0px 0px #0f172a",
        btn: "3px 3px 0px 0px #0f172a",
        card: "4px 4px 0px 0px #0f172a",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)"],
        serif: ["var(--font-newsreader)"],
        mono: ["var(--font-ibm-plex-mono)"],
      },
      backgroundImage: {
        "dashboard-grid":
          "linear-gradient(rgba(35, 87, 137, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(35, 87, 137, 0.09) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translate(-50%, -46%) scale(0.97)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "slide-down": {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -46%) scale(0.97)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "fade-out": "fade-out 0.15s ease-in",
        "slide-up": "slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
