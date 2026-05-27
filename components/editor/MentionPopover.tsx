"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MentionUser {
  id: string;
  name: string;
  title: string;
  avatar: string;
}

interface MentionPopoverProps {
  open: boolean;
  /** 光标处的 DOMRect（在视口坐标系，position:fixed 直接用） */
  caretRect: DOMRect | null;
  /** @ 后已输入的查询字（不含 @） */
  query: string;
  /** 候选人列表（已经按需要过滤前的全集，组件内部再做匹配排序） */
  users: MentionUser[];
  onPick: (user: MentionUser) => void;
  onClose: () => void;
}

/**
 * 正文 @ 提及成员的浮层。
 * - 通过 portal 渲染到 body，使用 fixed + caretRect 定位
 * - 自带键盘 ↑/↓/Enter/Esc 导航（在 document 监听）
 * - query 实时筛选 + 高亮匹配
 */
export function MentionPopover({
  open,
  caretRect,
  query,
  users,
  onPick,
  onClose,
}: MentionPopoverProps) {
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }, [query, users]);

  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    setActive(0);
  }, [query, open]);

  // 键盘导航
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) =>
          filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length,
        );
      } else if (e.key === "Enter") {
        if (filtered[active]) {
          e.preventDefault();
          e.stopPropagation();
          onPick(filtered[active]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, filtered, active, onPick, onClose]);

  // 计算位置：尽量贴在光标下方，超出视口翻转到上方
  const [pos, setPos] = React.useState<{ top: number; left: number; placement: "top" | "bottom" }>({
    top: -9999,
    left: -9999,
    placement: "bottom",
  });

  React.useLayoutEffect(() => {
    if (!open || !caretRect) return;
    const W = 280;
    const H_EST = Math.min(56 + filtered.length * 48, 320);
    const PAD = 8;
    let left = caretRect.left;
    let placement: "top" | "bottom" = "bottom";
    let top = caretRect.bottom + 6;
    if (left + W > window.innerWidth - PAD) {
      left = Math.max(PAD, window.innerWidth - W - PAD);
    }
    if (left < PAD) left = PAD;
    if (top + H_EST > window.innerHeight - PAD) {
      // 翻到上面
      top = caretRect.top - H_EST - 6;
      placement = "top";
      if (top < PAD) top = PAD;
    }
    setPos({ top, left, placement });
  }, [open, caretRect, filtered.length]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && caretRect && (
        <motion.div
          initial={{ opacity: 0, y: pos.placement === "top" ? 4 : -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: pos.placement === "top" ? 4 : -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 280,
            zIndex: 1100,
          }}
          className="rounded-xl border border-ink-200 bg-white shadow-popover overflow-hidden"
          // 防止鼠标点击列表时引起 contenteditable 失焦
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* header */}
          <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-ink-100">
            <div className="text-[11px] text-ink-500">
              提及成员
              {query && (
                <span className="ml-1 text-ink-400">
                  · 搜索 <span className="text-ink-700 font-medium">@{query}</span>
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-ink-300">↑↓ 选择 · Enter 确认</div>
          </div>

          {/* list */}
          <div className="max-h-[260px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-ink-400">
                未找到匹配的成员
              </div>
            ) : (
              filtered.map((u, idx) => (
                <button
                  key={u.id}
                  type="button"
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => onPick(u)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 mx-1 rounded-lg text-left transition-colors",
                    idx === active ? "bg-brand-50" : "hover:bg-ink-50",
                  )}
                  style={{ width: "calc(100% - 8px)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-ink-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 truncate">
                      <Highlight text={u.name} query={query} />
                    </div>
                    <div className="text-[11.5px] text-ink-500 truncate">
                      <Highlight text={u.title} query={query} />
                    </div>
                  </div>
                  {idx === active && (
                    <div className="text-[10.5px] text-brand-600 font-medium shrink-0">
                      Enter
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-brand-100 text-brand-800 rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </>
  );
}
