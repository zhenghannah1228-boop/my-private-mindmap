/**
 * 图片工具:读取自然尺寸、抠图(浏览器内 AI,图片不离开本地)。
 * 抠图库按需动态载入,首次使用时才下载模型(之后浏览器缓存,可离线复用)。
 */

/** 读取图片 blob 的自然宽高 */
export function readImageSize(blob: Blob): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片解码失败'));
    };
    img.src = url;
  });
}

/**
 * 抠图:去掉背景,返回透明 PNG 的 blob。
 * 全程在浏览器本地推理,原图不上传任何服务器。
 */
export async function cutoutImage(
  blob: Blob,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');
  const out = await removeBackground(blob, {
    output: { format: 'image/png' },
    progress: (key: string, current: number, total: number) => {
      if (!onProgress) return;
      if (key.startsWith('fetch')) {
        const pct = total ? Math.round((current / total) * 100) : 0;
        onProgress(`下载抠图模型 ${pct}%…`);
      } else {
        onProgress('抠图中…');
      }
    },
  });
  return out;
}
