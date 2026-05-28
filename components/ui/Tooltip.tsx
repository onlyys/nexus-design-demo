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
 *
 * 定位策略：
 * - 外层 div：fixed + left = 触发器中心 + translateX(-50%) → 确保水平对齐
 * - 内层 motion.span：只负责 opacity / y / scale 动画，不碰 x 方向
 * - 箭头：absolute left-1/2 -translate-x-1/2 → 始终在 tooltip 底部中心
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
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const timer = React.useRef<number | undefined>(undefined);

  const updatePos = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // 锚点：触发器水平中心
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
              <div
                style={{
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                  pointerEvents: "none",
                }}
                ref={(el) => {
                  if (!el) return;
                  // 边界检测：渲染后检查是否越界
                  const r = el.getBoundingClientRect();
                  const vw = window.innerWidth;
                  const vh = window.innerHeight;

                  // 左边界溢出
                  if (r.left < 8) {
                    el.style.left = `${r.width / 2 + 8}px`;
                    el.style.transform = "none";
                  }
                  // 右边界溢出
                  else if (r.right > vw - 8) {
                    el.style.left = `${vw - r.width / 2 - 8}px`;
                    el.style.transform = "none";
                  }

                  // 底部空间不够 → 翻到上方
                  if (side === "bottom" && r.bottom > vh - 4) {
                    const trigger = triggerRef.current;
                    if (trigger) {
                      const tr = trigger.getBoundingClientRect();
                      el.style.top = `${tr.top - 8}px`;
                      const arrow = el.querySelector('[data-arrow]') as HTMLElement | null;
                      if (arrow) {
                        arrow.className =
                          "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-ink-900 -bottom-1";
                      }
                    }
                  }
                }}
              >
                <motion.span
                  role="tooltip"
                  initial={{
                    opacity: 0,
                    y: side === "bottom" ? -3 : 3,
                    scale: 0.96,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: side === "bottom" ? -3 : 3,
                    scale: 0.96,
                  }}
                  transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "inline-block px-2.5 py-1.5 rounded-md bg-ink-900 text-white shadow-popover",
                    "text-[11.5px] leading-tight",
                  )}
                >
                  {/* 允许 hint 较长时换行 */}
                  {hint ? (
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium whitespace-nowrap">{label}</span>
                      <span className="text-ink-300 font-normal max-w-[240px]">
                        {hint}
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium whitespace-nowrap">{label}</span>
                  )}

                  <span
                    data-arrow
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-ink-900",
                      side === "bottom" ? "-top-1" : "-bottom-1",
                    )}
                  />
                </motion.span>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
