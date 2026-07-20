/**
 * 持久化 + 自动同步的副作用编排。
 *
 * 订阅 store.doc 的变化:
 *  - 防抖写 localStorage(saveDoc 内部 300ms 防抖)
 *  - 若开启自动同步,延迟推送云端(2500ms,连续拖拽时不刷爆请求)
 *  - beforeunload 时强制 flush 一次,避免最后一次改动丢失
 *
 * 放在 store 之外、由 App 启动时安装一次 —— action 保持纯粹。
 */

import { saveDoc, saveSyncKey } from '../core/storage';
import { push } from '../sync/supabase';
import { useStore } from './useStore';

const AUTO_SYNC_DELAY = 2500;

export function installPersistence(): () => void {
  let autoTimer: ReturnType<typeof setTimeout> | null = null;

  const flushAutoSync = async () => {
    const { doc, ui } = useStore.getState();
    if (!ui.autoSync || !ui.syncKey) return;
    try {
      useStore.getState().setSyncMsg('自动同步中…');
      await push(ui.syncKey, doc);
      useStore.getState().setSyncMsg('✓ 已自动同步 ' + new Date().toTimeString().slice(0, 5));
    } catch (e) {
      useStore.getState().setSyncMsg((e as Error).message || '同步失败');
    }
  };

  // doc 变化 → 存盘 + 排队自动同步
  const unsub = useStore.subscribe((state, prev) => {
    if (state.doc === prev.doc) return;
    saveDoc(state.doc, {
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
    saveDoc(useStore.getState().doc, { immediate: true });
  };
  window.addEventListener('beforeunload', onUnload);

  return () => {
    unsub();
    unsubKey();
    window.removeEventListener('beforeunload', onUnload);
    if (autoTimer) clearTimeout(autoTimer);
  };
}
