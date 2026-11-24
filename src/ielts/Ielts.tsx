/**
 * 雅思错题集:左侧按技能筛选 + 右侧「看原题 → 揭晓答案 → 推理错因 → 对照解析」。
 * 复用笑点解析/迷因探踪的选单/推理/结局样式(.mc-/.mq-/.mr-)。
 */

import { useEffect } from 'react';
import { ERROR_TAGS, ERROR_TAG_LABEL, SKILLS, SKILL_LABEL, type IeltsSkill, type WrongQuestion } from './types';
import { useIeltsStore } from './useIeltsStore';
import { Sparkle, Squiggle } from '../ui/doodles';
import { IconClip } from '../ui/icons';

function QuestionRead({ item }: { item: WrongQuestion }) {
  const revealed = useIeltsStore((s) => s.revealed);
  const reveal = useIeltsStore((s) => s.reveal);
  const startQuiz = useIeltsStore((s) => s.startQuiz);
  return (
    <>
      <div className="joke-card">
        <div className="jk-head">
          <span className="jk-show">{SKILL_LABEL[item.skill]}</span>
          <span className="jk-ep">{item.qtype}</span>
          {item.source && <span className="jk-ep">· {item.source}</span>}
        </div>

        <div className="jk-block">
          <div className="jk-label">原题</div>
          <div className="jk-text">{item.stem}</div>
        </div>
        {item.yourAnswer && (
          <div className="jk-block">
            <div className="jk-label">你当时的答案</div>
            <div className="jk-text">{item.yourAnswer}</div>
          </div>
        )}

        {revealed ? (
          <div className="jk-block punch">
            <div className="jk-label">正确答案</div>
            <div className="jk-text">{item.correctAnswer}</div>
          </div>
        ) : (
          <button className="jk-reveal" onClick={reveal}>
            揭晓正确答案
          </button>
        )}
      </div>

      {revealed && (
        <button className="jk-analyze" onClick={startQuiz}>
          错在哪? →
        </button>
      )}
      <div className="meme-tip">
        {revealed ? '试着推理:这道题踩了哪些错因?' : '先自己想想问题出在哪,再揭晓正确答案。'}
      </div>
    </>
  );
}

function Quiz() {
  const guess = useIeltsStore((s) => s.guess);
  const toggle = useIeltsStore((s) => s.toggleTag);
  const submit = useIeltsStore((s) => s.submitQuiz);
  return (
    <div className="meme-quiz">
      <h3 className="mq-title">
        这道题错在哪?
        <span className="mq-sub">勾选你认为踩中的错因(可多选)</span>
      </h3>
      <div className="mq-grid">
        {ERROR_TAGS.map((t) => (
          <button
            key={t.key}
            className={'mq-factor' + (guess.includes(t.key) ? ' on' : '')}
            onClick={() => toggle(t.key)}
          >
            <span className="mqf-label">{t.label}</span>
            <span className="mqf-desc">{t.desc}</span>
          </button>
        ))}
      </div>
      <button className="mq-submit" disabled={!guess.length} onClick={submit}>
        揭晓解析
      </button>
    </div>
  );
}

function Result({ item }: { item: WrongQuestion }) {
  const guess = useIeltsStore((s) => s.guess);
  const mastered = useIeltsStore((s) => s.mastered);
  const replay = useIeltsStore((s) => s.replay);
  const exitItem = useIeltsStore((s) => s.exitItem);
  const toggleMastered = useIeltsStore((s) => s.toggleMastered);
  const correct = new Set(item.tags);
  const picked = new Set(guess);
  const hits = item.tags.filter((f) => picked.has(f));
  const wrong = guess.filter((f) => !correct.has(f));
  const rate = Math.round((hits.length / Math.max(1, item.tags.length)) * 100);
  const isMastered = mastered.has(item.id);
  return (
    <div className="meme-result">
      <div className="mr-score">
        命中 {hits.length}/{item.tags.length}
        <span className="mr-rate">{rate}%</span>
      </div>
      <div className="mr-factors">
        {item.tags.map((f) => (
          <span key={f} className={'mr-chip ' + (picked.has(f) ? 'hit' : 'miss')}>
            {picked.has(f) ? '✓' : '·'} {ERROR_TAG_LABEL[f]}
          </span>
        ))}
        {wrong.map((f) => (
          <span key={f} className="mr-chip over">
            ✕ {ERROR_TAG_LABEL[f]}
          </span>
        ))}
      </div>
      <div className="mr-legend">✓ 命中 · · 漏选 · ✕ 这个其实没踩上</div>
      <div className="mr-analysis">
        <div className="mra-title">错题解析</div>
        {item.analysis}
      </div>
      <div className="mr-actions">
        <button className={'mr-replay' + (isMastered ? ' on' : '')} onClick={() => toggleMastered(item.id)}>
          {isMastered ? '✓ 已掌握' : '标记已掌握'}
        </button>
        <button className="mr-replay" onClick={replay}>
          ↺ 再看一遍
        </button>
        <button className="mr-exit" onClick={exitItem}>
          换一道题
        </button>
      </div>
    </div>
  );
}

function CreateForm() {
  const draft = useIeltsStore((s) => s.draft);
  const createError = useIeltsStore((s) => s.createError);
  const updateDraft = useIeltsStore((s) => s.updateDraft);
  const toggleDraftTag = useIeltsStore((s) => s.toggleDraftTag);
  const saveCreate = useIeltsStore((s) => s.saveCreate);
  const cancelCreate = useIeltsStore((s) => s.cancelCreate);

  return (
    <div className="joke-card ielts-form">
      <div className="jk-block">
        <div className="jk-label">技能</div>
        <div className="ielts-skill-row">
          {SKILLS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={'mq-factor ielts-skill-btn' + (draft.skill === s.key ? ' on' : '')}
              onClick={() => updateDraft({ skill: s.key })}
            >
              <span className="mqf-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="jk-block">
        <div className="jk-label">题型 *</div>
        <input
          className="ielts-input"
          value={draft.qtype}
          onChange={(e) => updateDraft({ qtype: e.target.value })}
          placeholder="如 填空题 / Matching Headings / Task 2 议论文 / Part 2 长题"
        />
      </div>

      <div className="jk-block">
        <div className="jk-label">来源(可选)</div>
        <input
          className="ielts-input"
          value={draft.source}
          onChange={(e) => updateDraft({ source: e.target.value })}
          placeholder="如 剑16 Test 2;拿不准就留空"
        />
      </div>

      <div className="jk-block">
        <div className="jk-label">原题 *</div>
        <textarea
          className="ielts-textarea"
          rows={3}
          value={draft.stem}
          onChange={(e) => updateDraft({ stem: e.target.value })}
          placeholder="题干或场景描述,交代清楚上下文"
        />
      </div>

      <div className="jk-block">
        <div className="jk-label">你当时的答案(可选)</div>
        <input
          className="ielts-input"
          value={draft.yourAnswer}
          onChange={(e) => updateDraft({ yourAnswer: e.target.value })}
        />
      </div>

      <div className="jk-block">
        <div className="jk-label">正确答案 *</div>
        <textarea
          className="ielts-textarea"
          rows={2}
          value={draft.correctAnswer}
          onChange={(e) => updateDraft({ correctAnswer: e.target.value })}
        />
      </div>

      <div className="jk-block">
        <div className="jk-label">错因标签(至少选 1 个) *</div>
        <div className="mq-grid">
          {ERROR_TAGS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={'mq-factor' + (draft.tags.includes(t.key) ? ' on' : '')}
              onClick={() => toggleDraftTag(t.key)}
            >
              <span className="mqf-label">{t.label}</span>
              <span className="mqf-desc">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="jk-block">
        <div className="jk-label">解析 *</div>
        <textarea
          className="ielts-textarea"
          rows={3}
          value={draft.analysis}
          onChange={(e) => updateDraft({ analysis: e.target.value })}
          placeholder="为什么错、下次怎么避免"
        />
      </div>

      {createError && <div className="ielts-form-error">{createError}</div>}

      <div className="mr-actions">
        <button className="jk-reveal" onClick={saveCreate}>
          保存错题
        </button>
        <button className="mr-exit" onClick={cancelCreate}>
          取消
        </button>
      </div>
    </div>
  );
}

function Chooser() {
  const items = useIeltsStore((s) => s.items);
  const activeSkill = useIeltsStore((s) => s.activeSkill);
  const onlyUnmastered = useIeltsStore((s) => s.onlyUnmastered);
  const mastered = useIeltsStore((s) => s.mastered);
  const selectItem = useIeltsStore((s) => s.selectItem);

  const shown = items
    .filter((j) => !activeSkill || j.skill === activeSkill)
    .filter((j) => !onlyUnmastered || !mastered.has(j.id));

  return (
    <div className="meme-chooser">
      <p className="mc-intro">
        选一道错题:先看<b>原题</b>,揭晓<b>正确答案</b>,再推理它踩了哪些
        <b>错因</b>,最后对照解析——顺手标记是否已经<b>掌握</b>。
      </p>
      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-sub">这个筛选下还没有错题,换个技能看看,或导入 / 复制采集指令收集几道。</div>
        </div>
      ) : (
        <div className="mc-grid">
          {shown.map((j) => (
            <button key={j.id} className="mc-card" onClick={() => selectItem(j.id)}>
              <div className="mcc-title">
                {j.qtype}
                {mastered.has(j.id) && <span className="fc-tag" style={{ marginLeft: 8 }}>✓ 已掌握</span>}
              </div>
              <div className="mcc-sum">
                {SKILL_LABEL[j.skill]}
                {j.source ? ` · ${j.source}` : ''}
              </div>
              <div className="mcc-foot">复盘 →</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Ielts() {
  const items = useIeltsStore((s) => s.items);
  const activeSkill = useIeltsStore((s) => s.activeSkill);
  const onlyUnmastered = useIeltsStore((s) => s.onlyUnmastered);
  const mastered = useIeltsStore((s) => s.mastered);
  const activeId = useIeltsStore((s) => s.activeId);
  const phase = useIeltsStore((s) => s.phase);
  const status = useIeltsStore((s) => s.status);
  const creating = useIeltsStore((s) => s.creating);
  const init = useIeltsStore((s) => s.init);
  const setSkill = useIeltsStore((s) => s.setSkill);
  const toggleOnlyUnmastered = useIeltsStore((s) => s.toggleOnlyUnmastered);
  const exitItem = useIeltsStore((s) => s.exitItem);
  const copyPrompt = useIeltsStore((s) => s.copyPrompt);
  const importFile = useIeltsStore((s) => s.importFile);
  const startCreate = useIeltsStore((s) => s.startCreate);
  const cancelCreate = useIeltsStore((s) => s.cancelCreate);

  useEffect(() => {
    init();
  }, [init]);

  const active = activeId ? items.find((j) => j.id === activeId) ?? null : null;
  const countOf = (sk: IeltsSkill) => items.filter((j) => j.skill === sk).length;

  return (
    <div id="ielts">
      <div id="side">
        <div className="sh">雅思错题集</div>
        <div id="nav">
          <div className={'navitem' + (activeSkill === null ? ' on' : '')} onClick={() => setSkill(null)}>
            <span className="nm">全部</span>
            <span className="cnt">{items.length}</span>
          </div>
          {SKILLS.map((s) => (
            <div key={s.key} className={'navitem' + (activeSkill === s.key ? ' on' : '')} onClick={() => setSkill(s.key)}>
              <span className="nm">{s.label}</span>
              {countOf(s.key) > 0 && <span className="cnt">{countOf(s.key)}</span>}
            </div>
          ))}
          <div className={'navitem' + (onlyUnmastered ? ' on' : '')} onClick={toggleOnlyUnmastered}>
            <span className="nm">仅看待复习</span>
            <span className="cnt">{items.length - mastered.size > 0 ? items.length - mastered.size : 0}</span>
          </div>
        </div>
        <div id="ielts-foot">
          <button className="import-btn" onClick={startCreate}>
            ＋ 手动新建错题
          </button>
          <button className="collect-btn" onClick={copyPrompt} title="复制采集指令,交给任意 AI 整理更多错题">
            <IconClip size={16} /> 复制采集指令
          </button>
          <label className="import-btn" style={{ cursor: 'pointer' }}>
            ＋ 导入错题 JSON
            <input
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importFile(f);
                e.target.value = '';
              }}
            />
          </label>
          {status && <div className="reading-status">{status}</div>}
        </div>
      </div>

      <div id="ielts-main">
        <div className="lib-head">
          <h2>
            {creating ? '新建错题' : active ? active.qtype : '雅思错题集'}
            <Sparkle className="head-sparkle" />
            <Squiggle className="head-squiggle" />
          </h2>
          {creating ? (
            <button className="meme-exit-link" onClick={cancelCreate}>
              ← 全部错题
            </button>
          ) : (
            active && (
              <button className="meme-exit-link" onClick={exitItem}>
                ← 全部错题
              </button>
            )
          )}
        </div>

        {creating ? (
          <CreateForm />
        ) : !active ? (
          <Chooser />
        ) : phase === 'quiz' ? (
          <Quiz />
        ) : phase === 'result' ? (
          <Result item={active} />
        ) : (
          <QuestionRead item={active} />
        )}
      </div>
    </div>
  );
}
