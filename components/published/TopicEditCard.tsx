"use client";

import * as React from "react";
import { Save, X } from "lucide-react";
import { TitleInput } from "@/components/TitleInput";
import { AuthorsField } from "@/components/topic/AuthorsField";
import { AuthorRoleField } from "@/components/topic/AuthorRoleField";
import { TopicTagsField } from "@/components/topic/TopicTagsField";
import {
  TopicTypeField,
  type TopicType,
} from "@/components/topic/TopicTypeField";
import {
  TopicVisibilityField,
  type VisibilityValue,
} from "@/components/topic/TopicVisibilityField";
import { KeyStrategyLinkField } from "@/components/topic/KeyStrategyLinkField";
import { MOCK_USERS, USER_DEPARTMENTS } from "@/lib/mock";
import type { PublishedTopic } from "./types";

interface TopicEditCardProps {
  topic: PublishedTopic;
  onCancel: () => void;
  onSave: (next: {
    title: string;
    authorIds: string[];
    authorRoleDeptId: string;
    tags: string[];
    topicType: TopicType;
    visibility: VisibilityValue;
    keyStrategy?: { departmentId: string; strategyId?: string };
  }) => void;
}

/**
 * 发布页就地编辑 Topic 的卡片：
 * - 标题、作者（首作者锁定）、发布岗位、Topic 类型、关键策略、标签、可见范围
 * - 与编辑器（CreateTopicViewV2）字段顺序保持一致
 */
export function TopicEditCard({ topic, onCancel, onSave }: TopicEditCardProps) {
  const [title, setTitle] = React.useState(topic.title);

  const initAuthorIds = topic.authors.map((a) => a.id);
  const [authorIds, setAuthorIds] = React.useState<string[]>(initAuthorIds);

  const fallbackDept =
    topic.authorRoleDeptId ??
    MOCK_USERS.find((u) => u.id === initAuthorIds[0])?.deptId ??
    USER_DEPARTMENTS.find((d) => d.isPrimary)?.id ??
    USER_DEPARTMENTS[0].id;
  const [authorRoleDeptId, setAuthorRoleDeptId] =
    React.useState<string>(fallbackDept);

  const [tags, setTags] = React.useState<string[]>(topic.tags);
  const [topicType, setTopicType] = React.useState<TopicType>(
    topic.topicType ?? "normal",
  );

  const [visibility, setVisibility] = React.useState<VisibilityValue>(() => ({
    mode: (topic.visibilityMode ?? "all") as VisibilityValue["mode"],
    customIds: topic.visibility ?? [],
    deptId: fallbackDept,
  }));

  const [keyStrategy, setKeyStrategy] = React.useState<{
    departmentId: string;
    strategyId?: string;
  }>({
    departmentId: topic.keyStrategy?.departmentId ?? authorRoleDeptId,
    strategyId: topic.keyStrategy?.strategyId,
  });

  // 切换岗位 → 关键策略 / 可见范围 deptId 同步
  React.useEffect(() => {
    setKeyStrategy((prev) => ({
      departmentId: authorRoleDeptId,
      strategyId:
        prev.departmentId === authorRoleDeptId ? prev.strategyId : undefined,
    }));
    setVisibility((prev) => ({ ...prev, deptId: authorRoleDeptId }));
  }, [authorRoleDeptId]);

  const showKeyStrategyPanel = topicType === "department";
  const firstAuthor =
    MOCK_USERS.find((u) => u.id === authorIds[0]) ?? MOCK_USERS[0];

  return (
    <section className="rounded-lg bg-white border border-brand-300 ring-1 ring-brand-100 shadow-card overflow-hidden animate-fadeUp">
      <div className="px-7 pt-6 pb-5">
        <div className="mb-4 flex items-center justify-between gap-3 px-3 py-1.5 rounded-md bg-amber-50/70 border border-amber-200 text-[12px] text-amber-800">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
              ✎
            </span>
            正在编辑主题信息 — 保存后会立即覆盖发布版本
          </span>
        </div>

        <TitleInput value={title} onChange={setTitle} />

        <div className="mt-3">
          <AuthorsField value={authorIds} onChange={setAuthorIds} />
        </div>

        <div className="mt-4">
          <AuthorRoleField
            value={authorRoleDeptId}
            onChange={setAuthorRoleDeptId}
            publisherName={firstAuthor.name}
          />
        </div>

        <div className="mt-5 space-y-4">
          <TopicTypeField value={topicType} onChange={setTopicType} />
          {showKeyStrategyPanel && (
            <KeyStrategyLinkField
              departmentId={authorRoleDeptId}
              strategyId={keyStrategy.strategyId}
              onChange={setKeyStrategy}
            />
          )}
          <TopicTagsField value={tags} onChange={setTags} />
          <TopicVisibilityField
            value={visibility}
            onChange={setVisibility}
            authorDeptId={authorRoleDeptId}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 h-8 px-3.5 rounded-md bg-ink-100 hover:bg-ink-200 text-ink-700 text-[12.5px] font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            取消
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                title,
                authorIds,
                authorRoleDeptId,
                tags,
                topicType,
                visibility,
                keyStrategy: showKeyStrategyPanel ? keyStrategy : undefined,
              })
            }
            className="inline-flex items-center gap-1 h-8 px-4 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-[12.5px] font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            保存更新
          </button>
        </div>
      </div>
    </section>
  );
}
