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

  const options: { key: TopicType; label: string }[] = [
    { key: "normal", label: "普通Topic" },
    { key: "department", label: "关联部门事项Topic" },
  ];

  return (
    <div className="flex items-center gap-8">
      <span className="shrink-0 w-14 text-[14px] leading-[21px] text-ink-900">
        话题类型
      </span>

      <div className="flex items-center gap-6 flex-wrap">
        {options.map((opt) => {
          const active = selected === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => update(opt.key)}
              className="group inline-flex items-center gap-1.5"
            >
              <span
                className={cn(
                  "shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors",
                  active
                    ? "border-brand-600"
                    : "border-ink-300 group-hover:border-ink-400",
                )}
              >
                {active && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                )}
              </span>
              <span
                className={cn(
                  "text-[14px] leading-[21px] transition-colors",
                  active ? "text-ink-900" : "text-ink-700",
                )}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
