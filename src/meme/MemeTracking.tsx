/**
 * 迷因探踪:超链接文本游戏。
 * 左侧迷因列表 + 复制采集指令/导入;右侧:选迷因 → 站点探险 → 成因推理 → 结局。
 */

import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import {
  FACTORS,
  FACTOR_LABEL,
  REL_LABEL,
  STATION_LABEL,
  type LinkRel,
  type Meme,
  type Station,
} from './types';
import { useMemeStore } from './useMemeStore';
import { Sparkle, Squiggle } from '../ui/doodles';
import { IconClip } from '../ui/icons';

const REL_ARROW: Record<LinkRel, string> = { back: '↑', forward: '↓', variant: '→' };

/** 解析正文里的内联超链接 [[站点id|显示文字]] → 可点击跳转 */
function renderBody(body: string, onJump: (id: string) => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(body))) {
    if (m.index > last) out.push(<Fragment key={i++}>{body.slice(last, m.index)}</Fragment>);
    const id = m[1].trim();
    const text = m[2];
    out.push(
      <a
        key={i++}
        className="meme-inline"
        onClick={(e) => {
          e.preventDefault();
          onJump(id);
        }}
      >
        {text}
      </a>
    );
    last = re.lastIndex;
  }
  if (last < body.length) out.push(<Fragment key={i++}>{body.slice(last)}</Fragment>);
  return out;
}

function StationCard({ meme, station }: { meme: Meme; station: Station }) {
  const goto = useMemeStore((s) => s.goto);
  const isOrigin = station.id === meme.originId;
  return (
    <div className="meme-station">
      <div className="ms-head">
        <span className={'ms-kind k-' + station.kind}>{STATION_LABEL[station.kind]}</span>
        {(station.date || station.platform) && (
          <span className="ms-meta">
            {[station.date, station.platform].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
      <h3 className="ms-title">{station.title}</h3>
      <div className="ms-body">{renderBody(station.body, goto)}</div>

      {isOrigin && <div className="ms-origin">✓ 你已溯源到这个迷因的起点</div>}

      {station.sources && station.sources.length > 0 && (
        <div className="ms-sources">
          {station.sources.map((s, i) => (
            <span key={i} className="ms-source">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.label} ↗
                </a>
              ) : (
                <>来源:{s.label}</>
              )}
            </span>
          ))}
        </div>
      )}

      {station.links.length > 0 && (
        <div className="ms-links">
          {(['back', 'forward', 'variant'] as LinkRel[]).flatMap((rel) =>
            station.links
              .filter((l) => l.rel === rel)
              .map((l, i) => {
                const target = meme.stations.find((s) => s.id === l.to);
                return (
                  <button key={rel + i} className={'ms-link rel-' + rel} onClick={() => goto(l.to)}>
                    <span className="ml-rel">
                      {REL_ARROW[rel]} {REL_LABEL[rel]}
                    </span>
                    <span className="ml-text">{l.label || target?.title || l.to}</span>
                  </button>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}

function Explore({ meme }: { meme: Meme }) {
  const stationId = useMemeStore((s) => s.stationId);
  const visited = useMemeStore((s) => s.visited);
  const history = useMemeStore((s) => s.history);
  const back = useMemeStore((s) => s.back);
  const startQuiz = useMemeStore((s) => s.startQuiz);
  const station = meme.stations.find((s) => s.id === stationId) || meme.stations[0];
  const total = meme.stations.length;
  const done = visited.length;
  const originFound = visited.includes(meme.originId);

  return (
    <>
      <div className="meme-topbar">
        <button className="meme-back" disabled={!history.length} onClick={back}>
          ← 回退
        </button>
        <div className="meme-progress">
          <div className="mp-track">
            <div className="mp-fill" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <span className="mp-label">探踪 {done}/{total}</span>
        </div>
        <button className={'meme-analyze' + (originFound ? ' ready' : '')} onClick={startQuiz}>
          分析成因 →
        </button>
      </div>

      <StationCard meme={meme} station={station} />

      <div className="meme-tip">
        点正文里的<span className="meme-inline">下划线链接</span>或下方按钮,在传播链里跳转。
        {originFound ? '已找到起点,随时可以「分析成因」。' : '试着一路「溯源 ↑」挖到最初的源头。'}
      </div>
    </>
  );
}

function Quiz({ meme }: { meme: Meme }) {
  const guess = useMemeStore((s) => s.guess);
  const toggle = useMemeStore((s) => s.toggleFactor);
  const submit = useMemeStore((s) => s.submitQuiz);
  return (
    <div className="meme-quiz">
      <h3 className="mq-title">
        「{meme.title}」为什么会火?
        <span className="mq-sub">凭你刚才读到的,勾选你认为命中的成因因子(可多选)</span>
      </h3>
      <div className="mq-grid">
        {FACTORS.map((f) => (
          <button
            key={f.key}
            className={'mq-factor' + (guess.includes(f.key) ? ' on' : '')}
            onClick={() => toggle(f.key)}
          >
            <span className="mqf-label">{f.label}</span>
            <span className="mqf-desc">{f.desc}</span>
          </button>
        ))}
      </div>
      <button className="mq-submit" disabled={!guess.length} onClick={submit}>
        揭晓答案
      </button>
    </div>
  );
}

function Result({ meme }: { meme: Meme }) {
  const guess = useMemeStore((s) => s.guess);
  const replay = useMemeStore((s) => s.replay);
  const exitMeme = useMemeStore((s) => s.exitMeme);
  const correct = new Set(meme.factors);
  const picked = new Set(guess);
  const hits = meme.factors.filter((f) => picked.has(f));
  const missed = meme.factors.filter((f) => !picked.has(f));
  const wrong = guess.filter((f) => !correct.has(f));
  const rate = Math.round((hits.length / meme.factors.length) * 100);

  return (
    <div className="meme-result">
      <div className="mr-score">
        命中 {hits.length}/{meme.factors.length}
        <span className="mr-rate">{rate}%</span>
      </div>

      <div className="mr-factors">
        {meme.factors.map((f) => (
          <span key={f} className={'mr-chip ' + (picked.has(f) ? 'hit' : 'miss')}>
            {picked.has(f) ? '✓' : '·'} {FACTOR_LABEL[f]}
          </span>
        ))}
        {wrong.map((f) => (
          <span key={f} className="mr-chip over">
            ✕ {FACTOR_LABEL[f]}
          </span>
        ))}
      </div>
      <div className="mr-legend">
        ✓ 命中 · <span className="lg-miss">· 漏选</span> · <span className="lg-over">✕ 这个其实没那么关键</span>
        {missed.length === 0 && wrong.length === 0 && ' — 全中,厉害!'}
      </div>

      <div className="mr-analysis">
        <div className="mra-title">成因分析</div>
        {meme.analysis}
      </div>

      <div className="mr-actions">
        <button className="mr-replay" onClick={replay}>
          ↺ 重走一遍
        </button>
        <button className="mr-exit" onClick={exitMeme}>
          换一个迷因
        </button>
      </div>
    </div>
  );
}

function Chooser() {
  const memes = useMemeStore((s) => s.memes);
  const selectMeme = useMemeStore((s) => s.selectMeme);
  return (
    <div className="meme-chooser">
      <p className="mc-intro">
        选一个迷因,从它<b>如今的样子</b>出发,沿超链接<b>溯源</b>到起点、<b>顺流</b>看它如何变异破圈,
        最后推理它<b>为什么会火</b>。
      </p>
      <div className="mc-grid">
        {memes.map((m) => (
          <button key={m.id} className="mc-card" onClick={() => selectMeme(m.id)}>
            <div className="mcc-title">{m.title}</div>
            {m.summary && <div className="mcc-sum">{m.summary}</div>}
            <div className="mcc-foot">{m.stations.length} 站 · 开始探踪 →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MemeTracking() {
  const memes = useMemeStore((s) => s.memes);
  const activeId = useMemeStore((s) => s.activeId);
  const phase = useMemeStore((s) => s.phase);
  const status = useMemeStore((s) => s.status);
  const init = useMemeStore((s) => s.init);
  const selectMeme = useMemeStore((s) => s.selectMeme);
  const exitMeme = useMemeStore((s) => s.exitMeme);
  const copyPrompt = useMemeStore((s) => s.copyPrompt);
  const importFile = useMemeStore((s) => s.importFile);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  const active = activeId ? memes.find((m) => m.id === activeId) ?? null : null;

  return (
    <div id="meme">
      <div id="side">
        <div className="sh">迷因探踪</div>
        <div id="nav">
          {memes.map((m) => (
            <div
              key={m.id}
              className={'navitem' + (activeId === m.id ? ' on' : '')}
              onClick={() => selectMeme(m.id)}
              title={m.summary}
            >
              <span className="nm">{m.title}</span>
              <span className="cnt">{m.stations.length}</span>
            </div>
          ))}
        </div>
        <div id="meme-foot">
          <button className="collect-btn" onClick={copyPrompt} title="复制采集指令,交给任意 AI 产出一个迷因的探踪 JSON">
            <IconClip size={16} /> 复制采集指令
          </button>
          <button className="import-btn" onClick={() => fileRef.current?.click()}>
            ＋ 导入迷因 JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = '';
            }}
          />
          {status && <div className="reading-status">{status}</div>}
        </div>
      </div>

      <div id="meme-main">
        <div className="lib-head">
          <h2>
            {active ? active.title : '迷因探踪'}
            <Sparkle className="head-sparkle" />
            <Squiggle className="head-squiggle" />
          </h2>
          {active && (
            <button className="meme-exit-link" onClick={exitMeme}>
              ← 全部迷因
            </button>
          )}
        </div>

        {!active ? (
          <Chooser />
        ) : phase === 'explore' ? (
          <Explore meme={active} />
        ) : phase === 'quiz' ? (
          <Quiz meme={active} />
        ) : (
          <Result meme={active} />
        )}
      </div>
    </div>
  );
}
