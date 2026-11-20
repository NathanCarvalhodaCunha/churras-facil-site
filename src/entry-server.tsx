import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';

/** Usado no build para gerar o HTML estático (scripts/prerender.mjs) */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
