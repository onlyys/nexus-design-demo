"use client";

import { useState } from "react";
import {
  Sparkles,
  RefreshCcw,
  Copy,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AI_SUMMARIES } from "@/lib/mock";
import { cn } from "@/lib/utils";

export function AiSummary({
  onClose,
  defaultOpen = false,
}: {
  onClose?: () => void;
  defaultOpen?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const summary = AI_SUMMARIES[idx];
  // 单行预览：取首行/首段最前面一段
  const oneLine = summary.replace(/\s+/g, " ").trim();

  const handleRefresh = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRefreshing(true);
    setTimeout(() => {
      setIdx((p) => (p + 1) % AI_SUMMARIES.length);
      setRefreshing(false);
    }, 600);
  };

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-xl border border-ai-100 bg-ai-50/50 hover:bg-ai-50/70 transition-colors overflow-hidden"
    >
      {/* 折叠时：单行展示，整行可点击展开 */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left group"
        >
          <div className="shrink-0 w-5 h-5 rounded-md bg-gradient-to-br from-ai-500 to-ai-600 flex items-center justify-center shadow-[0_2px_6px_-1px_rgba(139,92,246,0.45)]">
            <Sparkles className="w-3 h-3 text-white" strokeWidth={2.6} />
          </div>
          <span className="shrink-0 text-[12.5px] font-semibold text-ai-700">
            AI 速览
          </span>
          <span className="flex-1 min-w-0 text-[12.5px] text-ink-700 truncate">
            {oneLine}
          </span>
          <ChevronDown className="shrink-0 w-3.5 h-3.5 text-ink-400 group-hover:text-ai-600 transition-colors" />
        </button>
      )}

      {/* 展开时：完整内容 + 操作 */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* shimmer accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ai-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-ai-500 to-ai-600 flex items-center justify-center shadow-[0_3px_8px_-2px_rgba(139,92,246,0.45)]">
                    <Sparkles className="w-3 h-3 text-white" strokeWidth={2.6} />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-ai-500 ring-2 ring-ai-50 animate-pulse" />
                </div>
                <span className="text-[13.5px] font-semibold text-ink-900">
                  AI 速览
                </span>
                <span className="text-[10px] font-medium text-ai-600 bg-white/80 border border-ai-100 px-1.5 py-px rounded-md">
                  试用
                </span>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1 h-7 px-2 rounded-lg text-[12px] text-ink-600 hover:text-ai-600 hover:bg-white/80 transition-colors"
                >
                  <RefreshCcw
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      refreshing && "animate-spin",
                    )}
                  />
                  换一换
                </button>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 h-7 px-2 rounded-lg text-[12px] text-ink-600 hover:text-ai-600 hover:bg-white/80 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "已复制" : "复制"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-ink-500 hover:bg-white/80 transition-colors"
                  aria-label="收起"
                >
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </button>
                {onClose && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-ink-500 hover:bg-white/80 transition-colors"
                    aria-label="关闭"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx + (refreshing ? "-r" : "")}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-[13px] leading-[1.85] text-ink-700 whitespace-pre-line"
                >
                  {summary}
                </motion.div>
              </AnimatePresence>

              {refreshing && (
                <div className="absolute inset-x-4 bottom-2 h-px bg-gradient-to-r from-transparent via-ai-500/60 to-transparent animate-shimmer" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
