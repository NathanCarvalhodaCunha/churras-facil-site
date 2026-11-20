import { Pause, Play } from 'lucide-react';
import { cx } from '../../lib/format';
import { useMotionPaused } from '../../lib/motionPause';

/**
 * Botão "Pausar animações" (rodapé e menu do celular). Para o que se move sozinho;
 * a rolagem, os menus e os botões continuam funcionando normalmente.
 */
export function MotionToggle({ className }: { className?: string }) {
  const [paused, setPaused] = useMotionPaused();
  return (
    <button
      type="button"
      onClick={() => setPaused(!paused)}
      className={cx(
        'inline-flex min-h-11 items-center gap-2 rounded-full text-left font-semibold transition-colors duration-200 hover:text-ember-400',
        className,
      )}
    >
      {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      {paused ? 'Retomar animações' : 'Pausar animações'}
    </button>
  );
}
