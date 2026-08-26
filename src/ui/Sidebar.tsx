/**
 * 侧栏:作品库导航 + 云端同步。
 *
 * 作品库导航:每个分类(小说/散文集/诗歌/电影/音乐…)是一个独立看板,
 * 点击切换、双击重命名、× 删除、＋ 新增。切换时载入该空间自己的节点与视口。
 *
 * 同步:共享同步码模型(P2 待升级为 Auth)。上传/下载整个作品库;
 * 下载前提示云端 updated_at + 二次确认(冲突最低护栏,不丢数据)。
 */

import { useEffect, useRef, useState } from 'react';
import { formatTime } from '../core/time';
import { pull, push } from '../sync/supabase';
import { useStore } from '../store/useStore';

function SpaceRow({ id }: { id: string }) {
  const space = useStore((s) => s.spaces.find((x) => x.id === id))!;
  const active = useStore((s) => s.activeId === id);
  const renaming = useStore((s) => s.ui.renamingSpaceId === id);
  const count = useStore((s) => s.spaces.length);
  const switchSpace = useStore((s) => s.switchSpace);
  const renameSpace = useStore((s) => s.renameSpace);
  const deleteSpace = useStore((s) => s.deleteSpace);
  const setRenaming = useStore((s) => s.setRenaming);

  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(space.name);

  useEffect(() => {
    if (renaming) {
      setDraft(space.name);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming, space.name]);

  const nodeCount = space.doc.nodes.length;

  if (renaming) {
    return (
      <div className="navitem renaming">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') renameSpace(id, draft);
            else if (e.key === 'Escape') setRenaming(null);
          }}
          onBlur={() => renameSpace(id, draft)}
        />
      </div>
    );
  }

  return (
    <div
      className={'navitem' + (active ? ' on' : '')}
      onClick={() => switchSpace(id)}
      onDoubleClick={() => setRenaming(id)}
      title="点击切换 · 双击重命名"
    >
      <span className="nm">{space.name}</span>
      {nodeCount > 0 && <span className="cnt">{nodeCount}</span>}
      <span
        className="del"
        title="删除这个分类"
        onClick={(e) => {
          e.stopPropagation();
          if (count <= 1) {
            alert('至少保留一个分类');
            return;
          }
          if (confirm(`删除分类「${space.name}」及其全部内容?此操作不可撤销。`)) deleteSpace(id);
        }}
      >
        ×
      </span>
    </div>
  );
}

export function Sidebar() {
  const spaceIds = useStore((s) => s.spaces.map((x) => x.id));
  const addSpace = useStore((s) => s.addSpace);
  const syncKey = useStore((s) => s.ui.syncKey);
  const syncMsg = useStore((s) => s.ui.syncMsg);
  const autoSync = useStore((s) => s.ui.autoSync);
  const setSyncKey = useStore((s) => s.setSyncKey);
  const setSyncMsg = useStore((s) => s.setSyncMsg);
  const setAutoSync = useStore((s) => s.setAutoSync);
  const replaceLibrary = useStore((s) => s.replaceLibrary);

  const doPush = async () => {
    if (!syncKey.trim()) return setSyncMsg('请先填同步码');
    setSyncMsg('上传中…');
    try {
      await push(syncKey.trim(), useStore.getState().snapshot());
      setSyncMsg('✓ 已上传 ' + new Date().toTimeString().slice(0, 5));
    } catch (e) {
      setSyncMsg((e as Error).message || '网络错误');
    }
  };

  const doPull = async () => {
    if (!syncKey.trim()) return setSyncMsg('请先填同步码');
    setSyncMsg('下载中…');
    try {
      const res = await pull(syncKey.trim());
      if (!res) return setSyncMsg('云端还没有这个同步码的数据');
      const when = formatTime(res.updatedAt);
      if (!confirm(`云端更新于 ${when}。下载会覆盖当前整个作品库,继续?`)) {
        return setSyncMsg('已取消下载');
      }
      replaceLibrary(res.data);
      setSyncMsg(`✓ 已下载(云端更新于 ${when})`);
    } catch (e) {
      setSyncMsg((e as Error).message || '网络错误');
    }
  };

  const toggleAuto = () => {
    const next = !autoSync;
    setAutoSync(next);
    if (next) doPush();
  };

  return (
    <div id="side">
      <div className="sh">
        作品库
        <a onClick={() => addSpace('新分类')} title="新增分类">
          ＋ 新增
        </a>
      </div>
      <div id="nav">
        {spaceIds.map((id) => (
          <SpaceRow key={id} id={id} />
        ))}
      </div>

      <div id="sync">
        <div className="sh" style={{ padding: '0 0 6px' }}>
          云端同步
        </div>
        <input
          placeholder="同步码(自定义,如 hannah-2026)"
          value={syncKey}
          onChange={(e) => setSyncKey(e.target.value)}
        />
        <div className="btns">
          <button onClick={doPush}>上传</button>
          <button onClick={doPull}>下载</button>
          <button className={autoSync ? 'on' : ''} onClick={toggleAuto}>
            自动:{autoSync ? '开' : '关'}
          </button>
        </div>
        <div id="syncmsg">{syncMsg}</div>
      </div>
    </div>
  );
}
