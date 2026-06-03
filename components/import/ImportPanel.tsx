"use client";

import * as React from "react";
import {
  Sparkles,
  Link2,
  Upload,
  Video,
  ClipboardPaste,
  FileType2,
  Presentation,
  Image as ImageIcon,
  AudioLines,
  Globe,
  CloudUpload,
  X,
  Loader2,
  CheckCircle2,
  FileText,
  Mic,
  Inbox,
} from "lucide-react";
import { cn, formatBytes, uid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/* ——————————————————— 类型 ——————————————————— */

export type AssetKind = "link" | "file" | "meeting" | "paste";

export interface ImportAsset {
  id: string;
  kind: AssetKind;
  name: string; // 显示名（链接 URL / 文件名 / 会议主题 / 粘贴片段）
  meta?: string; // 辅助信息，如大小、字数等
  source?: string; // 原始数据（URL / File / 文本）—— demo 不强求
}

export interface ImportPanelProps {
  /** 用户按下「AI 一键解析全部」时回调，外部据此生成 Event */
  onParseAll?: (assets: ImportAsset[]) => void;
}

/* ——————————————————— 工具 ——————————————————— */

function getFileKindIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["ppt", "pptx", "key"].includes(ext))
    return { Icon: Presentation, tone: "text-orange-500 bg-orange-50" };
  if (["pdf"].includes(ext))
    return { Icon: FileType2, tone: "text-rose-500 bg-rose-50" };
  if (["doc", "docx"].includes(ext))
    return { Icon: FileText, tone: "text-blue-500 bg-blue-50" };
  if (["xls", "xlsx", "csv"].includes(ext))
    return { Icon: FileType2, tone: "text-emerald-500 bg-emerald-50" };
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return { Icon: ImageIcon, tone: "text-violet-500 bg-violet-50" };
  if (["mp3", "wav", "m4a", "flac"].includes(ext))
    return { Icon: AudioLines, tone: "text-amber-500 bg-amber-50" };
  return { Icon: FileText, tone: "text-ink-500 bg-ink-100" };
}

function getKindBadge(kind: AssetKind) {
  switch (kind) {
    case "link":
      return { Icon: Globe, tone: "text-violet-600 bg-violet-50", label: "链接" };
    case "file":
      return { Icon: Upload, tone: "text-blue-600 bg-blue-50", label: "文件" };
    case "meeting":
      return { Icon: Video, tone: "text-emerald-600 bg-emerald-50", label: "会议" };
    case "paste":
      return {
        Icon: ClipboardPaste,
        tone: "text-amber-600 bg-amber-50",
        label: "粘贴",
      };
  }
}

/* ——————————————————— 主组件 ——————————————————— */

export function ImportPanel({ onParseAll }: ImportPanelProps) {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 统一素材列表
  const [assets, setAssets] = React.useState<ImportAsset[]>([]);
  // 解析状态
  const [parsing, setParsing] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const addAsset = (a: Omit<ImportAsset, "id">) =>
    setAssets((prev) => [...prev, { id: uid(), ...a }]);

  const removeAsset = (id: string) =>
    setAssets((prev) => prev.filter((a) => a.id !== id));

  const clearAll = () => setAssets([]);

  /* —— 各方式投递（不再立即触发解析，只入队） —— */

  const submitLink = () => {
    const v = linkUrl.trim();
    if (!v) return;
    addAsset({
      kind: "link",
      name: v,
      meta: "等待 AI 抓取正文",
    });
    setLinkUrl("");
  };

  const handleFiles = (fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    Array.from(fl).forEach((f) => {
      addAsset({
        kind: "file",
        name: f.name,
        meta: formatBytes(f.size),
      });
    });
  };

  const submitMeeting = () => {
    addAsset({
      kind: "meeting",
      name: `腾讯会议 · ${new Date().toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      })} 会议纪要`,
      meta: "会议纪要 + 转写文本",
    });
  };

  const submitPaste = () => {
    const v = pasteText.trim();
    if (!v) return;
    const preview = v.slice(0, 32).replace(/\s+/g, " ");
    addAsset({
      kind: "paste",
      name: `粘贴片段：${preview}${v.length > 32 ? "…" : ""}`,
      meta: `${v.length} 字`,
    });
    setPasteText("");
    setPasteOpen(false);
  };

  /* —— 一键 AI 解析 —— */

  const runParseAll = () => {
    if (assets.length === 0 || parsing) return;
    setParsing(true);
    setDone(false);
    // demo：模拟解析过程，2.2s 后完成
    window.setTimeout(() => {
      setParsing(false);
      setDone(true);
      onParseAll?.(assets);
      // 2s 后清除"已完成"状态
      window.setTimeout(() => setDone(false), 2000);
    }, 2200);
  };

  /* —— UI —— */

  return (
    <aside className="w-full h-full">
      <div className="bg-white flex flex-col h-full">
        {/* 顶部 Nexus AI 标识（与发布后右侧 AI 摘要面板保持一致） */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-100">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-ai-500 to-ai-600 flex items-center justify-center shadow-[0_3px_8px_-2px_rgba(139,92,246,0.45)]">
            <Sparkles className="w-3 h-3 text-white" strokeWidth={2.6} />
          </div>
          <span className="text-[14px] font-semibold text-ink-900">
            Nexus AI
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ai-50 text-ai-700 border border-ai-100">
            AI
          </span>
        </div>

        {/* 副标题：解析说明 */}
        <div className="px-4 pt-3 pb-2">
          <h3 className="text-[13px] font-semibold text-ink-900 leading-tight">
            导入已有内容，AI 帮你快速生成子主题
          </h3>
          <p className="mt-1 text-[11.5px] text-ink-500 leading-relaxed">
            先把素材投递进来，再一键 AI 解析为子主题草稿
          </p>
        </div>

        {/* 内容区：可滚动 */}
        <div className="px-4 pb-3 flex-1 overflow-y-auto space-y-4">
          {/* —— 推荐方式：4 个投递入口 —— */}
          <section>
            <SectionTitle>推荐方式</SectionTitle>
            <div className="mt-2 space-y-2.5">
              {/* 链接 */}
              <PanelCard
                tone="violet"
                icon={<Link2 className="w-4 h-4" />}
                title="粘贴链接快速导入"
                desc="支持网页、腾讯文档、HTML 等链接"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitLink();
                    }}
                    placeholder="粘贴链接到此处（如：https://...）"
                    className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-ink-200 text-[12px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={submitLink}
                    disabled={!linkUrl.trim()}
                  >
                    添加
                  </Button>
                </div>
                <SourceRow
                  label="支持来源"
                  chips={[
                    {
                      icon: <Globe className="w-3 h-3" />,
                      label: "网页",
                    },
                    {
                      icon: <FileType2 className="w-3 h-3 text-blue-500" />,
                      label: "腾讯文档",
                    },
                    { icon: <Link2 className="w-3 h-3" />, label: "HTML" },
                  ]}
                />
              </PanelCard>

              {/* 文件 */}
              <PanelCard
                tone="blue"
                icon={<Upload className="w-4 h-4" />}
                title="拖拽或上传文件导入"
                desc="支持 PDF、Word、PPT、图片、音频等多种格式"
              >
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "cursor-pointer rounded-lg border-2 border-dashed py-3 px-3 text-center transition-colors",
                    isDragOver
                      ? "border-brand-500 bg-brand-50/60"
                      : "border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/30",
                  )}
                >
                  <CloudUpload
                    className={cn(
                      "w-5 h-5 mx-auto mb-1",
                      isDragOver ? "text-brand-600" : "text-ink-400",
                    )}
                  />
                  <div className="text-[12px] font-medium text-ink-700">
                    点击上传或拖拽文件到此处
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-ink-400">
                    可同时上传多个文件
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleFiles(e.target.files);
                      // 同一文件名再次选择仍能触发
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  />
                </div>
                <SourceRow
                  label="支持格式"
                  chips={[
                    {
                      icon: <FileType2 className="w-3 h-3 text-rose-500" />,
                      label: "PDF",
                    },
                    {
                      icon: <FileType2 className="w-3 h-3 text-blue-500" />,
                      label: "Word",
                    },
                    {
                      icon: (
                        <Presentation className="w-3 h-3 text-orange-500" />
                      ),
                      label: "PPT",
                    },
                    {
                      icon: <ImageIcon className="w-3 h-3 text-emerald-500" />,
                      label: "图片",
                    },
                    {
                      icon: <AudioLines className="w-3 h-3 text-violet-500" />,
                      label: "音频",
                    },
                    { label: "更多" },
                  ]}
                />
              </PanelCard>

              {/* 腾讯会议 */}
              <PanelCard
                tone="emerald"
                icon={<Video className="w-4 h-4" />}
                title="腾讯会议内容导入"
                desc="一键导入会议纪要、录音转写、会议材料等内容"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={submitMeeting}
                >
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  添加腾讯会议
                </Button>
              </PanelCard>

              {/* 粘贴 */}
              <PanelCard
                tone="amber"
                icon={<ClipboardPaste className="w-4 h-4" />}
                title="粘贴文本或 Markdown"
                desc="支持粘贴文本、Markdown 内容，AI 自动整理排版"
              >
                {!pasteOpen ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setPasteOpen(true)}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
                    粘贴文本 / Markdown
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      rows={4}
                      placeholder="粘贴文本、Markdown 片段、聊天记录..."
                      className="w-full px-2.5 py-2 rounded-lg bg-white border border-ink-200 text-[12px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-ink-400">
                        {pasteText.length} 字
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPasteOpen(false);
                            setPasteText("");
                          }}
                        >
                          取消
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!pasteText.trim()}
                          onClick={submitPaste}
                        >
                          添加
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </PanelCard>
            </div>
          </section>

          {/* —— 已上传素材：统一展示 + 单条移除 —— */}
          <section>
            <div className="flex items-center justify-between">
              <SectionTitle>
                已上传素材
                {assets.length > 0 && (
                  <span className="ml-1 text-brand-600 font-semibold">
                    · {assets.length}
                  </span>
                )}
              </SectionTitle>
              {assets.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] text-ink-400 hover:text-ink-700 transition-colors"
                >
                  全部清空
                </button>
              )}
            </div>

            {assets.length === 0 ? (
              <div className="mt-2 rounded-md border border-dashed border-ink-200 bg-ink-50/40 py-6 px-4 flex flex-col items-center text-center">
                <Inbox className="w-6 h-6 text-ink-300 mb-1.5" />
                <div className="text-[12px] text-ink-500">
                  还没有素材
                </div>
                <div className="mt-0.5 text-[11px] text-ink-400 leading-relaxed">
                  通过上方任意方式添加素材，AI 会一次性解析它们
                </div>
              </div>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {assets.map((a) => (
                  <AssetItem
                    key={a.id}
                    asset={a}
                    onRemove={() => removeAsset(a.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* —— 底部：AI 一键解析按钮 —— */}
        <div className="px-4 pt-3 pb-4 border-t border-ink-100 bg-gradient-to-b from-white to-ink-50/40">
          <button
            onClick={runParseAll}
            disabled={assets.length === 0 || parsing}
            className={cn(
              "relative w-full h-11 rounded-md text-[13.5px] font-semibold transition-all overflow-hidden",
              "inline-flex items-center justify-center gap-2",
              assets.length === 0
                ? "bg-ink-100 text-ink-400 cursor-not-allowed"
                : parsing
                ? "bg-gradient-to-r from-brand-500 to-violet-500 text-white shadow-brand cursor-wait"
                : done
                ? "bg-emerald-500 text-white shadow-card"
                : "bg-gradient-to-r from-brand-500 to-violet-500 text-white shadow-brand hover:shadow-popover hover:scale-[1.01] active:scale-[0.99]",
            )}
          >
            {/* 解析中扫光 */}
            {parsing && (
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            )}
            {parsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI 正在解析 {assets.length} 个素材…
              </>
            ) : done ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                解析完成，已生成子主题草稿
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI 一键解析{" "}
                {assets.length > 0 && `（${assets.length}）`}，生成子主题草稿
              </>
            )}
          </button>
          <p className="mt-2 text-[10.5px] text-ink-400 text-center leading-relaxed">
            解析完成后，每个素材会自动生成一个对应的子主题，可在左侧继续编辑
          </p>
        </div>
      </div>

      {/* 扫光动画的 keyframes（局部声明） */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </aside>
  );
}

/* ——————————————————— 子组件 ——————————————————— */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wide text-ink-500 uppercase">
      {children}
    </div>
  );
}

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

function PanelCard({
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
      className={cn("rounded-md bg-white border p-3 transition-all", t.border)}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            t.iconBg,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-ink-900 leading-tight">
            {title}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-500 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
      {children && <div className="mt-2.5">{children}</div>}
    </div>
  );
}

function SourceRow({
  label,
  chips,
}: {
  label: string;
  chips: { icon?: React.ReactNode; label: string }[];
}) {
  return (
    <div className="mt-2.5">
      <div className="text-[10.5px] text-ink-400 mb-1">{label}：</div>
      <div className="flex flex-wrap gap-1">
        {chips.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-ink-50 border border-ink-200/70 text-[10px] text-ink-600"
          >
            {c.icon}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function AssetItem({
  asset,
  onRemove,
}: {
  asset: ImportAsset;
  onRemove: () => void;
}) {
  const badge = getKindBadge(asset.kind);
  // 文件类型用文件后缀图标；其他类型用 kind 图标
  let LeftIcon: React.ComponentType<{ className?: string }> = badge.Icon;
  let leftTone = badge.tone;
  if (asset.kind === "file") {
    const f = getFileKindIcon(asset.name);
    LeftIcon = f.Icon;
    leftTone = f.tone;
  } else if (asset.kind === "meeting") {
    LeftIcon = Mic;
  }

  return (
    <li className="group flex items-center gap-2 p-2 rounded-lg border border-ink-200/70 bg-white hover:border-ink-300 transition-colors">
      <div
        className={cn(
          "w-8 h-8 rounded-md inline-flex items-center justify-center shrink-0",
          leftTone,
        )}
      >
        <LeftIcon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0 rounded text-[10px] font-medium shrink-0",
              badge.tone,
            )}
          >
            {badge.label}
          </span>
          <span className="text-[12px] text-ink-900 truncate" title={asset.name}>
            {asset.name}
          </span>
        </div>
        {asset.meta && (
          <div className="text-[10.5px] text-ink-500 mt-0.5 truncate">
            {asset.meta}
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        title="移除"
        className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center transition-opacity shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
