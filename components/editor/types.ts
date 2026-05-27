export type BlockType =
  | "text"
  | "h1"
  | "h2"
  | "h3"
  | "bulletList"
  | "numberList"
  | "quote"
  | "divider"
  | "image"
  | "file"
  | "link"
  | "todo"
  | "table"
  | "code"
  | "pptPreview"
  | "htmlPreview";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextLikeBlock extends BaseBlock {
  type: "text" | "h1" | "h2" | "h3" | "quote";
  text: string;
}

export interface ListBlock extends BaseBlock {
  type: "bulletList" | "numberList";
  items: string[];
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  caption?: string;
  /** 宽度百分比，30 ~ 100，默认 100 */
  width?: number;
  /** 对齐方式 */
  align?: "left" | "center" | "right";
}

export interface FileBlock extends BaseBlock {
  type: "file";
  name: string;
  size: number; // bytes
  fileType: "pdf" | "ppt" | "doc" | "xls" | "image" | "other";
  /** 是否使用 PDF 大缩略卡（仅 fileType=pdf 时有意义） */
  pdfPreview?: boolean;
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  title: string;
  url: string;
  desc?: string;
  /**
   * 展示形态：
   * - plain：纯链接（标题 + URL）
   * - card：缩略卡片（含来源图标 / 描述 / 封面缩略）
   * - full：整体内嵌（占位完整网页阅读体验）
   */
  display?: "plain" | "card" | "full";
  /** 缩略 / 整体形态下使用的额外信息 */
  siteName?: string;
  cover?: string;
  faviconText?: string;
}

export interface TodoBlock extends BaseBlock {
  type: "todo";
  items: { id: string; text: string; done: boolean }[];
}

export interface TableBlock extends BaseBlock {
  type: "table";
  rows: string[][];
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  language: string;
  code: string;
}

export interface PptPreviewBlock extends BaseBlock {
  type: "pptPreview";
  name: string;
  totalSlides: number;
  currentSlide: number;
  title: string;
  subtitle?: string;
  date?: string;
  thumbnails: string[]; // 缩略图 URL
  mainSlide: string; // 主预览幻灯片 URL（这里用图片占位）
}

export interface HtmlPreviewBlock extends BaseBlock {
  type: "htmlPreview";
  url: string;
  siteName: string;
  pageTitle: string;
  description?: string;
  cover?: string; // 顶图
  faviconText?: string; // 占位图标文字
  /**
   * 展示形态（与 LinkBlock 三态保持一致）：
   * - plain：纯链接（标题 + URL 单行卡，最轻量）
   * - card：缩略卡片 —— 紧凑展示，混排在 block 流里
   * - full：整体内嵌 —— 占满 Event 主区，模拟完整网页阅读体验
   */
  mode?: "plain" | "card" | "full";
}

export type Block =
  | TextLikeBlock
  | ListBlock
  | DividerBlock
  | ImageBlock
  | FileBlock
  | LinkBlock
  | TodoBlock
  | TableBlock
  | CodeBlock
  | PptPreviewBlock
  | HtmlPreviewBlock;
