import { useEffect, useRef, useState, type RefObject } from 'react';
import { cx } from '../../lib/format';
import { loadSkewerScene, skewerMode } from '../../three/support';
import { isMotionPaused, onMotionPause } from '../../lib/motionPause';
import type { SkewerScene } from '../../three/SkewerScene';

export type StageStatus = 'idle' | 'ready' | 'fallback';

interface SkewerStageProps {
  /** progresso da rolagem do Hero (0 → 1), atualizado pelo ScrollTrigger */
  progressRef: RefObject<number>;
  /** área do layout onde o espeto aparece no início */
  anchorRef: RefObject<HTMLElement | null>;
  /** contêiner fixo do Hero — sua base é a divisa com a próxima seção */
  stickyRef: RefObject<HTMLElement | null>;
  onStatus?: (status: StageStatus) => void;
}

/**
 * Canvas do espeto 3D. O three.js começa a baixar logo no início do site (preloadSkewer, em entry-client)
 * e a cena é montada assim que o Hero fica pronto: o espeto aparece antes da primeira rolagem.
 * Ele gira e acompanha a rolagem mesmo com "movimento reduzido" ligado no sistema (Efeitos de animação
 * desligados no Windows), porque a loja quer o 3D funcionando em qualquer computador.
 * Quando o aparelho não aguenta (ver three/support.ts), aparece uma foto no lugar.
 */
export function SkewerStage({ progressRef, anchorRef, stickyRef, onStatus }: SkewerStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<StageStatus>('idle');
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    onStatusRef.current?.(status);
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mode = skewerMode();
    if (mode === 'photo') {
      setStatus('fallback');
      return;
    }

    let disposed = false;
    let scene: SkewerScene | null = null;
    let stopPauseSync: (() => void) | null = null;
    const showPhoto = () => {
      scene?.dispose();
      scene = null;
      if (!disposed) setStatus('fallback');
    };

    const measure = () => {
      const c = canvas.getBoundingClientRect();
      const a = anchorRef.current?.getBoundingClientRect();
      const s = stickyRef.current?.getBoundingClientRect();
      return {
        width: c.width,
        height: c.height,
        anchor: a && a.width > 0 ? { x: a.left - c.left, y: a.top - c.top, w: a.width, h: a.height } : null,
        boundary: s ? s.bottom - c.top : c.height,
      };
    };

    void (async () => {
      try {
        const { SkewerScene } = await loadSkewerScene();
        if (disposed) return;
        scene = new SkewerScene(canvas, {
          reducedMotion: false,
          software: mode === 'light',
          getProgress: () => progressRef.current ?? 0,
          measure,
          observe: [anchorRef.current, stickyRef.current].filter(Boolean) as Element[],
          onContextLost: () => !disposed && setStatus('fallback'),
          onTooSlow: showPhoto,
        });
        scene.setPaused(isMotionPaused());
        stopPauseSync = onMotionPause((paused) => scene?.setPaused(paused));
        await scene.init();
        if (disposed) return;
        setStatus('ready');
      } catch (error) {
        console.warn('[3D] usando imagem estática:', error);
        showPhoto();
      }
    })();

    return () => {
      disposed = true;
      stopPauseSync?.();
      scene?.dispose();
    };
  }, [anchorRef, progressRef, stickyRef]);

  return <canvas ref={canvasRef} className={cx('hero-canvas', status === 'ready' && 'is-ready')} aria-hidden="true" />;
}
