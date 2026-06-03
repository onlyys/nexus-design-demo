export type ReactionKind = "like" | "dislike" | "doubt";

export interface Reaction {
  kind: ReactionKind;
  count: number;
  /** 当前用户是否已点击 */
  active: boolean;
}

export interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  /** 富文本（纯文本即可，多段用 \n 分隔） */
  content: string;
  /** 2026-05-12 19:19 */
  time: string;
  /** 二级回复（暂只展示一层） */
  replies?: CommentItem[];
}

/**
 * 段落级评论线程：针对正文中某个 block / 选中片段
 * - blockId：评论挂在哪个 block 上
 * - anchorText：被评论的原文片段（用于右侧评论流回显引用）
 * - resolved：是否已解决（作者标记）
 */
export interface InlineCommentThread {
  id: string;
  blockId: string;
  anchorText: string;
  comments: CommentItem[];
  resolved?: boolean;
}

export interface PublishedEvent {
  id: string;
  /** 序号显示用：#1 / #2 */
  index: number;
  title: string;
  /** 复用编辑态的 Block 数据 */
  blocks: import("@/components/editor/types").Block[];
  /** 发布时间字符串：2026-05-12 19:19 */
  publishedAt: string;
  /** 三类反应 */
  reactions: { like: number; dislike: number; doubt: number };
  /** AI 对本 Event 的摘要（右侧面板要用） */
  aiSummary: string;
  /** 评论列表（事件级 —— 针对整个 Event） */
  comments: CommentItem[];
  /** 段落级评论（针对正文中某段话） */
  inlineComments?: InlineCommentThread[];
}

export interface PublishedTopic {
  id: string;
  title: string;
  /** 作者列表（与编辑页 AuthorsInline 同款展示） */
  authors: {
    id: string;
    name: string;
    title: string;
    avatar: string;
  }[];
  /** 部门 / 业务线（保留，发布元信息行展示用） */
  authorDept: string;
  /** 发布者岗位部门 id（与 USER_DEPARTMENTS 对齐）—— 发布后展示"以哪个岗位发布" */
  authorRoleDeptId?: string;
  publishedAt: string;
  /** 标签（编辑页 TopicTagsField 同款 chip 展示） */
  tags: string[];
  /**
   * Topic 类型：
   * - normal：普通 Topic
   * - department：部门 Topic（关联部门关键策略）
   */
  topicType?: "normal" | "department";
  /**
   * 可见范围 —— 在作者视角发布后页面要回显（与发布时一致）
   * 数组元素是 TEAM_OPTIONS 中的 id；空数组表示"全员可见"
   */
  visibility?: string[];
  /** 可见范围模式：all=全员 / dept=仅本部门 / custom=自定义 */
  visibilityMode?: "all" | "dept" | "custom";
  /** 关联到关键策略：仅当 topicType === "department" 时存在 */
  keyStrategy?: {
    departmentId: string;
    strategyId?: string;
  };
  /** 订阅状态 */
  subscribed: boolean;
  /** 整体 AI 概览 */
  aiOverview: string;
  /** 整体 AI 洞察 */
  aiInsight: string;
  /** AI 洞察列出的小项 */
  aiInsightItems: string[];
  events: PublishedEvent[];
}
