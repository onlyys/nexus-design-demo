"use client";

import { NexusLogo } from "@/components/Logo";
import { Bell } from "lucide-react";
import { genAvatar } from "@/lib/utils";

interface HeaderProps {
  /** 当前用户名 */
  userName?: string;
  /** 头像 URL */
  userAvatar?: string;
  /** Header 右侧额外内容（如 demo 切换链接） */
  extra?: React.ReactNode;
}

/**
 * 顶部全局 Header（Nexus 1.0 风格）：
 * - 左侧：SSV Nexus Logo + 副标题
 * - 右侧：通知 + 用户
 * - 操作按钮（保存/预览/发布）已移至 Topic 主卡内的工具条，避免顶栏过重
 */
export function Header({
  userName = "王志恒",
  userAvatar = genAvatar("王志恒"),
  extra,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-ink-200 bg-white">
      <div className="h-full w-full px-5 flex items-center justify-between gap-6">
        {/* 左：Logo + 副标题 */}
        <div className="flex items-center gap-4 min-w-0">
          <NexusLogo showSubtitle />
        </div>

        {/* 右：可选额外内容 + 通知 + 用户 */}
        <div className="flex items-center gap-3 shrink-0">
          {extra}
          <button
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors"
            title="通知"
          >
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-ink-700">Hi, {userName}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userAvatar}
              alt={userName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-ink-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
