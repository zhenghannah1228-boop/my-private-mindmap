/**
 * 过滤 / 高亮(移植自 handoff/filter.js)。
 *
 * 关键产品决策:过滤时**不隐藏**节点,只降低透明度(dim)。
 * ADHD 用户高度依赖空间记忆(「那个想法在右下角」),节点消失=空间锚点丢失。
 * 迁移时请保留 —— 不要「优化」成 display:none。
 */

import { RECENT_WINDOW } from './model';
import type { Edge, MindNode } from './types';

export type FilterMode = 'time' | 'recent' | null;

export const FILTERS = {
  /** 只高亮设了提醒时间的节点 */
  TIME: 'time' as const,
  /** 只高亮最近 3 天创建的节点 */
  RECENT: 'recent' as const,
};

export function isHighlighted(node: MindNode, mode: FilterMode): boolean {
  if (!mode) return true;
  if (mode === 'time') return !!node.due;
  if (mode === 'recent') return Date.now() - (node.ct || 0) < RECENT_WINDOW;
  return true;
}

/** 边的高亮:两端都高亮才算高亮 */
export function isEdgeHighlighted(
  edge: Edge,
  nodes: MindNode[],
  mode: FilterMode
): boolean {
  if (!mode) return true;
  const a = nodes.find((n) => n.id === edge.a);
  const b = nodes.find((n) => n.id === edge.b);
  return !!a && !!b && isHighlighted(a, mode) && isHighlighted(b, mode);
}

/** 点击同一个按钮 = 取消过滤(toggle 语义) */
export function toggleFilter(current: FilterMode, mode: Exclude<FilterMode, null>): FilterMode {
  return current === mode ? null : mode;
}
