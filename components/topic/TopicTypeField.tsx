"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Target, FileText } from "lucide-react";

export type TopicType = "normal" | "department";

interface TopicTypeFieldProps {
  value?: TopicType;
  onChange?: (type: TopicType) => void;
}

/**
 * Topic 类型选择器
 *
 * 放在标签上方，让用户先选择 Topic 性质：
 * - 普通 Topic：常规发布，无策略关联
 * - 关联部门事项：需要选择关联哪个部门的关键策略事项
 */
export function TopicTypeField({ value, onChange }: TopicTypeFieldProps) {
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState<TopicType>("normal");
  const selected = isControlled ? (value ?? "normal") : inner;

  const update = (t: TopicType) => {
    if (!isControlled) setInner(t);
    onChange?.(t);
  };

  const options: { key: TopicType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: "normal",
      label: "普通 Topic",
      desc: "常规发布，无需关联部门事项",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "department",
      label: "关联部门事项 Topic",
      desc: "关联具体部门的关键策略，对齐组织目标",
      icon: <Target className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-[13.5px] font-semibold text-ink-900">Topic 类型</span>
        <span className="text-[12px] text-ink-400">选择发布性质</span>
      </div>

      <div className="flex gap-2.5">
        {options.map((opt) => {
          const active = selected === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => update(opt.key)}
              className={cn(
                "flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border text-left transition-all",
                active
                  ? "border-brand-300 bg-brand-50/70 shadow-sm ring-1 ring-brand-200"
                  : "border-ink-200 bg-white hover:bg-ink-50 hover:border-ink-300",
              )}
            >
              <span
                className={cn(
                  "shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-md border transition-colors",
                  active
                    ? "border-brand-300 bg-brand-100 text-brand-700"
                    : "border-ink-200 bg-ink-50 text-ink-500",
                )}
              >
                {opt.icon}
              </span>
              <div>
                <div
                  className={cn(
                    "text-[13px] font-medium leading-tight",
                    active ? "text-brand-800" : "text-ink-900",
                  )}
                >
                  {opt.label}
                </div>
                <div className="text-[11.5px] text-ink-400 leading-snug mt-0.5 max-w-[180px]">
                  {opt.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
