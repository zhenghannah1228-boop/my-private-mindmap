/**
 * 笑点解析:拆解欧美情景喜剧的经典笑点——先看铺垫,揭晓笑点,
 * 再推理它用了哪些喜剧技巧,最后对照解析。与迷因探踪同源:分析「为什么好笑」。
 *
 * 版权:只做短引用 + 描述,不搬长段台词。
 */

export type ComedyFactor =
  | 'subvert'
  | 'callback'
  | 'character'
  | 'wordplay'
  | 'cringe'
  | 'running'
  | 'escalation'
  | 'irony'
  | 'ruleofthree'
  | 'deadpan'
  | 'timing';

export const FACTORS: { key: ComedyFactor; label: string; desc: string }[] = [
  { key: 'subvert', label: '颠覆预期', desc: '铺垫把你引向一个方向,笑点却拐去别处' },
  { key: 'callback', label: '回旋镖', desc: '呼应前文埋的梗,后面突然收回来' },
  { key: 'character', label: '角色反差', desc: '好笑是因为「这句话出自这个人」' },
  { key: 'wordplay', label: '谐音双关', desc: '一词多义、谐音、语言游戏' },
  { key: 'cringe', label: '尴尬喜剧', desc: '让人脚趾抠地的社死与难堪' },
  { key: 'running', label: '重复梗', desc: '反复出现的固定笑点,越熟越好笑' },
  { key: 'escalation', label: '荒诞加码', desc: '把一个小前提一路升级到失控' },
  { key: 'irony', label: '反讽', desc: '言此意彼,或观众与角色的认知落差' },
  { key: 'ruleofthree', label: '三段式', desc: '两个正常 + 第三个反转(rule of three)' },
  { key: 'deadpan', label: '一本正经', desc: '面不改色地把荒唐话当正经说' },
  { key: 'timing', label: '喜剧时机', desc: '停顿、节奏、留白制造的爆点' },
];

export const FACTOR_LABEL: Record<ComedyFactor, string> = Object.fromEntries(
  FACTORS.map((f) => [f.key, f.label])
) as Record<ComedyFactor, string>;

export interface Joke {
  id: string;
  /** 剧名 */
  show: string;
  /** 可选:季/集 */
  episode?: string;
  /** 这个笑点的短标题 */
  title: string;
  /** 铺垫 / 场景上文 */
  setup: string;
  /** 笑点本身:短引用 + 描述(不搬长台词) */
  punchline: string;
  /** 命中的喜剧技巧 */
  factors: ComedyFactor[];
  /** 为什么好笑(3–5 句) */
  analysis: string;
}

/** 「复制采集指令」复制这段:交给任意 AI 产出一批笑点解析 JSON */
export const COMEDY_PROMPT = `情景喜剧笑点解析 · 采集指令

请帮我把几个欧美情景喜剧里的经典笑点,整理成可玩的「笑点解析 JSON」。我会在一个小游戏里:先看铺垫,揭晓笑点,再推理它用了哪些喜剧技巧,最后对照你的解析。

要求真实、可查证;拿不准的剧集/台词就标「存疑」,不要编造。版权上只做短引用 + 描述,别整段搬运台词。

请输出一个 JSON 数组,每个元素:
{
  "id": "<唯一英文短id,如 office-identity-theft>",
  "show": "<剧名,如 The Office (US)>",
  "episode": "<可选,季/集>",
  "title": "<这个笑点的短标题>",
  "setup": "<2–4 句:铺垫/场景上文,交代人物与情境>",
  "punchline": "<笑点本身:一句短引用(≤1 句台词)+ 简要描述那个瞬间>",
  "factors": ["subvert","callback","character","wordplay","cringe","running","escalation","irony","ruleofthree","deadpan","timing"],
  "analysis": "<3–5 句:综合解析它为什么好笑,呼应你选的 factors>"
}

技巧含义:subvert=颠覆预期,callback=回旋镖,character=角色反差,wordplay=谐音双关,cringe=尴尬喜剧,running=重复梗,escalation=荒诞加码,irony=反讽,ruleofthree=三段式,deadpan=一本正经,timing=喜剧时机。

一次给 3–6 个,尽量覆盖不同剧、不同技巧。`;
