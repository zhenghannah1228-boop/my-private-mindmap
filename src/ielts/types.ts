/**
 * 雅思错题集:按听力/阅读/写作/口语收集错题。每条 = 原题(铺垫) → 揭晓正确答案,
 * 再猜这道题踩了哪些「错因/知识点」,最后对照解析——复用笑点解析的
 * 「铺垫→揭晓→推理→解析」交互,只是把「喜剧技巧」换成了「错因标签」。
 */

export type IeltsSkill = 'listening' | 'reading' | 'writing' | 'speaking';

export const SKILLS: { key: IeltsSkill; label: string }[] = [
  { key: 'listening', label: '听力' },
  { key: 'reading', label: '阅读' },
  { key: 'writing', label: '写作' },
  { key: 'speaking', label: '口语' },
];

export const SKILL_LABEL: Record<IeltsSkill, string> = Object.fromEntries(
  SKILLS.map((s) => [s.key, s.label])
) as Record<IeltsSkill, string>;

export type ErrorTag =
  | 'detail'
  | 'paraphrase'
  | 'distractor'
  | 'skim'
  | 'vocab'
  | 'grammar'
  | 'inference'
  | 'mishear'
  | 'numbers'
  | 'offtopic'
  | 'structure'
  | 'time';

export const ERROR_TAGS: { key: ErrorTag; label: string; desc: string }[] = [
  { key: 'detail', label: '细节看漏', desc: '具体信息点读漏/听漏了' },
  { key: 'paraphrase', label: '同义替换', desc: '原文换了种说法,没认出是同一个意思' },
  { key: 'distractor', label: '干扰陷阱', desc: '被反转/订正/相似选项带偏了' },
  { key: 'skim', label: '审题不细', desc: '题干要求(字数/单选多选)没看全' },
  { key: 'vocab', label: '词汇卡壳', desc: '生词或词汇量不足,拖慢理解/表达' },
  { key: 'grammar', label: '语法错误', desc: '单复数、时态、拼写等语言硬伤' },
  { key: 'inference', label: '推理不足', desc: '需要读出言外之意,没推出来' },
  { key: 'mishear', label: '听辨失误', desc: '连读、弱读、重音没听出来' },
  { key: 'numbers', label: '数字易混', desc: '数字、字母、时间表达混淆' },
  { key: 'offtopic', label: '跑题/论证不足', desc: '没完整回应题目,或理由例子不够' },
  { key: 'structure', label: '结构混乱', desc: '篇章/应答逻辑缺条理' },
  { key: 'time', label: '时间管理', desc: '时间不够、语速或节奏没控制好' },
];

export const ERROR_TAG_LABEL: Record<ErrorTag, string> = Object.fromEntries(
  ERROR_TAGS.map((t) => [t.key, t.label])
) as Record<ErrorTag, string>;

export interface WrongQuestion {
  id: string;
  skill: IeltsSkill;
  /** 题型,如「填空题」「Matching Headings」「Task 2 议论文」「Part 2 长题」 */
  qtype: string;
  /** 可选:来源,如「剑16 Test 2」「某机经」;拿不准就标「存疑」或留空 */
  source?: string;
  /** 可选:网页链接(原题出处、在线真题页等) */
  link?: string;
  /** 原题干 / 场景描述(铺垫) */
  stem: string;
  /** 你当时的答案,可选 */
  yourAnswer?: string;
  /** 正确答案 / 应有的回应(揭晓) */
  correctAnswer: string;
  /** 错因/知识点标签 */
  tags: ErrorTag[];
  /** 对照解析:为什么错、怎么避免(3–6 句) */
  analysis: string;
}

/** 「复制采集指令」复制这段:交给任意 AI 或自己整理一批错题 JSON */
export const IELTS_PROMPT = `雅思错题集 · 采集指令

请帮我把雅思备考中做错的题目,整理成可复盘的「错题 JSON」。我会在一个小工具里:先看原题,揭晓正确答案,再推理这道题踩了哪些错因,最后对照解析。

要求真实、来自我自己的练习记录;拿不准的来源(哪本书/哪次机经)就标「存疑」或留空,别编造。

请输出一个 JSON 数组,每个元素:
{
  "id": "<唯一英文短id,如 lis-2024-timecheck>",
  "skill": "listening | reading | writing | speaking",
  "qtype": "<题型,如 填空题 / Matching Headings / Task 2 议论文 / Part 2 长题>",
  "source": "<可选,来源,如 剑16 Test 2 / 存疑>",
  "link": "<可选,原题网页链接>",
  "stem": "<原题干或场景描述,2–4 句,交代清楚上下文>",
  "yourAnswer": "<可选,你当时的答案>",
  "correctAnswer": "<正确答案 / 应有的回应>",
  "tags": ["detail","paraphrase","distractor","skim","vocab","grammar","inference","mishear","numbers","offtopic","structure","time"],
  "analysis": "<3–6 句:对照解析,为什么错、下次怎么避免>"
}

错因标签含义:detail=细节看漏,paraphrase=同义替换没认出,distractor=干扰陷阱,skim=审题不细,vocab=词汇卡壳,grammar=语法错误,inference=推理不足,mishear=听辨失误,numbers=数字易混,offtopic=跑题/论证不足,structure=结构混乱,time=时间管理。

一次给 5–10 条,尽量覆盖不同技能和错因,别和已有题目重复。`;
