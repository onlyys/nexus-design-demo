"use client";

import { cn } from "@/lib/utils";

/**
 * Nexus 1.0 风格 Logo：
 * - 黑底圆角方块 + 白色 N
 * - 右侧 "SSV Nexus" 黑色加粗字
 * - 副标题（可选）："透明即上下，上下文即生产力"
 */
export function NexusLogo({
  className,
  showSubtitle = false,
}: {
  className?: string;
  showSubtitle?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="22" height="22" rx="5" fill="#0F1116" />
          {/* 简洁 N */}
          <path
            d="M6.5 15.5V6.5L15.5 15.5V6.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[15px] font-semibold tracking-tight text-ink-900 whitespace-nowrap">
          SSV Nexus
        </span>
        {showSubtitle && (
          <span className="hidden md:inline text-[12px] text-ink-400 tracking-tight whitespace-nowrap">
            透明即上下，上下文即生产力
          </span>
        )}
      </div>
    </div>
  );
}
