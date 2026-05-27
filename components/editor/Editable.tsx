"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MentionPopover, type MentionUser } from "./MentionPopover";

interface EditableProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  /**
   * 单行 Enter 行为（默认）：在末尾按 Enter 直接新建下一个空 block。
   * 若提供 onEnterSplit，则按 Enter 时优先把光标前后内容切分，调用 onEnterSplit(before, after)；
   * 父级负责把 before 写回当前 block，after 作为新 block 的初始内容插入到下方。
   */
  onEnter?: () => void;
  onEnterSplit?: (beforeHtml: string, afterHtml: string) => void;
  /** 当前 block 为空，按 Backspace —— 删除当前 block */
  onBackspaceEmpty?: () => void;
  /**
   * 当前 block 非空，但光标在最起点，按 Backspace —— 父级负责把当前内容合并到上一个 block 末尾。
   * 返回 true 表示父级处理了，Editable 不再做默认行为。
   */
  onBackspaceAtStart?: (currentHtml: string) => boolean | void;
  /**
   * 当前 block 非空，但光标在末尾，按 Delete —— 父级负责把下一个 block 内容合并到当前 block 末尾。
   * 返回 true 表示父级处理了。
   */
  onDeleteAtEnd?: (currentHtml: string) => boolean | void;
  /** 光标在最顶部行向上 → 父级聚焦上一个 block */
  onArrowUpAtStart?: () => void;
  /** 光标在最底部行向下 → 父级聚焦下一个 block */
  onArrowDownAtEnd?: () => void;
  onSlash?: (rect: DOMRect) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  /**
   * 富文本粘贴回调；返回 true 表示父级已处理。
   */
  onRichPaste?: (payload: RichPastePayload) => boolean | void;
  /**
   * 提及候选用户列表；提供后会启用 @ 搜索功能。
   * 在文本中输入 @ 即唤出搜索浮层（仅当 @ 前是空白或行首时触发）。
   */
  mentionUsers?: MentionUser[];
}

export interface RichPastePayload {
  html: string;
  text: string;
  fileImages: { src: string; name?: string }[];
  event: React.ClipboardEvent<HTMLDivElement>;
}

/** 判断 value 字符串是否是「富文本 HTML」（粘贴解析后的内容） */
function looksLikeHtml(v: string): boolean {
  if (!v) return false;
  return /<[a-zA-Z]+[^>]*>/.test(v) || v.includes("&nbsp;") || v.includes("&lt;");
}

/** 取当前光标 / 选区相对于 root 的位置；判断是否在 root 内容的最起点 / 最末尾 */
function getCaretBoundary(root: HTMLElement): {
  atStart: boolean;
  atEnd: boolean;
  collapsed: boolean;
} {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0)
    return { atStart: false, atEnd: false, collapsed: true };
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer))
    return { atStart: false, atEnd: false, collapsed: true };

  const collapsed = range.collapsed;

  // atStart: range 起点 = root 文本起点
  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(root);
  beforeRange.setEnd(range.startContainer, range.startOffset);
  const beforeText = beforeRange.toString();
  const atStart = beforeText.length === 0;

  // atEnd: range 终点 = root 文本末尾
  const afterRange = document.createRange();
  afterRange.selectNodeContents(root);
  afterRange.setStart(range.endContainer, range.endOffset);
  const afterText = afterRange.toString();
  const atEnd = afterText.length === 0;

  return { atStart, atEnd, collapsed };
}

/**
 * 把 contentEditable 元素按当前光标拆分为 before / after 两段 HTML。
 * 用 Range.cloneContents 保留 inline 标签（加粗、颜色等）。
 */
function splitHtmlAtCaret(root: HTMLElement): {
  before: string;
  after: string;
} | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;

  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(root);
  beforeRange.setEnd(range.startContainer, range.startOffset);

  const afterRange = document.createRange();
  afterRange.selectNodeContents(root);
  afterRange.setStart(range.endContainer, range.endOffset);

  const beforeFrag = beforeRange.cloneContents();
  const afterFrag = afterRange.cloneContents();

  const tmp1 = document.createElement("div");
  tmp1.appendChild(beforeFrag);
  const tmp2 = document.createElement("div");
  tmp2.appendChild(afterFrag);

  return { before: tmp1.innerHTML, after: tmp2.innerHTML };
}

export const Editable = React.forwardRef<HTMLDivElement, EditableProps>(
  function Editable(
    {
      value,
      onChange,
      placeholder,
      className,
      multiline = false,
      onEnter,
      onEnterSplit,
      onBackspaceEmpty,
      onBackspaceAtStart,
      onDeleteAtEnd,
      onArrowUpAtStart,
      onArrowDownAtEnd,
      onSlash,
      onFocus,
      onBlur,
      autoFocus,
      onRichPaste,
      mentionUsers,
    },
    forwardedRef,
  ) {
    const innerRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLDivElement);

    const composingRef = React.useRef(false);

    // ===== @ Mention 状态 =====
    // 记录 @ 字符在 DOM 中的位置；mention session 期间持续追踪
    const mentionAnchorRef = React.useRef<{
      node: Node;
      offset: number;
    } | null>(null);
    const [mentionOpen, setMentionOpen] = React.useState(false);
    const [mentionQuery, setMentionQuery] = React.useState("");
    const [mentionRect, setMentionRect] = React.useState<DOMRect | null>(null);

    const closeMention = React.useCallback(() => {
      setMentionOpen(false);
      setMentionQuery("");
      mentionAnchorRef.current = null;
    }, []);

    /** 把 mention chip 插入到光标处，并把 @query 那段文本删除 */
    const insertMentionChip = React.useCallback(
      (user: MentionUser) => {
        const el = innerRef.current;
        const anchor = mentionAnchorRef.current;
        if (!el || !anchor) {
          closeMention();
          return;
        }
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
          closeMention();
          return;
        }
        const caret = sel.getRangeAt(0);

        // 删除 @ 到当前光标之间的文本
        const delRange = document.createRange();
        try {
          delRange.setStart(anchor.node, anchor.offset);
          delRange.setEnd(caret.endContainer, caret.endOffset);
        } catch {
          closeMention();
          return;
        }
        delRange.deleteContents();

        // 插入 chip + 一个空格
        const chip = document.createElement("span");
        chip.className = "mention-chip";
        chip.setAttribute("contenteditable", "false");
        chip.setAttribute("data-mention-id", user.id);
        chip.setAttribute("data-mention-name", user.name);
        chip.textContent = `@${user.name}`;

        const space = document.createTextNode("\u00A0");

        delRange.insertNode(space);
        delRange.insertNode(chip);

        // 把光标放到 space 之后
        const after = document.createRange();
        after.setStartAfter(space);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);

        // 触发 onChange
        const cur = el.innerHTML;
        onChange(cur);

        closeMention();
      },
      [closeMention, onChange],
    );

    /** 根据当前光标位置 + mentionAnchor 计算查询文本，更新弹层状态 */
    const updateMentionQuery = React.useCallback(() => {
      const anchor = mentionAnchorRef.current;
      if (!anchor) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        closeMention();
        return;
      }
      const caret = sel.getRangeAt(0);
      try {
        const r = document.createRange();
        r.setStart(anchor.node, anchor.offset);
        r.setEnd(caret.endContainer, caret.endOffset);
        const text = r.toString();
        // 第一个字符必须是 @；遇到换行 / 空格则取消
        if (!text.startsWith("@")) {
          closeMention();
          return;
        }
        const q = text.slice(1);
        if (/[\s\n]/.test(q)) {
          closeMention();
          return;
        }
        if (q.length > 24) {
          closeMention();
          return;
        }
        setMentionQuery(q);
      } catch {
        closeMention();
      }
    }, [closeMention]);
    // ===== /Mention =====

    React.useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      if (document.activeElement === el && !looksLikeHtml(value)) {
        if (el.innerText === value) return;
      }
      const isHtml = looksLikeHtml(value);
      if (isHtml) {
        if (el.innerHTML !== value) el.innerHTML = value;
      } else {
        if (el.innerText !== value) el.innerText = value;
      }
    }, [value]);

    React.useEffect(() => {
      if (autoFocus) innerRef.current?.focus();
    }, [autoFocus]);

    const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
      const cd = e.clipboardData;
      if (!cd) return;

      const html = cd.getData("text/html") || "";
      const plain = cd.getData("text/plain") || "";

      const filePromises: Promise<{ src: string; name?: string }>[] = [];
      for (let i = 0; i < cd.items.length; i++) {
        const item = cd.items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) {
            filePromises.push(
              new Promise((resolve) => {
                const r = new FileReader();
                r.onload = () => resolve({ src: String(r.result), name: f.name });
                r.onerror = () => resolve({ src: "", name: f.name });
                r.readAsDataURL(f);
              }),
            );
          }
        }
      }
      const fileImages = (await Promise.all(filePromises)).filter((x) => x.src);

      const hasRich = html.length > 0 || fileImages.length > 0;
      if (!hasRich) {
        e.preventDefault();
        if (plain) document.execCommand("insertText", false, plain);
        return;
      }

      e.preventDefault();
      const handled = onRichPaste?.({
        html,
        text: plain,
        fileImages,
        event: e,
      });
      if (handled === true) return;

      if (plain) document.execCommand("insertText", false, plain);
    };

    return (
      <>
        <div
          ref={innerRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          data-editable-block="true"
          className={cn(
            "outline-none whitespace-pre-wrap break-words",
            className,
          )}
          onFocus={onFocus}
          onBlur={onBlur}
          onPaste={handlePaste}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          composingRef.current = false;
          const el = e.currentTarget as HTMLDivElement;
          const cur = el.innerHTML;
          const plain = el.innerText;
          const out = /<[a-zA-Z]+[^>]*>/.test(cur) ? cur : plain;
          onChange(out);
        }}
        onInput={(e) => {
          if (composingRef.current) return;
          const el = e.currentTarget as HTMLDivElement;
          const cur = el.innerHTML;
          const plain = el.innerText;
          const out = /<[a-zA-Z]+[^>]*>/.test(cur) ? cur : plain;
          onChange(out);
          if (onSlash && plain.endsWith("/")) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              const rect = sel.getRangeAt(0).getBoundingClientRect();
              onSlash(rect);
            }
          }
          // mention session 已开启 → 刷新 query
          if (mentionUsers && mentionAnchorRef.current) {
            updateMentionQuery();
            // 光标位置实时更新 rect
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              setMentionRect(sel.getRangeAt(0).getBoundingClientRect());
            }
          }
        }}
        onKeyDown={(e) => {
          const el = e.currentTarget as HTMLDivElement;

          // —— @ 唤出 mention 弹层 ——
          if (mentionUsers && e.key === "@" && !(e as unknown as { isComposing?: boolean }).isComposing) {
            // 仅当 @ 前面是空白 / 行首 / chip 边界时触发，避免邮箱地址等误触
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              const r = sel.getRangeAt(0);
              const probe = document.createRange();
              probe.selectNodeContents(el);
              probe.setEnd(r.startContainer, r.startOffset);
              const before = probe.toString();
              const lastChar = before.slice(-1);
              const allowed = before.length === 0 || /\s/.test(lastChar);
              if (allowed) {
                // 让浏览器自然把 @ 写入；下一帧 onInput 后我们记锚点
                requestAnimationFrame(() => {
                  const sel2 = window.getSelection();
                  if (!sel2 || sel2.rangeCount === 0) return;
                  const c = sel2.getRangeAt(0);
                  // 锚点 = 当前光标往前一个字符（即刚输入的 @）
                  const a = document.createRange();
                  try {
                    a.setStart(c.endContainer, Math.max(0, c.endOffset - 1));
                    a.collapse(true);
                  } catch {
                    return;
                  }
                  mentionAnchorRef.current = {
                    node: a.startContainer,
                    offset: a.startOffset,
                  };
                  setMentionQuery("");
                  setMentionRect(c.getBoundingClientRect());
                  setMentionOpen(true);
                });
              }
            }
            return;
          }

          // mention 弹层打开期间，按 ↑↓Enter 交给 popover（其用 capture 已消费）；这里只需避免冲突
          if (mentionOpen) {
            if (
              e.key === "ArrowUp" ||
              e.key === "ArrowDown" ||
              e.key === "Enter" ||
              e.key === "Escape"
            ) {
              // 不在此处处理，交给 popover；阻止 Enter 触发 split
              if (e.key === "Enter") e.preventDefault();
              return;
            }
            // 退格删到 @ 之前 → 关闭
            if (e.key === "Backspace") {
              const anchor = mentionAnchorRef.current;
              const sel = window.getSelection();
              if (anchor && sel && sel.rangeCount > 0) {
                const c = sel.getRangeAt(0);
                if (
                  c.collapsed &&
                  c.startContainer === anchor.node &&
                  c.startOffset <= anchor.offset
                ) {
                  closeMention();
                }
              }
            }
          }

          // —— Enter：在光标位置切分内容到新 block（飞书 / Notion 一致行为） ——
          if (e.key === "Enter" && !multiline && !e.shiftKey) {
            e.preventDefault();
            if (onEnterSplit) {
              const split = splitHtmlAtCaret(el);
              if (split) {
                onEnterSplit(split.before, split.after);
                return;
              }
            }
            onEnter?.();
            return;
          }

          // —— Backspace ——
          if (e.key === "Backspace") {
            const isEmpty = el.innerText === "";
            if (isEmpty) {
              e.preventDefault();
              onBackspaceEmpty?.();
              return;
            }
            // 内容非空 + 光标在最起点 + 选区折叠 → 合并到上一段
            const { atStart, collapsed } = getCaretBoundary(el);
            if (collapsed && atStart && onBackspaceAtStart) {
              const handled = onBackspaceAtStart(el.innerHTML);
              if (handled === true) {
                e.preventDefault();
                return;
              }
            }
            return;
          }

          // —— Delete ——
          if (e.key === "Delete") {
            const { atEnd, collapsed } = getCaretBoundary(el);
            if (collapsed && atEnd && onDeleteAtEnd) {
              const handled = onDeleteAtEnd(el.innerHTML);
              if (handled === true) {
                e.preventDefault();
                return;
              }
            }
            return;
          }

          // —— ArrowUp / ArrowDown：跨 block 移动光标 ——
          if (e.key === "ArrowUp" && onArrowUpAtStart) {
            const { atStart, collapsed } = getCaretBoundary(el);
            if (collapsed && atStart) {
              e.preventDefault();
              onArrowUpAtStart();
            }
            return;
          }
          if (e.key === "ArrowDown" && onArrowDownAtEnd) {
            const { atEnd, collapsed } = getCaretBoundary(el);
            if (collapsed && atEnd) {
              e.preventDefault();
              onArrowDownAtEnd();
            }
            return;
          }
        }}
      />
      {mentionUsers && (
        <MentionPopover
          open={mentionOpen}
          caretRect={mentionRect}
          query={mentionQuery}
          users={mentionUsers}
          onPick={insertMentionChip}
          onClose={closeMention}
        />
      )}
      </>
    );
  },
);

/** 工具：把光标放到指定 contentEditable 元素的开头 / 末尾 / 指定 offset */
export function placeCaret(
  el: HTMLElement,
  position: "start" | "end" | number = "end",
) {
  const range = document.createRange();
  const sel = window.getSelection();
  if (!sel) return;
  range.selectNodeContents(el);
  if (position === "start") {
    range.collapse(true);
  } else if (position === "end") {
    range.collapse(false);
  } else {
    // 数字 offset：尽力按 textContent 长度落点
    let remaining = position;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let node: Node | null = walker.nextNode();
    let done = false;
    while (node) {
      const len = node.textContent?.length ?? 0;
      if (remaining <= len) {
        range.setStart(node, remaining);
        range.collapse(true);
        done = true;
        break;
      }
      remaining -= len;
      node = walker.nextNode();
    }
    if (!done) range.collapse(false);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}
