/**
 * 右上角搜索框(阅读 / 发现 模式)。跟随当前模式,写入各自 store 的 query。
 * 思维导图模式的节点搜索在其工具栏里(见 Toolbar)。
 */

import { useReadingStore } from '../reading/useReadingStore';
import { useDiscoverStore } from '../discover/useDiscoverStore';
import { IconSearch } from './icons';

export function TopSearch({ mode }: { mode: 'reading' | 'discover' }) {
  const rQuery = useReadingStore((s) => s.query);
  const rSet = useReadingStore((s) => s.setQuery);
  const dQuery = useDiscoverStore((s) => s.query);
  const dSet = useDiscoverStore((s) => s.setQuery);

  const query = mode === 'reading' ? rQuery : dQuery;
  const setQuery = mode === 'reading' ? rSet : dSet;
  const placeholder = mode === 'reading' ? '搜索书名 / 作者' : '搜索发现内容';

  return (
    <div id="topsearch">
      <span className="ts-ico"><IconSearch size={16} /></span>
      <input
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setQuery('');
        }}
      />
      {query && (
        <button className="ts-clear" title="清除" onClick={() => setQuery('')}>
          ✕
        </button>
      )}
    </div>
  );
}
