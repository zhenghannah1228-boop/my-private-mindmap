/**
 * 内置迷因的手绘示意插画(黑白线条,跟随文字色)。
 * 只是「示意」,不是真图;用户可给任意站点贴上真实截图覆盖它(见 StationCard)。
 */

import type { ReactNode } from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 110" width="100%" height="100%" {...base}>
      {children}
    </svg>
  );
}

/** 柴犬侧眼脸 + wow 星点 */
function Doge() {
  return (
    <Frame>
      <path d="M52 40 L60 16 L74 40M108 40 L100 16 L86 40" />
      <path d="M44 52c0-20 16-30 36-30s36 10 36 30-16 34-36 34-36-14-36-34z" />
      <path d="M62 54 L76 50M86 50 L100 54" />
      <ellipse cx="80" cy="74" rx="15" ry="11" />
      <path d="M74 70 q6 3 12 0" />
      <path d="M80 76 v5" />
      <path d="M26 30 l0 9M21.5 34.5 l9 0M132 40 l0 8M128 44 l8 0M122 80 l0 7M118.5 83.5 l7 0" />
    </Frame>
  );
}

/** 一枚币 + 爪印(Dogecoin) */
function Coin() {
  return (
    <Frame>
      <circle cx="80" cy="55" r="36" />
      <circle cx="80" cy="55" r="29" />
      <ellipse cx="80" cy="62" rx="9" ry="7" />
      <circle cx="70" cy="48" r="3.4" />
      <circle cx="80" cy="44" r="3.4" />
      <circle cx="90" cy="48" r="3.4" />
    </Frame>
  );
}

/** 咖啡杯 + 火焰(This is fine) */
function Fire() {
  return (
    <Frame>
      <path d="M20 92c6-10 4-18 10-24-2 8 4 10 4 18M40 92c8-14 2-24 12-34-4 12 6 14 4 26M126 92c-8-14-2-24-12-34 4 12-6 14-4 26M146 92c-6-10-4-18-10-24 2 8-4 10-4 18" />
      <path d="M62 92 L66 66 h28 l4 26z" />
      <path d="M98 70 q12 0 12 10 t-12 8" />
      <path d="M60 92 h44" />
      <path d="M70 60 q2 -6 8 -4M84 60 q2 -7 9 -4" />
    </Frame>
  );
}

/** 视频框 + 播放键(Rickroll:一个看似正经的链接) */
function Play() {
  return (
    <Frame>
      <rect x="30" y="24" width="100" height="62" rx="9" />
      <path d="M72 44 L72 70 L96 57 Z" />
      <path d="M30 78 L130 78" />
      <path d="M112 92 l6 12 l3 -6 l6 -1z" />
    </Frame>
  );
}

/** 装轮子的鸭子(duckroll) */
function Duck() {
  return (
    <Frame>
      <ellipse cx="74" cy="50" rx="30" ry="19" />
      <circle cx="102" cy="36" r="12" />
      <path d="M113 34 l12 3 l-12 4" />
      <circle cx="100" cy="33" r="1.6" fill="currentColor" />
      <path d="M52 58 q-14 6 -20 -2" />
      <circle cx="58" cy="82" r="10" />
      <circle cx="92" cy="82" r="10" />
      <path d="M58 72 v-4M92 72 v-4" />
    </Frame>
  );
}

/** 彩虹猫:Pop-Tart 身体 + 猫头 + 彩虹尾迹 + 星星 */
function Nyan() {
  return (
    <Frame>
      <path d="M14 44 h26M14 51 h26M14 58 h26M14 65 h26" />
      <rect x="46" y="40" width="44" height="30" rx="6" />
      <circle cx="58" cy="49" r="1.6" fill="currentColor" />
      <circle cx="70" cy="55" r="1.6" fill="currentColor" />
      <circle cx="60" cy="62" r="1.6" fill="currentColor" />
      <circle cx="78" cy="47" r="1.6" fill="currentColor" />
      <path d="M96 40 L102 30 L108 42M124 40 L130 30 L120 42" />
      <circle cx="110" cy="55" r="18" />
      <circle cx="104" cy="53" r="1.8" fill="currentColor" />
      <circle cx="116" cy="53" r="1.8" fill="currentColor" />
      <path d="M106 62 q4 3 8 0" />
      <path d="M96 56 h-6M96 60 h-6M124 56 h6M124 60 h6" />
      <path d="M30 24 l0 8M26 28 l8 0M138 74 l0 7M134.5 77.5 l7 0" />
    </Frame>
  );
}

const ART: Record<string, () => ReactNode> = {
  doge: Doge,
  coin: Coin,
  fire: Fire,
  play: Play,
  duck: Duck,
  nyan: Nyan,
};

export function StationArt({ art }: { art: string }) {
  const C = ART[art];
  return C ? <>{C()}</> : null;
}

export function hasArt(art?: string): boolean {
  return !!art && art in ART;
}
