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
        // 页面底色（Figma color/bg/page）
        page: "#EBEDF0",
        // 主色锚定 Figma color/brand/500 = #2563EB
        brand: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF", // Figma brand/50
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB", // 主操作色（Figma brand/500）
          700: "#1D4ED8", // hover / active
        },
        ai: {
          DEFAULT: "#7C5CF6",
          50: "#F4F2FF",
          100: "#E9E5FF",
          200: "#D8D0FE",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        // 中性色对齐 Figma 灰蓝色阶（color/text/* + color/stroke/* + grayBlue/*）
        ink: {
          900: "#101114", // text/1
          700: "#4B5563", // text/2
          500: "#6B7280", // text/2.5（过渡档）
          400: "#9CA3AF", // text/3
          300: "#D1D5DB", // text/4 · stroke/thin
          200: "#E5E7EB", // stroke/normal
          100: "#F3F4F6", // stroke/weak · grayBlue/150 · bg/hover
          50: "#F9FAFB", // grayBlue/50·100
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans SC",
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
