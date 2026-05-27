"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调（点击外部、ESC、滚动时） */
  onClose: () => void;
  /** 锚点元素引用 */
  anchorRef: React.RefObject<HTMLElement>;
  /** 弹层内容 */
  children: React.ReactNode;
  /** 弹层宽度（px），不传则使用 min-width */
  width?: number;
  /** 期望对齐方式：start = 锚点左对齐 / end = 锚点右对齐 / center 居中 */
  align?: "start" | "end" | "center";
  /** 期望弹层在锚点下方（默认）或上方 */
  side?: "bottom" | "top";
  /** 距离锚点的间距 */
  offset?: number;
  /** 额外 className（控制 padding/边框/背景等） */
  className?: string;
  /** 弹层最大高度，超出可滚动；不传则 480 */
  maxHeight?: number;
  /** 触发 onClose 时是否在滚动事件中关闭，默认 true */
  closeOnScroll?: boolean;
}

/**
 * 通用悬浮菜单：
 * - 通过 React Portal 渲染到 <body>，规避任何祖先的 overflow:hidden 裁切
 * - position: fixed，按锚点 getBoundingClientRect 计算位置
 * - 自动检测视口边界，必要时翻转到上方
 * - 监听 ESC、点击外部、滚动、resize 自动关闭
 */
export function FloatingMenu({
  open,
  onClose,
  anchorRef,
  children,
  width,
  align = "start",
  side = "bottom",
  offset = 6,
  className,
  maxHeight = 480,
  closeOnScroll = true,
}: FloatingMenuProps) {
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    placement: "bottom" | "top";
    measuredWidth?: number;
  } | null>(null);

  const menuRef = React.useRef<HTMLDivElement>(null);

  // 计算位置
  const updatePosition = React.useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const SAFE_PADDING = 8;

    // 测量弹层宽度（若未指定）
    const w =
      width ??
      menuRef.current?.offsetWidth ??
      Math.max(180, rect.width);

    // 水平位置
    let left: number;
    if (align === "end") {
      left = rect.right - w;
    } else if (align === "center") {
      left = rect.left + rect.width / 2 - w / 2;
    } else {
      left = rect.left;
    }
    // 边界检测
    if (left + w > vw - SAFE_PADDING) left = vw - w - SAFE_PADDING;
    if (left < SAFE_PADDING) left = SAFE_PADDING;

    // 垂直位置：默认下方；空间不足则翻转到上方
    let placement: "bottom" | "top" = side;
    const menuH = menuRef.current?.offsetHeight ?? 0;
    const spaceBelow = vh - rect.bottom - SAFE_PADDING;
    const spaceAbove = rect.top - SAFE_PADDING;
    if (placement === "bottom" && menuH > spaceBelow && spaceAbove > spaceBelow) {
      placement = "top";
    } else if (
      placement === "top" &&
      menuH > spaceAbove &&
      spaceBelow > spaceAbove
    ) {
      placement = "bottom";
    }

    let top: number;
    if (placement === "bottom") {
      top = rect.bottom + offset;
    } else {
      top = rect.top - (menuH || 0) - offset;
    }
    // 顶部底部边界保护
    if (top + (menuH || 0) > vh - SAFE_PADDING) {
      top = Math.max(SAFE_PADDING, vh - (menuH || 0) - SAFE_PADDING);
    }
    if (top < SAFE_PADDING) top = SAFE_PADDING;

    setPos({ top, left, placement, measuredWidth: width });
  }, [anchorRef, width, align, side, offset]);

  // 打开后定位 + 监听事件
  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    // 初次渲染弹层后再 measure 一次（拿到真实高度）
    const raf = requestAnimationFrame(() => {
      updatePosition();
    });

    const onResize = () => updatePosition();
    const onScroll = (e: Event) => {
      // 弹层内部滚动不影响：仅在弹层外部滚动时处理
      if (menuRef.current?.contains(e.target as Node)) return;
      if (closeOnScroll) {
        onClose();
      } else {
        updatePosition();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current?.contains(t) ||
        anchorRef.current?.contains(t)
      ) {
        return;
      }
      onClose();
    };

    window.addEventListener("resize", onResize);
    // capture: true 让任意祖先的滚动也能监听到
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, updatePosition, anchorRef, closeOnScroll, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: pos?.placement === "top" ? 4 : -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: pos?.placement === "top" ? 4 : -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            top: pos?.top ?? -9999,
            left: pos?.left ?? -9999,
            width: width,
            maxHeight,
            zIndex: 1000,
          }}
          className={cn(
            "rounded-md border border-ink-200 bg-white shadow-popover overflow-y-auto",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
