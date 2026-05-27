"use client";

import * as React from "react";
import {
  Undo2,
  Redo2,
  Paintbrush,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Link2,
  Image as ImageIcon,
  Paperclip,
  Minus,
  Table as TableIcon,
  Code,
  MoreHorizontal,
  Presentation,
  FileText,
  FileType2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  IndentIncrease,
  IndentDecrease,
  Plus,
  Info,
  ChevronsUpDown,
  Superscript,
  Subscript,
  Eraser,
  FileSpreadsheet,
  FileType,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockType } from "./types";
import { Tooltip } from "@/components/ui/Tooltip";
import { FloatingMenu } from "@/components/ui/FloatingMenu";

interface ToolbarProps {
  onInsert: (
    type: BlockType,
    meta?: {
      mode?: "plain" | "card" | "full";
      fileType?: "pdf" | "ppt" | "doc" | "xls" | "image" | "other";
      rows?: number;
      cols?: number;
      linkUrl?: string;
      linkDisplay?: "plain" | "card" | "full";
    },
  ) => void;
  /** 触发 AI 格式优化（识别正文 → 自动转为 H2/H3/列表/引用等结构化 block） */
  onAiFormat?: () => void;
  /** AI 格式优化是否进行中 */
  aiFormatting?: boolean;
  /** AI 格式优化是否已完成（短暂显示） */
  aiFormatDone?: boolean;
}

/* ============ 段落样式下拉项 ============ */
const STYLE_ITEMS: {
  type: BlockType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "text", label: "正文", Icon: FileText },
  { type: "h1", label: "标题 1", Icon: Heading1 },
  { type: "h2", label: "标题 2", Icon: Heading2 },
  { type: "h3", label: "标题 3", Icon: Heading3 },
];

/* ============ G 区"兜底插入"下拉项 ============ */
type InsertItem = {
  type: BlockType;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  meta?: { mode?: "plain" | "card" | "full"; fileType?: "pdf" };
};

const G_INSERT_GROUPS: { title: string; items: InsertItem[] }[] = [
  {
    title: "排版",
    items: [
      { type: "divider", label: "分割线", desc: "视觉分隔线", Icon: Minus },
      { type: "quote", label: "引用块", desc: "突出引述内容", Icon: Quote },
      { type: "quote", label: "提示框", desc: "信息 / 提醒 / 警示", Icon: Info },
      { type: "quote", label: "折叠块", desc: "可展开的内容容器", Icon: ChevronsUpDown },
    ],
  },
];

/* ============ 组件 ============ */

export function EditorToolbar({
  onInsert,
  onAiFormat,
  aiFormatting = false,
  aiFormatDone = false,
}: ToolbarProps) {
  // 下拉状态
  const [styleOpen, setStyleOpen] = React.useState(false);
  const [moreInlineOpen, setMoreInlineOpen] = React.useState(false);
  const [alignOpen, setAlignOpen] = React.useState(false);
  const [colorOpen, setColorOpen] = React.useState(false);
  const [tableOpen, setTableOpen] = React.useState(false);
  const [attachOpen, setAttachOpen] = React.useState(false);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [insertOpen, setInsertOpen] = React.useState(false);

  // refs
  const styleBtnRef = React.useRef<HTMLButtonElement>(null);
  const moreInlineBtnRef = React.useRef<HTMLButtonElement>(null);
  const alignBtnRef = React.useRef<HTMLButtonElement>(null);
  const colorBtnRef = React.useRef<HTMLButtonElement>(null);
  const tableBtnRef = React.useRef<HTMLButtonElement>(null);
  const attachBtnRef = React.useRef<HTMLButtonElement>(null);
  const linkBtnRef = React.useRef<HTMLButtonElement>(null);
  const insertBtnRef = React.useRef<HTMLButtonElement>(null);

  // 当前对齐（仅 UI 占位回显）
  const [align, setAlign] = React.useState<"left" | "center" | "right">("left");

  const noop = () => {};

  return (
    <div
      className={cn(
        "sticky top-0 z-30 bg-white/95 backdrop-blur-sm border border-ink-200/80",
        "rounded-md px-1.5 py-1 shadow-card",
        // 关键：flex-wrap 让窄屏自动换行成两栏，row-gap 让两栏之间有间距
        "flex flex-wrap items-center gap-y-1",
      )}
      style={{ overflow: "visible" }}
    >
      {/* ============ A 撤销区 ============ */}
      <Group>
        <IconBtn label="撤销" hint="Cmd+Z" onClick={noop}>
          <Undo2 className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn label="重做" hint="Cmd+Shift+Z" onClick={noop}>
          <Redo2 className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn label="格式刷" hint="复制格式" onClick={noop}>
          <Paintbrush className="w-3.5 h-3.5" />
        </IconBtn>
      </Group>

      <Divider />

      {/* ============ B 段落样式 ============ */}
      <Group>
        <Tooltip label="段落样式" hint="正文 / 标题">
          <button
            ref={styleBtnRef}
            onClick={() => setStyleOpen((v) => !v)}
            className={cn(
              "h-7 px-2 rounded-md inline-flex items-center gap-1 text-[12.5px] transition-colors whitespace-nowrap",
              styleOpen
                ? "bg-ink-100 text-ink-900"
                : "text-ink-700 hover:bg-ink-50",
            )}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            正文
            <ChevronDown className="w-3 h-3 text-ink-400 shrink-0" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={styleOpen}
          onClose={() => setStyleOpen(false)}
          anchorRef={styleBtnRef}
          align="start"
          width={180}
          className="p-1"
        >
          {STYLE_ITEMS.map((it) => (
            <button
              key={it.type + it.label}
              onClick={() => {
                onInsert(it.type);
                setStyleOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-ink-50 text-left"
            >
              <it.Icon className="w-3.5 h-3.5 text-ink-700 shrink-0" />
              <span className="text-[12.5px] text-ink-900">{it.label}</span>
            </button>
          ))}
        </FloatingMenu>
      </Group>

      <Divider />

      {/* ============ C 行内格式（精简） ============ */}
      <Group>
        <IconBtn label="加粗" hint="Cmd+B" onClick={noop}>
          <Bold className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn label="斜体" hint="Cmd+I" onClick={noop}>
          <Italic className="w-3.5 h-3.5" />
        </IconBtn>

        {/* 更多行内格式下拉：U / S / </> / x² / x₂ / ✕ */}
        <Tooltip label="更多文本样式">
          <button
            ref={moreInlineBtnRef}
            onClick={() => setMoreInlineOpen((v) => !v)}
            className={cn(
              "h-7 w-7 rounded-md inline-flex items-center justify-center transition-colors shrink-0",
              moreInlineOpen
                ? "bg-ink-100 text-ink-900"
                : "text-ink-500 hover:bg-ink-50 hover:text-ink-900",
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={moreInlineOpen}
          onClose={() => setMoreInlineOpen(false)}
          anchorRef={moreInlineBtnRef}
          align="start"
          width={200}
          className="p-1"
        >
          <MoreItem onClick={noop} label="下划线" hint="Cmd+U" Icon={Underline} />
          <MoreItem onClick={noop} label="删除线" hint="Cmd+Shift+X" Icon={Strikethrough} />
          <MoreItem onClick={noop} label="行内代码" hint="`code`" Icon={Code} />
          <div className="my-1 h-px bg-ink-100" />
          <MoreItem onClick={noop} label="上标" Icon={Superscript} />
          <MoreItem onClick={noop} label="下标" Icon={Subscript} />
          <div className="my-1 h-px bg-ink-100" />
          <MoreItem onClick={noop} label="清除格式" Icon={Eraser} />
        </FloatingMenu>
      </Group>

      <Divider />

      {/* ============ D 对齐 + 颜色 ============ */}
      <Group>
        {/* 对齐下拉 */}
        <Tooltip label="对齐方式">
          <button
            ref={alignBtnRef}
            onClick={() => setAlignOpen((v) => !v)}
            className={cn(
              "h-7 px-1.5 rounded-md inline-flex items-center gap-0.5 transition-colors shrink-0",
              alignOpen
                ? "bg-ink-100 text-ink-900"
                : "text-ink-700 hover:bg-ink-50",
            )}
          >
            {align === "left" && <AlignLeft className="w-3.5 h-3.5" />}
            {align === "center" && <AlignCenter className="w-3.5 h-3.5" />}
            {align === "right" && <AlignRight className="w-3.5 h-3.5" />}
            <ChevronDown className="w-3 h-3 text-ink-400" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={alignOpen}
          onClose={() => setAlignOpen(false)}
          anchorRef={alignBtnRef}
          align="start"
          width={150}
          className="p-1"
        >
          <AlignItem
            current={align}
            value="left"
            label="左对齐"
            Icon={AlignLeft}
            onClick={() => {
              setAlign("left");
              setAlignOpen(false);
            }}
          />
          <AlignItem
            current={align}
            value="center"
            label="居中对齐"
            Icon={AlignCenter}
            onClick={() => {
              setAlign("center");
              setAlignOpen(false);
            }}
          />
          <AlignItem
            current={align}
            value="right"
            label="右对齐"
            Icon={AlignRight}
            onClick={() => {
              setAlign("right");
              setAlignOpen(false);
            }}
          />
        </FloatingMenu>

        {/* 文字颜色 / 高亮 */}
        <Tooltip label="文字颜色 / 高亮">
          <button
            ref={colorBtnRef}
            onClick={() => setColorOpen((v) => !v)}
            className={cn(
              "h-7 px-1.5 rounded-md inline-flex items-center gap-0.5 transition-colors shrink-0",
              colorOpen
                ? "bg-ink-100 text-ink-900"
                : "text-ink-700 hover:bg-ink-50",
            )}
          >
            <Type className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 text-ink-400" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={colorOpen}
          onClose={() => setColorOpen(false)}
          anchorRef={colorBtnRef}
          align="start"
          width={220}
          className="p-2"
        >
          <div className="text-[10.5px] font-medium tracking-wide text-ink-400 px-1 pb-1.5">
            文字颜色
          </div>
          <div className="grid grid-cols-7 gap-1 pb-2">
            {TEXT_COLORS.map((c) => (
              <button
                key={"t" + c.value}
                onClick={noop}
                className="h-6 w-6 rounded border border-ink-200 flex items-center justify-center text-[11px] font-semibold hover:ring-2 hover:ring-brand-300"
                style={{ color: c.value }}
                title={c.label}
              >
                A
              </button>
            ))}
          </div>
          <div className="text-[10.5px] font-medium tracking-wide text-ink-400 px-1 pb-1.5">
            背景高亮
          </div>
          <div className="grid grid-cols-7 gap-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={"h" + c.value}
                onClick={noop}
                className="h-6 w-6 rounded border border-ink-200 hover:ring-2 hover:ring-brand-300"
                style={{ background: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </FloatingMenu>
      </Group>

      <Divider />

      {/* ============ E 列表 / 缩进 / 待办 ============ */}
      <Group>
        <IconBtn label="无序列表" onClick={() => onInsert("bulletList")}>
          <List className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn label="有序列表" onClick={() => onInsert("numberList")}>
          <ListOrdered className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn label="待办" onClick={() => onInsert("todo")}>
          <CheckSquare className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn label="减少缩进" onClick={noop}>
          <IndentDecrease className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn label="增加缩进" onClick={noop}>
          <IndentIncrease className="w-3.5 h-3.5" />
        </IconBtn>
      </Group>

      <Divider />

      {/* ============ F 元素块区 ============ */}
      <Group>
        {/* 附件下拉 */}
        <Tooltip label="附件" hint="上传文件 / Word / Excel / PDF / PPT">
          <button
            ref={attachBtnRef}
            onClick={() => setAttachOpen((v) => !v)}
            className={cn(
              "h-7 px-1.5 rounded-md inline-flex items-center gap-0.5 transition-colors shrink-0",
              attachOpen
                ? "bg-ink-100 text-ink-900"
                : "text-ink-700 hover:bg-ink-50",
            )}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 text-ink-400" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={attachOpen}
          onClose={() => setAttachOpen(false)}
          anchorRef={attachBtnRef}
          align="start"
          width={220}
          className="p-1"
        >
          <div className="px-2 pt-1 pb-1 text-[10.5px] font-medium tracking-wide text-ink-400">
            上传文件
          </div>
          <MoreItem
            label="本地文件"
            Icon={Paperclip}
            onClick={() => {
              onInsert("file");
              setAttachOpen(false);
            }}
          />
          <div className="my-1 h-px bg-ink-100" />
          <div className="px-2 pt-0.5 pb-1 text-[10.5px] font-medium tracking-wide text-ink-400">
            常用类型
          </div>
          <MoreItem
            label="Word 文档"
            Icon={FileType}
            onClick={() => {
              onInsert("file", { fileType: "doc" });
              setAttachOpen(false);
            }}
          />
          <MoreItem
            label="Excel 表格"
            Icon={FileSpreadsheet}
            onClick={() => {
              onInsert("file", { fileType: "xls" });
              setAttachOpen(false);
            }}
          />
          <MoreItem
            label="PDF 文档"
            Icon={FileType2}
            onClick={() => {
              onInsert("file", { fileType: "pdf" });
              setAttachOpen(false);
            }}
          />
          <MoreItem
            label="PPT 演示"
            Icon={Presentation}
            onClick={() => {
              onInsert("pptPreview");
              setAttachOpen(false);
            }}
          />
        </FloatingMenu>

        {/* 表格下拉：hover 网格选择 */}
        <Tooltip label="表格" hint="hover 选择行列数">
          <button
            ref={tableBtnRef}
            onClick={() => setTableOpen((v) => !v)}
            className={cn(
              "h-7 px-1.5 rounded-md inline-flex items-center gap-0.5 transition-colors shrink-0",
              tableOpen
                ? "bg-ink-100 text-ink-900"
                : "text-ink-700 hover:bg-ink-50",
            )}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 text-ink-400" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={tableOpen}
          onClose={() => setTableOpen(false)}
          anchorRef={tableBtnRef}
          align="start"
          width={180}
          className="p-2"
        >
          <TableGridPicker
            onPick={(rows, cols) => {
              onInsert("table", { rows, cols });
              setTableOpen(false);
            }}
          />
        </FloatingMenu>

        {/* 图片 */}
        <IconBtn label="图片" onClick={() => onInsert("image")}>
          <ImageIcon className="w-3.5 h-3.5" />
        </IconBtn>

        {/* 链接：点击弹出输入框，回车直接插入 */}
        <Tooltip label="插入链接" hint="输入 URL 回车">
          <button
            ref={linkBtnRef}
            onClick={() => setLinkOpen((v) => !v)}
            className={cn(
              "h-7 w-7 rounded-md inline-flex items-center justify-center transition-colors shrink-0",
              linkOpen
                ? "bg-violet-50 text-violet-700"
                : "text-ink-700 hover:bg-ink-50",
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={linkOpen}
          onClose={() => setLinkOpen(false)}
          anchorRef={linkBtnRef}
          align="start"
          width={320}
          className="p-2.5"
        >
          <LinkInsertForm
            onCancel={() => setLinkOpen(false)}
            onSubmit={(url) => {
              onInsert("link", { linkUrl: url, linkDisplay: "plain" });
              setLinkOpen(false);
            }}
          />
        </FloatingMenu>

        {/* 代码 */}
        <IconBtn label="代码块" onClick={() => onInsert("code")}>
          <Code className="w-3.5 h-3.5" />
        </IconBtn>
      </Group>

      <Divider />

      {/* ============ G 兜底插入入口 ============ */}
      <Group>
        <Tooltip label="插入" hint="分割线 / 提示框 / 折叠块">
          <button
            ref={insertBtnRef}
            onClick={() => setInsertOpen((v) => !v)}
            className={cn(
              "h-7 px-2 rounded-md inline-flex items-center gap-1 text-[12px] font-medium transition-colors whitespace-nowrap shrink-0",
              insertOpen
                ? "bg-brand-50 text-brand-700"
                : "text-brand-600 hover:bg-brand-50",
            )}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            插入
            <ChevronDown className="w-3 h-3 text-brand-400 shrink-0" />
          </button>
        </Tooltip>
        <FloatingMenu
          open={insertOpen}
          onClose={() => setInsertOpen(false)}
          anchorRef={insertBtnRef}
          align="start"
          width={260}
          maxHeight={420}
          className="p-1.5"
        >
          {G_INSERT_GROUPS.map((g, gi) => (
            <div key={g.title} className={gi > 0 ? "mt-1" : ""}>
              <div className="px-2 pt-1 pb-1 text-[10.5px] font-medium tracking-wide text-ink-400">
                {g.title}
              </div>
              {g.items.map((it) => (
                <button
                  key={it.type + it.label}
                  onClick={() => {
                    onInsert(it.type, it.meta);
                    setInsertOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-ink-50 text-left"
                >
                  <div className="h-7 w-7 rounded-md border border-ink-200 bg-white flex items-center justify-center shrink-0 text-ink-700">
                    <it.Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] text-ink-900 leading-tight">
                      {it.label}
                    </div>
                    <div className="text-[10.5px] text-ink-500 leading-tight mt-0.5 truncate">
                      {it.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </FloatingMenu>
      </Group>

      {/* H 区（查找替换 / AI 润色）已按需求移除 */}

      {/* ============ I 区 · AI 格式优化（推到最右） ============ */}
      {onAiFormat && (
        <>
          {/* spacer：把 AI 按钮推到工具栏最右侧（换行时仍跟随分组） */}
          <div className="flex-1" aria-hidden />
          <Group>
            <Tooltip
              label="AI 格式优化"
              hint="自动识别主题并优化各内容块的排版"
            >
              <button
                onClick={onAiFormat}
                disabled={aiFormatting}
                className={cn(
                  "relative h-7 px-2.5 rounded-md inline-flex items-center gap-1.5 text-[12px] font-medium transition-all whitespace-nowrap shrink-0 overflow-hidden",
                  aiFormatting
                    ? "bg-gradient-to-r from-ai-500 to-violet-500 text-white shadow-[0_2px_6px_-1px_rgba(139,92,246,0.4)] cursor-wait"
                    : aiFormatDone
                    ? "bg-emerald-500 text-white shadow-[0_2px_6px_-1px_rgba(16,185,129,0.4)]"
                    : "bg-gradient-to-r from-ai-50 to-violet-50 text-ai-700 border border-ai-200 hover:from-ai-100 hover:to-violet-100 hover:border-ai-300 hover:shadow-[0_2px_6px_-1px_rgba(139,92,246,0.25)]",
                )}
              >
                {/* 解析中扫光 */}
                {aiFormatting && (
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full animate-[shimmerToolbar_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                )}
                {aiFormatting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span className="relative">AI 优化中…</span>
                  </>
                ) : aiFormatDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>已优化</span>
                  </>
                ) : (
                  <>
                    <Sparkles
                      className="w-3.5 h-3.5 shrink-0"
                      strokeWidth={2.4}
                    />
                    <span>AI 格式优化</span>
                  </>
                )}
              </button>
            </Tooltip>
          </Group>
          <style jsx>{`
            @keyframes shimmerToolbar {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

/* ============ 子组件 ============ */

/** 分组容器：用于在 flex-wrap 换行时，让一个分组内的按钮尽量不被拆开 */
function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">{children}</div>
  );
}

function Divider() {
  return (
    <div
      className="h-5 w-px bg-ink-200 mx-0.5 shrink-0 self-center"
      aria-hidden
    />
  );
}

function IconBtn({
  label,
  hint,
  onClick,
  children,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label} hint={hint}>
      <button
        onClick={onClick}
        className="h-7 w-7 rounded-md inline-flex items-center justify-center text-ink-700 hover:bg-ink-50 hover:text-ink-900 transition-colors shrink-0"
      >
        {children}
      </button>
    </Tooltip>
  );
}

function MoreItem({
  onClick,
  label,
  Icon,
  hint,
}: {
  onClick: () => void;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-ink-50 text-left"
    >
      <Icon className="w-3.5 h-3.5 text-ink-700 shrink-0" />
      <span className="text-[12.5px] text-ink-900 flex-1">{label}</span>
      {hint && <span className="text-[10.5px] text-ink-400">{hint}</span>}
    </button>
  );
}

function AlignItem({
  current,
  value,
  label,
  Icon,
  onClick,
}: {
  current: "left" | "center" | "right";
  value: "left" | "center" | "right";
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left",
        active ? "bg-brand-50 text-brand-700" : "hover:bg-ink-50 text-ink-900",
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-[12.5px] flex-1">{label}</span>
    </button>
  );
}

/* ============ 链接插入表单（输入 URL → 回车插入） ============ */
function LinkInsertForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const v = url.trim();
    if (!v) return;
    onSubmit(v);
  };

  return (
    <div>
      <div className="px-1 pb-1.5 text-[10.5px] font-medium tracking-wide text-ink-400">
        插入链接
      </div>
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder="粘贴或输入网址，回车插入"
          className="flex-1 h-8 px-2.5 rounded-md border border-ink-200 bg-white text-[12.5px] text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          onClick={submit}
          disabled={!url.trim()}
          className={cn(
            "h-8 px-3 rounded-md text-[12px] font-medium transition-colors",
            url.trim()
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-ink-100 text-ink-400 cursor-not-allowed",
          )}
        >
          插入
        </button>
      </div>
      <div className="mt-2 px-1 text-[10.5px] text-ink-400 leading-snug">
        插入后可在链接卡片右上角切换 <b className="text-ink-600">纯链接 / 缩略 / 整体</b> 三种形态
      </div>
    </div>
  );
}

/* ============ 表格 hover 网格选择器（5×5） ============ */
function TableGridPicker({
  onPick,
  size = 5,
}: {
  onPick: (rows: number, cols: number) => void;
  size?: number;
}) {
  const [hover, setHover] = React.useState<{ r: number; c: number } | null>(
    null,
  );

  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const active =
        hover != null && r <= hover.r && c <= hover.c;
      cells.push(
        <button
          key={`${r}-${c}`}
          onMouseEnter={() => setHover({ r, c })}
          onClick={() => onPick(r + 1, c + 1)}
          className={cn(
            "h-6 w-6 rounded border transition-colors",
            active
              ? "border-brand-500 bg-brand-50"
              : "border-ink-200 bg-white hover:border-ink-300",
          )}
          aria-label={`插入 ${r + 1} 行 ${c + 1} 列表格`}
        />,
      );
    }
  }

  const label = hover
    ? `${hover.r + 1} × ${hover.c + 1}`
    : `${size} × ${size}`;

  return (
    <div
      onMouseLeave={() => setHover(null)}
      className="flex flex-col items-center"
    >
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${size}, 1.5rem)` }}
      >
        {cells}
      </div>
      <div className="mt-2 text-[12px] text-ink-600 font-medium tracking-wide">
        {label}
      </div>
    </div>
  );
}

/* ============ 颜色数据 ============ */

const TEXT_COLORS: { label: string; value: string }[] = [
  { label: "默认", value: "#1F2328" },
  { label: "灰", value: "#6B7280" },
  { label: "红", value: "#E5484D" },
  { label: "橙", value: "#F76808" },
  { label: "黄", value: "#FFB224" },
  { label: "绿", value: "#30A46C" },
  { label: "蓝", value: "#3E63DD" },
  { label: "紫", value: "#8E4EC6" },
  { label: "粉", value: "#D6409F" },
  { label: "青", value: "#0091AE" },
  { label: "深绿", value: "#218358" },
  { label: "深蓝", value: "#1E40AF" },
  { label: "棕", value: "#A0522D" },
  { label: "黑", value: "#000000" },
];

const HIGHLIGHT_COLORS: { label: string; value: string }[] = [
  { label: "无", value: "transparent" },
  { label: "灰底", value: "#F1F2F4" },
  { label: "红底", value: "#FEEBEC" },
  { label: "橙底", value: "#FFE8D7" },
  { label: "黄底", value: "#FFF4D6" },
  { label: "绿底", value: "#DDF3E4" },
  { label: "蓝底", value: "#E1E9FF" },
  { label: "紫底", value: "#EFE0FA" },
  { label: "粉底", value: "#FCE3F1" },
  { label: "青底", value: "#D6F1F7" },
  { label: "墨底", value: "#E5E7EB" },
  { label: "暖灰", value: "#EFEAE3" },
  { label: "薄荷", value: "#D8F3E5" },
  { label: "天空", value: "#DDEEFB" },
];
