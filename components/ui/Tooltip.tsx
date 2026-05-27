"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  /** 提示主标题 */
  label: React.ReactNode;
  /** 可选辅助说明 */
  hint?: React.ReactNode;
  /** 触发器子元素 */
  children: React.ReactElement;
  /** 弹出方向，默认 bottom */
  side?: "top" | "bottom";
  /** 延迟（ms） */
  delay?: number;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 轻量 Tooltip：portal 到 body，避免被祖先 overflow 裁切。
 */
export function Tooltip({
  label,
  hint,
  children,
  side = "bottom",
  delay = 350,
  disabled = false,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(
    null,
  );
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const timer = React.useRef<number | undefined>(undefined);

  const updatePos = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const top = side === "bottom" ? rect.bottom + 6 : rect.top - 6;
    setPos({ top, left: cx });
  }, [side]);

  const show = () => {
    if (disabled) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      updatePos();
      setOpen(true);
    }, delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  // 通过 ref 同时持有 DOM 和原 child ref
  const setTriggerRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
    const childRef = (children as any).ref;
    if (typeof childRef === "function") childRef(node);
    else if (childRef && "current" in childRef) {
      (childRef as React.MutableRefObject<unknown>).current = node;
    }
  };

  const trigger = React.cloneElement(children, {
    ref: setTriggerRef,
    onMouseEnter: (e: any) => {
      children.props.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e: any) => {
      children.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: any) => {
      children.props.onFocus?.(e);
      show();
    },
    onBlur: (e: any) => {
      children.props.onBlur?.(e);
      hide();
    },
    onClick: (e: any) => {
      children.props.onClick?.(e);
      hide();
    },
  });

  return (
    <>
      {trigger}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.span
                role="tooltip"
                initial={{
                  opacity: 0,
                  y: side === "bottom" ? -2 : 2,
                  scale: 0.96,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: side === "bottom" ? -2 : 2,
                  scale: 0.96,
                }}
                transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  transform: `translate(-50%, ${
                    side === "bottom" ? "0" : "-100%"
                  })`,
                  zIndex: 1000,
                  pointerEvents: "none",
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-md bg-ink-900 text-white shadow-popover",
                  "whitespace-nowrap text-[11.5px] leading-tight",
                )}
              >
                <span className="font-medium">{label}</span>
                {hint && (
                  <span className="ml-1.5 text-ink-300 font-normal">
                    {hint}
                  </span>
                )}
                <span
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-ink-900",
                    side === "bottom" ? "-top-1" : "-bottom-1",
                  )}
                />
              </motion.span>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
