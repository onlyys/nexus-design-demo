"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineCommentable } from "./InlineCommentable";
import { ReactionBar } from "./ReactionBar";
import { CommentSection } from "./CommentSection";
import { EventCard } from "@/components/event/EventCard";
import type { EventItem } from "@/components/event/types";
import type { PublishedEvent } from "./types";

interface PublishedEventCardProps {
  event: PublishedEvent;
  expanded: boolean;
  onToggle: () => void;
  /** 是否展示编辑 / 删除按钮（作者视角才显示），默认 false */
  canManage?: boolean;
  /** 是否处于"原地编辑"形态 */
  editing?: boolean;
  /** 进入编辑（外层根据需要把别的 Event 退出编辑） */
  onStartEdit?: () => void;
  /** 取消编辑（不保存） */
  onCancelEdit?: () => void;
  /** 保存编辑（外层去更新数据 + 退出编辑） */
  onSaveEdit?: (next: { title: string; blocks: PublishedEvent["blocks"] }) => void;
  /** 删除回调（仅在 canManage 时生效；外层弹确认） */
  onDelete?: () => void;
}

/**
 * 发布后 Event 卡片：折叠/展开 + 原地编辑
 */
export function PublishedEventCard({
  event,
  expanded,
  onToggle,
  canManage = false,
  editing = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: PublishedEventCardProps) {
  // —— 原地编辑模式 —— 直接渲染一个编辑器形态
  if (editing) {
    return <InlineEventEditor event={event} onCancel={onCancelEdit} onSave={onSaveEdit} />;
  }

  return (
    <section
      id={`pub-event-${event.id}`}
      className={cn(
        "rounded-lg bg-white border transition-colors overflow-hidden",
        expanded
          ? "border-brand-300 ring-1 ring-brand-100/70 shadow-card"
          : "border-ink-200 hover:border-ink-300",
      )}
    >
      {/* 标题栏 */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors",
          expanded ? "bg-brand-50/30" : "bg-white hover:bg-ink-50/60",
        )}
      >
        <span className="h-5 w-5 inline-flex items-center justify-center text-ink-400 shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <span
          className={cn(
            "inline-flex items-center justify-center px-2 h-5 rounded text-[11.5px] font-mono shrink-0",
            expanded
              ? "bg-brand-600 text-white"
              : "bg-ink-100 text-ink-600",
          )}
        >
          #{event.index}
        </span>
        <span
          className={cn(
            "flex-1 min-w-0 text-[14.5px] truncate",
            expanded
              ? "font-semibold text-ink-900"
              : "font-medium text-ink-800",
          )}
        >
          {event.title}
        </span>
        <span className="shrink-0 text-[11.5px] text-ink-400 tabular-nums">
          {event.publishedAt}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1">
              {/* 正文标签 + 右侧编辑/删除（仅作者视角） */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-[11.5px] text-ink-500">
                  <Edit3 className="w-3 h-3" />
                  正文
                </div>
                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEdit?.();
                      }}
                      className="inline-flex items-center gap-1 h-6 px-2 rounded-md border bg-white border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/40 text-[11.5px] transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      编辑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                      }}
                      className="inline-flex items-center gap-1 h-6 px-2 rounded-md border bg-white border-ink-200 text-ink-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/60 text-[11.5px] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                {event.blocks.map((b) => (
                  <InlineCommentable key={b.id} eventId={event.id} block={b} />
                ))}
              </div>

              {/* 反应条 */}
              <div className="mt-4">
                <ReactionBar initial={event.reactions} />
              </div>

              {/* 评论区 */}
              <CommentSection initialComments={event.comments} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** 内联编辑器：标题 + BlockEditor（完整复用编辑页 EventCard），底部带保存/取消 */
function InlineEventEditor({
  event,
  onCancel,
  onSave,
}: {
  event: PublishedEvent;
  onCancel?: () => void;
  onSave?: (next: { title: string; blocks: PublishedEvent["blocks"] }) => void;
}) {
  const [draft, setDraft] = React.useState<EventItem>({
    id: event.id,
    title: event.title,
    blocks: event.blocks,
  });

  return (
    <div className="animate-fadeUp">
      <EventCard
        index={event.index}
        event={draft}
        onChange={(next) =>
          setDraft({ id: next.id, title: next.title, blocks: next.blocks })
        }
        active
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 h-8 px-3.5 rounded-md bg-ink-100 hover:bg-ink-200 text-ink-700 text-[12.5px] font-medium transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          取消
        </button>
        <button
          type="button"
          onClick={() =>
            onSave?.({ title: draft.title, blocks: draft.blocks })
          }
          className="inline-flex items-center gap-1 h-8 px-4 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-[12.5px] font-medium transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          保存
        </button>
      </div>
    </div>
  );
}
