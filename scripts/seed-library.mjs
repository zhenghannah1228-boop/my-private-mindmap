/**
 * 生成初始公版作品库到 public/library/。
 * 内容均为公版(唐诗、莎士比亚十四行诗),仅作演示与首批填充;
 * 每周定时任务会往这里追加更多公版作品并更新 manifest.json。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeEpub } from './make-epub.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const libDir = join(root, 'public', 'library');
mkdirSync(libDir, { recursive: true });

// ── 1. 唐诗选(EPUB,公版)──
makeEpub(
  {
    title: '唐诗选',
    author: '李白 · 杜甫 · 王维 等',
    chapters: [
      { title: '静夜思 · 李白', paragraphs: ['床前明月光,疑是地上霜。', '举头望明月,低头思故乡。'] },
      { title: '春望 · 杜甫', paragraphs: ['国破山河在,城春草木深。', '感时花溅泪,恨别鸟惊心。', '烽火连三月,家书抵万金。', '白头搔更短,浑欲不胜簪。'] },
      { title: '山居秋暝 · 王维', paragraphs: ['空山新雨后,天气晚来秋。', '明月松间照,清泉石上流。', '竹喧归浣女,莲动下渔舟。', '随意春芳歇,王孙自可留。'] },
      { title: '春晓 · 孟浩然', paragraphs: ['春眠不觉晓,处处闻啼鸟。', '夜来风雨声,花落知多少。'] },
    ],
  },
  join(libDir, 'tangshi.epub')
);

// ── 2. 一篇公版散文(TXT)──
writeFileSync(
  join(libDir, 'aitianya.txt'),
  `爱莲说\n——周敦颐（公版）\n\n水陆草木之花,可爱者甚蕃。晋陶渊明独爱菊。自李唐来,世人甚爱牡丹。予独爱莲之出淤泥而不染,濯清涟而不妖,中通外直,不蔓不枝,香远益清,亭亭净植,可远观而不可亵玩焉。\n\n予谓菊,花之隐逸者也;牡丹,花之富贵者也;莲,花之君子者也。噫!菊之爱,陶后鲜有闻。莲之爱,同予者何人?牡丹之爱,宜乎众矣。\n`,
  'utf-8'
);

// ── 3. Shakespeare Sonnet 18(PDF,公版,英文以便内置字体正常渲染)──
function minimalPdf(lines) {
  const content =
    'BT /F1 14 Tf 60 760 Td 18 TL\n' +
    lines.map((l) => `(${l.replace(/[()\\]/g, (m) => '\\' + m)}) Tj T*`).join('\n') +
    '\nET';
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 480 800]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
    `<</Length ${content.length}>>\nstream\n${content}\nendstream`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  });
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}
writeFileSync(
  join(libDir, 'sonnet18.pdf'),
  minimalPdf([
    'Sonnet 18 — William Shakespeare',
    '',
    'Shall I compare thee to a summer’s day?',
    'Thou art more lovely and more temperate:',
    'Rough winds do shake the darling buds of May,',
    'And summer’s lease hath all too short a date;',
    'Sometime too hot the eye of heaven shines,',
    'And often is his gold complexion dimm’d;',
    'And every fair from fair sometime declines,',
    'By chance or nature’s changing course untrimm’d;',
    'But thy eternal summer shall not fade,',
    'Nor lose possession of that fair thou ow’st;',
    'Nor shall death brag thou wander’st in his shade,',
    'When in eternal lines to time thou grow’st:',
    'So long as men can breathe or eyes can see,',
    'So long lives this, and this gives life to thee.',
  ]),
  'latin1'
);

// ── manifest ──
const manifest = [
  { shelf: '诗歌', title: '唐诗选', author: '李白 · 杜甫 · 王维 等', format: 'epub', file: 'tangshi.epub', note: '公版唐诗精选,可直接在线阅读' },
  { shelf: '散文集', title: '爱莲说', author: '周敦颐', format: 'txt', file: 'aitianya.txt', note: '北宋公版散文名篇' },
  { shelf: '诗歌', title: 'Sonnet 18', author: 'William Shakespeare', format: 'pdf', file: 'sonnet18.pdf', note: 'Public-domain PDF sample' },
];
writeFileSync(join(libDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

console.log('seeded public/library:', manifest.map((m) => m.file).join(', '));
