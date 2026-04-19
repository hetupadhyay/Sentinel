// frontend/tailwind.config.js
// Sentinel — Tailwind CSS configuration
// Linear-inspired dark-mode-first design system, top-nav-only

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      // ── Color tokens (mapped to CSS variables in index.css) ───────────
      colors: {
        background: {
          DEFAULT: "var(--bg)",
          secondary: "var(--bg-secondary)",
          surface: "var(--panel)",
          elevated: "var(--surface-elevated)",
          border: "var(--border)",
          "border-subtle": "var(--border-subtle)",
          hover: "var(--hover)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
        },
        risk: {
          critical: "var(--risk-critical)",
          high: "var(--risk-high)",
          medium: "var(--risk-medium)",
          low: "var(--risk-low)",
          safe: "var(--risk-safe)",
        },
        threat: {
          phishing: "#f97316",
          malware: "#ef4444",
          social: "#a855f7",
          ai: "#3b82f6",
          scam: "#eab308",
          news: "#14b8a6",
          unknown: "#6b7280",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        overlay: "var(--overlay)",
      },

      // ── Typography ──────────────────────────────────────────────
      fontFamily: {
        display: ["'Inter'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "monospace"],
      },

      // ── Border radius ──────────────────────────────────────────
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },

      // ── Box shadows ──────────────────────────────────────────
      boxShadow: {
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "panel": "0 8px 30px rgba(0, 0, 0, 0.12)",
        "command": "0 16px 70px rgba(0, 0, 0, 0.35)",
      },

      // ── Animations ────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(16px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "slide-out-right": "slide-out-right 0.15s ease-in",
      },

      // ── Backdrop blur ─────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },
    },
  },

  plugins: [],
};
