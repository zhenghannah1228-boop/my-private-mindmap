/**
 * 每日发现看板:短小、跳跃、五花八门的知识卡片(ADHD 友好)。
 * 内容由每日定时任务采集进 public/daily/feed.json,应用启动拉取。
 */

export interface FeedCard {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  category: string;
  title: string;
  body: string;
  /** 可选来源:链接或出处 */
  source?: string;
}

export const DISCOVER_CATEGORIES = [
  '文化冷知识',
  '历史故事',
  '名人故事',
  '英语表达',
  '时政要闻',
  '天文地理',
  '名画赏析',
  '神话故事',
] as const;

export const CATEGORY_EMOJI: Record<string, string> = {
  文化冷知识: '💡',
  历史故事: '📜',
  名人故事: '👤',
  英语表达: '🔤',
  时政要闻: '📰',
  天文地理: '🌍',
  名画赏析: '🎨',
  神话故事: '🐉',
};

/**
 * 采集指令(「复制采集指令」按钮复制这段)。
 * 交给任意 AI 即可产出符合 feed.json 结构的每日卡片;每日定时任务用的也是它。
 */
export const COLLECT_PROMPT = `每日文化拾遗 · 采集指令(ADHD 友好)

请为我采集今天一批「随手可读」的短知识卡片。风格:短小、有趣、跳跃、五花八门,适合注意力容易分散的人随手翻。

类别(每类 1–2 条,总共 10–14 条):
- 文化冷知识
- 历史故事
- 名人故事
- 英语表达(表达 + 含义 + 一个例句/出处)
- 时政要闻(中立客观、附来源;只做事实速览,不加个人评论或预测)
- 天文地理
- 名画赏析(公有领域名画;作者/年代/看点 + 一个可看原图的链接,如维基共享资源)
- 神话故事(世界各国轮着来)

每条要求:
- 标题一句话点睛(≤20 字)
- 正文 2–4 句,准确可信;拿不准就别写
- 有来源就附上

输出为 JSON 数组,追加进现有 public/daily/feed.json(不要覆盖旧卡片,新卡片放前面),每条格式:
{ "id": "<唯一字符串>", "date": "<YYYY-MM-DD>", "category": "<上面类别之一>", "title": "...", "body": "...", "source": "<可选>" }`;
