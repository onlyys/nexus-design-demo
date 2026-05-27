"use client";

import * as React from "react";
import { Sparkles, Wrench } from "lucide-react";

/**
 * V2 右侧 AI 面板 · 待上线占位
 *
 * - 保留 Nexus AI 顶栏（与编辑态保持一致）
 * - 下方展示「功能待上线」占位
 */
export function AiPanelPlaceholder() {
  return (
    <aside className="w-full h-full bg-white flex flex-col">
      {/* 顶部 Nexus AI 标识 */}
      <div className="flex items-start gap-2.5 px-4 py-3.5 border-b border-ink-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ai-500 to-ai-600 flex items-center justify-center shadow-[0_3px_8px_-2px_rgba(139,92,246,0.45)] shrink-0">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-ink-900 leading-none">
              Nexus AI
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ai-50 text-ai-700 border border-ai-100 leading-none">
              AI
            </span>
          </div>
          <div className="mt-1 text-[11px] text-ink-500 leading-none">
            智能解析助手
          </div>
        </div>
      </div>

      {/* 占位主体 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-ai-200/40 via-brand-200/30 to-transparent blur-2xl"
          />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-ink-50 border border-ink-200/70 shadow-card inline-flex items-center justify-center">
            <Wrench className="w-9 h-9 text-ai-500" strokeWidth={1.4} />
            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-ai-500 to-brand-500 border-2 border-white inline-flex items-center justify-center shadow-sm">
              <Sparkles className="w-3 h-3 text-white" strokeWidth={2.8} />
            </span>
          </div>
        </div>

        <div className="mt-6 text-[15px] font-semibold text-ink-900">
          功能待上线
        </div>
        <div className="mt-2 text-[12px] text-ink-500 leading-relaxed max-w-[240px]">
          更多 AI 增强功能
          <br />
          正在打磨中，敬请期待
        </div>

        <div className="mt-7 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ai-50 border border-ai-100 text-[11px] text-ai-700">
          <span className="w-1.5 h-1.5 rounded-full bg-ai-500 animate-pulse" />
          Coming soon
        </div>
      </div>
    </aside>
  );
}
