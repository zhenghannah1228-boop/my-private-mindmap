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

const seinfeld: Joke = {
  id: 'seinfeld-yada-yada',
  show: 'Seinfeld(宋飞正传)',
  episode: 'S8E19《The Yada Yada》',
  title: '「yada yada yada」略过一切',
  setup:
    'George 的新女友讲话有个习惯:讲到一半就用「yada yada yada(如此这般)」把后半段一笔带过。起初 George 觉得这很省事,还挺欣赏——直到她开始用它略过一些关键得可怕的内容。',
  punchline:
    '她轻描淡写地说「我前男友来过,yada yada yada,我现在累得不行」——George 呆住:被「yada yada」略过去的,到底是什么?!',
  factors: ['subvert', 'irony', 'running', 'timing'],
  analysis:
    '笑点藏在「省略」里:一个用来跳过废话的口头禅,被用来跳过最不能跳过的信息(颠覆预期)。观众和 George 一起脑补空白,想象比明说更好笑(反讽——信息落差全靠听者自己填)。这个短语在整集反复出现、每次略过的内容越来越离谱(重复梗),而每次「yada yada」之后的停顿正是爆笑点(喜剧时机)。这集还把这个词送进了美式日常英语。',
};

const parks: Joke = {
  id: 'parks-whole-ass',
  show: 'Parks and Recreation(公园与游憩)',
  episode: 'Ron Swanson 语录',
  title: '「Never half-ass two things」',
  setup:
    'Ron Swanson 是个极简主义硬汉主管,讨厌政府、热爱木工和早餐肉,说话永远言简意赅。有人同时忙活两件事、两头都没做好,向他讨教。',
  punchline:
    'Ron 面无表情地给出人生箴言:「Never half-ass two things. Whole-ass one thing.(别用半个屁股干两件事,用整个屁股干好一件事。)」',
  factors: ['wordplay', 'deadpan', 'character'],
  analysis:
    '这句笑点是语言游戏的典范:把俚语「half-ass(敷衍)」拆开,顺势造出根本不存在的「whole-ass」,荒唐却逻辑自洽(谐音双关)。Ron 用宣读格言的庄重口吻说出「屁股」,一本正经与内容粗俗的落差(一本正经)正中笑点;而这句话又完美浓缩了 Ron 专注、硬核、不废话的人设(角色反差)——换任何人说都差点意思。',
};

const modernfamily: Joke = {
  id: 'modernfamily-wtf',
  show: 'Modern Family(摩登家庭)',
  episode: 'S1,Phil 的「酷爸爸」宣言',
  title: '「WTF: Why the face?」',
  setup:
    'Phil Dunphy 自封「酷老爸」,坚信自己精通年轻人的一切:会发短信、懂流行语、能和孩子们打成一片。他对着镜头骄傲地展示自己有多懂网络缩写。',
  punchline:
    '他自信满满地解释:「WTF——Why the face?(为啥拉着脸?)」——完美避开正确答案,还浑然不觉。',
  factors: ['irony', 'character', 'cringe'],
  analysis:
    '典型的认知落差笑点:观众都知道 WTF 是什么,唯独最自信的 Phil 不知道(反讽)。他越是笃定地展示「懂」,暴露的就越是「不懂」,这种自我感觉良好的错位正是 Phil 人设的核心(角色反差);屏幕外的我们替他脚趾抠地,又忍不住喜欢这个真诚的傻爸爸(尴尬喜剧)。',
};

const fawlty: Joke = {
  id: 'fawlty-dont-mention-the-war',
  show: 'Fawlty Towers(弗尔蒂旅馆)',
  episode: 'S1E6《The Germans》',
  title: '「Don’t mention the war!」',
  setup:
    '英国旅馆老板 Basil Fawlty 接待一批德国客人。他脑震荡未愈,反复叮嘱员工和自己:千万别提战争,别冒犯客人。',
  punchline:
    '结果他自己每开口一次就「战争」脱口而出一次,一边说「我提了一次,但我觉得我圆回去了」,一边越描越黑,最后干脆踢着正步模仿起希特勒——把「别提」执行成了灾难现场。',
  factors: ['irony', 'escalation', 'running', 'cringe'],
  analysis:
    '这是「越不让做越做」的经典结构:满脑子想着「别提」,反而句句都提(反讽)。同一个失误在几分钟里反复发生、一次比一次严重,从口误一路升级到正步走(重复梗 + 荒诞加码);客人们的表情越来越僵,观众替 Basil 尴尬到窒息(尴尬喜剧)。它常年入选英国喜剧史最佳场面。',
};

export const BUILTIN_JOKES: Joke[] = [office, friends, b99, arrested, seinfeld, parks, modernfamily, fawlty];
