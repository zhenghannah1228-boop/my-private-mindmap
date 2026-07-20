/**
 * 生成一个最简 EPUB2 文件(可被 epubjs 解析)。
 * 用法(供每周定时任务复用):
 *   node scripts/make-epub.mjs '<json-spec>' <输出路径.epub>
 * spec: { title, author, chapters:[{title, paragraphs:[string]}] }
 *
 * 无第三方依赖:构造标准目录结构后用系统 zip 打包
 * (mimetype 必须第一个、且 stored 不压缩)。
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function makeEpub(spec, outPath) {
  const { title, author = '', chapters = [] } = spec;
  const dir = mkdtempSync(join(tmpdir(), 'epub-'));
  try {
    writeFileSync(join(dir, 'mimetype'), 'application/epub+zip');
    mkdirSync(join(dir, 'META-INF'));
    writeFileSync(
      join(dir, 'META-INF', 'container.xml'),
      `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`
    );
    // iBooks 显示选项(缺失会让部分阅读器/解析器报 displayOptions 警告)
    writeFileSync(
      join(dir, 'META-INF', 'com.apple.ibooks.display-options.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>
<display_options><platform name="*"><option name="specified-fonts">true</option></platform></display_options>`
    );
    mkdirSync(join(dir, 'OEBPS'));

    // EPUB3 导航文档(nav),缺失会让 epubjs 报 navigation 警告
    writeFileSync(
      join(dir, 'OEBPS', 'nav.xhtml'),
      `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="zh"><head><meta charset="utf-8"/><title>目录</title></head>
<body><nav epub:type="toc" id="toc"><h1>目录</h1><ol>${chapters
        .map((c, i) => `<li><a href="text.xhtml#c${i}">${esc(c.title)}</a></li>`)
        .join('')}</ol></nav></body></html>`
    );

    const bodies = chapters
      .map(
        (c, i) => `<section id="c${i}"><h2>${esc(c.title)}</h2>${(c.paragraphs || [])
          .map((p) => `<p>${esc(p)}</p>`)
          .join('')}</section>`
      )
      .join('\n');

    writeFileSync(
      join(dir, 'OEBPS', 'text.xhtml'),
      `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh"><head><meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>body{font-family:serif;line-height:1.9;padding:1.2em;color:#2c2c2a}h1{font-size:1.5em}h2{margin:1.4em 0 .4em}p{margin:.5em 0;text-indent:2em}</style>
</head><body><h1>${esc(title)}</h1>${bodies}</body></html>`
    );

    writeFileSync(
      join(dir, 'OEBPS', 'content.opf'),
      `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${esc(title)}</dc:title>
    <dc:creator opf:role="aut">${esc(author)}</dc:creator>
    <dc:language>zh</dc:language>
    <dc:identifier id="bookid">urn:uuid:${esc(title)}-fixed</dc:identifier>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="text" href="text.xhtml" media-type="application/xhtml+xml"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx"><itemref idref="text" linear="yes"/></spine>
</package>`
    );

    writeFileSync(
      join(dir, 'OEBPS', 'toc.ncx'),
      `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="${esc(title)}"/></head>
  <docTitle><text>${esc(title)}</text></docTitle>
  <navMap><navPoint id="n1" playOrder="1"><navLabel><text>${esc(title)}</text></navLabel><content src="text.xhtml"/></navPoint></navMap>
</ncx>`
    );

    // 打包:mimetype 必须第一个且不压缩
    execSync(`cd "${dir}" && zip -X -0 -q out.epub mimetype && zip -X -9 -rq out.epub META-INF OEBPS`);
    cpSync(join(dir, 'out.epub'), outPath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// CLI
if (process.argv[1] && process.argv[1].endsWith('make-epub.mjs') && process.argv[2]) {
  makeEpub(JSON.parse(process.argv[2]), process.argv[3] || 'out.epub');
  console.log('wrote', process.argv[3]);
}
