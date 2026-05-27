"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSection } from "@/components/ui/Card";
import { RECOMMENDED_TAGS } from "@/lib/mock";
import { cn } from "@/lib/utils";

interface TagsBodyProps {
  onTagsChange?: (tags: string[]) => void;
}

export function TagsBody({ onTagsChange }: TagsBodyProps) {
  const [tags, setTags] = React.useState<string[]>(["关联关键策略", "月会", "战略"]);
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const max = 5;
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    onTagsChange?.(tags);
  }, [tags, onTagsChange]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const addTag = (t: string) => {
    const v = t.trim();
    if (!v) return;
    if (tags.includes(v)) return;
    if (tags.length >= max) return;
    setTags((p) => [...p, v]);
    setInput("");
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      <AnimatePresence initial={false}>
        {tags.map((t) => (
          <motion.span
            key={t}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-md text-[12px] font-medium bg-brand-50 text-brand-700 border border-brand-100"
          >
            {t}
            <button
              onClick={() => setTags((p) => p.filter((x) => x !== t))}
              className="text-brand-500/70 hover:text-brand-700"
              aria-label="移除标签"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={tags.length >= max}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed text-[12px] font-medium transition-colors",
            tags.length < max
              ? "border-ink-300 text-ink-700 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50"
              : "border-ink-200 text-ink-400 cursor-not-allowed",
          )}
        >
          <Plus className="w-3 h-3" />
          添加标签
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 top-9 w-[260px] rounded-xl border border-ink-200 bg-white shadow-popover p-2 z-30"
            >
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(input);
                  }
                }}
                placeholder="输入新标签后回车"
                className="w-full h-8 px-2 text-[12.5px] rounded-lg bg-ink-50 border border-transparent focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none"
              />
              <div className="mt-2 mb-1 px-1 text-[10.5px] font-medium text-ink-400 uppercase tracking-wide">
                推荐
              </div>
              <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                {RECOMMENDED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                  <button
                    key={t}
                    onClick={() => addTag(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] text-ink-700 bg-ink-50 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <span className="text-ink-400 group-hover:text-brand-500">#</span>
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function TagsPanel() {
  return (
    <CardSection title="标签" description="最多选择 5 个标签">
      <TagsBody />
    </CardSection>
  );
}
