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
} from "lucide-react";
import { cn, formatBytes, uid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { ImportAsset } from "./ImportPanel";

export interface ImportLauncherInlineProps {
  /** 用户每完成一次投递（链接 / 文件 / 会议 / 粘贴）回调一次 */
  onAdd: (asset: ImportAsset) => void;
}

type ExpandKey = "link" | "paste" | null;

/**
 * 折叠式 AI 导入区
 *
 * - 默认收起：单行提示「AI 可导入业务内容，快速生成 Event」+ 展开按钮
 * - 展开后：上方为大尺寸文件拖拽区，下方为三个小按钮（链接 / 腾讯会议 / 粘贴文本）
 * - 腾讯会议点击后弹出选择已结束会议的浮层（mock 数据）
 */
export function ImportLauncherInline({ onAdd }: ImportLauncherInlineProps) {
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<ExpandKey>(null);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [pasteText, setPasteText] = React.useState("");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [meetingPickerOpen, setMeetingPickerOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const submitLink = () => {
    const v = linkUrl.trim();
    if (!v) return;
    onAdd({
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
      onAdd({
        id: uid(),
        kind: "file",
        name: f.name,
        meta: formatBytes(f.size),
      });
    });
  };

  const submitMeeting = (m: MockMeeting) => {
    onAdd({
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
    onAdd({
      id: uid(),
      kind: "paste",
      name: `粘贴片段：${preview}${v.length > 32 ? "…" : ""}`,
      meta: `${v.length} 字`,
    });
    setPasteText("");
    setExpanded(null);
  };

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
                AI 可导入业务内容，快速生成子主题
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ai-50 text-ai-700 border border-ai-100 leading-none">
                AI
              </span>
            </div>
            <div className="mt-1 text-[11.5px] text-ink-500 leading-none">
              {open
                ? "拖拽或选择业务文档、链接、会议纪要等，AI 自动整理成子主题草稿"
                : "需要 AI 帮忙整理已有素材？点开查看导入方式"}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-[11.5px] text-ink-500">
          {!open && <span className="text-ai-600 font-medium">展开</span>}
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
        <div className="px-5 pb-5 pt-1 animate-fadeUp">
          {/* 主区：大文件拖拽框（参考 NotebookLM 视觉） */}
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
              "px-6 py-10 flex flex-col items-center justify-center text-center",
              isDragOver
                ? "border-ai-500 bg-ai-50/60"
                : "border-ink-300 bg-gradient-to-b from-ink-50/60 to-white hover:border-ai-400 hover:bg-ai-50/30",
            )}
          >
            {/* 装饰渐变光圈 */}
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
                "relative w-14 h-14 rounded-2xl inline-flex items-center justify-center transition-all",
                isDragOver
                  ? "bg-ai-500 text-white scale-110"
                  : "bg-white text-ai-600 border border-ai-200 shadow-card",
              )}
            >
              {isDragOver ? (
                <CloudUpload className="w-6 h-6" strokeWidth={1.8} />
              ) : (
                <Upload className="w-6 h-6" strokeWidth={1.8} />
              )}
            </div>
            <div className="relative mt-4 text-[15px] font-semibold text-ink-900">
              {isDragOver ? "释放即可上传" : "上传文件 / 拖拽文件到此处"}
            </div>
            <div className="relative mt-1.5 text-[12px] text-ink-500">
              支持 PDF、Word、PPT、图片、音频等多种格式 · 可同时上传多个
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

          {/* 分隔线 + 副导入方式 */}
          <div className="mt-4 flex items-center gap-2 text-[11px] text-ink-400">
            <div className="flex-1 h-px bg-ink-100" />
            <span className="px-2 select-none">或通过其他来源导入</span>
            <div className="flex-1 h-px bg-ink-100" />
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
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

          {/* 链接输入区 */}
          {expanded === "link" && (
            <div className="mt-3 rounded-md border border-violet-200 bg-violet-50/40 p-3 animate-fadeUp">
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

          {/* 粘贴文本输入区 */}
          {expanded === "paste" && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/40 p-3 animate-fadeUp">
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
        </div>
      )}

      {/* 腾讯会议选择浮层 */}
      {meetingPickerOpen && (
        <MeetingPickerModal
          onClose={() => setMeetingPickerOpen(false)}
          onPick={submitMeeting}
        />
      )}
    </section>
  );
}

/* ——————————————————— 小按钮 ——————————————————— */

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

interface SmallChipProps {
  tone: keyof typeof TONE_MAP;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SmallChip({ tone, icon, label, active, onClick }: SmallChipProps) {
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

/* ——————————————————— 腾讯会议选择浮层 ——————————————————— */

interface MockMeeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  attendees: number;
  host: string;
  /** 是否为周期会议（用于标签） */
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

  // 阻止背景滚动
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
        {/* 标题 */}
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

        {/* 搜索 */}
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

        {/* 列表 */}
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
                        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-1.5 py-px rounded bg-ai-50 text-ai-700 border border-ai-100 text-[10.5px] leading-none">
                            <Sparkles
                              className="w-2.5 h-2.5"
                              strokeWidth={2.4}
                            />
                            AI 纪要
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-px rounded bg-ink-100 text-ink-600 text-[10.5px] leading-none">
                            <FileType2 className="w-2.5 h-2.5" />
                            录制转写
                          </span>
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

        {/* 底部操作 */}
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
              导入到素材库
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
