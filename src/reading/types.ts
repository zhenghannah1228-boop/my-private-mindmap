/**
 * 阅读库类型。与思维导图完全独立的第二个模块。
 *
 * - 作品文件(PDF/EPUB 二进制)存 IndexedDB(localStorage 装不下)。
 * - 书架 shelves 与「导入书」元数据存 localStorage(小)。
 * - 仓库策展书(source:'repo')不落 IDB,按需 fetch 静态文件。
 */

export type BookFormat = 'epub' | 'pdf' | 'txt';

export interface Shelf {
  id: string;
  name: string;
}

export interface BookMeta {
  id: string;
  shelfId: string;
  title: string;
  author?: string;
  format: BookFormat;
  /** import = 用户导入(blob 在 IDB);repo = 仓库策展(按 file 路径 fetch) */
  source: 'import' | 'repo';
  addedAt: number;
  /** repo 书:相对站点根的文件路径,如 library/xxx.epub */
  file?: string;
  /** 一句话简介 / 推荐语(repo 书常有) */
  note?: string;
}

/** 仓库清单条目(public/library/manifest.json) */
export interface ManifestItem {
  shelf: string; // 书架名(按名称匹配/自动创建)
  title: string;
  author?: string;
  format: BookFormat;
  file: string; // 相对 library/ 的路径,如 tangshi.epub
  note?: string;
}
