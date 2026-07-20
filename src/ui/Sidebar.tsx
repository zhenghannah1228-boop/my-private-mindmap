/**
 * 侧栏:闪念收集箱 + 云端同步。
 * - 收集箱:回车即存;拖拽条目到画布转节点。
 * - 同步:共享同步码模型(P2 待升级为 Auth)。pull 前做 updated_at 提示 + 二次确认。
 */

import { useState } from 'react';
import { formatTime, fromDatetimeLocal } from '../core/time';
import { pull, push } from '../sync/supabase';
import { useStore } from '../store/useStore';

export function Sidebar() {
  const inbox = useStore((s) => s.doc.inbox);
  const addInbox = useStore((s) => s.addInbox);
  const removeInbox = useStore((s) => s.removeInbox);
  const syncKey = useStore((s) => s.ui.syncKey);
  const syncMsg = useStore((s) => s.ui.syncMsg);
  const autoSync = useStore((s) => s.ui.autoSync);
  const setSyncKey = useStore((s) => s.setSyncKey);
  const setSyncMsg = useStore((s) => s.setSyncMsg);
  const setAutoSync = useStore((s) => s.setAutoSync);
  const replaceDoc = useStore((s) => s.replaceDoc);

  const [text, setText] = useState('');
  const [due, setDue] = useState('');

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    addInbox(v, fromDatetimeLocal(due));
    setText('');
    setDue('');
  };

  const doPush = async () => {
    if (!syncKey.trim()) return setSyncMsg('请先填同步码');
    setSyncMsg('上传中…');
    try {
      await push(syncKey.trim(), useStore.getState().doc);
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
      // 冲突护栏(P1 最低版):提示云端更新时间,让用户决定是否覆盖
      const when = formatTime(res.updatedAt);
      if (!confirm(`云端更新于 ${when}。下载会覆盖当前本地内容,继续?`)) {
        return setSyncMsg('已取消下载');
      }
      replaceDoc(res.doc);
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
      <div className="sh">闪念收集箱</div>
      <div id="quick">
        <div className="row">
          <input
            type="text"
            value={text}
            placeholder="随手记,回车即存"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
          <button onClick={submit}>+</button>
        </div>
        <input
          type="datetime-local"
          id="qd"
          title="可选:提醒时间"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
      </div>

      <div id="inbox">
        {inbox.map((it, i) => (
          <div
            className="ib"
            key={i}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
          >
            <div>{it.t}</div>
            <div className="meta">
              {formatTime(it.ct)}
              {it.due ? (
                <>
                  {' · '}
                  <span className="due">⏰ {formatTime(it.due)}</span>
                </>
              ) : null}
            </div>
            <span
              className="del"
              onClick={(e) => {
                e.stopPropagation();
                removeInbox(i);
              }}
            >
              ×
            </span>
          </div>
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
