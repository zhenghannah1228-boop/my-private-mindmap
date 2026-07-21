/**
 * 思维导图模式:侧栏(作品库分类)+ 画布 + 工具栏。
 * 从 App 拆出,只在思维导图模式挂载(删除键/定时重绘等副作用随之只在本模式生效)。
 */

import { useEffect } from 'react';
import { Canvas } from './Canvas';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { useStore } from '../store/useStore';

export function MindMap() {
  const status = useStore((s) => s.ui.status);

  // 全局键盘:Delete/Backspace 删除选中节点(编辑中屏蔽 —— 不变量 2)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.isContentEditable) return;
      const st = useStore.getState();
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (st.ui.selectedStickerId != null) {
          e.preventDefault();
          st.deleteSticker(st.ui.selectedStickerId);
        } else if (st.ui.selectedId != null) {
          e.preventDefault();
          st.deleteNode(st.ui.selectedId);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 相对时间会过期,定时轻量重绘(仅在有 dueAt 的节点时)
  useEffect(() => {
    const id = setInterval(() => {
      const st = useStore.getState();
      if (st.doc.nodes.some((n) => n.due)) {
        useStore.setState({ view: { ...st.view } });
      }
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="app">
      <Sidebar />
      <div id="main">
        <Canvas />
        <Toolbar />
        <div id="status">{status}</div>
        <div id="hint">
          双击空白=新节点 · 拖端口/长按节点=连线 · Del=删除
          <br />
          双指捏合缩放 · 滚轮缩放 · 拖空白平移 · ⌘/Ctrl+V 或「贴图」加图片
        </div>
      </div>
    </div>
  );
}
