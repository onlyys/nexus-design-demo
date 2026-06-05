import { MOCK_SKILLS } from "@/components/skills/mockSkills";
import SkillDetailClient from "./SkillDetailClient";

// 静态导出：为每个 mock skill 预生成详情页
export function generateStaticParams() {
  return MOCK_SKILLS.map((s) => ({ id: s.id }));
}

export default function Page() {
  return <SkillDetailClient />;
}
