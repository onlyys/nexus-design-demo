"use client";

import * as React from "react";
import {
  UploadCloud,
  X,
  FileType,
  FileSpreadsheet,
  Presentation,
  FileText,
  File as FileIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSection } from "@/components/ui/Card";
import { cn, formatBytes, uid } from "@/lib/utils";
import { INITIAL_ATTACHMENTS, type FileItem } from "@/lib/mock";

const inferType = (name: string): FileItem["type"] => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  return "other";
};

const fileIcon = (t: FileItem["type"]) => {
  switch (t) {
    case "pdf":
      return { Icon: FileType, color: "text-red-500", bg: "bg-red-50" };
    case "ppt":
      return { Icon: Presentation, color: "text-orange-500", bg: "bg-orange-50" };
    case "xls":
      return { Icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50" };
    case "doc":
      return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
    default:
      return { Icon: FileIcon, color: "text-ink-500", bg: "bg-ink-100" };
  }
};

interface AttachmentsBodyProps {
  onCountChange?: (count: number) => void;
}

export function AttachmentsBody({ onCountChange }: AttachmentsBodyProps) {
  const [files, setFiles] = React.useState<FileItem[]>(INITIAL_ATTACHMENTS);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    onCountChange?.(files.length);
  }, [files.length, onCountChange]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next: FileItem[] = Array.from(list).map((f) => ({
      id: uid(),
      name: f.name,
      size: f.size,
      type: inferType(f.name),
    }));
    setFiles((p) => [...p, ...next]);
  };

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-[1.5px] border-dashed bg-brand-50/30 hover:bg-brand-50/60 transition-all cursor-pointer py-8 px-4 text-center",
          dragOver
            ? "border-brand-500 bg-brand-50/80 scale-[1.005]"
            : "border-brand-200/80",
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white border border-brand-100 flex items-center justify-center shadow-card">
            <UploadCloud className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-[13px] text-ink-700">
            <span className="text-brand-600 font-medium">点击上传</span>
            <span className="text-ink-500"> / 拖拽到此区域</span>
          </div>
          <p className="text-[11.5px] text-ink-500">
            支持多文件上传，单个文件不超过 200MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {files.map((f) => {
            const { Icon, color, bg } = fileIcon(f.type);
            return (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-ink-200 hover:border-ink-300 hover:shadow-card transition-all bg-white"
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                    bg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
                <div className="flex-1 min-w-0 text-[13px] text-ink-900 truncate">
                  {f.name}
                </div>
                <span className="text-[12px] tabular-nums text-ink-500 shrink-0">
                  {formatBytes(f.size)}
                </span>
                <button
                  onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
                  className="text-ink-400 hover:text-rose-500 transition-colors shrink-0"
                  aria-label="删除"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}

// 保留旧的卡片版本以便向后兼容（暂未在新布局使用）
export function AttachmentsPanel() {
  return (
    <CardSection title="附件">
      <AttachmentsBody />
    </CardSection>
  );
}
