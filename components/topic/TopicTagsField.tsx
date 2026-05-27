"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RECOMMENDED_TAGS, TAG_ICONS } from "@/lib/mock";

interface TopicTagsFieldProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
}

/**
 * Nexus 1.0 风格的标签字段：
 * 标题「标签」+ 灰字副标题「可多选，不选默认无标签」
 * 横向 chip 列表：已选 chip 浅紫填充；推荐 chip 浅灰胶囊；点击切换
 *
 * 支持受控（传入 value + onChange）/ 非受控（仅 onChange）两种模式。
 */
export function TopicTagsField({ value, onChange }: TopicTagsFieldProps) {
  const isControlled = Array.isArray(value);
  const [inner, setInner] = React.useState<string[]>(value ?? []);
  const tags = isControlled ? (value as string[]) : inner;
  const max = 5;

  const update = (next: string[]) => {
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  const toggle = (t: string) => {
    if (tags.includes(t)) {
      update(tags.filter((x) => x !== t));
      return;
    }
    if (tags.length >= max) return;
    update([...tags, t]);
  };

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[13.5px] font-semibold text-ink-900">标签</span>
        <span className="text-[12px] text-ink-400">
          可多选，不选默认无标签
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {RECOMMENDED_TAGS.map((t) => {
          const active = tags.includes(t);
          const disabled = !active && tags.length >= max;
          const icon = TAG_ICONS[t];
          return (
            <button
              key={t}
              onClick={() => !disabled && toggle(t)}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12.5px] transition-colors",
                active
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200 border border-transparent",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {icon && <span className="text-[12.5px] leading-none">{icon}</span>}
              <span>{t}</span>
              {active && <X className="w-3 h-3 text-brand-500/80" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
