import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { generateThemeCSS } from './utils/themeConfig';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <style dangerouslySetInnerHTML={{ __html: generateThemeCSS() }} />
    <App />
  </StrictMode>,
);
