/**
 * 每日发现看板:左侧分类导航 + 复制采集指令;右侧卡片流(随手翻)。
 */

import { useEffect } from 'react';
import { CATEGORY_EMOJI, DISCOVER_CATEGORIES } from './types';
import { useDiscoverStore } from './useDiscoverStore';

export function Discover() {
  const cards = useDiscoverStore((s) => s.cards);
  const activeCat = useDiscoverStore((s) => s.activeCat);
  const status = useDiscoverStore((s) => s.status);
  const init = useDiscoverStore((s) => s.init);
  const setCat = useDiscoverStore((s) => s.setCat);
  const copyPrompt = useDiscoverStore((s) => s.copyPrompt);

  useEffect(() => {
    void init();
  }, [init]);

  const countOf = (c: string) => cards.filter((k) => k.category === c).length;
  const shown = activeCat ? cards.filter((c) => c.category === activeCat) : cards;

  return (
    <div id="discover">
      <div id="side">
        <div className="sh">每日发现</div>
        <div id="nav">
          <div
            className={'navitem' + (activeCat === null ? ' on' : '')}
            onClick={() => setCat(null)}
          >
            <span className="nm">✨ 全部</span>
            <span className="cnt">{cards.length}</span>
          </div>
          {DISCOVER_CATEGORIES.map((c) => (
            <div
              key={c}
              className={'navitem' + (activeCat === c ? ' on' : '')}
              onClick={() => setCat(c)}
            >
              <span className="nm">
                {CATEGORY_EMOJI[c]} {c}
              </span>
              {countOf(c) > 0 && <span className="cnt">{countOf(c)}</span>}
            </div>
          ))}
        </div>
        <div id="discover-foot">
          <button className="collect-btn" onClick={copyPrompt} title="复制采集指令,交给任意 AI 即可产出每日卡片">
            📋 复制采集指令
          </button>
          {status && <div className="reading-status">{status}</div>}
        </div>
      </div>

      <div id="discover-main">
        <div className="lib-head">
          <h2>{activeCat ?? '每日发现'}</h2>
          <span className="lib-count">{shown.length} 条</span>
        </div>

        {shown.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">🎲</div>
            还没有内容
            <div className="empty-sub">
              每天会自动采集一批冷知识、故事、名画与神话。点左下角「复制采集指令」也可手动采集。
            </div>
          </div>
        ) : (
          <div className="feed">
            {shown.map((c) => (
              <div className="feed-card" key={c.id}>
                <div className="fc-head">
                  <span className={'fc-tag tag-' + (DISCOVER_CATEGORIES as readonly string[]).indexOf(c.category)}>
                    {CATEGORY_EMOJI[c.category] || '•'} {c.category}
                  </span>
                  <span className="fc-date">{c.date}</span>
                </div>
                <div className="fc-title">{c.title}</div>
                <div className="fc-body">{c.body}</div>
                {c.source && (
                  <div className="fc-source">
                    {/^https?:\/\//.test(c.source) ? (
                      <a href={c.source} target="_blank" rel="noreferrer noopener">
                        来源 ↗
                      </a>
                    ) : (
                      <span>来源:{c.source}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
