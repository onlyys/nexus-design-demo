"use client";

import * as React from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType,
  Image as ImageIcon,
  ImageOff,
  ExternalLink,
  Globe,
  Search,
  Check,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { AttachmentHoverWrapper } from "@/components/blocks/AttachmentHoverWrapper";
import {
  UnifiedAttachmentPreview,
  PdfMockPage,
  DocMockPage,
  PptMockSlide,
} from "@/components/blocks/UnifiedAttachmentPreview";
import type { Block } from "@/components/editor/types";

/** 复制文本到剪贴板（demo 占位实现，失败静默） */
function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

/** 给附件类 block 生成一条用于复制 / 分享的伪链接 */
function fileShareUrl(id: string, name: string) {
  return `https://nexus.demo/files/${id}/${encodeURIComponent(name)}`;
}

/** 渲染粘贴解析后的富文本字符串：可能含 inline HTML（加粗/颜色/链接等） */
function RichText({
  text,
  as: Tag = "span",
  className,
}: {
  text: string;
  as?: any;
  className?: string;
}) {
  const isHtml = /<[a-zA-Z]+[^>]*>/.test(text);
  if (isHtml) {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return <Tag className={className}>{text}</Tag>;
}

/** 发布后图片：保留原始 URL；加载失败显示「未经允许不可引用」明确占位 */
function ReadOnlyImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="w-full aspect-[16/9] bg-[repeating-linear-gradient(135deg,#f5f5f7_0,#f5f5f7_8px,#ebebee_8px,#ebebee_16px)] rounded-lg border border-ink-100 flex flex-col items-center justify-center text-ink-500 px-6 text-center">
        <ImageOff className="w-8 h-8 mb-2 text-ink-400" />
        <div className="text-[12.5px] font-semibold text-ink-700">
          此图片未经允许不可引用
        </div>
        <div className="mt-1 text-[11px] text-ink-500 max-w-xs leading-relaxed">
          原图来自外部源（防盗链限制），无法在站外加载
        </div>
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt ?? ""}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/**
 * 发布后只读 Block 渲染器
 * - 不带任何编辑态（无 contenteditable / 无 hover handle / 无 toolbar）
 * - 视觉沿用编辑态，但更克制
 */
export function ReadOnlyBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <RichText
          as="p"
          text={block.text}
          className="text-[14.5px] leading-[1.95] text-ink-800 whitespace-pre-wrap"
        />
      );
    case "h1":
      return (
        <RichText
          as="h2"
          text={block.text}
          className="text-[22px] leading-[1.4] font-bold tracking-tight text-ink-900 mt-2"
        />
      );
    case "h2":
      return (
        <RichText
          as="h3"
          text={block.text}
          className="text-[18px] leading-[1.4] font-semibold tracking-tight text-ink-900 mt-2"
        />
      );
    case "h3":
      return (
        <RichText
          as="h4"
          text={block.text}
          className="text-[15.5px] leading-[1.4] font-semibold tracking-tight text-ink-900 mt-1.5"
        />
      );
    case "quote":
      return (
        <RichText
          as="blockquote"
          text={block.text}
          className="border-l-[3px] border-brand-500/70 pl-4 py-1 bg-brand-50/40 rounded-r-md text-[14px] leading-[1.95] text-ink-700 italic"
        />
      );
    case "bulletList":
    case "numberList":
      return (
        <ul className="space-y-1 py-0.5">
          {block.items.map((it, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[14.5px] leading-[1.95] text-ink-800"
            >
              <span className="select-none mt-[8px] shrink-0 text-ink-500 font-medium tabular-nums min-w-[16px]">
                {block.type === "bulletList" ? (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink-700" />
                ) : (
                  <span>
                    {String.fromCharCode("a".charCodeAt(0) + i)})
                  </span>
                )}
              </span>
              <RichText
                as="span"
                text={it}
                className="flex-1 min-w-0"
              />
            </li>
          ))}
        </ul>
      );
    case "divider":
      return (
        <div className="py-3">
          <div className="h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
        </div>
      );
    case "image":
      return (
        <figure
          className={cn(
            "my-2",
            block.align === "left" && "mr-auto",
            block.align === "right" && "ml-auto",
            block.align === "center" && "mx-auto",
          )}
          style={{
            width: `${block.width ?? 100}%`,
          }}
        >
          <ReadOnlyImage
            src={block.src}
            alt={block.caption ?? ""}
            className="block w-full rounded-lg border border-ink-100"
          />
          {block.caption && (
            <figcaption className="mt-1.5 text-[12px] text-ink-500 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "file":
      return <FileReadOnly block={block} />;
    case "link":
      return <LinkReadOnly block={block} />;
    case "todo":
      return (
        <ul className="space-y-1.5 py-1">
          {block.items.map((it) => (
            <li key={it.id} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-[5px] h-[16px] w-[16px] rounded border transition-all flex items-center justify-center shrink-0",
                  it.done
                    ? "bg-brand-600 border-brand-600"
                    : "bg-white border-ink-300",
                )}
              >
                {it.done && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </span>
              <span
                className={cn(
                  "flex-1 text-[14px] leading-[1.85]",
                  it.done ? "text-ink-400 line-through" : "text-ink-800",
                )}
              >
                {it.text}
              </span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="my-2 overflow-x-auto rounded-xl border border-ink-200">
          <table className="min-w-full text-[13px]">
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={cn(ri === 0 && "bg-ink-50")}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "border-r border-b border-ink-200 last:border-r-0 px-3 py-2",
                        ri === 0
                          ? "font-semibold text-ink-900"
                          : "text-ink-700",
                      )}
                    >
                      <RichText as="span" text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <pre className="my-2 rounded-xl border border-ink-200 bg-[#0f172a] overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10">
            <span className="text-[11.5px] font-mono text-ink-400">
              {block.language}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
          </div>
          <code className="block px-4 py-3 font-mono text-[12.5px] leading-[1.7] text-emerald-200 whitespace-pre">
            {block.code}
          </code>
        </pre>
      );
    case "pptPreview":
      return <PptPreviewReadOnly block={block} />;
    case "htmlPreview":
      return <HtmlPreviewReadOnly block={block} />;
  }
}

function fileIcon(t: string) {
  switch (t) {
    case "pdf":
      return { Icon: FileType, color: "text-red-500", bg: "bg-red-50" };
    case "ppt":
      return {
        Icon: Presentation,
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    case "xls":
      return {
        Icon: FileSpreadsheet,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      };
    case "doc":
      return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
    case "image":
      return { Icon: ImageIcon, color: "text-violet-500", bg: "bg-violet-50" };
    default:
      return { Icon: FileText, color: "text-ink-500", bg: "bg-ink-100" };
  }
}

/* ============================================================
 * HTML 整体内嵌视图（只读版本，沿用编辑态视觉）
 * 用于 htmlPreview 的 mode === "full"
 * ============================================================ */

type HtmlFullBlock = Extract<Block, { type: "htmlPreview" }>;

function HtmlFullView({ block }: { block: HtmlFullBlock }) {
  return (
    <div className="my-2.5 rounded-xl overflow-hidden border bg-white shadow-card border-brand-200">
      {/* 来源条 */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-ink-100 bg-ink-50/60">
        <div className="h-5 w-5 rounded-md bg-gradient-to-br from-ink-700 to-ink-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {block.faviconText || "·"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-ink-800 truncate">
            {block.siteName}：{block.pageTitle}
          </div>
          <div className="text-[11px] text-brand-600 truncate">
            {block.url}
          </div>
        </div>
        <span className="text-[10.5px] text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded shrink-0">
          整体内嵌
        </span>
        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
          className="h-6 w-6 rounded-md text-ink-400 hover:text-ink-700 hover:bg-ink-100 inline-flex items-center justify-center shrink-0"
          title="在浏览器中打开"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 浏览器地址栏 */}
      <div className="bg-white">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-ink-100 bg-ink-50/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-2 h-6 px-2.5 rounded-md bg-white border border-ink-200 flex items-center text-[11.5px] text-ink-500 truncate">
            <Globe className="w-3 h-3 mr-1.5 text-ink-400 shrink-0" />
            {block.url}
          </div>
        </div>

        {/* 可滚动视口：模拟「整页 HTML」嵌入式阅读 */}
        <div className="max-h-[1100px] overflow-y-auto bg-white">
          {/* 网站顶栏 */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-3.5 border-b border-ink-100 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-brand-500 to-violet-500 text-white text-[12px] font-bold flex items-center justify-center">
                {block.faviconText || "S"}
              </div>
              <div className="text-[16px] font-bold tracking-tight text-ink-900 truncate max-w-[260px]">
                {block.siteName}
              </div>
            </div>
            <div className="flex items-center gap-5 text-[12.5px] text-ink-700">
              <span className="inline-flex items-center gap-0.5">
                项目<span className="text-ink-400">▾</span>
              </span>
              <span className="inline-flex items-center gap-0.5">
                实验室<span className="text-ink-400">▾</span>
              </span>
              <span>新闻</span>
              <span className="inline-flex items-center gap-0.5">
                加入我们<span className="text-ink-400">▾</span>
              </span>
              <Search className="w-4 h-4 text-ink-500" />
            </div>
          </div>

          {/* Hero 大图 */}
          {block.cover && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.cover}
                alt=""
                className="block w-full h-[320px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8 text-white">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-medium">
                  Tencent SSV · 乡村振兴
                </div>
                <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-tight max-w-[680px]">
                  {block.pageTitle}
                </h1>
              </div>
            </div>
          )}

          {/* 正文：左主栏 + 右目录 */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px] gap-8 px-8 py-8 max-w-[1080px] mx-auto">
            <article className="min-w-0">
              <div className="flex items-center gap-3 text-[12px] text-ink-500">
                <span>{block.siteName}</span>
                <span>·</span>
                <span>2026 年 5 月 18 日</span>
                <span>·</span>
                <span>预计阅读 8 分钟</span>
              </div>

              {block.description && (
                <p className="mt-5 text-[16px] leading-[1.85] text-ink-800 font-medium">
                  {block.description}
                </p>
              )}

              <p className="mt-5 text-[14.5px] leading-[1.95] text-ink-700">
                自 2022 年启动以来，「为村耕耘者」计划已与全国 200+
                县域合作，沉淀出一套以「数字工具箱 + 本地化运营 +
                在地人才培养」为三角的乡村振兴方法论。我们相信，数字技术不是答案本身，但它可以让乡村干部、合作社、年轻返乡者拥有更高的执行效率，让真正服务于乡村的人「站得住、留得下」。
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <DataCard num="200+" label="合作县域" />
                <DataCard num="1.5万" label="数字乡村人才" />
                <DataCard num="3.2亿" label="县域农产品上行" />
              </div>

              <h2
                id="part-1"
                className="mt-10 text-[20px] font-semibold text-ink-900 tracking-tight"
              >
                一、本季度三个关键进展
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.95] text-ink-700">
                本季度，「为村耕耘者」在数字工具、人才培养和产业撮合三个方向均有可量化的进展，我们也把方法论沉淀为更标准化的复用包，供更多县域调用。
              </p>

              <h3 className="mt-6 text-[16px] font-semibold text-ink-900">
                1.1 数字工具箱
              </h3>
              <ul className="mt-2 space-y-1.5 text-[14px] text-ink-700 list-disc pl-5 leading-[1.95]">
                <li>
                  新增「县域文旅小程序模板」，覆盖景区导览、特产电商、民宿预订三个核心场景
                </li>
                <li>模板在 18 个县复用，平均开发周期从 6 周缩短至 3 天</li>
                <li>新增「合作社数字台账」轻量工具，已服务 320 家农民合作社</li>
              </ul>

              <h3 className="mt-6 text-[16px] font-semibold text-ink-900">
                1.2 数字乡村青年人才
              </h3>
              <p className="mt-2 text-[14px] leading-[1.95] text-ink-700">
                与 27 所高校共建「数字乡村青年人才项目」， 累计培训 1.5
                万人次，其中 62% 学员选择留在县域工作，远高于行业平均 31%
                的留存率。
              </p>

              <div className="mt-5 rounded-xl overflow-hidden border border-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80"
                  alt=""
                  className="block w-full h-[280px] object-cover"
                />
                <div className="px-3 py-2 text-[11.5px] text-ink-500 bg-ink-50">
                  图：青年人才培训现场（云南 · 元阳县）
                </div>
              </div>

              <h3 className="mt-6 text-[16px] font-semibold text-ink-900">
                1.3 产业撮合与农产品上行
              </h3>
              <p className="mt-2 text-[14px] leading-[1.95] text-ink-700">
                联合电商平台和企业采购渠道，撮合县域农产品上行交易额 3.2
                亿元，覆盖 14 个国家乡村振兴重点帮扶县。
              </p>

              <div className="mt-5 overflow-x-auto rounded-xl border border-ink-200">
                <table className="min-w-full text-[13px]">
                  <thead className="bg-ink-50 text-ink-700">
                    <tr>
                      <th className="px-3.5 py-2 text-left font-semibold">省份</th>
                      <th className="px-3.5 py-2 text-left font-semibold">覆盖县域</th>
                      <th className="px-3.5 py-2 text-left font-semibold">青年人才（人）</th>
                      <th className="px-3.5 py-2 text-left font-semibold">农产品上行</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-700">
                    <tr className="border-t border-ink-100">
                      <td className="px-3.5 py-2">云南</td>
                      <td className="px-3.5 py-2">38</td>
                      <td className="px-3.5 py-2">3,420</td>
                      <td className="px-3.5 py-2">8,200 万</td>
                    </tr>
                    <tr className="border-t border-ink-100">
                      <td className="px-3.5 py-2">贵州</td>
                      <td className="px-3.5 py-2">32</td>
                      <td className="px-3.5 py-2">2,860</td>
                      <td className="px-3.5 py-2">6,700 万</td>
                    </tr>
                    <tr className="border-t border-ink-100">
                      <td className="px-3.5 py-2">甘肃</td>
                      <td className="px-3.5 py-2">29</td>
                      <td className="px-3.5 py-2">2,180</td>
                      <td className="px-3.5 py-2">5,100 万</td>
                    </tr>
                    <tr className="border-t border-ink-100">
                      <td className="px-3.5 py-2">湖北</td>
                      <td className="px-3.5 py-2">26</td>
                      <td className="px-3.5 py-2">1,950</td>
                      <td className="px-3.5 py-2">4,300 万</td>
                    </tr>
                    <tr className="border-t border-ink-100">
                      <td className="px-3.5 py-2">其它</td>
                      <td className="px-3.5 py-2">75</td>
                      <td className="px-3.5 py-2">4,590</td>
                      <td className="px-3.5 py-2">7,700 万</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <blockquote className="mt-7 border-l-4 border-brand-500/80 pl-5 py-1 italic text-[14.5px] leading-[1.95] text-ink-700">
                &ldquo;数字技术让我们这些乡镇干部第一次有了「数据视角」，知道每一份预算、每一次行动落到了哪里。&rdquo;
                <footer className="mt-2 not-italic text-[12.5px] text-ink-500">
                  —— 云南元阳县乡村振兴办 张主任
                </footer>
              </blockquote>

              <h2
                id="part-2"
                className="mt-10 text-[20px] font-semibold text-ink-900 tracking-tight"
              >
                二、方法论沉淀
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.95] text-ink-700">
                我们把过去三年的运营经验，沉淀为一套可复用的「乡村振兴数字方法论」，从问题诊断、工具选型、运营落地到效果评估，形成完整闭环。
              </p>
              <ol className="mt-3 space-y-1.5 text-[14px] text-ink-700 list-decimal pl-6 leading-[1.95]">
                <li>
                  <strong>问题诊断阶段：</strong>
                  通过田野调研找到县域真实痛点，避免「自上而下」的伪需求
                </li>
                <li>
                  <strong>工具选型阶段：</strong>
                  优先使用低门槛、可白嫖、可二次开发的开源 / SaaS 工具
                </li>
                <li>
                  <strong>本地化运营阶段：</strong>
                  让真正在县域工作的人成为「数字翻译者」
                </li>
                <li>
                  <strong>效果评估阶段：</strong>
                  统一指标体系（DAU、留存、上行 GMV、人才留存率）
                </li>
              </ol>

              <h2
                id="part-3"
                className="mt-10 text-[20px] font-semibold text-ink-900 tracking-tight"
              >
                三、下一步：开放共建
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.95] text-ink-700">
                下阶段我们将把「为村」开放给更多伙伴共建：
              </p>
              <ul className="mt-2 space-y-1.5 text-[14px] text-ink-700 list-disc pl-5 leading-[1.95]">
                <li>与高校共同培养乡村振兴方向的专业人才，建立长期实习与就业通道</li>
                <li>把数字工具箱以 SaaS 形式开放给县域政府与社会组织，免费使用</li>
                <li>建立「为村开放联盟」，邀请更多企业、NGO、研究机构加入</li>
              </ul>

              <div className="mt-7 rounded-xl border border-ink-200 bg-ink-50/40 p-5">
                <div className="text-[13px] font-semibold text-ink-900 mb-3">
                  2026 路线图
                </div>
                <ol className="relative border-l-2 border-brand-500/40 ml-2 space-y-3 pl-4">
                  <TimelineItem
                    date="6 月"
                    title="数字工具箱 v2.0 发布"
                    desc="新增 5 套模板，开放 OpenAPI"
                  />
                  <TimelineItem
                    date="8 月"
                    title="开放共建联盟成立"
                    desc="首批吸纳 50 家合作伙伴"
                  />
                  <TimelineItem
                    date="10 月"
                    title="第三届乡村振兴数字论坛"
                    desc="发布《数字乡村方法论》白皮书"
                  />
                  <TimelineItem
                    date="12 月"
                    title="年度复盘 & 三年回顾"
                    desc="出版「为村三年」官方画册"
                  />
                </ol>
              </div>

              {/* 页脚 */}
              <div className="mt-10 pt-6 border-t border-ink-100 text-[11.5px] text-ink-500 leading-relaxed">
                <div className="flex flex-wrap items-center gap-3">
                  <span>© 2026 Tencent SSV</span>
                  <span>·</span>
                  <span>关于我们</span>
                  <span>·</span>
                  <span>联系我们</span>
                  <span>·</span>
                  <span>媒体咨询</span>
                  <span>·</span>
                  <span>加入我们</span>
                </div>
                <div className="mt-1.5">
                  Tencent for Good · 用户为本 · 科技向善
                </div>
              </div>
            </article>

            {/* 右侧 TOC */}
            <aside className="hidden md:block sticky top-16 self-start">
              <div className="text-[11px] font-medium tracking-wide text-ink-400 mb-2">
                本页目录
              </div>
              <a
                href="#part-1"
                className="block text-[12.5px] text-ink-700 hover:text-brand-600 py-1 border-l-2 border-brand-500 pl-2.5"
              >
                一、本季度三个关键进展
              </a>
              <a
                href="#part-2"
                className="block text-[12.5px] text-ink-600 hover:text-brand-600 py-1 border-l-2 border-ink-200 pl-2.5"
              >
                二、方法论沉淀
              </a>
              <a
                href="#part-3"
                className="block text-[12.5px] text-ink-600 hover:text-brand-600 py-1 border-l-2 border-ink-200 pl-2.5"
              >
                三、下一步：开放共建
              </a>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataCard({ num, label }: { num: string; label: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3.5">
      <div className="text-[22px] font-bold text-brand-600 tabular-nums leading-none">
        {num}
      </div>
      <div className="mt-1.5 text-[11.5px] text-ink-500">{label}</div>
    </div>
  );
}

function TimelineItem({
  date,
  title,
  desc,
}: {
  date: string;
  title: string;
  desc: string;
}) {
  return (
    <li className="relative">
      <span className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" />
      <div className="text-[12px] font-medium text-brand-600">{date}</div>
      <div className="mt-0.5 text-[13.5px] font-semibold text-ink-900">
        {title}
      </div>
      <div className="text-[12px] text-ink-500 mt-0.5">{desc}</div>
    </li>
  );
}

/* ============================================================
 * 附件类 block 的只读子组件 ——
 * 都用 AttachmentHoverWrapper 提供 hover 时的下载 / 切换视图
 * （切换状态保留在本地 state，不持久化）
 * ============================================================ */

type FileBlockType = Extract<Block, { type: "file" }>;
type LinkBlockType = Extract<Block, { type: "link" }>;
type PptPreviewBlockType = Extract<Block, { type: "pptPreview" }>;
type HtmlPreviewBlockType = Extract<Block, { type: "htmlPreview" }>;

function FileReadOnly({ block }: { block: FileBlockType }) {
  const isPdf = block.fileType === "pdf";
  const isDoc = block.fileType === "doc";
  // 初始化模式：兼容旧 pdfDisplayMode + 新 displayMode
  const initial: "card" | "preview" =
    block.displayMode ??
    (block.pdfDisplayMode === "preview" ? "preview" : "card");
  const [mode, setMode] = React.useState<"card" | "preview">(initial);

  const supportsPreview = isPdf || isDoc;
  const { Icon, color, bg } = fileIcon(block.fileType);

  if (isPdf && mode === "preview") {
    return (
      <AttachmentHoverWrapper
        mode={mode}
        onChangeMode={setMode}
        supportsPreview={supportsPreview}
        onDownload={() => {}}
        onCopyLink={() =>
          copyToClipboard(fileShareUrl(block.id, block.name))
        }
        readOnly
      >
        <UnifiedAttachmentPreview
          fileType="pdf"
          name={block.name}
          size={block.size}
          currentPage={1}
          totalPages={28}
        >
          <PdfMockPage />
        </UnifiedAttachmentPreview>
      </AttachmentHoverWrapper>
    );
  }

  if (isDoc && mode === "preview") {
    return (
      <AttachmentHoverWrapper
        mode={mode}
        onChangeMode={setMode}
        supportsPreview={supportsPreview}
        onDownload={() => {}}
        onCopyLink={() =>
          copyToClipboard(fileShareUrl(block.id, block.name))
        }
        readOnly
      >
        <UnifiedAttachmentPreview
          fileType="doc"
          name={block.name}
          size={block.size}
          currentPage={1}
          totalPages={12}
        >
          <DocMockPage />
        </UnifiedAttachmentPreview>
      </AttachmentHoverWrapper>
    );
  }

  return (
    <AttachmentHoverWrapper
      mode={mode}
      onChangeMode={supportsPreview ? setMode : undefined}
      supportsPreview={supportsPreview}
      onDownload={() => {}}
      onCopyLink={() => copyToClipboard(fileShareUrl(block.id, block.name))}
      readOnly
    >
      <div className="my-1.5 flex items-center gap-3 px-3.5 py-3 pr-12 rounded-xl border border-ink-200 bg-white hover:border-ink-300 hover:shadow-card transition-all cursor-pointer">
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            bg,
          )}
        >
          <Icon className={cn("w-5 h-5", color)} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-ink-900 truncate">
            {block.name}
          </div>
          <div className="text-[12px] text-ink-500 mt-0.5">
            {formatBytes(block.size)}
          </div>
        </div>
      </div>
    </AttachmentHoverWrapper>
  );
}

function LinkReadOnly({ block }: { block: LinkBlockType }) {
  const initial: "card" | "preview" =
    block.displayMode ?? (block.display === "full" ? "preview" : "card");
  const [mode, setMode] = React.useState<"card" | "preview">(initial);

  if (mode === "card") {
    return (
      <AttachmentHoverWrapper
        mode={mode}
        onChangeMode={setMode}
        supportsPreview
        onCopyLink={() => copyToClipboard(block.url)}
        readOnly
      >
        <div className="my-2 rounded-xl overflow-hidden border border-ink-200 bg-white shadow-card">
          <div className="flex items-center gap-2 px-3.5 py-2 border-b border-ink-100 bg-ink-50/60 pr-12">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-ink-700 to-ink-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {block.faviconText || block.title.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-ink-800 truncate">
                {block.siteName || block.title}
              </div>
              <div className="text-[11px] text-brand-600 truncate">
                {block.url}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4 px-4 py-4 bg-white">
            <div className="min-w-0">
              <div className="text-[15px] font-bold leading-snug text-ink-900">
                {block.title}
              </div>
              {block.desc && (
                <div className="mt-1.5 text-[12.5px] text-ink-600 leading-relaxed line-clamp-3">
                  {block.desc}
                </div>
              )}
              <a
                href={block.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-600 hover:underline"
              >
                在浏览器中查看原文
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {block.cover && (
              <div className="rounded-lg overflow-hidden border border-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.cover}
                  alt=""
                  className="block w-full h-[100px] object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </AttachmentHoverWrapper>
    );
  }

  // preview 模式：内嵌网页大卡
  return (
    <AttachmentHoverWrapper
      mode={mode}
      onChangeMode={setMode}
      supportsPreview
      onCopyLink={() => copyToClipboard(block.url)}
      readOnly
    >
      <div className="my-2 rounded-xl overflow-hidden border border-brand-200 bg-white shadow-card">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-ink-100 bg-ink-50/80 pr-12">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-2 h-6 px-2.5 rounded-md bg-white border border-ink-200 flex items-center text-[11.5px] text-ink-500 truncate">
            <Globe className="w-3 h-3 mr-1.5 text-ink-400 shrink-0" />
            {block.url}
          </div>
        </div>
        {block.cover && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.cover}
              alt=""
              className="block w-full h-[260px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 text-white">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-medium">
                {block.siteName || "外部网页"}
              </div>
              <h1 className="mt-3 text-[24px] font-bold leading-tight tracking-tight max-w-[680px]">
                {block.title}
              </h1>
            </div>
          </div>
        )}
        <div className="px-6 py-5">
          {block.desc && (
            <p className="text-[14.5px] leading-[1.85] text-ink-800">
              {block.desc}
            </p>
          )}
          <a
            href={block.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-600 hover:underline"
          >
            查看完整原文
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </AttachmentHoverWrapper>
  );
}

function PptPreviewReadOnly({ block }: { block: PptPreviewBlockType }) {
  const initial: "card" | "preview" = block.displayMode ?? "preview";
  const [mode, setMode] = React.useState<"card" | "preview">(initial);

  // card 模式：紧凑的 PPT 文件卡（与 file ppt 一致）
  if (mode === "card") {
    return (
      <AttachmentHoverWrapper
        mode={mode}
        onChangeMode={setMode}
        supportsPreview
        onDownload={() => {}}
        onCopyLink={() => copyToClipboard(fileShareUrl(block.id, block.name))}
        readOnly
      >
        <div className="my-1.5 flex items-center gap-3 px-3.5 py-3 pr-12 rounded-xl border border-ink-200 bg-white hover:border-ink-300 hover:shadow-card transition-all cursor-pointer">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-orange-50">
            <Presentation className="w-5 h-5 text-orange-500" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-ink-900 truncate">
              {block.name}
            </div>
            <div className="text-[12px] text-ink-500 mt-0.5">
              共 {block.totalSlides} 张幻灯片
            </div>
          </div>
        </div>
      </AttachmentHoverWrapper>
    );
  }

  return (
    <AttachmentHoverWrapper
      mode={mode}
      onChangeMode={setMode}
      supportsPreview
      onDownload={() => {}}
      onCopyLink={() => copyToClipboard(fileShareUrl(block.id, block.name))}
      readOnly
    >
      <UnifiedAttachmentPreview
        fileType="ppt"
        name={block.name}
        currentPage={block.currentSlide}
        totalPages={block.totalSlides}
        pageUnit="张"
      >
        <PptMockSlide
          image={block.mainSlide}
          title={block.title}
          subtitle={block.subtitle}
          date={block.date}
        />
      </UnifiedAttachmentPreview>
    </AttachmentHoverWrapper>
  );
}

function HtmlPreviewReadOnly({ block }: { block: HtmlPreviewBlockType }) {
  const initial: "card" | "preview" =
    block.displayMode ?? (block.mode === "full" ? "preview" : "card");
  const [mode, setMode] = React.useState<"card" | "preview">(initial);

  if (mode === "preview") {
    return (
      <AttachmentHoverWrapper
        mode={mode}
        onChangeMode={setMode}
        supportsPreview
        onCopyLink={() => copyToClipboard(block.url)}
        readOnly
      >
        <HtmlFullView block={block} />
      </AttachmentHoverWrapper>
    );
  }

  // card 模式：紧凑缩略卡（标题 + URL + 缩略图，不展示页面内容）
  return (
    <AttachmentHoverWrapper
      mode={mode}
      onChangeMode={setMode}
      supportsPreview
      onCopyLink={() => copyToClipboard(block.url)}
      readOnly
    >
      <div className="my-1.5 flex items-center gap-3 px-3.5 py-3 pr-12 rounded-xl border border-ink-200 bg-white hover:border-ink-300 hover:shadow-card transition-all cursor-pointer">
        <div className="h-12 w-12 rounded-md overflow-hidden border border-ink-100 shrink-0 bg-ink-50">
          {block.cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={block.cover}
              alt=""
              className="block w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ink-700 to-ink-900 text-white text-[14px] font-bold flex items-center justify-center">
              {block.faviconText || "·"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-ink-900 truncate">
            {block.pageTitle}
          </div>
          <div className="text-[12px] text-ink-500 mt-0.5 truncate flex items-center gap-1">
            <Globe className="w-3 h-3 shrink-0 text-ink-400" />
            {block.url}
          </div>
        </div>
      </div>
    </AttachmentHoverWrapper>
  );
}
