import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages 是子路径部署(/<repo>/),用相对 base 让资源路径不依赖仓库名;
  // 开发时用根路径。应用无客户端路由,相对 base 不会有副作用。
  base: mode === 'production' ? './' : '/',
  plugins: [react()],
  server: { host: true },
}));
