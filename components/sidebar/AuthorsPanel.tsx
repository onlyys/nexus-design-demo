"use client";

import * as React from "react";
import { Plus, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSection } from "@/components/ui/Card";
import { MOCK_USERS } from "@/lib/mock";
import { cn } from "@/lib/utils";

type User = (typeof MOCK_USERS)[number];

export function AuthorsPanel() {
  const [authors, setAuthors] = React.useState<User[]>([
    MOCK_USERS[0],
    MOCK_USERS[1],
  ]);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const candidates = MOCK_USERS.filter(
    (u) =>
      !authors.find((a) => a.id === u.id) &&
      (u.name.includes(query) || u.title.includes(query)),
  );

  const max = 5;
  const canAdd = authors.length < max;

  return (
    <CardSection title="作者" description={`最多添加 ${max} 位作者`}>
      <div className="flex flex-wrap gap-2">
        {authors.map((u) => (
          <motion.div
            key={u.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-ink-200 bg-white hover:border-ink-300 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u.avatar}
              alt={u.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-ink-200"
            />
            <span className="text-[12.5px] text-ink-900 font-medium">
              {u.name}
            </span>
            <button
              onClick={() => setAuthors((p) => p.filter((a) => a.id !== u.id))}
              className="text-ink-400 hover:text-ink-700"
              aria-label="移除作者"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}

        <div className="relative">
          <button
            disabled={!canAdd}
            onClick={() => setPickerOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed text-[12.5px] font-medium transition-colors",
              canAdd
                ? "border-ink-300 text-ink-700 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50"
                : "border-ink-200 text-ink-400 cursor-not-allowed",
            )}
          >
            <Plus className="w-3 h-3" />
            添加作者
          </button>

          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.14 }}
                className="absolute left-0 top-9 w-[260px] rounded-xl border border-ink-200 bg-white shadow-popover p-2 z-30"
              >
                <div className="relative mb-1.5">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索成员"
                    className="w-full h-8 pl-7 pr-2 text-[12.5px] rounded-lg bg-ink-50 border border-transparent focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {candidates.length === 0 && (
                    <div className="text-[12px] text-ink-400 px-2 py-3 text-center">
                      暂无更多成员
                    </div>
                  )}
                  {candidates.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setAuthors((p) => [...p, u]);
                        setPickerOpen(false);
                        setQuery("");
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-50 text-left"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </CardSection>
  );
}
