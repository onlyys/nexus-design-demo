"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Download, Users2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEPT_CONFIG,
  TYPE_CONFIG,
  type SkillItem,
} from "./types";

/**
 * 列表页 Skill 卡片
 *
 * 设计要点：
 * - 左上角竖色条：用部门主色（一眼分辨团队归属）
 * - 右上角部门 chip：明确出品团队
 * - 底部三行 stats：作者头像 / 安装次数 / 被复用次数
 * - hover 时整卡轻微上浮，右下角出现「打开」CTA
 */
export function SkillCard({ skill }: { skill: SkillItem }) {
  const dept = DEPT_CONFIG[skill.dept];

  return (
    <Link
      href={`/skills/${skill.id}`}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-white border-ink-200",
        "shadow-card hover:shadow-cardHover hover:border-ink-300",
        "transition-all duration-200 overflow-hidden",
      )}
    >
      {/* 左侧部门色条 */}
      <span className={cn("absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full", dept.dot)} />

      <div className="px-5 py-4 flex flex-col gap-2.5 flex-1">
        {/* 头部：标题 + 部门 chip */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-ink-900 leading-snug line-clamp-1 flex-1 min-w-0">
            {skill.name}
          </h3>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10.5px] font-medium",
              dept.chipBg,
              dept.chipText,
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", dept.dot)} />
            {dept.name}
          </span>
        </div>

        {/* 一句话简介 */}
        <p className="text-[12.5px] text-ink-500 leading-relaxed line-clamp-3">
          {skill.tagline}
        </p>

        {/* 能力 chip 行 */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {skill.types.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex items-center h-5 px-1.5 rounded bg-ink-50 border border-ink-100 text-[10.5px] text-ink-600"
            >
              {TYPE_CONFIG[t]}
            </span>
          ))}
        </div>
      </div>

      {/* 底部 meta */}
      <div className="px-5 py-3 border-t border-ink-100 flex items-center justify-between gap-3 bg-ink-50/40">
        <div className="flex items-center gap-2 min-w-0">
          {/* 作者头像堆叠（最多 3） */}
          <div className="flex -space-x-1.5 shrink-0">
            {skill.authors.slice(0, 3).map((a) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={a.id}
                src={a.avatar}
                alt={a.name}
                title={a.handle}
                className="w-5 h-5 rounded-full ring-2 ring-white object-cover"
              />
            ))}
          </div>
          <span className="text-[11.5px] text-ink-500 truncate">
            {skill.authors.map((a) => a.handle).join(" · ")}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-ink-400 tabular-nums shrink-0">
          <span className="inline-flex items-center gap-0.5">
            <Download className="w-3 h-3" />
            {skill.installs}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Layers className="w-3 h-3" />
            {skill.reuses}
          </span>
        </div>
      </div>

      {/* hover 时右上角出现「打开」icon */}
      <span className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
        <ArrowUpRight className="w-3.5 h-3.5 text-brand-600" />
      </span>
    </Link>
  );
}

/** 「探索更多」尾卡 */
export function SkillExploreMoreCard() {
  return (
    <a
      href="https://knot.tencent.com"
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-white",
        "hover:border-brand-400 hover:bg-brand-50/30 transition-colors px-5 py-10 text-center min-h-[200px]",
      )}
    >
      <div className="w-10 h-10 rounded-full bg-ink-100 group-hover:bg-brand-100 flex items-center justify-center mb-3 transition-colors">
        <Users2 className="w-5 h-5 text-ink-500 group-hover:text-brand-600 transition-colors" />
      </div>
      <h4 className="text-[14px] font-semibold text-ink-900">探索更多 Skills</h4>
      <p className="text-[11.5px] text-ink-500 mt-1.5 leading-relaxed">
        Knot 上沉淀了司内各种 Skills 技能包，去逛逛，
        <br />
        找安装感兴趣的，让工作更高效更智能。
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-[12px] text-brand-600 font-medium">
        前往 Knot
        <ArrowUpRight className="w-3.5 h-3.5" />
      </span>
    </a>
  );
}
