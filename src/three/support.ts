/**
 * Decide como o espeto 3D roda neste aparelho e começa a baixar o three.js o quanto antes.
 * Arquivo pequeno (vai no pacote principal); a cena em si fica no módulo SkewerScene, baixado à parte.
 *
 *  full  → placa de vídeo de verdade: 3D completo (qualidade proporcional ao aparelho)
 *  light → Windows sem aceleração de vídeo (driver bloqueado, "aceleração de hardware" desligada no navegador,
 *          área de trabalho remota): 3D em versão leve — a loja pediu o 3D funcionando em qualquer Windows
 *  photo → sem WebGL, economia de dados ligada, ou WebGL por software fora do Windows (celulares sem
 *          aceleração e servidores de teste como o PageSpeed, onde cada quadro trava a página): foto no lugar
 */
export type SkewerMode = 'full' | 'light' | 'photo';

let mode: SkewerMode | null = null;
let sceneModule: Promise<typeof import('./SkewerScene')> | null = null;

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

function isWindowsDesktop(): boolean {
  return /Windows/i.test(navigator.userAgent) && !window.matchMedia('(pointer: coarse)').matches;
}

/** cria um contexto WebGL2 de teste e o descarta em seguida */
function probe(attributes?: WebGLContextAttributes): string | null {
  const gl = document.createElement('canvas').getContext('webgl2', attributes);
  if (!gl) return null;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return renderer;
}

function detect(): SkewerMode {
  if (typeof window === 'undefined' || !('WebGL2RenderingContext' in window)) return 'photo';
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return 'photo';
  try {
    const renderer = probe({ failIfMajorPerformanceCaveat: true });
    if (renderer !== null && !SOFTWARE_RENDERER.test(renderer)) return 'full';
    if (!isWindowsDesktop()) return 'photo';
    // Windows sem aceleração: confirma que ao menos o WebGL por software abre
    return renderer !== null || probe() !== null ? 'light' : 'photo';
  } catch {
    return 'photo';
  }
}

export function skewerMode(): SkewerMode {
  if (mode === null) mode = detect();
  return mode;
}

export function loadSkewerScene() {
  sceneModule ??= import('./SkewerScene');
  return sceneModule;
}

/**
 * Chamado logo no início do site (entry-client), antes da hidratação: o three.js baixa junto com o
 * resto da página e o espeto fica pronto antes de a pessoa começar a rolar — principalmente no celular.
 */
export function preloadSkewer(): void {
  if (skewerMode() !== 'photo') loadSkewerScene().catch(() => undefined);
}
