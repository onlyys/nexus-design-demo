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
  type VisibilityValue,
} from "@/components/topic/TopicVisibilityField";
import { KeyStrategyLinkField } from "@/components/topic/KeyStrategyLinkField";
import { KEY_STRATEGY_TAG, MOCK_USERS, USER_DEPARTMENTS } from "@/lib/mock";
import { genAvatar, nowHHMM, uid } from "@/lib/utils";
import { createBlock } from "@/components/editor/factory";
import { EventCard } from "@/components/event/EventCard";
import type { EventItem } from "@/components/event/types";
import { type ImportAsset } from "@/components/import/ImportPanel";
import { ImportLauncherInline } from "@/components/import/ImportLauncherInline";
import { MaterialLibrary } from "@/components/import/MaterialLibrary";
import type { Block } from "@/components/editor/types";

export interface CreateTopicViewProps {
  initialTitle?: string;
  initialEvents?: EventItem[];
  /** 默认作者 id 列表；不传则用首个 mock 用户作为发布者 */
  initialAuthorIds?: string[];
  /** 默认发布岗位部门 id；不传则取第一个作者的 deptId 或主岗 */
  initialAuthorRoleDeptId?: string;
  /** 默认可见范围；不传则默认全员可见 */
  initialVisibility?: VisibilityValue;
  userName?: string;
  userAvatar?: string;
  headerExtra?: React.ReactNode;

  editMode?: "create" | "edit-published";
  publishedTopicId?: string;
  focusEventId?: string;
  appendNewEvent?: boolean;
}

/**
 * 通用「发布 Topic」页面视图
 *
 * 同时驱动两个 demo：
 * - 已编辑示例（SSV 满数据）—— /
 * - 空白进入态 —— /blank
 *
 * 后续 UI 调整只需改这一处即可同时生效。
 */
export function CreateTopicView({
  initialTitle = "",
  initialEvents,
  initialVisibility,
  initialAuthorIds,
  initialAuthorRoleDeptId,
  userName = "王志恒",
  userAvatar = genAvatar("王志恒"),
  headerExtra,
  editMode = "create",
  publishedTopicId,
  focusEventId,
  appendNewEvent = false,
}: CreateTopicViewProps) {
  const router = useRouter();
  const isEditPublished = editMode === "edit-published";
  const [title, setTitle] = React.useState(initialTitle);

  // —— 作者（受控）：默认 = [u1, u2]，u1 为发布者锁定 ——
  const defaultAuthorIds =
    initialAuthorIds && initialAuthorIds.length > 0
      ? initialAuthorIds
      : [MOCK_USERS[0].id, MOCK_USERS[1].id];
  const [authorIds, setAuthorIds] =
    React.useState<string[]>(defaultAuthorIds);

  // —— 发布岗位（首作者所属部门，可由用户切换）——
  const firstAuthor =
    MOCK_USERS.find((u) => u.id === authorIds[0]) ?? MOCK_USERS[0];
  const fallbackDept =
    USER_DEPARTMENTS.find((d) => d.id === firstAuthor.deptId)?.id ??
    USER_DEPARTMENTS.find((d) => d.isPrimary)?.id ??
    USER_DEPARTMENTS[0].id;
  const [authorRoleDeptId, setAuthorRoleDeptId] = React.useState<string>(
    initialAuthorRoleDeptId ?? fallbackDept,
  );

  // 默认无初始 Event 时，至少给一个空 Event 让用户可以开始
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

  const [tagsList, setTagsList] = React.useState<string[]>([]);
  const [topicType, setTopicType] = React.useState<TopicType>("normal");
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

  // 当用户切换"以此岗位发布"时，同步策略锁定的 departmentId 与可见范围 deptId
  React.useEffect(() => {
    setKeyStrategy((prev) => ({
      departmentId: authorRoleDeptId,
      strategyId:
        prev.departmentId === authorRoleDeptId ? prev.strategyId : undefined,
    }));
    setVisibility((prev) => ({ ...prev, deptId: authorRoleDeptId }));
  }, [authorRoleDeptId]);

  // —— 素材库状态（中间投递 / 右侧展示，共享） ——
  const [assets, setAssets] = React.useState<ImportAsset[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [parsing, setParsing] = React.useState(false);
  const [parseDone, setParseDone] = React.useState(false);

  const handleAddAsset = React.useCallback((a: ImportAsset) => {
    setAssets((prev) => [...prev, a]);
    // 新加入的素材默认选中（用户期望"上传完了一般就要解析"）
    setSelectedIds((prev) => [...prev, a.id]);
  }, []);

  const handleToggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = React.useCallback(() => {
    setSelectedIds(assets.map((a) => a.id));
  }, [assets]);

  const handleClearSelection = React.useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleRenameAsset = React.useCallback((id: string, name: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, name } : a)),
    );
  }, []);

  const handleRemoveAsset = React.useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  // 自动保存
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

  // 字数统计
  const bodyCount = React.useMemo(() => {
    let count = 0;
    events.forEach((ev) => {
      count += ev.title.length;
      ev.blocks.forEach((b) => {
        if ("text" in b && typeof b.text === "string") count += b.text.length;
        if ("items" in b && Array.isArray(b.items)) {
          b.items.forEach((it: any) => {
            if (typeof it === "string") count += it.length;
            else if (it?.text) count += it.text.length;
          });
        }
        if (b.type === "code") count += b.code.length;
      });
    });
    return count;
  }, [events]);
  const wordCount = title.length + bodyCount;

  const handleManualSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedAt(nowHHMM());
    }, 500);
  };

  // —— Event 操作 ——
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

  // —— 滚动 ——
  const scrollToEvent = React.useCallback((id: string) => {
    const el = document.getElementById(`event-${id}`);
    const container = document.getElementById("main-scroll-area");
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
    setTimeout(() => {
      const after = container.scrollTop;
      if (Math.abs(after - targetY) > 80) {
        container.scrollTop = Math.max(0, targetY);
      }
    }, 700);

    el.classList.add("event-flash");
    window.setTimeout(() => {
      el.classList.remove("event-flash");
    }, 900);
  }, []);

  // —— AI 一键解析（仅解析选中的素材） ——
  const handleParseSelected = () => {
    const selected = assets.filter((a) => selectedIds.includes(a.id));
    if (selected.length === 0 || parsing) return;
    setParsing(true);
    setParseDone(false);
    window.setTimeout(() => {
      setParsing(false);
      setParseDone(true);
      runParseAssets(selected);
      // 已解析的素材保留在素材库，但取消选中
      setSelectedIds([]);
      window.setTimeout(() => setParseDone(false), 2000);
    }, 2200);
  };

  const runParseAssets = (list: ImportAsset[]) => {
    if (list.length === 0) return;

    // 多素材一键解析：生成图文并茂的 Demo 内容（H2/正文/图片/引用/要点/列表）
    // 单素材：保留原行为，按素材类型生成对应预览块
    const parsedBlocks =
      list.length >= 2
        ? buildMultiAssetDemoBlocks(list)
        : list.flatMap((a) => buildSingleAssetBlocks(a));

    // 2) 注入到「当前选中的 Event」末尾；
    //    若该 event 末尾是空 text block，先丢弃它，避免空行
    const targetId = activeIdRef.current || activeEventId;
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === targetId);
      if (idx < 0) return prev;
      const target = prev[idx];
      const trimmed = (() => {
        if (target.blocks.length === 0) return target.blocks;
        const last = target.blocks[target.blocks.length - 1];
        const isEmptyText =
          (last as any).type &&
          ["text", "h1", "h2", "h3", "quote"].includes((last as any).type) &&
          ((last as any).text ?? "").trim() === "";
        return isEmptyText ? target.blocks.slice(0, -1) : target.blocks;
      })();
      const nextEvent: EventItem = {
        ...target,
        blocks: [...trimmed, ...parsedBlocks],
      };
      const nextEvents = [...prev];
      nextEvents[idx] = nextEvent;
      return nextEvents;
    });

    // 3) 滚动 / 高亮当前 event
    setActiveEventId(targetId);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToEvent(targetId);
      });
    });
  };

  const suppressScrollSpyRef = React.useRef(false);
  const suppressTimerRef = React.useRef<number | undefined>(undefined);

  // 保留滚动抑制逻辑（卡片内 onActivate 仍会更新 activeEventId）
  void suppressScrollSpyRef;
  void suppressTimerRef;

  const activeIdRef = React.useRef(activeEventId);
  React.useEffect(() => {
    activeIdRef.current = activeEventId;
  }, [activeEventId]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (events.length === 0) return;

    const root = document.getElementById("main-scroll-area");
    if (!root) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.eventId;
          if (!id) return;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        if (suppressScrollSpyRef.current) return;
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
        const picked = best as { id: string; ratio: number; top: number } | null;
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
  // 把"想滚动的 event id"放进 ref，由专门的 effect 等 DOM 出现后再滚，
  // 避免 setEvents 异步 + rAF 时序不稳导致只有第一个 Event 能命中的问题。
  const pendingScrollIdRef = React.useRef<string | null>(null);
  const didApplyEditQuery = React.useRef(false);

  React.useEffect(() => {
    if (didApplyEditQuery.current) return;
    if (!isEditPublished) return;
    if (typeof window === "undefined") return;

    // a) 新增事件模式：在末尾追加空 Event，待其 DOM 渲染后滚动
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

    // b) 聚焦已有 Event：直接把目标 id 写进 ref，由滚动 effect 处理
    if (focusEventId) {
      didApplyEditQuery.current = true;
      const target =
        events.find((e) => e.id === focusEventId) ?? events[0];
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

  // 等"目标 Event 卡片"真的挂载到 DOM 后再滚动 + 闪一下
  React.useLayoutEffect(() => {
    const id = pendingScrollIdRef.current;
    if (!id) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    let raf: number | undefined;

    const tryScroll = (attempt: number) => {
      if (cancelled) return;
      const el = document.getElementById(`event-${id}`);
      const container = document.getElementById("main-scroll-area");
      if (el && container) {
        scrollToEvent(id);
        pendingScrollIdRef.current = null;
        return;
      }
      // DOM 还没准备好，最多重试 15 帧（~250ms 内必出）
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
    <div className="h-screen bg-ink-50 flex flex-col overflow-hidden">
      <Header
        userName={userName}
        userAvatar={userAvatar}
        extra={headerExtra}
      />

      <div className="flex-1 flex min-h-0">
        <div className="shrink-0 h-full">
          <Sidebar active="my" />
        </div>

        <main
          id="main-scroll-area"
          className="flex-1 min-w-0 h-full overflow-y-auto"
        >
          <div className="w-full px-8 py-6 space-y-4">
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
            <section className="rounded-lg bg-white border border-ink-200 shadow-card overflow-hidden">
              <div className="px-7 pt-6 pb-5">
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
                  <TopicTagsField value={tagsList} onChange={setTagsList} />
                  <TopicVisibilityField
                    value={visibility}
                    onChange={setVisibility}
                    authorDeptId={authorRoleDeptId}
                  />
                </div>
              </div>
            </section>

            {/* 导入素材入口（中间区域，4 列横向） */}
            <ImportLauncherInline onAdd={handleAddAsset} />

            {/* Event 区域：去掉左侧时间线，与上方 Topic 卡片同宽 */}
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
        </main>

        <div className="shrink-0 h-full w-[380px] border-l border-ink-200 bg-white flex flex-col">
          <MaterialLibrary
            assets={assets}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onRename={handleRenameAsset}
            onRemove={handleRemoveAsset}
            onParseSelected={handleParseSelected}
            parsing={parsing}
            done={parseDone}
          />
        </div>
      </div>
    </div>
  );
}

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

/* —————————————————— AI 解析：单素材 / 多素材 demo 内容 —————————————————— */

/** 单素材：保留旧版各类型的预览块组合 */
function buildSingleAssetBlocks(a: ImportAsset): Block[] {
  if (a.kind === "link") {
    return [createBlock("text"), createBlock("htmlPreview")];
  }
  if (a.kind === "file") {
    const ext = a.name.split(".").pop()?.toLowerCase() ?? "";
    if (["ppt", "pptx", "key"].includes(ext)) {
      return [createBlock("text"), createBlock("pptPreview")];
    }
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
      return [createBlock("text"), createBlock("image")];
    }
    return [createBlock("text"), createBlock("file")];
  }
  if (a.kind === "meeting") {
    return [createBlock("text"), createBlock("bulletList")];
  }
  if (a.kind === "paste") {
    return [createBlock("text"), createBlock("quote")];
  }
  return [createBlock("text")];
}

/**
 * 多素材：生成图文并茂的 Demo 内容（演示性质）
 *
 * AI 不是把多个文件简单粘到一起，而是输出一份「整合后的 Event 草稿」：
 *   1) H2 总标题（基于素材数量自动生成）
 *   2) 提要正文段落
 *   3) 关键要点 bullet（≥3 条，引用素材编号）
 *   4) 主图 + 图注
 *   5) 引用一句金句
 *   6) 结构化小结小标题 + 行动项
 *   7) 末尾列出"原始素材引用"（每条素材一行链接卡）
 */
function buildMultiAssetDemoBlocks(list: ImportAsset[]): Block[] {
  const blocks: Block[] = [];
  const total = list.length;

  // 1. H2 总标题
  blocks.push({
    id: uid(),
    type: "h2",
    text: `AI 综合解析：${total} 份素材，已整合为以下子主题草稿`,
  });

  // 2. 提要段落
  blocks.push({
    id: uid(),
    type: "text",
    text: `本子主题由 AI 基于你勾选的 ${total} 份素材（涵盖${summarizeKinds(
      list,
    )}）综合生成。AI 已自动抽取共性主题、合并重复信息、按时间和因果关系重排，并在结尾保留原始素材引用，便于读者溯源。`,
  });

  // 3. 关键要点 bullet
  blocks.push({
    id: uid(),
    type: "h3",
    text: "🎯 关键要点",
  });
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

  // 4. 主图 + 图注
  blocks.push({
    id: uid(),
    type: "image",
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=80",
    caption: "AI 自动从素材中精选的主图 · 跨团队协同推进 SSV 季度目标",
    width: 100,
    align: "center",
  });

  // 5. 引用金句
  blocks.push({
    id: uid(),
    type: "quote",
    text: "把数字技术沉淀为可复用的工具箱，让每一次落地都成为下一次复用的起点 —— 这是 SSV 这一阶段最重要的方法论收敛。",
  });

  // 6. 小结小标题 + 行动项
  blocks.push({
    id: uid(),
    type: "h3",
    text: "📌 后续行动项",
  });
  blocks.push({
    id: uid(),
    type: "todo",
    items: [
      { id: uid(), text: "本周内完成跨实验室周会议程模板", done: false },
      { id: uid(), text: "整理工具箱产品化路线图（v0.6 草案）", done: false },
      { id: uid(), text: "对接合作伙伴 30+ 落地案例已完成访谈", done: true },
    ],
  });

  // 7. 原始素材引用（最多 4 条；超过用文本提示）
  blocks.push({
    id: uid(),
    type: "h3",
    text: "📎 原始素材引用",
  });
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
