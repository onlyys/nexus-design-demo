"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlignLeft, AlignCenter, AlignRight, Trash2, ImageOff } from "lucide-react";
import { Editable } from "@/components/editor/Editable";
import type { ImageBlock } from "@/components/editor/types";

interface ResizableImageProps {
  block: ImageBlock;
  onUpdate: (b: ImageBlock) => void;
  onDelete: () => void;
  onFocus: () => void;
}

/**
 * 可调整大小的图片 Block：
 * - 点击图片可选中（出现工具条 + 右下角拖拽手柄）
 * - 工具条提供 50% / 75% / 100% / 适应 四档预设以及对齐方式
 * - 拖拽手柄精确调节宽度（30% ~ 100%）
 * - 点击外部取消选中
 */
export function ResizableImage({
  block,
  onUpdate,
  onDelete,
  onFocus,
}: ResizableImageProps) {
  const width = block.width ?? 100;
  const align = block.align ?? "center";
  const [selected, setSelected] = React.useState(false);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 拖拽状态
  const draggingRef = React.useRef<{
    startX: number;
    startWidth: number;
    containerWidth: number;
  } | null>(null);

  // 点击外部取消选中
  React.useEffect(() => {
    if (!selected) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setSelected(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [selected]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.parentElement?.clientWidth || container.clientWidth;
    draggingRef.current = {
      startX: e.clientX,
      startWidth: container.clientWidth,
      containerWidth,
    };
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      const d = draggingRef.current;
      if (!d) return;
      const delta = ev.clientX - d.startX;
      // 居中对齐时拖拽体感是 2 倍（左右对称增长）
      const factor = align === "center" ? 2 : 1;
      const nextPx = d.startWidth + delta * factor;
      const pct = Math.max(
        20,
        Math.min(100, Math.round((nextPx / d.containerWidth) * 100)),
      );
      onUpdate({ ...block, width: pct });
    };
    const onUp = () => {
      draggingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const setPreset = (w: number) => onUpdate({ ...block, width: w });
  const setAlign = (a: "left" | "center" | "right") =>
    onUpdate({ ...block, align: a });

  return (
    <div className="my-2 group/img" ref={wrapRef}>
      {/* 外层根据对齐方式控制水平定位 */}
      <div
        className={cn(
          "flex",
          align === "left" && "justify-start",
          align === "center" && "justify-center",
          align === "right" && "justify-end",
        )}
      >
        <div
          ref={containerRef}
          onMouseDown={(e) => {
            // 单击进入选中
            e.stopPropagation();
            setSelected(true);
            onFocus();
          }}
          style={{ width: `${width}%` }}
          className={cn(
            "relative rounded-xl overflow-hidden border bg-ink-100 transition-shadow",
            selected
              ? "border-brand-400 ring-2 ring-brand-200 shadow-card"
              : "border-ink-200 hover:border-ink-300 cursor-pointer",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.caption || ""}
            draggable={false}
            onError={() => setLoadFailed(true)}
            onLoad={() => setLoadFailed(false)}
            className={cn(
              // 关键：不限制最大高度、不裁切，按原始比例完整呈现
              // 用户可以通过缩放手柄/预设比例调整宽度，长图也能完整展示
              "block w-full h-auto select-none",
              loadFailed && "hidden",
            )}
          />
          {/* 加载失败兜底：明确告知"此图片未经允许不可引用"（外部源防盗链限制） */}
          {loadFailed && (
            <div className="w-full aspect-[16/9] bg-[repeating-linear-gradient(135deg,#f5f5f7_0,#f5f5f7_8px,#ebebee_8px,#ebebee_16px)] flex flex-col items-center justify-center text-ink-500 px-6 text-center">
              <ImageOff className="w-9 h-9 mb-2.5 text-ink-400" />
              <div className="text-[13px] font-semibold text-ink-700">
                此图片未经允许不可引用
              </div>
              <div className="mt-1.5 text-[11.5px] text-ink-500 leading-relaxed max-w-xs">
                原图来自外部源（如腾讯文档 / 飞书 / 微信公众号 等），存在防盗链限制，无法在站外加载
              </div>
              <div className="mt-2 text-[11px] text-ink-400">
                建议：保存原图到本地后重新拖拽 / 粘贴
              </div>
            </div>
          )}

          {/* 选中时：右上角删除 + 工具条 + 右下角手柄 */}
          {selected && (
            <>
              {/* 顶部浮动工具条 */}
              <div
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute -top-10 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 px-1 py-1 rounded-lg bg-ink-900 text-white shadow-popover text-[11.5px] whitespace-nowrap"
              >
                <PresetButton
                  active={width <= 55}
                  onClick={() => setPreset(50)}
                >
                  50%
                </PresetButton>
                <PresetButton
                  active={width > 55 && width <= 80}
                  onClick={() => setPreset(75)}
                >
                  75%
                </PresetButton>
                <PresetButton
                  active={width > 80}
                  onClick={() => setPreset(100)}
                >
                  100%
                </PresetButton>
                <span className="mx-1 w-px h-3.5 bg-white/20" />
                <AlignBtn
                  active={align === "left"}
                  onClick={() => setAlign("left")}
                  title="左对齐"
                >
                  <AlignLeft className="w-3 h-3" />
                </AlignBtn>
                <AlignBtn
                  active={align === "center"}
                  onClick={() => setAlign("center")}
                  title="居中"
                >
                  <AlignCenter className="w-3 h-3" />
                </AlignBtn>
                <AlignBtn
                  active={align === "right"}
                  onClick={() => setAlign("right")}
                  title="右对齐"
                >
                  <AlignRight className="w-3 h-3" />
                </AlignBtn>
                <span className="mx-1 w-px h-3.5 bg-white/20" />
                <span className="px-1.5 text-[10.5px] tabular-nums text-ink-300">
                  {width}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  title="删除"
                  className="ml-0.5 h-5 w-5 inline-flex items-center justify-center rounded hover:bg-white/10"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {/* 小三角 */}
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-ink-900" />
              </div>

              {/* 右下角拖拽手柄 */}
              <div
                onMouseDown={startDrag}
                className="absolute bottom-1.5 right-1.5 h-5 w-5 rounded-md bg-white border-2 border-brand-500 shadow-card cursor-ew-resize flex items-center justify-center"
                title="拖拽调整宽度"
              >
                <span className="w-2 h-2 rounded-sm border-2 border-brand-500 border-l-0 border-t-0" />
              </div>

              {/* 左边手柄（对称） */}
              <div
                onMouseDown={(e) => {
                  // 反向拖拽：将 delta 取负
                  e.preventDefault();
                  e.stopPropagation();
                  const container = containerRef.current;
                  if (!container) return;
                  const containerWidth =
                    container.parentElement?.clientWidth || container.clientWidth;
                  const startX = e.clientX;
                  const startWidth = container.clientWidth;
                  document.body.style.cursor = "ew-resize";
                  document.body.style.userSelect = "none";
                  const onMove = (ev: MouseEvent) => {
                    const delta = startX - ev.clientX;
                    const factor = align === "center" ? 2 : 1;
                    const nextPx = startWidth + delta * factor;
                    const pct = Math.max(
                      20,
                      Math.min(
                        100,
                        Math.round((nextPx / containerWidth) * 100),
                      ),
                    );
                    onUpdate({ ...block, width: pct });
                  };
                  const onUp = () => {
                    document.body.style.cursor = "";
                    document.body.style.userSelect = "";
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
                className="absolute top-1/2 -translate-y-1/2 left-1.5 h-12 w-1.5 rounded-full bg-brand-500/70 shadow cursor-ew-resize hover:bg-brand-500"
              />
              {/* 右边手柄（与下方手柄一组） */}
              <div
                onMouseDown={startDrag}
                className="absolute top-1/2 -translate-y-1/2 right-1.5 h-12 w-1.5 rounded-full bg-brand-500/70 shadow cursor-ew-resize hover:bg-brand-500"
              />
            </>
          )}
        </div>
      </div>

      {block.caption !== undefined && (
        <Editable
          value={block.caption}
          onChange={(caption) => onUpdate({ ...block, caption })}
          placeholder="图片说明"
          className="mt-2 text-[12.5px] text-ink-500 text-center"
          onFocus={onFocus}
        />
      )}
    </div>
  );
}

function PresetButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "h-5 px-1.5 rounded transition-colors text-[10.5px] font-medium",
        active ? "bg-white/15 text-white" : "text-ink-300 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

function AlignBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "h-5 w-5 rounded transition-colors inline-flex items-center justify-center",
        active ? "bg-white/15 text-white" : "text-ink-300 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
