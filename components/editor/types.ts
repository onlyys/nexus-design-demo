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
  /**
   * 旧字段（保留兼容）：仅 fileType=pdf 时有意义；新代码请用 displayMode。
   */
  pdfDisplayMode?: "preview" | "thumbnail";
  /**
   * 统一展示形态（PDF / PPT / HTML / 图片等支持预览的附件）：
   * - card：紧凑文件卡（默认）
   * - preview：内嵌预览（PDF 大预览 / PPT 幻灯片 / HTML 嵌入网页 等）
   * 注：非常见文件类型（doc/xls/other）不支持 preview，固定为 card。
   */
  displayMode?: "card" | "preview";
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  title: string;
  url: string;
  desc?: string;
  /**
   * 旧字段（保留兼容）：plain/card/full 三态。
   * 新代码请用 displayMode（card / preview 二态）。
   */
  display?: "plain" | "card" | "full";
  /** 统一展示形态：card 紧凑卡 / preview 内嵌网页 */
  displayMode?: "card" | "preview";
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
  /** 统一展示形态：card 紧凑文件卡 / preview 大幻灯片预览（默认 preview） */
  displayMode?: "card" | "preview";
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
   * 旧字段（保留兼容）：plain / card / full 三态。
   * 新代码请用 displayMode。
   */
  mode?: "plain" | "card" | "full";
  /** 统一展示形态：card 紧凑卡片 / preview 嵌入网页 */
  displayMode?: "card" | "preview";
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
