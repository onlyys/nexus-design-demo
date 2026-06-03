"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_DEPARTMENTS } from "@/lib/mock";
import { FloatingMenu } from "@/components/ui/FloatingMenu";

interface AuthorRoleFieldProps {
  /** 当前选中的部门 id */
  value: string;
  onChange: (deptId: string) => void;
  /** 可选：发布者姓名（已不再展示，保留参数避免破坏调用方） */
  publisherName?: string;
}

/**
 * 「以哪个岗位发布」选择器
 *
 * 位于「作者」与「标签」之间。表示：
 * - 第一作者（发布者）以哪个所属部门 / 岗位身份发布该 Topic
 * - 选中后，下方「关联关键策略」会自动以此部门为筛选范围
 * - 发布后页面上需要显示这个身份
 */
export function AuthorRoleField({
  value,
  onChange,
}: AuthorRoleFieldProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [menuWidth, setMenuWidth] = React.useState<number | undefined>();

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    setMenuWidth(triggerRef.current.offsetWidth);
  }, [open]);

  const current =
    USER_DEPARTMENTS.find((d) => d.id === value) ??
    USER_DEPARTMENTS.find((d) => d.isPrimary) ??
    USER_DEPARTMENTS[0];

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[13.5px] font-semibold text-ink-900">
          以此岗位发布
        </span>
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full min-h-[36px] px-3 py-1.5 flex items-center justify-between gap-2 rounded-md border bg-white text-left transition-colors",
          open
            ? "border-brand-500 ring-2 ring-brand-100"
            : "border-ink-200 hover:border-ink-300",
        )}
      >
        <span className="inline-flex items-center min-w-0">
          <span className="truncate text-[12.5px] text-ink-800">
            {current.path}
          </span>
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
        width={menuWidth}
        maxHeight={320}
        className="py-1"
      >
        {USER_DEPARTMENTS.map((d) => {
          const selected = d.id === current.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                onChange(d.id);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] hover:bg-brand-50/40 transition-colors",
                selected && "bg-brand-50/60",
              )}
            >
              <Check
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  selected ? "text-brand-600" : "text-transparent",
                )}
              />
              <span className="truncate text-ink-800">{d.path}</span>
            </button>
          );
        })}
      </FloatingMenu>
    </div>
  );
}
