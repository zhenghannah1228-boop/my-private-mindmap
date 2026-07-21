/**
 * 阅读库界面:左侧书架导航 + 右侧作品网格 + 导入。点击作品打开阅读器。
 * 与思维导图完全分开的独立界面。
 */

import { useEffect, useRef, useState } from 'react';
import { Reader } from './Reader';
import { useReadingStore } from './useReadingStore';
import { BookDoodle, Sparkle, Squiggle } from '../ui/doodles';

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

/** 按书名生成稳定的封面配色索引(0–7),让书架色彩雅致而有变化 */
function coverIndex(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 8;
}

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

  const query = useReadingStore((s) => s.query);
  const q = query.trim().toLowerCase();
  // 搜索时跨所有书架匹配书名/作者;否则只看当前书架
  const shelfBooks = q
    ? books.filter((b) => (b.title + ' ' + (b.author || '')).toLowerCase().includes(q))
    : books.filter((b) => b.shelfId === activeShelfId);
  const openBookMeta = openBookId ? books.find((b) => b.id === openBookId) ?? null : null;
  const activeShelf = useReadingStore((s) => s.shelves.find((x) => x.id === s.activeShelfId));

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
        <div className="lib-head">
          <h2>
            {q ? `搜索「${query.trim()}」` : activeShelf?.name ?? '书架'}
            <Sparkle className="head-sparkle" />
            <Squiggle className="head-squiggle" />
          </h2>
          <span className="lib-count">{shelfBooks.length} 部作品</span>
        </div>

        {shelfBooks.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">{q ? '🔍' : <BookDoodle className="doodle" />}</div>
            {q ? '没有匹配的作品' : '这个书架还没有作品'}
            <div className="empty-sub">
              {q
                ? '换个关键词试试,或清空搜索框'
                : '点左下角「导入」添加你的 EPUB / PDF / TXT,或等每周自动更新的公版作品'}
            </div>
          </div>
        ) : (
          <div className="book-grid">
            {shelfBooks.map((b) => (
              <div className="book" key={b.id} onClick={() => openBook(b.id)}>
                <div className={'cover cover-' + coverIndex(b.title)}>
                  <span className="spine" />
                  <div className="cover-tags">
                    <span className="fmt-badge">{FMT_LABEL[b.format] || b.format}</span>
                    {b.source === 'repo' && <span className="pub-tag">公版</span>}
                  </div>
                  <div className="cover-title" title={b.title}>
                    {b.title}
                  </div>
                  {b.author && <div className="cover-author">{b.author}</div>}
                  <button
                    className="bdel"
                    title="删除这本书"
                    onClick={(e) => {
                      e.stopPropagation();
                      const msg =
                        b.source === 'repo'
                          ? `从书架移除公版书「${b.title}」?(之后不会再自动出现)`
                          : `删除「${b.title}」?此操作不可撤销。`;
                      if (confirm(msg)) removeBook(b.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
                {b.note && <div className="book-note">{b.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {openBookMeta && <Reader book={openBookMeta} onClose={() => openBook(null)} />}
    </div>
  );
}
