import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource-variable/manrope';
import './index.css';
import { App } from './App';
import { preloadSkewer } from './three/support';

// o espeto 3D começa a baixar já, junto com o resto da página (fica pronto antes da primeira rolagem)
preloadSkewer();

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// No build o HTML já vem pré-renderizado (SEO e carregamento rápido): só hidrata.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
