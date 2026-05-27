"use client";

import * as React from "react";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Image as ImageIcon,
  Paperclip,
  Link2,
  CheckSquare,
  Table as TableIcon,
  Code,
  Presentation,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BlockType } from "../editor/types";

export interface CommandItem {
  type: BlockType;
  label: string;
  desc: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "基础" | "媒体" | "高级";
}

export const COMMANDS: CommandItem[] = [
  { type: "text", label: "文本", desc: "普通段落文本", icon: Type, group: "基础" },
  { type: "h1", label: "标题 1", desc: "大标题", icon: Heading1, group: "基础" },
  { type: "h2", label: "标题 2", desc: "中等标题", icon: Heading2, group: "基础" },
  { type: "h3", label: "标题 3", desc: "小标题", icon: Heading3, group: "基础" },
  { type: "bulletList", label: "无序列表", desc: "项目符号列表", icon: List, group: "基础" },
  { type: "numberList", label: "有序列表", desc: "编号列表", icon: ListOrdered, group: "基础" },
  { type: "quote", label: "引用", desc: "引用块", icon: Quote, group: "基础" },
  { type: "divider", label: "分割线", desc: "视觉分隔", icon: Minus, group: "基础" },
  { type: "image", label: "图片", desc: "插入图片", icon: ImageIcon, group: "媒体" },
  { type: "file", label: "文件", desc: "上传 PDF / PPT / Word / Excel", icon: Paperclip, group: "媒体" },
  { type: "link", label: "链接", desc: "外部链接卡片", icon: Link2, group: "媒体" },
  { type: "pptPreview", label: "PPT 预览", desc: "插入可直接阅读的 PPT 预览", icon: Presentation, group: "媒体" },
  { type: "htmlPreview", label: "HTML 预览", desc: "插入可阅读的网页内嵌预览", icon: Globe, group: "媒体" },
  { type: "todo", label: "待办事项", desc: "任务列表", icon: CheckSquare, group: "高级" },
  { type: "table", label: "表格", desc: "二维表格", icon: TableIcon, group: "高级" },
  { type: "code", label: "代码块", desc: "代码片段", icon: Code, group: "高级" },
];

interface SlashMenuProps {
  open: boolean;
  position: { x: number; y: number } | null;
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function SlashMenu({ open, position, query, onSelect, onClose }: SlashMenuProps) {
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }, [query]);

  const [active, setActive] = React.useState(0);
  React.useEffect(() => setActive(0), [query, open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((p) => (p + 1) % Math.max(filtered.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(
          (p) => (p - 1 + filtered.length) % Math.max(filtered.length, 1),
        );
      } else if (e.key === "Enter") {
        if (filtered[active]) {
          e.preventDefault();
          onSelect(filtered[active].type);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, filtered, active, onSelect, onClose]);

  return (
    <AnimatePresence>
      {open && position && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
          }}
          className="z-50 w-[300px] max-h-[360px] overflow-y-auto rounded-xl border border-ink-200/80 bg-white shadow-popover p-1.5"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-medium text-ink-400">
            {filtered.length > 0 ? "选择 Block 类型" : "未找到匹配项"}
          </div>
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            const isActive = i === active;
            return (
              <button
                key={cmd.type}
                onMouseEnter={() => setActive(i)}
                onClick={() => onSelect(cmd.type)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                  isActive ? "bg-brand-50" : "hover:bg-ink-50",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg border flex items-center justify-center shrink-0",
                    isActive
                      ? "border-brand-200 bg-white text-brand-600"
                      : "border-ink-200 bg-white text-ink-700",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink-900">
                    {cmd.label}
                  </div>
                  <div className="text-[11.5px] text-ink-500 truncate">
                    {cmd.desc}
                  </div>
                </div>
                <span className="text-[10.5px] font-medium text-ink-400 px-1.5 py-0.5 rounded bg-ink-100 shrink-0">
                  {cmd.group}
                </span>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
