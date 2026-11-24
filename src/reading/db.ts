/**
 * IndexedDB:存导入书的二进制文件 + 元数据 + 阅读进度。
 * 用原生 IDB 包一层 Promise,不引第三方依赖。
 */

import type { BookMeta } from './types';

const DB_NAME = 'mm_reading';
const DB_VERSION = 1;
const STORE_BOOKS = 'books'; // { meta: BookMeta, blob: Blob }, keyPath meta.id

interface BookRecord {
  id: string;
  meta: BookMeta;
  blob: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE_BOOKS, mode);
        const req = fn(t.objectStore(STORE_BOOKS));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export async function putBook(meta: BookMeta, blob: Blob): Promise<void> {
  const rec: BookRecord = { id: meta.id, meta, blob };
  await tx('readwrite', (s) => s.put(rec));
}

export async function getBookBlob(id: string): Promise<Blob | null> {
  const rec = (await tx('readonly', (s) => s.get(id))) as BookRecord | undefined;
  return rec ? rec.blob : null;
}

export async function deleteBook(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}

export async function allBookMetas(): Promise<BookMeta[]> {
  const recs = (await tx('readonly', (s) => s.getAll())) as BookRecord[];
  return recs.map((r) => r.meta);
}
