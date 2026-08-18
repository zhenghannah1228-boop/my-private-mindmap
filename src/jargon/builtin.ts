/**
 * 内置大厂黑话(开箱即读)。都挑真实高频、广为流传的词。
 * 「人话」力求准确、带点会心吐槽。用户可用「复制采集指令」让 AI 扩充。
 */

import type { Jargon } from './types';

export const BUILTIN_JARGON: Jargon[] = [
  // 战略愿景
  { id: 'ding-ceng-she-ji', term: '顶层设计', category: '战略愿景', plain: '领导拍板定的大方向,普通人别问细节。', example: '这个要顶层设计,我们今天先不展开。' },
  { id: 'di-ceng-luo-ji', term: '底层逻辑', category: '战略愿景', plain: '最根本的道理/原因;显得你想得比别人深。', example: '你还没搞懂这件事的底层逻辑。' },
  { id: 'zu-he-quan', term: '组合拳', category: '战略愿景', plain: '一次同时干好几件相关的事。', example: '增长要打一套组合拳,不能只靠单点。' },
  { id: 'dui-biao', term: '对标', category: '战略愿景', plain: '参考(抄)竞品或行业头部怎么做。', example: '先对标一下行业第一是怎么做的。' },
  { id: 'ka-wei', term: '卡位', category: '战略愿景', plain: '提前占住一个有利位置,别让对手先上。', example: '这个赛道我们要尽早卡位。' },

  // 组织协作
  { id: 'dui-qi', term: '对齐 / 拉齐', category: '组织协作', plain: '开个会把信息和意见统一一下。', example: '这个点我们会后对齐一下。' },
  { id: 'la-tong', term: '拉通', category: '组织协作', plain: '把几个部门叫到一起协调,打通上下游。', example: '需要拉通一下产品和运营。' },
  { id: 'bi-huan', term: '闭环', category: '组织协作', plain: '有始有终,把事办完并给出反馈。', example: '这件事你要自己形成闭环。' },
  { id: 'fu-pan', term: '复盘', category: '组织协作', plain: '事后总结哪里做得好、哪里翻车。', example: '项目结束我们复盘一次。' },
  { id: 'zhua-shou', term: '抓手', category: '组织协作', plain: '能着手推进的切入点或办法。', example: '目标定了,但还缺一个抓手。' },
  { id: 'ke-li-du', term: '颗粒度', category: '组织协作', plain: '事情做得多细或多粗。', example: '这个方案颗粒度太粗,再拆细点。' },

  // 增长运营
  { id: 'xin-zhi', term: '心智', category: '增长运营', plain: '用户对品牌的印象和认知。', example: '我们要抢占用户心智。' },
  { id: 'si-yu', term: '私域', category: '增长运营', plain: '自己能反复免费触达的用户池(微信群/公众号)。', example: '把公域流量沉淀到私域。' },
  { id: 'lian-lu', term: '链路', category: '增长运营', plain: '用户从看到到下单的完整路径。', example: '优化一下转化链路。' },
  { id: 'po-quan', term: '破圈', category: '增长运营', plain: '突破原有小众人群,被更多人知道。', example: '这次营销成功破圈了。' },
  { id: 'chu-da', term: '触达', category: '增长运营', plain: '把信息推送到用户面前。', example: '提高对目标用户的触达效率。' },

  // 效率提升
  { id: 'fu-neng', term: '赋能', category: '效率提升', plain: '给你资源/工具帮你把事做好——常常是句空话。', example: '中台为业务赋能。' },
  { id: 'jiang-ben-zeng-xiao', term: '降本增效', category: '效率提升', plain: '花更少的钱干更多的活;有时是「裁员」的委婉说法。', example: '今年公司主题是降本增效。' },
  { id: 'ren-xiao', term: '人效', category: '效率提升', plain: '人均产出,用来衡量团队「值不值」。', example: '我们要持续提升团队人效。' },
  { id: 'hui-du', term: '灰度', category: '效率提升', plain: '先小范围上线试运行,再逐步放量。', example: '这个功能先灰度 5% 用户。' },
  { id: 'chen-dian', term: '沉淀', category: '效率提升', plain: '把经验、数据、方法积累留存下来。', example: '把这套打法沉淀成文档。' },
  { id: 'chou-xiang', term: '抽象', category: '效率提升', plain: '提炼出可复用的通用部分。', example: '把这块能力抽象出来,别的业务也能用。' },

  // 万能动词
  { id: 'luo-di', term: '落地', category: '万能动词', plain: '真正做出来、执行到位。', example: '方案很好,关键还是要落地。' },
  { id: 'da-tou', term: '打透', category: '万能动词', plain: '把某一个点做深、做彻底。', example: '先把这个核心场景打透。' },
  { id: 'cheng-jie', term: '承接', category: '万能动词', plain: '接住上游给的需求或流量。', example: '这批流量由你们组承接。' },
  { id: 'dui-jiao', term: '对焦', category: '万能动词', plain: '把注意力聚焦到重点上。', example: '我们先对焦一下核心问题。' },
  { id: 'ji-chuan', term: '击穿 / 打爆', category: '万能动词', plain: '集中资源把一个点做爆。', example: '把这个爆品一次性打爆。' },

  // ── 第二批(2026-07-22 采集) ──
  // 战略愿景
  { id: 'hu-cheng-he', term: '护城河', category: '战略愿景', plain: '别人短期抄不走的竞争优势。', example: '我们的数据就是最深的护城河。' },
  { id: 'di-er-qu-xian', term: '第二曲线', category: '战略愿景', plain: '主业到顶了,得找下一个增长点。', example: '要在主业见顶前找到第二曲线。' },
  { id: 'fei-lun', term: '飞轮', category: '战略愿景', plain: '各环节互相促进、越转越快的正循环——常用来把普通业务说得很宏大。', example: '用户越多内容越好,形成增长飞轮。' },
  { id: 'sheng-tai', term: '生态', category: '战略愿景', plain: '围绕自家产品拉起的一圈相关业务;什么都能叫生态。', example: '我们做的不是产品,是生态。' },

  // 组织协作
  { id: 'dao-pai', term: '倒排', category: '组织协作', plain: '先定死上线日期,再倒着挤排期——通常意味着要加班。', example: '时间紧,按上线日倒排一下。' },
  { id: 'bei-shu', term: '背书', category: '组织协作', plain: '拉个有分量的人或部门给方案站台担保。', example: '这个方案需要老板背书。' },
  { id: 'shou-kou', term: '收口', category: '组织协作', plain: '把散着的事项归拢到一个出口统一处理。', example: '需求太散,由产品统一收口。' },

  // 增长运营
  { id: 'lie-bian', term: '裂变', category: '增长运营', plain: '让老用户拉新用户,一传十、十传百(常靠砍一刀)。', example: '设计一个裂变活动拉新。' },
  { id: 'zhong-cao', term: '种草', category: '增长运营', plain: '通过内容让人产生「我也想买」的念头;反义词是拔草。', example: '找 KOL 种草这款新品。' },
  { id: 'bei-ji-xing', term: '北极星指标', category: '增长运营', plain: '全团队唯一最重要的那个指标,别的都为它服务。', example: '我们的北极星指标是周活跃。' },

  // 效率提升
  { id: 'zhong-tai', term: '中台', category: '效率提升', plain: '把各业务通用的能力抽出来共建共用;一度人人都建,后来又纷纷拆掉。', example: '把风控能力沉淀到中台。' },
  { id: 'dou-di', term: '兜底', category: '效率提升', plain: '最坏情况下的保底方案,出了事有人接着。', example: '这个链路要有兜底逻辑。' },

  // 万能动词
  { id: 'pan-yi-pan', term: '盘一盘', category: '万能动词', plain: '把现状捋一遍、理清楚。', example: '我们先把手里的资源盘一盘。' },

  // 画饼鸡汤
  { id: 'ge-ju-da-kai', term: '格局打开', category: '画饼鸡汤', plain: '劝你别计较眼前得失——通常在让你吃亏时说。', example: '别只看这点绩效,格局打开。' },

  // 画饼鸡汤
  { id: 'chang-qi-zhu-yi', term: '长期主义', category: '画饼鸡汤', plain: '现在没回报也得忍着干,别计较眼前。', example: '我们要坚持长期主义。' },
  { id: 'yong-bao-bian-hua', term: '拥抱变化', category: '画饼鸡汤', plain: '接受(通常对你不利的)变动,别抱怨。', example: '年轻人要学会拥抱变化。' },
  { id: 'huo-de-gan', term: '获得感 / 幸福感', category: '画饼鸡汤', plain: '让员工或用户「觉得」有收获——精神画饼。', example: '要提升员工的获得感和幸福感。' },
  { id: 'yan-chi-man-zu', term: '延迟满足', category: '画饼鸡汤', plain: '好处以后再说,先干活别急。', example: '成长需要延迟满足。' },
  { id: 'all-in', term: 'All in', category: '画饼鸡汤', plain: '把全部资源押注到某个方向。', example: '公司决定 All in AI。' },

  // 考核体系
  { id: 'okr', term: 'OKR', category: '考核体系', plain: '目标(O)+ 关键结果(KR)的目标管理框架;季末打分 0.7 是政治正确答案,1.0 说明你目标定低了。', example: '本季度 OKR 对焦一下,看看大家方向有没有拉齐。' },
];
