/**
 * 应用根组件:装配画布 / 侧栏 / 工具栏,安装持久化副作用与全局键盘。
 */

import { useEffect } from 'react';
import { Canvas } from './ui/Canvas';
import { Sidebar } from './ui/Sidebar';
import { Toolbar } from './ui/Toolbar';
import { installPersistence } from './store/persist';
import { useStore } from './store/useStore';

export default function App() {
  const status = useStore((s) => s.ui.status);

  // 持久化 + 自动同步副作用(装一次)
  useEffect(() => installPersistence(), []);

  // 全局键盘:Delete/Backspace 删除选中节点(编辑中屏蔽 —— 不变量 2)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.isContentEditable) return;
      const st = useStore.getState();
      if ((e.key === 'Delete' || e.key === 'Backspace') && st.ui.selectedId != null) {
        e.preventDefault();
        st.deleteNode(st.ui.selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 相对时间会过期(「今天 14:30」到明天要变),定时轻量重绘。
  // 每分钟 bump 一次 status 触发时间标签刷新(粗暴但足够;性能优化见 P2)。
  useEffect(() => {
    const id = setInterval(() => {
      const st = useStore.getState();
      if (st.doc.nodes.some((n) => n.due)) {
        // 触发一次无害重渲染:重设同值 status 不会变,改用一个 tick
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
          双指捏合缩放 · 滚轮缩放 · 拖空白平移
        </div>
      </div>
    </div>
  );
}
