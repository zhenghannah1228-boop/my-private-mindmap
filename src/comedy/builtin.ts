/**
 * 内置笑点(开箱即玩)。都挑广为人知、可查证的经典情景喜剧笑点。
 * 只做短引用 + 描述,不搬长台词。用户可用「复制采集指令」让 AI 产出更多。
 */

import type { Joke } from './types';

const office: Joke = {
  id: 'office-identity-theft',
  show: 'The Office(美版)',
  episode: 'S3E20《Product Recall》冷开场',
  title: '「Identity theft is not a joke, Jim!」',
  setup:
    'Jim 长期恶作剧捉弄同事 Dwight。这天他穿上和 Dwight 一模一样的黄衬衫、戴上眼镜,面无表情地模仿 Dwight 的说话方式:「Bears. Beets. Battlestar Galactica.」',
  punchline:
    'Dwight 被激怒,一本正经地怒吼:「Identity theft is not a joke, Jim! 每年有几百万个家庭深受其害!」——他把一个无聊的模仿,当成了天大的严肃罪案。',
  factors: ['character', 'deadpan', 'escalation', 'running'],
  analysis:
    '这个笑点几乎完全由角色驱动:Jim 招牌的面无表情模仿(一本正经),对上 Dwight 把小事看得无比严重的性格(角色反差)。Dwight 把「被模仿」上纲上线到「几百万家庭受害」,是荒诞的加码;而这又建立在 Jim 常年整蛊 Dwight 的重复梗之上,观众一看就懂、越熟越乐。',
};

const friends: Joke = {
  id: 'friends-pivot',
  show: 'Friends(老友记)',
  episode: '第五季',
  title: '「PIVOT!」搬沙发',
  setup:
    'Ross 新买了一张沙发,为省下高昂的送货费,坚持自己和 Rachel、Chandler 一起把它从狭窄的楼梯搬上楼。转角处沙发卡住,Ross 站在最有利的指挥位不停发号施令。',
  punchline:
    'Ross 一遍遍越喊越大声地吼「Pivot! ……Pivot! ……PIVOT!」,而沙发纹丝不动;被 Chandler 一句冷冷的「无论你说多少遍,它都动不了」噎回去。最后沙发被锯成了两半。',
  factors: ['running', 'escalation', 'character', 'timing'],
  analysis:
    '笑点在于同一个词「pivot」的重复与音量升级,和沙发的纹丝不动形成落差(重复梗 + 荒诞加码)。Ross 那种「我明明在正确指挥」的迷之自信,是典型的性格喜剧(角色反差);而 Chandler 恰到好处的吐槽停顿,精准踩在节奏上(喜剧时机)。',
};

const b99: Joke = {
  id: 'b99-sex-tape',
  show: 'Brooklyn Nine-Nine(神烦警探)',
  episode: '贯穿全剧的重复梗',
  title: '「Title of your sex tape」',
  setup:
    'Jake Peralta 是个长不大的天才警探。每当有人无意间说出一句听起来有点暧昧歧义的话……',
  punchline:
    '他都会立刻接一句:「Title of your sex tape.(你性爱录像带的片名)」——把一句正经对白瞬间歪成黄段子,屡试不爽。',
  factors: ['running', 'wordplay', 'character'],
  analysis:
    '这是一个标准的重复梗:观众逐渐学会「预判」它,预期本身就成了笑点。它靠双关运作——把无心的一句话强行读出第二层歧义(谐音双关);而它之所以成立,是因为出自 Jake 这个长不大的角色之口,换个严肃角色就不好笑了(角色反差)。',
};

const arrested: Joke = {
  id: 'arrested-banana-stand',
  show: 'Arrested Development(发展受阻)',
  episode: '第一季',
  title: '「香蕉摊里永远有钱」',
  setup:
    '父亲 George Sr. 反复对儿子 Michael 说一句莫名其妙的话:「There’s always money in the banana stand(香蕉摊里永远有钱)。」Michael 以为这只是老爸的鸡汤空话,不以为意。',
  punchline:
    'Michael 一怒之下烧掉了家里的香蕉摊,父亲崩溃:那句话是字面意思——摊子的墙里塞了整整二十五万美元现金。「我还能说得多清楚?香蕉摊里,永远,有钱!」',
  factors: ['callback', 'irony', 'subvert'],
  analysis:
    '这是回旋镖式笑点的教科书:一句反复出现、被当成废话的台词,在很久之后突然「字面成真」,前面所有的重复都成了铺垫(回旋镖)。观众和 Michael 一样把它当比喻,真相却是字面意义,制造了强烈的反讽与颠覆预期——你以为的空话,原来是最实在的提示。',
};

export const BUILTIN_JOKES: Joke[] = [office, friends, b99, arrested];
