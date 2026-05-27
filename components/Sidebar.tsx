"use client";

import * as React from "react";
import {
  List,
  User2,
  Wrench,
  Puzzle,
  Compass,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const GROUPS: SidebarGroup[] = [
  {
    label: "TOPICS",
    items: [
      { key: "all", label: "ALL", icon: List },
      { key: "my", label: "MY", icon: User2 },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { key: "skills", label: "技能", icon: Wrench },
      { key: "plugins", label: "插件", icon: Puzzle },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { key: "locate", label: "定位", icon: Compass },
      { key: "manual", label: "宪章", icon: FileText },
      { key: "settings", label: "设置", icon: Settings },
    ],
  },
];

/**
 * 左侧极简侧导航（参照 Nexus 1.0）
 * - Topics / Tools / Admin 三个分组
 * - 当前 active：MY（发布页所属）
 */
export function Sidebar({ active = "my" }: { active?: string }) {
  return (
    <aside className="w-[200px] h-full shrink-0 border-r border-ink-200 bg-white flex flex-col">
      <div className="px-4 py-4 space-y-5 flex-1 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div className="px-2 mb-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-ink-400">
              {g.label}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const isActive = it.key === active;
                const Icon = it.icon;
                return (
                  <li key={it.key}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors",
                        isActive
                          ? "bg-ink-900 text-white"
                          : "text-ink-700 hover:bg-ink-100",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {it.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
