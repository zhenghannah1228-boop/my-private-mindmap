/**
 * 每日发现状态:加载 feed.json、按类别过滤、复制采集指令。
 */

import { create } from 'zustand';
import { COLLECT_PROMPT, type FeedCard } from './types';
import { pickSurprise } from './surprise';

const base = import.meta.env.BASE_URL || '/';

interface DiscoverStore {
  cards: FeedCard[];
  activeCat: string | null; // null = 全部
  loaded: boolean;
  status: string;
  query: string;
  init: () => Promise<void>;
  setCat: (c: string | null) => void;
  setQuery: (q: string) => void;
  copyPrompt: () => Promise<void>;
  surprise: () => void;
}

export const useDiscoverStore = create<DiscoverStore>((set, get) => ({
  cards: [],
  activeCat: null,
  loaded: false,
  status: '',
  query: '',

  setQuery(q) {
    set({ query: q });
  },

  async init() {
    if (get().loaded) return;
    try {
      const res = await fetch(`${base}daily/feed.json`, { cache: 'no-cache' });
      const data = res.ok ? ((await res.json()) as FeedCard[]) : [];
      // 按日期倒序(新在前);同日保持原顺序
      const cards = (Array.isArray(data) ? data : [])
        .filter((c) => c && c.title)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      set({ cards, loaded: true });
    } catch {
      set({ cards: [], loaded: true });
    }
  },

  setCat(c) {
    set({ activeCat: c });
  },

  async copyPrompt() {
    try {
      await navigator.clipboard.writeText(COLLECT_PROMPT);
      set({ status: '✓ 采集指令已复制' });
    } catch {
      set({ status: '复制失败,请手动选择' });
    }
    setTimeout(() => set({ status: '' }), 2600);
  },

  surprise() {
    const site = pickSurprise();
    // 用户点击触发,新标签页打开(不会被拦截),不丢掉当前应用
    window.open(site.url, '_blank', 'noopener,noreferrer');
    set({ status: '🎲 ' + site.label });
    setTimeout(() => set({ status: '' }), 3200);
  },
}));
