"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AtSign,
  Paperclip,
  CornerDownLeft,
  Lock,
  Smile,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { cn, uid } from "@/lib/utils";
import type { CommentItem } from "./types";

interface CommentSectionProps {
  initialComments: CommentItem[];
  /** 当前用户名 */
  currentUserName?: string;
  currentUserAvatar?: string;
}

const DEFAULT_SCOPES = [
  "CDG企业发展事业群/可持续社会价值事业部/技术架构部/技术公益创新发展中心",
  "SSV/科技生态实验室",
  "全员可见",
];

/**
 * Event 下方的评论区：
 * - 评论列表（含一层回复占位）
 * - 输入区：@ / 附件 / 表情 / 图片 / 可见范围 / 发送
 */
export function CommentSection({
  initialComments,
  currentUserName = "王志恒",
  currentUserAvatar = "https://i.pravatar.cc/80?img=12",
}: CommentSectionProps) {
  const [comments, setComments] = React.useState<CommentItem[]>(initialComments);
  const [draft, setDraft] = React.useState("");
  const [scopeIdx, setScopeIdx] = React.useState(0);
  const [scopeOpen, setScopeOpen] = React.useState(false);
  const scopeBtnRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!scopeOpen) return;
    const handler = (e: MouseEvent) => {
      if (!scopeBtnRef.current?.contains(e.target as Node)) {
        setScopeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [scopeOpen]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const c: CommentItem = {
      id: uid(),
      authorId: "me",
      authorName: currentUserName,
      authorTitle: "可持续社会价值事业部",
      authorAvatar: currentUserAvatar,
      content: text,
      time: now(),
    };
    setComments((prev) => [...prev, c]);
    setDraft("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mt-5 pt-5 border-t border-ink-100">
      {/* 标题：讨论 N */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[13px] font-semibold text-ink-800">
          讨论
        </span>
        <span className="text-[12px] text-ink-400">{comments.length}</span>
      </div>

      {/* 输入区（紧贴标题） */}
      <div className="rounded-xl border border-brand-200/70 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="我也来参加讨论..."
          rows={3}
          className="block w-full resize-none px-4 pt-3 pb-2 text-[13.5px] leading-[1.7] text-ink-900 bg-transparent outline-none placeholder:text-ink-400"
        />
        <div className="flex items-center justify-between gap-2 px-2.5 pb-2">
          <div className="flex items-center gap-0.5 text-ink-500">
            <ToolBtn title="@提及">
              <AtSign className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn title="附件">
              <Paperclip className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn title="表情">
              <Smile className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn title="图片">
              <ImageIcon className="w-3.5 h-3.5" />
            </ToolBtn>
            {/* 可见范围下拉 */}
            <div className="relative ml-1" ref={scopeBtnRef}>
              <button
                onClick={() => setScopeOpen((v) => !v)}
                className="inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11.5px] text-ink-600 hover:bg-ink-50 max-w-[280px]"
              >
                <Lock className="w-3 h-3 shrink-0" />
                <span className="truncate">{DEFAULT_SCOPES[scopeIdx]}</span>
                <ChevronDown className="w-3 h-3 shrink-0 text-ink-400" />
              </button>
              <AnimatePresence>
                {scopeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 bottom-9 w-[340px] rounded-xl border border-ink-200 bg-white shadow-popover p-1.5 z-30"
                  >
                    {DEFAULT_SCOPES.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => {
                          setScopeIdx(i);
                          setScopeOpen(false);
                        }}
                        className={cn(
                          "w-full text-left flex items-start gap-2 px-2.5 py-2 rounded-lg text-[12.5px] hover:bg-ink-50",
                          i === scopeIdx
                            ? "text-brand-700 bg-brand-50/40"
                            : "text-ink-700",
                        )}
                      >
                        <Lock className="w-3 h-3 mt-[3px] shrink-0" />
                        <span className="leading-[1.55]">{s}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-ink-400">
              <CornerDownLeft className="w-3 h-3" />
              发送
            </span>
            <button
              onClick={send}
              disabled={!draft.trim()}
              className={cn(
                "h-7 px-3 rounded-md text-[12.5px] font-medium transition-colors",
                draft.trim()
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-ink-100 text-ink-400 cursor-not-allowed",
              )}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      {comments.length > 0 && (
        <ul className="mt-4 space-y-4">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <CommentRow comment={c} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-colors"
    >
      {children}
    </button>
  );
}

function CommentRow({ comment }: { comment: CommentItem }) {
  return (
    <div className="flex items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={comment.authorAvatar}
        alt={comment.authorName}
        className="w-8 h-8 rounded-full object-cover ring-1 ring-ink-200 shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-ink-900">
            {comment.authorName}
          </span>
          <span className="text-[11.5px] text-ink-500">
            {comment.authorTitle}
          </span>
          <span className="text-[11px] text-ink-400 ml-auto">
            {comment.time}
          </span>
        </div>
        <div className="mt-1 text-[13px] leading-[1.85] text-ink-800 whitespace-pre-wrap">
          {comment.content}
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-ink-400">
          <button className="hover:text-ink-700">回复</button>
          <button className="hover:text-ink-700">赞</button>
          <button className="hover:text-rose-500">举报</button>
        </div>
      </div>
    </div>
  );
}

function now() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
