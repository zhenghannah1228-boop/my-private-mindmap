/**
 * 掌控圈:写下让你炸毛的事 → 分「我说了算」/「我说了不算」→
 * 说了算的转成一步小行动,说了不算的走一次呼吸,放下。
 * 攒下的记录汇成「戾气来源地图」。
 */

import { useEffect } from 'react';
import { UNWIND_TAGS } from './types';
import { useUnwindStore } from './useUnwindStore';
import { Sparkle, Squiggle, OpenHand } from '../ui/doodles';

function WriteForm() {
  const draftText = useUnwindStore((s) => s.draftText);
  const draftTag = useUnwindStore((s) => s.draftTag);
  const setDraftText = useUnwindStore((s) => s.setDraftText);
  const setDraftTag = useUnwindStore((s) => s.setDraftTag);
  const submitDraft = useUnwindStore((s) => s.submitDraft);

  return (
    <div className="uw-write">
      <p className="uw-intro">这次让你炸毛的是什么事?写下来,不用讲道理,想到什么写什么。</p>
      <textarea
        className="uw-textarea"
        placeholder="比如:同事又临时改需求……"
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        rows={3}
      />
      <div className="uw-tags">
        {UNWIND_TAGS.map((t) => (
          <button key={t} type="button" className={'uw-tag' + (draftTag === t ? ' on' : '')} onClick={() => setDraftTag(t)}>
            {t}
          </button>
        ))}
      </div>
      <button className="uw-submit" disabled={!draftText.trim()} onClick={submitDraft}>
        记下来,往下走 →
      </button>
    </div>
  );
}

function Sort() {
  const pending = useUnwindStore((s) => s.pending);
  const chooseCategory = useUnwindStore((s) => s.chooseCategory);
  const cancelPending = useUnwindStore((s) => s.cancelPending);
  if (!pending) return null;
  return (
    <div className="uw-sort">
      <div className="uw-card">
        <div className="uw-card-tag">{pending.tag}</div>
        <div className="uw-card-text">{pending.text}</div>
      </div>
      <p className="uw-ask">这件事,最后拍板的是谁?</p>
      <div className="uw-sort-btns">
        <button className="uw-sort-btn" onClick={() => chooseCategory('controllable')}>
          我说了算的
          <span>能挑一件小事去做</span>
        </button>
        <button className="uw-sort-btn" onClick={() => chooseCategory('uncontrollable')}>
          我说了不算的
          <span>不由我一个人决定</span>
        </button>
      </div>
      <button className="uw-cancel" onClick={cancelPending}>
        先不弄了
      </button>
    </div>
  );
}

const BREATH_STEPS = [
  { label: '① 吸气', hint: '慢慢数到 4', cta: '吸满了 →' },
  { label: '② 屏住', hint: '慢慢数到 4', cta: '还憋着 →' },
  { label: '③ 呼气', hint: '慢慢数到 6,把这件事一起吐出去', cta: '吐完了 →' },
];

function Release() {
  const pending = useUnwindStore((s) => s.pending);
  const breathStep = useUnwindStore((s) => s.breathStep);
  const nextBreath = useUnwindStore((s) => s.nextBreath);
  const finalizeRelease = useUnwindStore((s) => s.finalizeRelease);
  const cancelPending = useUnwindStore((s) => s.cancelPending);
  if (!pending) return null;

  const step = BREATH_STEPS[breathStep - 1];

  return (
    <div className="uw-release">
      <OpenHand className="uw-hand" />
      {step ? (
        <>
          <div className="uw-breath-label">{step.label}</div>
          <div className="uw-breath-hint">{step.hint}</div>
          <button className="uw-breath-btn" onClick={nextBreath}>
            {step.cta}
          </button>
        </>
      ) : (
        <>
          <p className="uw-release-line">这件事不是我一个人能扭转的,我允许自己先放下它,把力气留给我能做主的地方。</p>
          <button className="uw-breath-btn" onClick={finalizeRelease}>
            放下,记下来
          </button>
        </>
      )}
      <button className="uw-cancel" onClick={cancelPending}>
        先不弄了
      </button>
    </div>
  );
}

function Act() {
  const pending = useUnwindStore((s) => s.pending);
  const actionText = useUnwindStore((s) => s.actionText);
  const setActionText = useUnwindStore((s) => s.setActionText);
  const finalizeAct = useUnwindStore((s) => s.finalizeAct);
  const cancelPending = useUnwindStore((s) => s.cancelPending);
  if (!pending) return null;
  return (
    <div className="uw-act">
      <div className="uw-card">
        <div className="uw-card-tag">{pending.tag}</div>
        <div className="uw-card-text">{pending.text}</div>
      </div>
      <p className="uw-ask">我现在能做的最小一步是——</p>
      <textarea
        className="uw-textarea"
        placeholder="比如:发条消息问清楚截止时间"
        value={actionText}
        onChange={(e) => setActionText(e.target.value)}
        rows={2}
      />
      <button className="uw-submit" disabled={!actionText.trim()} onClick={finalizeAct}>
        记下来,去做
      </button>
      <button className="uw-cancel" onClick={cancelPending}>
        先不弄了
      </button>
    </div>
  );
}

function MapView() {
  const entries = useUnwindStore((s) => s.entries);
  if (!entries.length) return null;

  const counts = new Map<string, number>();
  for (const e of entries) counts.set(e.tag, (counts.get(e.tag) ?? 0) + 1);
  const maxCount = Math.max(...counts.values());
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const uncontrollable = entries.filter((e) => e.category === 'uncontrollable').length;

  return (
    <div className="uw-map">
      <h3 className="uw-map-title">戾气来源地图</h3>
      <p className="uw-map-note">
        记录了 {entries.length} 次,其中 {uncontrollable} 次其实不由你决定——不是你的错,是世界本来就这样。
      </p>
      <div className="uw-bars">
        {rows.map(([tag, n]) => (
          <div className="uw-bar-row" key={tag}>
            <span className="uw-bar-label">{tag}</span>
            <div className="uw-bar-track">
              <div className="uw-bar-fill" style={{ width: `${(n / maxCount) * 100}%` }} />
            </div>
            <span className="uw-bar-count">{n}</span>
          </div>
        ))}
      </div>
      <div className="uw-history">
        {entries.slice(0, 8).map((e) => (
          <div className="uw-hist-item" key={e.id}>
            <span className={'uw-hist-badge ' + (e.category === 'controllable' ? 'ctl' : 'unc')}>
              {e.category === 'controllable' ? '已行动' : '已放下'}
            </span>
            <span className="uw-hist-text">{e.text}</span>
            <span className="uw-hist-tag">{e.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Unwind() {
  const init = useUnwindStore((s) => s.init);
  const pending = useUnwindStore((s) => s.pending);
  const subphase = useUnwindStore((s) => s.subphase);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div id="unwind">
      <div className="lib-head">
        <h2>
          掌控圈
          <Sparkle className="head-sparkle" />
          <Squiggle className="head-squiggle" />
        </h2>
      </div>
      <p className="uw-sub">气头上先别讲道理,分个类,给戾气一个去处。</p>

      {!pending ? (
        <>
          <WriteForm />
          <MapView />
        </>
      ) : subphase === 'sort' ? (
        <Sort />
      ) : subphase === 'release' ? (
        <Release />
      ) : (
        <Act />
      )}
    </div>
  );
}
