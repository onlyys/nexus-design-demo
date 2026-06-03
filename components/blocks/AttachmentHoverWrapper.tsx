"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IdCard,
  Monitor,
  Download,
  Trash2,
  Link2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AttachmentDisplayMode = "card" | "preview";

interface AttachmentHoverWrapperProps {
  /** 当前展示形态 */
  mode: AttachmentDisplayMode;
  onChangeMode?: (m: AttachmentDisplayMode) => void;
  /** 是否支持「预览视图」（PDF/PPT/Word/HTML/链接 支持；Excel/Other 不支持） */
  supportsPreview?: boolean;
  /** 下载回调（无则不显示按钮） */
  onDownload?: () => void;
  /** 复制链接回调（无则不显示按钮） */
  onCopyLink?: () => void;
  /** 删除回调（编辑模式下传入；只读不传） */
  onDelete?: () => void;
  /** 是否处于只读模式（只读下不显示删除） */
  readOnly?: boolean;
  /** 内层附件内容 */
  children: React.ReactNode;
  /** 工具条额外类名 */
  className?: string;
}

/**
 * 附件悬浮工具栏统一封装
 *
 * 行为：
 * - hover 整个附件容器时，右上角浮出浅色 toolbar（白底 + 阴影）
 * - 顺序：下载 | 卡片视图 / 预览视图 | 复制链接 | 删除（编辑态）
 * - 不支持 preview 的附件（Excel/Other）只显示「下载 + 复制链接」
 */
export function AttachmentHoverWrapper({
  mode,
  onChangeMode,
  supportsPreview = true,
  onDownload,
  onCopyLink,
  onDelete,
  readOnly = false,
  children,
  className,
}: AttachmentHoverWrapperProps) {
  const [hovered, setHovered] = React.useState(false);
  // 切换 / 复制 后短暂强制保留 toolbar，给用户视觉反馈
  const [stick, setStick] = React.useState(false);
  const stickTimer = React.useRef<number | undefined>(undefined);
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<number | undefined>(undefined);

  const flashStick = () => {
    setStick(true);
    if (stickTimer.current) window.clearTimeout(stickTimer.current);
    stickTimer.current = window.setTimeout(() => setStick(false), 1100);
  };

  const flashCopied = () => {
    setCopied(true);
    flashStick();
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1400);
  };

  React.useEffect(
    () => () => {
      if (stickTimer.current) window.clearTimeout(stickTimer.current);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const showToolbar = hovered || stick;
  const hasViewToggle = !!onChangeMode && supportsPreview;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative group/attach", className)}
    >
      {children}

      <AnimatePresence>
        {showToolbar && (
          <motion.div
            key="toolbar"
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            // 不参与冒泡选区，避免和正文段落级评论的划词冲突
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 z-30 flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-white shadow-[0_4px_18px_-4px_rgba(15,23,42,0.18)] ring-1 ring-ink-200/80"
          >
            {/* 下载 */}
            {onDownload && (
              <ToolbarBtn
                onClick={() => {
                  onDownload();
                  flashStick();
                }}
                icon={<Download className="w-3.5 h-3.5" />}
                title="下载"
              />
            )}

            {/* 卡片 / 预览 视图切换 */}
            {hasViewToggle && (
              <>
                {onDownload && <ToolbarDivider />}
                <ToolbarTab
                  active={mode === "card"}
                  onClick={() => {
                    if (mode !== "card") {
                      onChangeMode!("card");
                      flashStick();
                    }
                  }}
                  icon={<IdCard className="w-3.5 h-3.5" />}
                  title="卡片视图"
                />
                <ToolbarTab
                  active={mode === "preview"}
                  onClick={() => {
                    if (mode !== "preview") {
                      onChangeMode!("preview");
                      flashStick();
                    }
                  }}
                  icon={<Monitor className="w-3.5 h-3.5" />}
                  title="预览视图"
                />
              </>
            )}

            {/* 复制链接 */}
            {onCopyLink && (
              <>
                <ToolbarDivider />
                <ToolbarBtn
                  onClick={() => {
                    onCopyLink();
                    flashCopied();
                  }}
                  icon={
                    copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )
                  }
                  title={copied ? "已复制" : "复制链接"}
                  highlight={copied}
                />
              </>
            )}

            {/* 删除（编辑态） */}
            {!readOnly && onDelete && (
              <>
                <ToolbarDivider />
                <ToolbarBtn
                  onClick={onDelete}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  title="删除"
                  danger
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ———————————— 子部件 ———————————— */

/**
 * 按钮上方的提示气泡：黑底白字 + 下方小箭头。
 * 仅在 hover 触发对象时延迟展示，避免快速划过时频闪。
 */
function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  const onEnter = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(true), 280);
  };
  const onLeave = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setShow(false);
  };

  React.useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            key="tip"
            initial={{ opacity: 0, y: 4, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 mb-2 pointer-events-none z-50 whitespace-nowrap"
          >
            <span className="relative inline-flex items-center px-2.5 py-1 rounded-md bg-ink-900 text-white text-[11.5px] font-medium shadow-[0_4px_14px_-4px_rgba(15,23,42,0.45)]">
              {label}
              <span
                className="absolute top-full left-1/2 -translate-x-1/2 -mt-[3px] w-2 h-2 bg-ink-900 rotate-45"
                aria-hidden
              />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function ToolbarTab({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Tooltip label={title}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors",
          active
            ? "bg-brand-50 text-brand-600"
            : "text-ink-500 hover:text-ink-900 hover:bg-ink-100",
        )}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

function ToolbarBtn({
  onClick,
  icon,
  title,
  danger,
  highlight,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  danger?: boolean;
  highlight?: boolean;
}) {
  return (
    <Tooltip label={title}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors",
          danger
            ? "text-ink-500 hover:text-rose-600 hover:bg-rose-50"
            : highlight
              ? "text-emerald-600 bg-emerald-50"
              : "text-ink-600 hover:text-ink-900 hover:bg-ink-100",
        )}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <span className="w-px h-4 bg-ink-200 mx-0.5 shrink-0" aria-hidden />;
}
