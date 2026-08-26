/**
 * 画布:承载指针交互、世界变换、节点/连线渲染、收集箱拖放。
 */

import { useEffect, useRef } from 'react';
import { toCss } from '../core/viewport';
import { useStore } from '../store/useStore';
import { Edges } from './Edges';
import { NodeView } from './NodeView';
import { StickerView } from './StickerView';
import { importImageAsSticker } from './stickerActions';
import { usePointerInteraction } from './usePointerInteraction';

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodes = useStore((s) => s.doc.nodes);
  const edges = useStore((s) => s.doc.edges);
  const stickers = useStore((s) => s.doc.stickers);
  const view = useStore((s) => s.view);
  const selectedId = useStore((s) => s.ui.selectedId);
  const selectedStickerId = useStore((s) => s.ui.selectedStickerId);
  const croppingStickerId = useStore((s) => s.ui.croppingStickerId);
  const editingId = useStore((s) => s.ui.editingId);
  const linkingFrom = useStore((s) => s.ui.linkingFrom);
  const filterMode = useStore((s) => s.ui.filterMode);
  const placeMode = useStore((s) => s.ui.placeMode);
  const searchQuery = useStore((s) => s.ui.searchQuery);

  const { linkPreview, handlers } = usePointerInteraction(canvasRef);

  // 粘贴图片 → 新建贴画(思维导图模式挂载期间生效)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith('image/')) {
          const blob = it.getAsFile();
          if (blob) {
            e.preventDefault();
            void importImageAsSticker(blob, { autoCutout: useStore.getState().ui.autoCutout });
          }
          return;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

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
        {/* 贴画在连线/节点之下,作为背景素材 */}
        {(stickers || []).map((s) => (
          <StickerView
            key={s.id}
            sticker={s}
            selected={selectedStickerId === s.id}
            cropping={croppingStickerId === s.id}
            dim={!!(searchQuery.trim() || filterMode)}
          />
        ))}
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
