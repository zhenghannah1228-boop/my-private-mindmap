/**
 * 数据模型类型。与原型 mindmap-v2.html 的 JSON 结构完全兼容,
 * 因此旧的 localStorage / 导出文件可以直接被新版读入。
 *
 * 迁移注意(见 handoff/model.js):
 * - nid / eid 是自增游标,单机可用;多端并发会撞 ID。
 *   正式版建议改 crypto.randomUUID(),以支持节点级合并。见 P1「同步冲突」。
 * - x / y 是「世界坐标」,不是屏幕坐标。屏幕坐标 = 世界 * view.k + view.x/y。
 */

export type ColorIndex = 0 | 1 | 2 | 3 | 4;

export interface MindNode {
  id: number;
  /** 世界坐标 */
  x: number;
  y: number;
  /** 文本内容 */
  t: string;
  /** 颜色索引 0-4 */
  c: ColorIndex;
  /** createdAt, epoch ms — 自动写入,不可编辑 */
  ct: number;
  /** dueAt, epoch ms — 提醒时间,可空 */
  due: number | null;
  /** 气泡形状索引(新建时随机;老节点无此字段=默认圆角矩形) */
  shape?: number;
}

export interface Edge {
  id: number;
  /** 起点 node id */
  a: number;
  /** 终点 node id */
  b: number;
  ct: number;
}

export interface InboxItem {
  t: string;
  ct: number;
  due: number | null;
}

export interface Doc {
  nodes: MindNode[];
  edges: Edge[];
  inbox: InboxItem[];
  /** 节点自增 ID 游标 */
  nid: number;
  /** 边自增 ID 游标 */
  eid: number;
}

export interface View {
  x: number;
  y: number;
  k: number;
}

/**
 * 作品库空间。每个分类(小说/电影/音乐…)是一个独立空间,
 * 有自己的 nodes/edges 和视口 —— 互不干扰,像不同的看板。
 * view 随空间保存,保留各自的空间记忆(对 ADHD 用户很重要)。
 */
export interface Space {
  id: string;
  name: string;
  doc: Doc;
  view: View;
}

export interface Library {
  spaces: Space[];
  activeId: string;
}
