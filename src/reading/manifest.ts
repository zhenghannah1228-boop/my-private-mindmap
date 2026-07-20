/**
 * 仓库策展清单加载。应用启动时从站点静态资源拉 library/manifest.json,
 * 这些是我每周提交进仓库的公版作品(见 scripts/ 与定时任务)。
 *
 * import.meta.env.BASE_URL 保证在 GitHub Pages 子路径下也能取对路径。
 */

import type { BookMeta, ManifestItem } from './types';

const base = import.meta.env.BASE_URL || '/';

export async function loadManifest(): Promise<ManifestItem[]> {
  try {
    const res = await fetch(`${base}library/manifest.json`, { cache: 'no-cache' });
    if (!res.ok) return [];
    const data = (await res.json()) as ManifestItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return []; // 没有清单也不报错(首次或离线)
  }
}

/** repo 书文件的可 fetch 完整路径 */
export function repoFileUrl(file: string): string {
  return `${base}library/${file}`;
}

/** 把清单项转成 BookMeta(id 用稳定的 repo: 前缀,便于去重) */
export function manifestToBook(item: ManifestItem, shelfId: string): BookMeta {
  return {
    id: 'repo:' + item.file,
    shelfId,
    title: item.title,
    author: item.author,
    format: item.format,
    source: 'repo',
    addedAt: 0,
    file: item.file,
    note: item.note,
  };
}
