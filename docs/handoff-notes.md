# 闪念图谱 — 交接说明

给 Claude Code 的原型拆解。**这些文件不是要直接用的生产代码**,
而是把原型 `mindmap-v2.html` 里的隐性知识显性化,方便重写时不丢东西。

## 怎么读

按这个顺序,先看约束再看实现:

| 顺序 | 文件 | 为什么重要 |
|---|---|---|
| 1 | `src/ui/interaction.js` | **最重要**。交互状态机 + 不变量 + 移动端待办。原型的 bug 全在这块 |
| 2 | `src/core/viewport.js` | 坐标变换数学。写错就是"拖拽漂移""缩放跑偏",很难 debug |
| 3 | `src/core/model.js` | 数据结构 + ID 策略 |
| 4 | `src/core/filter.js` | 为什么过滤是 dim 而不是 hide —— 这是产品决策不是实现细节 |
| 5 | `src/core/time.js` | 相对时间格式化 + `datetime-local` 时区坑 |
| 6 | `src/sync/supabase.js` | **含两个必须修的问题**:安全模型、冲突处理 |
| 7 | `src/core/storage.js` | localStorage 的 `file://` origin 坑 |
| 8 | `src/ui/render.js` | DOM+SVG 混合方案的取舍,性能债在哪 |
| 9 | `src/ui/tokens.js` | 配色约束(低饱和、单强调色、无动效)背后的原因 |

## 原型的技术债一览

按严重程度排:

1. **移动端完全不可用** — 只绑了 mouse 事件。见 `interaction.js` 顶部注释
2. **同步无鉴权** — 任何人猜到 space_key 就能读写。见 `supabase.js` 顶部警告
3. **同步无冲突处理** — 整份覆盖,多端并发丢数据
4. **无撤销** — 误删节点不可恢复。对 ADHD 用户这是高频场景
5. **全量重绘** — `renderNodes()` 每次都重建全部 DOM
6. **fit 不缩放** — 只居中,节点散开时看不全(`viewport.js` 里给了修正版)
7. **导入是无条件覆盖** — 没有确认,没有合并

## 不要改的东西

这些看起来像是可以"优化"的地方,但都是刻意的:

- 过滤时 dim 而非 hide(保留空间记忆)
- 节点 max-width 230px(强迫想法保持短小)
- 没有动效(避免注意力抢夺)
- 单一强调色
- 不自动布局
- 建节点不需要任何选择或必填项

## 原始原型

`mindmap-v2.html` 是可运行的单文件版本,直接浏览器打开即可对照行为。
拆解出的模块是从它反推的,行为以原型为准。

## Supabase 现状

已建好,不要重建:

- Project: `nxiyifglhycvbrccbdhg` (region ap-southeast-1)
- 表 `public.mindmap_docs`: `space_key text PK` / `data jsonb` / `updated_at timestamptz`
- RLS 已启用,但 anon 三条策略条件均为 `true` — **待收紧**
