"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Sparkles, Send, FlaskConical, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 顶栏右侧的 demo 切换器
 *
 * 顺序（从左到右）：
 * - 空白 demo v1（/blank）—— 旧版导入区
 * - 空白 demo v2（/v2）—— 新版一体化导入与解析
 * - 示例 demo（/）—— 已编辑示例（与 v2 共享导入模块）
 * - 发布后（/topic/demo）—— 发布态展示
 * - Skills（/skills）—— 技能广场（重构 demo）
 */
export function DemoSwitcher({
  current,
}: {
  current: "blank" | "v2" | "filled" | "published" | "skills";
}) {
  const items: {
    href: string;
    key: typeof current;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: string;
  }[] = [
    { href: "/blank", key: "blank", icon: FileText, label: "空白 v1" },
    {
      href: "/v2",
      key: "v2",
      icon: FlaskConical,
      label: "空白 v2",
    },
    { href: "/", key: "filled", icon: Sparkles, label: "示例 demo" },
    { href: "/topic/demo", key: "published", icon: Send, label: "发布后" },
    {
      href: "/skills",
      key: "skills",
      icon: Wrench,
      label: "Skills",
      badge: "NEW",
    },
  ];

  return (
    <div className="hidden md:inline-flex items-center gap-1 p-0.5 rounded-md border border-ink-200 bg-white text-[11.5px]">
      {items.map((it) => {
        const Icon = it.icon;
        const active = it.key === current;
        return (
          <Link
            key={it.key}
            href={it.href}
            className={cn(
              "px-2.5 py-1 rounded inline-flex items-center gap-1 transition-colors",
              active
                ? "bg-ink-900 text-white"
                : "text-ink-600 hover:text-ink-900 hover:bg-ink-100",
            )}
          >
            <Icon className="w-3 h-3" />
            {it.label}
            {it.badge && (
              <span
                className={cn(
                  "ml-0.5 inline-flex items-center px-1 py-px rounded-sm text-[9px] font-bold leading-none",
                  active
                    ? "bg-white text-ink-900"
                    : "bg-ai-50 text-ai-700 border border-ai-100",
                )}
              >
                {it.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
