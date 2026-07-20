/**
 * 阅读库界面:左侧书架导航 + 右侧作品网格 + 导入。点击作品打开阅读器。
 * 与思维导图完全分开的独立界面。
 */

import { useEffect, useRef, useState } from 'react';
import { Reader } from './Reader';
import { useReadingStore } from './useReadingStore';

function ShelfRow({ id }: { id: string }) {
  const shelf = useReadingStore((s) => s.shelves.find((x) => x.id === id))!;
  const active = useReadingStore((s) => s.activeShelfId === id);
  const renaming = useReadingStore((s) => s.renamingShelfId === id);
  const count = useReadingStore((s) => s.books.filter((b) => b.shelfId === id).length);
  const total = useReadingStore((s) => s.shelves.length);
  const switchShelf = useReadingStore((s) => s.switchShelf);
  const renameShelf = useReadingStore((s) => s.renameShelf);
  const deleteShelf = useReadingStore((s) => s.deleteShelf);
  const setRenaming = useReadingStore((s) => s.setRenaming);

  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(shelf.name);
  useEffect(() => {
    if (renaming) {
      setDraft(shelf.name);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming, shelf.name]);

  if (renaming) {
    return (
      <div className="navitem renaming">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') renameShelf(id, draft);
            else if (e.key === 'Escape') setRenaming(null);
          }}
          onBlur={() => renameShelf(id, draft)}
        />
      </div>
    );
  }

  return (
    <div
      className={'navitem' + (active ? ' on' : '')}
      onClick={() => switchShelf(id)}
      onDoubleClick={() => setRenaming(id)}
      title="点击切换 · 双击重命名"
    >
      <span className="nm">{shelf.name}</span>
      {count > 0 && <span className="cnt">{count}</span>}
      <span
        className="del"
        title="删除书架"
        onClick={(e) => {
          e.stopPropagation();
          if (total <= 1) return alert('至少保留一个书架');
          if (confirm(`删除书架「${shelf.name}」及其导入的书?(仓库策展书不受影响)`)) deleteShelf(id);
        }}
      >
        ×
      </span>
    </div>
  );
}

const FMT_LABEL: Record<string, string> = { epub: 'EPUB', pdf: 'PDF', txt: 'TXT' };

export function ReadingLibrary() {
  const shelfIds = useReadingStore((s) => s.shelves.map((x) => x.id));
  const activeShelfId = useReadingStore((s) => s.activeShelfId);
  const books = useReadingStore((s) => s.books);
  const openBookId = useReadingStore((s) => s.openBookId);
  const status = useReadingStore((s) => s.status);
  const addShelf = useReadingStore((s) => s.addShelf);
  const importFiles = useReadingStore((s) => s.importFiles);
  const removeBook = useReadingStore((s) => s.removeBook);
  const openBook = useReadingStore((s) => s.openBook);
  const init = useReadingStore((s) => s.init);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void init();
  }, [init]);

  const shelfBooks = books.filter((b) => b.shelfId === activeShelfId);
  const openBookMeta = openBookId ? books.find((b) => b.id === openBookId) ?? null : null;

  return (
    <div id="reading">
      <div id="side">
        <div className="sh">
          阅读书架
          <a onClick={() => addShelf('新书架')} title="新增书架">
            ＋ 新增
          </a>
        </div>
        <div id="nav">
          {shelfIds.map((id) => (
            <ShelfRow key={id} id={id} />
          ))}
        </div>
        <div id="reading-foot">
          <button className="import-btn" onClick={() => fileRef.current?.click()}>
            ＋ 导入 EPUB / PDF / TXT
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".epub,.pdf,.txt"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.length) importFiles(e.target.files);
              e.target.value = '';
            }}
          />
          {status && <div className="reading-status">{status}</div>}
        </div>
      </div>

      <div id="reading-main">
        {shelfBooks.length === 0 ? (
          <div className="empty">
            这个书架还没有作品。
            <br />
            点左下角「导入」添加你的 EPUB / PDF,或等每周自动更新的公版作品。
          </div>
        ) : (
          <div className="book-grid">
            {shelfBooks.map((b) => (
              <div className="book-card" key={b.id} onClick={() => openBook(b.id)}>
                <div className={'cover fmt-' + b.format}>
                  <span className="badge">{FMT_LABEL[b.format] || b.format}</span>
                  {b.source === 'repo' && <span className="repo-tag">公版</span>}
                </div>
                <div className="bt" title={b.title}>
                  {b.title}
                </div>
                {b.author && <div className="ba">{b.author}</div>}
                {b.note && <div className="bn">{b.note}</div>}
                <span
                  className="bdel"
                  title={b.source === 'repo' ? '策展书无法删除' : '删除'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (b.source === 'repo') return;
                    if (confirm(`从书架移除「${b.title}」?`)) removeBook(b.id);
                  }}
                  style={{ opacity: b.source === 'repo' ? 0.25 : undefined }}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {openBookMeta && <Reader book={openBookMeta} onClose={() => openBook(null)} />}
    </div>
  );
}
