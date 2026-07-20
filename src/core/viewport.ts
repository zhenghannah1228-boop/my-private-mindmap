/**
 * 视口变换(平移 / 缩放)(移植自 handoff/viewport.js)。
 *
 * 变换公式:
 *   屏幕坐标 = 世界坐标 * k + (x, y)
 *   世界坐标 = (屏幕坐标 - (x, y)) / k
 *
 * DOM 实现:给 #world 加 transform: translate(x,y) scale(k),transform-origin 必须 0 0。
 */

import { ZOOM_MAX, ZOOM_MIN } from './model';
import type { MindNode, View } from './types';

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function createView(x = 200, y = 200, k = 1): View {
  return { x, y, k };
}

export function toCss(view: View): string {
  return `translate(${view.x}px,${view.y}px) scale(${view.k})`;
}

export function clampZoom(k: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, k));
}

/**
 * 屏幕坐标 → 世界坐标。
 * clientX/clientY 相对视口,必须先减去画布容器 rect 的 left/top,否则有侧栏时整体偏移。
 */
export function screenToWorld(
  view: View,
  clientX: number,
  clientY: number,
  rect: Rect
): { x: number; y: number } {
  return {
    x: (clientX - rect.left - view.x) / view.k,
    y: (clientY - rect.top - view.y) / view.k,
  };
}

/**
 * 以某个锚点(相对画布容器的坐标)缩放,让锚点下的世界坐标保持不动。
 * 推导:(m - x1)/k1 = (m - x2)/k2 → x2 = m - (m - x1)*(k2/k1)
 */
export function zoomAtFactor(
  view: View,
  anchorX: number,
  anchorY: number,
  factor: number
): View {
  const k2 = clampZoom(view.k * factor);
  return {
    k: k2,
    x: anchorX - (anchorX - view.x) * (k2 / view.k),
    y: anchorY - (anchorY - view.y) * (k2 / view.k),
  };
}

/** 滚轮缩放:deltaY<0 放大 */
export function zoomAtWheel(view: View, anchorX: number, anchorY: number, deltaY: number): View {
  return zoomAtFactor(view, anchorX, anchorY, deltaY < 0 ? 1.1 : 1 / 1.1);
}

/**
 * 聚焦全部节点(修正版:算 bounding box 反推 k,不再像原型那样固定 k=1)。
 * sizes 可选,若提供则把节点自身宽高纳入 box,fit 更精确。
 */
export function fitToNodes(
  nodes: MindNode[],
  rect: Rect,
  sizes?: Map<number, { w: number; h: number }>,
  pad = 120
): View {
  if (!nodes.length) return createView();

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const s = sizes?.get(n.id);
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (s?.w ?? 0));
    maxY = Math.max(maxY, n.y + (s?.h ?? 0));
  }

  const boxW = maxX - minX || 1;
  const boxH = maxY - minY || 1;

  const k = clampZoom(
    Math.min(rect.width / (boxW + pad), rect.height / (boxH + pad))
  );

  return {
    k,
    x: rect.width / 2 - ((minX + maxX) / 2) * k,
    y: rect.height / 2 - ((minY + maxY) / 2) * k,
  };
}
