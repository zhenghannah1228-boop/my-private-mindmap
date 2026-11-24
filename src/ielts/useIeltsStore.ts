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

const BUILTIN_IDS = new Set(BUILTIN_WRONG_QUESTIONS.map((j) => j.id));

/**
 * 合并内置题与本地存的题:非内置 id 的自定义/导入题排在前面;
 * 内置题按原顺序排列,但如果本地存里有同 id 的版本(编辑过的内置题)就用那个覆盖。
 */
function mergeItems(stored: WrongQuestion[]): WrongQuestion[] {
  const overrides = new Map(stored.map((j) => [j.id, j]));
  return [
    ...stored.filter((j) => !BUILTIN_IDS.has(j.id)),
    ...BUILTIN_WRONG_QUESTIONS.map((b) => overrides.get(b.id) ?? b),
  ];
}

export interface QtypeKey {
  skill: IeltsSkill;
  qtype: string;
}

interface IeltsStore {
  items: WrongQuestion[];
  loaded: boolean;
  activeSkill: IeltsSkill | null; // null = 全部
  onlyUnmastered: boolean;
  activeQtype: QtypeKey | null; // 当前展开的题型合集
  activeId: string | null;
  revealed: boolean;
  phase: Phase;
  guess: ErrorTag[];
  mastered: Set<string>;
  status: string;
  creating: boolean;
  editingId: string | null; // null = 新建,非空 = 正在编辑该 id 的题
  draftId: string;
  draft: Draft;
  createError: string;
  images: Record<string, string>; // questionId -> IndexedDB blobId

  init: () => void;
  setSkill: (s: IeltsSkill | null) => void;
  toggleOnlyUnmastered: () => void;
  selectQtype: (skill: IeltsSkill, qtype: string) => void;
  exitQtype: () => void;
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
  startEdit: (id: string) => void;
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
  activeQtype: null,
  activeId: null,
  revealed: false,
  phase: 'read',
  guess: [],
  mastered: new Set(),
  status: '',
  creating: false,
  editingId: null,
  draftId: '',
  draft: EMPTY_DRAFT,
  createError: '',
  images: {},

  init() {
    if (get().loaded) return;
    set({ items: mergeItems(loadImported()), mastered: loadMastered(), images: loadImages(), loaded: true });
  },

  setSkill(s) {
    set({ activeSkill: s, activeQtype: null });
  },
  toggleOnlyUnmastered() {
    set((st) => ({ onlyUnmastered: !st.onlyUnmastered }));
  },

  selectQtype(skill, qtype) {
    set({ activeQtype: { skill, qtype }, activeId: null });
  },

  exitQtype() {
    set({ activeQtype: null });
  },

  selectItem(id) {
    const item = get().items.find((j) => j.id === id);
    if (!item) return;
    set({
      activeId: id,
      activeQtype: { skill: item.skill, qtype: item.qtype },
      revealed: false,
      phase: 'read',
      guess: [],
    });
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
      const prev = loadImported().filter((j) => !incoming.some((n) => n.id === j.id));
      const next = [...incoming, ...prev];
      saveImported(next);
      set({ items: mergeItems(next), status: `✓ 导入 ${incoming.length} 道错题` });
      setTimeout(() => set({ status: '' }), 2600);
    } catch (e) {
      set({ status: '导入失败:' + ((e as Error).message || 'JSON 解析错误') });
      setTimeout(() => set({ status: '' }), 3600);
    }
  },

  startCreate() {
    set({ creating: true, editingId: null, activeId: null, draftId: newId(), draft: EMPTY_DRAFT, createError: '' });
  },

  startEdit(id) {
    const item = get().items.find((j) => j.id === id);
    if (!item) return;
    set({
      creating: true,
      editingId: id,
      draftId: id,
      draft: {
        skill: item.skill,
        qtype: item.qtype,
        source: item.source || '',
        link: item.link || '',
        stem: item.stem,
        yourAnswer: item.yourAnswer || '',
        correctAnswer: item.correctAnswer,
        tags: [...item.tags],
        analysis: item.analysis,
      },
      createError: '',
    });
  },

  cancelCreate() {
    // 只在「全新创建还没保存」时清理孤儿图片;编辑已有题目时图片本就属于它,不清
    if (!get().editingId) {
      const id = get().draftId;
      const blobId = get().images[id];
      if (blobId) {
        void deleteImage(blobId);
        const images = { ...get().images };
        delete images[id];
        saveImages(images);
        set({ images });
      }
    }
    set({ creating: false, editingId: null, createError: '' });
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
    const editingId = get().editingId;
    const id = editingId || get().draftId || newId();
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
    const prev = loadImported().filter((j) => j.id !== id);
    const next = [item, ...prev];
    saveImported(next);
    set({
      items: mergeItems(next),
      creating: false,
      editingId: null,
      activeId: id,
      activeQtype: { skill: item.skill, qtype: item.qtype },
      revealed: false,
      phase: 'read',
      guess: [],
      status: editingId ? '✓ 已更新错题' : '✓ 已添加错题',
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
