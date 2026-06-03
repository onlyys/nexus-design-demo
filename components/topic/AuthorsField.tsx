"use client";

import * as React from "react";
import { Plus, X, Search, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_USERS } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { FloatingMenu } from "@/components/ui/FloatingMenu";

type User = (typeof MOCK_USERS)[number];

interface AuthorsFieldProps {
  /** 受控：当前作者 id 列表（第 0 项为发布者，不可删） */
  value: string[];
  onChange: (next: string[]) => void;
  /** 最大作者数（含发布者） */
  max?: number;
}

/**
 * 作者字段（受控版）
 * - 第一个作者 = 发布者本人，固定不可删除
 * - 其他作者可添加 / 移除
 * - "添加关联人" 改名为 "添加作者"
 */
export function AuthorsField({ value, onChange, max = 5 }: AuthorsFieldProps) {
  const authors = React.useMemo(
    () =>
      value
        .map((id) => MOCK_USERS.find((u) => u.id === id))
        .filter(Boolean) as User[],
    [value],
  );

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const candidates = MOCK_USERS.filter(
    (u) =>
      !authors.find((a) => a.id === u.id) &&
      (u.name.includes(query) || u.title.includes(query)),
  );

  const canAdd = authors.length < max;

  const removeAt = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const append = (id: string) => {
    onChange([...value, id]);
    setPickerOpen(false);
    setQuery("");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[12.5px] text-ink-500 mr-0.5 select-none">作者</span>

      <AnimatePresence initial={false}>
        {authors.map((u, idx) => {
          const isFirst = idx === 0;
          return (
            <motion.div
              key={u.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.16 }}
              className={cn(
                "group inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors",
                isFirst
                  ? "border-brand-200 bg-brand-50/50"
                  : "border-ink-200 bg-white hover:border-ink-300",
              )}
            >
              <span className="text-[12.5px] text-ink-900 font-medium leading-none">
                {u.name}
              </span>
              {isFirst ? (
                <span
                  className="ml-0.5 inline-flex items-center gap-0.5 px-1 py-px rounded-sm bg-brand-100 text-brand-700 text-[10px] leading-none"
                  title="发布者，不可移除"
                >
                  <Lock className="w-2.5 h-2.5" strokeWidth={2.4} />
                  发布者
                </span>
              ) : (
                <button
                  onClick={() => removeAt(u.id)}
                  className="text-ink-400 hover:text-ink-700"
                  aria-label="移除作者"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      <button
        ref={triggerRef}
        disabled={!canAdd}
        onClick={() => setPickerOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full border border-dashed text-[12px] font-medium transition-colors",
          canAdd
            ? "border-ink-300 text-ink-700 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50"
            : "border-ink-200 text-ink-400 cursor-not-allowed",
        )}
      >
        <Plus className="w-3 h-3" />
        添加作者
      </button>

      <FloatingMenu
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setQuery("");
        }}
        anchorRef={triggerRef}
        align="start"
        width={260}
        maxHeight={300}
        className="p-2"
      >
        <div className="relative mb-1.5">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索成员"
            className="w-full h-8 pl-7 pr-2 text-[12.5px] rounded-md bg-ink-50 border border-transparent focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none"
          />
        </div>
        <div>
          {candidates.length === 0 && (
            <div className="text-[12px] text-ink-400 px-2 py-3 text-center">
              暂无更多成员
            </div>
          )}
          {candidates.map((u) => (
            <button
              key={u.id}
              onClick={() => append(u.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-ink-50 text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.avatar}
                alt={u.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-900 truncate">
                  {u.name}
                </div>
                <div className="text-[11.5px] text-ink-500 truncate">
                  {u.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </FloatingMenu>
    </div>
  );
}
