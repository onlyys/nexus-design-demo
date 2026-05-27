"use client";

import * as React from "react";
import { CreateTopicView } from "@/components/topic/CreateTopicView";
import { DemoSwitcher } from "@/components/DemoSwitcher";

/**
 * 空白进入态 demo
 * 路径：/blank
 */
export default function BlankTopicDemoPage() {
  return (
    <CreateTopicView
      initialTitle=""
      // 不传 initialEvents：会自动渲染一个空 Event 给用户开始
      initialVisibility={{ mode: "all", customIds: [] }}
      // 空白态：作者只有当前用户（u1 = 王志恒）
      initialAuthorIds={["u1"]}
      headerExtra={<DemoSwitcher current="blank" />}
    />
  );
}
