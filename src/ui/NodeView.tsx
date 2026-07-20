/**
 * 单个节点。
 * - 用绝对定位 + 世界坐标(#world 容器统一做 translate/scale)。
 * - 挂载/文本变化时上报真实尺寸给 useSizeStore,供连线端点计算。
 * - 编辑态由 store.ui.editingId 驱动:进入时 focus 并全选,回车/失焦提交。
 *   contenteditable 内 stopPropagation,避免全局键盘快捷键误删(不变量 2)。
 */

import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { isSoon } from '../core/time';
import { formatTime } from '../core/time';
import type { MindNode } from '../core/types';
import { useSizeStore } from '../store/useSizeStore';
import { useStore } from '../store/useStore';

interface Props {
  node: MindNode;
  selected: boolean;
  linking: boolean;
  editing: boolean;
  dim: boolean;
}

function NodeViewImpl({ node, selected, linking, editing, dim }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const txtRef = useRef<HTMLDivElement>(null);
  const report = useSizeStore((s) => s.report);
  const updateNodeText = useStore((s) => s.updateNodeText);
  const setEditing = useStore((s) => s.setEditing);

  // 上报尺寸(内容撑开,宽度不定)
  useLayoutEffect(() => {
    const el = elRef.current;
    if (el) report(node.id, el.offsetWidth, el.offsetHeight);
  }, [node.t, node.c, node.due, node.ct, report, node.id, editing]);

  // 进入编辑:focus + 全选
  useEffect(() => {
    if (!editing) return;
    const t = txtRef.current;
    if (!t) return;
    t.focus();
    const range = document.createRange();
    range.selectNodeContents(t);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [editing]);

  const commit = () => {
    const t = txtRef.current;
    if (t) updateNodeText(node.id, t.textContent || '');
    setEditing(null);
  };

  const cls = [
    'node',
    'c' + (node.c || 0),
    selected ? 'sel' : '',
    linking ? 'linking' : '',
    dim ? 'dim' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={elRef}
      className={cls}
      data-id={node.id}
      style={{ left: node.x, top: node.y }}
    >
      <div
        ref={txtRef}
        className="txt"
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={editing ? commit : undefined}
        onKeyDown={(e) => {
          // 编辑中:回车提交,Shift+回车换行;所有键停止冒泡防止误删(不变量 2)
          if (editing) {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
            e.stopPropagation();
          }
        }}
      >
        {node.t}
      </div>
      {(node.ct || node.due) && (
        <div className="nm">
          {node.ct ? <span>{formatTime(node.ct)}</span> : null}
          {node.due ? (
            <span className={isSoon(node.due) ? 'd soon' : 'd'}>⏰ {formatTime(node.due)}</span>
          ) : null}
        </div>
      )}
      <div className="port" />
    </div>
  );
}

export const NodeView = memo(NodeViewImpl);
