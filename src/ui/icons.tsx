/**
 * 黑白手绘线条小图标(替代彩色 emoji)。stroke=currentColor,跟随文字色。
 */
import type { ReactNode } from 'react';

function Svg({ children, size = 18, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export function IconSparkle(p: { size?: number; className?: string }) {
  return (
    <Svg {...p}>
      <path d="M12 3c.5 4.5 1 6 8.5 9-7.5 3-8 4.5-8.5 9-.5-4.5-1-6-8.5-9 7.5-3 8-4.5 8.5-9z" />
    </Svg>
  );
}
export function IconSearch(p: { size?: number; className?: string }) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.6-4.6" />
    </Svg>
  );
}
export function IconDice(p: { size?: number; className?: string }) {
  return (
    <Svg {...p}>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <circle cx="8.6" cy="8.6" r="1" />
      <circle cx="15.4" cy="8.6" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="8.6" cy="15.4" r="1" />
      <circle cx="15.4" cy="15.4" r="1" />
    </Svg>
  );
}
export function IconClip(p: { size?: number; className?: string }) {
  return (
    <Svg {...p}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <rect x="9" y="2.6" width="6" height="3.2" rx="1" />
      <path d="M9 11h6M9 14h6M9 17h4" />
    </Svg>
  );
}

const M: Record<string, ReactNode> = {
  冷知识: (
    <>
      <path d="M12 3a6 6 0 0 0-4 10c1 1 1.4 1.6 1.4 3h5.2c0-1.4.4-2 1.4-3a6 6 0 0 0-4-10z" />
      <path d="M10 19h4M10.6 21.4h2.8" />
    </>
  ),
  文化现象: (
    <>
      <path d="M5 6c0 8 3 13 7 13s7-5 7-13c-4-1.4-10-1.4-14 0z" />
      <path d="M9 10.5c.7.6 1.5.6 2.2 0M12.8 10.5c.7.6 1.5.6 2.2 0" />
      <path d="M9.4 14c1.6 1.3 3.6 1.3 5.2 0" />
    </>
  ),
  历史故事: (
    <>
      <path d="M8 4h10v13a2.5 2.5 0 0 1-2.5 2.5H8z" />
      <path d="M8 4a2 2 0 0 0 0 4M15.5 19.5a2.5 2.5 0 0 0 2.5-2.5" />
      <path d="M11 9h5M11 12h5M11 15h3" />
    </>
  ),
  名人故事: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  英语表达: (
    <>
      <path d="M4 5h16v11h-9l-4 4v-4H4z" />
      <path d="M9.4 13l2.1-5.2 2.1 5.2M10.1 11.3h2.8" />
    </>
  ),
  时政要闻: (
    <>
      <path d="M4 6h13v13H6.5A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M17 9h3v8a2 2 0 0 1-2 2" />
      <path d="M7 9.5h4v4H7zM13 9.5h1.5M13 12h1.5M7 16h8" />
    </>
  ),
  天文地理: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c3 2.4 3 13.6 0 16M12 4c-3 2.4-3 13.6 0 16" />
    </>
  ),
  名画赏析: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <path d="M4.5 15.5l4-4 3 3 3.5-4.5 4.5 5.5" />
      <circle cx="9" cy="9.2" r="1.2" />
    </>
  ),
  神话故事: (
    <>
      <path d="M4 9l8-4 8 4" />
      <path d="M6 9v8M10 9v8M14 9v8M18 9v8" />
      <path d="M4 17h16M3 20h18" />
    </>
  ),
  文学: (
    <>
      <path d="M12 6.5C10 5 7 4.6 4 5.2v12.4c3-.6 6-.2 8 1.4 2-1.6 5-2 8-1.4V5.2C17 4.6 14 5 12 6.5z" />
      <path d="M12 6.5v12.4" />
    </>
  ),
  影视: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="5.6" r="1.2" />
      <circle cx="12" cy="18.4" r="1.2" />
      <circle cx="5.6" cy="12" r="1.2" />
      <circle cx="18.4" cy="12" r="1.2" />
    </>
  ),
  流行音乐: (
    <>
      <path d="M9 18V6.5l9-2V15" />
      <circle cx="6.6" cy="18" r="2.4" />
      <circle cx="15.6" cy="15.6" r="2.4" />
    </>
  ),
  美学: (
    <>
      <circle cx="12" cy="12" r="2.1" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="12" cy="6.4" rx="2.1" ry="3.1" transform={`rotate(${a} 12 12)`} />
      ))}
    </>
  ),
  植物: (
    <>
      <path d="M12 20v-9" />
      <path d="M12 13C8 13 6 11 6 7.6 9.4 7.3 12 9 12 13z" />
      <path d="M12 12c4 0 6-2 6-5.4C14.6 6.3 12 8 12 12z" />
    </>
  ),
  动物: (
    <>
      <ellipse cx="12" cy="15.5" rx="4.2" ry="3.2" />
      <circle cx="7.4" cy="11" r="1.7" />
      <circle cx="16.6" cy="11" r="1.7" />
      <circle cx="9.8" cy="8" r="1.5" />
      <circle cx="14.2" cy="8" r="1.5" />
    </>
  ),
};

export function CategoryIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  if (name === '全部') return <IconSparkle size={size} className={className} />;
  const body = M[name];
  if (!body) return <Svg size={size} className={className}><circle cx="12" cy="12" r="2" /></Svg>;
  return (
    <Svg size={size} className={className}>
      {body}
    </Svg>
  );
}
