"use client";

import * as React from "react";
import {
  Layout,
  Puzzle,
  Image as ImageIcon,
  Wand2,
  Search,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillCapability } from "./types";

const ICONS = {
  layout: Layout,
  puzzle: Puzzle,
  image: ImageIcon,
  wand: Wand2,
  search: Search,
  compass: Compass,
};

/**
 * 详情页"概览 → 能做什么"卡片
 *
 * 视觉：渐变占位插画（无外网素材依赖）+ 标题 + Prompt 例
 */
export function SkillCapabilityCard({ cap }: { cap: SkillCapability }) {
  const Icon = ICONS[cap.icon];
  return (
    <div
      className={cn(
        "rounded-xl border border-ink-200 bg-white overflow-hidden",
        "hover:border-ink-300 hover:shadow-cardHover transition-all duration-200",
      )}
    >
      {/* 视觉占位 */}
      <div
        className="aspect-[16/10] relative flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${cap.gradient[0]} 0%, ${cap.gradient[1]} 100%)`,
        }}
      >
        {/* 装饰圆点 */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-1.5 h-5 rounded bg-white/80 backdrop-blur text-[10px] text-ink-700 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          可调用
        </span>
        {/* 大图标 */}
        <div className="w-16 h-16 rounded-2xl bg-white/85 backdrop-blur shadow-sm flex items-center justify-center">
          <Icon className="w-8 h-8 text-ink-700" strokeWidth={1.6} />
        </div>
      </div>

      {/* 文字 */}
      <div className="px-4 py-3.5">
        <h4 className="text-[14px] font-semibold text-ink-900 leading-snug">
          {cap.title}
        </h4>
        <p className="mt-1 text-[12px] text-ink-500 leading-relaxed">
          <span className="text-ink-400">"</span>
          {cap.subtitle}
          <span className="text-ink-400">"</span>
        </p>
      </div>
    </div>
  );
}
