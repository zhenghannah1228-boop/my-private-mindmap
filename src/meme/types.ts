/**
 * 迷因探踪:超链接文本游戏。
 * 一个迷因 = 一张小型超链接图,玩家在「站点」之间跳转(溯源↑/衍生↓/变体→),
 * 追出起因与传播链,最后推理它为什么会火。
 *
 * 正文支持内联超链接语法 [[站点id|显示文字]],渲染成可点击跳转。
 */

/** 成因因子:一套固定维度,方便横向对比不同迷因为何走红 */
export type FactorKey =
  | 'remix'
  | 'emotion'
  | 'ingroup'
  | 'timing'
  | 'lowbar'
  | 'incongruity'
  | 'amplifier'
  | 'platform';

export const FACTORS: { key: FactorKey; label: string; desc: string }[] = [
  { key: 'remix', label: '可改编性', desc: '留白/模板感强,人人能套用二创' },
  { key: 'emotion', label: '情绪强度', desc: '好笑、愤怒、共鸣或荒诞,情绪一击即中' },
  { key: 'ingroup', label: '圈层信号', desc: '懂的人才懂,用它标记身份与归属' },
  { key: 'timing', label: '时机搭车', desc: '踩中时事/热点/集体情绪的窗口' },
  { key: 'lowbar', label: '参与门槛低', desc: '不需要技巧,转发一句就能加入' },
  { key: 'incongruity', label: '反差意外', desc: '不协调、出乎意料带来的记忆点' },
  { key: 'amplifier', label: '大V助推', desc: '名人/大号/媒体的关键放大' },
  { key: 'platform', label: '平台适配', desc: '形式契合平台机制(表情包/短视频/算法)' },
];

export const FACTOR_LABEL: Record<FactorKey, string> = Object.fromEntries(
  FACTORS.map((f) => [f.key, f.label])
) as Record<FactorKey, string>;

/** 站点类型,给传播链一个叙事骨架 */
export type StationKind = 'origin' | 'spread' | 'mutation' | 'peak' | 'decline';

export const STATION_LABEL: Record<StationKind, string> = {
  origin: '起源',
  spread: '传播',
  mutation: '变异',
  peak: '高峰',
  decline: '衰变 / 复活',
};

export type LinkRel = 'back' | 'forward' | 'variant';

export const REL_LABEL: Record<LinkRel, string> = {
  back: '溯源',
  forward: '衍生',
  variant: '变体',
};

export interface MemeLink {
  /** 目标站点 id */
  to: string;
  rel: LinkRel;
  /** 按钮文字;缺省用目标站点标题 */
  label?: string;
}

export interface StationSource {
  label: string;
  url?: string;
}

export interface StationImage {
  /** 真实图片链接(优先 Wikimedia Commons / 公有领域 / 稳定源) */
  url?: string;
  /** 图注/出处 */
  credit?: string;
  alt?: string;
}

export interface Station {
  id: string;
  kind: StationKind;
  title: string;
  /** 大致时间,如 "2013" / "2013.12" */
  date?: string;
  /** 平台/场域,如 "Reddit" "微博" */
  platform?: string;
  /** 正文,可含内联超链接 [[站点id|文字]] */
  body: string;
  links: MemeLink[];
  sources?: StationSource[];
  /** 真实配图(AI 采集/导入时填 url) */
  image?: StationImage;
  /** 内置手绘示意插画的 key(见 art.tsx);用户贴的真图与 image.url 优先级更高 */
  art?: string;
}

export interface Meme {
  id: string;
  title: string;
  /** 一句话简介 */
  summary?: string;
  /** 玩家落地的站点(通常=当前你熟悉的形态) */
  startId: string;
  /** patient zero(溯源目标) */
  originId: string;
  stations: Station[];
  /** 「正确」的成因因子(结局对照用) */
  factors: FactorKey[];
  /** 成因分析文字 */
  analysis: string;
}

/** 「复制采集指令」按钮复制这段:交给任意 AI 产出一个迷因的探踪 JSON */
export const MEME_PROMPT = `迷因探踪 · 采集指令

请帮我把一个「迷因(meme)」整理成一份可玩的「探踪 JSON」。我会在一个超链接文本游戏里:从它当下的形态出发,沿链接溯源到起点、顺流看它如何变异破圈,最后推理它为什么会火。

要求真实、可查证;拿不准的时间/出处就标注「存疑」,不要编造。

请输出一个 JSON 对象,结构如下:
{
  "id": "<唯一英文短id,如 doge>",
  "title": "<迷因名>",
  "summary": "<一句话简介>",
  "startId": "<玩家落地的站点id,通常是它如今最广为人知的形态>",
  "originId": "<patient zero 站点id,最早的源头>",
  "stations": [
    {
      "id": "<站点id>",
      "kind": "origin | spread | mutation | peak | decline",   // 起源/传播/变异/高峰/衰变或复活
      "title": "<站点标题>",
      "date": "<大致时间,如 2013 或 2013.12>",
      "platform": "<平台/场域,如 Reddit、4chan、微博、抖音>",
      "body": "<2–5 句叙述。可用内联超链接 [[目标站点id|显示文字]] 指向别的站点>",
      "image": { "url": "<该站点的真实配图直链,优先 Wikimedia Commons/公有领域/稳定源;拿不准就省略>", "credit": "<图注/出处>" },
      "links": [
        { "to": "<目标站点id>", "rel": "back | forward | variant", "label": "<可选按钮文字>" }
      ],
      "sources": [ { "label": "<来源名>", "url": "<可选链接>" } ]
    }
  ],
  "factors": ["remix","emotion","ingroup","timing","lowbar","incongruity","amplifier","platform"],   // 命中的成因因子,取其中若干
  "analysis": "<3–6 句:综合分析它为什么会成为迷因,呼应你选的 factors>"
}

成因因子含义:remix=可改编性,emotion=情绪强度,ingroup=圈层信号,timing=时机搭车,lowbar=参与门槛低,incongruity=反差意外,amplifier=大V助推,platform=平台适配。

链条建议 5–8 个站点,至少 1 个 origin、若干 spread/mutation、1 个 peak;rel 用 back 指向更早的源头、forward 指向更晚的衍生、variant 指向并列变体。确保 startId / originId / links.to 都能在 stations 里找到。

配图很重要(纯文字说服力不足):尽量给每个站点填 image.url 真实直链——优先选公有领域或稳定可访问的图(如 Wikimedia Commons 的 upload.wikimedia.org 直链)。拿不准链接是否有效就宁可省略,也别编造会失效的地址(导入后我也可以自己贴真图)。`;
