import { useNetCopyStore } from './useNetCopyStore';
import { NETCOPY_CATEGORIES } from './types';

export function NetCopy() {
  const { category, lang, query, setCategory, setLang, setQuery, filtered } =
    useNetCopyStore();
  const items = filtered();

  return (
    <div id="netcopy">
      {/* 工具栏 */}
      <div className="nc-toolbar">
        <input
          className="nc-search"
          type="search"
          placeholder="搜文案、品牌、分析…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="nc-filters">
          {/* 语言切换 */}
          <div className="nc-lang-group">
            {(['all', 'zh', 'en'] as const).map((l) => (
              <button
                key={l}
                className={lang === l ? 'on' : ''}
                onClick={() => setLang(l)}
              >
                {l === 'all' ? '全部' : l === 'zh' ? '中文' : 'EN'}
              </button>
            ))}
          </div>
          {/* 技法分类 */}
          <div className="nc-cat-group">
            <button
              className={category === null ? 'on' : ''}
              onClick={() => setCategory(null)}
            >
              全部技法
            </button>
            {NETCOPY_CATEGORIES.map((c) => (
              <button
                key={c}
                className={category === c ? 'on' : ''}
                onClick={() => setCategory(category === c ? null : c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 卡片流 */}
      <div className="feed nc-feed">
        {items.length === 0 && (
          <p className="nc-empty">没有匹配的文案</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="nc-card">
            <div className="nc-meta">
              <span className="nc-cat-tag">{item.category}</span>
              <span className={`nc-lang-tag nc-lang-${item.lang}`}>
                {item.lang === 'zh' ? '中文' : 'EN'}
              </span>
            </div>
            <blockquote className="nc-text">{item.text}</blockquote>
            <div className="nc-source">— {item.source}</div>
            <p className="nc-analysis">{item.analysis}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
