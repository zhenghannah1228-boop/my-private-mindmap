import { create } from 'zustand';
import { BUILTIN_NETCOPY } from './builtin';
import type { NetCopy } from './types';

interface NetCopyStore {
  items: NetCopy[];
  category: string | null;
  lang: 'all' | 'zh' | 'en';
  query: string;
  setCategory: (c: string | null) => void;
  setLang: (l: 'all' | 'zh' | 'en') => void;
  setQuery: (q: string) => void;
  filtered: () => NetCopy[];
}

export const useNetCopyStore = create<NetCopyStore>((set, get) => ({
  items: BUILTIN_NETCOPY,
  category: null,
  lang: 'all',
  query: '',

  setCategory(c) { set({ category: c }); },
  setLang(l) { set({ lang: l }); },
  setQuery(q) { set({ query: q }); },

  filtered() {
    const { items, category, lang, query } = get();
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category && item.category !== category) return false;
      if (lang !== 'all' && item.lang !== lang) return false;
      if (q) {
        return (
          item.text.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.analysis.toLowerCase().includes(q)
        );
      }
      return true;
    });
  },
}));
