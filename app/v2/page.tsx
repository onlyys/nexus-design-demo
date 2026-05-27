"use client";

import * as React from "react";
import { CreateTopicViewV2 } from "@/components/topic/CreateTopicViewV2";
import { DemoSwitcher } from "@/components/DemoSwitcher";

/**
 * V2 demo · /v2
 *
 * - 进入即空白态：仅一个空 Event，等待用户导入素材并解析
 * - 解析结果会注入到当前选中的 Event
 * - 右侧 AI 面板暂时挂"功能待上线"
 */
export default function V2TopicDemoPage() {
  return (
    <CreateTopicViewV2
      initialTitle=""
      // 不传 initialEvents：内部会自动渲染一个空 Event
      initialVisibility={{ mode: "all", customIds: [] }}
      initialAuthorIds={["u1"]}
      headerExtra={<DemoSwitcher current="v2" />}
    />
  );
}
