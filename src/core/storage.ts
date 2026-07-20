/**
 * 本地持久化(移植自 handoff/storage.js)。
 *
 * 已知坑:localStorage 作用域是 origin。用 file:// 打开时 Chrome 把每个文件路径
 * 当独立 origin —— 换个副本数据就「没了」。**正式版部署到域名(Vercel)根治**,
 * 这正是 P0 迁移的理由之一(见 vercel.json)。
 *
 * - localStorage 有 5MB 上限。纯文本节点够用几万个;将来加图片必须换 IndexedDB。
 * - 写入同步阻塞,所以 saveDoc 做了防抖。
 */

import { normalizeDoc } from './model';
import type { Doc } from './types';

const DOC_KEY = 'mm_v2';
const SYNC_KEY = 'mm_key';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** 防抖写入。immediate=true 用于 beforeunload 等必须立刻落盘的场景 */
export function saveDoc(
  doc: Doc,
  opts: { immediate?: boolean; onSaved?: (ok: boolean, err?: unknown) => void } = {}
): void {
  const { immediate = false, onSaved } = opts;
  const write = () => {
    try {
      localStorage.setItem(DOC_KEY, JSON.stringify(doc));
      onSaved?.(true);
    } catch (e) {
      // 常见原因:超出配额,或隐私模式禁用了 localStorage
      console.error('保存失败', e);
      onSaved?.(false, e);
    }
  };

  if (saveTimer) clearTimeout(saveTimer);
  if (immediate) write();
  else saveTimer = setTimeout(write, 300);
}

export function loadDoc(): Doc {
  let raw: Partial<Doc> | null = null;
  try {
    const s = localStorage.getItem(DOC_KEY);
    if (s) raw = JSON.parse(s);
  } catch (e) {
    console.error('读取失败,使用空文档', e);
  }
  return normalizeDoc(raw);
}

export function saveSyncKey(key: string): void {
  try {
    localStorage.setItem(SYNC_KEY, key);
  } catch {
    /* ignore */
  }
}

export function loadSyncKey(): string {
  try {
    return localStorage.getItem(SYNC_KEY) || '';
  } catch {
    return '';
  }
}

/** 导出为文件下载 */
export function exportJson(doc: Doc): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mindmap-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * 读取导入文件为原始 Doc(仅解析,不落盘)。
 * 二次确认与「合并 vs 覆盖」的决策交给调用方(store.importDoc) —— 见「不要丢数据」约束。
 */
export function readJsonFile(file: File): Promise<Partial<Doc>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error('文件格式错误'));
      }
    };
    reader.onerror = () => reject(new Error('读取失败'));
    reader.readAsText(file);
  });
}
