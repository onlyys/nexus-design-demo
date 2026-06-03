"use client";

import * as React from "react";
import { Hash, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockEditor } from "@/components/editor/BlockEditor";
import type { Block } from "@/components/editor/types";
import type { EventItem } from "./types";

interface EventCardProps {
  index: number; // 1-based
  event: EventItem;
  onChange: (ev: EventItem) => void;
  onDelete?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  /** 用户与本 Event 交互（聚焦/点击）时触发，用于左侧导航联动高亮 */
  onActivate?: () => void;
  /** 是否为当前激活的 Event（用于高亮边框等视觉强化） */
  active?: boolean;
}

/**
 * 单个 Event 卡片：序号 + 标题 + Block 编辑器
 */
export function EventCard({
  index,
  event,
  onChange,
  onDelete,
  expanded = true,
  onToggleExpand,
  onActivate,
  active = false,
}: EventCardProps) {
  return (
    <section
      id={`event-${event.id}`}
      data-event-id={event.id}
      onFocus={onActivate}
      onMouseDown={onActivate}
      className={cn(
        "rounded-lg bg-white border shadow-card transition-colors",
        active
          ? "border-brand-300 ring-2 ring-brand-100"
          : "border-ink-200 hover:border-ink-300",
        "scroll-mt-24",
      )}
    >
      {/* 标题栏 */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-semibold text-[15px] shrink-0",
            active ? "text-brand-700" : "text-brand-600",
          )}
        >
          <Hash className="w-4 h-4" />
          {index}
        </span>
        <input
          value={event.title}
          onChange={(e) => onChange({ ...event, title: e.target.value })}
          onFocus={onActivate}
          placeholder={`子主题 ${index} 标题（可选）`}
          className="flex-1 min-w-0 text-[18px] font-semibold text-ink-900 bg-transparent border-0 outline-none placeholder:text-ink-300"
        />
        <div className="flex items-center gap-1 shrink-0">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="h-7 w-7 rounded-md inline-flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100"
              title={expanded ? "折叠" : "展开"}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="h-7 w-7 rounded-md inline-flex items-center justify-center text-ink-400 hover:text-rose-600 hover:bg-rose-50"
              title="删除此子主题"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-1" onMouseDown={onActivate}>
          <BlockEditor
            blocks={event.blocks}
            onBlocksChange={(blocks: Block[]) =>
              onChange({ ...event, blocks })
            }
          />
        </div>
      )}
    </section>
  );
}
