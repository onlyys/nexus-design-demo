"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uid } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { BlockRow } from "@/components/blocks/BlockRow";
import { EditorToolbar } from "./EditorToolbar";
import { SlashMenu } from "./SlashMenu";
import { createBlock, initialBlocks } from "./factory";
import { parsePasteToBlocks } from "./pasteParser";
import { placeCaret } from "./Editable";
import type { Block, BlockType } from "./types";
import type { RichPastePayload } from "./Editable";

interface BlockEditorProps {
  blocks?: Block[];
  onBlocksChange?: (blocks: Block[]) => void;
  onChange?: (blocks: Block[]) => void;
}

/** 文本类 block（持有 .text 字段，可参与跨段合并 / 切分） */
const TEXT_LIKE: ReadonlyArray<BlockType> = [
  "text",
  "h1",
  "h2",
  "h3",
  "quote",
];
const isTextLike = (b: Block): b is Extract<Block, { text: string }> =>
  TEXT_LIKE.includes(b.type as BlockType);

export function BlockEditor({
  blocks: controlledBlocks,
  onBlocksChange,
  onChange,
}: BlockEditorProps) {
  const isControlled = controlledBlocks !== undefined;
  const [uncontrolledBlocks, setUncontrolledBlocks] = React.useState<Block[]>(
    () => initialBlocks(),
  );
  const blocks = isControlled ? (controlledBlocks as Block[]) : uncontrolledBlocks;

  const blocksRef = React.useRef<Block[]>(blocks);
  React.useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const setBlocks = React.useCallback(
    (updater: Block[] | ((prev: Block[]) => Block[])) => {
      if (isControlled) {
        const next =
          typeof updater === "function"
            ? (updater as (p: Block[]) => Block[])(blocksRef.current)
            : updater;
        onBlocksChange?.(next);
      } else {
        setUncontrolledBlocks((prev) =>
          typeof updater === "function"
            ? (updater as (p: Block[]) => Block[])(prev)
            : updater,
        );
      }
    },
    [isControlled, onBlocksChange],
  );

  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [slash, setSlash] = React.useState<{
    open: boolean;
    blockId: string | null;
    pos: { x: number; y: number } | null;
    query: string;
  }>({ open: false, blockId: null, pos: null, query: "" });

  // —— AI 格式优化 state ——
  const [aiFormatting, setAiFormatting] = React.useState(false);
  const [aiFormatDone, setAiFormatDone] = React.useState(false);
  const [aiFormatTip, setAiFormatTip] = React.useState<string | null>(null);

  const runAiFormat = React.useCallback(() => {
    if (aiFormatting) return;

    // 收集所有可优化的 text-like block（含纯文本）
    const current = blocksRef.current;
    const textCount = current.filter(
      (b) =>
        (b.type === "text" || b.type === "quote") &&
        "text" in b &&
        typeof b.text === "string" &&
        b.text.trim().length > 0,
    ).length;

    if (textCount === 0) {
      setAiFormatTip("当前内容为空或无可优化文本，请先输入正文");
      setAiFormatDone(true);
      window.setTimeout(() => {
        setAiFormatDone(false);
        setAiFormatTip(null);
      }, 2200);
      return;
    }

    setAiFormatting(true);
    setAiFormatDone(false);
    setAiFormatTip(null);

    // 模拟 AI 处理时延
    window.setTimeout(() => {
      const before = blocksRef.current;
      const { next, changed } = applyAiFormat(before);
      setBlocks(next);
      setAiFormatting(false);
      setAiFormatDone(true);
      setAiFormatTip(
        changed > 0
          ? `已识别主题并优化 ${changed} 个内容块`
          : "内容格式已经很规整啦",
      );
      window.setTimeout(() => {
        setAiFormatDone(false);
        setAiFormatTip(null);
      }, 2400);
    }, 1600);
  }, [aiFormatting, setBlocks]);


  // 编辑器外层容器，用于捕获跨 block 快捷键 / 选区
  const containerRef = React.useRef<HTMLDivElement>(null);

  /** 待落焦点策略：在下一帧把光标放到指定 block 的指定位置 */
  const pendingFocusRef = React.useRef<{
    id: string;
    caret: "start" | "end" | number;
  } | null>(null);

  const requestFocus = (id: string, caret: "start" | "end" | number = "end") => {
    pendingFocusRef.current = { id, caret };
    setFocusedId(id);
  };

  React.useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    const root = containerRef.current;
    if (!root) return;
    // 等动画/渲染稳定后定位
    const tid = requestAnimationFrame(() => {
      const el = root.querySelector<HTMLElement>(
        `[data-block-id="${pending.id}"] [data-editable-block="true"]`,
      );
      if (el) {
        el.focus();
        placeCaret(el, pending.caret);
      }
      pendingFocusRef.current = null;
    });
    return () => cancelAnimationFrame(tid);
  }, [blocks]);

  React.useEffect(() => {
    onChange?.(blocks);
  }, [blocks, onChange]);

  const updateBlock = (b: Block) =>
    setBlocks((prev) => prev.map((p) => (p.id === b.id ? b : p)));

  const insertBlockAfter = (
    id: string | null,
    type: BlockType,
    meta?: {
      mode?: "plain" | "card" | "full";
      fileType?: "pdf" | "ppt" | "doc" | "xls" | "image" | "other";
      rows?: number;
      cols?: number;
      linkUrl?: string;
      linkDisplay?: "plain" | "card" | "full";
    },
  ) => {
    const newBlock = createBlock(type, meta);
    setBlocks((prev) => {
      if (!id) return [...prev, newBlock];
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return [...prev, newBlock];
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    requestFocus(newBlock.id, "start");
  };

  const removeBlock = (id: string) =>
    setBlocks((prev) =>
      prev.length === 1 ? prev : prev.filter((b) => b.id !== id),
    );

  // toolbar insert: insert after focused or at end
  const handleToolbarInsert = (
    type: BlockType,
    meta?: {
      mode?: "plain" | "card" | "full";
      fileType?: "pdf" | "ppt" | "doc" | "xls" | "image" | "other";
      rows?: number;
      cols?: number;
      linkUrl?: string;
      linkDisplay?: "plain" | "card" | "full";
    },
  ) => insertBlockAfter(focusedId, type, meta);

  // slash flow
  const handleBlockSlash = (block: Block, rect: DOMRect) => {
    setSlash({
      open: true,
      blockId: block.id,
      pos: { x: rect.left, y: rect.bottom + 6 },
      query: "",
    });
  };

  const handleSlashSelect = (type: BlockType) => {
    const id = slash.blockId;
    setSlash({ open: false, blockId: null, pos: null, query: "" });
    if (!id) return;
    setBlocks((prev) => {
      const next = prev.map((b) => {
        if (b.id !== id) return b;
        if (
          b.type === "text" ||
          b.type === "h1" ||
          b.type === "h2" ||
          b.type === "h3" ||
          b.type === "quote"
        ) {
          return { ...b, text: b.text.replace(/\/$/, "") };
        }
        return b;
      });
      const idx = next.findIndex((b) => b.id === id);
      const target = next[idx];
      const isEmptyText =
        target &&
        target.type === "text" &&
        (target as any).text?.length === 0;
      const newBlock = createBlock(type);
      if (isEmptyText) {
        next[idx] = newBlock;
      } else {
        next.splice(idx + 1, 0, newBlock);
      }
      return next;
    });
  };

  /** 富文本粘贴：解析为多个 Block 插入 */
  const handleRichPaste = (
    currentBlockId: string,
    payload: RichPastePayload,
  ) => {
    const newBlocks = parsePasteToBlocks({
      html: payload.html,
      text: payload.text,
      fileImages: payload.fileImages,
    });
    if (newBlocks.length === 0) return;

    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === currentBlockId);
      if (idx < 0) return [...prev, ...newBlocks];

      const cur = prev[idx];
      const isEmptyText =
        cur && cur.type === "text" && (cur as any).text?.length === 0;

      const tailing: Block = { id: uid(), type: "text", text: "" };
      const toInsert = [...newBlocks, tailing];

      const next = [...prev];
      if (isEmptyText) {
        next.splice(idx, 1, ...toInsert);
      } else {
        next.splice(idx + 1, 0, ...toInsert);
      }
      return next;
    });

    requestAnimationFrame(() => {
      setBlocks((prev) => {
        const last = prev[prev.length - 1];
        if (last) setFocusedId(last.id);
        return prev;
      });
    });
  };

  /* ===== Notion / 飞书一致的「整体文档」编辑能力 ===== */

  /** Enter：在光标位置切分当前段，after 作为新 text block 插入到下一行 */
  const handleSplit = (blockId: string, before: string, after: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0) return prev;
      const cur = prev[idx];
      if (!isTextLike(cur)) return prev;

      const next = [...prev];
      next[idx] = { ...cur, text: before } as Block;
      const newBlock: Block = { id: uid(), type: "text", text: after };
      next.splice(idx + 1, 0, newBlock);
      // 切分后焦点到新段开头
      pendingFocusRef.current = { id: newBlock.id, caret: "start" };
      return next;
    });
  };

  /**
   * 行首 Backspace：把当前 block 内容合并到「上一个 text-like block」末尾。
   * 上一段记下合并前的纯文本长度，光标精确落在合并点。
   */
  const handleMergeWithPrev = (blockId: string, currentHtml: string) => {
    let handled = false;
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx <= 0) return prev;
      const cur = prev[idx];
      if (!isTextLike(cur)) return prev;
      // 找到向上最近的 text-like block
      let prevIdx = -1;
      for (let i = idx - 1; i >= 0; i--) {
        if (isTextLike(prev[i])) {
          prevIdx = i;
          break;
        }
      }
      if (prevIdx < 0) return prev;
      const prevBlock = prev[prevIdx] as Extract<Block, { text: string }>;

      // 计算合并点（用纯文本长度 ≈ 字符数，避免 HTML 标签计入）
      const tmp = document.createElement("div");
      tmp.innerHTML = prevBlock.text || "";
      const caretOffset = (tmp.innerText || "").length;

      const merged = (prevBlock.text || "") + (currentHtml || "");
      const next = [...prev];
      next[prevIdx] = { ...prevBlock, text: merged } as Block;
      next.splice(idx, 1);
      pendingFocusRef.current = { id: prevBlock.id, caret: caretOffset };
      handled = true;
      return next;
    });
    return handled;
  };

  /**
   * 行末 Delete：把下一个 text-like block 合并到当前末尾。
   */
  const handleMergeNextIntoCurrent = (
    blockId: string,
    currentHtml: string,
  ) => {
    let handled = false;
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const cur = prev[idx];
      if (!isTextLike(cur)) return prev;
      let nextIdx = -1;
      for (let i = idx + 1; i < prev.length; i++) {
        if (isTextLike(prev[i])) {
          nextIdx = i;
          break;
        }
      }
      if (nextIdx < 0) return prev;
      const nextBlock = prev[nextIdx] as Extract<Block, { text: string }>;

      const tmp = document.createElement("div");
      tmp.innerHTML = currentHtml || "";
      const caretOffset = (tmp.innerText || "").length;

      const merged = (currentHtml || "") + (nextBlock.text || "");
      const arr = [...prev];
      arr[idx] = { ...cur, text: merged } as Block;
      arr.splice(nextIdx, 1);
      pendingFocusRef.current = { id: cur.id, caret: caretOffset };
      handled = true;
      return arr;
    });
    return handled;
  };

  /** 跨 block 上下移动光标 */
  const handleArrowUpOut = (blockId: string) => {
    const idx = blocksRef.current.findIndex((b) => b.id === blockId);
    for (let i = idx - 1; i >= 0; i--) {
      const b = blocksRef.current[i];
      if (isTextLike(b)) {
        requestFocus(b.id, "end");
        return;
      }
    }
  };
  const handleArrowDownOut = (blockId: string) => {
    const idx = blocksRef.current.findIndex((b) => b.id === blockId);
    for (let i = idx + 1; i < blocksRef.current.length; i++) {
      const b = blocksRef.current[i];
      if (isTextLike(b)) {
        requestFocus(b.id, "start");
        return;
      }
    }
  };

  /* ===== 跨 block 全选 (Cmd+A) ===== */

  const isAllSelected = (root: HTMLElement): boolean => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const r = sel.getRangeAt(0);
    if (!root.contains(r.commonAncestorContainer)) return false;
    // 是否横跨多于一个 contentEditable
    const editables = root.querySelectorAll<HTMLElement>(
      '[data-editable-block="true"]',
    );
    if (editables.length === 0) return false;
    let crossed = 0;
    editables.forEach((el) => {
      if (
        r.intersectsNode(el) &&
        // 选区与该 editable 的相交区间非空
        !(
          r.compareBoundaryPoints(Range.END_TO_START, makeRangeOf(el)) >= 0 ||
          r.compareBoundaryPoints(Range.START_TO_END, makeRangeOf(el)) <= 0
        )
      ) {
        crossed++;
      }
    });
    return crossed >= 1; // 任何跨段选区都视为「多选」状态
  };

  const makeRangeOf = (el: HTMLElement): Range => {
    const r = document.createRange();
    r.selectNodeContents(el);
    return r;
  };

  /** 选中容器内所有可编辑文字（跨 block 全选） */
  const selectAllBlocks = () => {
    const root = containerRef.current;
    if (!root) return;
    const editables = Array.from(
      root.querySelectorAll<HTMLElement>('[data-editable-block="true"]'),
    );
    if (editables.length === 0) return;
    const first = editables[0];
    const last = editables[editables.length - 1];
    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(last, last.childNodes.length);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  /** 删除当前跨 block 选区（Backspace / Delete / 输入时触发） */
  const deleteSelection = (replaceWith?: string): boolean => {
    const root = containerRef.current;
    if (!root) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return false;

    // 找出所有相交的 editable 元素 → 对应 block id
    const editables = Array.from(
      root.querySelectorAll<HTMLElement>('[data-editable-block="true"]'),
    );
    const intersected: { el: HTMLElement; blockId: string }[] = [];
    editables.forEach((el) => {
      if (range.intersectsNode(el)) {
        const wrapper = el.closest<HTMLElement>("[data-block-id]");
        if (wrapper) {
          const id = wrapper.getAttribute("data-block-id");
          if (id) intersected.push({ el, blockId: id });
        }
      }
    });
    if (intersected.length < 2) return false; // 单 block 内由浏览器原生处理

    const firstEntry = intersected[0];
    const lastEntry = intersected[intersected.length - 1];

    // 计算首段保留前缀 / 末段保留后缀 HTML（用 cloneContents 保留 inline 标签）
    const firstBefore = document.createRange();
    firstBefore.selectNodeContents(firstEntry.el);
    firstBefore.setEnd(range.startContainer, range.startOffset);
    const firstFrag = firstBefore.cloneContents();
    const firstTmp = document.createElement("div");
    firstTmp.appendChild(firstFrag);
    const firstHtml = firstTmp.innerHTML;

    const lastAfter = document.createRange();
    lastAfter.selectNodeContents(lastEntry.el);
    lastAfter.setStart(range.endContainer, range.endOffset);
    const lastFrag = lastAfter.cloneContents();
    const lastTmp = document.createElement("div");
    lastTmp.appendChild(lastFrag);
    const lastHtml = lastTmp.innerHTML;

    // 合并到 firstBlock：firstBefore + (replaceWith ?? "") + lastAfter
    const mergedHtml =
      firstHtml + (replaceWith ?? "") + lastHtml;

    // 计算光标 offset：firstBefore 的纯文本长度 + replaceWith 的纯文本长度
    const firstTextLen = (firstTmp.innerText || "").length;
    const replaceLen = replaceWith ? replaceWith.length : 0;
    const caretOffset = firstTextLen + replaceLen;

    const idsToDelete = new Set(
      intersected.slice(1).map((x) => x.blockId), // 删除除首段以外的所有相交 block
    );
    const firstBlockId = firstEntry.blockId;

    setBlocks((prev) => {
      const next: Block[] = [];
      for (const b of prev) {
        if (b.id === firstBlockId && isTextLike(b)) {
          next.push({ ...b, text: mergedHtml } as Block);
        } else if (idsToDelete.has(b.id)) {
          // skip
        } else {
          next.push(b);
        }
      }
      // 兜底：保证至少有一个 block
      if (next.length === 0) next.push({ id: uid(), type: "text", text: "" });
      pendingFocusRef.current = { id: firstBlockId, caret: caretOffset };
      return next;
    });

    // 移除 native selection（避免下一帧仍残留旧 range）
    sel.removeAllRanges();
    return true;
  };

  /* ===== 容器 keydown：捕获跨段 Cmd+A / Backspace / Delete / 输入 ===== */

  const handleContainerKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    const isMod = e.metaKey || e.ctrlKey;

    // Cmd+A → 跨 block 全选（仅在编辑器容器内、且当前焦点在某个 editable 中时升级）
    if (isMod && (e.key === "a" || e.key === "A")) {
      const root = containerRef.current;
      if (!root) return;
      const active = document.activeElement as HTMLElement | null;
      const isInEditable = !!active?.closest('[data-editable-block="true"]');
      if (!isInEditable) return;

      const sel = window.getSelection();
      // 第一次 Cmd+A：若选区在单个 editable 内（默认浏览器行为是选中当前 block），
      // 我们升级为「全文选中」
      if (sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0);
        const containing = (r.commonAncestorContainer as HTMLElement)
          ?.nodeType === 1
          ? (r.commonAncestorContainer as HTMLElement)
          : r.commonAncestorContainer.parentElement;
        const onlyOneBlock =
          containing?.closest('[data-editable-block="true"]') !== null &&
          // 选区是否就是这个 editable 的全部内容
          isFullSelectionOf(
            r,
            containing!.closest(
              '[data-editable-block="true"]',
            ) as HTMLElement,
          );
        // 单 block 内已是「全选当前段」 → 升级；否则先做单 block 的全选（原生行为）
        if (onlyOneBlock || sel.isCollapsed) {
          e.preventDefault();
          if (sel.isCollapsed) {
            // 第一次：先全选当前段
            const editable = active!.closest(
              '[data-editable-block="true"]',
            ) as HTMLElement;
            const r2 = document.createRange();
            r2.selectNodeContents(editable);
            sel.removeAllRanges();
            sel.addRange(r2);
          } else {
            // 第二次：升级到全文
            selectAllBlocks();
          }
          return;
        }
      }
      // 兜底：直接全选所有
      e.preventDefault();
      selectAllBlocks();
      return;
    }

    // 跨 block 选区下的删除 / 输入
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const root = containerRef.current;
    if (!root || !root.contains(range.commonAncestorContainer)) return;

    // 是否横跨多个 editable
    const editables = Array.from(
      root.querySelectorAll<HTMLElement>('[data-editable-block="true"]'),
    );
    let crossed = 0;
    for (const el of editables) {
      if (range.intersectsNode(el)) crossed++;
      if (crossed > 1) break;
    }
    if (crossed < 2) return;

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      deleteSelection();
      return;
    }
    // 普通可输入键：用 key 替换选区（修饰键放行）
    if (
      !isMod &&
      e.key.length === 1 &&
      !e.altKey
    ) {
      e.preventDefault();
      deleteSelection(e.key);
      return;
    }
    // Enter：选区横跨多 block 时，删除并新建一行
    if (e.key === "Enter") {
      e.preventDefault();
      const ok = deleteSelection();
      if (ok) {
        // 在合并后的首段后插入一个新空段
        const id = pendingFocusRef.current?.id;
        if (id) {
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.id === id);
            if (idx < 0) return prev;
            const newBlock: Block = { id: uid(), type: "text", text: "" };
            const next = [...prev];
            next.splice(idx + 1, 0, newBlock);
            pendingFocusRef.current = { id: newBlock.id, caret: "start" };
            return next;
          });
        }
      }
      return;
    }
  };

  return (
    <div className="relative">
      <EditorToolbar
        onInsert={handleToolbarInsert}
        onAiFormat={runAiFormat}
        aiFormatting={aiFormatting}
        aiFormatDone={aiFormatDone}
      />

      {/* AI 优化提示条（处理过的 block 数 / 完成提示） */}
      {(aiFormatting || aiFormatDone || aiFormatTip) && (
        <div
          className={cn(
            "mt-2 px-3 py-1.5 rounded-md border text-[12px] flex items-center gap-2 transition-all",
            aiFormatting
              ? "border-ai-200 bg-ai-50/60 text-ai-700"
              : aiFormatDone
              ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
              : "border-ink-200 bg-ink-50/60 text-ink-600",
          )}
        >
          {aiFormatting ? (
            <>
              <span className="inline-flex w-3.5 h-3.5 rounded-full border-2 border-ai-300 border-t-ai-600 animate-spin" />
              AI 正在分析正文结构、识别主题与各内容块类型…
            </>
          ) : aiFormatDone ? (
            <>
              <span className="inline-flex w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] items-center justify-center font-bold">
                ✓
              </span>
              {aiFormatTip ?? "格式已优化"}
            </>
          ) : (
            <span>{aiFormatTip}</span>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="mt-5 px-1"
        onKeyDown={handleContainerKeyDown}
      >
        <AnimatePresence initial={false}>
          {blocks.map((b) => (
            <motion.div
              key={b.id}
              data-block-id={b.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              <BlockRow
                block={b}
                isFocused={focusedId === b.id}
                onUpdate={updateBlock}
                onEnter={() => insertBlockAfter(b.id, "text")}
                onDelete={() => {
                  removeBlock(b.id);
                  if (focusedId === b.id) setFocusedId(null);
                }}
                onFocus={() => setFocusedId(b.id)}
                onSlash={(rect) => handleBlockSlash(b, rect)}
                onAddBelow={() => insertBlockAfter(b.id, "text")}
                onRichPaste={handleRichPaste}
                onSplit={handleSplit}
                onMergeWithPrev={handleMergeWithPrev}
                onMergeNextIntoCurrent={handleMergeNextIntoCurrent}
                onArrowUpOut={handleArrowUpOut}
                onArrowDownOut={handleArrowDownOut}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 末尾留白点击区 */}
        <div
          onClick={() => {
            const last = blocks[blocks.length - 1];
            if (
              last &&
              last.type === "text" &&
              (last as any).text?.length === 0
            ) {
              setFocusedId(last.id);
            } else {
              insertBlockAfter(null, "text");
            }
          }}
          className="h-12 cursor-text"
          aria-hidden
        />
      </div>

      <SlashMenu
        open={slash.open}
        position={slash.pos}
        query={slash.query}
        onSelect={handleSlashSelect}
        onClose={() =>
          setSlash({ open: false, blockId: null, pos: null, query: "" })
        }
      />
    </div>
  );
}

/** 判断 range 是否就是 el 的「整段」内容（用于第一次 Cmd+A 单段全选检测） */
function isFullSelectionOf(range: Range, el: HTMLElement): boolean {
  const r = document.createRange();
  r.selectNodeContents(el);
  return (
    range.compareBoundaryPoints(Range.START_TO_START, r) <= 0 &&
    range.compareBoundaryPoints(Range.END_TO_END, r) >= 0
  );
}

/* —————————————————— AI 格式优化：启发式规则 —————————————————— */

/**
 * 把一个 block 列表智能优化为结构化形态：
 * - 第一段非空、且较短（< 28 字、无标点结尾）→ 升级为 H2（主题标题）
 * - 段落内含连续以「1. / 2. / 3.」开头的多行 → 合并为有序列表
 * - 段落内含连续以「- / • / *」开头的多行 → 合并为无序列表
 * - 「？」「！」结尾的 < 24 字短句 → H3 小节标题
 * - 整段被 「" "」 / 「" "」/ 「" '」 包裹 → quote 引用
 * - 其它保持 text，仅做空白清理
 *
 * 仅处理 text 与 quote 形态的 block；保留其它（image / file / link / list 等）原样。
 */
function applyAiFormat(blocks: Block[]): { next: Block[]; changed: number } {
  let changed = 0;
  const next: Block[] = [];

  // 是否已设过主标题（整篇只升一次 H2）
  let titleAssigned = blocks.some(
    (b) => b.type === "h1" || b.type === "h2",
  );

  // 把 text-like block 拆出每行
  const expandLines = (text: string): string[] =>
    text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    // 仅处理 text；quote 已是结构化的，跳过
    if (b.type !== "text") {
      next.push(b);
      continue;
    }

    const raw = (b as Extract<Block, { text: string }>).text ?? "";
    const lines = expandLines(raw);
    if (lines.length === 0) {
      // 空段：保留，但不计入 changed
      next.push(b);
      continue;
    }

    // 1) 整体是否被引号包裹？整体替换为 quote
    const trimmed = raw.trim();
    if (
      (trimmed.startsWith("\u201C") && trimmed.endsWith("\u201D")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("「") && trimmed.endsWith("」"))
    ) {
      next.push({
        id: uid(),
        type: "quote",
        text: trimmed.slice(1, -1).trim(),
      });
      changed++;
      continue;
    }

    // 2) 整段都是有序列表行？
    const allOrdered = lines.every((l) => /^\d+[\.\)、]\s*/.test(l));
    if (lines.length >= 2 && allOrdered) {
      next.push({
        id: uid(),
        type: "numberList",
        items: lines.map((l) => l.replace(/^\d+[\.\)、]\s*/, "")),
      });
      changed++;
      continue;
    }

    // 3) 整段都是无序列表行？
    const allBullet = lines.every((l) => /^[-•*·]\s+/.test(l));
    if (lines.length >= 2 && allBullet) {
      next.push({
        id: uid(),
        type: "bulletList",
        items: lines.map((l) => l.replace(/^[-•*·]\s+/, "")),
      });
      changed++;
      continue;
    }

    // 4) 段内可能 mix：先做"行级处理"
    //    - 单行短文本 + 没有句末标点 + 整段第一段尚未升过 H2 → 提升为 H2
    //    - 单行 ? / ! 结尾的短句 → H3
    if (lines.length === 1) {
      const line = lines[0];
      const noEndPunct = !/[。！？!?\.,;:，；：]$/.test(line);

      if (!titleAssigned && line.length <= 28 && noEndPunct) {
        next.push({ id: uid(), type: "h2", text: line });
        titleAssigned = true;
        changed++;
        continue;
      }
      if (line.length <= 24 && /[?？!！]$/.test(line)) {
        next.push({ id: uid(), type: "h3", text: line });
        changed++;
        continue;
      }
      // 单行普通文本：仅做空白整理
      if (line !== raw) {
        next.push({ id: uid(), type: "text", text: line });
        changed++;
      } else {
        next.push(b);
      }
      continue;
    }

    // 5) 多行 mix：尝试拆为多个 block
    //    策略：连续同类相邻行合并为一个 list，其它按行升 H3 / text
    const segs: Block[] = [];
    let buf: string[] = [];
    let bufKind: "ol" | "ul" | null = null;

    const flushList = () => {
      if (!buf.length || !bufKind) return;
      if (bufKind === "ol") {
        segs.push({
          id: uid(),
          type: "numberList",
          items: buf.map((l) => l.replace(/^\d+[\.\)、]\s*/, "")),
        });
      } else {
        segs.push({
          id: uid(),
          type: "bulletList",
          items: buf.map((l) => l.replace(/^[-•*·]\s+/, "")),
        });
      }
      buf = [];
      bufKind = null;
    };

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const isOl = /^\d+[\.\)、]\s*/.test(line);
      const isUl = /^[-•*·]\s+/.test(line);
      const isFirstShortTitle =
        li === 0 &&
        !titleAssigned &&
        line.length <= 28 &&
        !/[。！？!?\.,;:，；：]$/.test(line);

      if (isFirstShortTitle) {
        flushList();
        segs.push({ id: uid(), type: "h2", text: line });
        titleAssigned = true;
        continue;
      }
      if (isOl) {
        if (bufKind && bufKind !== "ol") flushList();
        bufKind = "ol";
        buf.push(line);
        continue;
      }
      if (isUl) {
        if (bufKind && bufKind !== "ul") flushList();
        bufKind = "ul";
        buf.push(line);
        continue;
      }
      // 普通行
      flushList();
      // 短句问号 / 感叹号 → H3
      if (line.length <= 24 && /[?？!！]$/.test(line)) {
        segs.push({ id: uid(), type: "h3", text: line });
      } else {
        segs.push({ id: uid(), type: "text", text: line });
      }
    }
    flushList();

    if (segs.length === 0) {
      next.push(b);
    } else if (segs.length === 1 && segs[0].type === "text") {
      // 没真正升级，仅做了空白整理
      const seg = segs[0] as Extract<Block, { text: string }>;
      if (seg.text !== raw) {
        next.push(seg);
        changed++;
      } else {
        next.push(b);
      }
    } else {
      next.push(...segs);
      changed += segs.length;
    }
  }

  return { next, changed };
}
