"use client";

import * as React from "react";
import { Sparkles, RefreshCcw, Lightbulb, FileText, MessageCircle, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PublishedTopic } from "./types";

interface AiInsightPanelProps {
  topic: PublishedTopic;
  /** 当前正激活的 Event id（驱动右侧"Topic 概览"卡片高亮） */
  activeEventId?: string;
}

/**
 * 右侧 Nexus AI 摘要面板（沿用参考图二风格）：
 * - 顶部：Nexus AI 标题 + AI Badge
 * - Topic 标题 + 作者 + 时间
 * - 元信息：N 事件 / N 条讨论 / N 条待办
 * - 「Topic 概览」分组：每个 Event 一张日期卡 + 摘要
 * - 「洞察」分组：长段落 + 编号列表
 * - 底部：重新分析 按钮
 */
export function AiInsightPanel({ topic, activeEventId }: AiInsightPanelProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  const eventCount = topic.events.length;
  const commentCount = topic.events.reduce(
    (acc, e) => acc + e.comments.length,
    0,
  );
  const todoCount = topic.events.reduce((acc, e) => {
    let c = 0;
    e.blocks.forEach((b) => {
      if (b.type === "todo") {
        c += b.items.filter((it) => !it.done).length;
      }
    });
    return acc + c || acc + (e.index === 1 ? 3 : 0); // 没有 todo block 时演示
  }, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部标题条 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-100">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-ai-500 to-ai-600 flex items-center justify-center shadow-[0_3px_8px_-2px_rgba(139,92,246,0.45)]">
          <Sparkles className="w-3 h-3 text-white" strokeWidth={2.6} />
        </div>
        <span className="text-[14px] font-semibold text-ink-900">
          Nexus AI
        </span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ai-50 text-ai-700 border border-ai-100">
          AI
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-4 py-3 space-y-4">
          {/* Topic 标题信息 */}
          <div>
            <div className="text-[14px] font-semibold text-ink-900 leading-snug">
              {topic.title}
            </div>
            <div className="mt-1 text-[11.5px] text-ink-500">
              {topic.authors[0]?.name}
              {topic.authors.length > 1 && ` 等 ${topic.authors.length} 人`}
              {" · "}
              {topic.publishedAt.slice(0, 10)}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11.5px] text-ink-500">
              <span className="inline-flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {eventCount} 事件
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {commentCount} 条讨论
              </span>
              <span className="inline-flex items-center gap-1">
                <Inbox className="w-3 h-3" />
                {todoCount} 条待办
              </span>
            </div>
          </div>

          {/* Topic 概览 标签 */}
          <SectionLabel
            icon={<Sparkles className="w-3 h-3" />}
            text="Topic 概览"
            tone="ai"
          />

          {/* 概览第一卡：与参考图二一致 —— 红色细线 + 日期 + 大段总结 */}
          <div className="rounded-lg border border-ink-100 bg-white overflow-hidden">
            <div className="px-3 pt-2.5 pb-2 flex items-center gap-2 border-l-[3px] border-rose-400">
              <span className="text-[11px] tabular-nums text-rose-500 font-medium">
                {topic.events[0]?.publishedAt.slice(0, 10) ?? "—"}
              </span>
              <span className="text-[12px] font-semibold text-ink-900 truncate">
                {topic.title}
              </span>
            </div>
            <div className="px-3 pb-3 text-[12px] leading-[1.9] text-ink-700">
              {topic.aiOverview}
            </div>
          </div>

          {/* 概览：每个 Event 一张卡 */}
          {topic.events.slice(1).map((ev) => (
            <div
              key={ev.id}
              className={cn(
                "rounded-lg border bg-white overflow-hidden transition-colors",
                ev.id === activeEventId
                  ? "border-brand-300 ring-1 ring-brand-100"
                  : "border-ink-100",
              )}
            >
              <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2 border-l-[3px] border-brand-400/60">
                <span className="text-[11px] tabular-nums text-brand-600 font-medium">
                  {ev.publishedAt.slice(0, 10)}
                </span>
                <span className="text-[12px] font-semibold text-ink-900 truncate">
                  {ev.title}
                </span>
              </div>
              <div className="px-3 pb-3 text-[12px] leading-[1.85] text-ink-700">
                {ev.aiSummary}
              </div>
            </div>
          ))}

          {/* 洞察标签 */}
          <SectionLabel
            icon={<Lightbulb className="w-3 h-3" />}
            text="洞察"
            tone="brand"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={refreshing ? "r" : "s"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              <p className="text-[12.5px] leading-[1.95] text-ink-700">
                {topic.aiInsight}
              </p>
              <ol className="space-y-1.5 text-[12px] leading-[1.85] text-ink-700 list-decimal pl-5 marker:text-ink-400 marker:font-medium">
                {topic.aiInsightItems.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 底部「重新分析」 */}
      <div className="border-t border-ink-100 px-4 py-3">
        <button
          onClick={handleRefresh}
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-ink-200 bg-white text-[12.5px] text-ink-700 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50/40 transition-colors"
        >
          <RefreshCcw
            className={cn(
              "w-3.5 h-3.5 transition-transform",
              refreshing && "animate-spin",
            )}
          />
          重新分析
        </button>
      </div>
    </div>
  );
}

function SectionLabel({
  icon,
  text,
  tone,
}: {
  icon: React.ReactNode;
  text: string;
  tone: "ai" | "brand";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-[12px] font-semibold",
        tone === "ai" ? "text-ai-600" : "text-brand-600",
      )}
    >
      {icon}
      {text}
    </div>
  );
}
