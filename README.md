# 闪念图谱 · Mind Map for Scattered Thinking

给 ADHD 使用者的「零摩擦捕捉 + 事后关联」思维工具。设计原则:**先捕捉、后整理**,
允许任意跨分支连线而非强制树形结构。

本仓库是把已验证的单文件原型(`docs/prototype.html`)迁移为工程化代码的正式项目。

## 技术栈

React 18 + TypeScript + Vite + Zustand。画布用 DOM 绝对定位 + SVG 连线(原型验证
<500 节点无压力)。

## 开发

```bash
npm install
npm run dev        # 本地开发
npm run build      # 类型检查 + 构建到 dist/
npm run preview    # 预览构建产物
```

部署:静态托管即可(已附 `vercel.json`)。**部署到域名很重要** —— `file://` 打开时
Chrome 把每个文件路径当独立 origin,localStorage 会「丢数据」;域名下根治。

## 已实现(本次迁移 = 骨架 + P0)

- 无限画布:平移、滚轮/捏合缩放(0.25×–2.5×)、聚焦全部节点(修正版:算 bounding box 反推缩放)
- 零摩擦建节点:双击空白 / 工具栏「＋节点」后点画布 → 立即可编辑
- 任意连线:桌面拖端口、移动端长按节点进入连线模式;点击连线删除(二次确认)
- 闪念收集箱:回车即存;拖拽条目到画布转节点,保留原始时间戳
- 时间维度:`createdAt` / 可选 `dueAt`、24h 内标红、相对时间格式、时间轴 / 最近两种过滤(dim 而非隐藏)
- 5 色标记
- localStorage 自动持久化(防抖)、JSON 导入(**二次确认**)/ 导出
- Supabase 共享同步码上传 / 下载(下载前提示云端更新时间 + 二次确认)

### P0 亮点:统一 Pointer Events(移动端可用)

`src/ui/usePointerInteraction.ts` 是核心。原型只绑 mouse、手机完全不可用;现在
全部改用 Pointer Events,一套代码覆盖鼠标 + 触摸:

- 单指拖节点 / 拖空白平移
- 双指捏合缩放 + 双指平移
- 长按节点 400ms → 连线模式(触摸屏没有 hover,替代端口)
- 双击 / 放置模式 → 新节点;`touch-action: none` 防止浏览器抢手势

## 目录

```
src/
  core/     纯逻辑:types / model / time / filter / viewport / storage
  sync/     supabase 云端同步
  store/    Zustand:useStore(主状态) / useSizeStore(节点尺寸) / persist(持久化副作用)
  ui/       React 组件 + usePointerInteraction(指针状态机)
docs/
  prototype.html      可运行的原始原型,行为以它为准
  handoff-notes.md    原型拆解与技术债说明
```

## 路线图(按优先级)

- **P1** 撤销/重做(Zustand 中间件);同步冲突升级(节点级 last-write-wins / UUID)
- **P2** Supabase Auth + RLS 收紧(替换共享同步码);渲染性能(拖拽期脱离 React state);搜索定位;到期通知;多选框选;迷你地图

详见 `docs/handoff-notes.md` 与 PR 描述。

## 设计约束(不要违背)

- 任何输入都不超过一步(加想法 = 双击 + 打字,无弹窗/必填/选类型)
- 不强制结构、不自动布局(空间记忆是特性)
- 不丢数据(覆盖性操作二次确认或可撤销)
- 克制配色(米白 `#faf9f7` / 灰边 `#d3d1c7` / 紫强调 `#534ab7`)、无动效、中文优先
