/**
 * 图片贴画:自由摆放、缩放(等比)、裁剪、删除。抠图后加投影做「贴画」感。
 *
 * 交互自成一体,不走画布指针状态机(节点专用):贴画自己在 window 上挂
 * pointermove/up,pointerdown 时 stopPropagation,避免被画布当成平移/新建。
 * 所有位移都 ÷ view.k 换算成世界坐标(与节点拖拽同一约束)。
 */

import { memo, useEffect, useRef, useState } from 'react';
import { getImage } from '../core/imagedb';
import type { Sticker } from '../core/types';
import { useStore } from '../store/useStore';

interface Props {
  sticker: Sticker;
  selected: boolean;
  cropping: boolean;
  dim: boolean;
}

const MIN = 40; // 最小世界尺寸

type Corner = 'tl' | 'tr' | 'bl' | 'br';

function StickerViewImpl({ sticker, selected, cropping, dim }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  // 载入图片 blob → object URL;blobId 或抠图状态变化时重载
  useEffect(() => {
    let alive = true;
    let objUrl: string | null = null;
    void getImage(sticker.blobId).then((blob) => {
      if (!alive || !blob) return;
      objUrl = URL.createObjectURL(blob);
      setUrl(objUrl);
    });
    return () => {
      alive = false;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [sticker.blobId, sticker.cutout]);

  const crop = sticker.crop || { x: 0, y: 0, w: 1, h: 1 };

  // ── 拖动整块 ──
  const dragRef = useRef<{ px: number; py: number; sx: number; sy: number } | null>(null);
  const onBodyDown = (e: React.PointerEvent) => {
    if (cropping) return;
    e.stopPropagation();
    useStore.getState().selectSticker(sticker.id);
    dragRef.current = { px: e.clientX, py: e.clientY, sx: sticker.x, sy: sticker.y };
    const k = useStore.getState().view.k;
    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      useStore.getState().moveSticker(sticker.id, d.sx + (ev.clientX - d.px) / k, d.sy + (ev.clientY - d.py) / k);
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // ── 等比缩放(四角)──
  const onResizeDown = (corner: Corner) => (e: React.PointerEvent) => {
    e.stopPropagation();
    const s = sticker;
    const ratio = s.w / s.h || 1;
    // 锚点=被拖角的对角(保持不动)
    const anchor = {
      x: corner === 'tl' || corner === 'bl' ? s.x + s.w : s.x,
      y: corner === 'tl' || corner === 'tr' ? s.y + s.h : s.y,
    };
    const k = useStore.getState().view.k;
    const rectEl = document.getElementById('canvas')!.getBoundingClientRect();
    const view = useStore.getState().view;
    const move = (ev: PointerEvent) => {
      // 指针 → 世界坐标
      const wx = (ev.clientX - rectEl.left - view.x) / k;
      let neww = Math.max(MIN, Math.abs(wx - anchor.x));
      let newh = neww / ratio;
      const nx = corner === 'tr' || corner === 'br' ? anchor.x : anchor.x - neww;
      const ny = corner === 'bl' || corner === 'br' ? anchor.y : anchor.y - newh;
      useStore.getState().resizeSticker(s.id, nx, ny, neww, newh);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const style: React.CSSProperties = {
    left: sticker.x,
    top: sticker.y,
    width: sticker.w,
    height: sticker.h,
  };

  const cls = ['sticker', sticker.cutout ? 'cut' : '', selected ? 'sel' : '', dim ? 'dim' : '', cropping ? 'cropping' : '']
    .filter(Boolean)
    .join(' ');

  // 裁剪后的图片:内层 img 放大/偏移,使 crop 区域填满外框
  const imgStyle: React.CSSProperties = url
    ? {
        position: 'absolute',
        width: sticker.w / crop.w,
        height: sticker.h / crop.h,
        left: -(crop.x * sticker.w) / crop.w,
        top: -(crop.y * sticker.h) / crop.h,
        pointerEvents: 'none',
        userSelect: 'none',
      }
    : {};

  return (
    <div className={cls} data-sticker-id={sticker.id} style={style} onPointerDown={onBodyDown}>
      <div className="sticker-clip">
        {url ? <img src={url} alt="" draggable={false} style={imgStyle} /> : <div className="sticker-loading" />}
      </div>

      {selected && !cropping && (
        <>
          {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((c) => (
            <span key={c} className={'sk-handle ' + c} onPointerDown={onResizeDown(c)} />
          ))}
          <button
            className="sk-del"
            title="删除贴画"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              useStore.getState().deleteSticker(sticker.id);
            }}
          >
            ✕
          </button>
          <button
            className="sk-crop"
            title="裁剪"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              useStore.getState().setCropping(sticker.id);
            }}
          >
            裁剪
          </button>
        </>
      )}

      {cropping && <CropOverlay sticker={sticker} />}
    </div>
  );
}

/** 裁剪浮层:在当前框内选一个子矩形,确认后进一步裁剪(相对当前视图) */
function CropOverlay({ sticker }: { sticker: Sticker }) {
  // 裁剪矩形以「当前框的比例」表示 0–1
  const [r, setR] = useState({ x: 0.08, y: 0.08, w: 0.84, h: 0.84 });
  const rRef = useRef(r);
  rRef.current = r;

  const startDrag = (mode: Corner | 'move') => (e: React.PointerEvent) => {
    e.stopPropagation();
    const k = useStore.getState().view.k;
    const start = { px: e.clientX, py: e.clientY, r: { ...rRef.current } };
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.px) / k / sticker.w; // 归一化到框比例
      const dy = (ev.clientY - start.py) / k / sticker.h;
      let { x, y, w, h } = start.r;
      if (mode === 'move') {
        x = Math.min(1 - w, Math.max(0, x + dx));
        y = Math.min(1 - h, Math.max(0, y + dy));
      } else {
        const right = x + w;
        const bottom = y + h;
        if (mode === 'tl') {
          x = Math.min(right - 0.1, Math.max(0, x + dx));
          y = Math.min(bottom - 0.1, Math.max(0, y + dy));
          w = right - x;
          h = bottom - y;
        } else if (mode === 'tr') {
          y = Math.min(bottom - 0.1, Math.max(0, y + dy));
          w = Math.min(1 - x, Math.max(0.1, w + dx));
          h = bottom - y;
        } else if (mode === 'bl') {
          x = Math.min(right - 0.1, Math.max(0, x + dx));
          w = right - x;
          h = Math.min(1 - y, Math.max(0.1, h + dy));
        } else {
          w = Math.min(1 - x, Math.max(0.1, w + dx));
          h = Math.min(1 - y, Math.max(0.1, h + dy));
        }
      }
      setR({ x, y, w, h });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const confirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    const st = useStore.getState();
    const cur = sticker.crop || { x: 0, y: 0, w: 1, h: 1 };
    // 组合到原图归一化坐标
    const nc = {
      x: cur.x + r.x * cur.w,
      y: cur.y + r.y * cur.h,
      w: r.w * cur.w,
      h: r.h * cur.h,
    };
    st.setStickerCrop(sticker.id, nc, sticker.w * r.w, sticker.h * r.h);
    st.moveSticker(sticker.id, sticker.x + r.x * sticker.w, sticker.y + r.y * sticker.h);
    st.setCropping(null);
  };
  const cancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    useStore.getState().setCropping(null);
  };

  const box: React.CSSProperties = {
    left: `${r.x * 100}%`,
    top: `${r.y * 100}%`,
    width: `${r.w * 100}%`,
    height: `${r.h * 100}%`,
  };

  return (
    <>
      <div className="crop-layer" onPointerDown={(e) => e.stopPropagation()}>
        <div className="crop-rect" style={box} onPointerDown={startDrag('move')}>
          {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((c) => (
            <span key={c} className={'crop-h ' + c} onPointerDown={startDrag(c)} />
          ))}
        </div>
      </div>
      <div className="crop-actions" onPointerDown={(e) => e.stopPropagation()}>
        <button className="crop-ok" onClick={confirm}>
          ✓ 裁剪
        </button>
        <button className="crop-no" onClick={cancel}>
          取消
        </button>
      </div>
    </>
  );
}

export const StickerView = memo(StickerViewImpl);
