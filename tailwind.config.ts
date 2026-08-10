import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#0A0C14",
          soft: "#11141F",
          deep: "#05060B"
        },
        glass: {
          border: "rgba(255,255,255,0.12)",
          fill: "rgba(255,255,255,0.055)"
        },
        ink: {
          DEFAULT: "#F5F5F7",
          muted: "#9CA3AF",
          faint: "#6B7280"
        },
        spectrum: {
          violet: "#8B5CF6",
          cyan: "#22D3EE",
          magenta: "#F472B6",
          amber: "#FBBF24"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      backgroundImage: {
        "liquid-conic":
          "conic-gradient(from 0deg, #8B5CF6, #22D3EE, #F472B6, #FBBF24, #8B5CF6)",
        "liquid-radial":
          "radial-gradient(circle at 30% 20%, rgba(139,92,246,0.35), transparent 55%), radial-gradient(circle at 80% 30%, rgba(34,211,238,0.28), transparent 50%), radial-gradient(circle at 50% 85%, rgba(244,114,182,0.25), transparent 55%)"
      },
      boxShadow: {
        glass:
          "inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -1px 12px rgba(255,255,255,0.04), 0 20px 60px -20px rgba(0,0,0,0.6)",
        "glass-lg":
          "inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -20px 40px rgba(255,255,255,0.03), 0 30px 80px -20px rgba(0,0,0,0.7)"
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.08)" },
          "66%": { transform: "translate(-25px, 25px) scale(0.95)" }
        },
        spin_slow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        blob: "blob 16s ease-in-out infinite",
        "blob-delay": "blob 20s ease-in-out infinite 2s",
        "spin-slow": "spin_slow 8s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
        rise: "rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }
    }
  },
  plugins: []
};

export default config;
