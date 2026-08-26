/**
 * 统一指针交互状态机(P0 核心 —— 移植并升级自 handoff/interaction.js)。
 *
 * 原型只绑了 mouse 事件,手机完全不可用。这里全部改用 Pointer Events,
 * 一套代码覆盖鼠标 + 触摸。状态机沿用 interaction.js 的设计:
 *
 *   IDLE
 *    ├─ 单指按空白 + 移动     → PANNING
 *    ├─ 单指按节点 + 移动     → DRAGGING（位移必须 ÷ view.k)
 *    ├─ 单指按端口           → LINKING（桌面:hover 出端口再拖)
 *    ├─ 长按节点 400ms       → LINKING（触摸屏没有 hover,用长按替代)
 *    ├─ 双指                 → PINCH（捏合缩放 + 双指平移)
 *    ├─ 双击空白 / 放置模式点击 → 新节点 + 进入编辑
 *    ├─ 双击节点             → 编辑
 *    └─ 单击节点/空白        → 选中 / 取消选中
 *
 * 不变量(违反就会出现原型里的诡异 bug):
 * 1. 任一时刻只处于一个状态。
 * 2. 编辑中(contenteditable)屏蔽画布手势,否则打字/退格会误删节点。
 * 3. LINKING 中实时重画虚线,终点跟随指针(世界坐标)。
 * 4. DRAGGING 位移 ÷ view.k。
 * 5. touch-action:none(见 CSS),否则浏览器抢走手势去滚页/缩放。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { screenToWorld, zoomAtFactor, zoomAtWheel, type Rect } from '../core/viewport';
import { useStore } from '../store/useStore';

const LONG_PRESS_MS = 400;
const MOVE_THRESHOLD = 5; // 屏幕像素;超过即判定为拖拽/平移
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_DIST = 24;

type Mode = 'idle' | 'pending' | 'panning' | 'dragging' | 'linking' | 'pinch';

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  kind: 'empty' | 'node' | 'port';
  nodeId: number | null;
  nodeStartX: number;
  nodeStartY: number;
  viewStartX: number;
  viewStartY: number;
  moved: boolean;
  longPress: ReturnType<typeof setTimeout> | null;
}

export interface LinkPreview {
  from: number;
  x: number;
  y: number;
}

function pointerContext(target: EventTarget | null): {
  kind: 'empty' | 'node' | 'port';
  nodeId: number | null;
} {
  const el = target as HTMLElement | null;
  if (el?.closest('.port')) {
    const node = el.closest('.node') as HTMLElement | null;
    return { kind: 'port', nodeId: node ? Number(node.dataset.id) : null };
  }
  const node = el?.closest('.node') as HTMLElement | null;
  if (node) return { kind: 'node', nodeId: Number(node.dataset.id) };
  return { kind: 'empty', nodeId: null };
}

/** 命中测试:某屏幕坐标下是否落在某个节点上,返回 node id */
function nodeIdAtPoint(clientX: number, clientY: number): number | null {
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  const node = el?.closest('.node') as HTMLElement | null;
  return node ? Number(node.dataset.id) : null;
}

export function usePointerInteraction(canvasRef: React.RefObject<HTMLDivElement>) {
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);

  const mode = useRef<Mode>('idle');
  const gesture = useRef<Gesture | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; midX: number; midY: number } | null>(null);
  const rect = useRef<Rect>({ left: 0, top: 0, width: 0, height: 0 });
  const lastTap = useRef<{ t: number; x: number; y: number; nodeId: number | null } | null>(null);

  const readRect = useCallback((): Rect => {
    const r = canvasRef.current?.getBoundingClientRect();
    rect.current = r
      ? { left: r.left, top: r.top, width: r.width, height: r.height }
      : rect.current;
    return rect.current;
  }, [canvasRef]);

  const clearLongPress = () => {
    const g = gesture.current;
    if (g?.longPress) {
      clearTimeout(g.longPress);
      g.longPress = null;
    }
  };

  const resetGesture = () => {
    clearLongPress();
    gesture.current = null;
    mode.current = 'idle';
  };

  const enterLinking = useCallback((fromId: number, clientX: number, clientY: number) => {
    mode.current = 'linking';
    useStore.getState().setLinkingFrom(fromId);
    const { view } = useStore.getState();
    const p = screenToWorld(view, clientX, clientY, rect.current);
    setLinkPreview({ from: fromId, x: p.x, y: p.y });
  }, []);

  const cancelLinking = useCallback(() => {
    useStore.getState().setLinkingFrom(null);
    setLinkPreview(null);
  }, []);

  // ── pointerdown ──
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const st = useStore.getState();
      // 不变量 2:编辑中的文本框内交给浏览器处理选区
      const targetEl = e.target as HTMLElement;
      if (targetEl.closest('[contenteditable="true"]')) return;

      readRect();
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        canvasRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* 某些浏览器对已释放的指针会抛错,忽略 */
      }

      // 第二指落下 → 进入捏合,接管一切单指手势
      if (pointers.current.size === 2) {
        clearLongPress();
        const pts = [...pointers.current.values()];
        const r = rect.current;
        const midX = (pts[0].x + pts[1].x) / 2 - r.left;
        const midY = (pts[0].y + pts[1].y) / 2 - r.top;
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        pinch.current = { dist, midX, midY };
        mode.current = 'pinch';
        gesture.current = null;
        cancelLinking();
        return;
      }
      if (pointers.current.size > 2) return;

      const { kind, nodeId } = pointerContext(e.target);

      // 已在连线态(桌面:先按了端口),这里当作 idle 起手忽略
      const node = nodeId != null ? st.doc.nodes.find((n) => n.id === nodeId) : null;

      const g: Gesture = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        kind,
        nodeId,
        nodeStartX: node?.x ?? 0,
        nodeStartY: node?.y ?? 0,
        viewStartX: st.view.x,
        viewStartY: st.view.y,
        moved: false,
        longPress: null,
      };
      gesture.current = g;
      mode.current = 'pending';

      if (kind === 'port' && nodeId != null) {
        // 端口:立即进入连线(桌面拖拽式)
        enterLinking(nodeId, e.clientX, e.clientY);
      } else if (kind === 'node' && nodeId != null) {
        // 节点:长按 400ms → 连线(触摸屏没有 hover 端口)
        g.longPress = setTimeout(() => {
          if (gesture.current === g && mode.current === 'pending') {
            enterLinking(nodeId, g.startX, g.startY);
          }
        }, LONG_PRESS_MS);
      }
    },
    [canvasRef, cancelLinking, enterLinking, readRect]
  );

  // ── pointermove ──
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const st = useStore.getState();

      // 捏合:缩放 + 双指平移
      if (mode.current === 'pinch' && pointers.current.size >= 2 && pinch.current) {
        const pts = [...pointers.current.values()];
        const r = rect.current;
        const midX = (pts[0].x + pts[1].x) / 2 - r.left;
        const midY = (pts[0].y + pts[1].y) / 2 - r.top;
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        const factor = dist / pinch.current.dist;
        let v = zoomAtFactor(st.view, midX, midY, factor);
        v = { ...v, x: v.x + (midX - pinch.current.midX), y: v.y + (midY - pinch.current.midY) };
        pinch.current = { dist, midX, midY };
        st.setView(v);
        return;
      }

      const g = gesture.current;
      if (!g || g.pointerId !== e.pointerId) return;

      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (!g.moved && Math.hypot(dx, dy) > MOVE_THRESHOLD) {
        g.moved = true;
        clearLongPress();
        // 从 pending 落定为具体手势(除非已在 linking)
        if (mode.current === 'pending') {
          mode.current = g.kind === 'node' ? 'dragging' : 'panning';
        }
      }

      if (mode.current === 'dragging' && g.nodeId != null) {
        // 不变量 4:位移 ÷ view.k
        st.moveNode(g.nodeId, g.nodeStartX + dx / st.view.k, g.nodeStartY + dy / st.view.k);
      } else if (mode.current === 'panning') {
        st.setView({ ...st.view, x: g.viewStartX + dx, y: g.viewStartY + dy });
      } else if (mode.current === 'linking') {
        const p = screenToWorld(st.view, e.clientX, e.clientY, rect.current);
        const from = st.ui.linkingFrom;
        if (from != null) setLinkPreview({ from, x: p.x, y: p.y });
      }
    },
    []
  );

  // ── pointerup / cancel ──
  const finishPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      pointers.current.delete(e.pointerId);
      try {
        canvasRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      // 捏合结束:抬起一指后彻底结束手势,剩余指针等全部抬起再复位
      if (mode.current === 'pinch') {
        pinch.current = null;
        if (pointers.current.size === 0) resetGesture();
        else mode.current = 'idle'; // 忽略残留指针,避免缩放后误拖
        return;
      }

      const g = gesture.current;
      if (!g || g.pointerId !== e.pointerId) {
        if (pointers.current.size === 0) resetGesture();
        return;
      }

      const st = useStore.getState();

      if (mode.current === 'linking') {
        const from = st.ui.linkingFrom;
        const target = cancelled ? null : nodeIdAtPoint(e.clientX, e.clientY);
        if (from != null && target != null && target !== from) {
          st.addEdge(from, target);
        }
        cancelLinking();
        resetGesture();
        return;
      }

      if (mode.current === 'dragging') {
        resetGesture();
        return; // 位置已在 move 时写入 store
      }
      if (mode.current === 'panning') {
        resetGesture();
        return;
      }

      // 未移动 → 点按语义(tap)
      if (!g.moved && !cancelled) {
        handleTap(g, e.clientX, e.clientY);
      }
      resetGesture();
    },
    [canvasRef, cancelLinking]
  );

  // 点按处理:区分单击 / 双击,节点 / 空白
  const handleTap = useCallback((g: Gesture, clientX: number, clientY: number) => {
    const st = useStore.getState();
    const now = Date.now();
    const prev = lastTap.current;
    const isDouble =
      !!prev &&
      now - prev.t < DOUBLE_TAP_MS &&
      Math.hypot(clientX - prev.x, clientY - prev.y) < DOUBLE_TAP_DIST &&
      prev.nodeId === g.nodeId;
    lastTap.current = { t: now, x: clientX, y: clientY, nodeId: g.nodeId };

    const world = screenToWorld(st.view, clientX, clientY, rect.current);

    if (g.kind === 'node' && g.nodeId != null) {
      if (isDouble) {
        lastTap.current = null;
        st.select(g.nodeId);
        st.setEditing(g.nodeId); // 双击节点 → 编辑
      } else {
        st.select(g.nodeId);
      }
      return;
    }

    // 空白
    if (st.ui.linkingFrom != null) {
      cancelLinking();
      return;
    }
    if (st.ui.placeMode || isDouble) {
      lastTap.current = null;
      st.setPlaceMode(false);
      const id = st.addNode(world.x - 60, world.y - 20, '');
      st.select(id);
      st.setEditing(id); // 新节点直接进入编辑(零摩擦)
    } else {
      st.select(null);
    }
  }, [cancelLinking]);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => finishPointer(e, false),
    [finishPointer]
  );
  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => finishPointer(e, true),
    [finishPointer]
  );

  // 滚轮缩放(桌面)。必须 passive:false 才能 preventDefault。
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = readRect();
      const st = useStore.getState();
      st.setView(zoomAtWheel(st.view, e.clientX - r.left, e.clientY - r.top, e.deltaY));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [canvasRef, readRect]);

  // Esc:取消连线 / 退出放置模式(不变量 3 的收尾)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      cancelLinking();
      resetGesture();
      useStore.getState().setPlaceMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancelLinking]);

  return {
    linkPreview,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
