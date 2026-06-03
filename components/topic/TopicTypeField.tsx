"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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

  const options: { key: TopicType; label: string; desc: string }[] = [
    {
      key: "department",
      label: "关联部门事项主题",
      desc: "对齐组织目标",
    },
    {
      key: "normal",
      label: "普通主题",
      desc: "常规发布",
    },
  ];

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[13.5px] font-semibold text-ink-900">主题类型</span>
        <span className="text-[12px] text-ink-400">选择发布性质</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {options.map((opt) => {
          const active = selected === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => update(opt.key)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-[12.5px] transition-all whitespace-nowrap",
                active
                  ? "border-brand-300 bg-brand-50 text-brand-700 ring-1 ring-brand-200 font-medium"
                  : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50 hover:border-ink-300",
              )}
            >
              <span>{opt.label}</span>
              <span
                className={cn(
                  "text-[11px]",
                  active ? "text-brand-500" : "text-ink-400",
                )}
              >
                · {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
