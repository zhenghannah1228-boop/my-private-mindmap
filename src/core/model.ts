/**
 * 数据模型常量与纯函数(移植自 handoff/model.js)。
 *
 * 这里的函数都是纯函数,不改动全局状态 —— ID 游标由 store 统一管理。
 */

import type { ColorIndex, Doc, Edge, InboxItem, Library, MindNode, Space, Sticker, View } from './types';

/** 颜色索引 → 语义。UI 不强制含义,由用户自己约定,默认建议如下 */
export const COLORS: { i: ColorIndex; bg: string; border: string; hint: string }[] = [
  { i: 0, bg: '#ffffff', border: '#1c1b19', hint: '默认' },
  { i: 1, bg: '#efeeea', border: '#1c1b19', hint: '待办' },
  { i: 2, bg: '#d7d5cf', border: '#1c1b19', hint: '已想通' },
  { i: 3, bg: '#a9a7a0', border: '#1c1b19', hint: '灵感' },
  { i: 4, bg: '#1c1b19', border: '#1c1b19', hint: '疑问' },
];

export const DAY = 86400000;

/** 「最近」过滤器的时间窗口。3 天,可做成设置项 */
export const RECENT_WINDOW = 3 * DAY;

/** dueAt 在多久之内算「紧急」(标红) */
export const SOON_WINDOW = 1 * DAY;

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2.5;

/** 气泡形状数量(对应 CSS 的 .node.shape-0 … shape-N) */
export const NODE_SHAPES = 8;

/** 空文档。nid/eid/sid 从 1 开始,0 保留为「无」 */
export function emptyDoc(): Doc {
  return { nodes: [], edges: [], inbox: [], stickers: [], nid: 1, eid: 1, sid: 1 };
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
    // 保留形状(老数据无此字段则不设,渲染为默认圆角)
    ...(n.shape != null ? { shape: n.shape } : {}),
  }));

  doc.edges = (doc.edges || []) as Edge[];

  // 贴画(老数据无此字段=空)。补默认、过滤缺 blob 的脏数据
  const rawStickers = (doc.stickers || []) as Partial<Sticker>[];
  doc.stickers = rawStickers
    .filter((s) => typeof s.blobId === 'string' && s.blobId)
    .map((s) => ({
      id: s.id ?? 0,
      x: s.x ?? 0,
      y: s.y ?? 0,
      w: s.w ?? 160,
      h: s.h ?? 160,
      blobId: s.blobId as string,
      ct: s.ct ?? 0,
      ...(s.crop ? { crop: s.crop } : {}),
      ...(s.cutout ? { cutout: true } : {}),
    }));

  // 防御:ID 游标可能落后于实际数据(手动导入外部 JSON 时会发生)
  doc.nid = Math.max(doc.nid || 1, ...doc.nodes.map((n) => n.id + 1), 1);
  doc.eid = Math.max(doc.eid || 1, ...doc.edges.map((e) => e.id + 1), 1);
  doc.sid = Math.max(doc.sid || 1, ...doc.stickers.map((s) => s.id + 1), 1);

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
    // 每次新建随机气泡形状(extra 可覆盖,如从收集箱/导入沿用)
    shape: Math.floor(Math.random() * NODE_SHAPES),
    ...extra,
  };
}

export function makeEdge(doc: Doc, a: number, b: number): Edge {
  return { id: doc.eid, a, b, ct: Date.now() };
}

export function makeSticker(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  blobId: string,
  extra: Partial<Sticker> = {}
): Sticker {
  return { id: doc.sid ?? 1, x, y, w, h, blobId, ct: Date.now(), ...extra };
}

/** 删除贴画(返回被删对象的 blobId,供上层清理 IndexedDB) */
export function removeSticker(doc: Doc, id: number): string | null {
  const s = (doc.stickers || []).find((k) => k.id === id) || null;
  doc.stickers = (doc.stickers || []).filter((k) => k.id !== id);
  return s ? s.blobId : null;
}

// ─────────────────────────────────────────────────────────────
// 作品库(多空间)
// ─────────────────────────────────────────────────────────────

/** 默认分类。作为新用户的起点,之后可自由增删改 */
export const PRESET_SPACE_NAMES = ['小说', '散文集', '诗歌', '电影', '音乐'];

const DEFAULT_VIEW: View = { x: 200, y: 200, k: 1 };

function newId(): string {
  // 浏览器环境可用;避免多端撞 ID
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 's_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
}

export function makeSpace(name: string): Space {
  return { id: newId(), name: name || '新分类', doc: emptyDoc(), view: { ...DEFAULT_VIEW } };
}

export function defaultLibrary(): Library {
  const spaces = PRESET_SPACE_NAMES.map(makeSpace);
  return { spaces, activeId: spaces[0].id };
}

function isView(v: unknown): v is View {
  return !!v && typeof (v as View).k === 'number';
}

/**
 * 规范化作品库。兼容三种输入:
 * 1. 新版 Library({ spaces, activeId })
 * 2. 旧版单文档 Doc({ nodes, edges… }) —— 迁移成「未分类」空间 + 追加预设分类
 * 3. null / 空 —— 返回预设作品库
 */
export function normalizeLibrary(raw: unknown): Library {
  const r = raw as Partial<Library> & Partial<Doc>;

  if (r && Array.isArray(r.spaces)) {
    const spaces: Space[] = r.spaces.map((s) => ({
      id: s?.id || newId(),
      name: s?.name || '未命名',
      doc: normalizeDoc(s?.doc),
      view: isView(s?.view) ? (s!.view as View) : { ...DEFAULT_VIEW },
    }));
    if (!spaces.length) return defaultLibrary();
    const activeId = spaces.some((s) => s.id === r.activeId) ? (r.activeId as string) : spaces[0].id;
    return { spaces, activeId };
  }

  // 旧版单文档:保住数据,迁移为「未分类」,再补上预设分类
  if (r && (Array.isArray(r.nodes) || Array.isArray(r.edges))) {
    const legacy = makeSpace('未分类');
    legacy.doc = normalizeDoc(r as Partial<Doc>);
    const spaces = [legacy, ...PRESET_SPACE_NAMES.map(makeSpace)];
    return { spaces, activeId: legacy.id };
  }

  return defaultLibrary();
}
