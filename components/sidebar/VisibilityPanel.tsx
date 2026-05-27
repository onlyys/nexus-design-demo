"use client";

import * as React from "react";
import { CardSection } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface TeamOption {
  id: string;
  name: string;
  /** Emoji 作为团队图标 */
  emoji: string;
  /** Chip 选中态主色 */
  tint: string;
}

export const TEAM_OPTIONS: TeamOption[] = [
  { id: "edu", name: "教育实验室", emoji: "📚", tint: "#16A34A" },
  { id: "welfare", name: "公益平台", emoji: "💚", tint: "#15803D" },
  { id: "culture", name: "文化实验室", emoji: "🎭", tint: "#DC2626" },
  { id: "time", name: "时光实验室", emoji: "⏰", tint: "#B45309" },
  { id: "newstone", name: "新基石", emoji: "🔬", tint: "#0F766E" },
  { id: "tech", name: "技术架构部", emoji: "⚙️", tint: "#475569" },
];

interface VisibilityBodyProps {
  onChange?: (selected: string[]) => void;
}

export function VisibilityBody({ onChange }: VisibilityBodyProps) {
  const [selected, setSelected] = React.useState<string[]>(["edu"]);

  React.useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {TEAM_OPTIONS.map((team) => {
          const checked = selected.includes(team.id);
          return (
            <button
              key={team.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(team.id)}
              className={cn(
                "group inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full border text-[12.5px] font-medium transition-all",
                checked
                  ? "border-transparent shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50/70",
              )}
              style={
                checked
                  ? {
                      backgroundColor: `${team.tint}14`,
                      color: team.tint,
                      boxShadow: `inset 0 0 0 1px ${team.tint}33`,
                    }
                  : undefined
              }
            >
              <span className="text-[14px] leading-none">{team.emoji}</span>
              <span className="text-ink-400 font-normal" style={checked ? { color: `${team.tint}99` } : undefined}>
                #
              </span>
              <span>{team.name}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11.5px] text-ink-400 leading-relaxed">
        可选择 1 个或多个团队，被选中的团队成员将拥有该笔记的查看权限。
      </p>
    </div>
  );
}

export function VisibilityPanel() {
  return (
    <CardSection title="可见范围">
      <VisibilityBody />
    </CardSection>
  );
}
