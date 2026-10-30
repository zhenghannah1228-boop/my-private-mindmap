/**
 * 掌控圈:治愈风的解气小游戏。
 * 写下让你炸毛的事 → 分类「我说了算」/「我说了不算」——
 * 说了算的转成一步小行动,说了不算的走一次呼吸,允许自己先放下。
 * 记录全部留在本地,慢慢攒成一张「戾气来源地图」。
 */

export type Category = 'controllable' | 'uncontrollable';

export const UNWIND_TAGS = ['工作节奏', '他人言行', '计划被打乱', '结果不确定', '规则受限', '其他'] as const;

export type UnwindTag = (typeof UNWIND_TAGS)[number];

export interface UnwindEntry {
  id: string;
  /** 让你炸毛的事 */
  text: string;
  /** 来源标签 */
  tag: UnwindTag;
  /** 说了算 / 说了不算 */
  category: Category;
  /** 说了算 → 写下的最小一步;说了不算 → 放下时的那句话 */
  resolution: string;
  createdAt: number;
}

/** 「说了不算」松绑时的固定收尾语 */
export const RELEASE_LINE = '这件事不是我一个人能扭转的,我允许自己先放下它,把力气留给我能做主的地方。';
