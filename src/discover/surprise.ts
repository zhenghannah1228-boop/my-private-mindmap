/**
 * Surprise Me:仿 wiby.me,随机打开一个有趣的网站(新标签页)。
 * 一份精选清单——好玩、安全、五花八门:互动小玩具、创意实验、探索式解释、
 * 随机维基、天文每日图、世界电台、老网页情怀等。
 */

export interface SurpriseSite {
  url: string;
  label: string;
}

export const SURPRISE_SITES: SurpriseSite[] = [
  { url: 'https://neal.fun/deep-sea/', label: '潜入深海(滚动看海有多深)' },
  { url: 'https://neal.fun/size-of-space/', label: '宇宙到底有多大' },
  { url: 'https://neal.fun/space-elevator/', label: '坐电梯上太空' },
  { url: 'https://www.windows93.net/', label: 'Windows 93 恶搞系统' },
  { url: 'https://pointerpointer.com/', label: '总有人指着你的鼠标' },
  { url: 'https://theuselessweb.com/', label: 'The Useless Web(再随机一跳)' },
  { url: 'https://weavesilk.com/', label: '用鼠标编织光丝画' },
  { url: 'https://patatap.com/', label: '敲键盘=声音+动画' },
  { url: 'https://sandspiel.club/', label: '会流动的沙子游戏' },
  { url: 'https://longdogechallenge.com/', label: '一只超——长的柴犬' },
  { url: 'https://www.omfgdogs.com/', label: '跳舞的小狗与洗脑曲' },
  { url: 'https://thispersondoesnotexist.com/', label: '这个人不存在(AI 生成的脸)' },
  { url: 'https://radio.garden/', label: '转动地球,收听世界各地电台' },
  { url: 'https://www.mapcrunch.com/', label: '随机降落到地球某个街景' },
  { url: 'https://stars.chromeexperiments.com/', label: '飞越十万颗恒星' },
  { url: 'https://pudding.cool/', label: 'The Pudding:可视化故事' },
  { url: 'https://ncase.me/', label: 'Nicky Case 的可玩解释' },
  { url: 'https://explorabl.es/', label: 'Explorable Explanations 合集' },
  { url: 'https://quickdraw.withgoogle.com/', label: 'AI 猜你的涂鸦' },
  { url: 'https://experiments.withgoogle.com/', label: 'Google 创意实验室' },
  { url: 'https://musiclab.chromeexperiments.com/', label: 'Chrome 音乐实验室,随手作曲' },
  { url: 'https://learningsynths.ableton.com/', label: 'Ableton 教你玩合成器' },
  { url: 'https://zombo.com/', label: 'Zombo.com(你什么都能做)' },
  { url: 'https://hackertyper.net/', label: '假装黑客狂敲代码' },
  { url: 'https://cameronsworld.net/', label: 'GeoCities 老网页大杂烩' },
  { url: 'https://wikitrivia.tomjwatson.com/', label: '维基时间线排序游戏' },
  { url: 'https://findtheinvisiblecow.com/', label: '找到那头看不见的牛' },
  { url: 'https://www.boredbutton.com/', label: '无聊按钮,随机小玩意' },
  { url: 'https://asoftmurmur.com/', label: '自调环境白噪音' },
  { url: 'https://mynoise.net/', label: 'myNoise:各种噪音生成器' },
  { url: 'https://ventusky.com/', label: '很美的全球天气动图' },
  { url: 'https://en.wikipedia.org/wiki/Special:Random', label: '随机一篇维基百科' },
  { url: 'https://en.wikipedia.org/wiki/Wikipedia:Unusual_articles', label: '维基上最离奇的条目' },
  { url: 'https://apod.nasa.gov/apod/astropix.html', label: 'NASA 天文每日一图' },
  { url: 'https://htwins.net/scale2/', label: '从量子到宇宙的尺度' },
  { url: 'https://www.window-swap.com/', label: '看一眼陌生人的窗外' },
  { url: 'https://eelslap.com/', label: '用鳗鱼扇他耳光(无厘头)' },
  { url: 'https://koalastothemax.com/', label: '越点越清晰的像素图' },
  { url: 'https://puginarug.com/', label: '一只裹在毯子里的巴哥' },
  { url: 'https://cat-bounce.com/', label: '满屏弹跳的猫' },
  { url: 'https://corndog.io/', label: '无限玉米热狗' },
  { url: 'https://beesbeesbees.com/', label: '蜜蜂蜜蜂蜜蜂' },
  { url: 'https://artsandculture.google.com/', label: 'Google 艺术与文化' },
  { url: 'https://archive.org/', label: '互联网档案馆(啥都有)' },
  { url: 'https://www.atlasobscura.com/', label: 'Atlas Obscura:世界奇观' },
  { url: 'https://openprocessing.org/', label: '创意代码作品集' },
];

let lastIndex = -1;

/** 随机取一个站点,避免与上一次重复 */
export function pickSurprise(): SurpriseSite {
  if (SURPRISE_SITES.length <= 1) return SURPRISE_SITES[0];
  let i = lastIndex;
  // 用时间做随机源(应用运行时可用 Math.random)
  while (i === lastIndex) i = Math.floor(Math.random() * SURPRISE_SITES.length);
  lastIndex = i;
  return SURPRISE_SITES[i];
}
