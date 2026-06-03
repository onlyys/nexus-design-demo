"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileType,
  Presentation,
  FileText,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

/**
 * 统一附件预览框架（PDF / PPT / Word 共用）
 *
 * 结构：
 *   ┌────────────────────────────────────┐
 *   │  [icon] 文件名             文件大小  │  ← 顶栏（统一）
 *   ├────────────────────────────────────┤
 *   │                                    │
 *   │            预览主体                  │  ← children 由各类型自定
 *   │                                    │
 *   ├────────────────────────────────────┤
 *   │  第 1 / N 页              ◀  ▶     │  ← 翻页栏（统一）
 *   └────────────────────────────────────┘
 */
type SupportedType = "pdf" | "ppt" | "doc";

function fileMeta(t: SupportedType) {
  switch (t) {
    case "pdf":
      return { Icon: FileType, color: "text-red-500", bg: "bg-red-50" };
    case "ppt":
      return {
        Icon: Presentation,
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    case "doc":
      return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
  }
}

interface UnifiedFrameProps {
  fileType: SupportedType;
  name: string;
  size?: number;
  currentPage: number;
  totalPages: number;
  /** 翻页栏单位：默认「页」，PPT 用「张」 */
  pageUnit?: string;
  children: React.ReactNode;
}

/** 统一外壳（白底卡 + 顶栏 + 翻页底栏） */
export function UnifiedAttachmentPreview({
  fileType,
  name,
  size,
  currentPage,
  totalPages,
  pageUnit = "页",
  children,
}: UnifiedFrameProps) {
  const { Icon, color, bg } = fileMeta(fileType);
  return (
    <div className="my-2 rounded-xl border border-ink-200 bg-white overflow-hidden hover:border-ink-300 hover:shadow-card transition-all">
      {/* 顶栏：文件信息 */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-ink-100 pr-12">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              bg,
            )}
          >
            <Icon className={cn("w-4 h-4", color)} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-ink-900 truncate">
              {name}
            </div>
            {typeof size === "number" && (
              <div className="text-[11px] text-ink-500">
                {formatBytes(size)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主体预览区 */}
      <div className="relative bg-ink-50/60 flex items-center justify-center py-6 px-4 min-h-[280px]">
        {children}
      </div>

      {/* 底部翻页栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-ink-100 text-[12px] text-ink-500">
        <span className="tabular-nums">
          第 {currentPage} / {totalPages} {pageUnit}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="h-6 w-6 rounded inline-flex items-center justify-center hover:bg-ink-50 text-ink-400 disabled:opacity-40"
            disabled
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="h-6 w-6 rounded inline-flex items-center justify-center hover:bg-ink-50 text-ink-700">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 三类文件的「页面内容」mock —— 仅为 demo 占位，结构在统一框内对齐
 * ============================================================ */

/** PDF：A4 比例的纸张样式（带红色 PDF 色带） */
export function PdfMockPage() {
  return (
    <div className="w-[420px] max-w-full bg-white rounded-lg shadow-card border border-ink-200 overflow-hidden">
      <div className="px-8 py-7 space-y-3">
        <div className="h-2 w-16 bg-red-200 rounded" />
        <div className="h-5 w-3/4 bg-ink-800 rounded" />
        <div className="h-3 w-1/2 bg-ink-300 rounded" />
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-5/6 bg-ink-100 rounded" />
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-4/5 bg-ink-100 rounded" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="h-16 bg-ink-50 rounded border border-ink-100" />
          <div className="h-16 bg-ink-50 rounded border border-ink-100" />
        </div>
        <div className="space-y-2 mt-2">
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-3/4 bg-ink-100 rounded" />
        </div>
      </div>
    </div>
  );
}

/** Word：纸张样式（带蓝色 doc 色带 + 段落结构） */
export function DocMockPage() {
  return (
    <div className="w-[420px] max-w-full bg-white rounded-lg shadow-card border border-ink-200 overflow-hidden">
      <div className="px-10 py-8 space-y-3">
        <div className="h-2 w-12 bg-blue-200 rounded" />
        <div className="h-6 w-4/5 bg-ink-800 rounded" />
        <div className="h-3 w-1/3 bg-ink-300 rounded" />
        <div className="mt-5 space-y-2">
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-11/12 bg-ink-100 rounded" />
          <div className="h-2 w-5/6 bg-ink-100 rounded" />
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-3/4 bg-ink-100 rounded" />
        </div>
        <div className="mt-5 h-3 w-1/3 bg-ink-700 rounded" />
        <div className="space-y-2 mt-1">
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-full bg-ink-100 rounded" />
          <div className="h-2 w-4/5 bg-ink-100 rounded" />
          <div className="h-2 w-2/3 bg-ink-100 rounded" />
        </div>
      </div>
    </div>
  );
}

/** PPT：16:9 幻灯片（在统一外壳中央居中） */
export function PptMockSlide({
  image,
  title,
  subtitle,
  date,
}: {
  image?: string;
  title: string;
  subtitle?: string;
  date?: string;
}) {
  return (
    <div className="w-[480px] max-w-full aspect-[16/9] rounded-lg shadow-card border border-ink-200 overflow-hidden relative bg-white">
      {image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/65 to-white/85" />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-8">
        <div className="text-[20px] font-bold tracking-tight text-ink-900 line-clamp-2">
          {title}
        </div>
        {subtitle && (
          <div className="mt-2 text-[12px] text-ink-600 line-clamp-2 max-w-[90%]">
            {subtitle}
          </div>
        )}
        {date && (
          <div className="mt-3.5 text-[11px] text-ink-500 tracking-wide">
            {date}
          </div>
        )}
      </div>
    </div>
  );
}
