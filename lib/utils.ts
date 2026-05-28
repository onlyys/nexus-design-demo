import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * 基于姓名生成离线头像（SVG Data URL）。
 * - 取姓名最后 1~2 个字（中文取末字，英文取首字母）
 * - 颜色按姓名 hash 稳定映射到一组企业级渐变
 * - 完全本地渲染，无外网依赖（适配腾讯内网）
 */
const AVATAR_GRADIENTS: Array<[string, string]> = [
  ["#2563EB", "#8B5CF6"], // 蓝 → 紫（主品牌）
  ["#0EA5E9", "#2563EB"], // 天蓝 → 蓝
  ["#8B5CF6", "#EC4899"], // 紫 → 粉
  ["#10B981", "#0EA5E9"], // 绿 → 蓝
  ["#F59E0B", "#EF4444"], // 橙 → 红
  ["#6366F1", "#06B6D4"], // 靛 → 青
  ["#EC4899", "#8B5CF6"], // 粉 → 紫
  ["#14B8A6", "#3B82F6"], // 青 → 蓝
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickInitials(name: string) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "·";
  // 中文：取最后一个字（更接近企业 IM 默认头像规则）
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return trimmed.slice(-1);
  }
  // 英文：取每段首字母最多 2 位
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function genAvatar(name: string, size = 80) {
  const initials = pickInitials(name);
  const [c1, c2] =
    AVATAR_GRADIENTS[hashStr(name) % AVATAR_GRADIENTS.length];
  const fontSize = Math.round(size * 0.42);
  // gradient id 不能含特殊字符，用 hash 作为唯一标识
  const gid = `g${hashStr(name).toString(36)}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="${size}" height="${size}" rx="${size}" fill="url(#${gid})"/><text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="${fontSize}" font-weight="600" fill="#ffffff">${initials}</text></svg>`;
  // encodeURIComponent 兼容性最佳，避免中文 btoa 报错
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
