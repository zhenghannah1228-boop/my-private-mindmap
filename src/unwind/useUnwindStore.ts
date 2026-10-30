/**
 * 掌控圈状态:写 → 分类 → 松绑(呼吸)或转成行动 → 存档。
 * 记录存 localStorage,纯本地、与其它模块数据完全独立。
 */

import { create } from 'zustand';
import { RELEASE_LINE, UNWIND_TAGS, type Category, type UnwindEntry, type UnwindTag } from './types';

const STORE_KEY = 'mm_unwind_entries';

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
}

function isValid(e: unknown): e is UnwindEntry {
  const x = e as Partial<UnwindEntry>;
  return !!(
    x &&
    typeof x.id === 'string' &&
    typeof x.text === 'string' &&
    typeof x.tag === 'string' &&
    (x.category === 'controllable' || x.category === 'uncontrollable') &&
    typeof x.resolution === 'string' &&
    typeof x.createdAt === 'number'
  );
}

function loadEntries(): UnwindEntry[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? (JSON.parse(raw) as UnwindEntry[]) : [];
    return Array.isArray(arr) ? arr.filter(isValid) : [];
  } catch {
    return [];
  }
}

function saveEntries(list: UnwindEntry[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

type SubPhase = 'sort' | 'release' | 'act';

interface Pending {
  text: string;
  tag: UnwindTag;
}

interface UnwindStore {
  entries: UnwindEntry[];
  loaded: boolean;

  draftText: string;
  draftTag: UnwindTag;

  pending: Pending | null;
  subphase: SubPhase | null;
  breathStep: number; // 1..3 = 呼吸步骤,4 = 待确认放下
  actionText: string;

  init: () => void;
  setDraftText: (t: string) => void;
  setDraftTag: (t: UnwindTag) => void;
  submitDraft: () => void;
  chooseCategory: (c: Category) => void;
  nextBreath: () => void;
  finalizeRelease: () => void;
  setActionText: (t: string) => void;
  finalizeAct: () => void;
  cancelPending: () => void;
}

export const useUnwindStore = create<UnwindStore>((set, get) => ({
  entries: [],
  loaded: false,

  draftText: '',
  draftTag: UNWIND_TAGS[0],

  pending: null,
  subphase: null,
  breathStep: 1,
  actionText: '',

  init() {
    if (get().loaded) return;
    set({ entries: loadEntries(), loaded: true });
  },

  setDraftText(t) {
    set({ draftText: t });
  },
  setDraftTag(t) {
    set({ draftTag: t });
  },

  submitDraft() {
    const text = get().draftText.trim();
    if (!text) return;
    set({
      pending: { text, tag: get().draftTag },
      subphase: 'sort',
      draftText: '',
      breathStep: 1,
      actionText: '',
    });
  },

  chooseCategory(c) {
    set({ subphase: c === 'controllable' ? 'act' : 'release', breathStep: 1 });
  },

  nextBreath() {
    set({ breathStep: Math.min(4, get().breathStep + 1) });
  },

  finalizeRelease() {
    const p = get().pending;
    if (!p) return;
    const entry: UnwindEntry = {
      id: newId(),
      text: p.text,
      tag: p.tag,
      category: 'uncontrollable',
      resolution: RELEASE_LINE,
      createdAt: Date.now(),
    };
    const next = [entry, ...get().entries];
    saveEntries(next);
    set({ entries: next, pending: null, subphase: null, breathStep: 1 });
  },

  setActionText(t) {
    set({ actionText: t });
  },

  finalizeAct() {
    const p = get().pending;
    const action = get().actionText.trim();
    if (!p || !action) return;
    const entry: UnwindEntry = {
      id: newId(),
      text: p.text,
      tag: p.tag,
      category: 'controllable',
      resolution: action,
      createdAt: Date.now(),
    };
    const next = [entry, ...get().entries];
    saveEntries(next);
    set({ entries: next, pending: null, subphase: null, actionText: '' });
  },

  cancelPending() {
    set({ pending: null, subphase: null, breathStep: 1, actionText: '' });
  },
}));
