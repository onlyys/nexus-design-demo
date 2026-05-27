import type { Block } from "@/components/editor/types";

export interface EventItem {
  id: string;
  title: string;
  blocks: Block[];
}
