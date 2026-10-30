/**
 * 笑点解析:左侧笑点列表 + 右侧「看铺垫 → 揭晓笑点 → 推理技巧 → 对照解析」。
 * 复用迷因探踪的选单/推理/结局样式(.mc-/.mq-/.mr-)。
 */

import { useEffect, useRef } from 'react';
import { FACTORS, FACTOR_LABEL, type Joke } from './types';
import { useComedyStore } from './useComedyStore';
import { Sparkle, Squiggle } from '../ui/doodles';
import { IconClip } from '../ui/icons';

function JokeRead({ joke }: { joke: Joke }) {
  const revealed = useComedyStore((s) => s.revealed);
  const reveal = useComedyStore((s) => s.reveal);
  const startQuiz = useComedyStore((s) => s.startQuiz);
  return (
    <>
      <div className="joke-card">
        <div className="jk-head">
          <span className="jk-show">{joke.show}</span>
          {joke.episode && <span className="jk-ep">{joke.episode}</span>}
        </div>
        <h3 className="jk-title">{joke.title}</h3>

        <div className="jk-block">
          <div className="jk-label">铺垫</div>
          <div className="jk-text">{joke.setup}</div>
        </div>

        {revealed ? (
          <div className="jk-block punch">
            <div className="jk-label">笑点</div>
            <div className="jk-text">{joke.punchline}</div>
          </div>
        ) : (
          <button className="jk-reveal" onClick={reveal}>
            揭晓笑点
          </button>
        )}
      </div>

      {revealed && (
        <button className="jk-analyze" onClick={startQuiz}>
          为什么好笑? →
        </button>
      )}
      <div className="meme-tip">
        {revealed ? '试着推理:它用了哪些喜剧技巧?' : '先自己想想这个场景会怎么抖包袱,再揭晓。'}
      </div>
    </>
  );
}

function Quiz() {
  const guess = useComedyStore((s) => s.guess);
  const toggle = useComedyStore((s) => s.toggleFactor);
  const submit = useComedyStore((s) => s.submitQuiz);
  return (
    <div className="meme-quiz">
      <h3 className="mq-title">
        它为什么好笑?
        <span className="mq-sub">勾选你认为用到的喜剧技巧(可多选)</span>
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
        揭晓解析
      </button>
    </div>
  );
}

function Result({ joke }: { joke: Joke }) {
  const guess = useComedyStore((s) => s.guess);
  const replay = useComedyStore((s) => s.replay);
  const exitJoke = useComedyStore((s) => s.exitJoke);
  const correct = new Set(joke.factors);
  const picked = new Set(guess);
  const hits = joke.factors.filter((f) => picked.has(f));
  const wrong = guess.filter((f) => !correct.has(f));
  const rate = Math.round((hits.length / Math.max(1, joke.factors.length)) * 100);
  return (
    <div className="meme-result">
      <div className="mr-score">
        命中 {hits.length}/{joke.factors.length}
        <span className="mr-rate">{rate}%</span>
      </div>
      <div className="mr-factors">
        {joke.factors.map((f) => (
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
      <div className="mr-legend">✓ 命中 · · 漏选 · ✕ 这个其实没太用上</div>
      <div className="mr-analysis">
        <div className="mra-title">笑点解析</div>
        {joke.analysis}
      </div>
      <div className="mr-actions">
        <button className="mr-replay" onClick={replay}>
          ↺ 再看一遍
        </button>
        <button className="mr-exit" onClick={exitJoke}>
          换一个笑点
        </button>
      </div>
    </div>
  );
}

function Chooser() {
  const jokes = useComedyStore((s) => s.jokes);
  const selectJoke = useComedyStore((s) => s.selectJoke);
  return (
    <div className="meme-chooser">
      <p className="mc-intro">
        选一个情景喜剧的经典笑点:先看<b>铺垫</b>,揭晓<b>笑点</b>,再推理它用了哪些
        <b>喜剧技巧</b>,最后对照解析——练练「为什么好笑」的眼力。
      </p>
      <div className="mc-grid">
        {jokes.map((j) => (
          <button key={j.id} className="mc-card" onClick={() => selectJoke(j.id)}>
            <div className="mcc-title">{j.title}</div>
            <div className="mcc-sum">{j.show}</div>
            <div className="mcc-foot">解析 →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Comedy() {
  const jokes = useComedyStore((s) => s.jokes);
  const activeId = useComedyStore((s) => s.activeId);
  const phase = useComedyStore((s) => s.phase);
  const status = useComedyStore((s) => s.status);
  const init = useComedyStore((s) => s.init);
  const selectJoke = useComedyStore((s) => s.selectJoke);
  const exitJoke = useComedyStore((s) => s.exitJoke);
  const copyPrompt = useComedyStore((s) => s.copyPrompt);
  const importFile = useComedyStore((s) => s.importFile);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  const active = activeId ? jokes.find((j) => j.id === activeId) ?? null : null;

  return (
    <div id="comedy">
      <div id="side">
        <div className="sh">笑点解析</div>
        <div id="nav">
          {jokes.map((j) => (
            <div
              key={j.id}
              className={'navitem' + (activeId === j.id ? ' on' : '')}
              onClick={() => selectJoke(j.id)}
              title={j.show}
            >
              <span className="nm">{j.title}</span>
            </div>
          ))}
        </div>
        <div id="comedy-foot">
          <button className="collect-btn" onClick={copyPrompt} title="复制采集指令,交给任意 AI 产出更多笑点解析">
            <IconClip size={16} /> 复制采集指令
          </button>
          <button className="import-btn" onClick={() => fileRef.current?.click()}>
            ＋ 导入笑点 JSON
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

      <div id="comedy-main">
        <div className="lib-head">
          <h2>
            {active ? active.title : '笑点解析'}
            <Sparkle className="head-sparkle" />
            <Squiggle className="head-squiggle" />
          </h2>
          {active && (
            <button className="meme-exit-link" onClick={exitJoke}>
              ← 全部笑点
            </button>
          )}
        </div>

        {!active ? (
          <Chooser />
        ) : phase === 'quiz' ? (
          <Quiz />
        ) : phase === 'result' ? (
          <Result joke={active} />
        ) : (
          <JokeRead joke={active} />
        )}
      </div>
    </div>
  );
}
