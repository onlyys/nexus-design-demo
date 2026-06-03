import { genAvatar } from "@/lib/utils";
import type { SkillItem, SkillAuthor } from "./types";

const A = (handle: string, name: string): SkillAuthor => ({
  id: handle,
  handle,
  name,
  avatar: genAvatar(name),
});

const TEVENXU = A("tevenxu", "徐天然");
const MAIXIAO = A("maixiao", "马晓");
const WINDEALLI = A("windealli", "丁祎");
const IRISWEN = A("iriswen", "温心彤");
const ALANCHEN = A("alanchen", "陈靖");
const LILYLIN = A("lilylin", "林莉");
const SURIWANG = A("suriwang", "王苏睿");
const RAYRAO = A("rayrao", "饶睿");

/** 12 个 mock skills 覆盖 5 个部门、9 种能力类型 */
export const MOCK_SKILLS: SkillItem[] = [
  // —— 设计中心（6 个）——
  {
    id: "ssv-pongyi-design",
    name: "腾讯公益设计 Skill",
    tagline:
      "覆盖公益业务线的页面模板、组件规范、交互流程，快速生成符合公益设计语言的页面原型。",
    description:
      "腾讯公益设计 Skill 独立版。它在 IDE / Cursor / Codebuddy 中提供「公益设计语言」的完整上下文，包括页面模板、组件规范、交互流程与配色 Token，帮助你把任何素材一句话直出符合公益视觉语言的页面原型。",
    dept: "design",
    types: ["prototype", "image-gen"],
    scenarios: ["公益", "通用"],
    authors: [TEVENXU, MAIXIAO],
    version: "v1.2.0",
    publishedAt: "2026-04-22",
    updatedAt: "2026-06-02",
    installs: 1240,
    reuses: 23,
    capabilities: [
      {
        id: "c1",
        title: "布局修改：调整页面功能布局",
        subtitle: "在首页推荐模块中，把内容变成双列",
        gradient: ["#DBEAFE", "#E9D5FF"],
        icon: "layout",
      },
      {
        id: "c2",
        title: "功能插入：页面中插入功能模块",
        subtitle: "在我的页面中生成好友排行榜的模块",
        gradient: ["#FCE7F3", "#FED7AA"],
        icon: "puzzle",
      },
      {
        id: "c3",
        title: "一键封面：根据信息流生成封面图",
        subtitle: "把这条乡村故事，生成 9:16 的封面图",
        gradient: ["#DCFCE7", "#BAE6FD"],
        icon: "image",
      },
      {
        id: "c4",
        title: "走查模式：自动识别设计规范偏离",
        subtitle: "扫描这个落地页有哪些不符合公益规范",
        gradient: ["#FEF3C7", "#FECACA"],
        icon: "wand",
      },
    ],
    install: [
      {
        kind: "download",
        label: "下载安装包",
        hint: "v1.2.0 · 4.8MB",
      },
      {
        kind: "command",
        label: "一键复制安装",
        hint: "在 Codebuddy 终端粘贴执行",
        payload: "npx ssv-skill add ssv-pongyi-design@latest",
      },
    ],
    quickStart: [
      "下载或复制命令安装到本地 Codebuddy / Cursor",
      "在编辑器中输入 / 召唤 skill：ssv-pongyi-design",
      "用自然语言描述需求，AI 会按公益设计语言直出原型",
    ],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v1.0.0",
        title: "首发：覆盖 8 套公益页面模板",
        publishedAt: "2026-04-22",
        authorHandle: "tevenxu",
        changes: ["接入腾讯公益主品牌色板", "8 套页面模板", "12 个核心组件规范"],
        reactions: { like: 18, doubt: 0 },
      },
      {
        id: "u2",
        index: 2,
        version: "v1.1.0",
        title: "新增「一键封面图」能力",
        publishedAt: "2026-05-12",
        authorHandle: "maixiao",
        changes: [
          "支持从信息流摘要生成 9:16/1:1/16:9 三种封面",
          "封面图自动套用公益辅助色",
        ],
        reactions: { like: 32, doubt: 1 },
      },
      {
        id: "u3",
        index: 3,
        version: "v1.2.0",
        title: "走查模式：自动检测设计规范偏离",
        publishedAt: "2026-06-02",
        authorHandle: "tevenxu",
        changes: [
          "扫描落地页，输出不符合规范的要点",
          "三档严重度：建议 / 警告 / 阻断",
          "支持导出走查报告 Markdown",
        ],
        reactions: { like: 24, doubt: 2 },
      },
    ],
    backlinks: [
      {
        topicId: "demo",
        topicTitle: "SSV 2026 Q2 进展简报",
        eventTitle: "为村耕耘者 · 乡村振兴专项",
        authorHandle: "weima",
        usedAt: "2026-05-14",
        excerpt:
          "封面图直出：用「一键封面」生成 4 张 9:16，对照走查报告改了 2 处，节约 3.5h。",
      },
      {
        topicId: "demo",
        topicTitle: "西部少年 AI 课堂周报 #18",
        authorHandle: "lily",
        usedAt: "2026-05-22",
        excerpt:
          "调用「布局修改」能力，把课堂介绍页一句话改成了双列卡片，省去与设计排期沟通。",
      },
    ],
  },
  {
    id: "design-asset-kb",
    name: "设计素材知识库",
    tagline: "存放设计类 skill、生图卡片、设计组件库的统一索引。",
    description:
      "面向 SSV 全部设计类素材的统一检索与召唤入口：插画 / 图标 / 组件 / 模板 / 案例库 一站式接入，支持自然语言搜索与版本管理。",
    dept: "design",
    types: ["knowledge"],
    scenarios: ["通用"],
    authors: [TEVENXU],
    version: "v0.9.4",
    publishedAt: "2026-03-08",
    updatedAt: "2026-06-02",
    installs: 920,
    reuses: 17,
    capabilities: [
      {
        id: "c1",
        title: "自然语言检索素材",
        subtitle: "找一张「乡村黄昏 + 老人小孩」的公益插画",
        gradient: ["#E0E7FF", "#FBCFE8"],
        icon: "search",
      },
      {
        id: "c2",
        title: "组件按规范召唤",
        subtitle: "给我一个公益捐赠卡片组件",
        gradient: ["#CCFBF1", "#DBEAFE"],
        icon: "puzzle",
      },
    ],
    install: [
      { kind: "download", label: "下载安装包", hint: "v0.9.4 · 2.1MB" },
      {
        kind: "command",
        label: "一键复制安装",
        payload: "npx ssv-skill add design-asset-kb@latest",
      },
    ],
    quickStart: [
      "安装后在编辑器输入 /design-asset-kb",
      "可用自然语言描述要找的素材",
      "返回的素材直接拖入文档或落地页",
    ],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.9.0",
        title: "首发素材索引",
        publishedAt: "2026-03-08",
        authorHandle: "tevenxu",
        changes: ["接入 380 张公益插画", "接入 64 个 Figma 组件"],
        reactions: { like: 15, doubt: 0 },
      },
      {
        id: "u2",
        index: 2,
        version: "v0.9.4",
        title: "新增组件版本管理",
        publishedAt: "2026-06-02",
        authorHandle: "tevenxu",
        changes: ["按版本号召唤指定组件", "组件被复用次数统计"],
        reactions: { like: 9, doubt: 0 },
      },
    ],
    backlinks: [],
  },
  {
    id: "qiedu-prototype",
    name: "企鹅读伴原型设计 Skill",
    tagline:
      "面向青少年 AI 听读学伴小程序，深度理解产品业务逻辑与青少年教育产品设计特点。",
    description:
      "企鹅读伴是一款面向青少年的 AI 听读学伴小程序。本 skill 深度理解产品业务逻辑与青少年教育产品的设计特点，覆盖首页、书架、听书页、小程 AI 对话等关键模板，帮助 PM/设计/前端快速对齐产品语言。",
    dept: "design",
    types: ["prototype"],
    scenarios: ["教育"],
    authors: [TEVENXU],
    version: "v0.6.0",
    publishedAt: "2026-05-10",
    updatedAt: "2026-06-02",
    installs: 380,
    reuses: 6,
    capabilities: [
      {
        id: "c1",
        title: "首页模板生成",
        subtitle: "给我一个企鹅读伴的首页改版",
        gradient: ["#FEE2E2", "#FED7AA"],
        icon: "layout",
      },
      {
        id: "c2",
        title: "AI 对话页生成",
        subtitle: "做一个 AI 朗读对话面板",
        gradient: ["#E0F2FE", "#E9D5FF"],
        icon: "wand",
      },
    ],
    install: [{ kind: "download", label: "下载安装包", hint: "v0.6.0 · 3.2MB" }],
    quickStart: ["安装后在编辑器召唤 qiedu-prototype", "支持微信小程序原型快速产出"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.6.0",
        title: "首发四套核心页",
        publishedAt: "2026-05-10",
        authorHandle: "tevenxu",
        changes: ["首页 / 书架 / 听书 / 对话页"],
        reactions: { like: 11, doubt: 0 },
      },
    ],
    backlinks: [],
  },
  {
    id: "shiguang-prototype",
    name: "时光运动圈原型 Skill",
    tagline: "时光运动圈适老化产品的页面模板与交互模式。",
    description:
      "覆盖时光运动圈「运动 + 健康 + 社交」主线的适老化页面模板，包含大字体、强对比、低门槛的交互模式。",
    dept: "design",
    types: ["prototype"],
    scenarios: ["适老"],
    authors: [TEVENXU],
    version: "v0.4.1",
    publishedAt: "2026-04-30",
    updatedAt: "2026-06-02",
    installs: 230,
    reuses: 4,
    capabilities: [
      {
        id: "c1",
        title: "适老化首页模板",
        subtitle: "给我一个老年人友好的运动首页",
        gradient: ["#FEF3C7", "#FECACA"],
        icon: "layout",
      },
    ],
    install: [{ kind: "download", label: "下载安装包", hint: "v0.4.1 · 2.6MB" }],
    quickStart: ["安装后召唤 shiguang-prototype"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.4.1",
        title: "首发三套适老化页",
        publishedAt: "2026-04-30",
        authorHandle: "tevenxu",
        changes: ["首页 / 排行榜 / 详情页"],
        reactions: { like: 7, doubt: 0 },
      },
    ],
    backlinks: [],
  },
  {
    id: "ssv-aibuilder-design",
    name: "ssv-aibuilder-design",
    tagline:
      "公益设计原型一键生成。基础框架、公益业务场景组件等，沉淀为一套开箱即用的原型生成能力。",
    description:
      "适用场景：依据现有腾讯公益设计语言生成产品原型。包含组件库、模板库、Prompt 工程，一键产出符合公益场景的高保真原型。",
    dept: "design",
    types: ["prototype", "ai-tool"],
    scenarios: ["公益"],
    authors: [MAIXIAO],
    version: "v1.0.3",
    publishedAt: "2026-04-22",
    updatedAt: "2026-06-01",
    installs: 1080,
    reuses: 19,
    capabilities: [
      {
        id: "c1",
        title: "一键原型",
        subtitle: "生成完整的捐赠落地页",
        gradient: ["#DBEAFE", "#E9D5FF"],
        icon: "wand",
      },
      {
        id: "c2",
        title: "组件混搭",
        subtitle: "把这两个组件组合成一个推荐位",
        gradient: ["#CCFBF1", "#FBCFE8"],
        icon: "puzzle",
      },
    ],
    install: [
      { kind: "download", label: "下载安装包", hint: "v1.0.3 · 5.1MB" },
      {
        kind: "command",
        label: "一键复制安装",
        payload: "npx ssv-skill add ssv-aibuilder-design@latest",
      },
    ],
    quickStart: ["安装", "召唤 ssv-aibuilder-design", "用自然语言描述目标页面"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v1.0.0",
        title: "首发",
        publishedAt: "2026-04-22",
        authorHandle: "maixiao",
        changes: ["原型一键生成", "20 个核心组件"],
        reactions: { like: 22, doubt: 1 },
      },
      {
        id: "u2",
        index: 2,
        version: "v1.0.3",
        title: "组件混搭",
        publishedAt: "2026-06-01",
        authorHandle: "maixiao",
        changes: ["允许组件混合 prompt"],
        reactions: { like: 8, doubt: 0 },
      },
    ],
    backlinks: [],
  },
  {
    id: "design-review",
    name: "Design-review-skill",
    tagline: "设计走查工具，提供设计审查能力，告诉你产品设计怎么样、如何优化。",
    description:
      "这是一个设计走查工具，只需要动手指截图，即可给你提供设计审查能力。截图即用，三种模式自动识别：详情走查 / 整体走查 / 流程走查。",
    dept: "design",
    types: ["review"],
    scenarios: ["通用"],
    authors: [TEVENXU],
    version: "v1.4.0",
    publishedAt: "2026-05-18",
    updatedAt: "2026-06-02",
    installs: 1530,
    reuses: 28,
    capabilities: [
      {
        id: "c1",
        title: "整体走查",
        subtitle: "扫描这个落地页的整体设计问题",
        gradient: ["#E0E7FF", "#DBEAFE"],
        icon: "compass",
      },
      {
        id: "c2",
        title: "细节走查",
        subtitle: "看看这个按钮的间距与字号",
        gradient: ["#FEF3C7", "#FBCFE8"],
        icon: "search",
      },
    ],
    install: [
      { kind: "download", label: "下载安装包", hint: "v1.4.0 · 3.6MB" },
      {
        kind: "command",
        label: "一键复制安装",
        payload: "npx ssv-skill add design-review@latest",
      },
    ],
    quickStart: ["安装后", "截图任意设计稿", "skill 自动识别走查模式"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v1.0.0",
        title: "首发",
        publishedAt: "2026-05-18",
        authorHandle: "tevenxu",
        changes: ["三种走查模式"],
        reactions: { like: 35, doubt: 1 },
      },
      {
        id: "u2",
        index: 2,
        version: "v1.4.0",
        title: "双模识别 + 严重度分级",
        publishedAt: "2026-06-02",
        authorHandle: "tevenxu",
        changes: [
          "自动识别走查模式",
          "三档严重度：建议 / 警告 / 阻断",
          "导出报告 Markdown",
        ],
        reactions: { like: 27, doubt: 2 },
      },
    ],
    backlinks: [],
  },

  // —— 技术架构部（2 个）——
  {
    id: "ssv-aibuilder-deploy",
    name: "ssv-aibuilder-deploy",
    tagline:
      "一键部署上线。搞定网站部署、域名申请和 iOA 权限，把手里的页面快速发布到内网。",
    description:
      "适用场景：demo、活动页、内部工具想快速发出去验证，不再走服务台。一条命令搞定部署 + 域名 + iOA 接入。",
    dept: "tech",
    types: ["deploy"],
    scenarios: ["通用"],
    authors: [WINDEALLI],
    version: "v0.7.2",
    publishedAt: "2026-04-21",
    updatedAt: "2026-05-30",
    installs: 2140,
    reuses: 41,
    capabilities: [
      {
        id: "c1",
        title: "一键部署",
        subtitle: "把当前项目部署到内网",
        gradient: ["#FEF3C7", "#FECACA"],
        icon: "wand",
      },
      {
        id: "c2",
        title: "域名申请",
        subtitle: "给我申请一个 ssv.tencent.com 子域",
        gradient: ["#FED7AA", "#FBCFE8"],
        icon: "compass",
      },
    ],
    install: [
      {
        kind: "command",
        label: "一键复制安装",
        hint: "推荐",
        payload: "npx ssv-skill add ssv-aibuilder-deploy@latest",
      },
      { kind: "download", label: "下载安装包", hint: "v0.7.2 · 6.8MB" },
    ],
    quickStart: [
      "安装",
      "在项目根目录执行 ssv-deploy",
      "等待 30s ~ 60s 部署完成，链接自动复制到剪贴板",
    ],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.5.0",
        title: "首发",
        publishedAt: "2026-04-21",
        authorHandle: "windealli",
        changes: ["一键部署到内网", "iOA 自动配置"],
        reactions: { like: 48, doubt: 0 },
      },
      {
        id: "u2",
        index: 2,
        version: "v0.7.2",
        title: "新增域名申请",
        publishedAt: "2026-05-30",
        authorHandle: "windealli",
        changes: ["子域申请", "HTTPS 证书自动签发"],
        reactions: { like: 33, doubt: 1 },
      },
    ],
    backlinks: [
      {
        topicId: "demo",
        topicTitle: "西部少年 AI 课堂 · 落地页 v3",
        authorHandle: "rayrao",
        usedAt: "2026-05-25",
        excerpt:
          "用 ssv-aibuilder-deploy 一条命令把活动页部署上线，节省了 1 个工作日的服务台流程。",
      },
    ],
  },
  {
    id: "yepyou-ui",
    name: "野朋友 UI 设计",
    tagline:
      "一句话生成野朋友 App 详情页，输出符合 iOS 375×812 + 蓝绿渐变规范的 HTML 原型。",
    description:
      "野朋友是 SSV AI Coding 样板间项目。本 skill 沉淀了野朋友 App 的全部 UI 规范、组件、图标、配色，可直接预览的 HTML 原型。",
    dept: "tech",
    types: ["prototype", "image-gen"],
    scenarios: ["通用"],
    authors: [RAYRAO, SURIWANG],
    version: "v0.3.0",
    publishedAt: "2026-04-15",
    updatedAt: "2026-05-28",
    installs: 540,
    reuses: 11,
    capabilities: [
      {
        id: "c1",
        title: "详情页生成",
        subtitle: "给我一个野朋友的物种详情页",
        gradient: ["#A7F3D0", "#BAE6FD"],
        icon: "layout",
      },
    ],
    install: [{ kind: "download", label: "下载安装包", hint: "v0.3.0 · 4.0MB" }],
    quickStart: ["安装后召唤 yepyou-ui"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.3.0",
        title: "首发",
        publishedAt: "2026-04-15",
        authorHandle: "rayrao",
        changes: ["首页 / 详情页 / 个人中心"],
        reactions: { like: 14, doubt: 0 },
      },
    ],
    backlinks: [],
  },

  // —— 法务部（2 个）——
  {
    id: "legal-compliance-scan",
    name: "公益项目合规扫描",
    tagline: "一键扫描落地页与文案的合规风险，输出风险点与改写建议。",
    description:
      "把法务团队多年沉淀的合规检查清单（隐私、广告、个保、慈善法）全部 skill 化。任何 Topic 发布前，AI 会自动调用此 skill 扫描风险点。",
    dept: "legal",
    types: ["compliance", "ai-tool"],
    scenarios: ["公益", "通用"],
    authors: [A("zhouyl", "周毓兰"), A("hugo", "胡岳")],
    version: "v1.1.0",
    publishedAt: "2026-04-10",
    updatedAt: "2026-05-26",
    installs: 680,
    reuses: 14,
    capabilities: [
      {
        id: "c1",
        title: "落地页合规扫描",
        subtitle: "扫描这个捐赠页有什么合规风险",
        gradient: ["#EDE9FE", "#FBCFE8"],
        icon: "search",
      },
      {
        id: "c2",
        title: "文案改写建议",
        subtitle: "把这段宣传语改得不诱导消费",
        gradient: ["#E0E7FF", "#FCE7F3"],
        icon: "wand",
      },
    ],
    install: [
      {
        kind: "command",
        label: "一键复制安装",
        payload: "npx ssv-skill add legal-compliance-scan@latest",
      },
    ],
    quickStart: ["安装", "在落地页 / Topic 上点击「合规扫描」", "查看风险点列表与改写建议"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v1.0.0",
        title: "首发",
        publishedAt: "2026-04-10",
        authorHandle: "zhouyl",
        changes: ["接入 6 部基础法律法规", "10 类典型风险点识别"],
        reactions: { like: 19, doubt: 0 },
      },
      {
        id: "u2",
        index: 2,
        version: "v1.1.0",
        title: "新增改写建议",
        publishedAt: "2026-05-26",
        authorHandle: "hugo",
        changes: ["输出 3 条改写建议", "保留原意不掺水"],
        reactions: { like: 12, doubt: 1 },
      },
    ],
    backlinks: [],
  },
  {
    id: "legal-contract-summary",
    name: "合同摘要 Skill",
    tagline: "上传合同 PDF，5 秒拿到要点摘要、风险点与可改条款。",
    description:
      "针对捐赠协议、合作协议、IP 授权等公益场景的常见合同，输出要点摘要 + 风险点 + 可改条款建议。",
    dept: "legal",
    types: ["doc", "ai-tool"],
    scenarios: ["通用"],
    authors: [A("hugo", "胡岳")],
    version: "v0.5.0",
    publishedAt: "2026-05-08",
    updatedAt: "2026-05-27",
    installs: 320,
    reuses: 5,
    capabilities: [
      {
        id: "c1",
        title: "合同摘要",
        subtitle: "把这份捐赠协议总结成 5 条要点",
        gradient: ["#EDE9FE", "#DBEAFE"],
        icon: "wand",
      },
    ],
    install: [
      {
        kind: "command",
        label: "一键复制安装",
        payload: "npx ssv-skill add legal-contract-summary@latest",
      },
    ],
    quickStart: ["安装", "上传 PDF", "查看要点 / 风险 / 改写"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.5.0",
        title: "首发",
        publishedAt: "2026-05-08",
        authorHandle: "hugo",
        changes: ["三段式输出"],
        reactions: { like: 8, doubt: 0 },
      },
    ],
    backlinks: [],
  },

  // —— 财务部（1 个）——
  {
    id: "finance-budget-review",
    name: "公益项目预算评审",
    tagline: "预算自动检查：人力 / 物料 / 行政三类比例是否合理，给出对比基线。",
    description:
      "上传 Excel 预算表或贴入文本，自动按公益项目分类规则识别人力、物料、行政三大类比例，对比 SSV 历史项目的健康基线，并给出预警与建议。",
    dept: "finance",
    types: ["compliance", "ai-tool"],
    scenarios: ["通用"],
    authors: [A("flin", "林峰")],
    version: "v0.8.0",
    publishedAt: "2026-04-28",
    updatedAt: "2026-05-29",
    installs: 410,
    reuses: 9,
    capabilities: [
      {
        id: "c1",
        title: "预算分类与比例分析",
        subtitle: "把这份预算分类，看看是否合理",
        gradient: ["#D1FAE5", "#BAE6FD"],
        icon: "search",
      },
      {
        id: "c2",
        title: "对比基线给出预警",
        subtitle: "和近 30 个公益项目的预算结构对比",
        gradient: ["#A7F3D0", "#FBCFE8"],
        icon: "compass",
      },
    ],
    install: [
      {
        kind: "command",
        label: "一键复制安装",
        payload: "npx ssv-skill add finance-budget-review@latest",
      },
    ],
    quickStart: ["安装", "上传 Excel 或贴入文本", "查看分类比例与预警"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.8.0",
        title: "首发",
        publishedAt: "2026-04-28",
        authorHandle: "flin",
        changes: ["三类比例分析", "5 条预警规则"],
        reactions: { like: 13, doubt: 0 },
      },
    ],
    backlinks: [],
  },

  // —— 战略与研究中心（1 个）——
  {
    id: "user-interview-analysis",
    name: "用户访谈分析工具",
    tagline:
      "用户访谈结构化分析 skill，把访谈记录转成「可决策、可落地、有判断」的洞察。",
    description:
      "用户访谈结构化分析 skill，输入访谈记录（每位受访者一份），一句话直出基础人物画像 + 核心痛点 + 行为模式 + 共识与分歧矩阵。",
    dept: "research",
    types: ["research", "ai-tool"],
    scenarios: ["通用"],
    authors: [TEVENXU, ALANCHEN, LILYLIN, IRISWEN],
    version: "v0.9.0",
    publishedAt: "2026-05-20",
    updatedAt: "2026-05-31",
    installs: 460,
    reuses: 8,
    capabilities: [
      {
        id: "c1",
        title: "单人访谈画像",
        subtitle: "把这位老人的访谈转成画像",
        gradient: ["#FEE2E2", "#FED7AA"],
        icon: "search",
      },
      {
        id: "c2",
        title: "群体共识矩阵",
        subtitle: "把这 8 份访谈的共识与分歧画出来",
        gradient: ["#FECACA", "#FBCFE8"],
        icon: "compass",
      },
    ],
    install: [
      {
        kind: "command",
        label: "一键复制安装",
        payload: "npx ssv-skill add user-interview-analysis@latest",
      },
    ],
    quickStart: ["安装", "粘贴访谈记录", "选择画像 / 共识矩阵 模式"],
    updates: [
      {
        id: "u1",
        index: 1,
        version: "v0.9.0",
        title: "首发",
        publishedAt: "2026-05-20",
        authorHandle: "lilylin",
        changes: ["单人画像", "群体共识矩阵"],
        reactions: { like: 17, doubt: 0 },
      },
    ],
    backlinks: [],
  },
];

export function getSkillById(id: string) {
  return MOCK_SKILLS.find((s) => s.id === id);
}
