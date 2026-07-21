/**
 * 画布:承载指针交互、世界变换、节点/连线渲染、收集箱拖放。
 */

import { useRef } from 'react';
import { toCss } from '../core/viewport';
import { useStore } from '../store/useStore';
import { Edges } from './Edges';
import { NodeView } from './NodeView';
import { usePointerInteraction } from './usePointerInteraction';

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodes = useStore((s) => s.doc.nodes);
  const edges = useStore((s) => s.doc.edges);
  const view = useStore((s) => s.view);
  const selectedId = useStore((s) => s.ui.selectedId);
  const editingId = useStore((s) => s.ui.editingId);
  const linkingFrom = useStore((s) => s.ui.linkingFrom);
  const filterMode = useStore((s) => s.ui.filterMode);
  const placeMode = useStore((s) => s.ui.placeMode);
  const searchQuery = useStore((s) => s.ui.searchQuery);

  const { linkPreview, handlers } = usePointerInteraction(canvasRef);

  const sq = searchQuery.trim().toLowerCase();
  const isHi = (n: { t: string; ct: number; due: number | null }) => {
    // 搜索优先:命中关键词才高亮
    if (sq) return n.t.toLowerCase().includes(sq);
    if (!filterMode) return true;
    if (filterMode === 'time') return !!n.due;
    return Date.now() - (n.ct || 0) < 3 * 86400000;
  };

  return (
    <div
      id="canvas"
      ref={canvasRef}
      className={placeMode ? 'placing' : ''}
      {...handlers}
    >
      <div id="world" style={{ transform: toCss(view) }}>
        <Edges nodes={nodes} edges={edges} view={view} linkPreview={linkPreview} />
        {nodes.map((n) => (
          <NodeView
            key={n.id}
            node={n}
            selected={selectedId === n.id}
            linking={linkingFrom === n.id}
            editing={editingId === n.id}
            dim={!isHi(n)}
          />
        ))}
      </div>
    </div>
  );
}
