import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0A0A0A",
        accent: "#FFFFFF",
        success: "#00FF88",
        warning: "#FFCC00",
        destructive: "#FF3366",
        "text-primary": "#FFFFFF",
        "text-secondary": "#666666",
        divider: "#1A1A1A",
        "white-5": "rgba(255, 255, 255, 0.05)",
        "white-10": "rgba(255, 255, 255, 0.10)",
        "white-30": "rgba(255, 255, 255, 0.30)",
        "white-50": "rgba(255, 255, 255, 0.50)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "title": ["20px", { fontWeight: "900", letterSpacing: "2px" }],
        "status": ["10px", { fontWeight: "600", letterSpacing: "1.2px" }],
        "section": ["12px", { fontWeight: "900", letterSpacing: "2px" }],
        "body-strong": ["14px", { fontWeight: "600" }],
        "body-secondary": ["11px", { fontWeight: "400" }],
        "button": ["14px", { fontWeight: "900", letterSpacing: "1.5px" }],
      },
      borderRadius: {
        card: "12px",
        button: "16px",
        input: "12px",
      },
      spacing: {
        micro: "4px",
        base: "8px",
        double: "16px",
        quad: "32px",
        18: "4.5rem",
        22: "5.5rem",
      },
      animation: {
        "book-lift": "bookLift 0.4s cubic-bezier(0.2, 0.72, 0.24, 1) forwards",
        "book-open": "bookOpen 0.6s cubic-bezier(0.2, 0.72, 0.24, 1) forwards",
        "book-close": "bookClose 0.4s cubic-bezier(0.2, 0.72, 0.24, 1) forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.2, 0.72, 0.24, 1) forwards",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        bookLift: {
          "0%": { transform: "translateY(0) rotateY(0deg)" },
          "100%": { transform: "translateY(-8px) rotateY(-2deg)" },
        },
        bookOpen: {
          "0%": { transform: "scale(1) rotateY(0deg)" },
          "50%": { transform: "scale(1.05) rotateY(-15deg)" },
          "100%": { transform: "scale(1) rotateY(0deg)" },
        },
        bookClose: {
          "0%": { transform: "scale(1) rotateY(0deg)" },
          "100%": { transform: "scale(0.95) rotateY(0deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
