import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1E6DFF",
          50: "#F0F5FF",
          100: "#DBE7FF",
          500: "#3B82F6",
          600: "#1E6DFF",
          700: "#1456D6",
        },
        ai: {
          DEFAULT: "#7C5CF6",
          50: "#F4F2FF",
          100: "#E9E5FF",
          200: "#D8D0FE",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        ink: {
          900: "#0F1116",
          700: "#2F343D",
          500: "#5B6470",
          400: "#8B95A1",
          300: "#C9CFD7",
          200: "#E5E8ED",
          100: "#F1F2F4",
          50: "#FAFAFA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "PingFang SC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        // 1.0 风格：阴影更克制，几乎只有 1px 边框 + 极淡阴影
        card: "0 1px 0 rgba(15, 17, 22, 0.02)",
        cardHover:
          "0 1px 2px rgba(15, 17, 22, 0.04), 0 4px 16px -6px rgba(15, 17, 22, 0.06)",
        brand: "0 4px 12px -4px rgba(30, 109, 255, 0.32)",
        popover:
          "0 8px 24px -6px rgba(15, 17, 22, 0.12), 0 2px 6px -1px rgba(15, 17, 22, 0.06)",
      },
      borderRadius: {
        xl2: "10px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
        fadeUp: "fadeUp 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
