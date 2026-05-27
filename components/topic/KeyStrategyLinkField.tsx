"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { USER_DEPARTMENTS, type Department } from "@/lib/mock";

interface KeyStrategyLinkFieldProps {
  /** 由外部「以此岗位发布」决定，必填 */
  departmentId: string;
  /** 当前选中的关键策略 id */
  strategyId?: string;
  onChange?: (next: { departmentId: string; strategyId?: string }) => void;
}

/**
 * 「关联到关键策略」选择面板
 *
 * 改造点：部门不再可在此处切换，而是跟随上方「以此岗位发布」字段联动。
 * 用户在岗位选择中切换部门 → 这里自动展示该部门的目标 / 关键策略列表。
 */
export function KeyStrategyLinkField({
  departmentId,
  strategyId,
  onChange,
}: KeyStrategyLinkFieldProps) {
  const dept: Department | undefined = React.useMemo(
    () => USER_DEPARTMENTS.find((d) => d.id === departmentId),
    [departmentId],
  );
  const [picked, setPicked] = React.useState<string | undefined>(strategyId);

  React.useEffect(() => setPicked(strategyId), [strategyId]);

  // 切换部门时，若当前选中的策略不属于新部门，则清空选择
  React.useEffect(() => {
    if (!dept) return;
    if (!picked) return;
    const stillExists = dept.goals.some((g) =>
      g.strategies.some((s) => s.id === picked),
    );
    if (!stillExists) {
      setPicked(undefined);
      onChange?.({ departmentId, strategyId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  const chooseStrategy = (sid: string) => {
    setPicked(sid);
    onChange?.({ departmentId, strategyId: sid });
  };

  if (!dept) {
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-ink-50/40 px-3 py-3 text-[12.5px] text-ink-500">
        请先在上方「以此岗位发布」选择一个部门，下方将列出该部门的关键策略。
      </div>
    );
  }

  return (
    <div className="animate-fadeUp">
      {/* 标题行 */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[13.5px] font-semibold text-ink-900">
          关联到关键策略
        </span>
        <span className="text-[12px] text-rose-500">*</span>
        <span className="text-[12px] text-ink-400">
          已根据所选岗位「{dept.name}」过滤
        </span>
      </div>

      {/* 目标 + 关键策略列表 */}
      <div className="space-y-2.5">
        {dept.goals.map((g) => (
          <div
            key={g.id}
            className="rounded-lg border border-ink-200 bg-ink-50/40 px-3 py-3"
          >
            {/* 目标行 */}
            <div className="flex items-center justify-between gap-2 px-1 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-ai-500 text-white text-[11.5px] font-medium">
                  目标 {g.index}
                </span>
                <span className="truncate text-[13px] font-semibold text-ink-900">
                  {g.title}
                </span>
              </div>
              <span className="shrink-0 text-[11.5px] text-ink-400">
                @{g.owner}
              </span>
            </div>

            {/* 关键策略行 */}
            <div className="space-y-1">
              {g.strategies.map((s) => {
                const active = picked === s.id;
                return (
                  <label
                    key={s.id}
                    className={cn(
                      "flex items-center justify-between gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors bg-white border",
                      active
                        ? "border-ai-500 ring-1 ring-ai-100"
                        : "border-ink-200 hover:bg-ai-50/40 hover:border-ai-200",
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <input
                        type="radio"
                        name="key-strategy"
                        className="sr-only"
                        checked={active}
                        onChange={() => chooseStrategy(s.id)}
                      />
                      <span
                        className={cn(
                          "shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors",
                          active
                            ? "border-ai-500 bg-ai-500"
                            : "border-ink-300 bg-white",
                        )}
                      >
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] border border-brand-100">
                        关键策略{s.index}
                      </span>
                      <span className="truncate text-[12.5px] text-ink-800">
                        {s.title}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11.5px] text-ink-400">
                      @{s.owner}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
