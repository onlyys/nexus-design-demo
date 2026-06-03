"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import type { SkillBacklink } from "./types";
import { genAvatar } from "@/lib/utils";

/**
 * 详情页"反向引用" Tab
 *
 * 这是 Skill ↔ Topic 的"双向虫洞"在 UI 上的具象化：
 * 哪些 Topic 在它的内容里 @ 过这个 skill，自动沉淀成"用例画廊"。
 */
export function SkillBacklinkList({
  backlinks,
}: {
  backlinks: SkillBacklink[];
}) {
  if (backlinks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center">
        <Link2 className="w-6 h-6 text-ink-300 mx-auto mb-3" />
        <p className="text-[13px] text-ink-500 leading-relaxed">
          还没有任何 Topic 引用过这个 Skill。
          <br />
          当其它团队在 Topic 里 <code className="px-1 py-0.5 rounded bg-ink-100 text-ink-700 text-[11.5px]">@{}</code> 这个 skill 时，会自动汇集到这里。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold text-ink-900">
          被以下 Topic 复用过
        </h3>
        <span className="text-[11.5px] text-ink-400">
          共 {backlinks.length} 处引用
        </span>
      </div>

      <ul className="space-y-2">
        {backlinks.map((b, idx) => (
          <li
            key={idx}
            className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 hover:border-ink-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={genAvatar(b.authorHandle)}
                alt={b.authorHandle}
                className="w-7 h-7 rounded-full ring-1 ring-ink-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/topic/${b.topicId}`}
                    className="text-[13.5px] font-semibold text-ink-900 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
                  >
                    {b.topicTitle}
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                  {b.eventTitle && (
                    <>
                      <span className="text-ink-300">/</span>
                      <span className="text-[12px] text-ink-500 truncate">
                        {b.eventTitle}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-[12.5px] text-ink-600 leading-relaxed">
                  {b.excerpt}
                </p>
                <div className="mt-1.5 text-[11px] text-ink-400 tabular-nums">
                  @{b.authorHandle} · {b.usedAt}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
