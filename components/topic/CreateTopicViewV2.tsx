"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { TopicActionBar } from "@/components/TopicActionBar";
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
  VisibilityCustomInput,
  type VisibilityValue,
} from "@/components/topic/TopicVisibilityField";
import { KeyStrategyLinkField } from "@/components/topic/KeyStrategyLinkField";
import { MOCK_USERS, USER_DEPARTMENTS } from "@/lib/mock";
import { genAvatar, nowHHMM, uid } from "@/lib/utils";
import { createBlock } from "@/components/editor/factory";
import { EventCard } from "@/components/event/EventCard";
import type { EventItem } from "@/components/event/types";
import { type ImportAsset } from "@/components/import/ImportPanel";
import {
  ImportLauncherV2,
  type ParseMode,
} from "@/components/import/ImportLauncherV2";
import { AiPanelPlaceholder } from "@/components/import/AiPanelPlaceholder";
import type { Block } from "@/components/editor/types";

export interface CreateTopicViewV2Props {
  initialTitle?: string;
  initialEvents?: EventItem[];
  initialAuthorIds?: string[];
  initialAuthorRoleDeptId?: string;
  initialVisibility?: VisibilityValue;
  initialTopicType?: TopicType;
  userName?: string;
  userAvatar?: string;
  headerExtra?: React.ReactNode;

  /** 回编模式：从已发布 Topic 进入编辑器 */
  editMode?: "create" | "edit-published";
  publishedTopicId?: string;
  focusEventId?: string;
  appendNewEvent?: boolean;
}

/**
 * V2 版本容器：
 * - 复用所有 Topic 元信息组件
 * - 中间导入区换成 ImportLauncherV2（内嵌素材列表 + 解析操作栏）
 * - 右侧 AI 面板换成「功能待上线」占位
 * - 解析结果按 ParseMode 注入到当前选中的 Event / 或新增 Event
 */
export function CreateTopicViewV2({
  initialTitle = "",
  initialEvents,
  initialVisibility,
  initialAuthorIds,
  initialAuthorRoleDeptId,
  initialTopicType = "normal",
  userName = "王志恒",
  userAvatar = genAvatar("王志恒"),
  headerExtra,
  editMode = "create",
  publishedTopicId,
  focusEventId,
  appendNewEvent = false,
}: CreateTopicViewV2Props) {
  const router = useRouter();
  const isEditPublished = editMode === "edit-published";
  const [title, setTitle] = React.useState(initialTitle);

  // —— Topic 元信息 ——
  const defaultAuthorIds =
    initialAuthorIds && initialAuthorIds.length > 0
      ? initialAuthorIds
      : [MOCK_USERS[0].id, MOCK_USERS[1].id];
  const [authorIds, setAuthorIds] =
    React.useState<string[]>(defaultAuthorIds);

  const firstAuthor =
    MOCK_USERS.find((u) => u.id === authorIds[0]) ?? MOCK_USERS[0];
  const fallbackDept =
    USER_DEPARTMENTS.find((d) => d.id === firstAuthor.deptId)?.id ??
    USER_DEPARTMENTS.find((d) => d.isPrimary)?.id ??
    USER_DEPARTMENTS[0].id;
  const [authorRoleDeptId, setAuthorRoleDeptId] = React.useState<string>(
    initialAuthorRoleDeptId ?? fallbackDept,
  );

  const [tagsList, setTagsList] = React.useState<string[]>([]);
  const [topicType, setTopicType] =
    React.useState<TopicType>(initialTopicType);
  const [visibility, setVisibility] = React.useState<VisibilityValue>(
    () =>
      initialVisibility ?? {
        mode: "all",
        customIds: [],
        deptId: authorRoleDeptId,
      },
  );
  const [keyStrategy, setKeyStrategy] = React.useState<{
    departmentId: string;
    strategyId?: string;
  }>({ departmentId: authorRoleDeptId });
  const showKeyStrategyPanel = topicType === "department";

  React.useEffect(() => {
    setKeyStrategy((prev) => ({
      departmentId: authorRoleDeptId,
      strategyId:
        prev.departmentId === authorRoleDeptId ? prev.strategyId : undefined,
    }));
    setVisibility((prev) => ({ ...prev, deptId: authorRoleDeptId }));
  }, [authorRoleDeptId]);

  // —— Events ——
  const [events, setEvents] = React.useState<EventItem[]>(() => {
    if (initialEvents && initialEvents.length > 0) return initialEvents;
    return [
      {
        id: uid(),
        title: "",
        blocks: [createBlock("text")],
      },
    ];
  });
  const [activeEventId, setActiveEventId] = React.useState<string>(
    () => events[0]?.id ?? "",
  );
  const activeIdRef = React.useRef(activeEventId);
  React.useEffect(() => {
    activeIdRef.current = activeEventId;
  }, [activeEventId]);

  const updateEvent = (next: EventItem) =>
    setEvents((prev) => prev.map((e) => (e.id === next.id ? next : e)));

  const addEvent = () => {
    const newEv: EventItem = {
      id: uid(),
      title: "",
      blocks: [createBlock("text")],
    };
    setEvents((prev) => [...prev, newEv]);
    setActiveEventId(newEv.id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToEvent(newEv.id);
      });
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((e) => e.id !== id);
      if (activeEventId === id) {
        setActiveEventId(next[0]?.id ?? "");
      }
      return next;
    });
  };

  // 滚动
  const scrollToEvent = React.useCallback((id: string) => {
    const el = document.getElementById(`event-${id}`);
    const container = document.getElementById("main-scroll-area-v2");
    if (!el || !container) return;
    const TOP_PADDING = 24;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetY =
      container.scrollTop + (elRect.top - containerRect.top) - TOP_PADDING;
    try {
      container.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth",
      });
    } catch {
      container.scrollTop = Math.max(0, targetY);
    }
    // 二次校正：smooth 动画期间内容布局可能变动，700ms 后再矫正一次
    setTimeout(() => {
      const after = container.scrollTop;
      if (Math.abs(after - targetY) > 80) {
        container.scrollTop = Math.max(0, targetY);
      }
    }, 700);
    el.classList.add("event-flash");
    window.setTimeout(() => el.classList.remove("event-flash"), 900);
  }, []);

  // —— 解析：4 种模式 ——
  const [parsing, setParsing] = React.useState(false);
  const [parseDone, setParseDone] = React.useState(false);

  const handleParse = (assets: ImportAsset[], mode: ParseMode) => {
    if (parsing || assets.length === 0) return;
    setParsing(true);
    setParseDone(false);

    window.setTimeout(() => {
      applyParse(assets, mode);
      setParsing(false);
      setParseDone(true);
      window.setTimeout(() => setParseDone(false), 2200);
    }, 2200);
  };

  const applyParse = (assets: ImportAsset[], mode: ParseMode) => {
    if (mode === "single-to-one") {
      // 单文件 → 1 个 Event：内容注入当前选中
      const blocks = buildSingleAssetBlocks(assets[0], { rich: true });
      injectBlocksIntoActive(blocks, assets[0].name);
      return;
    }
    if (mode === "single-to-many") {
      // 单文件 → 按章节拆成多个 Event
      const chapters = buildChaptersForAsset(assets[0]);
      // 第一章注入当前选中，其余追加为新 Event
      chapters.forEach((ch, idx) => {
        if (idx === 0) {
          injectBlocksIntoActive(ch.blocks, ch.title);
        } else {
          appendNewEventWithBlocks(ch.title, ch.blocks);
        }
      });
      return;
    }
    if (mode === "multi-to-one") {
      // 多文件 → 1 个 Event：综合整合稿
      const blocks = buildMultiAssetDemoBlocks(assets);
      injectBlocksIntoActive(blocks);
      return;
    }
    if (mode === "multi-to-many") {
      // 多文件 → 每个文件 1 个 Event：第一个注入当前，其余追加
      assets.forEach((a, idx) => {
        const blocks = buildSingleAssetBlocks(a, { rich: false });
        if (idx === 0) {
          injectBlocksIntoActive(blocks, a.name);
        } else {
          appendNewEventWithBlocks(a.name, blocks);
        }
      });
      return;
    }
  };

  /** 把 blocks 注入到当前选中的 Event 末尾；若提供 newTitle 且 Event 标题为空，则设置标题 */
  const injectBlocksIntoActive = (newBlocks: Block[], newTitle?: string) => {
    const targetId = activeIdRef.current || activeEventId;
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === targetId);
      if (idx < 0) return prev;
      const target = prev[idx];
      const trimmed = trimTrailingEmptyText(target.blocks);
      const nextEvent: EventItem = {
        ...target,
        title:
          target.title.trim().length === 0 && newTitle
            ? truncateTitle(newTitle)
            : target.title,
        blocks: [...trimmed, ...newBlocks],
      };
      const nextEvents = [...prev];
      nextEvents[idx] = nextEvent;
      return nextEvents;
    });
    setActiveEventId(targetId);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToEvent(targetId));
    });
  };

  /** 追加一个新 Event 到末尾 */
  const appendNewEventWithBlocks = (eventTitle: string, blocks: Block[]) => {
    const newEv: EventItem = {
      id: uid(),
      title: truncateTitle(eventTitle),
      blocks,
    };
    setEvents((prev) => [...prev, newEv]);
    setActiveEventId(newEv.id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToEvent(newEv.id));
    });
  };

  // 自动保存（与 v1 一致）
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(
    initialEvents && initialEvents.length > 0 ? nowHHMM() : null,
  );
  React.useEffect(() => {
    const tick = () => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setSavedAt(nowHHMM());
      }, 700);
    };
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  // 字数
  const wordCount = React.useMemo(() => {
    let count = title.length;
    events.forEach((ev) => {
      count += ev.title.length;
      ev.blocks.forEach((b) => {
        if ("text" in b && typeof b.text === "string") count += b.text.length;
        if ("items" in b && Array.isArray(b.items)) {
          (b.items as unknown[]).forEach((it) => {
            if (typeof it === "string") count += it.length;
            else if (
              it &&
              typeof it === "object" &&
              "text" in (it as Record<string, unknown>)
            )
              count += String((it as { text?: string }).text ?? "").length;
          });
        }
        if (b.type === "code") count += b.code.length;
      });
    });
    return count;
  }, [title, events]);

  const handleManualSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedAt(nowHHMM());
    }, 500);
  };

  // —— IntersectionObserver：滚动时自动同步 activeEventId ——
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (events.length === 0) return;

    const root = document.getElementById("main-scroll-area-v2");
    if (!root) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.eventId;
          if (!id) return;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        let best: { id: string; ratio: number; top: number } | null = null;
        events.forEach((ev) => {
          const el = document.getElementById(`event-${ev.id}`);
          if (!el) return;
          const ratio = ratios.get(ev.id) ?? 0;
          const top =
            el.getBoundingClientRect().top -
            root.getBoundingClientRect().top;
          if (
            !best ||
            ratio > best.ratio ||
            (ratio === best.ratio && Math.abs(top) < Math.abs(best.top))
          ) {
            best = { id: ev.id, ratio, top };
          }
        });
        const picked =
          best as { id: string; ratio: number; top: number } | null;
        if (picked && picked.id !== activeIdRef.current) {
          setActiveEventId(picked.id);
        }
      },
      {
        root,
        rootMargin: "-24px 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    events.forEach((ev) => {
      const el = document.getElementById(`event-${ev.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [events]);

  // —— 回编模式：进入时自动定位到目标 Event / 末尾新建 Event ——
  const pendingScrollIdRef = React.useRef<string | null>(null);
  const didApplyEditQuery = React.useRef(false);

  React.useEffect(() => {
    if (didApplyEditQuery.current) return;
    if (!isEditPublished) return;
    if (typeof window === "undefined") return;

    if (appendNewEvent) {
      didApplyEditQuery.current = true;
      const newEv: EventItem = {
        id: uid(),
        title: "",
        blocks: [createBlock("text")],
      };
      pendingScrollIdRef.current = newEv.id;
      setEvents((prev) => [...prev, newEv]);
      setActiveEventId(newEv.id);
      return;
    }

    if (focusEventId) {
      didApplyEditQuery.current = true;
      const target = events.find((e) => e.id === focusEventId) ?? events[0];
      if (target) {
        pendingScrollIdRef.current = target.id;
        setActiveEventId(target.id);
      }
      return;
    }

    didApplyEditQuery.current = true;
  }, [
    isEditPublished,
    appendNewEvent,
    focusEventId,
    events,
    scrollToEvent,
  ]);

  // 等目标 Event 卡片真正挂载到 DOM 后再滚动
  React.useLayoutEffect(() => {
    const id = pendingScrollIdRef.current;
    if (!id) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    let raf: number | undefined;

    const tryScroll = (attempt: number) => {
      if (cancelled) return;
      const el = document.getElementById(`event-${id}`);
      const container = document.getElementById("main-scroll-area-v2");
      if (el && container) {
        scrollToEvent(id);
        pendingScrollIdRef.current = null;
        return;
      }
      if (attempt < 15) {
        raf = requestAnimationFrame(() => tryScroll(attempt + 1));
      } else {
        pendingScrollIdRef.current = null;
      }
    };

    raf = requestAnimationFrame(() => tryScroll(0));
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [events, scrollToEvent]);

  return (
    <div className="h-screen bg-page flex flex-col overflow-hidden">
      <Header userName={userName} userAvatar={userAvatar} extra={headerExtra} />

      <div className="flex-1 flex min-h-0">
        <div className="shrink-0 h-full">
          <Sidebar active="my" />
        </div>

        <main
          id="main-scroll-area-v2"
          className="flex-1 min-w-0 max-w-[945px] h-full overflow-y-auto"
        >
          <div className="w-full px-4 py-4">
            <div className="bg-white rounded-[16px] shadow-card border border-ink-200/60 px-8 py-6 space-y-4">
            {isEditPublished && (
              <EditPublishedBanner
                onBack={() =>
                  router.push(
                    `/topic/${publishedTopicId ?? "demo"}?view=author`,
                  )
                }
              />
            )}

            <TopicActionBar
              saving={saving}
              savedAt={savedAt}
              mode={isEditPublished ? "edit-published" : "create"}
              onSaveDraft={handleManualSave}
              onPreview={() =>
                router.push(`/topic/${publishedTopicId ?? "demo"}?view=author`)
              }
              onPublish={() =>
                router.push(`/topic/${publishedTopicId ?? "demo"}?view=author`)
              }
              onCancel={
                isEditPublished
                  ? () =>
                      router.push(
                        `/topic/${publishedTopicId ?? "demo"}?view=author`,
                      )
                  : undefined
              }
            />

            {/* Topic 头部卡片 */}
            <section className="overflow-hidden">
              <div className="pt-2 pb-4">
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
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
                    <TopicVisibilityField
                      value={visibility}
                      onChange={setVisibility}
                      authorDeptId={authorRoleDeptId}
                    />
                    <TopicTagsField value={tagsList} onChange={setTagsList} />
                  </div>
                  {visibility.mode === "custom" && (
                    <VisibilityCustomInput
                      value={visibility}
                      onChange={setVisibility}
                      authorDeptId={authorRoleDeptId}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* V2 · 一体化导入与解析 */}
            <ImportLauncherV2
              onParse={handleParse}
              parsing={parsing}
              done={parseDone}
            />

            {/* Events */}
            <div className="space-y-4">
              {events.map((ev, idx) => (
                <EventCard
                  key={ev.id}
                  index={idx + 1}
                  event={ev}
                  onChange={updateEvent}
                  onDelete={
                    events.length > 1 ? () => deleteEvent(ev.id) : undefined
                  }
                  active={ev.id === activeEventId}
                  onActivate={() => setActiveEventId(ev.id)}
                />
              ))}

              <button
                onClick={addEvent}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-dashed border-ink-300 bg-white text-[13px] text-ink-600 hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50/40 transition-colors"
              >
                + 增加子主题
              </button>
            </div>

            <footer className="mt-2 mb-4 flex items-center justify-between text-[11.5px] text-ink-400">
              <span>共 {events.length} 个子主题</span>
              <span>共 {wordCount} 个字</span>
            </footer>
            </div>
          </div>
        </main>

        <div className="shrink-0 h-full w-[295px] border-l border-ink-200 bg-page flex flex-col">
          <AiPanelPlaceholder />
        </div>
      </div>
    </div>
  );
}

/* —————————————————— 工具函数 —————————————————— */

/** 顶部"正在编辑已发布 Topic"提示条 */
function EditPublishedBanner({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-md border border-amber-200 bg-amber-50/70 text-[12.5px] text-amber-800">
      <span className="inline-flex items-center gap-2 min-w-0">
        <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
          ✎
        </span>
        <span className="truncate">
          正在编辑已发布的主题 — 保存后将<strong className="font-semibold">直接覆盖发布版本</strong>，订阅者可见。
        </span>
      </span>
      <button
        onClick={onBack}
        className="shrink-0 inline-flex items-center h-6 px-2 rounded-md border border-amber-300 bg-white/70 hover:bg-white text-amber-800 text-[11.5px] transition-colors"
      >
        放弃修改 · 返回发布页
      </button>
    </div>
  );
}

function truncateTitle(s: string): string {
  const t = s.trim().replace(/^腾讯会议 ·\s*/, "");
  return t.length > 40 ? t.slice(0, 40) + "…" : t;
}

function trimTrailingEmptyText(blocks: Block[]): Block[] {
  if (blocks.length === 0) return blocks;
  const last = blocks[blocks.length - 1];
  const isEmptyText =
    "type" in last &&
    ["text", "h1", "h2", "h3", "quote"].includes(last.type as string) &&
    ("text" in last ? String((last as { text?: string }).text ?? "").trim() === "" : false);
  return isEmptyText ? blocks.slice(0, -1) : blocks;
}

/** 单素材生成 blocks。rich=true 时会附带更多结构化内容 */
function buildSingleAssetBlocks(
  a: ImportAsset,
  opts: { rich?: boolean } = {},
): Block[] {
  const blocks: Block[] = [];

  // 简短摘要段
  blocks.push({
    id: uid(),
    type: "text",
    text: buildAssetSummary(a),
  });

  // 类型对应的预览
  if (a.kind === "link") {
    blocks.push(createBlock("htmlPreview"));
  } else if (a.kind === "file") {
    const ext = a.name.split(".").pop()?.toLowerCase() ?? "";
    if (["ppt", "pptx", "key"].includes(ext)) {
      blocks.push(createBlock("pptPreview"));
    } else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
      blocks.push(createBlock("image"));
    } else if (["pdf"].includes(ext)) {
      blocks.push(createBlock("file", { fileType: "pdf" }));
    } else if (["doc", "docx"].includes(ext)) {
      blocks.push(createBlock("file", { fileType: "doc" }));
    } else if (["xls", "xlsx", "csv"].includes(ext)) {
      blocks.push(createBlock("file", { fileType: "xls" }));
    } else {
      blocks.push(createBlock("file"));
    }
  } else if (a.kind === "meeting") {
    blocks.push({
      id: uid(),
      type: "h3",
      text: "🎯 会议要点",
    });
    blocks.push({
      id: uid(),
      type: "bulletList",
      items: [
        "明确本周重点推进方向并对齐资源",
        "确认下阶段交付计划与里程碑",
        "梳理跨团队风险与对接节奏",
      ],
    });
  } else if (a.kind === "paste") {
    blocks.push({
      id: uid(),
      type: "quote",
      text: "（基于粘贴文本生成的引用占位，可继续编辑）",
    });
  }

  if (opts.rich) {
    blocks.push({
      id: uid(),
      type: "h3",
      text: "📌 关键要点",
    });
    blocks.push({
      id: uid(),
      type: "bulletList",
      items: [
        "AI 提取的要点 1：核心结论与判断依据",
        "AI 提取的要点 2：本阶段进展与量化指标",
        "AI 提取的要点 3：下一步行动方向",
      ],
    });
  }

  return blocks;
}

function buildAssetSummary(a: ImportAsset): string {
  if (a.kind === "file") return `已基于文件「${a.name}」生成子主题草稿。`;
  if (a.kind === "link") return `已基于链接「${a.name}」抓取的正文生成子主题草稿。`;
  if (a.kind === "meeting")
    return `已基于「${a.name}」的 AI 纪要与录制转写生成子主题草稿。`;
  return `已基于粘贴文本生成子主题草稿。`;
}

/** 单文件按章节拆 demo */
function buildChaptersForAsset(
  a: ImportAsset,
): { title: string; blocks: Block[] }[] {
  const baseName = a.name.replace(/\.(pdf|pptx?|docx?|xlsx?)$/i, "");

  // 按文件类型给不同拆分预设
  const ext = a.name.split(".").pop()?.toLowerCase() ?? "";
  if (["ppt", "pptx", "key"].includes(ext)) {
    return [
      {
        title: `${baseName} · 第 1 章：概要`,
        blocks: [
          {
            id: uid(),
            type: "text",
            text: "本章为 PPT 第 1–5 页内容摘要，涵盖背景与目标。",
          },
          createBlock("pptPreview"),
        ],
      },
      {
        title: `${baseName} · 第 2 章：进展与成果`,
        blocks: [
          {
            id: uid(),
            type: "text",
            text: "本章涵盖 PPT 第 6–14 页：阶段性进展、量化指标与可视化数据。",
          },
          {
            id: uid(),
            type: "bulletList",
            items: [
              "试点工厂单位产值能耗下降 11.6%",
              "AI 节能调度覆盖 30+ 行业伙伴",
              "落地案例 12 起，沉淀方法论 3 份",
            ],
          },
        ],
      },
      {
        title: `${baseName} · 第 3 章：下一阶段计划`,
        blocks: [
          {
            id: uid(),
            type: "text",
            text: "本章涵盖 PPT 第 15–22 页：风险与挑战、下一阶段计划与资源诉求。",
          },
          {
            id: uid(),
            type: "todo",
            items: [
              { id: uid(), text: "Q3 启动二期方案设计", done: false },
              { id: uid(), text: "对接合作伙伴扩展至 50+", done: false },
              { id: uid(), text: "完成行业级因子库 v2", done: false },
            ],
          },
        ],
      },
    ];
  }

  if (["pdf"].includes(ext)) {
    return [
      {
        title: `${baseName} · 第一章 · 引言`,
        blocks: [
          { id: uid(), type: "text", text: "本章对应 PDF 引言部分，介绍研究背景与方法论。" },
          createBlock("file", { fileType: "pdf" }),
        ],
      },
      {
        title: `${baseName} · 第二章 · 核心方法`,
        blocks: [
          { id: uid(), type: "text", text: "AI 已自动抽取核心方法的关键要点：" },
          {
            id: uid(),
            type: "bulletList",
            items: [
              "数据采集与清洗：多源融合 + 时序对齐",
              "模型设计：双塔 + 强化学习反馈",
              "效果评估：分行业 / 分场景双重对比",
            ],
          },
        ],
      },
      {
        title: `${baseName} · 第三章 · 结论与展望`,
        blocks: [
          { id: uid(), type: "text", text: "本章总结研究结论与未来方向。" },
          {
            id: uid(),
            type: "quote",
            text: "让数字技术沉淀为可复用的工具箱 —— 是本研究最重要的方法论收敛。",
          },
        ],
      },
    ];
  }

  if (["doc", "docx"].includes(ext)) {
    return [
      {
        title: `${baseName} · 一、背景与目标`,
        blocks: [
          { id: uid(), type: "text", text: "本节对应 Word 文档 H1 第一段：背景与目标。" },
        ],
      },
      {
        title: `${baseName} · 二、关键举措`,
        blocks: [
          { id: uid(), type: "text", text: "本节对应 Word 文档 H1 第二段：关键举措与执行进度。" },
          {
            id: uid(),
            type: "bulletList",
            items: [
              "举措一：建立跨实验室协同例会机制",
              "举措二：统一对外品牌与可视化体系",
              "举措三：推出共建者开放招募",
            ],
          },
        ],
      },
      {
        title: `${baseName} · 三、下一阶段`,
        blocks: [
          { id: uid(), type: "text", text: "本节对应 Word 文档 H1 第三段：风险、依赖与下一阶段。" },
        ],
      },
    ];
  }

  // 链接 / 粘贴 / 其它：按内容长度做 demo 拆分
  return [
    {
      title: `${baseName} · 第 1 部分`,
      blocks: [
        { id: uid(), type: "text", text: "AI 已基于素材内容生成的第 1 部分摘要。" },
      ],
    },
    {
      title: `${baseName} · 第 2 部分`,
      blocks: [
        { id: uid(), type: "text", text: "AI 已基于素材内容生成的第 2 部分摘要。" },
      ],
    },
  ];
}

/** 多素材综合稿（与 v1 一致） */
function buildMultiAssetDemoBlocks(list: ImportAsset[]): Block[] {
  const blocks: Block[] = [];
  const total = list.length;

  blocks.push({
    id: uid(),
    type: "h2",
    text: `AI 综合解析：${total} 份素材，已整合为以下子主题草稿`,
  });

  blocks.push({
    id: uid(),
    type: "text",
    text: `本子主题由 AI 基于你勾选的 ${total} 份素材（涵盖${summarizeKinds(
      list,
    )}）综合生成。AI 已自动抽取共性主题、合并重复信息、按时间和因果关系重排，并在结尾保留原始素材引用，便于读者溯源。`,
  });

  blocks.push({ id: uid(), type: "h3", text: "🎯 关键要点" });
  blocks.push({
    id: uid(),
    type: "bulletList",
    items: [
      `本季度三大业务方向均完成首阶段交付：碳中和、银发科技、乡村振兴均有可量化的进展指标 (来源：素材 1-3)`,
      `AI 节能调度在试点工厂使单位产值能耗下降 11.6%；银发守护开源组件下载破 1.2 万 (来源：素材 1, 4)`,
      `跨实验室协同机制已建立，月度互通会促成 5 项联合行动 (来源：素材 ${Math.min(
        total,
        5,
      )})`,
      `下一阶段重点：把工具箱产品化、把方法论标准化、把人才培养体系化`,
    ],
  });

  blocks.push({
    id: uid(),
    type: "image",
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=80",
    caption: "AI 自动从素材中精选的主图 · 跨团队协同推进 SSV 季度目标",
    width: 100,
    align: "center",
  });

  blocks.push({
    id: uid(),
    type: "quote",
    text: "把数字技术沉淀为可复用的工具箱，让每一次落地都成为下一次复用的起点 —— 这是 SSV 这一阶段最重要的方法论收敛。",
  });

  blocks.push({ id: uid(), type: "h3", text: "📌 后续行动项" });
  blocks.push({
    id: uid(),
    type: "todo",
    items: [
      { id: uid(), text: "本周内完成跨实验室周会议程模板", done: false },
      { id: uid(), text: "整理工具箱产品化路线图（v0.6 草案）", done: false },
      { id: uid(), text: "对接合作伙伴 30+ 落地案例已完成访谈", done: true },
    ],
  });

  blocks.push({ id: uid(), type: "h3", text: "📎 原始素材引用" });
  blocks.push({
    id: uid(),
    type: "bulletList",
    items: list.slice(0, 6).map((a, idx) => {
      const tag =
        a.kind === "link"
          ? "🔗 链接"
          : a.kind === "meeting"
          ? "🎙 腾讯会议"
          : a.kind === "paste"
          ? "📋 文本片段"
          : "📄 文件";
      return `素材 ${idx + 1} · ${tag}：${a.name}${a.meta ? ` (${a.meta})` : ""}`;
    }),
  });

  return blocks;
}

function summarizeKinds(list: ImportAsset[]): string {
  const set = new Set(list.map((a) => a.kind));
  const labels: string[] = [];
  if (set.has("file")) labels.push("文档");
  if (set.has("link")) labels.push("网页链接");
  if (set.has("meeting")) labels.push("会议纪要");
  if (set.has("paste")) labels.push("文本片段");
  return labels.length > 0 ? labels.join("、") : "多类型内容";
}
