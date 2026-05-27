"use client";

import * as React from "react";
import {
  Sparkles,
  ChevronDown,
  Upload,
  CloudUpload,
  Link2,
  Video,
  ClipboardPaste,
  X,
  FileType2,
  Mic,
  Search,
  Calendar,
  Users,
  Check,
  Pencil,
  Trash2,
  Presentation,
  FileText,
  Image as ImageIcon,
  AudioLines,
  Globe,
  FileSpreadsheet,
  FileCode,
  Loader2,
  CheckCircle2,
  Layers,
  Files,
  PackageOpen,
  Wand2,
} from "lucide-react";
import { cn, formatBytes, uid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { ImportAsset, AssetKind } from "./ImportPanel";

export type ParseMode =
  | "single-to-one" // 单文件 → 1 个 Event
  | "single-to-many" // 单文件 → 按章节拆成多个 Event
  | "multi-to-one" // 多文件 → 合并为 1 个 Event
  | "multi-to-many"; // 多文件 → 每个文件 1 个 Event

export interface ImportLauncherV2Props {
  /** 解析触发，外层根据 mode 与素材内容生成 blocks */
  onParse: (assets: ImportAsset[], mode: ParseMode) => void;
  /** 解析中（由父级控制，配合解析动画） */
  parsing?: boolean;
  /** 解析完成短暂态 */
  done?: boolean;
}

type ExpandKey = "link" | "paste" | null;

/**
 * V2 版本 · 一体化素材导入与解析
 *
 * 与 v1 区别：
 * - 4 个导入入口仍在折叠区内
 * - 素材列表"内嵌"在展开框里（不再去右侧素材库）
 * - 底部根据"选中文件数"切换两种操作模式：
 *   · 单选 → 解析为 1 个 Event / 按章节拆成多个 Event
 *   · 多选 → 合并为 1 个 Event / 每个文件 1 个 Event
 */
export function ImportLauncherV2({
  onParse,
  parsing = false,
  done = false,
}: ImportLauncherV2Props) {
  const [open, setOpen] = React.useState(false); // 默认收起，等用户主动展开
  const [expanded, setExpanded] = React.useState<ExpandKey>(null);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [pasteText, setPasteText] = React.useState("");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [meetingPickerOpen, setMeetingPickerOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // —— 素材状态在内部管理 ——
  const [assets, setAssets] = React.useState<ImportAsset[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const addAsset = (a: ImportAsset) => {
    setAssets((prev) => [...prev, a]);
    setSelectedIds((prev) => [...prev, a.id]); // 新加入默认选中
  };

  const removeAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const renameAsset = (id: string, name: string) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => setSelectedIds(assets.map((a) => a.id));
  const clearSelection = () => setSelectedIds([]);

  // —— 4 种导入投递 ——
  const submitLink = () => {
    const v = linkUrl.trim();
    if (!v) return;
    addAsset({
      id: uid(),
      kind: "link",
      name: v,
      meta: "等待 AI 抓取正文",
    });
    setLinkUrl("");
    setExpanded(null);
  };

  const handleFiles = (fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    Array.from(fl).forEach((f) => {
      addAsset({
        id: uid(),
        kind: "file",
        name: f.name,
        meta: formatBytes(f.size),
      });
    });
  };

  const submitMeeting = (m: MockMeeting) => {
    addAsset({
      id: uid(),
      kind: "meeting",
      name: `腾讯会议 · ${m.title}`,
      meta: `${m.date}  ·  ${m.duration}  ·  ${m.attendees}人参会`,
    });
    setMeetingPickerOpen(false);
  };

  const submitPaste = () => {
    const v = pasteText.trim();
    if (!v) return;
    const preview = v.slice(0, 32).replace(/\s+/g, " ");
    addAsset({
      id: uid(),
      kind: "paste",
      name: `粘贴片段：${preview}${v.length > 32 ? "…" : ""}`,
      meta: `${v.length} 字`,
    });
    setPasteText("");
    setExpanded(null);
  };

  // —— 解析触发 ——
  const selectedAssets = React.useMemo(
    () => assets.filter((a) => selectedIds.includes(a.id)),
    [assets, selectedIds],
  );

  const handleParse = (mode: ParseMode) => {
    if (selectedAssets.length === 0 || parsing) return;
    onParse(selectedAssets, mode);
  };

  // 单/多素材模式
  const selectedCount = selectedIds.length;
  const singleSelected = selectedCount === 1;
  const multiSelected = selectedCount >= 2;

  return (
    <section
      className={cn(
        "rounded-lg bg-white border transition-all",
        open
          ? "border-ai-200 shadow-card"
          : "border-ink-200 shadow-card hover:border-ai-300",
      )}
    >
      {/* 折叠态触发条 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-5 py-3 text-left transition-colors rounded-lg",
          open ? "bg-ai-50/30" : "hover:bg-ai-50/20",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-ai-500 to-ai-600 flex items-center justify-center shadow-[0_3px_8px_-2px_rgba(139,92,246,0.45)] shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-ink-900 leading-none">
                AI 可导入业务内容，快速生成 Event
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ai-50 text-ai-700 border border-ai-100 leading-none">
                AI
              </span>
              {assets.length > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 leading-none">
                  {assets.length} 个素材
                </span>
              )}
            </div>
            <div className="mt-1 text-[11.5px] text-ink-500 leading-none">
              {open
                ? "导入素材后，下方选择「单文件 / 多文件」对应的解析模式"
                : "需要 AI 帮忙整理已有素材？点开开始"}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-[11.5px] text-ink-500">
          <ChevronDown
            className={cn(
              "w-4 h-4 text-ink-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* 展开内容 */}
      {open && (
        <div className="px-5 pb-5 pt-1 animate-fadeUp space-y-4">
          {/* === A. 大文件拖拽框 === */}
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
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden",
              "px-6 py-8 flex flex-col items-center justify-center text-center",
              isDragOver
                ? "border-ai-500 bg-ai-50/60"
                : "border-ink-300 bg-gradient-to-b from-ink-50/60 to-white hover:border-ai-400 hover:bg-ai-50/30",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.08), transparent 60%)",
              }}
            />
            <div
              className={cn(
                "relative w-12 h-12 rounded-2xl inline-flex items-center justify-center transition-all",
                isDragOver
                  ? "bg-ai-500 text-white scale-110"
                  : "bg-white text-ai-600 border border-ai-200 shadow-card",
              )}
            >
              {isDragOver ? (
                <CloudUpload className="w-5 h-5" strokeWidth={1.8} />
              ) : (
                <Upload className="w-5 h-5" strokeWidth={1.8} />
              )}
            </div>
            <div className="relative mt-3 text-[14px] font-semibold text-ink-900">
              {isDragOver ? "释放即可上传" : "上传文件 / 拖拽文件到此处"}
            </div>
            <div className="relative mt-1 text-[11.5px] text-ink-500">
              支持 PDF、Word、PPT、图片、音频等多种格式 · 可多选
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            />
          </div>

          {/* === B. 其他来源 === */}
          <div className="flex items-center gap-2 text-[11px] text-ink-400">
            <div className="flex-1 h-px bg-ink-100" />
            <span className="px-2 select-none">或通过其他来源导入</span>
            <div className="flex-1 h-px bg-ink-100" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <SmallChip
              tone="violet"
              icon={<Link2 className="w-3.5 h-3.5" />}
              label="粘贴链接"
              active={expanded === "link"}
              onClick={() =>
                setExpanded((cur) => (cur === "link" ? null : "link"))
              }
            />
            <SmallChip
              tone="emerald"
              icon={<Video className="w-3.5 h-3.5" />}
              label="腾讯会议导入"
              onClick={() => setMeetingPickerOpen(true)}
            />
            <SmallChip
              tone="amber"
              icon={<ClipboardPaste className="w-3.5 h-3.5" />}
              label="粘贴文本 / Markdown"
              active={expanded === "paste"}
              onClick={() =>
                setExpanded((cur) => (cur === "paste" ? null : "paste"))
              }
            />
          </div>

          {/* 链接展开 */}
          {expanded === "link" && (
            <div className="rounded-md border border-violet-200 bg-violet-50/40 p-3 animate-fadeUp">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-violet-600 shrink-0" />
                <input
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitLink();
                    if (e.key === "Escape") setExpanded(null);
                  }}
                  placeholder="粘贴链接到此处（如：https://docs.qq.com/...）"
                  className="flex-1 h-9 px-3 rounded-lg bg-white border border-ink-200 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={submitLink}
                  disabled={!linkUrl.trim()}
                >
                  添加
                </Button>
                <button
                  onClick={() => {
                    setExpanded(null);
                    setLinkUrl("");
                  }}
                  className="w-7 h-7 rounded-md text-ink-400 hover:text-ink-700 hover:bg-ink-100 inline-flex items-center justify-center"
                  aria-label="收起"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {expanded === "paste" && (
            <div className="rounded-md border border-amber-200 bg-amber-50/40 p-3 animate-fadeUp">
              <textarea
                autoFocus
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={4}
                placeholder="粘贴文本、Markdown 片段、聊天记录..."
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-ink-200 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-none leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11.5px] text-ink-400">
                  {pasteText.length} 字
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExpanded(null);
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

          {/* === C. 已导入素材列表（内嵌） === */}
          <div className="rounded-lg border border-ink-200 bg-gradient-to-b from-ink-50/40 to-white overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-ink-100 bg-white/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-brand-50 text-brand-600 inline-flex items-center justify-center">
                  <PackageOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-[13px] font-semibold text-ink-900">
                  已导入素材
                </span>
                <span className="text-[11.5px] text-ink-400">
                  ({assets.length})
                </span>
              </div>
              {assets.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-500">
                    已选 <b className="text-brand-600">{selectedCount}</b> /{" "}
                    {assets.length}
                  </span>
                  <button
                    onClick={
                      selectedCount === assets.length
                        ? clearSelection
                        : selectAll
                    }
                    className="text-[11px] text-ink-500 hover:text-brand-600 px-1.5 py-0.5 rounded hover:bg-ink-100"
                  >
                    {selectedCount === assets.length ? "全不选" : "全选"}
                  </button>
                </div>
              )}
            </div>

            {assets.length === 0 ? (
              <div className="px-3.5 py-7 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-100 text-ink-400 mb-2">
                  <PackageOpen className="w-5 h-5" strokeWidth={1.6} />
                </div>
                <div className="text-[12.5px] text-ink-600">
                  还没有素材
                </div>
                <div className="mt-1 text-[11px] text-ink-400 leading-relaxed">
                  上方拖拽文件，或选择其他来源导入
                </div>
              </div>
            ) : (
              <ul className="px-2 py-2 space-y-1.5 max-h-[300px] overflow-y-auto">
                {assets.map((a) => (
                  <AssetRow
                    key={a.id}
                    asset={a}
                    checked={selectedIds.includes(a.id)}
                    onToggle={() => toggleSelect(a.id)}
                    onRename={(n) => renameAsset(a.id, n)}
                    onRemove={() => removeAsset(a.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* === D. 解析操作栏 === */}
          {assets.length > 0 && (
            <div
              className={cn(
                "rounded-lg border bg-white p-3.5 transition-all",
                selectedCount > 0
                  ? "border-ai-300 ring-2 ring-ai-100/60 shadow-[0_4px_12px_-4px_rgba(139,92,246,0.2)]"
                  : "border-ink-200",
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0",
                      selectedCount > 0
                        ? "bg-gradient-to-br from-ai-500 to-violet-500 text-white"
                        : "bg-ink-100 text-ink-400",
                    )}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-ink-900">
                      AI 解析为 Event
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-500">
                      {selectedCount === 0 &&
                        "勾选 1 个或多个素材，然后选择下方的解析模式"}
                      {singleSelected &&
                        "已选中 1 个素材，可解析为单个 Event 或按章节拆成多个"}
                      {multiSelected &&
                        `已选中 ${selectedCount} 个素材，可合并或一一对应生成 Event`}
                    </div>
                  </div>
                </div>
                {parsing && (
                  <div className="shrink-0 inline-flex items-center gap-1.5 text-[11.5px] text-ai-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI 正在解析…
                  </div>
                )}
                {done && (
                  <div className="shrink-0 inline-flex items-center gap-1.5 text-[11.5px] text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    解析完成
                  </div>
                )}
              </div>

              {/* 操作按钮组 */}
              {selectedCount === 0 && (
                <div className="text-[11.5px] text-ink-400 px-1 py-1">
                  在上方素材列表中勾选要解析的素材
                </div>
              )}

              {singleSelected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ActionBtn
                    primary
                    disabled={parsing}
                    onClick={() => handleParse("single-to-one")}
                    icon={<Layers className="w-4 h-4" />}
                    title="解析为 1 个 Event"
                    desc="把整份素材浓缩成一段结构化的 Event 草稿"
                  />
                  <ActionBtn
                    disabled={parsing}
                    onClick={() => handleParse("single-to-many")}
                    icon={<Files className="w-4 h-4" />}
                    title="按章节拆成多个 Event"
                    desc="按 PPT 页 / PDF 章 / Word H1 智能分段"
                  />
                </div>
              )}

              {multiSelected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ActionBtn
                    primary
                    disabled={parsing}
                    onClick={() => handleParse("multi-to-one")}
                    icon={<Layers className="w-4 h-4" />}
                    title="合并为 1 个 Event"
                    desc="AI 综合解析，整合成单条图文并茂的 Event"
                  />
                  <ActionBtn
                    disabled={parsing}
                    onClick={() => handleParse("multi-to-many")}
                    icon={<Files className="w-4 h-4" />}
                    title="每个文件 1 个 Event"
                    desc={`${selectedCount} 个素材 → ${selectedCount} 个独立 Event`}
                  />
                </div>
              )}

              {/* 注入位置提示 */}
              {selectedCount > 0 && (
                <div className="mt-2.5 px-2 py-1.5 rounded-md bg-ai-50/40 border border-ai-100 text-[11px] text-ai-700 inline-flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-ai-500" />
                  解析后的内容将注入到当前选中的 Event 中
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 腾讯会议选择弹层 */}
      {meetingPickerOpen && (
        <MeetingPickerModal
          onClose={() => setMeetingPickerOpen(false)}
          onPick={submitMeeting}
        />
      )}
    </section>
  );
}

/* ——————————————————— 子组件 ——————————————————— */

const TONE_MAP = {
  violet: {
    iconBg: "bg-violet-50 text-violet-600",
    border: "border-ink-200 hover:border-violet-300 hover:bg-violet-50/40",
    activeBorder: "border-violet-400 bg-violet-50/60",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600",
    border: "border-ink-200 hover:border-emerald-300 hover:bg-emerald-50/40",
    activeBorder: "border-emerald-400 bg-emerald-50/60",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600",
    border: "border-ink-200 hover:border-amber-300 hover:bg-amber-50/40",
    activeBorder: "border-amber-400 bg-amber-50/60",
  },
} as const;

function SmallChip({
  tone,
  icon,
  label,
  active,
  onClick,
}: {
  tone: keyof typeof TONE_MAP;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const t = TONE_MAP[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-white border text-[12.5px] text-ink-700 transition-all",
        active ? t.activeBorder : t.border,
      )}
    >
      <span
        className={cn(
          "w-5 h-5 rounded-full inline-flex items-center justify-center",
          t.iconBg,
        )}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

/* —— 素材行 —— */

function getFileIconMeta(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext))
    return { Icon: FileType2, tone: "text-rose-500 bg-rose-50" };
  if (["ppt", "pptx", "key"].includes(ext))
    return { Icon: Presentation, tone: "text-orange-500 bg-orange-50" };
  if (["doc", "docx"].includes(ext))
    return { Icon: FileText, tone: "text-blue-500 bg-blue-50" };
  if (["xls", "xlsx", "csv"].includes(ext))
    return { Icon: FileSpreadsheet, tone: "text-emerald-500 bg-emerald-50" };
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return { Icon: ImageIcon, tone: "text-violet-500 bg-violet-50" };
  if (["mp3", "wav", "m4a", "flac", "aac"].includes(ext))
    return { Icon: AudioLines, tone: "text-pink-500 bg-pink-50" };
  if (["html", "htm"].includes(ext))
    return { Icon: FileCode, tone: "text-cyan-500 bg-cyan-50" };
  return { Icon: FileText, tone: "text-ink-500 bg-ink-100" };
}

function getKindIconMeta(kind: AssetKind, name: string) {
  switch (kind) {
    case "file":
      return getFileIconMeta(name);
    case "link":
      return { Icon: Globe, tone: "text-violet-500 bg-violet-50" };
    case "meeting":
      return { Icon: Mic, tone: "text-emerald-500 bg-emerald-50" };
    case "paste":
      return { Icon: ClipboardPaste, tone: "text-amber-500 bg-amber-50" };
  }
}

function AssetRow({
  asset,
  checked,
  onToggle,
  onRename,
  onRemove,
}: {
  asset: ImportAsset;
  checked: boolean;
  onToggle: () => void;
  onRename: (n: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(asset.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!editing) setDraft(asset.name);
  }, [asset.name, editing]);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commitRename = () => {
    const v = draft.trim();
    if (v && v !== asset.name) {
      onRename(v);
    }
    setEditing(false);
  };

  const meta = getKindIconMeta(asset.kind, asset.name);
  const Icon = meta.Icon;

  return (
    <li
      className={cn(
        "group flex items-center gap-2.5 p-2 rounded-md border transition-all cursor-pointer",
        checked
          ? "border-brand-300 bg-brand-50/40"
          : "border-ink-200/70 bg-white hover:border-ink-300 hover:bg-ink-50/40",
      )}
      onClick={(e) => {
        if (editing) return;
        if ((e.target as HTMLElement).closest("[data-stop]")) return;
        onToggle();
      }}
    >
      {/* 复选框 */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-stop
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "w-4 h-4 rounded border-2 inline-flex items-center justify-center transition-all shrink-0",
          checked
            ? "bg-brand-500 border-brand-500 text-white shadow-sm"
            : "bg-white border-ink-300 hover:border-brand-400",
        )}
      >
        {checked && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      {/* 文件类型图标 */}
      <div
        className={cn(
          "w-8 h-8 rounded-md inline-flex items-center justify-center shrink-0",
          meta.tone,
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={1.8} />
      </div>

      {/* 名称 + 元信息 */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            data-stop
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitRename();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setDraft(asset.name);
                setEditing(false);
              }
            }}
            onBlur={commitRename}
            className="w-full px-1.5 py-0.5 text-[12.5px] text-ink-900 border border-brand-300 rounded outline-none bg-white"
          />
        ) : (
          <div
            className="text-[12.5px] text-ink-900 leading-tight truncate"
            title={asset.name}
          >
            {asset.name}
          </div>
        )}
        {asset.meta && !editing && (
          <div className="text-[11px] text-ink-500 mt-0.5 truncate">
            {asset.meta}
          </div>
        )}
      </div>

      {/* 操作 */}
      <div
        className="flex items-center gap-0.5 shrink-0"
        data-stop
        onClick={(e) => e.stopPropagation()}
      >
        {!editing && (
          <>
            <button
              type="button"
              title="重命名"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded text-ink-400 hover:text-brand-600 hover:bg-brand-50 inline-flex items-center justify-center transition-opacity"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="删除"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded text-ink-400 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

/* —— 解析动作按钮 —— */

function ActionBtn({
  primary,
  disabled,
  onClick,
  icon,
  title,
  desc,
}: {
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative text-left rounded-md border px-3 py-2.5 transition-all overflow-hidden flex items-start gap-2.5",
        primary
          ? "bg-gradient-to-br from-ai-500 to-violet-500 text-white border-transparent hover:shadow-[0_4px_12px_-2px_rgba(139,92,246,0.4)] disabled:from-ink-300 disabled:to-ink-300 disabled:cursor-not-allowed"
          : "bg-white border-ink-200 text-ink-800 hover:border-ai-300 hover:bg-ai-50/30 disabled:opacity-50 disabled:cursor-not-allowed",
      )}
    >
      <div
        className={cn(
          "shrink-0 w-7 h-7 rounded-md inline-flex items-center justify-center",
          primary ? "bg-white/15 text-white" : "bg-ai-50 text-ai-600",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-[12.5px] font-semibold leading-tight",
            primary ? "text-white" : "text-ink-900",
          )}
        >
          {title}
        </div>
        <div
          className={cn(
            "mt-1 text-[10.5px] leading-relaxed",
            primary ? "text-white/85" : "text-ink-500",
          )}
        >
          {desc}
        </div>
      </div>
    </button>
  );
}

/* ——————————————————— 腾讯会议选择浮层（与 v1 一致） ——————————————————— */

interface MockMeeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  attendees: number;
  host: string;
  recurring?: boolean;
}

const MOCK_MEETINGS: MockMeeting[] = [
  {
    id: "m1",
    title: "SSV 周进度同步会 · 第 21 周",
    date: "2026-05-21 10:00",
    duration: "58 分钟",
    attendees: 12,
    host: "王志恒",
    recurring: true,
  },
  {
    id: "m2",
    title: "Nexus 产品评审 · v0.6 发布前",
    date: "2026-05-20 16:30",
    duration: "1 小时 24 分钟",
    attendees: 8,
    host: "马巍",
  },
  {
    id: "m3",
    title: "SSV × CarbonX 月度复盘",
    date: "2026-05-19 14:00",
    duration: "2 小时 12 分钟",
    attendees: 21,
    host: "王芳",
    recurring: true,
  },
  {
    id: "m4",
    title: "西部少年 AI 课堂 · 二期方案讨论",
    date: "2026-05-18 09:30",
    duration: "47 分钟",
    attendees: 6,
    host: "刘洋",
  },
  {
    id: "m5",
    title: "SSV 技术架构周会",
    date: "2026-05-17 11:00",
    duration: "1 小时 5 分钟",
    attendees: 10,
    host: "周宇",
    recurring: true,
  },
];

function MeetingPickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (m: MockMeeting) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [pickedId, setPickedId] = React.useState<string | null>(null);

  const list = MOCK_MEETINGS.filter(
    (m) => m.title.includes(query) || m.host.includes(query),
  );

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleConfirm = () => {
    const m = MOCK_MEETINGS.find((x) => x.id === pickedId);
    if (m) onPick(m);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeUp"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] max-h-[80vh] bg-white rounded-xl shadow-popover border border-ink-200 overflow-hidden flex flex-col"
      >
        <div className="px-5 pt-4 pb-3 border-b border-ink-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 inline-flex items-center justify-center">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <span className="text-[14.5px] font-semibold text-ink-900">
                从腾讯会议导入
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-ink-500 leading-relaxed">
              已自动拉取你最近 7 天结束的会议，选择需要导入的会议纪要 / 转写
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md text-ink-400 hover:text-ink-900 hover:bg-ink-100 inline-flex items-center justify-center"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索会议主题或主持人"
              className="w-full h-9 pl-8 pr-3 rounded-md bg-ink-50 border border-transparent focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none text-[12.5px] text-ink-800 placeholder:text-ink-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2">
          {list.length === 0 ? (
            <div className="text-[12px] text-ink-400 px-2 py-12 text-center">
              没有找到匹配的会议
            </div>
          ) : (
            <ul className="space-y-1.5">
              {list.map((m) => {
                const active = pickedId === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setPickedId(m.id)}
                      className={cn(
                        "w-full text-left rounded-md border px-3 py-2.5 transition-all flex items-start gap-2.5",
                        active
                          ? "border-emerald-500 ring-1 ring-emerald-100 bg-emerald-50/40"
                          : "border-ink-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20",
                      )}
                    >
                      <div
                        className={cn(
                          "shrink-0 w-9 h-9 rounded-md inline-flex items-center justify-center",
                          active
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-50 text-emerald-600",
                        )}
                      >
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-semibold text-ink-900">
                            {m.title}
                          </span>
                          {m.recurring && (
                            <span className="shrink-0 inline-flex items-center px-1.5 py-px rounded-sm bg-blue-50 text-blue-700 text-[10px] border border-blue-100 leading-none">
                              周期会议
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {m.date}
                          </span>
                          <span className="text-ink-300">·</span>
                          <span>{m.duration}</span>
                          <span className="text-ink-300">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {m.attendees} 人
                          </span>
                          <span className="text-ink-300">·</span>
                          <span>主持人：{m.host}</span>
                        </div>
                      </div>
                      {active && (
                        <span className="shrink-0 mt-1 w-5 h-5 rounded-full bg-emerald-500 text-white inline-flex items-center justify-center">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t border-ink-100 bg-ink-50/40 flex items-center justify-between gap-3">
          <span className="text-[11.5px] text-ink-500">
            {pickedId ? "已选择 1 场会议" : "请选择 1 场会议"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!pickedId}
              onClick={handleConfirm}
            >
              <Sparkles className="w-3.5 h-3.5" />
              导入到素材列表
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
