"use client";

import * as React from "react";
import { Briefcase, Building2, Globe2, Users2 } from "lucide-react";
import type { PublishedTopic } from "./types";
import { TEAM_OPTIONS } from "@/components/sidebar/VisibilityPanel";
import { USER_DEPARTMENTS } from "@/lib/mock";

interface TopicMetaProps {
  topic: PublishedTopic;
  /** 作者视角下额外展示「可见范围」「关联关键策略」回显，默认 false */
  authorView?: boolean;
}

/**
 * Topic 头部「作者 / 发布岗位 / 发布时间 / 标签 / 可见范围（作者视角） / 关联关键策略」只读展示
 *
 * 改造点：
 * - 作者下方新增「以此岗位发布」展示（authorRoleDeptId）
 * - 可见范围按 visibilityMode 三档分别展示（全员 / 仅本部门 / 自定义）
 */
export function TopicMeta({ topic, authorView = false }: TopicMetaProps) {
  // 关联关键策略回显
  const linkedStrategy = React.useMemo(() => {
    if (!topic.keyStrategy?.strategyId) return null;
    const dept = USER_DEPARTMENTS.find(
      (d) => d.id === topic.keyStrategy?.departmentId,
    );
    if (!dept) return null;
    for (const g of dept.goals) {
      const s = g.strategies.find((x) => x.id === topic.keyStrategy?.strategyId);
      if (s) {
        return { dept, goal: g, strategy: s };
      }
    }
    return null;
  }, [topic.keyStrategy]);

  // 发布岗位部门
  const roleDept = React.useMemo(
    () => USER_DEPARTMENTS.find((d) => d.id === topic.authorRoleDeptId),
    [topic.authorRoleDeptId],
  );

  return (
    <div className="space-y-3">
      {/* 作者 */}
      <Row label="作者">
        <div className="flex items-center gap-1.5 flex-wrap">
          {topic.authors.map((u, idx) => (
            <span
              key={u.id}
              className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full border ${
                idx === 0
                  ? "border-brand-200 bg-brand-50/50"
                  : "border-ink-200 bg-white"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.avatar}
                alt={u.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-ink-200"
              />
              <span className="text-[12.5px] text-ink-900 font-medium leading-none">
                {u.name}
              </span>
              {idx === 0 && (
                <span className="ml-0.5 inline-flex items-center px-1 py-px rounded-sm bg-brand-100 text-brand-700 text-[10px] leading-none">
                  发布者
                </span>
              )}
            </span>
          ))}
        </div>
      </Row>

      {/* 发布岗位 */}
      {roleDept && (
        <Row label="发布岗位">
          <div className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-700">
            <Briefcase className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span>{roleDept.path}</span>
          </div>
        </Row>
      )}

      {/* 发布时间 */}
      <Row label="发布于">
        <div className="text-[12.5px] text-ink-700 leading-[22px]">
          <span className="tabular-nums">{topic.publishedAt}</span>
        </div>
      </Row>

      {/* 标签 */}
      {topic.tags.length > 0 && (
        <Row label="标签">
          <div className="flex flex-wrap gap-1.5">
            {topic.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] bg-brand-50 text-brand-700 border border-brand-200"
              >
                {t}
              </span>
            ))}
          </div>
        </Row>
      )}

      {/* 关联关键策略 */}
      {linkedStrategy && (
        <Row label="关键策略">
          <div className="flex items-center gap-2 flex-wrap text-[12.5px]">
            <span className="text-ink-800">{linkedStrategy.strategy.title}</span>
            <span className="text-ink-400">@{linkedStrategy.strategy.owner}</span>
          </div>
        </Row>
      )}

      {/* 可见范围（仅作者视角） */}
      {authorView && (
        <Row label="可见范围">
          <VisibilityDisplay topic={topic} />
        </Row>
      )}
    </div>
  );
}

function VisibilityDisplay({ topic }: { topic: PublishedTopic }) {
  const mode = topic.visibilityMode ?? "all";
  const dept = USER_DEPARTMENTS.find((d) => d.id === topic.authorRoleDeptId);

  if (mode === "all") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12.5px]">
        <Globe2 className="w-3.5 h-3.5" />
        全员可见
      </span>
    );
  }
  if (mode === "dept") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[12.5px]">
        <Building2 className="w-3.5 h-3.5" />
        仅本部门可见
        {dept && <span className="text-blue-500">· {dept.name}</span>}
      </span>
    );
  }
  // custom
  const list = (topic.visibility ?? [])
    .map((id) => TEAM_OPTIONS.find((t) => t.id === id))
    .filter(Boolean) as typeof TEAM_OPTIONS;
  return (
    <div className="flex items-center gap-2 flex-wrap text-[12.5px]">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700">
        <Users2 className="w-3.5 h-3.5" />
        自定义范围
      </span>
      <div className="flex flex-wrap gap-1.5">
        {list.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-ink-100 text-ink-700 border border-ink-200"
          >
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-[60px] pt-1 text-[12.5px] text-ink-500 select-none">
        {label}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
