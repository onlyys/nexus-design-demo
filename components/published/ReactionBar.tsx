"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Key = "like" | "dislike" | "doubt";

interface ReactionBarProps {
  initial: { like: number; dislike: number; doubt: number };
}

const META: Record<
  Key,
  { Icon: React.ComponentType<{ className?: string }>; label: string; activeBg: string; activeText: string }
> = {
  like: {
    Icon: ThumbsUp,
    label: "赞",
    activeBg: "bg-brand-50",
    activeText: "text-brand-700",
  },
  dislike: {
    Icon: ThumbsDown,
    label: "踩",
    activeBg: "bg-rose-50",
    activeText: "text-rose-600",
  },
  doubt: {
    Icon: HelpCircle,
    label: "疑惑",
    activeBg: "bg-amber-50",
    activeText: "text-amber-700",
  },
};

/**
 * 反应条：赞 / 踩 / 疑惑（互不互斥，可同时点击）
 * 参考图一底部的 👍 1 / 👎 踩 / 😕 疑惑
 */
export function ReactionBar({ initial }: ReactionBarProps) {
  const [counts, setCounts] = React.useState(initial);
  const [active, setActive] = React.useState<Record<Key, boolean>>({
    like: false,
    dislike: false,
    doubt: false,
  });

  const toggle = (k: Key) => {
    setActive((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      setCounts((c) => ({ ...c, [k]: c[k] + (next[k] ? 1 : -1) }));
      return next;
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      {(Object.keys(META) as Key[]).map((k) => {
        const { Icon, label, activeBg, activeText } = META[k];
        const isOn = active[k];
        const count = counts[k];
        return (
          <button
            key={k}
            onClick={() => toggle(k)}
            className={cn(
              "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-medium border transition-all select-none",
              isOn
                ? cn(activeBg, activeText, "border-transparent")
                : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            <AnimatePresence mode="popLayout">
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="tabular-nums"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
