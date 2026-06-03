"use client";

import * as React from "react";
import { Search, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEPT_CONFIG,
  TYPE_CONFIG,
  type SkillDept,
  type SkillType,
} from "./types";

export type SortMode = "latest" | "hot" | "reused";

const SORT_LABELS: Record<SortMode, string> = {
  latest: "最新",
  hot: "最热",
  reused: "最常被复用",
};

interface FilterBarProps {
  /** 当前选中的部门，null = 全部 */
  dept: SkillDept | "all" | "subscribed";
  onDeptChange: (d: SkillDept | "all" | "subscribed") => void;

  type: SkillType | "all";
  onTypeChange: (t: SkillType | "all") => void;

  sort: SortMode;
  onSortChange: (s: SortMode) => void;

  query: string;
  onQueryChange: (q: string) => void;

  /** 各部门的 skill 计数（显示在 Tab 上） */
  deptCounts: Record<string, number>;
  /** 各能力类型的计数 */
  typeCounts: Record<string, number>;
}

const DEPT_TABS: Array<{
  key: SkillDept | "all" | "subscribed";
  label: string;
}> = [
  { key: "all", label: "全部" },
  { key: "subscribed", label: "我订阅的" },
  { key: "design", label: "设计中心" },
  { key: "tech", label: "技术架构部" },
  { key: "legal", label: "法务部" },
  { key: "finance", label: "财务部" },
  { key: "research", label: "战略与研究" },
];

const TYPE_CHIPS: Array<{ key: SkillType | "all"; label: string }> = [
  { key: "all", label: "全部能力" },
  { key: "prototype", label: TYPE_CONFIG.prototype },
  { key: "review", label: TYPE_CONFIG.review },
  { key: "knowledge", label: TYPE_CONFIG.knowledge },
  { key: "ai-tool", label: TYPE_CONFIG["ai-tool"] },
  { key: "image-gen", label: TYPE_CONFIG["image-gen"] },
  { key: "research", label: TYPE_CONFIG.research },
  { key: "deploy", label: TYPE_CONFIG.deploy },
  { key: "compliance", label: TYPE_CONFIG.compliance },
  { key: "doc", label: TYPE_CONFIG.doc },
];

export function SkillsFilterBar({
  dept,
  onDeptChange,
  type,
  onTypeChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
  deptCounts,
  typeCounts,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* 第一行：搜索 + 上传 CTA */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-[420px] max-w-[50%]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索 skill / 命令 / 作者"
            className="w-full h-9 pl-9 pr-9 rounded-md border border-ink-200 bg-white text-[12.5px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-ink-900 text-white text-[12px] font-medium hover:bg-ink-700 transition">
          <Plus className="w-3.5 h-3.5" />
          上传 Skill
        </button>
      </div>

      {/* 第二行：团队 Tab */}
      <div className="flex items-center gap-1 border-b border-ink-100 -mx-1 px-1">
        {DEPT_TABS.map((t) => {
          const active = dept === t.key;
          const count =
            t.key === "all"
              ? deptCounts._all
              : t.key === "subscribed"
                ? deptCounts._subscribed
                : deptCounts[t.key];
          // 部门色点
          const deptColor =
            t.key === "all" || t.key === "subscribed"
              ? null
              : DEPT_CONFIG[t.key as SkillDept].dot;
          return (
            <button
              key={t.key}
              onClick={() => onDeptChange(t.key)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-3 h-9 text-[13px] transition-colors",
                active
                  ? "text-ink-900 font-semibold"
                  : "text-ink-500 hover:text-ink-900",
              )}
            >
              {deptColor && (
                <span className={cn("w-1.5 h-1.5 rounded-full", deptColor)} />
              )}
              {t.label}
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded text-[10px] tabular-nums",
                  active ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-500",
                )}
              >
                {count ?? 0}
              </span>
              {active && (
                <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-ink-900 rounded-t" />
              )}
            </button>
          );
        })}
      </div>

      {/* 第三行：能力 chip + 排序 */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {TYPE_CHIPS.map((c) => {
            const active = type === c.key;
            const count =
              c.key === "all" ? typeCounts._all : typeCounts[c.key];
            if ((count ?? 0) === 0 && c.key !== "all") return null;
            return (
              <button
                key={c.key}
                onClick={() => onTypeChange(c.key)}
                className={cn(
                  "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11.5px] transition-colors border",
                  active
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-ink-600 border-ink-200 hover:border-ink-300 hover:text-ink-900",
                )}
              >
                {c.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      "tabular-nums text-[10px]",
                      active ? "text-white/80" : "text-ink-400",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 排序 */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11.5px] text-ink-400">排序</span>
          {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => {
            const active = sort === s;
            return (
              <button
                key={s}
                onClick={() => onSortChange(s)}
                className={cn(
                  "h-7 px-2 rounded text-[11.5px] transition-colors",
                  active
                    ? "bg-ink-100 text-ink-900 font-medium"
                    : "text-ink-500 hover:text-ink-900",
                )}
              >
                {SORT_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
