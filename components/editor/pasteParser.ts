"use client";

import { uid } from "@/lib/utils";
import type { Block } from "./types";

/* ——————————————————————————————————————————————————————
 * 把外部粘贴的 HTML / 纯文本 / 截图，按真实 DOM 段落结构解析为 Block 序列。
 *
 * 设计目标（对齐飞书文档粘贴体验）：
 *  1. 块级结构 1:1 还原：标题 / 段落 / 列表 / 表格 / 引用 / 代码 / 分隔线 / 图片
 *  2. 段内 inline 样式尽量保真：加粗、斜体、下划线、删除线、行内代码、链接、字号/颜色 (style) 都保留
 *  3. 合并"每字一段"碎片：腾讯文档 / 部分 SaaS 编辑器导出 HTML 会把每个字符放一段，需合并
 *  4. 图片：原样保留外部 URL（不替换为示例图）；加载失败的兜底 UI 由渲染层处理
 *
 * 支持来源：飞书 / 腾讯文档 / Word / 微信公众号 / 普通网页
 * —————————————————————————————————————————————————————— */

/** 段内允许保留的 inline 标签白名单（保留它们以保真 inline 样式） */
const ALLOWED_INLINE_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "STRIKE",
  "DEL",
  "MARK",
  "CODE",
  "SUP",
  "SUB",
  "A",
  "BR",
  "SPAN",
  "FONT",
  "SMALL",
]);

/** 段内允许保留的 inline 属性白名单（避免脚本/事件） */
const ALLOWED_INLINE_ATTRS: Record<string, string[]> = {
  A: ["href", "title", "target", "rel"],
  SPAN: ["style"],
  FONT: ["color", "size", "face"],
  // 其他 tag 不保留属性
};

/** 段内 style 中允许保留的 CSS 属性（保留视觉，剔除布局/危险） */
const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "font-size",
  "font-family",
  "text-decoration",
  "text-decoration-line",
  "text-decoration-style",
  "text-decoration-color",
]);

function sanitizeStyle(styleStr: string): string {
  return styleStr
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .filter((rule) => {
      const colon = rule.indexOf(":");
      if (colon < 0) return false;
      const prop = rule.slice(0, colon).trim().toLowerCase();
      const val = rule.slice(colon + 1).trim().toLowerCase();
      // 阻止任何 url(...) / expression() / javascript: 之类的危险值
      if (val.includes("url(") || val.includes("expression(") || val.includes("javascript:")) {
        return false;
      }
      return ALLOWED_STYLE_PROPS.has(prop);
    })
    .join("; ");
}

/** 递归清洗 inline 节点：保留白名单标签 + 白名单属性，其它降级为文本/<br> */
function sanitizeInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    // 文本节点直接 escape & 保留 NBSP 为普通空格
    return escapeHtml(((node as Text).data || "").replace(/\u00a0/g, " "));
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const tag = el.tagName.toUpperCase();

  // br 直接保留
  if (tag === "BR") return "<br>";

  // 不在白名单 → 取子节点 inline 内容（保留文字）
  if (!ALLOWED_INLINE_TAGS.has(tag)) {
    let inner = "";
    el.childNodes.forEach((c) => (inner += sanitizeInline(c)));
    return inner;
  }

  // 处理属性
  const allowedAttrs = ALLOWED_INLINE_ATTRS[tag] || [];
  const attrParts: string[] = [];
  allowedAttrs.forEach((attr) => {
    const v = el.getAttribute(attr);
    if (!v) return;
    if (attr === "style") {
      const cleaned = sanitizeStyle(v);
      if (cleaned) attrParts.push(`style="${escapeAttr(cleaned)}"`);
      return;
    }
    if (attr === "href") {
      // 仅允许 http/https/mailto/相对路径
      if (!/^(https?:|mailto:|\/|#)/.test(v.trim())) return;
    }
    attrParts.push(`${attr}="${escapeAttr(v)}"`);
  });

  // 链接强制 _blank + noopener
  if (tag === "A") {
    if (!attrParts.find((p) => p.startsWith("target="))) attrParts.push('target="_blank"');
    if (!attrParts.find((p) => p.startsWith("rel="))) attrParts.push('rel="noopener noreferrer"');
  }

  let inner = "";
  el.childNodes.forEach((c) => (inner += sanitizeInline(c)));

  const attrStr = attrParts.length ? " " + attrParts.join(" ") : "";
  const tagLower = tag.toLowerCase();
  return `<${tagLower}${attrStr}>${inner}</${tagLower}>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 提取一个块级元素的 inline HTML（保留段内格式） */
function blockInlineHtml(el: Element): string {
  let html = "";
  el.childNodes.forEach((c) => (html += sanitizeInline(c)));
  // 折叠多余空白：连续空格压成一个；首尾空白去除
  html = html.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
  // 去除首尾 <br>
  html = html.replace(/^(\s|<br\s*\/?>)+/i, "").replace(/(\s|<br\s*\/?>)+$/i, "");
  return html;
}

/** 判断块级元素是否含有有效 inline 内容（不只是空白） */
function hasMeaningfulText(el: Element): boolean {
  return ((el.textContent || "").replace(/\s|\u00a0/g, "")).length > 0;
}

/** 把整个 fragment 顶层节点遍历一遍生成 Block 序列 */
function walk(root: Element, out: Block[]) {
  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = ((node as Text).data || "").replace(/\u00a0/g, " ");
      const stripped = t.replace(/\s+/g, "");
      if (stripped) {
        out.push({ id: uid(), type: "text", text: escapeHtml(t.trim()) });
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    // 1) 标题
    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.slice(1));
      const html = blockInlineHtml(el);
      if (!html) return;
      const type: Block["type"] =
        level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      out.push({ id: uid(), type, text: html } as Block);
      return;
    }

    // 2) 段落 / 普通容器 —— 如果里面嵌套了 ul/ol/img/table 等，递归
    if (tag === "p" || tag === "section" || tag === "article") {
      const childHasBlock =
        el.querySelector(
          "img,ul,ol,table,blockquote,pre,h1,h2,h3,h4,h5,h6,hr",
        ) != null;
      if (childHasBlock) {
        walk(el, out);
      } else {
        const html = blockInlineHtml(el);
        if (html) out.push({ id: uid(), type: "text", text: html });
      }
      return;
    }

    // 3) <div>：智能处理 —— 飞书很多段落用 div；若它只含纯文本 / br，按 text 处理；否则递归
    if (tag === "div") {
      const hasNestedBlock =
        el.querySelector(
          "p,div,ul,ol,table,blockquote,pre,h1,h2,h3,h4,h5,h6,hr,img",
        ) != null;
      if (hasNestedBlock) {
        walk(el, out);
      } else {
        const html = blockInlineHtml(el);
        if (html) out.push({ id: uid(), type: "text", text: html });
      }
      return;
    }

    // 4) 列表
    if (tag === "ul" || tag === "ol") {
      const items: string[] = [];
      el.querySelectorAll(":scope > li").forEach((li) => {
        const html = blockInlineHtml(li);
        if (html) items.push(html);
      });
      if (items.length) {
        out.push({
          id: uid(),
          type: tag === "ul" ? "bulletList" : "numberList",
          items,
        });
      }
      return;
    }

    // 5) 引用
    if (tag === "blockquote") {
      const html = blockInlineHtml(el);
      if (html) out.push({ id: uid(), type: "quote", text: html });
      return;
    }

    // 6) 分割线
    if (tag === "hr") {
      out.push({ id: uid(), type: "divider" });
      return;
    }

    // 7) 表格
    if (tag === "table") {
      const rows: string[][] = [];
      el.querySelectorAll("tr").forEach((tr) => {
        const row: string[] = [];
        tr.querySelectorAll("th,td").forEach((cell) => {
          row.push(blockInlineHtml(cell));
        });
        if (row.length) rows.push(row);
      });
      if (rows.length) out.push({ id: uid(), type: "table", rows });
      return;
    }

    // 8) 代码块
    if (tag === "pre") {
      const code = (el.textContent || "").replace(/\u00a0/g, " ");
      if (code.trim()) {
        out.push({
          id: uid(),
          type: "code",
          language: "text",
          code,
        });
      }
      return;
    }

    // 9) 图片：保留原始 URL，不替换。加载失败由渲染层兜底显示「未经允许不可引用」占位。
    if (tag === "img") {
      const rawSrc = el.getAttribute("src") || "";
      if (!rawSrc) return;
      out.push({
        id: uid(),
        type: "image",
        src: rawSrc,
        caption: el.getAttribute("alt") || "",
        width: 100,
        align: "center",
      });
      return;
    }

    // 10) 兜底：递归
    if (el.children.length > 0 || hasMeaningfulText(el)) {
      walk(el, out);
    }
  });
}

/**
 * 关键修复：合并"碎片化文本块"。
 *
 * 部分编辑器（腾讯文档、富文本 WYSIWYG）粘贴时会把同一段落里的每个字符 / 词 拆成独立 <p> 或 <div>，
 * 解析后会得到几十上百个超短 text block，导致"一段文字一个字一行"的错乱排版。
 *
 * 策略：连续的 text block，如果各自都比较短（无标题/列表/图片间隔），合并为一段，用空格连接。
 * 阈值：单段文本 ≤ 12 个可见字符（不含空白），且本身没有 <br> 段内换行 → 视为"碎片"
 */
function mergeFragments(blocks: Block[]): Block[] {
  const result: Block[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    if (buffer.length === 1) {
      result.push({ id: uid(), type: "text", text: buffer[0] });
    } else {
      // 多段合并：相邻碎片之间用空字符串拼接（中文场景），保留 inline html
      result.push({ id: uid(), type: "text", text: buffer.join("") });
    }
    buffer = [];
  };

  const visibleLen = (html: string) => {
    // 估算可见字符数：去标签后的纯文本长度
    return html.replace(/<[^>]+>/g, "").replace(/\s/g, "").length;
  };

  blocks.forEach((b) => {
    if (
      b.type === "text" &&
      visibleLen((b as any).text) > 0 &&
      visibleLen((b as any).text) <= 12 &&
      !/<br/i.test((b as any).text)
    ) {
      buffer.push((b as any).text);
      return;
    }
    flush();
    result.push(b);
  });
  flush();
  return result;
}

/**
 * 主入口：把粘贴板的 HTML + fileImages 解析为 Block 序列。
 *  - 若 HTML 存在 → 按 DOM 解析（保留 inline 样式）
 *  - 否则按纯文本（按双换行 → 段落）
 *  - fileImages 追加到结尾
 */
export function parsePasteToBlocks(opts: {
  html: string;
  text: string;
  fileImages: { src: string; name?: string }[];
}): Block[] {
  const { html, text, fileImages } = opts;
  const out: Block[] = [];

  if (html && html.trim()) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc
      .querySelectorAll("script,style,meta,link,iframe,noscript,head")
      .forEach((n) => n.remove());
    walk(doc.body, out);
  } else if (text && text.trim()) {
    // 纯文本：双换行优先；其次单换行
    const parts = text
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    parts.forEach((p) =>
      out.push({ id: uid(), type: "text", text: escapeHtml(p) }),
    );
  }

  // 截图 / 来自 ClipboardItem File 的图片，追加到末尾
  fileImages.forEach((img) => {
    out.push({
      id: uid(),
      type: "image",
      src: img.src,
      caption: img.name || "",
      width: 100,
      align: "center",
    });
  });

  // 合并"每字一段"碎片
  const merged = mergeFragments(out);

  // 去除连续空 text
  const cleaned: Block[] = [];
  merged.forEach((b) => {
    if (
      b.type === "text" &&
      ((b as any).text?.replace(/<[^>]+>/g, "").trim().length ?? 0) === 0 &&
      cleaned.length > 0 &&
      cleaned[cleaned.length - 1].type === "text" &&
      ((cleaned[cleaned.length - 1] as any).text?.replace(/<[^>]+>/g, "").trim()
        .length ?? 0) === 0
    ) {
      return;
    }
    cleaned.push(b);
  });

  return cleaned;
}
