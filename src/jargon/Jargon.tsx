/**
 * 大厂黑话看板:左侧分类导航 + 右侧词条卡片流(黑话 → 人话 + 例句)。
 * 顶部可搜索;底部复制采集指令 / 导入。复用发现看板的卡片流样式(.feed)。
 */

import { useEffect } from 'react';
import { JARGON_CATEGORIES } from './types';
import { useJargonStore } from './useJargonStore';
import { Sparkle, Squiggle } from '../ui/doodles';
import { IconClip, IconSearch } from '../ui/icons';

export function Jargon() {
  const jargons = useJargonStore((s) => s.jargons);
  const activeCat = useJargonStore((s) => s.activeCat);
  const query = useJargonStore((s) => s.query);
  const status = useJargonStore((s) => s.status);
  const init = useJargonStore((s) => s.init);
  const setCat = useJargonStore((s) => s.setCat);
  const setQuery = useJargonStore((s) => s.setQuery);
  const copyPrompt = useJargonStore((s) => s.copyPrompt);
  const importFile = useJargonStore((s) => s.importFile);

  useEffect(() => {
    init();
  }, [init]);

  const countOf = (c: string) => jargons.filter((j) => j.category === c).length;
  const q = query.trim().toLowerCase();
  const shown = q
    ? jargons.filter((j) =>
        (j.term + ' ' + j.plain + ' ' + (j.example || '') + ' ' + j.category).toLowerCase().includes(q)
      )
    : activeCat
      ? jargons.filter((j) => j.category === activeCat)
      : jargons;

  return (
    <div id="jargon">
      <div id="side">
        <div className="sh">大厂黑话</div>
        <div id="nav">
          <div className={'navitem' + (activeCat === null ? ' on' : '')} onClick={() => setCat(null)}>
            <span className="nm">全部</span>
            <span className="cnt">{jargons.length}</span>
          </div>
          {JARGON_CATEGORIES.map((c) => (
            <div key={c} className={'navitem' + (activeCat === c ? ' on' : '')} onClick={() => setCat(c)}>
              <span className="nm">{c}</span>
              {countOf(c) > 0 && <span className="cnt">{countOf(c)}</span>}
            </div>
          ))}
        </div>
        <div id="jargon-foot">
          <button className="collect-btn" onClick={copyPrompt} title="复制采集指令,交给任意 AI 产出更多黑话">
            <IconClip size={16} /> 复制采集指令
          </button>
          <label className="import-btn" style={{ cursor: 'pointer' }}>
            ＋ 导入黑话 JSON
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

      <div id="jargon-main">
        <div className="lib-head">
          <h2>
            {q ? `搜索「${query.trim()}」` : activeCat ?? '大厂黑话'}
            <Sparkle className="head-sparkle" />
            <Squiggle className="head-squiggle" />
          </h2>
          <span className="lib-count">{shown.length} 条</span>
          <div className="jg-search">
            <span className="jg-search-ico">
              <IconSearch size={15} />
            </span>
            <input
              value={query}
              placeholder="搜黑话 / 人话"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setQuery('');
              }}
            />
            {query && (
              <button className="jg-search-clear" onClick={() => setQuery('')} title="清除">
                ✕
              </button>
            )}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">
              <IconSearch size={44} />
            </div>
            没有匹配的黑话
            <div className="empty-sub">换个关键词,或清空搜索框</div>
          </div>
        ) : (
          <div className="feed">
            {shown.map((j) => (
              <div className="jargon-card" key={j.id}>
                <div className="jg-top">
                  <span className="jg-term">{j.term}</span>
                  <span className="fc-tag">{j.category}</span>
                </div>
                {j.literal && <div className="jg-literal">字面:{j.literal}</div>}
                <div className="jg-plain">
                  <span className="jg-plain-label">人话</span>
                  {j.plain}
                </div>
                {j.example && <div className="jg-eg">例:{j.example}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
