"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Filter,
  CheckCircle2,
  Circle,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useInlineComments,
  scrollToInlineBlock,
} from "./InlineCommentsContext";
import type { PublishedTopic } from "./types";

interface InlineCommentPanelProps {
  topic: PublishedTopic;
  /** 当前激活 Event id（点击 thread 后定位时使用） */
  activeEventId?: string;
}

type FilterMode = "all" | "unresolved" | "mine";

/**
 * 右侧评论流面板：
 * - 按 Event #序号 + 段落顺序排列所有 inline thread
 * - 顶部筛选：全部 / 未解决 / @我的
 * - 点击 thread → 滚到正文段落 + 高亮
 * - 接 InlineCommentsProvider 共享状态
 */
export function InlineCommentPanel({
  topic,
  activeEventId,
}: InlineCommentPanelProps) {
  const {
    threadsByEvent,
    activeThreadId,
    setActiveThreadId,
    toggleResolved,
    appendComment,
    currentUser,
  } = useInlineComments();

  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [replyOpen, setReplyOpen] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState("");

  // 平铺所有 thread，并保留 Event 信息
  const flatThreads = React.useMemo(() => {
    const list: {
      eventId: string;
      eventIndex: number;
      eventTitle: string;
      threadId: string;
      blockId: string;
      anchorText: string;
      resolved: boolean;
      comments: import("./types").CommentItem[];
    }[] = [];
    topic.events.forEach((ev) => {
      const threads = threadsByEvent[ev.id] ?? [];
      // 按 block 在 event 中的顺序排列
      const orderMap = new Map<string, number>();
      ev.blocks.forEach((b, idx) => orderMap.set(b.id, idx));
      const sorted = [...threads].sort(
        (a, b) =>
          (orderMap.get(a.blockId) ?? 999) -
          (orderMap.get(b.blockId) ?? 999),
      );
      sorted.forEach((t) => {
        list.push({
          eventId: ev.id,
          eventIndex: ev.index,
          eventTitle: ev.title,
          threadId: t.id,
          blockId: t.blockId,
          anchorText: t.anchorText,
          resolved: !!t.resolved,
          comments: t.comments,
        });
      });
    });
    return list;
  }, [topic.events, threadsByEvent]);

  // 计数
  const total = flatThreads.length;
  const unresolved = flatThreads.filter((t) => !t.resolved).length;
  const mine = flatThreads.filter((t) =>
    t.comments.some((c) => c.authorId === currentUser.id),
  ).length;

  const visibleThreads = flatThreads.filter((t) => {
    if (filter === "unresolved") return !t.resolved;
    if (filter === "mine")
      return t.comments.some((c) => c.authorId === currentUser.id);
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* 顶部标题条 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-100">
        <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
        </div>
        <span className="text-[14px] font-semibold text-ink-900">段落评论</span>
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-ink-100 text-ink-600">
          {total}
        </span>
      </div>

      {/* 筛选条 */}
      <div className="px-3 py-2 border-b border-ink-100 flex items-center gap-1">
        <Filter className="w-3 h-3 text-ink-400 ml-1" />
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="全部"
          count={total}
        />
        <FilterChip
          active={filter === "unresolved"}
          onClick={() => setFilter("unresolved")}
          label="未解决"
          count={unresolved}
          tone="amber"
        />
        <FilterChip
          active={filter === "mine"}
          onClick={() => setFilter("mine")}
          label="@我的"
          count={mine}
        />
      </div>

      {/* 评论流 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {visibleThreads.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="px-3 py-2 space-y-2">
            {visibleThreads.map((t) => (
              <ThreadCard
                key={t.threadId}
                threadId={t.threadId}
                eventId={t.eventId}
                eventIndex={t.eventIndex}
                eventTitle={t.eventTitle}
                anchorText={t.anchorText}
                resolved={t.resolved}
                comments={t.comments}
                isActive={activeThreadId === t.threadId}
                isActiveEvent={t.eventId === activeEventId}
                onClickThread={() => {
                  setActiveThreadId(t.threadId);
                  scrollToInlineBlock(t.blockId);
                }}
                onToggleResolved={() =>
                  toggleResolved(t.eventId, t.threadId)
                }
                replyOpen={replyOpen === t.threadId}
                replyDraft={replyOpen === t.threadId ? replyDraft : ""}
                onReplyClick={() => {
                  setReplyOpen(t.threadId);
                  setReplyDraft("");
                }}
                onReplyChange={setReplyDraft}
                onReplySubmit={() => {
                  const v = replyDraft.trim();
                  if (!v) return;
                  appendComment(t.eventId, t.threadId, {
                    authorId: currentUser.id,
                    authorName: currentUser.name,
                    authorTitle: currentUser.title,
                    authorAvatar: currentUser.avatar,
                    content: v,
                  });
                  setReplyOpen(null);
                  setReplyDraft("");
                }}
                onReplyCancel={() => {
                  setReplyOpen(null);
                  setReplyDraft("");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ———————— Thread 卡片 ———————— */

function ThreadCard(props: {
  threadId: string;
  eventId: string;
  eventIndex: number;
  eventTitle: string;
  anchorText: string;
  resolved: boolean;
  comments: import("./types").CommentItem[];
  isActive: boolean;
  isActiveEvent: boolean;
  onClickThread: () => void;
  onToggleResolved: () => void;
  replyOpen: boolean;
  replyDraft: string;
  onReplyClick: () => void;
  onReplyChange: (v: string) => void;
  onReplySubmit: () => void;
  onReplyCancel: () => void;
}) {
  const {
    threadId,
    eventIndex,
    eventTitle,
    anchorText,
    resolved,
    comments,
    isActive,
    isActiveEvent,
    onClickThread,
    onToggleResolved,
    replyOpen,
    replyDraft,
    onReplyClick,
    onReplyChange,
    onReplySubmit,
    onReplyCancel,
  } = props;

  const last = comments[comments.length - 1];

  return (
    <div
      data-thread-id={threadId}
      onClick={onClickThread}
      className={cn(
        "rounded-lg border bg-white p-2.5 cursor-pointer transition-all",
        isActive
          ? "border-brand-400 ring-1 ring-brand-200 shadow-sm"
          : resolved
          ? "border-ink-100 bg-ink-50/60 opacity-70 hover:opacity-100"
          : "border-ink-200 hover:border-brand-300 hover:shadow-sm",
      )}
    >
      {/* 顶部：Event 锚点 + 解决状态 */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-[10.5px] min-w-0">
          <span
            className={cn(
              "shrink-0 inline-flex items-center justify-center px-1 h-4 rounded font-mono",
              isActiveEvent
                ? "bg-brand-600 text-white"
                : "bg-ink-100 text-ink-600",
            )}
          >
            #{eventIndex}
          </span>
          <span className="text-ink-500 truncate">{eventTitle}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleResolved();
          }}
          title={resolved ? "重新打开" : "标记已解决"}
          className={cn(
            "shrink-0 inline-flex items-center gap-0.5 h-4 px-1 rounded text-[10px] transition-colors",
            resolved
              ? "bg-ink-100 text-ink-500 hover:bg-ink-200"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          )}
        >
          {resolved ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5" />
              已解决
            </>
          ) : (
            <>
              <Circle className="w-2.5 h-2.5" />
              未解决
            </>
          )}
        </button>
      </div>

      {/* 锚点原文 */}
      <div
        className={cn(
          "text-[11px] italic px-2 py-1 rounded border-l-2 line-clamp-2 mb-2",
          resolved
            ? "border-ink-200 text-ink-500 bg-white"
            : "border-amber-300 text-ink-700 bg-amber-50/60",
        )}
      >
        「{anchorText}」
      </div>

      {/* 最近一条评论预览 + 总条数 */}
      <div className="flex items-start gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={last.authorAvatar}
          alt={last.authorName}
          className="w-5 h-5 rounded-full object-cover ring-1 ring-ink-200 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] flex items-center gap-1.5">
            <span className="font-medium text-ink-800">{last.authorTitle}</span>
            <span className="text-ink-400 tabular-nums">{last.time}</span>
            {comments.length > 1 && (
              <span className="text-ink-400">· {comments.length} 条</span>
            )}
          </div>
          <div className="mt-0.5 text-[12px] text-ink-700 leading-[1.55] line-clamp-3 whitespace-pre-wrap">
            {last.content}
          </div>
        </div>
      </div>

      {/* 操作区：回复 / 内联回复输入 */}
      {!resolved && (
        <div className="mt-2">
          {replyOpen ? (
            <div onClick={(e) => e.stopPropagation()}>
              <textarea
                autoFocus
                value={replyDraft}
                onChange={(e) => onReplyChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    if (replyDraft.trim()) onReplySubmit();
                  }
                  if (e.key === "Escape") onReplyCancel();
                }}
                placeholder="回复… Cmd/Ctrl+Enter 提交"
                rows={2}
                className="w-full text-[12px] leading-[1.5] px-2 py-1.5 rounded-md border border-ink-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
              />
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <button
                  onClick={onReplyCancel}
                  className="h-6 px-2 rounded-md text-[11px] text-ink-500 hover:bg-ink-50"
                >
                  取消
                </button>
                <button
                  disabled={!replyDraft.trim()}
                  onClick={onReplySubmit}
                  className={cn(
                    "h-6 px-2.5 rounded-md text-[11px] font-medium transition-colors",
                    replyDraft.trim()
                      ? "bg-brand-600 hover:bg-brand-700 text-white"
                      : "bg-ink-100 text-ink-400 cursor-not-allowed",
                  )}
                >
                  回复
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReplyClick();
              }}
              className="text-[11px] text-brand-600 hover:text-brand-700"
            >
              回复
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ———————— 筛选 chip ———————— */

function FilterChip({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "amber";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11.5px] transition-colors",
        active
          ? tone === "amber"
            ? "bg-amber-100 text-amber-800"
            : "bg-brand-100 text-brand-700"
          : "text-ink-500 hover:bg-ink-50",
      )}
    >
      {label}
      <span
        className={cn(
          "text-[10px] px-1 rounded",
          active
            ? tone === "amber"
              ? "bg-amber-200/70 text-amber-900"
              : "bg-brand-200/70 text-brand-800"
            : "bg-ink-100 text-ink-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}

/* ———————— 空状态 ———————— */

function EmptyState({ filter }: { filter: FilterMode }) {
  const text =
    filter === "unresolved"
      ? "没有未解决的段落评论"
      : filter === "mine"
      ? "你还没有参与任何段落评论"
      : "还没有段落评论 — 在正文中划选文字即可开始";
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-10 text-center text-ink-400">
      <Inbox className="w-8 h-8 mb-2 text-ink-300" strokeWidth={1.5} />
      <div className="text-[12.5px]">{text}</div>
    </div>
  );
}
