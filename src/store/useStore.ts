/**
 * 全局状态(Zustand)。
 *
 * 结构选择:doc(持久化数据) + view(视口) + ui(瞬时交互态)放同一个 store,
 * action 只做纯粹的状态转移,持久化/同步由订阅副作用统一处理(见 persist.ts),
 * 这样后续接 undo 中间件(P1)时只需包住 doc 部分。
 */

import { create } from 'zustand';
import {
  canConnect,
  emptyDoc,
  makeEdge,
  makeNode,
  normalizeDoc,
  removeNode,
} from '../core/model';
import { fitToNodes, type Rect } from '../core/viewport';
import { loadDoc, loadSyncKey } from '../core/storage';
import type { ColorIndex, Doc, MindNode, View } from '../core/types';
import type { FilterMode } from '../core/filter';

export interface UiState {
  selectedId: number | null;
  editingId: number | null;
  filterMode: FilterMode;
  /** LINKING 中的源节点 id;null = 非连线态 */
  linkingFrom: number | null;
  /** 「+」放置模式:下一次点画布空白建节点(移动端建节点的可靠路径) */
  placeMode: boolean;
  syncKey: string;
  syncMsg: string;
  autoSync: boolean;
  status: string;
}

export interface Store {
  doc: Doc;
  view: View;
  ui: UiState;

  // ── 节点 ──
  addNode: (x: number, y: number, t?: string, extra?: Partial<MindNode>) => number;
  updateNodeText: (id: number, t: string) => void;
  moveNode: (id: number, x: number, y: number) => void;
  setNodeColor: (id: number, c: ColorIndex) => void;
  setNodeDue: (id: number, due: number | null) => void;
  deleteNode: (id: number) => void;

  // ── 边 ──
  addEdge: (a: number, b: number) => void;
  deleteEdge: (id: number) => void;

  // ── 收集箱 ──
  addInbox: (t: string, due: number | null) => void;
  removeInbox: (index: number) => void;
  inboxToNode: (index: number, x: number, y: number) => void;

  // ── 视口 ──
  setView: (v: View) => void;
  fit: (rect: Rect, sizes?: Map<number, { w: number; h: number }>) => void;

  // ── UI ──
  select: (id: number | null) => void;
  setEditing: (id: number | null) => void;
  setFilter: (mode: FilterMode) => void;
  setLinkingFrom: (id: number | null) => void;
  setPlaceMode: (on: boolean) => void;
  setSyncKey: (k: string) => void;
  setSyncMsg: (m: string) => void;
  setAutoSync: (on: boolean) => void;
  setStatus: (s: string) => void;

  // ── 文档级 ──
  replaceDoc: (raw: Partial<Doc>) => void;
}

function initDoc(): Doc {
  return loadDoc();
}

export const useStore = create<Store>((set, get) => ({
  doc: initDoc(),
  view: { x: 200, y: 200, k: 1 },
  ui: {
    selectedId: null,
    editingId: null,
    filterMode: null,
    linkingFrom: null,
    placeMode: false,
    syncKey: loadSyncKey(),
    syncMsg: '同一同步码 = 同一份数据。手机上填相同的码即可打通。',
    autoSync: false,
    status: '就绪',
  },

  addNode(x, y, t = '', extra = {}) {
    const doc = get().doc;
    const node = makeNode(doc, x, y, t, extra);
    set({
      doc: { ...doc, nodes: [...doc.nodes, node], nid: doc.nid + 1 },
    });
    return node.id;
  },

  updateNodeText(id, t) {
    const doc = get().doc;
    set({
      doc: {
        ...doc,
        nodes: doc.nodes.map((n) => (n.id === id ? { ...n, t: t.trim() || '空' } : n)),
      },
    });
  },

  moveNode(id, x, y) {
    const doc = get().doc;
    set({
      doc: { ...doc, nodes: doc.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) },
    });
  },

  setNodeColor(id, c) {
    const doc = get().doc;
    set({
      doc: { ...doc, nodes: doc.nodes.map((n) => (n.id === id ? { ...n, c } : n)) },
    });
  },

  setNodeDue(id, due) {
    const doc = get().doc;
    set({
      doc: { ...doc, nodes: doc.nodes.map((n) => (n.id === id ? { ...n, due } : n)) },
    });
  },

  deleteNode(id) {
    const doc = { ...get().doc, nodes: [...get().doc.nodes], edges: [...get().doc.edges] };
    removeNode(doc, id);
    const ui = get().ui;
    set({
      doc,
      ui: { ...ui, selectedId: ui.selectedId === id ? null : ui.selectedId },
    });
  },

  addEdge(a, b) {
    const doc = get().doc;
    if (!canConnect(doc, a, b)) return;
    const edge = makeEdge(doc, a, b);
    set({ doc: { ...doc, edges: [...doc.edges, edge], eid: doc.eid + 1 } });
  },

  deleteEdge(id) {
    const doc = get().doc;
    set({ doc: { ...doc, edges: doc.edges.filter((e) => e.id !== id) } });
  },

  addInbox(t, due) {
    const doc = get().doc;
    set({
      doc: { ...doc, inbox: [{ t, ct: Date.now(), due }, ...doc.inbox] },
    });
  },

  removeInbox(index) {
    const doc = get().doc;
    set({ doc: { ...doc, inbox: doc.inbox.filter((_, i) => i !== index) } });
  },

  inboxToNode(index, x, y) {
    const doc = get().doc;
    const item = doc.inbox[index];
    if (!item) return;
    const node = makeNode(doc, x, y, item.t, { ct: item.ct, due: item.due });
    set({
      doc: {
        ...doc,
        nodes: [...doc.nodes, node],
        nid: doc.nid + 1,
        inbox: doc.inbox.filter((_, i) => i !== index),
      },
    });
  },

  setView(v) {
    set({ view: v });
  },

  fit(rect, sizes) {
    set({ view: fitToNodes(get().doc.nodes, rect, sizes) });
  },

  select(id) {
    set({ ui: { ...get().ui, selectedId: id } });
  },

  setEditing(id) {
    set({ ui: { ...get().ui, editingId: id } });
  },

  setFilter(mode) {
    set({ ui: { ...get().ui, filterMode: mode } });
  },

  setLinkingFrom(id) {
    set({ ui: { ...get().ui, linkingFrom: id } });
  },

  setPlaceMode(on) {
    set({ ui: { ...get().ui, placeMode: on } });
  },

  setSyncKey(k) {
    set({ ui: { ...get().ui, syncKey: k } });
  },

  setSyncMsg(m) {
    set({ ui: { ...get().ui, syncMsg: m } });
  },

  setAutoSync(on) {
    set({ ui: { ...get().ui, autoSync: on } });
  },

  setStatus(s) {
    set({ ui: { ...get().ui, status: s } });
  },

  replaceDoc(raw) {
    set({ doc: normalizeDoc(raw), ui: { ...get().ui, selectedId: null, editingId: null } });
  },
}));

export { emptyDoc };
