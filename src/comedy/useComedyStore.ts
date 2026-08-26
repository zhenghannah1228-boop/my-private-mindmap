/**
 * 笑点解析状态:载入笑点(内置 + 导入)、揭晓笑点、技巧推理结局。
 * 导入的笑点存 localStorage(纯文本 JSON)。与其它模块数据完全独立。
 */

import { create } from 'zustand';
import { BUILTIN_JOKES } from './builtin';
import { COMEDY_PROMPT, type ComedyFactor, type Joke } from './types';

const IMPORT_KEY = 'mm_jokes_imported';

type Phase = 'read' | 'quiz' | 'result';

export function isValidJoke(j: unknown): j is Joke {
  const x = j as Partial<Joke>;
  return !!(
    x &&
    typeof x.id === 'string' &&
    typeof x.show === 'string' &&
    typeof x.title === 'string' &&
    typeof x.setup === 'string' &&
    typeof x.punchline === 'string' &&
    Array.isArray(x.factors) &&
    typeof x.analysis === 'string'
  );
}

function loadImported(): Joke[] {
  try {
    const raw = localStorage.getItem(IMPORT_KEY);
    const arr = raw ? (JSON.parse(raw) as Joke[]) : [];
    return Array.isArray(arr) ? arr.filter(isValidJoke) : [];
  } catch {
    return [];
  }
}

function saveImported(list: Joke[]) {
  try {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

interface ComedyStore {
  jokes: Joke[];
  loaded: boolean;
  activeId: string | null;
  revealed: boolean;
  phase: Phase;
  guess: ComedyFactor[];
  status: string;

  init: () => void;
  selectJoke: (id: string) => void;
  exitJoke: () => void;
  reveal: () => void;
  startQuiz: () => void;
  toggleFactor: (k: ComedyFactor) => void;
  submitQuiz: () => void;
  replay: () => void;
  copyPrompt: () => Promise<void>;
  importFile: (file: File) => Promise<void>;
}

export const useComedyStore = create<ComedyStore>((set, get) => ({
  jokes: [],
  loaded: false,
  activeId: null,
  revealed: false,
  phase: 'read',
  guess: [],
  status: '',

  init() {
    if (get().loaded) return;
    const imported = loadImported();
    const builtinIds = new Set(BUILTIN_JOKES.map((j) => j.id));
    const jokes = [...imported.filter((j) => !builtinIds.has(j.id)), ...BUILTIN_JOKES];
    set({ jokes, loaded: true });
  },

  selectJoke(id) {
    if (!get().jokes.some((j) => j.id === id)) return;
    set({ activeId: id, revealed: false, phase: 'read', guess: [] });
  },

  exitJoke() {
    set({ activeId: null, revealed: false, phase: 'read', guess: [] });
  },

  reveal() {
    set({ revealed: true });
  },

  startQuiz() {
    set({ phase: 'quiz', revealed: true });
  },

  toggleFactor(k) {
    const g = get().guess;
    set({ guess: g.includes(k) ? g.filter((x) => x !== k) : [...g, k] });
  },

  submitQuiz() {
    set({ phase: 'result' });
  },

  replay() {
    set({ revealed: false, phase: 'read', guess: [] });
  },

  async copyPrompt() {
    try {
      await navigator.clipboard.writeText(COMEDY_PROMPT);
      set({ status: '✓ 采集指令已复制' });
    } catch {
      set({ status: '复制失败,请手动选择' });
    }
    setTimeout(() => set({ status: '' }), 2600);
  },

  async importFile(file) {
    try {
      const data = JSON.parse(await file.text()) as unknown;
      const incoming = (Array.isArray(data) ? data : [data]).filter(isValidJoke);
      if (!incoming.length) {
        set({ status: '没有找到可用的笑点(检查 JSON 结构)' });
        setTimeout(() => set({ status: '' }), 3200);
        return;
      }
      const builtinIds = new Set(BUILTIN_JOKES.map((j) => j.id));
      const prev = loadImported().filter((j) => !incoming.some((n) => n.id === j.id));
      const next = [...incoming.filter((j) => !builtinIds.has(j.id)), ...prev];
      saveImported(next);
      set({ jokes: [...next, ...BUILTIN_JOKES], status: `✓ 导入 ${incoming.length} 个笑点` });
      setTimeout(() => set({ status: '' }), 2600);
    } catch (e) {
      set({ status: '导入失败:' + ((e as Error).message || 'JSON 解析错误') });
      setTimeout(() => set({ status: '' }), 3600);
    }
  },
}));
