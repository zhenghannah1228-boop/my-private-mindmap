/**
 * 雅思错题集状态:载入错题(内置 + 导入)、按技能筛选、揭晓答案、错因推理结局、
 * 标记是否已掌握。导入的错题和「已掌握」状态都存 localStorage,与其它模块数据独立。
 */

import { create } from 'zustand';
import { BUILTIN_WRONG_QUESTIONS } from './builtin';
import { IELTS_PROMPT, type ErrorTag, type IeltsSkill, type WrongQuestion } from './types';

const IMPORT_KEY = 'mm_ielts_imported';
const MASTERED_KEY = 'mm_ielts_mastered';

type Phase = 'read' | 'quiz' | 'result';

export function isValidWrongQuestion(j: unknown): j is WrongQuestion {
  const x = j as Partial<WrongQuestion>;
  return !!(
    x &&
    typeof x.id === 'string' &&
    (x.skill === 'listening' || x.skill === 'reading' || x.skill === 'writing' || x.skill === 'speaking') &&
    typeof x.qtype === 'string' &&
    typeof x.stem === 'string' &&
    typeof x.correctAnswer === 'string' &&
    Array.isArray(x.tags) &&
    typeof x.analysis === 'string'
  );
}

function loadImported(): WrongQuestion[] {
  try {
    const raw = localStorage.getItem(IMPORT_KEY);
    const arr = raw ? (JSON.parse(raw) as WrongQuestion[]) : [];
    return Array.isArray(arr) ? arr.filter(isValidWrongQuestion) : [];
  } catch {
    return [];
  }
}

function saveImported(list: WrongQuestion[]) {
  try {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function loadMastered(): Set<string> {
  try {
    const raw = localStorage.getItem(MASTERED_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveMastered(s: Set<string>) {
  try {
    localStorage.setItem(MASTERED_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

interface IeltsStore {
  items: WrongQuestion[];
  loaded: boolean;
  activeSkill: IeltsSkill | null; // null = 全部
  onlyUnmastered: boolean;
  activeId: string | null;
  revealed: boolean;
  phase: Phase;
  guess: ErrorTag[];
  mastered: Set<string>;
  status: string;

  init: () => void;
  setSkill: (s: IeltsSkill | null) => void;
  toggleOnlyUnmastered: () => void;
  selectItem: (id: string) => void;
  exitItem: () => void;
  reveal: () => void;
  startQuiz: () => void;
  toggleTag: (k: ErrorTag) => void;
  submitQuiz: () => void;
  replay: () => void;
  toggleMastered: (id: string) => void;
  copyPrompt: () => Promise<void>;
  importFile: (file: File) => Promise<void>;
}

export const useIeltsStore = create<IeltsStore>((set, get) => ({
  items: [],
  loaded: false,
  activeSkill: null,
  onlyUnmastered: false,
  activeId: null,
  revealed: false,
  phase: 'read',
  guess: [],
  mastered: new Set(),
  status: '',

  init() {
    if (get().loaded) return;
    const imported = loadImported();
    const builtinIds = new Set(BUILTIN_WRONG_QUESTIONS.map((j) => j.id));
    const items = [...imported.filter((j) => !builtinIds.has(j.id)), ...BUILTIN_WRONG_QUESTIONS];
    set({ items, mastered: loadMastered(), loaded: true });
  },

  setSkill(s) {
    set({ activeSkill: s });
  },
  toggleOnlyUnmastered() {
    set((st) => ({ onlyUnmastered: !st.onlyUnmastered }));
  },

  selectItem(id) {
    if (!get().items.some((j) => j.id === id)) return;
    set({ activeId: id, revealed: false, phase: 'read', guess: [] });
  },

  exitItem() {
    set({ activeId: null, revealed: false, phase: 'read', guess: [] });
  },

  reveal() {
    set({ revealed: true });
  },

  startQuiz() {
    set({ phase: 'quiz', revealed: true });
  },

  toggleTag(k) {
    const g = get().guess;
    set({ guess: g.includes(k) ? g.filter((x) => x !== k) : [...g, k] });
  },

  submitQuiz() {
    set({ phase: 'result' });
  },

  replay() {
    set({ revealed: false, phase: 'read', guess: [] });
  },

  toggleMastered(id) {
    const m = new Set(get().mastered);
    if (m.has(id)) m.delete(id);
    else m.add(id);
    saveMastered(m);
    set({ mastered: m });
  },

  async copyPrompt() {
    try {
      await navigator.clipboard.writeText(IELTS_PROMPT);
      set({ status: '✓ 采集指令已复制' });
    } catch {
      set({ status: '复制失败,请手动选择' });
    }
    setTimeout(() => set({ status: '' }), 2600);
  },

  async importFile(file) {
    try {
      const data = JSON.parse(await file.text()) as unknown;
      const incoming = (Array.isArray(data) ? data : [data]).filter(isValidWrongQuestion);
      if (!incoming.length) {
        set({ status: '没有找到可用的错题(检查 JSON 结构)' });
        setTimeout(() => set({ status: '' }), 3200);
        return;
      }
      const builtinIds = new Set(BUILTIN_WRONG_QUESTIONS.map((j) => j.id));
      const prev = loadImported().filter((j) => !incoming.some((n) => n.id === j.id));
      const next = [...incoming.filter((j) => !builtinIds.has(j.id)), ...prev];
      saveImported(next);
      set({ items: [...next, ...BUILTIN_WRONG_QUESTIONS], status: `✓ 导入 ${incoming.length} 道错题` });
      setTimeout(() => set({ status: '' }), 2600);
    } catch (e) {
      set({ status: '导入失败:' + ((e as Error).message || 'JSON 解析错误') });
      setTimeout(() => set({ status: '' }), 3600);
    }
  },
}));
