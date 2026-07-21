/**
 * 内置迷因(开箱即玩)。都挑传播史相对清楚、可查证的经典迷因。
 * 用户可通过「复制采集指令」让任意 AI 产出更多,导入即玩。
 */

import type { Meme } from './types';

const doge: Meme = {
  id: 'doge',
  title: 'Doge(柴犬)',
  summary: '一只侧眼柴犬 + 彩色 Comic Sans 蹩脚英文内心独白,后来还变成了加密货币。',
  startId: 'now',
  originId: 'photo',
  stations: [
    {
      id: 'now',
      kind: 'mutation',
      title: '你熟悉的那只 Doge',
      date: '2013',
      platform: '全网',
      body: '一张柴犬侧眼看镜头的照片,四周飘着彩色 Comic Sans 字体的蹩脚英文内心独白:「such wow、much X、very Y、so Z」。它是怎么从一张普通狗照片变成这样的?先看看[[reddit|它爆红的那一刻]],或者顺流看看它[[coin|后来怎么变成了钱]]。',
      links: [
        { to: 'reddit', rel: 'back', label: '它是怎么爆红的' },
        { to: 'spelling', rel: 'variant', label: '"doge" 这拼写哪来的' },
        { to: 'coin', rel: 'forward', label: '后来变成了一种货币' },
      ],
    },
    {
      id: 'reddit',
      kind: 'spread',
      title: '2013:蹩脚英文「doge speak」引爆',
      date: '2013 年中',
      platform: 'Reddit / Tumblr',
      body: '2013 年夏秋,这张柴犬照片配上刻意错乱的语法(把 very/much/so 乱接名词)在 Reddit、Tumblr 上迅速扩散,形成了独特的「doge speak」。这种人人都能照着造句的模板,是它裂变的关键。再往前一步,[[photo|照片里的狗本尊是谁]]?',
      links: [
        { to: 'photo', rel: 'back', label: '照片本尊是谁' },
        { to: 'now', rel: 'forward', label: '回到如今的形态' },
      ],
      sources: [{ label: 'Know Your Meme: Doge' }],
    },
    {
      id: 'photo',
      kind: 'origin',
      title: '起点:2010 年,柴犬 Kabosu',
      date: '2010.02',
      platform: '个人博客(日本)',
      body: '源头是一只被收养的日本柴犬 Kabosu。主人佐藤敦子(一位幼儿园老师)2010 年在博客上传了它坐在沙发上、微微侧眼的照片——正是这张表情,日后成了全世界的 Doge。它如何[[reddit|被玩成一个梗]]?',
      links: [{ to: 'reddit', rel: 'forward', label: '它如何被玩成梗' }],
      sources: [{ label: 'Kabosu / 佐藤敦子 博客' }],
    },
    {
      id: 'spelling',
      kind: 'spread',
      title: '「doge」这个拼写的来历',
      date: '2005 / 2010',
      platform: 'Homestar Runner',
      body: '把 dog 故意拼成「doge」并非 2013 年才有:早在 2005 年动画《Homestar Runner》里就出现过这个玩笑拼写。它像一个沉睡的语言彩蛋,等到 2013 年柴犬照片出现,两者一拍即合。回到[[now|如今的 Doge]]。',
      links: [{ to: 'now', rel: 'forward', label: '回到如今的 Doge' }],
    },
    {
      id: 'coin',
      kind: 'mutation',
      title: '2013.12:Doge 变成了 Dogecoin',
      date: '2013.12',
      platform: '加密货币',
      body: '2013 年底,程序员 Billy Markus 与 Jackson Palmer 半开玩笑地用 Doge 形象做了一种加密货币 Dogecoin,本意是讽刺币圈的狂热。没想到梗的亲和力反过来给了它生命力。它后来还被[[musk|名人反复助推]]。',
      links: [
        { to: 'musk', rel: 'forward', label: '名人助推与复活' },
        { to: 'now', rel: 'back', label: '回到梗本身' },
      ],
    },
    {
      id: 'musk',
      kind: 'decline',
      title: '名人助推:一次次被拉回聚光灯',
      date: '2019 起',
      platform: 'Twitter/X',
      body: '此后每隔一段时间,名人(尤其是马斯克)的一条推文就能把 Dogecoin 和 Doge 形象重新顶上热搜——这是典型的「大 V 助推」让一个老梗反复复活。Kabosu 本尊于 2024 年离世,人们又一次集体缅怀。',
      links: [{ to: 'coin', rel: 'back', label: '回到 Dogecoin 的诞生' }],
    },
  ],
  factors: ['remix', 'incongruity', 'lowbar', 'ingroup', 'platform'],
  analysis:
    'Doge 的走红是几股力量叠加:蹩脚英文「doge speak」是一个极易套用的模板(可改编性 + 参与门槛低),谁都能照着给自家宠物配字;柴犬那张一本正经的侧眼与荒诞内心独白之间的反差制造了记忆点(反差意外);会心一笑背后是一层网络亚文化的暗号(圈层信号);而它以图片形态在 Reddit/Tumblr 这类视觉平台传播,天然契合平台机制(平台适配)。后期 Dogecoin 与名人助推则让它一次次复活。',
};

const rickroll: Meme = {
  id: 'rickroll',
  title: 'Rickroll(瑞克摇)',
  summary: '一个看似正经的链接,点开却是 Rick Astley 1987 年的《Never Gonna Give You Up》。',
  startId: 'now',
  originId: 'duckroll',
  stations: [
    {
      id: 'now',
      kind: 'mutation',
      title: '你又被 Rickroll 了',
      date: '至今',
      platform: '全网',
      body: '有人发你一个「重要资料」的链接,满心期待点开——结果是 Rick Astley 在 1987 年 MV 里边跳边唱《Never Gonna Give You Up》。这个「诱骗式跳转」的套路是哪来的?它其实有个更早的[[duckroll|鸭子祖宗]]。',
      links: [
        { to: 'fourchan', rel: 'back', label: '第一次 Rickroll' },
        { to: 'song', rel: 'variant', label: '那首歌本身的故事' },
        { to: 'peak', rel: 'forward', label: '它怎么破圈的' },
      ],
    },
    {
      id: 'fourchan',
      kind: 'spread',
      title: '2007:第一次「Rickroll」',
      date: '2007.05',
      platform: '4chan',
      body: '2007 年,有人在 4chan 上把一个备受期待的《侠盗猎车手 IV》预告链接,偷换成了 Rick Astley 的 MV。「rickroll」这个词就此诞生。它沿用的正是更早的[[duckroll|duckroll]]套路——只是把payload换成了这首歌。',
      links: [
        { to: 'duckroll', rel: 'back', label: '套路的祖宗:duckroll' },
        { to: 'now', rel: 'forward', label: '回到如今' },
      ],
      sources: [{ label: 'Know Your Meme: Rickroll' }],
    },
    {
      id: 'duckroll',
      kind: 'origin',
      title: '起点:duckroll(鸭子诱骗)',
      date: '2006',
      platform: '4chan',
      body: '一切的源头是 4chan 上的「duckroll」:论坛把某个词自动替换成一张「装着轮子的鸭子」图,于是点开看似正经的链接总会跳到那只鸭子。这种「诱骗式跳转」的恶作剧格式,就是 Rickroll 的直接祖先。换个 payload,它就[[fourchan|变成了 Rickroll]]。',
      links: [{ to: 'fourchan', rel: 'forward', label: '换成那首歌之后' }],
    },
    {
      id: 'song',
      kind: 'spread',
      title: 'payload 本身:1987 的那首歌',
      date: '1987',
      platform: '流行音乐',
      body: '被拿来当「陷阱」的,是英国歌手 Rick Astley 1987 年的单曲《Never Gonna Give You Up》——一首旋律洗脑、MV 舞步略显尴尬的经典。正是这份「无害又上头」的气质,让它成了完美的恶作剧素材。看它如何[[peak|从恶作剧变成全民梗]]。',
      links: [{ to: 'peak', rel: 'forward', label: '破圈时刻' }],
    },
    {
      id: 'peak',
      kind: 'peak',
      title: '2008:破圈进入主流',
      date: '2008',
      platform: '主流媒体',
      body: '2008 年愚人节,YouTube 把首页所有精选视频都做成了 Rickroll;同年 Rick Astley 本人还在梅西感恩节大游行上突然现身开唱。恶作剧就此从论坛暗号变成全民都懂的梗。此后它成了[[evergreen|常青的互联网仪式]]。',
      links: [
        { to: 'evergreen', rel: 'forward', label: '常青与复活' },
        { to: 'now', rel: 'back', label: '回到套路本身' },
      ],
    },
    {
      id: 'evergreen',
      kind: 'decline',
      title: '常青:十几年后依然有效',
      date: '2020s',
      platform: 'YouTube',
      body: '十几年过去,原版 MV 在 YouTube 收获超过 10 亿次播放,Rickroll 仍是屡试不爽的整蛊,甚至被用在抗议、发布会彩蛋里。一个「无害的惊吓」为什么能长盛不衰?去[[now|再被摆一道]]或想想它的成因。',
      links: [{ to: 'now', rel: 'back', label: '再被摆一道' }],
    },
  ],
  factors: ['incongruity', 'lowbar', 'ingroup', 'amplifier', 'platform'],
  analysis:
    'Rickroll 的持久魅力在于:它建立在「诱骗式跳转」这个可无限复用的格式上(可改编性),而参与成本极低——你只要粘贴一个链接(参与门槛低);点开瞬间的「被摆一道」制造了无害的意外与反差(反差意外);懂的人相视一笑,是一种圈内默契(圈层信号);2008 年 YouTube 与主流媒体的助推让它彻底破圈(大V助推);而它本质是一个超链接恶作剧,与论坛/网页的分享机制完美契合(平台适配)。',
};

const thisIsFine: Meme = {
  id: 'thisisfine',
  title: 'This is fine(没事,挺好的)',
  summary: '一只戴帽子的狗坐在燃烧的房间里,端着咖啡说「This is fine」。',
  startId: 'now',
  originId: 'comic',
  stations: [
    {
      id: 'now',
      kind: 'mutation',
      title: '烈火中的「This is fine」',
      date: '2016 起',
      platform: '全网',
      body: '一只卡通狗坐在着火的房间里,四周烈焰,它却端着咖啡淡定地说:「This is fine.」它被用来形容任何「明明一团糟却假装镇定」的处境。但很多人不知道:它原本[[comic|是一整则更长的漫画]]。',
      links: [
        { to: 'crop', rel: 'back', label: '它被裁成两格之前' },
        { to: 'politics', rel: 'forward', label: '它如何进入政治场' },
      ],
    },
    {
      id: 'crop',
      kind: 'spread',
      title: '2014:被裁成两格',
      date: '2014',
      platform: 'Tumblr / Twitter',
      body: '原漫画有六格,结局其实相当黑暗。2014 年前后,网友只截取了前两格——狗说「This is fine」的那一刻——脱离原语境后,它变成了万能的「嘴硬式镇定」表情。它的[[comic|完整版]]是什么样?',
      links: [
        { to: 'comic', rel: 'back', label: '看完整六格' },
        { to: 'now', rel: 'forward', label: '回到如今' },
      ],
    },
    {
      id: 'comic',
      kind: 'origin',
      title: '起点:2013,KC Green 的《On Fire》',
      date: '2013.01',
      platform: '网络漫画 Gunshow',
      body: '源头是漫画家 KC Green 2013 年的网络漫画《Gunshow》第 648 话《On Fire》。完整六格里,那只狗最终在烈火中融化——是一则关于「否认与自我毁灭」的黑色幽默。被截掉后半段后,它才变得「正能量」。看它[[crop|被裁剪]]后发生了什么。',
      links: [{ to: 'crop', rel: 'forward', label: '被裁剪之后' }],
      sources: [{ label: 'KC Green, Gunshow #648 "On Fire"' }],
    },
    {
      id: 'politics',
      kind: 'peak',
      title: '2016:成为「灾难现场」的代名词',
      date: '2016',
      platform: '推特 / 新闻',
      body: '2016 年前后,它被大量用于形容政治与社会的「灾难现场」,一度被政党官方账号引用又删除,彻底破圈。凡是「局面失控但还在强撑」,人们就甩出这只狗。它后来还[[notfine|反过来被原作者玩了一把]]。',
      links: [
        { to: 'notfine', rel: 'forward', label: '"This is not fine"' },
        { to: 'now', rel: 'back', label: '回到那两格' },
      ],
    },
    {
      id: 'notfine',
      kind: 'decline',
      title: '复活:「This is NOT fine」',
      date: '2016 起 / 2020',
      platform: '周边 / 公益',
      body: '原作者 KC Green 顺势推出续作与周边「This is NOT fine」——那只狗终于跳起来救火,把「假装没事」翻转成「行动起来」。2020 年疫情期间,这个梗又一次被集体唤醒。',
      links: [{ to: 'politics', rel: 'back', label: '回到破圈时刻' }],
    },
  ],
  factors: ['emotion', 'remix', 'timing', 'ingroup', 'platform'],
  analysis:
    'This is fine 击中的是一种普遍情绪:在失控局面里假装镇定的无力与自嘲(情绪强度)。它是一个可以套进任何糟糕处境的万能模板(可改编性),尤其在 2016 年的政治与社会动荡里踩中了集体情绪(时机搭车);用它的人彼此心照不宣地共享一种黑色幽默(圈层信号);而两格漫画的形态极适合在推特等平台一图传播(平台适配)。有趣的是,它的走红恰恰来自「断章取义」——截掉了原作更黑暗的结局。',
};

export const BUILTIN_MEMES: Meme[] = [doge, rickroll, thisIsFine];
