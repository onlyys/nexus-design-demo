"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { EventItem } from "./types";

interface EventTimelineProps {
  events: EventItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

/**
 * 左侧 Event 时间线
 * #1 / #2 / #3 ... + 添加事件
 */
export function EventTimeline({
  events,
  activeId,
  onSelect,
  onAdd,
}: EventTimelineProps) {
  return (
    <div className="relative">
      <div className="text-[12px] font-medium text-ink-500 mb-3 px-1">
        子主题
      </div>

      <div className="space-y-2">
        {events.map((ev, idx) => {
          const active = ev.id === activeId;
          return (
            <button
              key={ev.id}
              onClick={() => onSelect(ev.id)}
              className={cn(
                "group w-full text-left rounded-lg border transition-all px-3 py-2.5",
                active
                  ? "border-brand-400 bg-brand-50/60 shadow-card"
                  : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50/60",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-6 h-6 rounded-md inline-flex items-center justify-center text-[11.5px] font-semibold shrink-0",
                    active
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 text-ink-700 group-hover:bg-ink-200",
                  )}
                >
                  #{idx + 1}
                </span>
                <span
                  className={cn(
                    "text-[12.5px] truncate flex-1 min-w-0",
                    active
                      ? "text-ink-900 font-medium"
                      : "text-ink-700",
                  )}
                  title={ev.title || `未命名子主题 ${idx + 1}`}
                >
                  {ev.title || (
                    <span className="text-ink-400">未命名子主题</span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onAdd}
        className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-dashed border-ink-300 text-[12.5px] text-ink-600 hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50/40 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        添加子主题
      </button>
    </div>
  );
}
