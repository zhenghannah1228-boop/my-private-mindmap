/**
 * 每日发现看板:左侧分类导航 + 复制采集指令;右侧卡片流(随手翻)。
 */

import { useEffect } from 'react';
import { DISCOVER_CATEGORIES } from './types';
import { useDiscoverStore } from './useDiscoverStore';
import { Cat, Sparkle, Squiggle } from '../ui/doodles';
import { CategoryIcon, IconDice, IconClip, IconSearch } from '../ui/icons';

export function Discover() {
  const cards = useDiscoverStore((s) => s.cards);
  const activeCat = useDiscoverStore((s) => s.activeCat);
  const status = useDiscoverStore((s) => s.status);
  const query = useDiscoverStore((s) => s.query);
  const init = useDiscoverStore((s) => s.init);
  const setCat = useDiscoverStore((s) => s.setCat);
  const copyPrompt = useDiscoverStore((s) => s.copyPrompt);
  const surprise = useDiscoverStore((s) => s.surprise);

  useEffect(() => {
    void init();
  }, [init]);

  const countOf = (c: string) => cards.filter((k) => k.category === c).length;
  const q = query.trim().toLowerCase();
  // 搜索时跨所有类别匹配标题/正文/类别;否则按选中类别
  const shown = q
    ? cards.filter((c) => (c.title + ' ' + c.body + ' ' + c.category).toLowerCase().includes(q))
    : activeCat
      ? cards.filter((c) => c.category === activeCat)
      : cards;

  return (
    <div id="discover">
      <div id="side">
        <div className="sh">每日发现</div>
        <div id="nav">
          <div
            className={'navitem' + (activeCat === null ? ' on' : '')}
            onClick={() => setCat(null)}
          >
            <span className="nm"><CategoryIcon name="全部" /> 全部</span>
            <span className="cnt">{cards.length}</span>
          </div>
          {DISCOVER_CATEGORIES.map((c) => (
            <div
              key={c}
              className={'navitem' + (activeCat === c ? ' on' : '')}
              onClick={() => setCat(c)}
            >
              <span className="nm">
                <CategoryIcon name={c} /> {c}
              </span>
              {countOf(c) > 0 && <span className="cnt">{countOf(c)}</span>}
            </div>
          ))}
        </div>
        <div id="discover-foot">
          <button
            className="surprise-btn"
            onClick={surprise}
            title="随机打开一个有趣的网站(新标签页)"
          >
            <IconDice size={16} /> Surprise Me
          </button>
          <button
            className="collect-btn"
            onClick={copyPrompt}
            title="复制采集指令,交给任意 AI 即可产出每日卡片"
          >
            <IconClip size={16} /> 复制采集指令
          </button>
          {status && <div className="reading-status">{status}</div>}
        </div>
      </div>

      <div id="discover-main">
        <div className="lib-head">
          <h2>
            {q ? `搜索「${query.trim()}」` : activeCat ?? '每日发现'}
            <Sparkle className="head-sparkle" />
            <Squiggle className="head-squiggle" />
          </h2>
          <span className="lib-count">{shown.length} 条</span>
        </div>

        {shown.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">{q ? <IconSearch size={48} /> : <Cat className="doodle" />}</div>
            {q ? '没有匹配的内容' : '还没有内容'}
            <div className="empty-sub">
              {q
                ? '换个关键词试试,或清空搜索框'
                : '每天会自动采集一批冷知识、故事、名画与神话。点左下角「复制采集指令」也可手动采集。'}
            </div>
          </div>
        ) : (
          <div className="feed">
            {shown.map((c) => (
              <div className="feed-card" key={c.id}>
                <div className="fc-head">
                  <span className={'fc-tag tag-' + (DISCOVER_CATEGORIES as readonly string[]).indexOf(c.category)}>
                    <CategoryIcon name={c.category} size={15} /> {c.category}
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
