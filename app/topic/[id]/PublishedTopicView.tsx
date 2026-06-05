"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Star, Pencil, Trash2, Plus, Sparkles, MessageSquare } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import { PublishedEventCard } from "@/components/published/PublishedEventCard";
import { AiInsightPanel } from "@/components/published/AiInsightPanel";
import { TopicMeta } from "@/components/published/TopicMeta";
import { TopicEditCard } from "@/components/published/TopicEditCard";
import { MOCK_TOPIC } from "@/components/published/mockTopic";
import {
  InlineCommentsProvider,
} from "@/components/published/InlineCommentsContext";
import { InlineCommentPanel } from "@/components/published/InlineCommentPanel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { uid, genAvatar } from "@/lib/utils";
import { createBlock } from "@/components/editor/factory";
import { cn } from "@/lib/utils";
import { MOCK_USERS } from "@/lib/mock";
import type {
  PublishedTopic,
  PublishedEvent,
  InlineCommentThread,
} from "@/components/published/types";

type ViewMode = "author" | "reader";

export default function PublishedTopicPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 视角：作者（自己发的）/ 读者（别人发的），默认作者
  const view: ViewMode =
    searchParams.get("view") === "reader" ? "reader" : "author";

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // —— Topic 数据：本地化 state，便于 inline 编辑保存后立即刷新 ——
  const [topic, setTopic] = React.useState<PublishedTopic>(() => MOCK_TOPIC);

  // 默认仅第一个 Event 展开（贴合参考图二的浏览体验）
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(topic.events[0] ? [topic.events[0].id] : []),
  );
  const [activeEventId, setActiveEventId] = React.useState<string | undefined>(
    topic.events[0]?.id,
  );
  const [subscribed, setSubscribed] = React.useState(topic.subscribed);

  // —— 编辑模式 state（互斥：同时只能编辑一个东西） ——
  const [editingTopic, setEditingTopic] = React.useState(false);
  const [editingEventId, setEditingEventId] = React.useState<string | null>(
    null,
  );

  const startEditTopic = () => {
    setEditingEventId(null);
    setEditingTopic(true);
  };
  const cancelEditTopic = () => setEditingTopic(false);
  const saveEditTopic = (next: {
    title: string;
    authorIds: string[];
    authorRoleDeptId: string;
    tags: string[];
    topicType: "normal" | "department";
    visibility: import("@/components/topic/TopicVisibilityField").VisibilityValue;
    keyStrategy?: { departmentId: string; strategyId?: string };
  }) => {
    setTopic((prev) => {
      const nextAuthors = next.authorIds
        .map((id) => {
          const fromPrev = prev.authors.find((a) => a.id === id);
          if (fromPrev) return fromPrev;
          const u = MOCK_USERS.find((x) => x.id === id);
          return u
            ? { id: u.id, name: u.name, title: u.title, avatar: u.avatar }
            : null;
        })
        .filter(Boolean) as PublishedTopic["authors"];

      return {
        ...prev,
        title: next.title,
        authors: nextAuthors,
        authorRoleDeptId: next.authorRoleDeptId,
        tags: next.tags,
        topicType: next.topicType,
        visibility: next.visibility.customIds,
        visibilityMode: next.visibility.mode,
        keyStrategy:
          next.topicType === "department" && next.keyStrategy?.strategyId
            ? next.keyStrategy
            : undefined,
      };
    });
    setEditingTopic(false);
  };

  const startEditEvent = (id: string) => {
    setEditingTopic(false);
    setEditingEventId(id);
    // 编辑时确保该 Event 是展开的（视觉上从展开正文 → 编辑形态过渡更平滑）
    setExpandedIds((prev) => new Set(prev).add(id));
    // 滚动到该 Event 并闪一下
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollAndFlash(id));
    });
  };
  const cancelEditEvent = () => setEditingEventId(null);
  const saveEditEvent = (
    id: string,
    next: { title: string; blocks: PublishedEvent["blocks"] },
  ) => {
    setTopic((prev) => ({
      ...prev,
      events: prev.events.map((ev) =>
        ev.id === id ? { ...ev, title: next.title, blocks: next.blocks } : ev,
      ),
    }));
    setEditingEventId(null);
  };

  // 新增事件：在末尾追加一个空 Event 并立刻进入编辑态
  const addNewEvent = () => {
    const newId = uid();
    const newEv: PublishedEvent = {
      id: newId,
      index: topic.events.length + 1,
      title: "",
      blocks: [createBlock("text")],
      publishedAt: nowText(),
      reactions: { like: 0, dislike: 0, doubt: 0 },
      aiSummary: "",
      comments: [],
    };
    setTopic((prev) => ({ ...prev, events: [...prev.events, newEv] }));
    setExpandedIds((prev) => new Set(prev).add(newId));
    setEditingTopic(false);
    setEditingEventId(newId);
    setActiveEventId(newId);

    // 等 DOM 出现后滚动并闪烁
    waitForElement(`pub-event-${newId}`).then(() => scrollAndFlash(newId));
  };

  // —— 删除确认弹窗状态 ——
  const [topicDeleteOpen, setTopicDeleteOpen] = React.useState(false);
  const [eventDelete, setEventDelete] = React.useState<{
    id: string;
    index: number;
    title: string;
  } | null>(null);

  const toggle = (id: string) => {
    // 编辑某个 Event 时点击它的标题栏不收起
    if (editingEventId === id) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setActiveEventId(id);
      }
      return next;
    });
  };

  // 全部展开 / 全部收起
  const allExpanded = expandedIds.size === topic.events.length;
  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(topic.events.map((e) => e.id)));
    }
  };

  /* —— 右侧栏 Tab：AI 洞察 / 段落评论 —— */
  const [rightTab, setRightTab] = React.useState<"ai" | "comments">("ai");

  /* —— 段落级评论 Provider 初始数据 —— */
  const initialInlineThreads = React.useMemo<
    Record<string, InlineCommentThread[]>
  >(() => {
    const map: Record<string, InlineCommentThread[]> = {};
    topic.events.forEach((ev) => {
      if (ev.inlineComments && ev.inlineComments.length > 0) {
        map[ev.id] = ev.inlineComments;
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当前用户（demo：发布者王志恒）
  const currentUser = React.useMemo(
    () => ({
      id: "u-current",
      name: "王志恒",
      title: "王志恒",
      avatar: genAvatar("王志恒"),
    }),
    [],
  );

  // 段落评论总数（用于 Tab 上的 badge）
  const totalInlineCount = React.useMemo(() => {
    return topic.events.reduce(
      (acc, ev) => acc + (ev.inlineComments?.length ?? 0),
      0,
    );
  }, [topic.events]);

  return (
    <InlineCommentsProvider
      initial={initialInlineThreads}
      currentUser={currentUser}
    >
    <div className="h-screen bg-ink-50 flex flex-col overflow-hidden">
      <Header
        extra={
          <div className="flex items-center gap-3">
            <ViewSwitcher view={view} onChange={setView} />
            <DemoSwitcher current="published" />
          </div>
        }
      />

      <div className="flex-1 flex min-h-0">
        {/* 左侧 Sidebar：active=all（参考图） */}
        <div className="shrink-0 h-full">
          <Sidebar active="all" />
        </div>

        {/* 中间主区 */}
        <main
          id="published-scroll-area"
          className="flex-1 min-w-0 h-full overflow-y-auto"
        >
          <div className="w-full px-8 py-6">
            {/* 返回 */}
            <div className="mb-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[12.5px] text-ink-500 hover:text-ink-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回
              </Link>
            </div>

            {/* —— Topic 区域：根据 editingTopic 切换只读 / 编辑 —— */}
            {editingTopic ? (
              <TopicEditCard
                topic={topic}
                onCancel={cancelEditTopic}
                onSave={saveEditTopic}
              />
            ) : (
              <>
                {/* Topic Header */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-[22px] font-bold tracking-tight text-ink-900 leading-tight min-w-0">
                    {topic.title}
                  </h1>

                  {/* 右上角动作区：根据视角切换 */}
                  <div className="shrink-0 flex items-center gap-2">
                    {view === "author" ? (
                      <>
                        <button
                          onClick={startEditTopic}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border bg-white border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/40 text-[12px] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          编辑
                        </button>
                        <button
                          onClick={() => setTopicDeleteOpen(true)}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border bg-white border-ink-200 text-ink-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/60 text-[12px] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          删除
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSubscribed((v) => !v)}
                        className={cn(
                          "inline-flex items-center gap-1 h-7 px-2.5 rounded-md border text-[12px] transition-colors",
                          subscribed
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-white border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900",
                        )}
                      >
                        <Star
                          className={cn(
                            "w-3.5 h-3.5",
                            subscribed && "fill-amber-500 text-amber-500",
                          )}
                        />
                        {subscribed ? "已订阅" : "订阅"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 元信息 */}
                <div className="mt-4">
                  <TopicMeta topic={topic} authorView={view === "author"} />
                </div>
              </>
            )}

            {/* 工具条：全部展开/收起 */}
            <div className="mt-5 flex items-center justify-end">
              <button
                onClick={toggleAll}
                className="text-[11.5px] text-ink-500 hover:text-brand-600 transition-colors"
              >
                {allExpanded ? "全部收起" : "全部展开"}
              </button>
            </div>

            {/* Event 列表 */}
            <div className="mt-2 space-y-3">
              {topic.events.map((ev) => (
                <PublishedEventCard
                  key={ev.id}
                  event={ev}
                  expanded={expandedIds.has(ev.id)}
                  onToggle={() => toggle(ev.id)}
                  canManage={view === "author"}
                  editing={editingEventId === ev.id}
                  onStartEdit={() => startEditEvent(ev.id)}
                  onCancelEdit={cancelEditEvent}
                  onSaveEdit={(next) => saveEditEvent(ev.id, next)}
                  onDelete={() =>
                    setEventDelete({
                      id: ev.id,
                      index: ev.index,
                      title: ev.title,
                    })
                  }
                />
              ))}

              {/* 作者视角：可以继续在已发布 Topic 下补 Event */}
              {view === "author" && (
                <button
                  onClick={addNewEvent}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-dashed border-ink-300 bg-white text-[13px] text-ink-600 hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50/40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新增子主题
                </button>
              )}
            </div>

            {/* 底部留白 */}
            <div className="h-20" />
          </div>
        </main>

        {/* 右侧栏：Tab 切换 AI 洞察 / 段落评论 —— 宽度 380px */}
        <div className="shrink-0 h-full w-[380px] border-l border-ink-200 bg-white flex flex-col">
          <RightSidebarTabs
            tab={rightTab}
            onChange={setRightTab}
            commentsCount={totalInlineCount}
          />
          <div className="flex-1 min-h-0">
            {rightTab === "ai" ? (
              <AiInsightPanel topic={topic} activeEventId={activeEventId} />
            ) : (
              <InlineCommentPanel
                topic={topic}
                activeEventId={activeEventId}
              />
            )}
          </div>
        </div>
      </div>

      {/* —— 删除 Topic 确认弹窗 —— */}
      <ConfirmDialog
        open={topicDeleteOpen}
        danger
        title="删除整个主题？"
        description={
          <>
            这是主题「{topic.title}」下的全部内容，删除后整个主题将被一同删除，且
            <span className="text-ink-700">无法恢复</span>。是否继续？
          </>
        }
        confirmText="删除主题"
        onCancel={() => setTopicDeleteOpen(false)}
        onConfirm={() => {
          setTopicDeleteOpen(false);
          // demo 占位：接入时调用接口删除并返回列表
          router.push("/");
        }}
      />

      {/* —— 删除 Event 确认弹窗 —— */}
      <ConfirmDialog
        open={!!eventDelete}
        danger
        title="确认删除"
        description={
          eventDelete ? (
            <>
              删除「{eventDelete.title || `子主题 #${eventDelete.index}`}
              」将清空其下全部内容，确认删除吗？
            </>
          ) : null
        }
        confirmText="删除"
        onCancel={() => setEventDelete(null)}
        onConfirm={() => {
          if (eventDelete) {
            setTopic((prev) => ({
              ...prev,
              events: prev.events
                .filter((e) => e.id !== eventDelete.id)
                // 重新算 index
                .map((e, i) => ({ ...e, index: i + 1 })),
            }));
          }
          setEventDelete(null);
        }}
      />
    </div>
    </InlineCommentsProvider>
  );
}

/** 右侧栏 Tab 切换器：AI 洞察 / 段落评论 */
function RightSidebarTabs({
  tab,
  onChange,
  commentsCount,
}: {
  tab: "ai" | "comments";
  onChange: (t: "ai" | "comments") => void;
  commentsCount: number;
}) {
  return (
    <div className="shrink-0 flex items-stretch border-b border-ink-100">
      <TabBtn
        active={tab === "ai"}
        onClick={() => onChange("ai")}
        icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} />}
        label="AI 洞察"
      />
      <TabBtn
        active={tab === "comments"}
        onClick={() => onChange("comments")}
        icon={<MessageSquare className="w-3.5 h-3.5" strokeWidth={2.2} />}
        label="段落评论"
        badge={commentsCount > 0 ? commentsCount : undefined}
      />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-1.5 h-10 text-[12.5px] font-medium transition-colors relative",
        active
          ? "text-brand-700 bg-brand-50/40"
          : "text-ink-500 hover:text-ink-900 hover:bg-ink-50/60",
      )}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded-full text-[10px] font-semibold tabular-nums",
            active
              ? "bg-brand-100 text-brand-700"
              : "bg-ink-100 text-ink-600",
          )}
        >
          {badge}
        </span>
      )}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-500 rounded-t" />
      )}
    </button>
  );
}

/** 顶栏右侧的视角切换器（仅 demo 用，研发对接时根据当前用户是否是作者自动判断） */
function ViewSwitcher({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-ink-200 bg-white overflow-hidden text-[11.5px]">
      <button
        onClick={() => onChange("author")}
        className={cn(
          "px-2.5 h-6 transition-colors",
          view === "author"
            ? "bg-brand-50 text-brand-700"
            : "text-ink-500 hover:text-ink-900",
        )}
      >
        作者视角
      </button>
      <span className="w-px h-3 bg-ink-200" />
      <button
        onClick={() => onChange("reader")}
        className={cn(
          "px-2.5 h-6 transition-colors",
          view === "reader"
            ? "bg-brand-50 text-brand-700"
            : "text-ink-500 hover:text-ink-900",
        )}
      >
        读者视角
      </button>
    </div>
  );
}

// —— 工具：滚动到目标 Event 并加闪烁 class ——
function scrollAndFlash(eventId: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(`pub-event-${eventId}`);
  const container = document.getElementById("published-scroll-area");
  if (!el || !container) return;
  const TOP_PADDING = 24;
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const targetY =
    container.scrollTop + (elRect.top - containerRect.top) - TOP_PADDING;
  try {
    container.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  } catch {
    container.scrollTop = Math.max(0, targetY);
  }
  el.classList.add("event-flash");
  window.setTimeout(() => el.classList.remove("event-flash"), 900);
}

// —— 工具：等待 DOM 元素出现（最多 250ms） ——
function waitForElement(id: string): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    let attempt = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) return resolve(el);
      if (attempt++ > 15) return resolve(null);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// —— 工具：当前时间字符串 yyyy-MM-dd HH:mm ——
function nowText() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
