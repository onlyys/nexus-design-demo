"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** 副标题 / 详细说明，可换行 */
  description?: React.ReactNode;
  /** 确认按钮文案，默认"确认" */
  confirmText?: string;
  /** 取消按钮文案，默认"取消" */
  cancelText?: string;
  /** 是否危险态（红色确认按钮），默认 false */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 通用确认弹窗：用于删除 / 不可逆动作的二次确认
 *
 * 视觉对齐参考图：
 *  - 居中白卡片，无左侧图标，标题大字粗体
 *  - 右上角灰色关闭 ×
 *  - 底部右对齐：灰色"取消" + 危险态红色主按钮
 *
 * 交互：
 *  - Enter 确认 / Esc 取消 / 点蒙层 取消
 *  - Portal 到 body，避免父级 stacking context 影响
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // 键盘交互
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  // 锁滚动
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // SSR 安全
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-dialog"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* 蒙层 */}
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={onCancel}
          />

          {/* 弹窗卡片 */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 2 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-[460px] max-w-[92vw] rounded-lg bg-white shadow-popover overflow-hidden"
          >
            {/* 关闭 × */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 w-6 h-6 inline-flex items-center justify-center rounded-md text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 标题 */}
            <div className="px-7 pt-6 pr-12">
              <h3 className="text-[16px] font-semibold text-ink-900 leading-snug">
                {title}
              </h3>

              {/* 描述 */}
              {description && (
                <div className="mt-3 text-[13.5px] leading-[1.7] text-ink-500 break-words">
                  {description}
                </div>
              )}
            </div>

            {/* 底部按钮区 */}
            <div className="px-7 pb-6 pt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center h-9 px-5 rounded-md bg-ink-100 hover:bg-ink-200 text-ink-700 text-[13.5px] font-medium transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={cn(
                  "inline-flex items-center justify-center h-9 px-5 rounded-md text-white text-[13.5px] font-medium transition-colors",
                  danger
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-brand-600 hover:bg-brand-700",
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
