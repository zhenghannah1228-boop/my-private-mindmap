/**
 * 顶部工具栏:颜色标记、设时间、过滤、聚焦、导入导出、放置模式(+)。
 *
 * P0「导入二次确认」在这里:导入前先 confirm,避免无条件覆盖丢数据。
 */

import { useRef, useState } from 'react';
import { COLORS } from '../core/model';
import { exportJson, readJsonFile } from '../core/storage';
import { fromDatetimeLocal, toDatetimeLocal } from '../core/time';
import { fitToNodes } from '../core/viewport';
import type { ColorIndex } from '../core/types';
import { useSizeStore } from '../store/useSizeStore';
import { useStore } from '../store/useStore';
import { importImageAsSticker } from './stickerActions';

export function Toolbar() {
  const selectedId = useStore((s) => s.ui.selectedId);
  const filterMode = useStore((s) => s.ui.filterMode);
  const placeMode = useStore((s) => s.ui.placeMode);
  const autoCutout = useStore((s) => s.ui.autoCutout);
  const nodes = useStore((s) => s.doc.nodes);
  const setNodeColor = useStore((s) => s.setNodeColor);
  const setNodeDue = useStore((s) => s.setNodeDue);
  const setFilter = useStore((s) => s.setFilter);
  const setPlaceMode = useStore((s) => s.setPlaceMode);
  const setAutoCutout = useStore((s) => s.setAutoCutout);
  const replaceLibrary = useStore((s) => s.replaceLibrary);
  const searchQuery = useStore((s) => s.ui.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const imgRef = useRef<HTMLInputElement>(null);

  // 回车:把视口聚焦到命中的节点
  const fitToMatches = () => {
    const sq = searchQuery.trim().toLowerCase();
    if (!sq) return;
    const matches = useStore.getState().doc.nodes.filter((n) => n.t.toLowerCase().includes(sq));
    if (!matches.length) return;
    const r = document.getElementById('canvas')!.getBoundingClientRect();
    useStore.getState().setView(fitToNodes(matches, r, useSizeStore.getState().sizes));
  };

  const [dueOpen, setDueOpen] = useState(false);
  const [dueVal, setDueVal] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const spaceName = useStore((s) => s.spaces.find((x) => x.id === s.activeId)?.name ?? '');

  const selected = nodes.find((n) => n.id === selectedId) || null;

  const openDue = () => {
    if (!selected) return alert('先选一个节点');
    setDueVal(toDatetimeLocal(selected.due));
    setDueOpen(true);
  };

  const onImport = async (file: File) => {
    try {
      const raw = await readJsonFile(file);
      // P0:二次确认,不无条件覆盖(「不要丢数据」硬约束)
      if (!confirm('导入将覆盖当前整个作品库(所有分类),继续?')) return;
      replaceLibrary(raw);
    } catch (e) {
      alert((e as Error).message || '文件格式错误');
    }
  };

  return (
    <>
      <div id="bar">
        <span className="space-label" title="当前分类">
          {spaceName}
        </span>
        <div className="bar-search">
          <input
            value={searchQuery}
            placeholder="搜索节点"
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fitToMatches();
              else if (e.key === 'Escape') setSearchQuery('');
            }}
          />
          {searchQuery && (
            <button className="bs-clear" title="清除(Esc)" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
        <div className="sep" />
        {COLORS.map((c) => (
          <button
            key={c.i}
            className={'sw' + (selected && selected.c === c.i ? ' on' : '')}
            style={{ background: c.bg, borderColor: c.border }}
            title={c.hint}
            onClick={() => selectedId != null && setNodeColor(selectedId, c.i as ColorIndex)}
          />
        ))}
        <div className="sep" />
        <button
          className={placeMode ? 'on' : ''}
          title="点亮后点画布空白处新建节点(移动端友好)"
          onClick={() => setPlaceMode(!placeMode)}
        >
          ＋节点
        </button>
        <button onClick={openDue}>设时间</button>
        <div className="sep" />
        <button title="上传图片(可自动抠图变贴画)。也可直接 Ctrl/⌘+V 粘贴" onClick={() => imgRef.current?.click()}>
          贴图
        </button>
        <button
          className={autoCutout ? 'on' : ''}
          title="上传/粘贴后自动抠图变贴画(本地推理,图片不外传)"
          onClick={() => setAutoCutout(!autoCutout)}
        >
          自动抠图
        </button>
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              for (const f of files) void importImageAsSticker(f, { autoCutout: useStore.getState().ui.autoCutout });
            }
            e.target.value = '';
          }}
        />
        <div className="sep" />
        <button className={filterMode === 'time' ? 'on' : ''} onClick={() => setFilter(filterMode === 'time' ? null : 'time')}>
          时间轴
        </button>
        <button className={filterMode === 'recent' ? 'on' : ''} onClick={() => setFilter(filterMode === 'recent' ? null : 'recent')}>
          最近
        </button>
        <div className="sep" />
        <button
          onClick={() => {
            const r = document.getElementById('canvas')!.getBoundingClientRect();
            // 传入尺寸表让 fit 把节点自身宽高纳入 bounding box,更精确
            useStore.getState().fit(r, useSizeStore.getState().sizes);
          }}
          title="聚焦全部节点"
        >
          聚焦
        </button>
        <button onClick={() => exportJson(useStore.getState().snapshot())}>导出</button>
        <button onClick={() => fileRef.current?.click()}>导入</button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = '';
          }}
        />
      </div>

      {dueOpen && (
        <div id="dueset">
          <div style={{ marginBottom: 6, color: '#5f5e5a' }}>提醒时间</div>
          <input
            type="datetime-local"
            value={dueVal}
            onChange={(e) => setDueVal(e.target.value)}
          />
          <div className="btns">
            <button
              onClick={() => {
                if (selectedId != null) setNodeDue(selectedId, fromDatetimeLocal(dueVal));
                setDueOpen(false);
              }}
            >
              确定
            </button>
            <button
              onClick={() => {
                if (selectedId != null) setNodeDue(selectedId, null);
                setDueOpen(false);
              }}
            >
              清除
            </button>
            <button onClick={() => setDueOpen(false)}>取消</button>
          </div>
        </div>
      )}
    </>
  );
}
