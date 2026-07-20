/**
 * 全局状态(Zustand)。
 *
 * 作品库(多空间)模型:
 * - `spaces` 是所有分类空间(小说/电影/音乐…),每个有独立 doc + view。
 * - 顶层 `doc` / `view` 是**当前活动空间的工作副本**。所有节点/边/视口 action 都直接
 *   改这份工作副本(逻辑与单空间时期完全一致,零改动)。
 * - 切换 / 增删空间时,先把工作副本 commit 回 spaces,再载入目标空间。
 * - 持久化与同步用 `snapshot()` 取「已 commit 活动副本」的完整作品库(见 persist.ts)。
 */

import { create } from 'zustand';
import {
  canConnect,
  emptyDoc,
  makeEdge,
  makeNode,
  makeSpace,
  normalizeLibrary,
  removeNode,
} from '../core/model';
import { fitToNodes, type Rect } from '../core/viewport';
import { loadLibrary, loadSyncKey } from '../core/storage';
import type { ColorIndex, Doc, Library, MindNode, Space, View } from '../core/types';
import type { FilterMode } from '../core/filter';

export interface UiState {
  selectedId: number | null;
  editingId: number | null;
  filterMode: FilterMode;
  linkingFrom: number | null;
  placeMode: boolean;
  /** 正在重命名的空间 id;null = 无 */
  renamingSpaceId: string | null;
  syncKey: string;
  syncMsg: string;
  autoSync: boolean;
  status: string;
}

export interface Store {
  spaces: Space[];
  activeId: string;
  doc: Doc; // 活动空间工作副本
  view: View; // 活动空间工作副本
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

  // ── 视口 ──
  setView: (v: View) => void;
  fit: (rect: Rect, sizes?: Map<number, { w: number; h: number }>) => void;

  // ── 空间(作品库导航)──
  switchSpace: (id: string) => void;
  addSpace: (name: string) => void;
  renameSpace: (id: string, name: string) => void;
  deleteSpace: (id: string) => void;
  setRenaming: (id: string | null) => void;
  /** 取当前完整作品库(含已 commit 的活动副本) */
  snapshot: () => Library;

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

  // ── 作品库级 ──
  replaceLibrary: (raw: unknown) => void;
}

const initialLibrary = loadLibrary();
const initialActive =
  initialLibrary.spaces.find((s) => s.id === initialLibrary.activeId) ?? initialLibrary.spaces[0];

function baseUi(): UiState {
  return {
    selectedId: null,
    editingId: null,
    filterMode: null,
    linkingFrom: null,
    placeMode: false,
    renamingSpaceId: null,
    syncKey: loadSyncKey(),
    syncMsg: '同一同步码 = 同一份数据。手机上填相同的码即可打通。',
    autoSync: false,
    status: '就绪',
  };
}

/** 把活动空间的工作副本 commit 回 spaces 数组 */
function committedSpaces(state: Store): Space[] {
  return state.spaces.map((s) =>
    s.id === state.activeId ? { ...s, doc: state.doc, view: state.view } : s
  );
}

/** 切换空间时重置的瞬时 UI(保留同步相关字段) */
function resetTransientUi(ui: UiState): UiState {
  return {
    ...ui,
    selectedId: null,
    editingId: null,
    linkingFrom: null,
    placeMode: false,
    filterMode: null,
    renamingSpaceId: null,
  };
}

export const useStore = create<Store>((set, get) => ({
  spaces: initialLibrary.spaces,
  activeId: initialActive.id,
  doc: initialActive.doc,
  view: initialActive.view,
  ui: baseUi(),

  addNode(x, y, t = '', extra = {}) {
    const doc = get().doc;
    const node = makeNode(doc, x, y, t, extra);
    set({ doc: { ...doc, nodes: [...doc.nodes, node], nid: doc.nid + 1 } });
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
    set({ doc: { ...doc, nodes: doc.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) } });
  },

  setNodeColor(id, c) {
    const doc = get().doc;
    set({ doc: { ...doc, nodes: doc.nodes.map((n) => (n.id === id ? { ...n, c } : n)) } });
  },

  setNodeDue(id, due) {
    const doc = get().doc;
    set({ doc: { ...doc, nodes: doc.nodes.map((n) => (n.id === id ? { ...n, due } : n)) } });
  },

  deleteNode(id) {
    const doc = { ...get().doc, nodes: [...get().doc.nodes], edges: [...get().doc.edges] };
    removeNode(doc, id);
    const ui = get().ui;
    set({ doc, ui: { ...ui, selectedId: ui.selectedId === id ? null : ui.selectedId } });
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

  setView(v) {
    set({ view: v });
  },

  fit(rect, sizes) {
    set({ view: fitToNodes(get().doc.nodes, rect, sizes) });
  },

  // ── 空间 ──
  switchSpace(id) {
    const state = get();
    if (id === state.activeId) return;
    const spaces = committedSpaces(state);
    const target = spaces.find((s) => s.id === id);
    if (!target) return;
    set({
      spaces,
      activeId: id,
      doc: target.doc,
      view: target.view,
      ui: resetTransientUi(state.ui),
    });
  },

  addSpace(name) {
    const state = get();
    const s = makeSpace(name);
    set({
      spaces: [...committedSpaces(state), s],
      activeId: s.id,
      doc: s.doc,
      view: s.view,
      ui: { ...resetTransientUi(state.ui), renamingSpaceId: s.id }, // 新建后直接进入重命名
    });
  },

  renameSpace(id, name) {
    const state = get();
    const clean = name.trim() || '未命名';
    set({
      spaces: committedSpaces(state).map((s) => (s.id === id ? { ...s, name: clean } : s)),
      ui: { ...state.ui, renamingSpaceId: null },
    });
  },

  deleteSpace(id) {
    const state = get();
    let spaces = committedSpaces(state).filter((s) => s.id !== id);
    if (!spaces.length) spaces = [makeSpace('新分类')]; // 不能空
    const wasActive = state.activeId === id;
    const active = wasActive ? spaces[0] : spaces.find((s) => s.id === state.activeId) ?? spaces[0];
    set({
      spaces,
      activeId: active.id,
      doc: active.doc,
      view: active.view,
      ui: wasActive ? resetTransientUi(state.ui) : { ...state.ui, renamingSpaceId: null },
    });
  },

  setRenaming(id) {
    set({ ui: { ...get().ui, renamingSpaceId: id } });
  },

  snapshot() {
    const state = get();
    return { spaces: committedSpaces(state), activeId: state.activeId };
  },

  // ── UI ──
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

  // ── 作品库级 ──
  replaceLibrary(raw) {
    const lib = normalizeLibrary(raw);
    const active = lib.spaces.find((s) => s.id === lib.activeId) ?? lib.spaces[0];
    set({
      spaces: lib.spaces,
      activeId: active.id,
      doc: active.doc,
      view: active.view,
      ui: resetTransientUi(get().ui),
    });
  },
}));

export { emptyDoc };
