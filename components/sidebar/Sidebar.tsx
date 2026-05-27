"use client";

import { Users } from "lucide-react";
import { AuthorsPanel } from "./AuthorsPanel";
import { AttachmentsPanel } from "./AttachmentsPanel";
import { TagsPanel } from "./TagsPanel";
import { VisibilityPanel } from "./VisibilityPanel";

export function Sidebar() {
  return (
    <aside className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
          文档设置
        </h2>
        <div className="inline-flex items-center gap-1 text-[11.5px] text-ink-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <Users className="w-3 h-3" />2 人在线
        </div>
      </div>
      <AuthorsPanel />
      <AttachmentsPanel />
      <TagsPanel />
      <VisibilityPanel />
    </aside>
  );
}
