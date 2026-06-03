"use client";

import * as React from "react";
import { ThumbsUp, MessageCircleWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillUpdateEvent } from "./types";

/**
 * 详情页"更新日志" Tab
 *
 * Skill 是一种特殊 Topic，每次版本更新就是一条 Event。
 * 这里就是 Topic 的 Event 流的"只读垂直时间线"形态。
 */
export function SkillUpdateTimeline({
  updates,
}: {
  updates: SkillUpdateEvent[];
}) {
  // 时间线倒序：最新版本在最上面
  const sorted = [...updates].sort((a, b) => b.index - a.index);

  return (
    <div className="relative">
      {/* 竖线 */}
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-ink-200" />

      <ol className="space-y-5">
        {sorted.map((u, idx) => {
          const isLatest = idx === 0;
          return (
            <li key={u.id} className="relative pl-10">
              {/* 节点 */}
              <span
                className={cn(
                  "absolute left-[8px] top-1.5 w-[15px] h-[15px] rounded-full border-2 ring-4 ring-white",
                  isLatest
                    ? "bg-brand-600 border-brand-200"
                    : "bg-white border-ink-300",
                )}
              />

              <div
                className={cn(
                  "rounded-xl border bg-white px-4 py-3.5",
                  isLatest ? "border-brand-200" : "border-ink-200",
                )}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-mono font-semibold",
                        isLatest
                          ? "bg-brand-100 text-brand-700"
                          : "bg-ink-100 text-ink-600",
                      )}
                    >
                      {u.version}
                    </span>
                    {isLatest && (
                      <span className="inline-flex items-center h-5 px-1.5 rounded bg-emerald-50 border border-emerald-200 text-[10.5px] text-emerald-700 font-medium">
                        最新
                      </span>
                    )}
                    <h4 className="text-[14px] font-semibold text-ink-900 truncate">
                      {u.title}
                    </h4>
                  </div>
                  <span className="text-[11.5px] text-ink-400 tabular-nums shrink-0">
                    {u.publishedAt} · @{u.authorHandle}
                  </span>
                </div>

                <ul className="mt-2 space-y-1">
                  {u.changes.map((c, i) => (
                    <li
                      key={i}
                      className="text-[12.5px] text-ink-600 leading-relaxed pl-3 relative"
                    >
                      <span className="absolute left-0 top-[9px] w-1 h-1 rounded-full bg-ink-300" />
                      {c}
                    </li>
                  ))}
                </ul>

                {/* 反应 */}
                <div className="mt-3 flex items-center gap-3 text-[11.5px]">
                  <span className="inline-flex items-center gap-1 text-ink-500">
                    <ThumbsUp className="w-3 h-3" />
                    {u.reactions.like}
                  </span>
                  {u.reactions.doubt > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <MessageCircleWarning className="w-3 h-3" />
                      {u.reactions.doubt} 待确认
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
