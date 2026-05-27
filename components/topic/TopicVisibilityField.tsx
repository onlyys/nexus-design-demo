"use client";

import * as React from "react";
import { ChevronDown, Check, Globe2, Building2, Users2 } from "lucide-react";
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
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[] = [
  {
    key: "all",
    label: "全员可见",
    desc: "所有组织都能看到",
    Icon: Globe2,
    tone: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    key: "dept",
    label: "仅本部门可见",
    desc: "仅作者所属部门成员可见",
    Icon: Building2,
    tone: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    key: "custom",
    label: "自定义范围",
    desc: "选择具体可见的组织",
    Icon: Users2,
    tone: "text-violet-600 bg-violet-50 border-violet-200",
  },
];

/**
 * 可见范围（三档单选 + 自定义多选）
 *
 * - 全员可见（默认）：所有组织都可见
 * - 仅本部门可见：根据上方"以此岗位发布"选中的部门来定义"本部门"
 * - 自定义范围：弹出下拉，多选具体可见的组织
 */
export function TopicVisibilityField({
  value,
  onChange,
  authorDeptId,
}: TopicVisibilityFieldProps) {
  const customTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [menuWidth, setMenuWidth] = React.useState<number | undefined>();

  React.useLayoutEffect(() => {
    if (!customOpen || !customTriggerRef.current) return;
    setMenuWidth(customTriggerRef.current.offsetWidth);
  }, [customOpen]);

  const setMode = (mode: VisibilityMode) => {
    if (mode === value.mode) return;
    if (mode === "custom") {
      // 切到自定义时，若之前没选过，默认选中作者所在部门关联的团队（这里取首项作为默认）
      onChange({
        mode,
        customIds:
          value.customIds.length > 0
            ? value.customIds
            : [TEAM_OPTIONS[0].id],
        deptId: authorDeptId,
      });
    } else {
      onChange({ mode, customIds: value.customIds, deptId: authorDeptId });
    }
  };

  const toggleCustom = (id: string) => {
    const set = new Set(value.customIds);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    onChange({ ...value, customIds: Array.from(set), deptId: authorDeptId });
  };

  const dept = USER_DEPARTMENTS.find((d) => d.id === authorDeptId);

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[13.5px] font-semibold text-ink-900">
          可见范围
        </span>
        <span className="text-rose-500 text-[12px]">*</span>
        <span className="text-[11.5px] text-ink-400">
          选择此 Topic 对哪些组织 / 人员可见
        </span>
      </div>

      {/* 三档单选 chip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {MODE_OPTIONS.map((opt) => {
          const active = value.mode === opt.key;
          const Icon = opt.Icon;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setMode(opt.key)}
              className={cn(
                "text-left rounded-md border bg-white px-3 py-2.5 transition-all",
                "flex items-start gap-2",
                active
                  ? "border-brand-500 ring-2 ring-brand-100 shadow-[0_2px_4px_rgba(99,102,241,0.08)]"
                  : "border-ink-200 hover:border-ink-300",
              )}
            >
              <div
                className={cn(
                  "shrink-0 w-7 h-7 rounded-md inline-flex items-center justify-center border",
                  opt.tone,
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                      active
                        ? "border-brand-500 bg-brand-500"
                        : "border-ink-300 bg-white",
                    )}
                  >
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-[12.5px] font-semibold text-ink-900">
                    {opt.label}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-ink-500 leading-relaxed">
                  {opt.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 仅本部门：展示当前部门名 */}
      {value.mode === "dept" && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50/60 border border-blue-200 text-[12px] text-blue-700">
          <Building2 className="w-3.5 h-3.5" />
          {dept ? dept.name : "（请先在上方选择岗位部门）"}
        </div>
      )}

      {/* 自定义：展开多选下拉 */}
      {value.mode === "custom" && (
        <div className="mt-2.5">
          <button
            ref={customTriggerRef}
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            className={cn(
              "w-full min-h-[34px] px-3 py-1.5 flex items-center justify-between gap-2 rounded-md border bg-white transition-colors text-left",
              customOpen
                ? "border-violet-500 ring-2 ring-violet-100"
                : "border-ink-200 hover:border-ink-300",
            )}
          >
            {value.customIds.length === 0 ? (
              <span className="text-[12.5px] text-ink-400">
                未选择任何组织
              </span>
            ) : (
              <span className="flex flex-wrap items-center gap-1 text-[12.5px] text-ink-700">
                已选{" "}
                <span className="font-semibold text-violet-600">
                  {value.customIds.length}
                </span>{" "}
                个：
                {value.customIds.slice(0, 3).map((id) => {
                  const t = TEAM_OPTIONS.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-100 text-violet-700"
                    >
                      <span>{t.emoji}</span>
                      <span>{t.name}</span>
                    </span>
                  );
                })}
                {value.customIds.length > 3 && (
                  <span className="text-ink-400">
                    +{value.customIds.length - 3}
                  </span>
                )}
              </span>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 text-ink-400 shrink-0 transition-transform",
                customOpen && "rotate-180",
              )}
            />
          </button>

          <FloatingMenu
            open={customOpen}
            onClose={() => setCustomOpen(false)}
            anchorRef={customTriggerRef}
            align="start"
            width={menuWidth}
            maxHeight={320}
            className="py-1"
          >
            <div className="px-3 pt-1.5 pb-1 flex items-center justify-between">
              <span className="text-[11px] text-ink-400">
                勾选可见组织 · 至少选 1 个
              </span>
              <button
                onClick={() =>
                  onChange({
                    ...value,
                    customIds: TEAM_OPTIONS.map((t) => t.id),
                  })
                }
                className="text-[11px] text-violet-600 hover:text-violet-700"
              >
                全选
              </button>
            </div>
            <div className="h-px bg-ink-100 mx-2 my-1" />
            {TEAM_OPTIONS.map((t) => {
              const checked = value.customIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleCustom(t.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                    checked
                      ? "text-ink-800 hover:bg-violet-50/40"
                      : "text-ink-500 hover:bg-ink-50",
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      checked
                        ? "border-violet-500 bg-violet-500 text-white"
                        : "border-ink-300 bg-white",
                    )}
                  >
                    {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                  </span>
                  <span className="text-[14px] leading-none">{t.emoji}</span>
                  <span className="flex-1 text-[12.5px]">{t.name}</span>
                </button>
              );
            })}
          </FloatingMenu>
        </div>
      )}
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
