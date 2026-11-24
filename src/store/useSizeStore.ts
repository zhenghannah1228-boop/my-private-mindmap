/**
 * 节点尺寸登记表。
 *
 * 为什么单独存:节点宽度由内容撑开(min 120 / max 230),连线端点需要节点的
 * 真实 w/h。原型靠「renderNodes 之后再 renderEdges」保证顺序;这里改成:
 * NodeView 挂载/文本变化时上报尺寸,Edges 订阅 version 触发重算。解耦渲染依赖。
 */

import { create } from 'zustand';

interface SizeStore {
  sizes: Map<number, { w: number; h: number }>;
  version: number;
  report: (id: number, w: number, h: number) => void;
  drop: (id: number) => void;
}

export const useSizeStore = create<SizeStore>((set, get) => ({
  sizes: new Map(),
  version: 0,
  report(id, w, h) {
    const cur = get().sizes.get(id);
    if (cur && cur.w === w && cur.h === h) return; // 无变化不触发重绘
    const sizes = new Map(get().sizes);
    sizes.set(id, { w, h });
    set({ sizes, version: get().version + 1 });
  },
  drop(id) {
    if (!get().sizes.has(id)) return;
    const sizes = new Map(get().sizes);
    sizes.delete(id);
    set({ sizes, version: get().version + 1 });
  },
}));
