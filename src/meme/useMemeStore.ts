/**
 * 迷因探踪状态:载入迷因(内置 + 导入)、在站点间跳转、探踪进度、成因推理结局。
 * 导入的迷因存 localStorage(纯文本 JSON,体积小)。与其它模块数据完全独立。
 */

import { create } from 'zustand';
import { BUILTIN_MEMES } from './builtin';
import { MEME_PROMPT, type FactorKey, type Meme } from './types';

const IMPORT_KEY = 'mm_memes_imported';

type Phase = 'explore' | 'quiz' | 'result';

function loadImported(): Meme[] {
  try {
    const raw = localStorage.getItem(IMPORT_KEY);
    const arr = raw ? (JSON.parse(raw) as Meme[]) : [];
    return Array.isArray(arr) ? arr.filter(isValidMeme) : [];
  } catch {
    return [];
  }
}

function saveImported(list: Meme[]) {
  try {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(list));
  } catch {
    /* 超额或隐私模式:忽略 */
  }
}

/** 校验一个迷因结构基本可玩:站点齐全、startId/originId/links.to 都能解析 */
export function isValidMeme(m: unknown): m is Meme {
  const x = m as Partial<Meme>;
  if (!x || typeof x.id !== 'string' || !Array.isArray(x.stations) || !x.stations.length) return false;
  if (typeof x.startId !== 'string' || typeof x.originId !== 'string') return false;
  const ids = new Set(x.stations.map((s) => s?.id));
  if (!ids.has(x.startId) || !ids.has(x.originId)) return false;
  for (const s of x.stations) {
    if (!s || typeof s.id !== 'string' || typeof s.title !== 'string') return false;
    for (const l of s.links || []) if (!ids.has(l?.to)) return false;
  }
  return true;
}

interface MemeStore {
  memes: Meme[];
  loaded: boolean;
  activeId: string | null;
  stationId: string | null;
  visited: string[];
  history: string[];
  phase: Phase;
  guess: FactorKey[];
  status: string;

  init: () => void;
  selectMeme: (id: string) => void;
  exitMeme: () => void;
  goto: (stationId: string) => void;
  back: () => void;
  startQuiz: () => void;
  toggleFactor: (k: FactorKey) => void;
  submitQuiz: () => void;
  replay: () => void;
  copyPrompt: () => Promise<void>;
  importFile: (file: File) => Promise<void>;
  removeImported: (id: string) => void;
}

export const useMemeStore = create<MemeStore>((set, get) => ({
  memes: [],
  loaded: false,
  activeId: null,
  stationId: null,
  visited: [],
  history: [],
  phase: 'explore',
  guess: [],
  status: '',

  init() {
    if (get().loaded) return;
    // 导入的放前面,方便用户找到自己加的
    const imported = loadImported();
    const builtinIds = new Set(BUILTIN_MEMES.map((m) => m.id));
    const memes = [...imported.filter((m) => !builtinIds.has(m.id)), ...BUILTIN_MEMES];
    set({ memes, loaded: true });
  },

  selectMeme(id) {
    const meme = get().memes.find((m) => m.id === id);
    if (!meme) return;
    set({
      activeId: id,
      stationId: meme.startId,
      visited: [meme.startId],
      history: [],
      phase: 'explore',
      guess: [],
    });
  },

  exitMeme() {
    set({ activeId: null, stationId: null, visited: [], history: [], phase: 'explore', guess: [] });
  },

  goto(stationId) {
    const { stationId: cur, visited, history } = get();
    if (!stationId || stationId === cur) return;
    set({
      history: cur ? [...history, cur] : history,
      stationId,
      visited: visited.includes(stationId) ? visited : [...visited, stationId],
    });
  },

  back() {
    const { history } = get();
    if (!history.length) return;
    const prev = history[history.length - 1];
    set({ history: history.slice(0, -1), stationId: prev });
  },

  startQuiz() {
    set({ phase: 'quiz' });
  },

  toggleFactor(k) {
    const g = get().guess;
    set({ guess: g.includes(k) ? g.filter((x) => x !== k) : [...g, k] });
  },

  submitQuiz() {
    set({ phase: 'result' });
  },

  replay() {
    const meme = get().memes.find((m) => m.id === get().activeId);
    if (!meme) return;
    set({ stationId: meme.startId, visited: [meme.startId], history: [], phase: 'explore', guess: [] });
  },

  async copyPrompt() {
    try {
      await navigator.clipboard.writeText(MEME_PROMPT);
      set({ status: '✓ 采集指令已复制' });
    } catch {
      set({ status: '复制失败,请手动选择' });
    }
    setTimeout(() => set({ status: '' }), 2600);
  },

  async importFile(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      const incoming = (Array.isArray(data) ? data : [data]).filter(isValidMeme);
      if (!incoming.length) {
        set({ status: '没有找到可用的迷因(检查 JSON 结构)' });
        setTimeout(() => set({ status: '' }), 3200);
        return;
      }
      // 以 id 合并覆盖已有导入
      const builtinIds = new Set(BUILTIN_MEMES.map((m) => m.id));
      const prev = loadImported().filter((m) => !incoming.some((n) => n.id === m.id));
      const next = [...incoming.filter((m) => !builtinIds.has(m.id)), ...prev];
      saveImported(next);
      const memes = [...next, ...BUILTIN_MEMES];
      set({ memes, status: `✓ 导入 ${incoming.length} 个迷因` });
      setTimeout(() => set({ status: '' }), 2600);
    } catch (e) {
      set({ status: '导入失败:' + ((e as Error).message || 'JSON 解析错误') });
      setTimeout(() => set({ status: '' }), 3600);
    }
  },

  removeImported(id) {
    const next = loadImported().filter((m) => m.id !== id);
    saveImported(next);
    const memes = [...next, ...BUILTIN_MEMES];
    const st = get();
    set({
      memes,
      ...(st.activeId === id ? { activeId: null, stationId: null, visited: [], history: [], phase: 'explore' as Phase, guess: [] } : {}),
    });
  },
}));
