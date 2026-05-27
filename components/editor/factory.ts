import { uid } from "@/lib/utils";
import type { Block, BlockType } from "./types";

export function createBlock(
  type: BlockType,
  meta?: {
    mode?: "plain" | "card" | "full";
    fileType?: "pdf" | "ppt" | "doc" | "xls" | "image" | "other";
    rows?: number;
    cols?: number;
    /** 链接 block 的初始 url（可选） */
    linkUrl?: string;
    /** 链接 block 的初始 display 形态（可选） */
    linkDisplay?: "plain" | "card" | "full";
  },
): Block {
  const id = uid();
  switch (type) {
    case "text":
    case "h1":
    case "h2":
    case "h3":
    case "quote":
      return { id, type, text: "" };
    case "bulletList":
    case "numberList":
      return { id, type, items: [""] };
    case "divider":
      return { id, type };
    case "image":
      return {
        id,
        type,
        src: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1400&q=80",
        caption: "团队探访乡村振兴示范点",
        width: 100,
        align: "center",
      };
    case "file":
      if (meta?.fileType === "pdf") {
        return {
          id,
          type,
          name: "SSV-2026Q2-可持续社会价值进展报告.pdf",
          size: 4.6 * 1024 * 1024,
          fileType: "pdf",
          pdfPreview: true,
        };
      }
      if (meta?.fileType === "doc") {
        return {
          id,
          type,
          name: "SSV-碳中和实验室-合作备忘录.docx",
          size: 1.2 * 1024 * 1024,
          fileType: "doc",
        };
      }
      if (meta?.fileType === "xls") {
        return {
          id,
          type,
          name: "SSV-2026Q2-碳排数据明细.xlsx",
          size: 0.8 * 1024 * 1024,
          fileType: "xls",
        };
      }
      return {
        id,
        type,
        name: "SSV-碳中和实验室-季度简报.pptx",
        size: 2.3 * 1024 * 1024,
        fileType: "ppt",
      };
    case "link": {
      const url = meta?.linkUrl?.trim();
      if (url) {
        // 用户输入的链接：基于 URL 派生 host / 标题占位
        let host = url;
        try {
          host = new URL(/^https?:\/\//.test(url) ? url : `https://${url}`).host;
        } catch {
          host = url.replace(/^https?:\/\//, "").split("/")[0];
        }
        return {
          id,
          type,
          title: host,
          url: /^https?:\/\//.test(url) ? url : `https://${url}`,
          desc: "",
          display: meta?.linkDisplay ?? "plain",
          siteName: host,
          faviconText: host.slice(0, 1).toUpperCase(),
        };
      }
      return {
        id,
        type,
        title: "SSV 可持续社会价值研究院",
        url: "https://ssv.tencent.com/research",
        desc: "Tencent for Good · 可持续社会价值的研究与实践",
        display: meta?.linkDisplay ?? "plain",
        siteName: "Tencent SSV",
        faviconText: "S",
        cover:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80",
      };
    }
    case "todo":
      return {
        id,
        type,
        items: [
          { id: uid(), text: "下一步行动项", done: false },
          { id: uid(), text: "完善流程文档", done: true },
          { id: uid(), text: "组织分享会", done: false },
        ],
      };
    case "table": {
      const rows = Math.max(1, meta?.rows ?? 3);
      const cols = Math.max(1, meta?.cols ?? 3);
      // 若使用默认 3x3，给一份示例数据；否则空表
      if (!meta?.rows && !meta?.cols) {
        return {
          id,
          type,
          rows: [
            ["项目", "负责人", "状态"],
            ["知识库重构", "张三", "进行中"],
            ["AI 总结上线", "李四", "已完成"],
          ],
        };
      }
      const grid: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ""),
      );
      return { id, type, rows: grid };
    }
    case "code":
      return {
        id,
        type,
        language: "typescript",
        code: `// 示例：调用 Nexus AI Summary\nconst summary = await nexus.ai.summarize(doc);\nconsole.log(summary);`,
      };
    case "pptPreview":
      return {
        id,
        type,
        name: "SSV-银发科技-2026Q2 进展汇报.pptx",
        totalSlides: 22,
        currentSlide: 1,
        title: "腾讯 SSV 银发科技实验室",
        subtitle: "用科技守护长者的尊严与温度",
        date: "May 2026",
        mainSlide:
          "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1400&q=80",
        thumbnails: [
          "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&q=70",
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=200&q=70",
          "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=200&q=70",
        ],
      };
    case "htmlPreview":
      return {
        id,
        type,
        url: "https://ssv.tencent.com/news/rural-revitalization-2026",
        siteName: "Tencent SSV · 为村耕耘者",
        pageTitle: "「为村耕耘者」计划：让乡村振兴跑出数字加速度",
        description:
          "腾讯 SSV 携手 200+ 县域，沉淀数字工具箱、培养数字乡村人才。",
        cover:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80",
        faviconText: "S",
        mode: meta?.mode ?? "plain",
      };
  }
}

export const initialBlocks = (): Block[] => buildEventBlocks(0);

/**
 * 按 Event 索引返回不同样式的初始 Block 列表，用于 demo 展示 SSV 主题相关的多类内容形态。
 * - 0：图文 + 缩略 HTML 预览（CarbonX 碳中和实验室）
 * - 1：单独 PPT 预览（银发科技实验室）
 * - 2：整体内嵌 HTML（为村耕耘者 · 乡村振兴）
 * - 其它：文字 + 列表 + 引用（科技公益 · 西部少年 AI 教育）
 */
export function buildEventBlocks(index: number): Block[] {
  switch (index) {
    case 0:
      return [
        {
          id: uid(),
          type: "text",
          text: "腾讯 SSV CarbonX 碳中和实验室围绕「净零碳排放」目标，把数字技术沉淀为可复用的碳工具箱，目前已在能源、制造、交通三大行业完成首批落地。",
        },
        {
          id: uid(),
          type: "bulletList",
          items: [
            "碳排放盘查 SaaS：覆盖 Scope 1/2/3，企业半天即可完成基线核算",
            "AI 节能调度：在试点工厂实现单位产值能耗下降 11.6%",
            "联合 30+ 行业伙伴沉淀「行业级碳因子库」，对外免费开放",
          ],
        },
        {
          id: uid(),
          type: "image",
          src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1400&q=80",
          caption: "CarbonX 实验室与合作伙伴在风电场进行碳排监测验证",
          width: 100,
          align: "center",
        },
        // 缩略 HTML 卡片：CarbonX 官方页
        {
          id: uid(),
          type: "htmlPreview",
          url: "https://ssv.tencent.com/carbonx",
          siteName: "Tencent SSV · CarbonX",
          pageTitle: "CarbonX 碳中和实验室：让每一度电都算得清",
          description:
            "把碳盘查、碳路径、碳资产管理沉淀为开放工具，助力中国 30·60 目标。",
          cover:
            "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1400&q=80",
          faviconText: "C",
          mode: "card",
        },
      ];
    case 1:
      return [
        {
          id: uid(),
          type: "text",
          text: "银发科技实验室聚焦适老化产品与认知健康。本节附上实验室最新对外分享的演示材料，涵盖产品矩阵与试点城市进展。",
        },
        createBlock("pptPreview"),
        {
          id: uid(),
          type: "bulletList",
          items: [
            "「银发守护」适老化交互组件已开源，下载量破 1.2 万",
            "在深圳、上海完成 5 个社区的认知健康筛查试点",
            "联合医院发布《老年认知障碍数字干预白皮书》",
          ],
        },
      ];
    case 2:
      return [
        {
          id: uid(),
          type: "text",
          text: "「为村耕耘者」计划进入第二阶段，下面以全量内嵌网页形式呈现官方进展通报。",
        },
        // 整体内嵌 HTML
        {
          id: uid(),
          type: "htmlPreview",
          url: "https://ssv.tencent.com/news/rural-revitalization-2026",
          siteName: "Tencent SSV · 为村耕耘者",
          pageTitle: "「为村耕耘者」计划：让乡村振兴跑出数字加速度",
          description:
            "腾讯 SSV 携手 200+ 县域，沉淀数字工具箱、培养数字乡村人才。",
          cover:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80",
          faviconText: "S",
          mode: "full",
        },
      ];
    case 3:
    default:
      return [
        {
          id: uid(),
          type: "text",
          text: "「西部少年 AI 课堂」是 SSV 科技公益的旗舰项目，把腾讯研发能力与教育公益结合，让西部学生接触到一线 AI 课程。",
        },
        {
          id: uid(),
          type: "bulletList",
          items: [
            "首批覆盖 4 省 12 县，共开设 86 个 AI 兴趣班",
            "由腾讯工程师 + 高校志愿者 + 当地教师共同备课，确保可持续",
            "建立学生作品平台，年度优秀作品已超 1,800 份",
          ],
        },
        {
          id: uid(),
          type: "quote",
          text: "公益不是一次性项目，而是一种长期投入的工程化能力 —— 我们更愿意做难而正确的事。",
        },
        {
          id: uid(),
          type: "text",
          text: "下一阶段，我们将把课程标准化、教师培训体系化，让 AI 教育能真正在西部落地、生根。",
        },
      ];
  }
}
