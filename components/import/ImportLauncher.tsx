"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  Link2,
  Upload,
  Video,
  ClipboardPaste,
  FileText,
  FileType2,
  Presentation,
  Image as ImageIcon,
  AudioLines,
  Globe,
  CloudUpload,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type TabKey = "recommend" | "link" | "file" | "meeting" | "paste";

interface ImportLauncherProps {
  open: boolean;
  onClose: () => void;
  onImport?: (payload: { type: TabKey; data: any }) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "recommend", label: "推荐方式" },
  { key: "link", label: "链接导入" },
  { key: "file", label: "文件上传" },
  { key: "meeting", label: "会议导入" },
  { key: "paste", label: "粘贴导入" },
];

export function ImportLauncher({ open, onClose, onImport }: ImportLauncherProps) {
  const [tab, setTab] = React.useState<TabKey>("recommend");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [pasteText, setPasteText] = React.useState("");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ESC 关闭
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 锁定背景滚动
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleFiles = (fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    setFiles(Array.from(fl));
    // 模拟解析后回调
    onImport?.({ type: "file", data: Array.from(fl) });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const submitLink = () => {
    if (!linkUrl.trim()) return;
    onImport?.({ type: "link", data: linkUrl.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-launcher-title"
    >
      {/* 遮罩 */}
      <button
        type="button"
        aria-label="关闭"
        className="fixed inset-0 bg-ink-900/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* 弹层 */}
      <div
        className={cn(
          "relative my-[8vh] w-[min(880px,calc(100%-32px))]",
          "rounded-2xl bg-white shadow-popover border border-ink-200/70",
          "animate-fadeUp",
        )}
      >
        {/* 顶部：标题 + 关闭 */}
        <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-white flex items-center justify-center shadow-brand">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="import-launcher-title"
                className="text-[17px] font-semibold text-ink-900 leading-tight"
              >
                导入已有内容，AI 帮你快速生成
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-500 leading-relaxed">
                支持链接解析、文件上传等多种方式，一键导入，轻松创作
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-7">
          <div className="flex items-center gap-1 border-b border-ink-100">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative px-3 py-2 text-[13px] font-medium transition-colors",
                  tab === t.key
                    ? "text-brand-700"
                    : "text-ink-500 hover:text-ink-800",
                )}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 内容区 */}
        <div className="px-7 py-5">
          {tab === "recommend" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 卡片 1：链接 */}
              <ImportCard
                tone="violet"
                icon={<Sparkles className="w-[18px] h-[18px]" />}
                title="粘贴链接快速导入"
                desc="支持网页、腾讯文档、飞书文档、HTML 等链接"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="粘贴链接到此处（如：https://...）"
                    className="flex-1 h-9 px-3 rounded-lg bg-white border border-ink-200 text-[12.5px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={submitLink}
                    disabled={!linkUrl.trim()}
                  >
                    导入
                  </Button>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] text-ink-400 mb-1.5">
                    支持来源：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <SourceChip icon={<Globe className="w-3 h-3" />} label="网页" />
                    <SourceChip icon={<FileType2 className="w-3 h-3 text-blue-500" />} label="腾讯文档" />
                    <SourceChip icon={<FileType2 className="w-3 h-3 text-cyan-500" />} label="飞书文档" />
                    <SourceChip icon={<Link2 className="w-3 h-3" />} label="HTML" />
                  </div>
                </div>
              </ImportCard>

              {/* 卡片 2：上传 */}
              <ImportCard
                tone="blue"
                icon={<Upload className="w-[18px] h-[18px]" />}
                title="拖拽或上传文件导入"
                desc="支持 PDF、Word、PPT、图片、音频等多种格式"
              >
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors",
                    isDragOver
                      ? "border-brand-500 bg-brand-50/60"
                      : "border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/30",
                  )}
                >
                  <CloudUpload
                    className={cn(
                      "w-6 h-6 mx-auto mb-1.5",
                      isDragOver ? "text-brand-600" : "text-ink-400",
                    )}
                  />
                  <div className="text-[12.5px] font-medium text-ink-700">
                    点击上传或拖拽文件到此处
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-400">
                    支持 PDF / Word / PPT / 图片 / 音频 等格式
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>
                <div className="mt-3">
                  <div className="text-[11px] text-ink-400 mb-1.5">
                    支持格式：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <SourceChip icon={<FileType2 className="w-3 h-3 text-rose-500" />} label="PDF" />
                    <SourceChip icon={<FileType2 className="w-3 h-3 text-blue-500" />} label="Word" />
                    <SourceChip icon={<Presentation className="w-3 h-3 text-orange-500" />} label="PPT" />
                    <SourceChip icon={<ImageIcon className="w-3 h-3 text-emerald-500" />} label="图片" />
                    <SourceChip icon={<AudioLines className="w-3 h-3 text-violet-500" />} label="音频" />
                    <SourceChip label="更多" />
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 text-[11.5px] text-emerald-600">
                    已选 {files.length} 个文件，AI 解析中…
                  </div>
                )}
              </ImportCard>

              {/* 卡片 3：腾讯会议 */}
              <ImportCard
                tone="emerald"
                icon={<Video className="w-[18px] h-[18px]" />}
                title="腾讯会议内容导入"
                desc="一键导入会议纪要、录音转写、会议材料等内容"
              >
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => onImport?.({ type: "meeting", data: null })}
                >
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  导入腾讯会议
                </Button>
              </ImportCard>

              {/* 卡片 4：粘贴文本 */}
              <ImportCard
                tone="amber"
                icon={<ClipboardPaste className="w-[18px] h-[18px]" />}
                title="粘贴文本或 HTML"
                desc="支持粘贴文本、HTML 代码，AI 自动整理排版"
              >
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => setTab("paste")}
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
                  粘贴文本 / HTML
                </Button>
              </ImportCard>
            </div>
          )}

          {tab === "link" && (
            <div className="max-w-[640px] mx-auto py-2">
              <label className="block text-[12.5px] font-medium text-ink-700 mb-2">
                输入链接
              </label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://docs.qq.com/... 或任意 HTML 链接"
                  className="flex-1 h-10 px-3 rounded-lg bg-white border border-ink-200 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <Button variant="primary" size="md" onClick={submitLink} disabled={!linkUrl.trim()}>
                  解析并导入
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="mt-2 text-[12px] text-ink-500">
                AI 会自动抓取正文、清洗版式，生成 Topic 草稿。
              </p>
            </div>
          )}

          {tab === "file" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors",
                isDragOver
                  ? "border-brand-500 bg-brand-50/60"
                  : "border-ink-200 bg-ink-50/40 hover:border-brand-400 hover:bg-brand-50/30",
              )}
            >
              <CloudUpload
                className={cn(
                  "w-10 h-10 mx-auto mb-3",
                  isDragOver ? "text-brand-600" : "text-ink-400",
                )}
              />
              <div className="text-[14px] font-medium text-ink-800">
                点击上传，或将文件拖到此处
              </div>
              <div className="mt-1 text-[12px] text-ink-500">
                支持 PDF / Word / PPT / 图片 / 音频，单文件 ≤ 100MB
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {files.length > 0 && (
                <div className="mt-4 text-[12.5px] text-emerald-600">
                  已选 {files.length} 个文件，AI 解析中…
                </div>
              )}
            </div>
          )}

          {tab === "meeting" && (
            <div className="max-w-[640px] mx-auto py-2 space-y-3">
              <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-3.5 text-[12.5px] text-emerald-900 leading-relaxed">
                <span className="font-medium">连接腾讯会议</span> 后，可一键导入会议纪要、转写文本、AI 总结与待办事项。
              </div>
              <Button variant="primary" size="md" className="w-full justify-center">
                <Video className="w-3.5 h-3.5" />
                授权连接腾讯会议
              </Button>
              <p className="text-[11.5px] text-ink-400 text-center">
                也可手动粘贴会议纪要文本到「粘贴导入」
              </p>
            </div>
          )}

          {tab === "paste" && (
            <div className="max-w-[720px] mx-auto py-2">
              <label className="block text-[12.5px] font-medium text-ink-700 mb-2">
                粘贴文本 / HTML / 聊天记录
              </label>
              <textarea
                autoFocus
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={8}
                placeholder="把已有的文本、HTML 片段或聊天记录粘贴到这里，AI 会自动整理为结构化内容..."
                className="w-full px-3.5 py-3 rounded-lg bg-white border border-ink-200 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none leading-relaxed"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11.5px] text-ink-400">
                  {pasteText.length} 字
                </span>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!pasteText.trim()}
                  onClick={() => onImport?.({ type: "paste", data: pasteText })}
                >
                  AI 整理并导入
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 + 跳过 */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-ink-100 bg-ink-50/60 rounded-b-2xl">
          <p className="text-[11.5px] text-ink-500">
            导入后，AI 将自动解析内容并生成初稿，你可以在编辑器中继续修改与完善
          </p>
          <button
            onClick={onClose}
            className="text-[12.5px] text-ink-500 hover:text-ink-800 transition-colors"
          >
            跳过，直接手写 →
          </button>
        </div>
      </div>
    </div>
  );
}

/* —————— 子组件 —————— */

const TONE_MAP = {
  violet: {
    iconBg: "bg-violet-50 text-violet-600",
    border: "border-ink-200/70 hover:border-violet-300",
  },
  blue: {
    iconBg: "bg-blue-50 text-blue-600",
    border: "border-ink-200/70 hover:border-blue-300",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600",
    border: "border-ink-200/70 hover:border-emerald-300",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600",
    border: "border-ink-200/70 hover:border-amber-300",
  },
} as const;

function ImportCard({
  tone,
  icon,
  title,
  desc,
  children,
}: {
  tone: keyof typeof TONE_MAP;
  icon: React.ReactNode;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  const t = TONE_MAP[tone];
  return (
    <div
      className={cn(
        "rounded-xl bg-white border p-4 transition-all",
        t.border,
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", t.iconBg)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-ink-900 leading-tight">
            {title}
          </div>
          <div className="mt-0.5 text-[11.5px] text-ink-500 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function SourceChip({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-ink-50 border border-ink-200/70 text-[10.5px] text-ink-600">
      {icon}
      {label}
    </span>
  );
}
