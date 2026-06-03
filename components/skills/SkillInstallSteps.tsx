"use client";

import * as React from "react";
import { Download, Terminal, Puzzle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillInstallChannel } from "./types";

const KIND_META: Record<
  SkillInstallChannel["kind"],
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  download: { icon: Download, tone: "from-blue-500 to-blue-600" },
  command: { icon: Terminal, tone: "from-violet-500 to-violet-600" },
  extension: { icon: Puzzle, tone: "from-emerald-500 to-emerald-600" },
};

/**
 * 详情页"下载使用" Tab：
 * - 顶部三大安装入口卡片（下载 / 命令 / 扩展）
 * - 命令卡片支持点击复制
 * - 底部 Quick Start 三步走时间线
 */
export function SkillInstallSteps({
  channels,
  quickStart,
}: {
  channels: SkillInstallChannel[];
  quickStart: string[];
}) {
  return (
    <div className="space-y-8">
      {/* 安装入口卡片网格 */}
      <div>
        <h3 className="text-[15px] font-semibold text-ink-900 mb-3">
          安装方式
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {channels.map((c, idx) => (
            <InstallChannelCard key={idx} channel={c} />
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div>
        <h3 className="text-[15px] font-semibold text-ink-900 mb-3">
          Quick Start
        </h3>
        <div className="rounded-xl border border-ink-200 bg-white">
          <ol className="divide-y divide-ink-100">
            {quickStart.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 px-4 py-3">
                <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink-900 text-white text-[11px] font-semibold tabular-nums mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[13px] text-ink-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function InstallChannelCard({ channel }: { channel: SkillInstallChannel }) {
  const Meta = KIND_META[channel.kind];
  const Icon = Meta.icon;
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    if (!channel.payload) return;
    try {
      await navigator.clipboard.writeText(channel.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={cn(
        "group rounded-xl border border-ink-200 bg-white overflow-hidden",
        "hover:border-ink-300 hover:shadow-cardHover transition-all",
      )}
    >
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div
          className={cn(
            "shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br text-white flex items-center justify-center",
            Meta.tone,
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900">
            {channel.label}
          </div>
          {channel.hint && (
            <div className="text-[11.5px] text-ink-500 mt-0.5 truncate">
              {channel.hint}
            </div>
          )}
        </div>
        {channel.kind === "command" ? (
          <button
            onClick={onCopy}
            className={cn(
              "inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11.5px] transition-colors border",
              copied
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900",
            )}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                复制
              </>
            )}
          </button>
        ) : (
          <button className="inline-flex items-center h-7 px-2.5 rounded-md bg-ink-900 text-white text-[11.5px] hover:bg-ink-700 transition-colors">
            执行
          </button>
        )}
      </div>
      {channel.payload && (
        <pre className="bg-ink-900/95 text-[12px] text-ink-100 px-4 py-2.5 overflow-x-auto font-mono">
          <span className="text-ink-400 select-none">$ </span>
          {channel.payload}
        </pre>
      )}
    </div>
  );
}
