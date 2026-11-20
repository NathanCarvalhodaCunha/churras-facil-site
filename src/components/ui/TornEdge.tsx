import { cx } from '../../lib/format';

/** Gera a borda de papel rasgado — determinística (mesmo resultado no servidor e no navegador) */
function tornPath(seed: number, width = 1440, height = 52): string {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let d = `M0 ${height} L0 ${(height * 0.6).toFixed(1)}`;
  let x = 0;
  while (x < width) {
    x = Math.min(width, x + 6 + rnd() * 18);
    const spike = rnd() < 0.12 ? -height * 0.22 : 0;
    const y = height * (0.32 + rnd() * 0.36) + spike;
    d += ` L${x.toFixed(1)} ${Math.max(1, y).toFixed(1)}`;
  }
  return `${d} L${width} ${height} Z`;
}

interface TornEdgeProps {
  /** cor de preenchimento (a cor da seção que "rasga" para cima) */
  color: string;
  /** cor da fibra clara logo acima do rasgo */
  fiber?: string;
  seed?: number;
  position?: 'top' | 'bottom';
  className?: string;
}

export function TornEdge({ color, fiber, seed = 7, position = 'top', className }: TornEdgeProps) {
  return (
    <svg
      className={cx('torn', position === 'top' ? 'torn--top' : 'torn--bottom', className)}
      viewBox="0 0 1440 52"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {fiber && <path d={tornPath(seed + 3)} fill={fiber} transform="translate(0 -3)" />}
      <path d={tornPath(seed)} fill={color} />
    </svg>
  );
}
