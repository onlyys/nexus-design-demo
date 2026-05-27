export const MOCK_USERS = [
  {
    id: "u1",
    name: "王志恒",
    title: "产品经理",
    avatar: "https://i.pravatar.cc/80?img=12",
    /** 默认所属（主岗）部门 id —— 与 USER_DEPARTMENTS 对齐 */
    deptId: "ssv-tech",
  },
  {
    id: "u2",
    name: "马巍",
    title: "前端工程师",
    avatar: "https://i.pravatar.cc/80?img=15",
    deptId: "ssv-tech",
  },
  {
    id: "u3",
    name: "王芳",
    title: "AI 研究员",
    avatar: "https://i.pravatar.cc/80?img=47",
    deptId: "ssv-research",
  },
  {
    id: "u4",
    name: "刘洋",
    title: "设计师",
    avatar: "https://i.pravatar.cc/80?img=33",
    deptId: "ssv-design",
  },
  {
    id: "u5",
    name: "陈敏",
    title: "数据分析",
    avatar: "https://i.pravatar.cc/80?img=49",
    deptId: "ssv-research",
  },
  {
    id: "u6",
    name: "周宇",
    title: "技术专家",
    avatar: "https://i.pravatar.cc/80?img=68",
    deptId: "ssv-tech",
  },
];

export const RECOMMENDED_TAGS = [
  "关联关键策略",
  "月会",
  "战略",
  "合规",
  "经营",
  "技术",
  "全员行动",
  "项目",
  "其他",
];

/** 触发"关联关键策略选择面板"的标签名（与 RECOMMENDED_TAGS[0] 保持一致） */
export const KEY_STRATEGY_TAG = "关联关键策略";

/** 标签自带的 emoji 图标（保留为空对象 —— 当前设计不使用 emoji） */
export const TAG_ICONS: Record<string, string> = {};

// —— 关联关键策略数据 ——
export interface KeyStrategy {
  id: string;
  /** 关键策略序号，用于标签上的 "关键策略N" */
  index: number;
  title: string;
  /** 负责人 @handle */
  owner: string;
}

export interface DepartmentGoal {
  id: string;
  /** 目标序号（部门内自增） */
  index: number;
  title: string;
  /** 目标责任人 @handle */
  owner: string;
  strategies: KeyStrategy[];
}

export interface Department {
  id: string;
  /** 主显示名（短名） */
  name: string;
  /** 完整组织路径（用于下拉显示） */
  path: string;
  /** 是否主岗 */
  isPrimary?: boolean;
  goals: DepartmentGoal[];
}

/**
 * 当前用户可选部门列表 mock。
 * 注：实际接入时来自用户档案接口（含多岗位 / 主岗标识）。
 */
export const USER_DEPARTMENTS: Department[] = [
  {
    id: "ssv-tech",
    name: "技术公益创新发展中心",
    path: "CDG企业发展事业群 / 可持续社会价值事业部 / 技术架构部 / 技术公益创新发展中心",
    isPrimary: true,
    goals: [
      {
        id: "g1",
        index: 1,
        title: "构筑 SSV 通用技术与设计底座",
        owner: "brantli",
        strategies: [
          {
            id: "ks1",
            index: 1,
            title: "技术侧完成 AI 基建治理与经验 skill 输出复用",
            owner: "windlin",
          },
          {
            id: "ks2",
            index: 2,
            title: "输出 SSV 内部通用设计方案",
            owner: "tevenxu",
          },
        ],
      },
      {
        id: "g2",
        index: 2,
        title: "交付 SSV 自有 AI 原生产品 · AI Coding 样板",
        owner: "brantli",
        strategies: [
          {
            id: "ks3",
            index: 3,
            title: "Nexus 产品打磨与 AI 能力优化交付",
            owner: "suriwang",
          },
          {
            id: "ks4",
            index: 4,
            title: "野朋友项目持续探索，打造 AI Coding 样板间",
            owner: "rayrao",
          },
        ],
      },
    ],
  },
  {
    id: "ssv-design",
    name: "可持续社会价值事业部 / 设计中心",
    path: "CDG企业发展事业群 / 可持续社会价值事业部 / 设计中心",
    goals: [
      {
        id: "dg1",
        index: 1,
        title: "建立 SSV 统一品牌与公益视觉语言",
        owner: "tevenxu",
        strategies: [
          {
            id: "dks1",
            index: 1,
            title: "完成 SSV Design Token 体系搭建",
            owner: "tevenxu",
          },
          {
            id: "dks2",
            index: 2,
            title: "公益场景插画与图标库沉淀",
            owner: "iriswen",
          },
        ],
      },
    ],
  },
  {
    id: "ssv-research",
    name: "可持续社会价值事业部 / 研究中心",
    path: "CDG企业发展事业群 / 可持续社会价值事业部 / 战略与研究中心",
    goals: [
      {
        id: "rg1",
        index: 1,
        title: "完成年度 SSV 议题研究与对外发布",
        owner: "alanchen",
        strategies: [
          {
            id: "rks1",
            index: 1,
            title: "完成 4 篇旗舰研究报告并联合发布",
            owner: "alanchen",
          },
          {
            id: "rks2",
            index: 2,
            title: "搭建 SSV 议题数据看板与对外沟通机制",
            owner: "lilylin",
          },
        ],
      },
    ],
  },
];

export const AI_SUMMARIES = [
  `本期 SSV 简报围绕 2026 年 Q2 的四大方向展开，主要进展如下：

1. CarbonX 碳中和实验室在能源、制造、交通行业完成首批落地，单位产值能耗下降 11.6%；
2. 银发科技实验室推出适老化交互组件，已在深圳、上海完成 5 个社区认知健康筛查试点；
3. 「为村耕耘者」计划覆盖 200+ 县域，沉淀数字工具箱并培养数字乡村人才；
4. 西部少年 AI 课堂首批进入 4 省 12 县，开设 86 个 AI 兴趣班，沉淀 1,800+ 学生作品。`,

  `本月 SSV 业务横截面回顾：

1. 碳中和：「行业级碳因子库」对外开放，已接入 30+ 行业伙伴；
2. 银发科技：开源「银发守护」组件下载量破 1.2 万，发布老年认知障碍数字干预白皮书；
3. 乡村振兴：为村应用月活突破 800 万，新增数字乡村人才培养 1.5 万人；
4. 科技公益：与西部教育主管部门签署 3 年战略合作，课程标准化进入二阶段。`,

  `SSV 内部协同与组织能力建设要点：

1. 建立跨实验室例会机制，碳中和 / 银发 / 乡村 / 教育四大方向月度互通；
2. 统一对外品牌：Tencent for Good · 可持续社会价值；
3. 推出「SSV 共建者」开放招募，欢迎工程师、设计师、研究者联合共建。`,
];

export type FileItem = {
  id: string;
  name: string;
  size: number;
  type: "pdf" | "ppt" | "doc" | "xls" | "image" | "other";
};

export const INITIAL_ATTACHMENTS: FileItem[] = [
  { id: "f1", name: "补充资料.pdf", size: 1.2 * 1024 * 1024, type: "pdf" },
  { id: "f2", name: "数据报表.xlsx", size: 856 * 1024, type: "xls" },
];
