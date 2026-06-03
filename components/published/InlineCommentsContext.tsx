"use client";

import * as React from "react";
import type { CommentItem, InlineCommentThread } from "./types";
import { uid } from "@/lib/utils";

/**
 * 段落级评论 Context
 *
 * 职责：
 * - 持有 eventId -> threads 的状态，集中管理段落级评论
 * - 提供「添加评论 / 回复评论 / 切换 resolved / 创建新 thread」等动作
 * - 提供「当前激活的 thread id」状态用于双向锚点联动
 * - 提供「scrollIntoBlock(blockId) / scrollIntoThread(threadId)」工具
 */

interface InlineCommentsCtx {
  /** Map<eventId, threads> */
  threadsByEvent: Record<string, InlineCommentThread[]>;
  /** 高亮 / 激活中的线程 id（点击右侧评论或正文气泡时设置） */
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;

  /** 创建一个新线程（用户划词后提交评论时调用） */
  createThread: (
    eventId: string,
    blockId: string,
    anchorText: string,
    firstComment: Omit<CommentItem, "id" | "time">,
  ) => string;

  /** 在已有线程下追加一条评论 */
  appendComment: (
    eventId: string,
    threadId: string,
    comment: Omit<CommentItem, "id" | "time">,
  ) => void;

  /** 切换线程 resolved 状态 */
  toggleResolved: (eventId: string, threadId: string) => void;

  /** 取某个 block 上的所有线程（按创建顺序） */
  getThreadsByBlock: (eventId: string, blockId: string) => InlineCommentThread[];

  /** 当前用户（demo 假数据） */
  currentUser: {
    id: string;
    name: string;
    title: string;
    avatar: string;
  };
}

const Ctx = React.createContext<InlineCommentsCtx | null>(null);

export function useInlineComments() {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useInlineComments must be used inside <InlineCommentsProvider>",
    );
  }
  return ctx;
}

interface ProviderProps {
  initial: Record<string, InlineCommentThread[]>;
  currentUser: InlineCommentsCtx["currentUser"];
  children: React.ReactNode;
}

export function InlineCommentsProvider({
  initial,
  currentUser,
  children,
}: ProviderProps) {
  const [threadsByEvent, setThreadsByEvent] = React.useState(initial);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(
    null,
  );

  const createThread = React.useCallback<InlineCommentsCtx["createThread"]>(
    (eventId, blockId, anchorText, firstComment) => {
      const threadId = uid();
      const newComment: CommentItem = {
        id: uid(),
        time: nowText(),
        ...firstComment,
      };
      setThreadsByEvent((prev) => {
        const list = prev[eventId] ? [...prev[eventId]] : [];
        list.push({
          id: threadId,
          blockId,
          anchorText,
          comments: [newComment],
          resolved: false,
        });
        return { ...prev, [eventId]: list };
      });
      return threadId;
    },
    [],
  );

  const appendComment = React.useCallback<InlineCommentsCtx["appendComment"]>(
    (eventId, threadId, comment) => {
      setThreadsByEvent((prev) => {
        const list = prev[eventId];
        if (!list) return prev;
        return {
          ...prev,
          [eventId]: list.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  comments: [
                    ...t.comments,
                    { id: uid(), time: nowText(), ...comment },
                  ],
                }
              : t,
          ),
        };
      });
    },
    [],
  );

  const toggleResolved = React.useCallback<InlineCommentsCtx["toggleResolved"]>(
    (eventId, threadId) => {
      setThreadsByEvent((prev) => {
        const list = prev[eventId];
        if (!list) return prev;
        return {
          ...prev,
          [eventId]: list.map((t) =>
            t.id === threadId ? { ...t, resolved: !t.resolved } : t,
          ),
        };
      });
    },
    [],
  );

  const getThreadsByBlock = React.useCallback<
    InlineCommentsCtx["getThreadsByBlock"]
  >(
    (eventId, blockId) =>
      (threadsByEvent[eventId] ?? []).filter((t) => t.blockId === blockId),
    [threadsByEvent],
  );

  const value: InlineCommentsCtx = {
    threadsByEvent,
    activeThreadId,
    setActiveThreadId,
    createThread,
    appendComment,
    toggleResolved,
    getThreadsByBlock,
    currentUser,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function nowText() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/* ———————————— DOM 锚点工具 ———————————— */

/** 滚动到正文中某段 block，并加闪烁动画 */
export function scrollToInlineBlock(blockId: string) {
  if (typeof window === "undefined") return;
  const el = document.querySelector<HTMLElement>(
    `[data-comment-block="${blockId}"]`,
  );
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("inline-comment-flash");
  window.setTimeout(() => el.classList.remove("inline-comment-flash"), 1200);
}

/** 滚动到右侧评论流中的某条 thread */
export function scrollToCommentThread(threadId: string) {
  if (typeof window === "undefined") return;
  const el = document.querySelector<HTMLElement>(
    `[data-thread-id="${threadId}"]`,
  );
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("inline-comment-flash");
  window.setTimeout(() => el.classList.remove("inline-comment-flash"), 1200);
}
