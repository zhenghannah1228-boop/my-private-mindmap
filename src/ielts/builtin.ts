/**
 * 内置错题示例:每个技能 2 条,演示结构和交互,方便你替换成自己的真实错题。
 * 均为自拟的典型考点示例,不是任何真实试题的逐字摘录。
 */

import type { WrongQuestion } from './types';

export const BUILTIN_WRONG_QUESTIONS: WrongQuestion[] = [
  {
    id: 'lis-closing-time',
    skill: 'listening',
    qtype: '表格填空',
    source: '示例',
    stem: '场景:图书馆注册对话。原文提到 "The library is open until a quarter to ten on weekdays." 题目要求填写 Closing time (weekdays): ___。',
    yourAnswer: '9:15',
    correctAnswer: '9:45 (pm)',
    tags: ['numbers', 'mishear'],
    analysis:
      'a quarter to ten = 9:45,不是 9:15(那是 a quarter past nine)。钟点加减表达(quarter to / quarter past / half past)是听力数字题的经典陷阱,考前要把这套说法整体过一遍,听到 to/past 就条件反射换算,别只抓「quarter」和「ten」两个词拼答案。',
  },
  {
    id: 'lis-self-correct',
    skill: 'listening',
    qtype: '地图/位置题',
    source: '示例',
    stem: '场景:新生校园介绍。原文先说 "The new gym is next to the library", 紧接着说 "Actually, sorry, I mean it\'s next to the cafeteria — they changed the plan." 问新健身房的位置。',
    yourAnswer: 'next to the library',
    correctAnswer: 'next to the cafeteria',
    tags: ['distractor', 'skim'],
    analysis:
      '说话人自我订正(Actually / Sorry, I mean...)后面跟的才是最终答案,前面说的内容是典型干扰项。听力里只要出现自我更正的信号词,一定以后面那句为准,不能听到第一个答案就提前填完不再往下听。',
  },
  {
    id: 'read-false-vs-ng',
    skill: 'reading',
    qtype: 'True/False/Not Given',
    source: '示例',
    stem: '原文:"Although some scientists believe the effect is temporary, no long-term study has confirmed this." 题目:"Long-term studies have confirmed the effect is temporary." 判断 TRUE/FALSE/NOT GIVEN。',
    yourAnswer: 'NOT GIVEN',
    correctAnswer: 'FALSE',
    tags: ['inference', 'paraphrase'],
    analysis:
      '原文明确说「没有长期研究证实这一点」,这是对题目说法的直接否定,属于 FALSE,不是没提到。只要原文有对应信息且与题干矛盾就是 FALSE;原文压根没提这件事才是 NOT GIVEN。混淆这两者是阅读判断题最大的丢分点,做题时先问自己「原文到底有没有提」,再问「提的内容是否矛盾」。',
  },
  {
    id: 'read-heading-surface',
    skill: 'reading',
    qtype: 'Matching Headings',
    source: '示例',
    stem: '段落大意是「企业把环保宣传当营销噱头,实际行动很少跟上」,选项里有一条写的是 "The gap between environmental claims and corporate action"。',
    yourAnswer: '选了另一个字面出现 "green" 和 "sustainable" 的选项',
    correctAnswer: '"The gap between environmental claims and corporate action"',
    tags: ['paraphrase', 'distractor'],
    analysis:
      '段落大意题考的是同义概括,不是关键词匹配。字面出现相同单词的选项往往是干扰项,真正命中的选项通常会把段落意思换一种说法概括出来。读完段落先自己用一句话总结大意,再去选项里找意思最接近的,而不是回头去原文「找词」。',
  },
  {
    id: 'write-task1-repeat-word',
    skill: 'writing',
    qtype: 'Task 1 图表描述',
    source: '示例',
    stem: '一篇柱状图作文里,描述所有上升的数据全部重复用 "increase",没有变化用词,也没有根据升幅大小用程度副词。',
    correctAnswer: '轮换使用 rise / climb / surge / grow / go up 等同义词,并按升幅大小搭配 sharply / steadily / slightly 等副词区分幅度。',
    tags: ['vocab', 'structure'],
    analysis:
      'Lexical Resource 评分看的是词汇多样性和准确性,反复用同一个词会直接拉低这一项分数。Task 1 常见趋势词(increase/rise/climb/surge, decrease/fall/drop/decline, fluctuate, remain stable)平时就要整理成一张表,写之前先选好要用的那几个,别临场只会用最基础的那个。',
  },
  {
    id: 'write-task2-half-question',
    skill: 'writing',
    qtype: 'Task 2 议论文',
    source: '示例',
    stem: '题目要求 "Discuss both views and give your own opinion",作文只分析了其中一个观点,就直接给出了自己的结论,没有讨论另一方。',
    correctAnswer: '按题目结构逐一展开:先分别讨论两种观点各自的理由,最后再给出并论证自己的立场。',
    tags: ['offtopic', 'structure'],
    analysis:
      'Task Response 要求完整回应题目所有部分,只讨论一个观点属于「部分跑题」,无论论证多精彩都会被限分。审题时先把题目拆成几个必须回应的动作(discuss both views / give your own opinion),写完对照题目逐条检查有没有漏掉。',
  },
  {
    id: 'speak-part2-too-short',
    skill: 'speaking',
    qtype: 'Part 2 长题',
    source: '示例',
    stem: 'Part 2 话题卡 "Describe a skill you want to learn",只说了 40 秒左右就没话说,提前停下来等考官。',
    correctAnswer: '按卡片给出的几个提示点(what / why / how / benefit)逐一展开,每一点补一个具体细节或小故事,撑满 1 分半到 2 分钟。',
    tags: ['time', 'structure'],
    analysis:
      '提前说完是 Fluency and Coherence 的硬伤,考官不会主动帮你延长。拿到卡片先用几秒钟按提示点列好要讲的内容顺序,每点都加一句「比如……」的具体例子,内容量自然就够了,也更不容易卡壳。',
  },
  {
    id: 'speak-part3-no-reason',
    skill: 'speaking',
    qtype: 'Part 3 讨论题',
    source: '示例',
    stem: 'Part 3 问 "Do you think technology makes people more isolated?",只回答 "Yes, I think so." 就停住,考官追问才继续展开。',
    correctAnswer: '观点 + 理由 + 例子的完整论证链:先表态,再说明原因,最后补一个具体例子或对比。',
    tags: ['structure', 'offtopic'],
    analysis:
      'Part 3 考的是抽象话题的论证能力,只给结论没有论证属于「答非所问」里最常见的一种——内容不够。平时练习时强迫自己每道 Part 3 题至少说三句:观点一句、理由一句、例子一句,把这个节奏练成肌肉记忆。',
  },
];
