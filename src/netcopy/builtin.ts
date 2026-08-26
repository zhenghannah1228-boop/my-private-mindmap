import type { NetCopy } from './types';

export const BUILTIN_NETCOPY: NetCopy[] = [
  // ── 情绪共鸣 · 中文 ──
  {
    id: 'keep-zilu',
    text: '自律给我自由。',
    source: 'Keep',
    category: '情绪共鸣',
    analysis: '矛盾即张力——「自律」和「自由」是反义词，并排产生停顿，让人忍不住在脑海里验证这个逻辑，验证完就信了。',
    lang: 'zh',
  },
  {
    id: 'pijing-linghun',
    text: '好看的皮囊千篇一律，有趣的灵魂万里挑一。',
    source: '网络流行语',
    category: '情绪共鸣',
    analysis: '让每个自认「有趣」的人都觉得被懂了。疯传靠的不是道理，是身份认同——转发即宣言。',
    lang: 'zh',
  },
  {
    id: 'chengren-bengkui',
    text: '成年人的崩溃，往往是静悄悄的。',
    source: '网络流行语',
    category: '情绪共鸣',
    analysis: '精准击中「独自压抑」的现代人。「往往」二字留有余地，让每个人都能对号入座，评论区必然刷「说的就是我」。',
    lang: 'zh',
  },
  {
    id: 'netease-music',
    text: '没人看见你哭，但音乐知道。',
    source: '网易云音乐',
    category: '情绪共鸣',
    analysis: '品牌介入情绪的绝佳示范。「没人」制造孤独感，「但音乐知道」立刻成为情感出口，产品变成了陪伴者而非工具。',
    lang: 'zh',
  },
  {
    id: 'emo-banzhuang',
    text: 'emo了，但还是要搬砖。',
    source: '打工人网络用语',
    category: '情绪共鸣',
    analysis: '自嘲+坚韧的双重结构。前半句释放压力，后半句重新上路，精准刻画打工人的集体人格，让人觉得「懂我」。',
    lang: 'zh',
  },
  {
    id: '诗-远方',
    text: '生活不止眼前的苟且，还有诗和远方。',
    source: '高晓松',
    category: '情绪共鸣',
    analysis: '给「现实妥协者」一个精神出口。转发这句话的人，在向他人（和自己）证明：我是有追求的人，只是暂时妥协。',
    lang: 'zh',
  },

  // ── 反差对比 · 中文 ──
  {
    id: 'zhongxuegao-liaoliangao',
    text: '哪有那么多高档，不过是用了点好料。',
    source: '钟薛高',
    category: '反差对比',
    analysis: '反向营销：主动打破「高级感」的神秘，反而更高级。坦诚「就是原料好」，比吹嘘更有说服力，也让溢价显得理所当然。',
    lang: 'zh',
  },
  {
    id: 'wangyi-yanxuan',
    text: '大牌同源，好物不贵。',
    source: '网易严选',
    category: '反差对比',
    analysis: '把「便宜」包装成「聪明消费」。「同源」是信任背书，「不贵」是实利诉求，两句合并把买家的价值观和钱包同时说服了。',
    lang: 'zh',
  },
  {
    id: 'sandunban',
    text: '随时随地，想喝就喝。',
    source: '三顿半咖啡',
    category: '反差对比',
    analysis: '解除场景限制即是卖点。传统咖啡需要热水、机器、时间，「随时随地」四字一次颠覆所有门槛，让便利本身成为价值主张。',
    lang: 'zh',
  },
  {
    id: 'effort-return',
    text: '不是不努力，只是努力和回报不成正比。',
    source: '打工人网络用语',
    category: '反差对比',
    analysis: '反向励志的解构：把失败的归因从「不努力」转移到「系统问题」。既解放了焦虑，又留下了继续努力的理由。',
    lang: 'zh',
  },

  // ── 极简有力 · 中文 ──
  {
    id: 'xiaomi-fashao',
    text: '为发烧而生。',
    source: '小米',
    category: '极简有力',
    analysis: '四个字锁定核心受众：技术狂热者（「发烧友」）立刻共鸣，普通消费者感受到极致产品的承诺。品类 + 人群 + 态度，一句话全装进去了。',
    lang: 'zh',
  },
  {
    id: 'keep-athlete',
    text: '你好，运动员。',
    source: 'Keep',
    category: '极简有力',
    analysis: '称谓赋能：用户登录 App 的瞬间被授予「运动员」身份，而非「普通用户」。身份先行，行为跟上。',
    lang: 'zh',
  },
  {
    id: 'heytea-linggan',
    text: '灵感之茶。',
    source: '喜茶',
    category: '极简有力',
    analysis: '三个字打开无限想象空间——「灵感」暗示创意和高级感，「之茶」确立品类归属，品牌调性全在这三字里。',
    lang: 'zh',
  },
  {
    id: 'kuangye-guidao',
    text: '人生是旷野，不是轨道。',
    source: '网络流行语',
    category: '极简有力',
    analysis: '两个意象的对立就是全部论述。「旷野」给迷茫者一个体面的自我叙述框架——我不是失败了，我是在探索。',
    lang: 'zh',
  },

  // ── 悬念钩子 · 中文 ──
  {
    id: 'sannian-kankeng',
    text: '我用三年踩过的坑，今天全告诉你。',
    source: '内容博主常用句式',
    category: '悬念钩子',
    analysis: '「三年」是信任背书，「踩过的坑」制造信息特权感，「今天全告诉你」建立紧迫性和博主人设。三个元素缺一不可。',
    lang: 'zh',
  },
  {
    id: '99percent-trick',
    text: '99%的人都不知道的方法，我来告诉你。',
    source: '内容标题公式',
    category: '悬念钩子',
    analysis: '数字+稀缺感的经典组合。「99%不知道」同时触发两种心理：对的人想「快告诉我」，错的人想「我不是那99%吧？」',
    lang: 'zh',
  },
  {
    id: 'yizhi-zuocuo',
    text: '这件事，你可能一直做错了。',
    source: '内容标题公式',
    category: '悬念钩子',
    analysis: '触发认知不和谐——你以为对的事情被质疑，大脑无法忽视。「可能」二字降低攻击性，让人更容易点进去验证。',
    lang: 'zh',
  },
  {
    id: 'salary-diff',
    text: '月薪 3000 和月薪 30000 的区别，就这一点。',
    source: '内容标题公式',
    category: '悬念钩子',
    analysis: '数字对比+悬念结尾。精准戳打工人焦虑，「就这一点」暗示秘密唾手可得，让人觉得改变命运只差一次点击。',
    lang: 'zh',
  },

  // ── 身份认同 · 中文 ──
  {
    id: 'wanmei-rizhi-deserve',
    text: '每个女孩都值得被宠爱。',
    source: '完美日记',
    category: '身份认同',
    analysis: '把消费行为升华为「你值得」的自我肯定。买彩妆不是冲动消费，是对自己的善待——品牌把购买理由变成了价值观宣言。',
    lang: 'zh',
  },
  {
    id: 'shenghuoshiye',
    text: '热爱可抵岁月漫长。',
    source: '网络流行语',
    category: '身份认同',
    analysis: '给「坚持某件事的人」一个诗意的身份标签。转发的人在说：我是那种有热爱的人。感受先于内容，认同先于逻辑。',
    lang: 'zh',
  },

  // ── 极简有力 · 英文 ──
  {
    id: 'apple-think-different',
    text: 'Think Different.',
    source: 'Apple, 1997',
    category: '极简有力',
    analysis: 'Grammar mistake as memory hook — "differently" is correct but "different" sounds like a declaration. It names the tribe before selling the product. You don\'t buy a computer; you join a movement.',
    lang: 'en',
  },
  {
    id: 'nike-just-do-it',
    text: 'Just Do It.',
    source: 'Nike, 1988',
    category: '极简有力',
    analysis: 'Removes every excuse in three words. No product mention, no feature claim — just a direct order that implies the listener is already capable. The brand becomes a coach, not a vendor.',
    lang: 'en',
  },
  {
    id: 'mailchimp-send-better',
    text: 'Send better email.',
    source: 'Mailchimp',
    category: '极简有力',
    analysis: 'No bloat. The value proposition IS the tagline — it tells you exactly what you\'ll do with the product, implies your current email is lacking, and promises improvement. Three words, zero waste.',
    lang: 'en',
  },

  // ── 反差对比 · 英文 ──
  {
    id: 'oatly-humans',
    text: "It's like milk, but made for humans.",
    source: 'Oatly',
    category: '反差对比',
    analysis: "A quiet attack on dairy wrapped inside a product definition. \"Made for humans\" implies cow's milk isn't — zero aggression, maximum implication. The competitor's product loses just by being mentioned.",
    lang: 'en',
  },
  {
    id: 'cards-horrible',
    text: 'A party game for horrible people.',
    source: 'Cards Against Humanity',
    category: '反差对比',
    analysis: "Own the worst thing about yourself before anyone else can. The self-deprecation is the entire pitch — it signals honesty, creates an in-group (horrible people who know they're horrible), and makes the product unforgettable.",
    lang: 'en',
  },
  {
    id: 'dollar-shave-great',
    text: "Our blades are f***ing great.",
    source: 'Dollar Shave Club, 2012',
    category: '反差对比',
    analysis: "The profanity is the point. Every razor ad is polished and aspirational — this one sounds like your most honest friend. The contrast with category norms IS the credibility. Authenticity as strategy.",
    lang: 'en',
  },

  // ── 悬念钩子 · 英文 ──
  {
    id: 'spotify-playlist',
    text: "There's a playlist for that.",
    source: 'Spotify',
    category: '悬念钩子',
    analysis: '"That" refers to everything and nothing — the listener fills in the blank with their own moment. It\'s an open invitation disguised as a simple statement. The copy only works because everyone can imagine their own "that".',
    lang: 'en',
  },
  {
    id: 'wendys-fries',
    text: "We're not here to make enemies... just fries.",
    source: "Wendy's Twitter",
    category: '反差对比',
    analysis: "Defuses the brand's famously combative persona with a food pun. The ellipsis does the work — it sets up a fake truce then pivots to product. Self-aware brand voice as entertainment.",
    lang: 'en',
  },

  // ── 身份认同 · 英文 ──
  {
    id: 'duolingo-streak',
    text: 'The streak is real.',
    source: 'Duolingo',
    category: '身份认同',
    analysis: "Four words that transform a gamification mechanic into personal identity. \"The streak\" has weight — it's not just a number, it's proof you're a person who follows through. Loss aversion does the rest.",
    lang: 'en',
  },
];
