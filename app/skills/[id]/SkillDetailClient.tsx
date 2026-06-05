"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Copy,
  Star,
  Bell,
  Share2,
  Check,
  Sparkles,
  History,
  Link2,
  BookOpen,
  GitBranch,
  Layers3,
  Hash,
  Calendar,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import { SkillCapabilityCard } from "@/components/skills/SkillCapabilityCard";
import { SkillInstallSteps } from "@/components/skills/SkillInstallSteps";
import { SkillUpdateTimeline } from "@/components/skills/SkillUpdateTimeline";
import { SkillBacklinkList } from "@/components/skills/SkillBacklinkList";
import { getSkillById, MOCK_SKILLS } from "@/components/skills/mockSkills";
import {
  DEPT_CONFIG,
  TYPE_CONFIG,
  type SkillItem,
} from "@/components/skills/types";

type Tab = "overview" | "install" | "changelog" | "backlinks";

/**
 * Skill 详情页 · /skills/[id]
 *
 * 设计前提：Skill 本质上是一种特殊的 Topic
 *  - Hero = TopicHeader（标题 / 作者 / 元信息）
 *  - 概览 = TopicMeta + Capability 网格
 *  - 下载使用 = 安装入口 + Quick Start
 *  - 更新日志 = Topic 的 Event 流的"只读垂直时间线"
 *  - 反向引用 = Skill ↔ Topic 双向虫洞的"沉淀面"
 *  - 右栏复用 AI 洞察的视觉 / 心智，挂"用法建议"
 */
export default function SkillDetailPage() {
  const params = useParams<{ id: string }>();
  const skill = getSkillById(params.id);

  if (!skill) {
    notFound();
  }

  return <SkillDetailView skill={skill} />;
}

function SkillDetailView({ skill }: { skill: SkillItem }) {
  const dept = DEPT_CONFIG[skill.dept];
  const [tab, setTab] = React.useState<Tab>("overview");
  const [subscribed, setSubscribed] = React.useState(false);
  const [favorited, setFavorited] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const cmdInstall = skill.install.find((c) => c.kind === "command");
  const dlInstall = skill.install.find((c) => c.kind === "download");

  const onCopyCmd = async () => {
    if (!cmdInstall?.payload) return;
    try {
      await navigator.clipboard.writeText(cmdInstall.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const tabs: Array<{
    key: Tab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { key: "overview", label: "概览", icon: BookOpen },
    { key: "install", label: "下载使用", icon: Download },
    {
      key: "changelog",
      label: "更新日志",
      icon: History,
      badge: skill.updates.length,
    },
    {
      key: "backlinks",
      label: "反向引用",
      icon: Link2,
      badge: skill.backlinks.length,
    },
  ];

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
        <div className="shrink-0 h-full">
          <Sidebar active="skills" />
        </div>

        {/* 中间主区 */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          <div className="max-w-[1100px] mx-auto px-8 py-6">
            {/* 返回 */}
            <div className="mb-3">
              <Link
                href="/skills"
                className="inline-flex items-center gap-1 text-[12.5px] text-ink-500 hover:text-ink-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回 Skills
              </Link>
            </div>

            {/* —— Hero —— */}
            <section
              className={cn(
                "relative rounded-2xl border bg-white overflow-hidden",
                "border-ink-200",
              )}
            >
              {/* 顶部部门色条 */}
              <span
                className={cn(
                  "absolute left-0 right-0 top-0 h-[3px]",
                  dept.dot,
                )}
              />

              <div className="px-7 pt-7 pb-6">
                {/* 部门 chip + Skill type 类型 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11.5px] font-medium",
                      dept.chipBg,
                      dept.chipText,
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", dept.dot)} />
                    {dept.name}
                  </span>
                  {skill.types.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center h-6 px-2 rounded-md bg-ink-50 border border-ink-100 text-[11.5px] text-ink-600"
                    >
                      {TYPE_CONFIG[t]}
                    </span>
                  ))}
                  {skill.scenarios.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center h-6 px-2 rounded-md bg-white border border-ink-200 text-[11.5px] text-ink-500"
                    >
                      # {s}
                    </span>
                  ))}
                </div>

                {/* 标题 */}
                <h1 className="mt-3 text-[28px] font-bold tracking-tight text-ink-900 leading-[1.2]">
                  {skill.name}
                </h1>

                {/* 副标题 */}
                <p className="mt-2 text-[14px] text-ink-500 leading-relaxed max-w-[780px]">
                  {skill.tagline}
                </p>

                {/* 元信息行 */}
                <div className="mt-4 flex items-center gap-5 flex-wrap text-[12.5px] text-ink-600">
                  {/* 作者 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-ink-400 inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      作者
                    </span>
                    <div className="flex -space-x-1.5 shrink-0">
                      {skill.authors.map((a) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={a.id}
                          src={a.avatar}
                          alt={a.name}
                          title={a.handle}
                          className="w-6 h-6 rounded-full ring-2 ring-white object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-ink-700 truncate">
                      {skill.authors
                        .map((a) => `@${a.handle}`)
                        .join(" · ")}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-ink-400" />
                    <code className="font-mono text-[12px] text-ink-700">
                      {skill.version}
                    </code>
                  </span>

                  <span className="inline-flex items-center gap-1 text-ink-400">
                    <Calendar className="w-3.5 h-3.5" />
                    更新于 {skill.updatedAt}
                  </span>

                  <span className="inline-flex items-center gap-1 text-ink-400">
                    <Download className="w-3.5 h-3.5" />
                    {skill.installs} 次安装
                  </span>

                  <span className="inline-flex items-center gap-1 text-ink-400">
                    <Layers3 className="w-3.5 h-3.5" />
                    被 {skill.reuses} 个 Topic 复用
                  </span>
                </div>

                {/* CTA 按钮组 */}
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  {dlInstall && (
                    <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-ink-900 text-white text-[13px] font-medium hover:bg-ink-700 transition-colors shadow-card">
                      <Download className="w-3.5 h-3.5" />
                      下载安装包
                      {dlInstall.hint && (
                        <span className="text-ink-300 text-[11px] font-normal ml-1">
                          {dlInstall.hint}
                        </span>
                      )}
                    </button>
                  )}
                  {cmdInstall && (
                    <button
                      onClick={onCopyCmd}
                      className={cn(
                        "inline-flex items-center gap-1.5 h-9 px-4 rounded-md border text-[13px] font-medium transition-colors",
                        copied
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-white border-ink-200 text-ink-700 hover:border-ink-300 hover:text-ink-900",
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          已复制安装命令
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          一键复制安装
                        </>
                      )}
                    </button>
                  )}
                  <div className="ml-1 flex items-center gap-1">
                    <IconBtn
                      active={subscribed}
                      onClick={() => setSubscribed((v) => !v)}
                      icon={<Bell className="w-3.5 h-3.5" />}
                      label={subscribed ? "已订阅更新" : "订阅更新"}
                      activeTone="brand"
                    />
                    <IconBtn
                      active={favorited}
                      onClick={() => setFavorited((v) => !v)}
                      icon={
                        <Star
                          className={cn(
                            "w-3.5 h-3.5",
                            favorited && "fill-amber-500 text-amber-500",
                          )}
                        />
                      }
                      label={favorited ? "已收藏" : "收藏"}
                      activeTone="amber"
                    />
                    <IconBtn
                      icon={<Share2 className="w-3.5 h-3.5" />}
                      label="分享"
                    />
                  </div>
                </div>
              </div>

              {/* 命令预览（如果有命令安装） */}
              {cmdInstall?.payload && (
                <div className="bg-ink-900 px-7 py-3 flex items-center justify-between">
                  <pre className="text-[12px] text-ink-100 font-mono overflow-x-auto">
                    <span className="text-ink-400 select-none">$ </span>
                    {cmdInstall.payload}
                  </pre>
                  <button
                    onClick={onCopyCmd}
                    className="ml-3 shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] text-ink-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    复制
                  </button>
                </div>
              )}
            </section>

            {/* —— Tab —— */}
            <div className="mt-5 border-b border-ink-200">
              <div className="flex items-center gap-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "relative inline-flex items-center gap-1.5 h-10 px-4 text-[13px] transition-colors",
                        active
                          ? "text-ink-900 font-semibold"
                          : "text-ink-500 hover:text-ink-900",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                      {t.badge !== undefined && t.badge > 0 && (
                        <span
                          className={cn(
                            "inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] tabular-nums",
                            active
                              ? "bg-brand-100 text-brand-700"
                              : "bg-ink-100 text-ink-500",
                          )}
                        >
                          {t.badge}
                        </span>
                      )}
                      {active && (
                        <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-ink-900 rounded-t" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* —— Tab 内容 —— */}
            <div className="mt-5">
              {tab === "overview" && <OverviewTab skill={skill} />}
              {tab === "install" && (
                <SkillInstallSteps
                  channels={skill.install}
                  quickStart={skill.quickStart}
                />
              )}
              {tab === "changelog" && (
                <SkillUpdateTimeline updates={skill.updates} />
              )}
              {tab === "backlinks" && (
                <SkillBacklinkList backlinks={skill.backlinks} />
              )}
            </div>

            <div className="h-16" />
          </div>
        </main>

        {/* 右栏：用法建议 / Skill 与 Topic 关系（复用 AI 洞察的视觉调性） */}
        <aside className="shrink-0 h-full w-[340px] border-l border-ink-200 bg-white flex flex-col overflow-hidden">
          <div className="shrink-0 px-5 py-3.5 border-b border-ink-100 flex items-center gap-1.5">
            <Sparkles
              className="w-3.5 h-3.5 text-ai-600"
              strokeWidth={2.4}
            />
            <span className="text-[13px] font-semibold text-ink-900">
              在 Nexus 里怎么用
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
            <UsageHint
              icon={<Sparkles className="w-3.5 h-3.5" />}
              title="在 Topic 里召唤"
              desc={
                <>
                  写日报或周报时，输入
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-[11px]">
                    @{skill.id}
                  </code>
                  会插入一个 Skill Block，点击直接跳回这里。
                </>
              }
            />
            <UsageHint
              icon={<Bell className="w-3.5 h-3.5" />}
              title="订阅版本更新"
              desc="作者每发布一个新版本，会以 Event 形式出现在你的『最新动态』里——和 Topic 完全同一套订阅范式。"
            />
            <UsageHint
              icon={<Link2 className="w-3.5 h-3.5" />}
              title="反向溯源"
              desc="任何 Topic 用过这个 skill，都会被自动沉淀到「反向引用」标签页，作为活的 case 库。"
            />
            <UsageHint
              icon={<GitBranch className="w-3.5 h-3.5" />}
              title="Fork & 共建"
              desc="觉得这个 skill 离你的业务还差一点？可以 fork 出团队版本，与原版的更新继续合并。"
            />

            {/* 推荐相关 skill */}
            <RelatedSkills currentId={skill.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- 概览 Tab ---------------- */

function OverviewTab({ skill }: { skill: SkillItem }) {
  return (
    <div className="space-y-8">
      {/* 详细介绍 */}
      <section>
        <h3 className="text-[15px] font-semibold text-ink-900 mb-2">
          关于这个 Skill
        </h3>
        <p className="text-[13.5px] text-ink-700 leading-[1.8]">
          {skill.description}
        </p>
      </section>

      {/* 能做什么 */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-ink-900">能做什么？</h3>
          <span className="text-[11.5px] text-ink-400">
            点击截图查看示例 prompt
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skill.capabilities.map((cap) => (
            <SkillCapabilityCard key={cap.id} cap={cap} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- 右栏组件 ---------------- */

function UsageHint({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 w-7 h-7 rounded-md bg-ai-50 text-ai-700 inline-flex items-center justify-center mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[12.5px] font-semibold text-ink-900">{title}</h4>
        <p className="mt-1 text-[12px] text-ink-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function RelatedSkills({ currentId }: { currentId: string }) {
  const recs = React.useMemo(
    () => MOCK_SKILLS.filter((s) => s.id !== currentId).slice(0, 3),
    [currentId],
  );

  return (
    <div className="pt-3 border-t border-ink-100">
      <div className="text-[11px] font-semibold tracking-[0.08em] text-ink-400 mb-2">
        相关 SKILL
      </div>
      <ul className="space-y-1.5">
        {recs.map((s) => {
          const dept = DEPT_CONFIG[s.dept];
          return (
            <li key={s.id}>
              <Link
                href={`/skills/${s.id}`}
                className="group flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-ink-50 transition-colors"
              >
                <span
                  className={cn(
                    "shrink-0 mt-1 w-1.5 h-1.5 rounded-full",
                    dept.dot,
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium text-ink-900 group-hover:text-brand-600 truncate">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-ink-400 truncate">
                    {dept.name} · {s.installs} 安装
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function IconBtn({
  active,
  onClick,
  icon,
  label,
  activeTone,
}: {
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  activeTone?: "brand" | "amber";
}) {
  const activeClass =
    activeTone === "amber"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-brand-50 border-brand-200 text-brand-700";
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 h-9 px-2.5 rounded-md border text-[12.5px] transition-colors",
        active
          ? activeClass
          : "bg-white border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
