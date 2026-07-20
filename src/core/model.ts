/**
 * 数据模型常量与纯函数(移植自 handoff/model.js)。
 *
 * 这里的函数都是纯函数,不改动全局状态 —— ID 游标由 store 统一管理。
 */

import type { ColorIndex, Doc, Edge, InboxItem, MindNode } from './types';

/** 颜色索引 → 语义。UI 不强制含义,由用户自己约定,默认建议如下 */
export const COLORS: { i: ColorIndex; bg: string; border: string; hint: string }[] = [
  { i: 0, bg: '#ffffff', border: '#b4b2a9', hint: '默认' },
  { i: 1, bg: '#FAEEDA', border: '#EF9F27', hint: '待办' },
  { i: 2, bg: '#E1F5EE', border: '#5DCAA5', hint: '已想通' },
  { i: 3, bg: '#FBEAF0', border: '#ED93B1', hint: '灵感' },
  { i: 4, bg: '#E6F1FB', border: '#85B7EB', hint: '疑问' },
];

export const DAY = 86400000;

/** 「最近」过滤器的时间窗口。3 天,可做成设置项 */
export const RECENT_WINDOW = 3 * DAY;

/** dueAt 在多久之内算「紧急」(标红) */
export const SOON_WINDOW = 1 * DAY;

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2.5;

/** 空文档。nid/eid 从 1 开始,0 保留为「无」 */
export function emptyDoc(): Doc {
  return { nodes: [], edges: [], inbox: [], nid: 1, eid: 1 };
}

/** 兼容 v1 的裸字符串 inbox */
export function normalizeInbox(raw: unknown): InboxItem {
  if (typeof raw === 'string') return { t: raw, ct: Date.now(), due: null };
  const it = raw as Partial<InboxItem>;
  return { t: it.t ?? '', ct: it.ct ?? Date.now(), due: it.due ?? null };
}

/** 删除节点时必须级联删除关联的边,否则渲染会拿到悬空引用 */
export function removeNode(doc: Doc, id: number): void {
  doc.nodes = doc.nodes.filter((n) => n.id !== id);
  doc.edges = doc.edges.filter((e) => e.a !== id && e.b !== id);
}

/** 防重复连线 + 防自环。任意两节点可连(含成环),但不重复、不自连 */
export function canConnect(doc: Doc, a: number, b: number): boolean {
  if (a === b) return false;
  return !doc.edges.some(
    (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a)
  );
}

/**
 * 规范化一个从外部读入的文档(localStorage / 导入 / 云端)。
 * 负责:兼容旧字段、补默认值、修正落后的 ID 游标。
 * 移植自 handoff/storage.js loadDoc 里的清洗逻辑。
 */
export function normalizeDoc(raw: Partial<Doc> | null | undefined): Doc {
  const doc = emptyDoc();
  if (raw) Object.assign(doc, raw);

  doc.inbox = (doc.inbox || []).map(normalizeInbox);

  // 外部/旧数据字段可能缺失,按 Partial 处理后补默认值
  const rawNodes = (doc.nodes || []) as Partial<MindNode>[];
  doc.nodes = rawNodes.map((n) => ({
    id: n.id ?? 0,
    x: n.x ?? 0,
    y: n.y ?? 0,
    t: n.t ?? '',
    c: (n.c ?? 0) as ColorIndex,
    ct: n.ct ?? 0,
    due: n.due ?? null,
  }));

  doc.edges = (doc.edges || []) as Edge[];

  // 防御:ID 游标可能落后于实际数据(手动导入外部 JSON 时会发生)
  doc.nid = Math.max(doc.nid || 1, ...doc.nodes.map((n) => n.id + 1), 1);
  doc.eid = Math.max(doc.eid || 1, ...doc.edges.map((e) => e.id + 1), 1);

  return doc;
}

export function makeNode(
  doc: Doc,
  x: number,
  y: number,
  t = '',
  extra: Partial<MindNode> = {}
): MindNode {
  return {
    id: doc.nid,
    x,
    y,
    t,
    c: 0,
    ct: Date.now(),
    due: null,
    ...extra,
  };
}

export function makeEdge(doc: Doc, a: number, b: number): Edge {
  return { id: doc.eid, a, b, ct: Date.now() };
}
