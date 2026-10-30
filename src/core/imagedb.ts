/**
 * IndexedDB:存思维导图贴画的图片二进制(与书籍库分开的独立库)。
 * doc 里只留贴画元数据 + blobId,真正的图片存这里,避免撑爆 localStorage / 云同步。
 * 原生 IDB 包一层 Promise,不引第三方依赖。
 */

const DB_NAME = 'mm_images';
const DB_VERSION = 1;
const STORE = 'images'; // { id: string, blob: Blob }

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
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
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export function newImageId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? 'img_' + crypto.randomUUID()
    : 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
}

export async function putImage(id: string, blob: Blob): Promise<void> {
  await tx('readwrite', (s) => s.put({ id, blob }));
}

export async function getImage(id: string): Promise<Blob | null> {
  const rec = (await tx('readonly', (s) => s.get(id))) as { id: string; blob: Blob } | undefined;
  return rec ? rec.blob : null;
}

export async function deleteImage(id: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(id));
  } catch {
    /* 清理失败无所谓,不阻塞 UI */
  }
}
