"use client";

import * as React from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEAM_OPTIONS } from "@/components/sidebar/VisibilityPanel";
import { FloatingMenu } from "@/components/ui/FloatingMenu";
import { USER_DEPARTMENTS } from "@/lib/mock";

export type VisibilityMode = "all" | "dept" | "custom";

export interface VisibilityValue {
  mode: VisibilityMode;
  /** mode=custom 时的具体团队 id（多选） */
  customIds: string[];
  /** mode=dept 时实际指向的部门 id —— 用于发布回显 */
  deptId?: string;
}

interface TopicVisibilityFieldProps {
  /** 受控值 */
  value: VisibilityValue;
  onChange: (next: VisibilityValue) => void;
  /** 当前作者岗位所属部门 id —— 用于「仅本部门可见」时回显部门名 */
  authorDeptId?: string;
}

const MODE_OPTIONS: {
  key: VisibilityMode;
  label: string;
}[] = [
  { key: "all", label: "全员可见" },
  { key: "dept", label: "部门可见" },
  { key: "custom", label: "自定义" },
];

/** 把 customId 转成展示名（命中预设组织则取名，否则用原始文本） */
function customLabel(id: string): string {
  return TEAM_OPTIONS.find((t) => t.id === id)?.name ?? id;
}

/** 可见范围图标（Figma node 283:1859，eye 轮廓） */
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10.0001 15C14.6024 15 18.3334 10 18.3334 10C18.3334 10 14.6024 5 10.0001 5C5.39768 5 1.66672 10 1.66672 10C1.66672 10 5.39768 15 10.0001 15Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M10.0001 12.0835C11.1506 12.0835 12.0834 11.1508 12.0834 10.0002C12.0834 8.84962 11.1506 7.91687 10.0001 7.91687C8.84947 7.91687 7.91672 8.84962 7.91672 10.0002C7.91672 11.1508 8.84947 12.0835 10.0001 12.0835Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

/**
 * 可见范围（hover 下拉，三档单选 + 自定义输入）
 *
 * - 全员可见（默认）：所有组织都可见
 * - 部门可见：根据上方"发布岗位"选中的部门来定义"本部门"
 * - 自定义：下方出现输入框，回车添加可见组织 / 成员，chip 可删除
 */
export function TopicVisibilityField({
  value,
  onChange,
  authorDeptId,
}: TopicVisibilityFieldProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  // hover 展开；移出触发器/浮层后短延时关闭
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

  const setMode = (mode: VisibilityMode) => {
    onChange({ mode, customIds: value.customIds, deptId: authorDeptId });
    setOpen(false);
  };

  const triggerLabel =
    value.mode === "all"
      ? "全员可见"
      : value.mode === "dept"
        ? "部门可见"
        : "自定义";

  return (
    <div className="flex items-center gap-8">
      <span className="shrink-0 w-14 text-[14px] leading-[21px] text-ink-900">
        可见范围
      </span>

      <div className="relative">
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
          <EyeIcon className="w-5 h-5 text-ink-500 shrink-0" />
          <span className="truncate text-[14px] leading-[21px] text-ink-900">
            {triggerLabel}
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
          width={180}
          maxHeight={400}
          className="rounded-[12px]"
        >
          <div onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="py-1">
            {MODE_OPTIONS.map((opt) => {
              const active = value.mode === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setMode(opt.key)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] leading-[18px] transition-colors",
                    active ? "bg-brand-50/60" : "hover:bg-ink-50",
                  )}
                >
                  <Check
                    className={cn(
                      "w-3.5 h-3.5 shrink-0",
                      active ? "text-brand-600" : "text-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      active ? "text-brand-700 font-medium" : "text-ink-900",
                    )}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </FloatingMenu>
      </div>
    </div>
  );
}

/**
 * 自定义可见范围输入框 —— 渲染在「可见范围」行下方（mode=custom 时）。
 * 输入组织 / 成员名称回车添加，已添加项以 chip 展示，可删除。
 */
export function VisibilityCustomInput({
  value,
  onChange,
  authorDeptId,
}: TopicVisibilityFieldProps) {
  const [query, setQuery] = React.useState("");

  const addCustom = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    if (value.customIds.includes(name)) {
      setQuery("");
      return;
    }
    onChange({
      ...value,
      customIds: [...value.customIds, name],
      deptId: authorDeptId,
    });
    setQuery("");
  };

  const removeCustom = (id: string) => {
    onChange({
      ...value,
      customIds: value.customIds.filter((x) => x !== id),
      deptId: authorDeptId,
    });
  };

  return (
    <div className="flex items-start gap-8">
      <span className="shrink-0 w-14" aria-hidden />
      <div className="flex-1 min-w-0 max-w-[560px]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom(query);
            }
          }}
          placeholder="输入可见的组织 / 成员名称，回车添加"
          className="w-full px-3 py-2 rounded-[12px] border border-ink-200 bg-white text-[14px] leading-[21px] text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
        />
        {value.customIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {value.customIds.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 pl-3 pr-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200 text-[13px] tracking-[0.4px]"
              >
                {customLabel(id)}
                <button
                  type="button"
                  onClick={() => removeCustom(id)}
                  className="inline-flex items-center justify-center text-brand-500/70 hover:text-brand-600"
                  aria-label={`移除 ${customLabel(id)}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 把 VisibilityValue 转成"最终可见的组织 id 列表"（用于发布态展示）
 * - all: 返回全部 TEAM_OPTIONS
 * - dept: 返回与作者部门关联的团队子集（demo 中用部门 id 简单映射）
 * - custom: 返回 customIds
 */
export function resolveVisibility(
  value: VisibilityValue,
): { ids: string[]; label: string } {
  if (value.mode === "all") {
    return { ids: TEAM_OPTIONS.map((t) => t.id), label: "全员可见" };
  }
  if (value.mode === "dept") {
    const dept = USER_DEPARTMENTS.find((d) => d.id === value.deptId);
    return {
      ids: [], // 留空，发布态由 mode 自己渲染"仅本部门"
      label: dept ? `仅本部门：${dept.name}` : "仅本部门可见",
    };
  }
  return { ids: value.customIds, label: "自定义" };
}
