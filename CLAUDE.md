# 项目约定（给 Claude 的长期指令）

## 迷因搜集：自动内置并推送（用户长期授权,无需逐次确认）

当用户让我「搜集 / 收集某个 meme」时,默认走完整流程,**不必再问确认**:

1. 产出该迷因的探踪 JSON（结构见 `src/meme/types.ts` 的 `MEME_PROMPT`;
   字段真实可查,拿不准的时间/出处标「存疑」,不编造会失效的图片直链——
   `image.url` 拿不准就省略,交给用户自己贴真图）。
2. 把它加成**内置迷因**:追加到 `src/meme/builtin.ts` 的 `BUILTIN_MEMES`
   （沿用同样的站点/链接/factors/analysis 结构;可给站点配 `art` key,
   art 插画在 `src/meme/art.tsx`,没有合适的就不配）。
3. `npm run build` 通过 + 必要时 Playwright 自检(零控制台错误)。
4. 提交并推到开发分支 `claude/adhd-mindmap-refactor-b8nill`。
5. 回话里简述加了哪个迷因、几个站点即可。

要点:自动执行到「已推送」,中途不打断用户;只有当迷因史实明显存疑、
或结构无法自洽时才回来问。

## 开发分支

所有改动开发并推送到 `claude/adhd-mindmap-refactor-b8nill`;draft PR #1
长期维护。除非用户明确同意,不推其它分支。

## 迷因探踪模块速览

- 数据模型 / 采集指令:`src/core`(公共)、`src/meme/types.ts`
- 内置迷因:`src/meme/builtin.ts`;手绘示意插画:`src/meme/art.tsx`
- 状态:`src/meme/useMemeStore.ts`（内置 + 导入迷因、真图覆盖、注释、进度）
- 界面:`src/meme/MemeTracking.tsx`
- 全站严格黑白 + 手绘风;图片二进制存 IndexedDB,元数据/注释存 localStorage
