/**
 * 应用级顶层状态:当前模式(阅读 / 思维导图)。
 * 独立于两个功能模块,仅管一个 mode 开关,持久化到 localStorage。
 */

import { create } from 'zustand';

export type AppMode = 'reading' | 'discover' | 'mindmap' | 'meme' | 'comedy';

const MODE_KEY = 'mm_mode';

function loadMode(): AppMode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    if (m === 'mindmap' || m === 'discover' || m === 'meme' || m === 'comedy') return m;
    return 'reading';
  } catch {
    return 'reading';
  }
}

interface AppStore {
  mode: AppMode;
  setMode: (m: AppMode) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  mode: loadMode(),
  setMode(m) {
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* ignore */
    }
    set({ mode: m });
  },
}));
