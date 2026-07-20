/**
 * 阅读库状态(与思维导图完全独立的第二个 store)。
 *
 * 数据来源合并:
 *  - 书架 shelves:localStorage(小,含默认预设)
 *  - 导入书:IndexedDB(二进制 + 元数据)
 *  - 仓库策展书:library/manifest.json(每周自动更新)
 */

import { create } from 'zustand';
import { allBookMetas, deleteBook as idbDelete, putBook } from './db';
import { loadManifest, manifestToBook } from './manifest';
import type { BookFormat, BookMeta, Shelf } from './types';

const SHELVES_KEY = 'mm_reading_shelves';
const PRESET_SHELVES = ['小说', '散文集', '诗歌', '电影', '音乐'];

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'x_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
}

function loadShelves(): Shelf[] {
  try {
    const raw = localStorage.getItem(SHELVES_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as Shelf[];
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {
    /* ignore */
  }
  return PRESET_SHELVES.map((name) => ({ id: newId(), name }));
}

function saveShelves(shelves: Shelf[]) {
  try {
    localStorage.setItem(SHELVES_KEY, JSON.stringify(shelves));
  } catch {
    /* ignore */
  }
}

function formatOf(name: string): BookFormat | null {
  const n = name.toLowerCase();
  if (n.endsWith('.epub')) return 'epub';
  if (n.endsWith('.pdf')) return 'pdf';
  if (n.endsWith('.txt')) return 'txt';
  return null;
}

/** 尽力从 EPUB 读取标题/作者;失败则用文件名兜底 */
async function epubMeta(blob: Blob, fallback: string): Promise<{ title: string; author?: string }> {
  try {
    const ePub = (await import('epubjs')).default;
    const buf = await blob.arrayBuffer();
    // epubjs 接受 ArrayBuffer
    const book = ePub(buf as ArrayBuffer);
    const md = (await book.loaded.metadata) as { title?: string; creator?: string };
    book.destroy();
    return { title: md.title || fallback, author: md.creator || undefined };
  } catch {
    return { title: fallback };
  }
}

export interface ReadingStore {
  shelves: Shelf[];
  activeShelfId: string;
  books: BookMeta[];
  openBookId: string | null;
  renamingShelfId: string | null;
  status: string;

  init: () => Promise<void>;
  switchShelf: (id: string) => void;
  addShelf: (name: string) => void;
  renameShelf: (id: string, name: string) => void;
  deleteShelf: (id: string) => void;
  setRenaming: (id: string | null) => void;

  importFiles: (files: FileList | File[]) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  openBook: (id: string | null) => void;
}

const initialShelves = loadShelves();

export const useReadingStore = create<ReadingStore>((set, get) => ({
  shelves: initialShelves,
  activeShelfId: initialShelves[0].id,
  books: [],
  openBookId: null,
  renamingShelfId: null,
  status: '',

  async init() {
    // 导入书(IDB)
    let books: BookMeta[] = [];
    try {
      books = await allBookMetas();
    } catch {
      /* ignore */
    }
    // 仓库策展书(manifest),按书架名匹配/自动建架
    const manifest = await loadManifest();
    if (manifest.length) {
      const shelves = [...get().shelves];
      const byName = new Map(shelves.map((s) => [s.name, s]));
      const repoBooks: BookMeta[] = [];
      for (const item of manifest) {
        let shelf = byName.get(item.shelf);
        if (!shelf) {
          shelf = { id: newId(), name: item.shelf };
          shelves.push(shelf);
          byName.set(item.shelf, shelf);
        }
        repoBooks.push(manifestToBook(item, shelf.id));
      }
      saveShelves(shelves);
      set({ shelves });
      books = [...repoBooks, ...books];
    }
    set({ books });
  },

  switchShelf(id) {
    set({ activeShelfId: id, renamingShelfId: null });
  },

  addShelf(name) {
    const shelf: Shelf = { id: newId(), name: name || '新书架' };
    const shelves = [...get().shelves, shelf];
    saveShelves(shelves);
    set({ shelves, activeShelfId: shelf.id, renamingShelfId: shelf.id });
  },

  renameShelf(id, name) {
    const shelves = get().shelves.map((s) => (s.id === id ? { ...s, name: name.trim() || '未命名' } : s));
    saveShelves(shelves);
    set({ shelves, renamingShelfId: null });
  },

  deleteShelf(id) {
    let shelves = get().shelves.filter((s) => s.id !== id);
    if (!shelves.length) shelves = [{ id: newId(), name: '新书架' }];
    saveShelves(shelves);
    const activeShelfId = get().activeShelfId === id ? shelves[0].id : get().activeShelfId;
    // 该书架下的导入书一并删除(repo 书只是清单,忽略)
    const doomed = get().books.filter((b) => b.shelfId === id && b.source === 'import');
    doomed.forEach((b) => idbDelete(b.id).catch(() => {}));
    set({
      shelves,
      activeShelfId,
      books: get().books.filter((b) => b.shelfId !== id),
      renamingShelfId: null,
    });
  },

  setRenaming(id) {
    set({ renamingShelfId: id });
  },

  async importFiles(files) {
    const list = Array.from(files);
    const shelfId = get().activeShelfId;
    let added = 0;
    for (const file of list) {
      const fmt = formatOf(file.name);
      if (!fmt) {
        set({ status: `跳过不支持的文件:${file.name}` });
        continue;
      }
      const fallback = file.name.replace(/\.(epub|pdf|txt)$/i, '');
      let title = fallback;
      let author: string | undefined;
      if (fmt === 'epub') {
        const m = await epubMeta(file, fallback);
        title = m.title;
        author = m.author;
      }
      const meta: BookMeta = {
        id: newId(),
        shelfId,
        title,
        author,
        format: fmt,
        source: 'import',
        addedAt: Date.now(),
      };
      try {
        await putBook(meta, file);
        set({ books: [meta, ...get().books] });
        added++;
      } catch (e) {
        set({ status: `导入失败:${(e as Error).message}` });
      }
    }
    if (added) set({ status: `已导入 ${added} 个文件` });
  },

  async removeBook(id) {
    const book = get().books.find((b) => b.id === id);
    if (!book) return;
    if (book.source === 'import') await idbDelete(id).catch(() => {});
    set({ books: get().books.filter((b) => b.id !== id) });
  },

  openBook(id) {
    set({ openBookId: id });
  },
}));
