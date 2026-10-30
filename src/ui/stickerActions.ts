/**
 * 把一张图片(粘贴 / 上传)变成画布上的贴画,并可选自动抠图。
 * 图片二进制进 IndexedDB,doc 里只留元数据。抠图全程在本地推理,不上传服务器。
 */

import { cutoutImage, readImageSize } from '../core/image';
import { newImageId, putImage } from '../core/imagedb';
import { screenToWorld } from '../core/viewport';
import { useStore } from '../store/useStore';

const MAX_DISPLAY = 260; // 新贴画最长边的初始世界尺寸

/** 画布可视中心的世界坐标(新贴画落在这里) */
function canvasCenterWorld(): { x: number; y: number } {
  const el = document.getElementById('canvas');
  const view = useStore.getState().view;
  if (!el) return { x: 0, y: 0 };
  const r = el.getBoundingClientRect();
  return screenToWorld(view, r.left + r.width / 2, r.top + r.height / 2, r);
}

export async function importImageAsSticker(blob: Blob, opts: { autoCutout: boolean }): Promise<void> {
  if (!blob.type.startsWith('image/')) return;
  const st = useStore.getState();
  try {
    const blobId = newImageId();
    await putImage(blobId, blob);
    const { w, h } = await readImageSize(blob);
    const scale = Math.min(1, MAX_DISPLAY / Math.max(w, h));
    const dispW = Math.max(60, Math.round(w * scale));
    const dispH = Math.max(60, Math.round(h * scale));
    const c = canvasCenterWorld();
    const id = st.addSticker(c.x - dispW / 2, c.y - dispH / 2, dispW, dispH, blobId);

    if (opts.autoCutout) {
      st.setStatus('准备抠图…');
      try {
        const cut = await cutoutImage(blob, (m) => useStore.getState().setStatus(m));
        await putImage(blobId, cut); // 覆盖为透明 PNG
        useStore.getState().markStickerCutout(id);
        useStore.getState().setStatus('✓ 已抠图成贴画');
      } catch (e) {
        useStore.getState().setStatus('抠图失败,保留原图:' + ((e as Error).message || ''));
      }
    } else {
      st.setStatus('✓ 已添加贴画');
    }
  } catch (e) {
    st.setStatus('添加图片失败:' + ((e as Error).message || ''));
  }
}
