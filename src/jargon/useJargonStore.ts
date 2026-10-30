/**
 * 大厂黑话语料库状态:内置 + 导入词条、分类过滤、搜索、复制采集指令、导入。
 * 导入的词条存 localStorage。与其它模块数据完全独立。
 */

import { create } from 'zustand';
import { BUILTIN_JARGON } from './builtin';
import { JARGON_PROMPT, type Jargon } from './types';

const IMPORT_KEY = 'mm_jargon_imported';

function isValid(j: unknown): j is Jargon {
  const x = j as Partial<Jargon>;
  return !!(x && typeof x.id === 'string' && typeof x.term === 'string' && typeof x.category === 'string' && typeof x.plain === 'string');
}

function loadImported(): Jargon[] {
  try {
    const raw = localStorage.getItem(IMPORT_KEY);
    const arr = raw ? (JSON.parse(raw) as Jargon[]) : [];
    return Array.isArray(arr) ? arr.filter(isValid) : [];
  } catch {
    return [];
  }
}

function saveImported(list: Jargon[]) {
  try {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

interface JargonStore {
  jargons: Jargon[];
  loaded: boolean;
  activeCat: string | null; // null = 全部
  query: string;
  status: string;

  init: () => void;
  setCat: (c: string | null) => void;
  setQuery: (q: string) => void;
  copyPrompt: () => Promise<void>;
  importFile: (file: File) => Promise<void>;
}

export const useJargonStore = create<JargonStore>((set, get) => ({
  jargons: [],
  loaded: false,
  activeCat: null,
  query: '',
  status: '',

  init() {
    if (get().loaded) return;
    const imported = loadImported();
    const builtinIds = new Set(BUILTIN_JARGON.map((j) => j.id));
    const jargons = [...imported.filter((j) => !builtinIds.has(j.id)), ...BUILTIN_JARGON];
    set({ jargons, loaded: true });
  },

  setCat(c) {
    set({ activeCat: c });
  },
  setQuery(q) {
    set({ query: q });
  },

  async copyPrompt() {
    try {
      await navigator.clipboard.writeText(JARGON_PROMPT);
      set({ status: '✓ 采集指令已复制' });
    } catch {
      set({ status: '复制失败,请手动选择' });
    }
    setTimeout(() => set({ status: '' }), 2600);
  },

  async importFile(file) {
    try {
      const data = JSON.parse(await file.text()) as unknown;
      const incoming = (Array.isArray(data) ? data : [data]).filter(isValid);
      if (!incoming.length) {
        set({ status: '没有找到可用的词条(检查 JSON 结构)' });
        setTimeout(() => set({ status: '' }), 3200);
        return;
      }
      const builtinIds = new Set(BUILTIN_JARGON.map((j) => j.id));
      const prev = loadImported().filter((j) => !incoming.some((n) => n.id === j.id));
      const next = [...incoming.filter((j) => !builtinIds.has(j.id)), ...prev];
      saveImported(next);
      set({ jargons: [...next, ...BUILTIN_JARGON], status: `✓ 导入 ${incoming.length} 条黑话` });
      setTimeout(() => set({ status: '' }), 2600);
    } catch (e) {
      set({ status: '导入失败:' + ((e as Error).message || 'JSON 解析错误') });
      setTimeout(() => set({ status: '' }), 3600);
    }
  },
}));
