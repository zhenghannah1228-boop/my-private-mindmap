/**
 * 持久化 + 自动同步的副作用编排。
 *
 * 订阅作品库相关状态(doc / view / spaces / activeId)的变化:
 *  - 防抖写 localStorage(整个作品库快照)
 *  - 若开启自动同步,延迟推送云端(2500ms,连续拖拽时不刷爆请求)
 *  - beforeunload 时强制 flush,避免最后一次改动丢失
 */

import { saveLibrary, saveSyncKey } from '../core/storage';
import { push } from '../sync/supabase';
import { useStore } from './useStore';

const AUTO_SYNC_DELAY = 2500;

export function installPersistence(): () => void {
  let autoTimer: ReturnType<typeof setTimeout> | null = null;

  const flushAutoSync = async () => {
    const { ui } = useStore.getState();
    if (!ui.autoSync || !ui.syncKey) return;
    try {
      useStore.getState().setSyncMsg('自动同步中…');
      await push(ui.syncKey, useStore.getState().snapshot());
      useStore.getState().setSyncMsg('✓ 已自动同步 ' + new Date().toTimeString().slice(0, 5));
    } catch (e) {
      useStore.getState().setSyncMsg((e as Error).message || '同步失败');
    }
  };

  // 作品库任一部分变化 → 存盘 + 排队自动同步
  const unsub = useStore.subscribe((state, prev) => {
    const changed =
      state.doc !== prev.doc ||
      state.view !== prev.view ||
      state.spaces !== prev.spaces ||
      state.activeId !== prev.activeId;
    if (!changed) return;

    saveLibrary(state.snapshot(), {
      onSaved: (ok) =>
        useStore
          .getState()
          .setStatus(ok ? '本地已存 ' + new Date().toTimeString().slice(0, 5) : '保存失败'),
    });

    if (state.ui.autoSync) {
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = setTimeout(flushAutoSync, AUTO_SYNC_DELAY);
    }
  });

  // 同步码变化 → 持久化
  const unsubKey = useStore.subscribe((state, prev) => {
    if (state.ui.syncKey !== prev.ui.syncKey && state.ui.syncKey) {
      saveSyncKey(state.ui.syncKey);
    }
  });

  const onUnload = () => {
    saveLibrary(useStore.getState().snapshot(), { immediate: true });
  };
  window.addEventListener('beforeunload', onUnload);

  return () => {
    unsub();
    unsubKey();
    window.removeEventListener('beforeunload', onUnload);
    if (autoTimer) clearTimeout(autoTimer);
  };
}
