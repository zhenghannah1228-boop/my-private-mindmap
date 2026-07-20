/**
 * 阅读器覆盖层。支持 EPUB(epubjs)/ PDF(pdfjs)/ TXT。
 * 记住每本书上次阅读位置(EPUB 存 CFI,PDF 存页码)。
 */

import { useEffect, useRef, useState } from 'react';
import { getBookBlob } from './db';
import { repoFileUrl } from './manifest';
import type { BookMeta } from './types';

const posKey = (id: string) => 'mm_read_pos_' + id;

/** 按需加载 pdfjs(约 350kB),避免拖慢初始加载 */
async function loadPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjsLib;
}

async function resolveBlob(book: BookMeta): Promise<Blob> {
  if (book.source === 'repo' && book.file) {
    const res = await fetch(repoFileUrl(book.file));
    if (!res.ok) throw new Error('无法加载文件 ' + res.status);
    return res.blob();
  }
  const blob = await getBookBlob(book.id);
  if (!blob) throw new Error('文件不存在(可能已删除)');
  return blob;
}

export function Reader({ book, onClose }: { book: BookMeta; onClose: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [txt, setTxt] = useState<string | null>(null);
  const [page, setPage] = useState(0); // pdf
  const [pageCount, setPageCount] = useState(0);
  const navRef = useRef<{ prev: () => void; next: () => void } | null>(null);

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') navRef.current?.prev();
      else if (e.key === 'ArrowRight') navRef.current?.next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    setLoading(true);
    setErr('');
    setTxt(null);

    (async () => {
      try {
        const blob = await resolveBlob(book);
        if (cancelled) return;

        if (book.format === 'txt') {
          const text = await blob.text();
          if (!cancelled) {
            setTxt(text);
            setLoading(false);
          }
          return;
        }

        if (book.format === 'epub') {
          const ePub = (await import('epubjs')).default;
          const buf = await blob.arrayBuffer();
          if (cancelled) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const b: any = ePub(buf as ArrayBuffer);
          const rendition = b.renderTo(hostRef.current!, {
            width: '100%',
            height: '100%',
            spread: 'none',
            flow: 'paginated',
          });
          const saved = localStorage.getItem(posKey(book.id)) || undefined;
          await rendition.display(saved);
          rendition.on('relocated', (loc: { start?: { cfi?: string } }) => {
            if (loc?.start?.cfi) localStorage.setItem(posKey(book.id), loc.start.cfi);
          });
          navRef.current = { prev: () => rendition.prev(), next: () => rendition.next() };
          if (!cancelled) setLoading(false);
          cleanup = () => b.destroy();
          return;
        }

        if (book.format === 'pdf') {
          const pdfjsLib = await loadPdfjs();
          const buf = await blob.arrayBuffer();
          if (cancelled) return;
          const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
          if (cancelled) return;
          setPageCount(pdf.numPages);
          const saved = Number(localStorage.getItem(posKey(book.id)) || '1');
          let cur = Math.min(Math.max(1, saved), pdf.numPages);

          const renderPage = async (n: number) => {
            const p = await pdf.getPage(n);
            const canvas = canvasRef.current;
            if (!canvas) return;
            const host = hostRef.current!;
            const unscaled = p.getViewport({ scale: 1 });
            const scale = Math.min((host.clientWidth - 24) / unscaled.width, 2);
            const viewport = p.getViewport({ scale: Math.max(scale, 0.4) });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d')!;
            await p.render({ canvasContext: ctx, viewport }).promise;
          };

          const go = (n: number) => {
            cur = Math.min(Math.max(1, n), pdf.numPages);
            setPage(cur);
            localStorage.setItem(posKey(book.id), String(cur));
            renderPage(cur);
          };
          navRef.current = { prev: () => go(cur - 1), next: () => go(cur + 1) };
          setPage(cur);
          await renderPage(cur);
          if (!cancelled) setLoading(false);
          cleanup = () => pdf.destroy();
          return;
        }

        setErr('不支持的格式');
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setErr((e as Error).message || '打开失败');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      navRef.current = null;
      cleanup?.();
    };
  }, [book]);

  return (
    <div id="reader">
      <div className="reader-bar">
        <span className="rt">
          {book.title}
          {book.author ? ' · ' + book.author : ''}
        </span>
        <span className="rspacer" />
        {book.format === 'pdf' && pageCount > 0 && (
          <span className="rpage">
            {page} / {pageCount}
          </span>
        )}
        {book.format !== 'txt' && (
          <>
            <button onClick={() => navRef.current?.prev()} title="上一页(←)">
              ‹
            </button>
            <button onClick={() => navRef.current?.next()} title="下一页(→)">
              ›
            </button>
          </>
        )}
        <button onClick={onClose} title="关闭(Esc)">
          ✕
        </button>
      </div>

      <div className="reader-body">
        {err && <div className="reader-msg">打开失败:{err}</div>}
        {loading && !err && <div className="reader-msg">加载中…</div>}
        {txt != null ? (
          <pre className="reader-txt">{txt}</pre>
        ) : book.format === 'pdf' ? (
          <div className="reader-host" ref={hostRef}>
            <canvas ref={canvasRef} />
          </div>
        ) : (
          <div className="reader-host epub" ref={hostRef} />
        )}
      </div>
    </div>
  );
}
