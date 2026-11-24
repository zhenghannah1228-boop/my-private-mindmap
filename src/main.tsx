import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// 站酷快乐体(童趣手写风,OFL 开源;按 unicode-range 子集,按需下载)
import '@fontsource/zcool-kuaile/400.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
