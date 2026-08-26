/**
 * 从 Project Gutenberg 抓取西方公版作品,清理页眉页脚后打包成 EPUB,
 * 追加到 public/library/(不覆盖既有条目)。
 *
 * 所有作品均为公有领域;Project Gutenberg 页眉/页脚(含其商标与授权说明)会被剥离,
 * 仅保留公版正文本身。
 *
 * 用法:node scripts/curate-western.mjs
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeEpub } from './make-epub.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const libDir = join(root, 'public', 'library');
mkdirSync(libDir, { recursive: true });

const WORKS = [
  { id: 11, shelf: '小说', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', type: 'prose', file: 'alice.epub', note: '刘易斯·卡罗尔《爱丽丝梦游仙境》(公版)' },
  { id: 1342, shelf: '小说', title: 'Pride and Prejudice', author: 'Jane Austen', type: 'prose', file: 'pride-and-prejudice.epub', note: '简·奥斯汀《傲慢与偏见》(公版)' },
  { id: 84, shelf: '小说', title: 'Frankenstein', author: 'Mary Shelley', type: 'prose', file: 'frankenstein.epub', note: '玛丽·雪莱《弗兰肯斯坦》(公版)' },
  { id: 1661, shelf: '小说', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', type: 'prose', file: 'sherlock-holmes.epub', note: '柯南·道尔《福尔摩斯探案集》(公版)' },
  { id: 205, shelf: '散文集', title: 'Walden', author: 'Henry David Thoreau', type: 'prose', file: 'walden.epub', note: '梭罗《瓦尔登湖》(公版)' },
  { id: 1041, shelf: '诗歌', title: "Shakespeare's Sonnets", author: 'William Shakespeare', type: 'verse', file: 'shakespeare-sonnets.epub', note: '莎士比亚十四行诗全集(公版)' },
];

function download(id) {
  const dst = join(libDir, `._pg${id}.txt`);
  const urls = [
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
  ];
  for (const u of urls) {
    try {
      execSync(`curl -sSL --max-time 60 -o "${dst}" "${u}"`);
      const t = readFileSync(dst, 'utf-8');
      if (t.length > 5000) return t;
    } catch {
      /* try next */
    }
  }
  throw new Error('download failed for ' + id);
}

/** 剥离 Project Gutenberg 页眉页脚,只留公版正文 */
function stripGutenberg(text) {
  text = text.replace(/\r\n/g, '\n');
  const start = text.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i);
  const end = text.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i);
  let body = text;
  if (start) body = body.slice(start.index + start[0].length);
  if (end) {
    const endIdx = body.search(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i);
    if (endIdx > 0) body = body.slice(0, endIdx);
  }
  // 去掉可能残留的 "Produced by …" 一行
  body = body.replace(/^\s*Produced by[^\n]*\n/i, '');
  return body.trim();
}

/** 散文:按 CHAPTER/LETTER 等标题切章;每章按空行分段,并把硬折行合并成流动段落 */
function proseChapters(body, title) {
  // 关键词 + 紧跟的编号(罗马数字/阿拉伯数字)才算章节标题,
  // 避免正文里以 "letter,"/"part of" 等开头的普通句子被误判
  const headingRe =
    /^[ \t]*((?:CHAPTER|LETTER|VOLUME|BOOK|ADVENTURE|PART)\s+[IVXLCDM\d][^\n]{0,58})[ \t]*$/gim;
  const marks = [];
  let m;
  while ((m = headingRe.exec(body))) marks.push({ i: m.index, t: m[1].trim() });

  const blocksToParas = (chunk) =>
    chunk
      .split(/\n[ \t]*\n/)
      .map((b) => b.replace(/[ \t]*\n[ \t]*/g, ' ').trim())
      .filter((b) => b.length);

  if (marks.length < 2) {
    return [{ title, paragraphs: blocksToParas(body) }];
  }
  let chapters = [];
  // 章标题之前的引言(若有实质内容)
  const pre = body.slice(0, marks[0].i).trim();
  if (pre.length > 40) chapters.push({ title, paragraphs: blocksToParas(pre) });
  for (let k = 0; k < marks.length; k++) {
    const from = marks[k].i;
    const to = k + 1 < marks.length ? marks[k + 1].i : body.length;
    const seg = body.slice(from, to);
    const nl = seg.indexOf('\n');
    let heading = seg.slice(0, nl < 0 ? seg.length : nl).trim();
    let rest = nl < 0 ? '' : seg.slice(nl + 1);
    // 把紧跟的独立短标题行并入章名(如 "CHAPTER I." 下一行 "Down the Rabbit-Hole")
    const sub = rest.match(/^[ \t]*\n*([^\n]{1,63})[ \t]*\n[ \t]*\n/);
    if (sub && !/[.!?。!?,]$/.test(sub[1].trim())) {
      heading = `${heading} ${sub[1].trim()}`;
      rest = rest.slice(sub[0].length);
    }
    chapters.push({ title: heading || `第 ${k + 1} 节`, paragraphs: blocksToParas(rest) });
  }
  // 丢掉空章(多为目录 TOC 行产生的重复条目)
  chapters = chapters.filter((c) => c.paragraphs.length > 0);
  return chapters.length ? chapters : [{ title, paragraphs: blocksToParas(body) }];
}

/** 诗歌:整卷一章,按空行分段;段内换行保留(make-epub 会转 <br/>) */
function verseChapters(body, title) {
  const paragraphs = body
    .split(/\n[ \t]*\n/)
    .map((b) => b.replace(/[ \t]+$/gm, '').trim())
    .filter((b) => b.length);
  return [{ title, paragraphs }];
}

// 读现有 manifest
const manifestPath = join(libDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf-8')) : [];
const haveFiles = new Set(manifest.map((m) => m.file));

const added = [];
for (const w of WORKS) {
  if (haveFiles.has(w.file)) {
    console.log('skip existing', w.file);
    continue;
  }
  try {
    const raw = download(w.id);
    const body = stripGutenberg(raw);
    const chapters =
      w.type === 'verse' ? verseChapters(body, w.title) : proseChapters(body, w.title);
    const paraCount = chapters.reduce((n, c) => n + c.paragraphs.length, 0);
    if (paraCount < 3) throw new Error('parsed too little');
    makeEpub({ title: w.title, author: w.author, chapters }, join(libDir, w.file));
    manifest.push({ shelf: w.shelf, title: w.title, author: w.author, format: 'epub', file: w.file, note: w.note });
    added.push(`${w.title}(${chapters.length} 章 / ${paraCount} 段)`);
    console.log('built', w.file, '-', chapters.length, 'chapters,', paraCount, 'paragraphs');
  } catch (e) {
    console.error('FAILED', w.title, '-', e.message);
  }
}

// 清理临时下载文件
try {
  execSync(`rm -f "${libDir}"/._pg*.txt`);
} catch {
  /* ignore */
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log('\nADDED:', added.length ? added.join('; ') : '(none)');
