export interface NetCopy {
  id: string;
  text: string;      // 文案原文
  source: string;    // 来源品牌/平台/人
  category: string;  // 技法分类
  analysis: string;  // 为什么好用
  lang: 'zh' | 'en';
}

export const NETCOPY_CATEGORIES = [
  '情绪共鸣',
  '反差对比',
  '极简有力',
  '悬念钩子',
  '身份认同',
] as const;
