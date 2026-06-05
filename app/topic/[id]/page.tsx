import { Suspense } from "react";
import PublishedTopicView from "./PublishedTopicView";

// 静态导出：demo 仅需预生成 /topic/demo 一个页面
export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default function Page() {
  return (
    <Suspense>
      <PublishedTopicView />
    </Suspense>
  );
}
