/**
 * 设计 token(移植自 handoff/tokens.js)。硬约束,迁移时守住:
 * 1. 低饱和暖白底 #faf9f7 + 灰边 #d3d1c7,不用纯白纯黑(长时间使用疲劳)。
 * 2. 单一强调色紫 #534ab7,只用于选中态/连接点/主按钮。多强调色对注意力障碍是负面因素。
 * 3. 节点色板是 pastel,因为节点上要叠正文。
 * 4. 不要动效(唯一例外:连接点 0.12s 淡入)。这是硬约束,别为「精致」加进来。
 */

export const tokens = {
  color: {
    canvasBg: '#faf9f7',
    sidebarBg: '#f1efe8',
    border: '#d3d1c7',
    borderStrong: '#b4b2a9',
    text: '#2c2c2a',
    textMuted: '#5f5e5a',
    textFaint: '#888780',
    accent: '#534ab7',
    link: '#1d9e75', // 连线进行中的绿色虚线
    danger: '#e24b4a',
    due: '#993C1D',
  },
  node: {
    minWidth: 120,
    maxWidth: 230, // 故意限窄 —— 强迫想法保持短小
  },
  edge: {
    stroke: '#b4b2a9',
    width: 1.6,
    dimOpacity: 0.15,
  },
  sidebar: { width: 270 },
} as const;
