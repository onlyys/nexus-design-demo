"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Wrench, TrendingUp, Layers3 } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import { SkillCard, SkillExploreMoreCard } from "@/components/skills/SkillCard";
import {
  SkillsFilterBar,
  type SortMode,
} from "@/components/skills/SkillsFilterBar";
import { MOCK_SKILLS } from "@/components/skills/mockSkills";
import {
  DEPT_CONFIG,
  type SkillDept,
  type SkillType,
} from "@/components/skills/types";

/**
 * Skills 列表页 · /skills
 *
 * 重构要点（对照原 demo）：
 *  1. 多团队接入：顶部 Tab = 部门，二级 chip = 能力类型，互不耦合
 *  2. 卡片信息密度提升：左侧色条 / 部门 chip / 能力 chip / 作者头像 / 安装与复用 stats
 *  3. 顶部留出"科普位"：解释 Skill 在 Nexus 里的角色（订阅 / @ / 反向引用）
 *  4. 排序：最新 / 最热 / 最常被复用
 */
export default function SkillsListPage() {
  const [dept, setDept] = React.useState<SkillDept | "all" | "subscribed">(
    "all",
  );
  const [type, setType] = React.useState<SkillType | "all">("all");
  const [sort, setSort] = React.useState<SortMode>("latest");
  const [query, setQuery] = React.useState("");

  // mock：标记若干"我已订阅"的 skill（用于"我订阅的"Tab 演示）
  const subscribedIds = React.useMemo(
    () => new Set(["ssv-pongyi-design", "design-review", "ssv-aibuilder-deploy"]),
    [],
  );

  const deptCounts = React.useMemo(() => {
    const counts: Record<string, number> = { _all: MOCK_SKILLS.length };
    counts._subscribed = MOCK_SKILLS.filter((s) =>
      subscribedIds.has(s.id),
    ).length;
    for (const s of MOCK_SKILLS) {
      counts[s.dept] = (counts[s.dept] ?? 0) + 1;
    }
    return counts;
  }, [subscribedIds]);

  // 当前部门下的候选 skills（用于计算 type chip 计数）
  const inScopeSkills = React.useMemo(() => {
    return MOCK_SKILLS.filter((s) => {
      if (dept === "all") return true;
      if (dept === "subscribed") return subscribedIds.has(s.id);
      return s.dept === dept;
    });
  }, [dept, subscribedIds]);

  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = { _all: inScopeSkills.length };
    for (const s of inScopeSkills) {
      for (const t of s.types) {
        counts[t] = (counts[t] ?? 0) + 1;
      }
    }
    return counts;
  }, [inScopeSkills]);

  const filtered = React.useMemo(() => {
    let list = inScopeSkills;
    if (type !== "all") {
      list = list.filter((s) => s.types.includes(type));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((s) => {
        return (
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.authors.some(
            (a) =>
              a.handle.toLowerCase().includes(q) ||
              a.name.toLowerCase().includes(q),
          )
        );
      });
    }
    // 排序
    const sorted = [...list];
    if (sort === "latest") {
      sorted.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    } else if (sort === "hot") {
      sorted.sort((a, b) => b.installs - a.installs);
    } else {
      sorted.sort((a, b) => b.reuses - a.reuses);
    }
    return sorted;
  }, [inScopeSkills, type, sort, query]);

  return (
    <div className="h-screen bg-ink-50 flex flex-col overflow-hidden">
      <Header
        extra={
          <div className="flex items-center gap-3">
            <DemoSwitcher current="skills" />
          </div>
        }
      />
      <div className="flex-1 flex min-h-0">
        {/* 左侧主侧栏：active=skills */}
        <div className="shrink-0 h-full">
          <Sidebar active="skills" />
        </div>

        {/* 中间主区 */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-8 py-6">
            {/* —— 标题区 —— */}
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
                  Skills
                </h1>
                <p className="mt-1 text-[13px] text-ink-500">
                  SSV 内部能力组件与工具集 · 由各业务团队沉淀，可订阅、可在 Topic 里召唤。
                </p>
              </div>
              {/* 概览 stats */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <StatChip
                  icon={<Layers3 className="w-3 h-3" />}
                  label="技能总数"
                  value={MOCK_SKILLS.length}
                />
                <StatChip
                  icon={<TrendingUp className="w-3 h-3" />}
                  label="本月新增"
                  value={3}
                  tone="brand"
                />
                <StatChip
                  icon={<Sparkles className="w-3 h-3" />}
                  label="已订阅"
                  value={deptCounts._subscribed ?? 0}
                  tone="ai"
                />
              </div>
            </div>

            {/* —— Skill 在 Nexus 中的科普卡 —— */}
            <SkillsBanner />

            {/* —— 筛选条 —— */}
            <div className="mt-5">
              <SkillsFilterBar
                dept={dept}
                onDeptChange={setDept}
                type={type}
                onTypeChange={setType}
                sort={sort}
                onSortChange={setSort}
                query={query}
                onQueryChange={setQuery}
                deptCounts={deptCounts}
                typeCounts={typeCounts}
              />
            </div>

            {/* —— 卡片网格 —— */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((s) => (
                <SkillCard key={s.id} skill={s} />
              ))}
              <SkillExploreMoreCard />
            </div>

            {filtered.length === 0 && (
              <div className="mt-10 text-center py-12 rounded-xl border border-dashed border-ink-200 bg-white">
                <Wrench className="w-6 h-6 text-ink-300 mx-auto mb-2" />
                <p className="text-[13px] text-ink-500">
                  没找到符合条件的 Skill。试试别的关键词或切到「全部」？
                </p>
              </div>
            )}

            {/* 底部留白 */}
            <div className="h-16" />
          </div>
        </main>
      </div>
    </div>
  );
}

/** 顶部「Skill 在 Nexus 中怎么用」科普 banner */
function SkillsBanner() {
  return (
    <div className="mt-4 rounded-xl border border-ai-100 bg-gradient-to-br from-ai-50/70 via-white to-blue-50/50 px-5 py-4 flex items-start gap-4">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-ai-500 to-brand-600 text-white flex items-center justify-center">
        <Sparkles className="w-[18px] h-[18px]" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-ink-900">
          Skill = 可订阅、可召唤、可反向溯源的"上下文胶囊"
        </h3>
        <p className="mt-1 text-[12.5px] text-ink-500 leading-relaxed">
          每个 Skill 本身也是一个特殊 Topic：你可以
          <span className="text-ink-900 font-medium"> 订阅它的版本更新</span>、在任意 Topic 里
          <code className="mx-1 px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-[11.5px]">
            @skill
          </code>
          召唤、并能从详情页反向看到
          <span className="text-ink-900 font-medium"> 它被哪些 Topic 复用过</span>。
        </p>
        <div className="mt-2 flex items-center gap-3 flex-wrap text-[11.5px]">
          {Object.entries(DEPT_CONFIG).map(([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1 text-ink-500"
            >
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              {v.name}
            </span>
          ))}
        </div>
      </div>
      <Link
        href="/skills/ssv-pongyi-design"
        className="shrink-0 hidden md:inline-flex items-center gap-1 h-8 px-3 rounded-md border border-ink-200 bg-white text-[12px] text-ink-700 hover:border-ink-300 hover:text-ink-900 transition-colors"
      >
        看一个详情示例 →
      </Link>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "brand" | "ai";
}) {
  const colors =
    tone === "brand"
      ? "bg-brand-50 text-brand-700 border-brand-100"
      : tone === "ai"
        ? "bg-ai-50 text-ai-700 border-ai-100"
        : "bg-white text-ink-700 border-ink-200";
  return (
    <div
      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-[11.5px] tabular-nums ${colors}`}
    >
      {icon}
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
