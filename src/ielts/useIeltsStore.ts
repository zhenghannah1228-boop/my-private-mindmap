/**
 * 雅思错题集状态:载入错题(内置 + 导入)、按技能筛选、揭晓答案、错因推理结局、
 * 标记是否已掌握。导入的错题和「已掌握」状态都存 localStorage,与其它模块数据独立。
 */

import { create } from 'zustand';
import { BUILTIN_WRONG_QUESTIONS } from './builtin';
import { IELTS_PROMPT, type ErrorTag, type IeltsSkill, type WrongQuestion } from './types';
import { deleteImage, newImageId, putImage } from '../core/imagedb';

const IMPORT_KEY = 'mm_ielts_imported';
const MASTERED_KEY = 'mm_ielts_mastered';
const IMAGE_KEY = 'mm_ielts_images'; // { questionId: blobId }

type Phase = 'read' | 'quiz' | 'result';

interface Draft {
  skill: IeltsSkill;
  qtype: string;
  source: string;
  link: string;
  stem: string;
  yourAnswer: string;
  correctAnswer: string;
  tags: ErrorTag[];
  analysis: string;
}

const EMPTY_DRAFT: Draft = {
  skill: 'listening',
  qtype: '',
  source: '',
  link: '',
  stem: '',
  yourAnswer: '',
  correctAnswer: '',
  tags: [],
  analysis: '',
};

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'manual-' + crypto.randomUUID();
  }
  return 'manual-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

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

function loadImages(): Record<string, string> {
  try {
    const raw = localStorage.getItem(IMAGE_KEY);
    const o = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
}

function saveImages(m: Record<string, string>) {
  try {
    localStorage.setItem(IMAGE_KEY, JSON.stringify(m));
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
  creating: boolean;
  draftId: string;
  draft: Draft;
  createError: string;
  images: Record<string, string>; // questionId -> IndexedDB blobId

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
  startCreate: () => void;
  cancelCreate: () => void;
  updateDraft: (patch: Partial<Draft>) => void;
  toggleDraftTag: (k: ErrorTag) => void;
  saveCreate: () => void;
  attachImage: (questionId: string, file: File) => Promise<void>;
  removeImage: (questionId: string) => void;
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
  creating: false,
  draftId: '',
  draft: EMPTY_DRAFT,
  createError: '',
  images: {},

  init() {
    if (get().loaded) return;
    const imported = loadImported();
    const builtinIds = new Set(BUILTIN_WRONG_QUESTIONS.map((j) => j.id));
    const items = [...imported.filter((j) => !builtinIds.has(j.id)), ...BUILTIN_WRONG_QUESTIONS];
    set({ items, mastered: loadMastered(), images: loadImages(), loaded: true });
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

  startCreate() {
    set({ creating: true, activeId: null, draftId: newId(), draft: EMPTY_DRAFT, createError: '' });
  },

  cancelCreate() {
    const id = get().draftId;
    const blobId = get().images[id];
    if (blobId) {
      void deleteImage(blobId);
      const images = { ...get().images };
      delete images[id];
      saveImages(images);
      set({ images });
    }
    set({ creating: false, createError: '' });
  },

  updateDraft(patch) {
    set((st) => ({ draft: { ...st.draft, ...patch }, createError: '' }));
  },

  toggleDraftTag(k) {
    const tags = get().draft.tags;
    set((st) => ({
      draft: { ...st.draft, tags: tags.includes(k) ? tags.filter((x) => x !== k) : [...tags, k] },
      createError: '',
    }));
  },

  saveCreate() {
    const d = get().draft;
    const qtype = d.qtype.trim();
    const stem = d.stem.trim();
    const correctAnswer = d.correctAnswer.trim();
    const analysis = d.analysis.trim();
    if (!qtype || !stem || !correctAnswer || !analysis) {
      set({ createError: '题型 / 原题 / 正确答案 / 解析都是必填项' });
      return;
    }
    if (!d.tags.length) {
      set({ createError: '至少选一个错因标签' });
      return;
    }
    const id = get().draftId || newId();
    const item: WrongQuestion = {
      id,
      skill: d.skill,
      qtype,
      source: d.source.trim() || undefined,
      link: d.link.trim() || undefined,
      stem,
      yourAnswer: d.yourAnswer.trim() || undefined,
      correctAnswer,
      tags: d.tags,
      analysis,
    };
    const builtinIds = new Set(BUILTIN_WRONG_QUESTIONS.map((j) => j.id));
    const prev = loadImported().filter((j) => !builtinIds.has(j.id));
    const next = [item, ...prev];
    saveImported(next);
    set({
      items: [...next, ...BUILTIN_WRONG_QUESTIONS],
      creating: false,
      activeId: id,
      revealed: false,
      phase: 'read',
      guess: [],
      status: '✓ 已添加错题',
    });
    setTimeout(() => set({ status: '' }), 2600);
  },

  async attachImage(questionId, file) {
    if (!file.type.startsWith('image/')) {
      set({ status: '请选图片文件' });
      setTimeout(() => set({ status: '' }), 2200);
      return;
    }
    try {
      const prev = get().images[questionId];
      const blobId = newImageId();
      await putImage(blobId, file);
      if (prev) void deleteImage(prev);
      const images = { ...get().images, [questionId]: blobId };
      saveImages(images);
      set({ images });
    } catch (e) {
      set({ status: '贴图失败:' + ((e as Error).message || '') });
      setTimeout(() => set({ status: '' }), 3000);
    }
  },

  removeImage(questionId) {
    const blobId = get().images[questionId];
    if (!blobId) return;
    void deleteImage(blobId);
    const images = { ...get().images };
    delete images[questionId];
    saveImages(images);
    set({ images });
  },
}));
