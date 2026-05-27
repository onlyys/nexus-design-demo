"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { buildEventBlocks } from "@/components/editor/factory";
import { CreateTopicViewV2 } from "@/components/topic/CreateTopicViewV2";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import type { EventItem } from "@/components/event/types";

const PRESET_EVENT_TITLES = [
  "CarbonX 碳中和实验室 · 图文进展",
  "银发科技实验室 · PPT 分享",
  "为村耕耘者 · 乡村振兴专项",
  "西部少年 AI 课堂 · 科技公益",
];

function createInitialEvents(): EventItem[] {
  return PRESET_EVENT_TITLES.map((title, idx) => ({
    id: `ev-${idx + 1}`,
    title,
    blocks: buildEventBlocks(idx),
  }));
}

function PageContent() {
  // 与 v2 共享同一容器，仅在初始数据上保留"已编辑示例"内容
  // 暂未消费 query 参数；保留 useSearchParams 以便后续从发布态回编时复用
  useSearchParams();

  return (
    <CreateTopicViewV2
      initialTitle="SSV 2026 Q2 进展简报"
      initialEvents={createInitialEvents()}
      initialVisibility={{ mode: "custom", customIds: ["edu"] }}
      headerExtra={<DemoSwitcher current="filled" />}
    />
  );
}

/**
 * 已编辑示例 demo
 * 路径：/
 *
 * 与 v2 共享 AI 解析模块；区别仅在于初始 Event 数据已填充。
 */
export default function FilledTopicDemoPage() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}
