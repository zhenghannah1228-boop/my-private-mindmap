/**
 * 连线层(SVG)。
 * - 端点用节点中心,尺寸从 useSizeStore 读(节点宽度由内容撑开)。
 * - 三次贝塞尔,控制点水平偏移 = 水平距离的一半 → 柔和 S 曲线。
 * - 过滤时降透明度而非移除(保留空间记忆,见 filter.ts)。
 * - 点击连线可删除(二次确认,符合「不要丢数据」)。
 * - 连线进行中的绿色虚线跟随指针。
 */

import { isEdgeHighlighted } from '../core/filter';
import type { Edge, MindNode, View } from '../core/types';
import { useSizeStore } from '../store/useSizeStore';
import { useStore } from '../store/useStore';
import type { LinkPreview } from './usePointerInteraction';

interface Props {
  nodes: MindNode[];
  edges: Edge[];
  view: View;
  linkPreview: LinkPreview | null;
}

function center(node: MindNode, sizes: Map<number, { w: number; h: number }>) {
  const s = sizes.get(node.id) ?? { w: 120, h: 40 };
  return { x: node.x + s.w / 2, y: node.y + s.h / 2 };
}

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

export function Edges({ nodes, edges, linkPreview }: Props) {
  // 订阅 version 以便节点尺寸变化时重算端点
  const version = useSizeStore((s) => s.version);
  const sizes = useSizeStore((s) => s.sizes);
  const filterMode = useStore((s) => s.ui.filterMode);
  const deleteEdge = useStore((s) => s.deleteEdge);
  void version;

  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg id="edges">
      {edges.map((e) => {
        const a = byId.get(e.a);
        const b = byId.get(e.b);
        if (!a || !b) return null;
        const ca = center(a, sizes);
        const cb = center(b, sizes);
        const on = isEdgeHighlighted(e, nodes, filterMode);
        return (
          <path
            key={e.id}
            d={bezier(ca.x, ca.y, cb.x, cb.y)}
            fill="none"
            stroke="#b4b2a9"
            strokeWidth={1.6}
            opacity={on ? 1 : 0.15}
            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
            onClick={(ev) => {
              ev.stopPropagation();
              if (confirm('删除这条连线?')) deleteEdge(e.id);
            }}
          />
        );
      })}

      {linkPreview &&
        (() => {
          const from = byId.get(linkPreview.from);
          if (!from) return null;
          const c = center(from, sizes);
          return (
            <path
              d={`M${c.x},${c.y} L${linkPreview.x},${linkPreview.y}`}
              fill="none"
              stroke="#1d9e75"
              strokeWidth={1.6}
              strokeDasharray="4 3"
            />
          );
        })()}
    </svg>
  );
}
