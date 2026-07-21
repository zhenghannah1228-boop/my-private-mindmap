/**
 * 应用根:顶部模式切换(阅读 / 思维导图),分别渲染阅读库或思维导图。
 * 两个模块数据完全独立(阅读库用 IndexedDB + localStorage;思维导图用作品库 localStorage)。
 */

import { useEffect } from 'react';
import { MindMap } from './ui/MindMap';
import { ReadingLibrary } from './reading/ReadingLibrary';
import { Discover } from './discover/Discover';
import { TopSearch } from './ui/TopSearch';
import { installPersistence } from './store/persist';
import { useAppStore } from './store/useAppStore';

function ModeSwitch() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  return (
    <div id="modeswitch">
      <button className={mode === 'reading' ? 'on' : ''} onClick={() => setMode('reading')}>
        阅读
      </button>
      <button className={mode === 'discover' ? 'on' : ''} onClick={() => setMode('discover')}>
        发现
      </button>
      <button className={mode === 'mindmap' ? 'on' : ''} onClick={() => setMode('mindmap')}>
        思维导图
      </button>
    </div>
  );
}

export default function App() {
  const mode = useAppStore((s) => s.mode);

  // 思维导图持久化 + 自动同步副作用(装一次,与模式无关)
  useEffect(() => installPersistence(), []);

  return (
    <>
      <ModeSwitch />
      {(mode === 'reading' || mode === 'discover') && <TopSearch mode={mode} />}
      {mode === 'reading' ? <ReadingLibrary /> : mode === 'discover' ? <Discover /> : <MindMap />}
    </>
  );
}
