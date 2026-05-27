"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  Eye,
  FileText,
  CheckCircle2,
  Loader2,
  Send,
  Save,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TopicActionBarProps {
  saving: boolean;
  savedAt: string | null;
  /** 'create'（默认）= 创建新 Topic；'edit-published' = 回编已发布 Topic */
  mode?: "create" | "edit-published";
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  /** 回编模式下的"取消编辑" */
  onCancel?: () => void;
}

/**
 * Topic 主卡顶部的操作工具条：
 * - create：保存草稿 / 预览 / 发布 Topic
 * - edit-published：取消 / 预览 / 保存更新
 */
export function TopicActionBar({
  saving,
  savedAt,
  mode = "create",
  onSaveDraft,
  onPreview,
  onPublish,
  onCancel,
}: TopicActionBarProps) {
  const isEdit = mode === "edit-published";

  return (
    <div className="flex items-center justify-end gap-2.5 mb-3">
      <AnimatePresence mode="wait">
        {saving ? (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="flex items-center gap-1.5 text-[12px] text-ink-500"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            正在保存…
          </motion.div>
        ) : savedAt ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="flex items-center gap-1.5 text-[12px] text-ink-500 mr-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {isEdit ? "改动已自动保存" : "草稿已保存"} {savedAt}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isEdit ? (
        <>
          {onCancel && (
            <Button variant="secondary" size="sm" onClick={onCancel}>
              <X className="w-3.5 h-3.5" />
              取消
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onPreview}>
            <Eye className="w-3.5 h-3.5" />
            预览
          </Button>
          <Button variant="primary" size="sm" onClick={onPublish}>
            <Save className="w-3.5 h-3.5" />
            保存更新
          </Button>
        </>
      ) : (
        <>
          <Button variant="secondary" size="sm" onClick={onSaveDraft}>
            <FileText className="w-3.5 h-3.5" />
            保存草稿
          </Button>
          <Button variant="secondary" size="sm" onClick={onPreview}>
            <Eye className="w-3.5 h-3.5" />
            预览
          </Button>
          <Button variant="primary" size="sm" onClick={onPublish}>
            <Send className="w-3.5 h-3.5" />
            发布 Topic
          </Button>
        </>
      )}
    </div>
  );
}
