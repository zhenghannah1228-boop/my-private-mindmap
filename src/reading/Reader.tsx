/**
 * 阅读器覆盖层。支持 EPUB(epubjs)/ PDF(pdfjs)/ TXT。
 *
 * 护眼:三种阅读主题(护眼米黄 / 纸白 / 夜间)+ 字号调节,舒适排版
 *(衬线字体、宽松行距、居中窄栏)。主题/字号全局记忆。
 * 记住每本书上次阅读位置(EPUB 存 CFI,PDF 存页码)。
 */

import { useEffect, useRef, useState } from 'react';
import { getBookBlob } from './db';
import { repoFileUrl } from './manifest';
import type { BookMeta } from './types';

const posKey = (id: string) => 'mm_read_pos_' + id;
const THEME_KEY = 'mm_reader_theme';
const FS_KEY = 'mm_reader_fs';

type ThemeId = 'sepia' | 'paper' | 'night';
interface Theme {
  id: ThemeId;
  name: string;
  bg: string;
  text: string;
}
const THEMES: Record<ThemeId, Theme> = {
  sepia: { id: 'sepia', name: '护眼', bg: '#f4ecd8', text: '#4a4436' },
  paper: { id: 'paper', name: '纸白', bg: '#faf9f7', text: '#2c2c2a' },
  night: { id: 'night', name: '夜间', bg: '#1c1c1a', text: '#c6c1b4' },
};
const SERIF =
  '"Songti SC","STSong","Noto Serif SC","Source Han Serif SC","SimSun",Georgia,"Times New Roman",serif';

function loadTheme(): ThemeId {
  const t = (localStorage.getItem(THEME_KEY) || 'sepia') as ThemeId;
  return THEMES[t] ? t : 'sepia';
}
function loadFs(): number {
  const n = Number(localStorage.getItem(FS_KEY));
  return n >= 14 && n <= 28 ? n : 19;
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyEpubTheme(rendition: any, theme: Theme, fs: number) {
  rendition.themes.register('reader', {
    html: { background: theme.bg + ' !important' },
    body: {
      background: theme.bg + ' !important',
      color: theme.text + ' !important',
      'font-family': SERIF + ' !important',
      'line-height': '1.9 !important',
      'padding': '0.5em 0.2em !important',
    },
    'p, li, div, span': { color: theme.text + ' !important' },
    p: { 'text-align': 'justify', 'letter-spacing': '0.01em' },
    'h1,h2,h3,h4': { color: theme.text + ' !important', 'line-height': '1.4 !important' },
    a: { color: theme.text + ' !important' },
    img: { 'max-width': '100% !important', height: 'auto !important' },
  });
  rendition.themes.select('reader');
  rendition.themes.fontSize(fs + 'px');
}

export function Reader({ book, onClose }: { book: BookMeta; onClose: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [txt, setTxt] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [theme, setTheme] = useState<ThemeId>(loadTheme);
  const [fs, setFs] = useState<number>(loadFs);
  const navRef = useRef<{ prev: () => void; next: () => void } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null);

  const t = THEMES[theme];

  // 持久化主题 / 字号
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem(FS_KEY, String(fs));
  }, [fs]);

  // 主题 / 字号变化时,重新应用到 EPUB
  useEffect(() => {
    if (renditionRef.current) applyEpubTheme(renditionRef.current, t, fs);
  }, [theme, fs, t]);

  // 键盘:Esc 关闭,←/→ 翻页
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
    renditionRef.current = null;

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
          renditionRef.current = rendition;
          applyEpubTheme(rendition, THEMES[loadTheme()], loadFs());
          const saved = localStorage.getItem(posKey(book.id)) || undefined;
          await rendition.display(saved);
          rendition.on('relocated', (loc: { start?: { cfi?: string } }) => {
            if (loc?.start?.cfi) localStorage.setItem(posKey(book.id), loc.start.cfi);
          });
          navRef.current = { prev: () => rendition.prev(), next: () => rendition.next() };
          if (!cancelled) setLoading(false);
          cleanup = () => {
            renditionRef.current = null;
            b.destroy();
          };
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
            const scale = Math.min((host.clientWidth - 48) / unscaled.width, 2);
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
    <div id="reader" className={'rtheme-' + theme} style={{ background: t.bg, color: t.text }}>
      <div className="reader-bar">
        <button className="rclose" onClick={onClose} title="返回(Esc)">
          ‹ 返回
        </button>
        <span className="rt">
          {book.title}
          {book.author ? ' · ' + book.author : ''}
        </span>
        <span className="rspacer" />

        {/* 主题切换(护眼) */}
        <div className="rthemes" title="阅读主题">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => (
            <button
              key={id}
              className={'rtheme-dot dot-' + id + (theme === id ? ' on' : '')}
              onClick={() => setTheme(id)}
              title={THEMES[id].name}
            />
          ))}
        </div>

        {/* 字号 */}
        <div className="rfs" title="字号">
          <button onClick={() => setFs((v) => Math.max(14, v - 1))}>A-</button>
          <button onClick={() => setFs((v) => Math.min(28, v + 1))}>A+</button>
        </div>

        {book.format === 'pdf' && pageCount > 0 && (
          <span className="rpage">
            {page} / {pageCount}
          </span>
        )}
        {book.format !== 'txt' && (
          <div className="rnav">
            <button onClick={() => navRef.current?.prev()} title="上一页(←)">
              ‹
            </button>
            <button onClick={() => navRef.current?.next()} title="下一页(→)">
              ›
            </button>
          </div>
        )}
      </div>

      <div className="reader-body">
        {err && <div className="reader-msg">打开失败:{err}</div>}
        {loading && !err && <div className="reader-msg">加载中…</div>}
        {txt != null ? (
          <div className="reader-scroll">
            <pre className="reader-txt" style={{ fontSize: fs, fontFamily: SERIF }}>
              {txt}
            </pre>
          </div>
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
