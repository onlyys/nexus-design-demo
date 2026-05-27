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
  /** 评论列表 */
  comments: CommentItem[];
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
   * 可见范围 —— 在作者视角发布后页面要回显（与发布时一致）
   * 数组元素是 TEAM_OPTIONS 中的 id；空数组表示"全员可见"
   */
  visibility?: string[];
  /** 可见范围模式：all=全员 / dept=仅本部门 / custom=自定义 */
  visibilityMode?: "all" | "dept" | "custom";
  /** 关联到关键策略：仅当 tags 含「关联关键策略」时存在 */
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
