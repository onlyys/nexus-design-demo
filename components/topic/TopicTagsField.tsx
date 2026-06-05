"use client";

import * as React from "react";
import { Tag, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RECOMMENDED_TAGS } from "@/lib/mock";
import { FloatingMenu } from "@/components/ui/FloatingMenu";

interface TopicTagsFieldProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
}

/**
 * 话题标签字段（Figma 版）：
 * 左侧「话题标签」标签 + 「选择标签」胶囊触发器；
 * 点击展开浮层标签选择器（白卡 + 圆角 16 + 阴影），标签胶囊横向 wrap；
 * 已选标签以品牌色胶囊回显在触发器前，可点 X 取消。
 *
 * 支持受控（传入 value + onChange）/ 非受控（仅 onChange）两种模式。
 */
export function TopicTagsField({ value, onChange }: TopicTagsFieldProps) {
  const isControlled = Array.isArray(value);
  const [inner, setInner] = React.useState<string[]>(value ?? []);
  const tags = isControlled ? (value as string[]) : inner;
  const max = 5;

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  // hover 展开：移入触发器/浮层保持打开，移出后短延时关闭（容忍指针穿过间隙）
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  const handleEnter = React.useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);
  const handleLeave = React.useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, [cancelClose]);
  React.useEffect(() => () => cancelClose(), [cancelClose]);

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
    <div className="flex items-center gap-8">
      <span className="shrink-0 w-14 text-[14px] leading-[21px] text-ink-900">
        话题标签
      </span>

      <div className="relative flex items-center gap-1.5 flex-wrap">
        {/* 已选标签回显 */}
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[13px] tracking-[0.4px] bg-brand-50 text-brand-600 border border-brand-200"
          >
            {t}
            <button
              type="button"
              onClick={() => toggle(t)}
              className="inline-flex items-center justify-center -mr-1 text-brand-500/70 hover:text-brand-600"
              aria-label={`移除标签 ${t}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* 选择标签触发器（hover 展开） */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={cn(
            "inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full transition-colors max-w-full",
            open ? "bg-ink-100" : "bg-white hover:bg-ink-100",
          )}
        >
          <Tag className="w-5 h-5 text-ink-500 shrink-0" />
          <span className="truncate text-[14px] leading-[21px] text-ink-900">
            选择标签
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-ink-400 shrink-0 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <FloatingMenu
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={triggerRef}
          align="start"
          offset={4}
          maxHeight={320}
          className="rounded-[16px] border-ink-100"
        >
          <div
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className="p-4 grid grid-cols-4 gap-x-2 gap-y-3"
          >
            {RECOMMENDED_TAGS.map((t) => {
              const active = tags.includes(t);
              const disabled = !active && tags.length >= max;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => !disabled && toggle(t)}
                  disabled={disabled}
                  className={cn(
                    "px-4 py-0.5 rounded-full text-[13px] text-center tracking-[0.4px] transition-colors",
                    active
                      ? "bg-brand-50 text-brand-600 border border-brand-200"
                      : "bg-ink-100 text-ink-400 hover:bg-ink-200 border border-transparent",
                    disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </FloatingMenu>
      </div>
    </div>
  );
}
