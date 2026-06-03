/**
 * Skills 模块的数据模型
 *
 * 设计原则：
 * - Skill 本质上是一种"特殊的 Topic"——可订阅、可评论、有 Event 流
 * - SkillUpdateEvent ≈ PublishedEvent（一次版本更新就是一次 Event）
 * - SkillBacklink：双向引用——Topic 在内容里 @ 过这个 Skill 时反向沉淀过来
 */

/** 出品团队（部门级颗粒度） */
export type SkillDept =
  | "design" //设计中心
  | "legal" // 法务部
  | "finance" // 财务部
  | "tech" // 技术架构部
  | "research"; // 战略与研究中心

/** 能力类型（chip 二级筛选） */
export type SkillType =
  | "prototype" // 原型设计
  | "review" // 设计走查
  | "knowledge" // 知识库
  | "ai-tool" // AI 工具
  | "image-gen" // 生图工具
  | "research" // 用户研究
  | "deploy" // 部署工具
  | "compliance" // 合规检查
  | "doc"; // 文档协作

export interface SkillAuthor {
  id: string;
  handle: string; // tevenxu
  name: string; // 徐天然
  avatar: string;
}

/** 能力卡片：详情页"概览 → 能做什么" */
export interface SkillCapability {
  id: string;
  title: string; // 布局修改：调整页面功能布局
  subtitle: string; // "在首页推荐模块中，把内容变成双列"
  /** 占位插画的渐变色 */
  gradient: [string, string];
  /** 用 lucide 图标名标识能力类型 */
  icon: "layout" | "puzzle" | "image" | "wand" | "search" | "compass";
}

/** 安装方式 */
export interface SkillInstallChannel {
  kind: "download" | "command" | "extension";
  label: string; // "下载安装包"
  hint?: string; // 文件大小、命令片段等
  payload?: string; // 复制命令的具体内容
}

/** 更新日志条目 == Skill 这个 Topic 下的一个 Event */
export interface SkillUpdateEvent {
  id: string;
  index: number; // 序号
  version: string; // v1.2.0
  title: string; // 新增双模识别
  publishedAt: string;
  authorHandle: string;
  changes: string[]; // 改动点
  /** 反应数（参考 PublishedEvent 的 reactions） */
  reactions: { like: number; doubt: number };
}

/** 反向引用：哪些 Topic / Event 在用这个 Skill */
export interface SkillBacklink {
  topicId: string;
  topicTitle: string;
  eventTitle?: string;
  authorHandle: string;
  usedAt: string;
  /** 该 Topic 用这个 skill 做了什么的一句话总结 */
  excerpt: string;
}

/** Skill 主体数据（同时承载列表卡 & 详情页） */
export interface SkillItem {
  id: string;
  name: string; // 腾讯公益设计
  /** 一句话简介，列表与 Hero 都会用 */
  tagline: string;
  /** 详情页"概览"段的长描述 */
  description: string;

  dept: SkillDept;
  types: SkillType[]; // 一个 skill 可对应多个能力 chip
  scenarios: string[]; // 适用场景：公益 / 适老 / 乡村 / 教育 / 通用

  authors: SkillAuthor[];
  version: string; // v1.2.0
  publishedAt: string; // 首发
  updatedAt: string; // 最后更新

  /** 安装次数、复用 Topic 数（用于排序与卡片右下角 stat） */
  installs: number;
  reuses: number;

  /** 详情页：能做什么 */
  capabilities: SkillCapability[];
  /** 详情页：安装方式 */
  install: SkillInstallChannel[];
  /** 详情页：Quick Start 步骤 */
  quickStart: string[];

  /** 这个 Skill 的更新日志 = Event 流 */
  updates: SkillUpdateEvent[];
  /** 反向引用列表 */
  backlinks: SkillBacklink[];
}

/** 部门配置（渲染色 / 图标） */
export const DEPT_CONFIG: Record<
  SkillDept,
  { name: string; chipBg: string; chipText: string; dot: string }
> = {
  design: {
    name: "设计中心",
    chipBg: "bg-blue-50",
    chipText: "text-blue-700",
    dot: "bg-blue-500",
  },
  legal: {
    name: "法务部",
    chipBg: "bg-violet-50",
    chipText: "text-violet-700",
    dot: "bg-violet-500",
  },
  finance: {
    name: "财务部",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  tech: {
    name: "技术架构部",
    chipBg: "bg-amber-50",
    chipText: "text-amber-700",
    dot: "bg-amber-500",
  },
  research: {
    name: "战略与研究",
    chipBg: "bg-rose-50",
    chipText: "text-rose-700",
    dot: "bg-rose-500",
  },
};

export const TYPE_CONFIG: Record<SkillType, string> = {
  prototype: "原型设计",
  review: "设计走查",
  knowledge: "知识库",
  "ai-tool": "AI 工具",
  "image-gen": "生图工具",
  research: "用户研究",
  deploy: "部署工具",
  compliance: "合规检查",
  doc: "文档协作",
};
