"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, MessageSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReadOnlyBlock } from "./ReadOnlyBlock";
import {
  useInlineComments,
  scrollToCommentThread,
} from "./InlineCommentsContext";
import type { Block } from "@/components/editor/types";
import type { InlineCommentThread } from "./types";

interface InlineCommentableProps {
  eventId: string;
  block: Block;
}

/**
 * 段落容器：包装 ReadOnlyBlock
 *
 * 提供：
 * - 划词监听：用户在段落内划选文字 → 浮现"评论"小气泡
 * - 段落右侧气泡：N 条已有评论的徽章，点击展开 popover
 * - 双向锚点：data-comment-block 让右侧面板能 scrollIntoView
 */
export function InlineCommentable({ eventId, block }: InlineCommentableProps) {
  const {
    getThreadsByBlock,
    createThread,
    appendComment,
    toggleResolved,
    activeThreadId,
    setActiveThreadId,
    currentUser,
  } = useInlineComments();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const threads = getThreadsByBlock(eventId, block.id);
  const unresolvedCount = threads.filter((t) => !t.resolved).length;

  /* ———————————— 划词浮层 ———————————— */
  const [selBubble, setSelBubble] = React.useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  /* ———————————— 评论 popover ———————————— */
  const [popoverOpen, setPopoverOpen] = React.useState<
    null | { mode: "new"; anchorText: string } | { mode: "view" }
  >(null);

  const handleMouseUp = React.useCallback(() => {
    if (typeof window === "undefined") return;
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelBubble(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setSelBubble(null);
        return;
      }
      // 选区是否在容器内
      const container = containerRef.current;
      if (!container) return;
      const range = sel.getRangeAt(0);
      if (!container.contains(range.startContainer)) {
        setSelBubble(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setSelBubble({
        x: rect.right - containerRect.left,
        y: rect.top - containerRect.top - 6,
        text,
      });
    }, 0);
  }, []);

  // 点击其他地方关掉划词气泡
  React.useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const t = e.target as Node;
      if (containerRef.current.contains(t)) return;
      setSelBubble(null);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const startNewComment = () => {
    if (!selBubble) return;
    setPopoverOpen({ mode: "new", anchorText: selBubble.text });
    setSelBubble(null);
    // 清空选区
    window.getSelection()?.removeAllRanges();
  };

  const handleOpenExisting = (threadId: string) => {
    setPopoverOpen({ mode: "view" });
    setActiveThreadId(threadId);
    // 同时同步右侧面板
    requestAnimationFrame(() => scrollToCommentThread(threadId));
  };

  return (
    <div
      ref={containerRef}
      data-comment-block={block.id}
      onMouseUp={handleMouseUp}
      className={cn(
        "relative group/inline transition-colors duration-300 rounded-md",
        // 含未解决评论时段落淡黄高亮
        unresolvedCount > 0 && "bg-amber-50/40",
      )}
    >
      {/* 段落原内容 */}
      <ReadOnlyBlock block={block} />

      {/* —— 划词后的「评论」浮层小按钮 —— */}
      <AnimatePresence>
        {selBubble && (
          <motion.button
            key="sel-bubble"
            type="button"
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.14 }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={startNewComment}
            className="absolute z-30 -translate-x-full -translate-y-full inline-flex items-center gap-1 px-2 py-1 rounded-md shadow-lg bg-ink-900 text-white text-[11.5px] hover:bg-ink-800"
            style={{ left: selBubble.x, top: selBubble.y }}
          >
            <MessageSquarePlus className="w-3 h-3" />
            评论
          </motion.button>
        )}
      </AnimatePresence>

      {/* —— 段落右侧 评论气泡（已有 N 条评论时显示） —— */}
      {threads.length > 0 && (
        <button
          type="button"
          onClick={() => handleOpenExisting(threads[0].id)}
          className={cn(
            "absolute right-1 top-1 inline-flex items-center gap-1 h-6 px-2 rounded-full border bg-white/95 backdrop-blur-sm text-[11px] transition-all shrink-0 shadow-sm",
            unresolvedCount > 0
              ? "border-amber-300 text-amber-700 hover:bg-amber-50"
              : "border-ink-200 text-ink-500 hover:bg-ink-50",
            activeThreadId &&
              threads.some((t) => t.id === activeThreadId) &&
              "ring-2 ring-brand-200 border-brand-400 text-brand-700",
          )}
          title={`${threads.length} 条段落评论`}
        >
          <MessageSquare className="w-3 h-3" />
          {threads.reduce((acc, t) => acc + t.comments.length, 0)}
        </button>
      )}

      {/* —— 评论 popover：新建 / 查看 —— */}
      <AnimatePresence>
        {popoverOpen && (
          <CommentPopover
            mode={popoverOpen.mode}
            anchorText={
              popoverOpen.mode === "new"
                ? popoverOpen.anchorText
                : undefined
            }
            threads={popoverOpen.mode === "view" ? threads : []}
            onClose={() => {
              setPopoverOpen(null);
              setActiveThreadId(null);
            }}
            onSubmitNew={(content) => {
              if (popoverOpen.mode !== "new") return;
              createThread(eventId, block.id, popoverOpen.anchorText, {
                authorId: currentUser.id,
                authorName: currentUser.name,
                authorTitle: currentUser.title,
                authorAvatar: currentUser.avatar,
                content,
              });
              setPopoverOpen(null);
            }}
            onReply={(threadId, content) => {
              appendComment(eventId, threadId, {
                authorId: currentUser.id,
                authorName: currentUser.name,
                authorTitle: currentUser.title,
                authorAvatar: currentUser.avatar,
                content,
              });
            }}
            onToggleResolved={(threadId) => toggleResolved(eventId, threadId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ———————————————————————————— Popover ———————————————————————————— */

interface CommentPopoverProps {
  mode: "new" | "view";
  /** 新建模式时的锚点原文 */
  anchorText?: string;
  /** 查看模式下当前段落的所有 threads */
  threads: InlineCommentThread[];
  onClose: () => void;
  onSubmitNew: (content: string) => void;
  onReply: (threadId: string, content: string) => void;
  onToggleResolved: (threadId: string) => void;
}

function CommentPopover({
  mode,
  anchorText,
  threads,
  onClose,
  onSubmitNew,
  onReply,
  onToggleResolved,
}: CommentPopoverProps) {
  const [draft, setDraft] = React.useState("");
  const [replyDraft, setReplyDraft] = React.useState<Record<string, string>>(
    {},
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="absolute z-40 right-0 top-full mt-2 w-[380px] max-w-[92vw] rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 顶部：原文锚点引用 */}
      {mode === "new" && anchorText && (
        <div className="px-3.5 py-2.5 border-b border-ink-100 bg-amber-50/60">
          <div className="text-[10.5px] text-amber-700 mb-1">引用原文</div>
          <div className="text-[12px] text-ink-700 line-clamp-2 italic">
            「{anchorText}」
          </div>
        </div>
      )}

      <div className="max-h-[360px] overflow-y-auto">
        {/* 已有 threads */}
        {mode === "view" &&
          threads.map((t) => (
            <ThreadView
              key={t.id}
              thread={t}
              replyValue={replyDraft[t.id] ?? ""}
              onReplyChange={(v) =>
                setReplyDraft((prev) => ({ ...prev, [t.id]: v }))
              }
              onReplySubmit={() => {
                const v = replyDraft[t.id]?.trim();
                if (!v) return;
                onReply(t.id, v);
                setReplyDraft((prev) => ({ ...prev, [t.id]: "" }));
              }}
              onToggleResolved={() => onToggleResolved(t.id)}
            />
          ))}

        {/* 新建评论输入区 */}
        {mode === "new" && (
          <div className="px-3.5 py-3">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  if (draft.trim()) onSubmitNew(draft.trim());
                }
                if (e.key === "Escape") onClose();
              }}
              placeholder="对这段写下评论…  Cmd/Ctrl+Enter 提交"
              rows={3}
              className="w-full text-[12.5px] leading-[1.6] px-2.5 py-2 rounded-md border border-ink-200 bg-ink-50/60 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="h-7 px-2.5 rounded-md text-[11.5px] text-ink-600 hover:bg-ink-50 transition-colors"
              >
                取消
              </button>
              <button
                disabled={!draft.trim()}
                onClick={() => onSubmitNew(draft.trim())}
                className={cn(
                  "h-7 px-3 rounded-md text-[11.5px] font-medium transition-colors",
                  draft.trim()
                    ? "bg-brand-600 hover:bg-brand-700 text-white"
                    : "bg-ink-100 text-ink-400 cursor-not-allowed",
                )}
              >
                提交评论
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ThreadView({
  thread,
  replyValue,
  onReplyChange,
  onReplySubmit,
  onToggleResolved,
}: {
  thread: InlineCommentThread;
  replyValue: string;
  onReplyChange: (v: string) => void;
  onReplySubmit: () => void;
  onToggleResolved: () => void;
}) {
  return (
    <div className="border-b border-ink-100 last:border-b-0">
      {/* 锚点原文 */}
      <div
        className={cn(
          "px-3.5 py-2 text-[11px] flex items-start gap-2",
          thread.resolved
            ? "bg-ink-50 text-ink-500"
            : "bg-amber-50/60 text-amber-800",
        )}
      >
        <span className="shrink-0">引用原文</span>
        <span className="flex-1 italic line-clamp-2">「{thread.anchorText}」</span>
        <button
          onClick={onToggleResolved}
          title={thread.resolved ? "重新打开" : "标记已解决"}
          className={cn(
            "shrink-0 inline-flex items-center gap-0.5 h-5 px-1.5 rounded text-[10.5px] transition-colors",
            thread.resolved
              ? "bg-ink-100 text-ink-600 hover:bg-ink-200"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          )}
        >
          <Check className="w-2.5 h-2.5" />
          {thread.resolved ? "已解决" : "标记解决"}
        </button>
      </div>

      {/* 评论列表 */}
      <div className="px-3.5 py-2 space-y-2.5">
        {thread.comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.authorAvatar}
              alt={c.authorName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-ink-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px]">
                <span className="font-medium text-ink-900">
                  {c.authorTitle}
                </span>
                <span className="text-ink-400 ml-2 tabular-nums">{c.time}</span>
              </div>
              <div className="mt-0.5 text-[12.5px] text-ink-700 leading-[1.6] whitespace-pre-wrap">
                {c.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 回复输入 */}
      {!thread.resolved && (
        <div className="px-3.5 pb-3">
          <textarea
            value={replyValue}
            onChange={(e) => onReplyChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                if (replyValue.trim()) onReplySubmit();
              }
            }}
            placeholder="回复… Cmd/Ctrl+Enter 提交"
            rows={2}
            className="w-full text-[12px] leading-[1.6] px-2.5 py-1.5 rounded-md border border-ink-200 bg-ink-50/60 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
          />
          {replyValue.trim() && (
            <div className="mt-1.5 flex items-center justify-end">
              <button
                onClick={onReplySubmit}
                className="h-6 px-2.5 rounded-md text-[11px] font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors"
              >
                回复
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
