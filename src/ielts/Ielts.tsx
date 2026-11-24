/**
 * 雅思错题集:左侧按技能筛选 + 右侧「看原题 → 揭晓答案 → 推理错因 → 对照解析」。
 * 复用笑点解析/迷因探踪的选单/推理/结局样式(.mc-/.mq-/.mr-)。
 */

import { useEffect, useRef, useState } from 'react';
import {
  ERROR_TAGS,
  ERROR_TAG_LABEL,
  QTYPES_BY_SKILL,
  SKILLS,
  SKILL_LABEL,
  type IeltsSkill,
  type WrongQuestion,
} from './types';
import { useIeltsStore } from './useIeltsStore';
import { getImage } from '../core/imagedb';
import { Sparkle, Squiggle } from '../ui/doodles';
import { IconClip } from '../ui/icons';

/** 原题配图:贴一张截图(可 Ctrl/⌘+V 粘贴,也可点按钮上传),没有就不显示画框 */
function QuestionFigure({ questionId }: { questionId: string }) {
  const blobId = useIeltsStore((s) => s.images[questionId]);
  const attachImage = useIeltsStore((s) => s.attachImage);
  const removeImage = useIeltsStore((s) => s.removeImage);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!blobId) {
      setBlobUrl(null);
      return;
    }
    let alive = true;
    let obj: string | null = null;
    void getImage(blobId).then((b) => {
      if (!alive || !b) return;
      obj = URL.createObjectURL(b);
      setBlobUrl(obj);
    });
    return () => {
      alive = false;
      if (obj) URL.revokeObjectURL(obj);
    };
  }, [blobId]);

  // 这道题的卡片挂载期间直接粘贴图片 → 贴成原题截图
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) {
            e.preventDefault();
            void attachImage(questionId, f);
          }
          return;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [questionId, attachImage]);

  const hasImg = !!blobUrl;

  return (
    <div className={'ms-figure' + (hasImg ? ' photo' : '')}>
      {hasImg ? (
        <img className="ms-photo" src={blobUrl} alt="原题截图" />
      ) : (
        <div className="ms-noimg">还没有原题截图 · 点「贴图片」或直接 Ctrl/⌘+V 粘贴</div>
      )}
      <div className="ms-figbtns">
        <button className="ms-figbtn" onClick={() => fileRef.current?.click()}>
          {hasImg ? '换图片' : '＋ 贴图片'}
        </button>
        {hasImg && (
          <button className="ms-figbtn" onClick={() => removeImage(questionId)}>
            去图
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void attachImage(questionId, f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

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
          {item.link && (
            <a className="jk-ep ielts-link" href={item.link} target="_blank" rel="noreferrer">
              🔗 原题链接
            </a>
          )}
        </div>

        <QuestionFigure questionId={item.id} />

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
  const draftId = useIeltsStore((s) => s.draftId);
  const createError = useIeltsStore((s) => s.createError);
  const updateDraft = useIeltsStore((s) => s.updateDraft);
  const toggleDraftTag = useIeltsStore((s) => s.toggleDraftTag);
  const saveCreate = useIeltsStore((s) => s.saveCreate);
  const cancelCreate = useIeltsStore((s) => s.cancelCreate);

  return (
    <div className="joke-card ielts-form">
      <div className="jk-block">
        <div className="jk-label">原题截图(可选)</div>
        <QuestionFigure questionId={draftId} />
      </div>

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
        {(() => {
          const presets = QTYPES_BY_SKILL[draft.skill];
          const selectValue = draft.qtype === '' ? '' : presets.includes(draft.qtype) ? draft.qtype : '__custom__';
          return (
            <>
              <select
                className="ielts-input"
                value={selectValue}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__custom__') {
                    if (selectValue !== '__custom__') updateDraft({ qtype: '' });
                  } else {
                    updateDraft({ qtype: v });
                  }
                }}
              >
                <option value="">请选择题型</option>
                {presets.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
                <option value="__custom__">其他(自定义)…</option>
              </select>
              {selectValue === '__custom__' && (
                <input
                  className="ielts-input"
                  style={{ marginTop: 8 }}
                  value={draft.qtype}
                  onChange={(e) => updateDraft({ qtype: e.target.value })}
                  placeholder="输入自定义题型"
                />
              )}
            </>
          );
        })()}
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
        <div className="jk-label">网页链接(可选)</div>
        <input
          className="ielts-input"
          value={draft.link}
          onChange={(e) => updateDraft({ link: e.target.value })}
          placeholder="原题出处 / 在线真题页的 URL"
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

/** 题型合集:一个题型 = 一张卡片,新题归进已有合集,不在首页里不停新增方块 */
function Chooser() {
  const items = useIeltsStore((s) => s.items);
  const activeSkill = useIeltsStore((s) => s.activeSkill);
  const onlyUnmastered = useIeltsStore((s) => s.onlyUnmastered);
  const mastered = useIeltsStore((s) => s.mastered);
  const selectQtype = useIeltsStore((s) => s.selectQtype);

  const shown = items
    .filter((j) => !activeSkill || j.skill === activeSkill)
    .filter((j) => !onlyUnmastered || !mastered.has(j.id));

  const groups = new Map<string, { skill: IeltsSkill; qtype: string; items: WrongQuestion[] }>();
  for (const j of shown) {
    const key = j.skill + '|' + j.qtype;
    const g = groups.get(key);
    if (g) g.items.push(j);
    else groups.set(key, { skill: j.skill, qtype: j.qtype, items: [j] });
  }
  const groupList = [...groups.values()];

  return (
    <div className="meme-chooser">
      <p className="mc-intro">
        选一个<b>题型</b>,打开它的错题合集:每道题都是先看<b>原题</b>,揭晓
        <b>正确答案</b>,再推理<b>错因</b>,最后对照解析——同一题型的新题会自动并进这张卡片,不会另开新的。
      </p>
      {groupList.length === 0 ? (
        <div className="empty">
          <div className="empty-sub">这个筛选下还没有错题,换个技能看看,或导入 / 复制采集指令收集几道。</div>
        </div>
      ) : (
        <div className="mc-grid">
          {groupList.map((g) => {
            const allMastered = g.items.every((it) => mastered.has(it.id));
            return (
              <button key={g.skill + '|' + g.qtype} className="mc-card" onClick={() => selectQtype(g.skill, g.qtype)}>
                <div className="mcc-title">
                  {g.qtype}
                  {allMastered && <span className="fc-tag" style={{ marginLeft: 8 }}>✓ 已掌握</span>}
                </div>
                <div className="mcc-sum">
                  {SKILL_LABEL[g.skill]} · 共 {g.items.length} 题
                </div>
                <div className="mcc-foot">查看 →</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** 某个题型合集里的题目列表 */
function QtypeList() {
  const items = useIeltsStore((s) => s.items);
  const activeQtype = useIeltsStore((s) => s.activeQtype);
  const mastered = useIeltsStore((s) => s.mastered);
  const selectItem = useIeltsStore((s) => s.selectItem);

  if (!activeQtype) return null;
  const list = items.filter((j) => j.skill === activeQtype.skill && j.qtype === activeQtype.qtype);

  return (
    <div className="meme-chooser">
      <p className="mc-intro">
        「{activeQtype.qtype}」合集里的 {list.length} 道错题,点一道开始复盘。
      </p>
      <div className="mc-grid">
        {list.map((j) => (
          <button key={j.id} className="mc-card" onClick={() => selectItem(j.id)}>
            <div className="mcc-title">
              {j.source || '未标注来源'}
              {mastered.has(j.id) && <span className="fc-tag" style={{ marginLeft: 8 }}>✓ 已掌握</span>}
            </div>
            <div className="mcc-sum">{j.stem.length > 50 ? j.stem.slice(0, 50) + '…' : j.stem}</div>
            <div className="mcc-foot">复盘 →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Ielts() {
  const items = useIeltsStore((s) => s.items);
  const activeSkill = useIeltsStore((s) => s.activeSkill);
  const onlyUnmastered = useIeltsStore((s) => s.onlyUnmastered);
  const mastered = useIeltsStore((s) => s.mastered);
  const activeQtype = useIeltsStore((s) => s.activeQtype);
  const activeId = useIeltsStore((s) => s.activeId);
  const phase = useIeltsStore((s) => s.phase);
  const status = useIeltsStore((s) => s.status);
  const creating = useIeltsStore((s) => s.creating);
  const init = useIeltsStore((s) => s.init);
  const setSkill = useIeltsStore((s) => s.setSkill);
  const toggleOnlyUnmastered = useIeltsStore((s) => s.toggleOnlyUnmastered);
  const exitItem = useIeltsStore((s) => s.exitItem);
  const exitQtype = useIeltsStore((s) => s.exitQtype);
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
            {creating ? '新建错题' : active ? active.qtype : activeQtype ? activeQtype.qtype : '雅思错题集'}
            <Sparkle className="head-sparkle" />
            <Squiggle className="head-squiggle" />
          </h2>
          {creating ? (
            <button className="meme-exit-link" onClick={cancelCreate}>
              ← 全部错题
            </button>
          ) : active ? (
            <button className="meme-exit-link" onClick={exitItem}>
              ← {activeQtype?.qtype ?? '全部错题'}
            </button>
          ) : (
            activeQtype && (
              <button className="meme-exit-link" onClick={exitQtype}>
                ← 全部题型
              </button>
            )
          )}
        </div>

        {creating ? (
          <CreateForm />
        ) : active ? (
          phase === 'quiz' ? (
            <Quiz />
          ) : phase === 'result' ? (
            <Result item={active} />
          ) : (
            <QuestionRead item={active} />
          )
        ) : activeQtype ? (
          <QtypeList />
        ) : (
          <Chooser />
        )}
      </div>
    </div>
  );
}
