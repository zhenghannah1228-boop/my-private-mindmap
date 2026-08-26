/**
 * 童风简笔画(喜茶风):手绘线条、圆头笔触、用 currentColor 跟随文字色。
 */

interface D {
  size?: number;
  className?: string;
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** 四角小星光,点缀标题 */
export function Sparkle({ size = 20, className }: D) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3c.6 5 1 6.6 8.5 9-7.5 2.4-7.9 4-8.5 9-.6-5-1-6.6-8.5-9C11 9.6 11.4 8 12 3z" />
    </svg>
  );
}

/** 波浪下划线,放标题底下 */
export function Squiggle({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height="9"
      viewBox="0 0 120 9"
      preserveAspectRatio="none"
      className={className}
      {...base}
      strokeWidth={2.4}
    >
      <path d="M2 6c8-5 16-5 24 0s16 5 24 0 16-5 24 0 16 5 24 0 16-5 20-1" />
    </svg>
  );
}

/** 坐着的小猫,喝一杯饮料(致敬参考图) */
export function Cat({ size = 96, className }: D) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} {...base}>
      <path d="M31 42l3-16 11 13" />
      <path d="M69 42l-3-16-11 13" />
      <path d="M31 42c-6 12-6 30 4 38 8 6 22 6 30 0 10-8 10-26 4-38" />
      <path d="M42 55v4M58 55v4" />
      <path d="M50 61v3" />
      <path d="M47 67c2 2 4 2 6 0" />
      <path d="M37 58l-11-2M37 62l-11 3" />
      <path d="M63 58l11-2M63 62l11 3" />
      <path d="M45 84h10v9H45z" />
      <path d="M55 74c8-1 11-6 11-6" />
    </svg>
  );
}

/** 亮灯泡(致敬参考图) */
export function Bulb({ size = 60, className }: D) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} {...base}>
      <path d="M50 22c-14 0-23 10-23 22 0 9 6 13 9 22h28c3-9 9-13 9-22 0-12-9-22-23-22z" />
      <path d="M40 72h20M43 79h14" />
      <path d="M50 6v9M22 18l6 6M78 18l-6 6M12 44h9M79 44h9" />
    </svg>
  );
}

/** 松开的手掌,指头微张——放下的意思 */
export function OpenHand({ size = 88, className }: D) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} {...base}>
      <path d="M30 56V27c0-3 2-5 5-5s5 2 5 5v19" />
      <path d="M40 46V18c0-3 2-5 5-5s5 2 5 5v27" />
      <path d="M50 46V22c0-3 2-5 5-5s5 2 5 5v23" />
      <path d="M60 49V30c0-3 2-5 5-5s5 2 5 5v27c0 14-9 24-22 24-9 0-14-4-19-11l-8-12c-2-3-1-6 2-7 2-1 5 0 7 2l5 6" />
    </svg>
  );
}

/** 简单的书本 */
export function BookDoodle({ size = 72, className }: D) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} {...base}>
      <path d="M50 30c-8-6-20-8-30-6v46c10-2 22 0 30 6 8-6 20-8 30-6V24c-10-2-22 0-30 6z" />
      <path d="M50 30v46" />
      <path d="M30 40c5-1 10-1 14 1M30 52c5-1 10-1 14 1M56 41c5-2 10-2 14-1M56 53c5-2 10-2 14-1" />
    </svg>
  );
}
