"use client";

import * as React from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Pencil,
  Trash2,
  Check,
  FileType2,
  Presentation,
  FileText,
  Image as ImageIcon,
  AudioLines,
  Globe,
  Mic,
  ClipboardPaste,
  FileCode,
  FileSpreadsheet,
  PackageOpen,
  ArrowRight,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import type { ImportAsset, AssetKind } from "./ImportPanel";

export interface MaterialLibraryProps {
  assets: ImportAsset[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRename: (id: string, nextName: string) => void;
  onRemove: (id: string) => void;
  onParseSelected: () => void;
  parsing: boolean;
  done: boolean;
}

/* ——————————————————— 工具：按文件后缀挑图标 / 颜色 ——————————————————— */

interface IconMeta {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: string | number }>;
  /** 容器底色 + 图标色 */
  tone: string;
}

function getFileIconMeta(fileName: string): IconMeta {
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
  if (["txt", "md"].includes(ext))
    return { Icon: FileText, tone: "text-ink-500 bg-ink-100" };
  return { Icon: FileText, tone: "text-ink-500 bg-ink-100" };
}

function getKindIconMeta(kind: AssetKind, name: string): IconMeta {
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

/* ——————————————————— 主组件 ——————————————————— */

export function MaterialLibrary({
  assets,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onRename,
  onRemove,
  onParseSelected,
  parsing,
  done,
}: MaterialLibraryProps) {
  const selectedAssets = React.useMemo(
    () => assets.filter((a) => selectedIds.includes(a.id)),
    [assets, selectedIds],
  );
  const allSelected = assets.length > 0 && selectedIds.length === assets.length;

  // 选中素材的总大小（仅 file 有真实 size，meta 文本"X.X MB"）
  const selectedSizeText = React.useMemo(() => {
    let bytes = 0;
    let hasUnknown = false;
    selectedAssets.forEach((a) => {
      if (a.kind === "file" && a.meta) {
        const m = a.meta.match(
          /^([\d.]+)\s*(B|KB|MB|GB)$/i,
        );
        if (m) {
          const n = parseFloat(m[1]);
          const unit = m[2].toUpperCase();
          const mul =
            unit === "GB"
              ? 1024 ** 3
              : unit === "MB"
              ? 1024 ** 2
              : unit === "KB"
              ? 1024
              : 1;
          bytes += n * mul;
        } else {
          hasUnknown = true;
        }
      } else {
        hasUnknown = true;
      }
    });
    if (bytes <= 0) return null;
    return `共 ${formatBytes(bytes)}${hasUnknown ? "+" : ""}`;
  }, [selectedAssets]);

  return (
    <aside className="w-full h-full bg-white flex flex-col">
      {/* 顶部 Nexus AI 标识 */}
      <div className="flex items-start gap-2.5 px-4 py-3.5 border-b border-ink-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ai-500 to-ai-600 flex items-center justify-center shadow-[0_3px_8px_-2px_rgba(139,92,246,0.45)] shrink-0">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-ink-900 leading-none">
              Nexus AI
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ai-50 text-ai-700 border border-ai-100 leading-none">
              AI
            </span>
          </div>
          <div className="mt-1 text-[11px] text-ink-500 leading-none">
            素材中心 · 智能解析助手
          </div>
        </div>
      </div>

      {/* 标题栏：仅在已有素材时显示 */}
      {assets.length > 0 && (
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <h3 className="text-[13.5px] font-semibold text-ink-900">
            已上传素材
            <span className="ml-1 text-ink-500 font-medium">
              ({assets.length})
            </span>
          </h3>
          <button
            type="button"
            onClick={allSelected ? onClearSelection : onSelectAll}
            className="text-[11.5px] text-ink-500 hover:text-brand-600 transition-colors px-1.5 py-0.5 rounded hover:bg-ink-100"
          >
            {allSelected ? "全不选" : "全选"}
          </button>
        </div>
      )}

      {/* 列表区 */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {assets.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-1.5 pt-1">
            {assets.map((a) => (
              <AssetRow
                key={a.id}
                asset={a}
                checked={selectedIds.includes(a.id)}
                onToggle={() => onToggleSelect(a.id)}
                onRename={(name) => onRename(a.id, name)}
                onRemove={() => onRemove(a.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* 底部：选中统计 + AI 一键解析 */}
      <div className="border-t border-ink-100 bg-gradient-to-b from-white to-ink-50/40 px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-ink-700">
            {selectedIds.length > 0 ? (
              <>
                已选择{" "}
                <span className="font-semibold text-brand-600">
                  {selectedIds.length}
                </span>{" "}
                项
              </>
            ) : (
              <span className="text-ink-400">未选中任何素材</span>
            )}
          </span>
          {selectedSizeText && (
            <span className="text-[11px] text-ink-400">{selectedSizeText}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onParseSelected}
          disabled={selectedIds.length === 0 || parsing}
          className={cn(
            "relative w-full h-11 rounded-md text-[13.5px] font-semibold transition-all overflow-hidden",
            "inline-flex items-center justify-center gap-2",
            selectedIds.length === 0
              ? "bg-ink-100 text-ink-400 cursor-not-allowed"
              : parsing
              ? "bg-gradient-to-r from-brand-500 to-violet-500 text-white shadow-brand cursor-wait"
              : done
              ? "bg-emerald-500 text-white shadow-card"
              : "bg-gradient-to-r from-brand-500 to-violet-500 text-white shadow-brand hover:shadow-popover hover:scale-[1.01] active:scale-[0.99]",
          )}
        >
          {parsing && (
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          )}
          {parsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI 正在解析 {selectedIds.length} 个素材…
            </>
          ) : done ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              解析完成，已生成子主题草稿
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI 一键解析，生成子主题草稿
            </>
          )}
        </button>

        <p className="mt-2 text-[10.5px] text-ink-400 text-center leading-relaxed">
          解析完成后，内容将自动填充到子主题编辑器中
          <br />
          可在编辑器中继续修改和完善
        </p>
      </div>

      {/* 扫光动画 keyframes */}
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

/* ——————————————————— 单条素材行 ——————————————————— */

interface AssetRowProps {
  asset: ImportAsset;
  checked: boolean;
  onToggle: () => void;
  onRename: (next: string) => void;
  onRemove: () => void;
}

function AssetRow({
  asset,
  checked,
  onToggle,
  onRename,
  onRemove,
}: AssetRowProps) {
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
        "group relative flex items-center gap-2.5 p-2 pr-2 rounded-md border transition-all cursor-pointer",
        checked
          ? "border-brand-300 bg-brand-50/40"
          : "border-ink-200/70 bg-white hover:border-ink-300 hover:bg-ink-50/40",
      )}
      onClick={(e) => {
        // 点击行任意空白处即切换选中（编辑/按钮内部已 stopPropagation）
        if (editing) return;
        if ((e.target as HTMLElement).closest("[data-stop]")) return;
        onToggle();
      }}
    >
      {/* 文件类型图标 */}
      <div
        className={cn(
          "w-9 h-9 rounded-md inline-flex items-center justify-center shrink-0",
          meta.tone,
        )}
      >
        <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
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

      {/* 操作区：hover 显示重命名/删除；选中态始终显示勾 */}
      <div
        className="flex items-center gap-1 shrink-0"
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

        {/* 复选框（自定义） */}
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-all shrink-0",
            checked
              ? "bg-brand-500 border-brand-500 text-white shadow-sm"
              : "bg-white border-ink-300 hover:border-brand-400",
          )}
          title={checked ? "取消选中" : "选中此素材"}
        >
          {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </button>
      </div>
    </li>
  );
}

/* 兼容性占位：避免后续若启用 noUnusedLocals 时图标常量被误判 */

/* ——————————————————— 空态 ——————————————————— */

function EmptyState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 py-8 text-center">
      {/* 顶部装饰：发光的盒子图标 */}
      <div className="relative">
        <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-br from-ai-200/40 via-brand-200/30 to-transparent blur-2xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-ink-50 border border-ink-200/70 shadow-card inline-flex items-center justify-center">
          <PackageOpen
            className="w-8 h-8 text-ai-500"
            strokeWidth={1.6}
          />
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-ai-500 to-brand-500 border-2 border-white inline-flex items-center justify-center shadow-sm">
            <Sparkles className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          </span>
        </div>
      </div>

      <div className="mt-5 text-[14px] font-semibold text-ink-900">
        暂无素材
      </div>
      <div className="mt-2 text-[12px] text-ink-500 leading-relaxed max-w-[240px]">
        这里是你的素材工作台，
        <br />
        导入的内容都会汇总在此
      </div>

      {/* 三步小流程：上传 → 勾选 → 解析（强调本侧角色，与左侧"如何导入"不重复） */}
      <div className="mt-7 flex items-center gap-1.5 text-[11px] text-ink-400">
        <span className="px-2 py-0.5 rounded-full bg-ink-100 text-ink-500">
          导入
        </span>
        <ArrowRight className="w-3 h-3 text-ink-300" strokeWidth={2.4} />
        <span className="px-2 py-0.5 rounded-full bg-ink-100 text-ink-500">
          勾选
        </span>
        <ArrowRight className="w-3 h-3 text-ink-300" strokeWidth={2.4} />
        <span className="px-2 py-0.5 rounded-full bg-ai-50 text-ai-700 border border-ai-100 font-medium">
          AI 解析
        </span>
      </div>
    </div>
  );
}

