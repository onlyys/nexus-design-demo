import { genAvatar, uid } from "@/lib/utils";
import { buildEventBlocks } from "@/components/editor/factory";
import { MOCK_USERS } from "@/lib/mock";
import type { PublishedTopic, PublishedEvent } from "./types";

const EVENT_TITLES = [
  "CarbonX 碳中和实验室 · 图文进展",
  "银发科技实验室 · PPT 分享",
  "为村耕耘者 · 乡村振兴专项",
  "西部少年 AI 课堂 · 科技公益",
];

const EVENT_TIMES = [
  "2026-05-12 19:19",
  "2026-05-13 10:42",
  "2026-05-14 16:08",
  "2026-05-15 09:21",
];

const EVENT_AI_SUMMARIES = [
  "本节系统介绍 CarbonX 实验室在能源、制造、交通三大行业的首批落地：覆盖 Scope 1/2/3 的碳盘查 SaaS，AI 节能调度使试点工厂单位产值能耗下降 11.6%，并对外开放了 30+ 行业伙伴共建的行业级碳因子库。",
  "重点呈现银发科技实验室对外分享的演示材料，涵盖适老化交互组件矩阵、深圳与上海 5 个社区认知健康筛查试点进展，并联合医院发布认知障碍数字干预白皮书。",
  "「为村耕耘者」计划进入第二阶段，覆盖 200+ 县域、累计培养 1.5 万数字乡村人才、撮合县域农产品上行 3.2 亿元，并将经验沉淀为可复用的乡村振兴数字方法论。",
  "「西部少年 AI 课堂」首批覆盖 4 省 12 县，开设 86 个 AI 兴趣班；通过腾讯工程师 + 高校志愿者 + 当地教师的协作模式，建立长期可持续的乡村 AI 教育闭环。",
];

export const MOCK_TOPIC: PublishedTopic = {
  id: "demo",
  title: "SSV 2026 Q2 进展简报",
  authors: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
  authorDept: "可持续社会价值事业部 / 技术架构部",
  authorRoleDeptId: "ssv-tech",
  publishedAt: "2026-05-12 19:19",
  tags: ["关联关键策略", "战略", "项目"],
  visibility: ["edu", "welfare", "tech"],
  visibilityMode: "custom",
  keyStrategy: {
    departmentId: "ssv-tech",
    strategyId: "ks3",
  },
  subscribed: false,
  aiOverview:
    "计划分三阶段构建科学直觉机器人，重点补齐通用大模型在专业学科检索与科学研究场景的不足。先内化方案以采用 Skill 为核心的有向图结构，并利用 ADP 框架整合 Elsevier 等外部学术资源，待向产品团队确认首轮场景后再行定稿。目前识别到微信与企微群机器人的数据双向流动是主要的工程挑战。",
  aiInsight:
    "技术方案的最终定稿前置于产品团队对首轮场景的确认，需关注重新定义对 Skill 有向图设计的复杂度影响。此外，微信与企微双向数据流动的工程挑战可能涉及接口频率限制和消息总线逻辑，需尽早明确核心技术边界，以防影响分阶段实施进度。",
  aiInsightItems: [
    "用户产品团队确认科学研究的具体场景需求",
    "对于微信与企微群人数据双向流动的技术路径",
    "梳理 Elsevier 等外部资源接入所需的 ADP 框架适配及权限审批",
  ],
  events: EVENT_TITLES.map<PublishedEvent>((title, idx) => ({
    id: `ev-${idx + 1}`,
    index: idx + 1,
    title,
    blocks: buildEventBlocks(idx),
    publishedAt: EVENT_TIMES[idx],
    reactions: {
      like: idx === 0 ? 12 : idx === 1 ? 6 : idx === 2 ? 18 : 4,
      dislike: idx === 0 ? 0 : idx === 1 ? 1 : 0,
      doubt: idx === 0 ? 2 : 1,
    },
    aiSummary: EVENT_AI_SUMMARIES[idx],
    comments:
      idx === 0
        ? [
            {
              id: uid(),
              authorId: "u1",
              authorName: "roizhao",
              authorTitle: "赵仁簃",
              authorAvatar: genAvatar("赵仁簃"),
              content:
                "明白，这里大概有两方面的考虑：\n一是产品逻辑，它需要自然的嵌入到会议和讨论流程中（所以是机器人）\n二是要达到的效果，这块应该是需要深入讨论的，比如\n1、把 Connected Papers 等生产关系汇集到，是不是我们按照参会者背景结合被引数量等指标过滤掉得到 source paper，生成局部地图就行\n2、针对拆给例子会试用",
              time: "2026-05-12 19:42",
            },
            {
              id: uid(),
              authorId: "u3",
              authorName: "马巍",
              authorTitle: "前端工程师",
              authorAvatar: genAvatar("马巍"),
              content:
                "我们后续可以把 OpenAPI 优先对接到「为村开放联盟」的伙伴，这样能更快验证场景。",
              time: "2026-05-12 21:05",
            },
          ]
        : idx === 2
        ? [
            {
              id: uid(),
              authorId: "u4",
              authorName: "刘洋",
              authorTitle: "设计师",
              authorAvatar: genAvatar("刘洋"),
              content:
                "县域文旅小程序模板的数据值得做一次专题复盘，3 天就能交付太亮眼了。",
              time: "2026-05-14 17:32",
            },
          ]
        : [],
  })),
};
