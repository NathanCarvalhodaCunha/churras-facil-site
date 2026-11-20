import images from '../../data/images.json';

export type ImageKey = keyof typeof images;

interface PictureProps {
  image: ImageKey | string;
  /** texto alternativo; use "" para imagens decorativas */
  alt?: string;
  /** atributo sizes (largura exibida) */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** imagem acima da dobra: carregamento imediato e prioridade alta */
  priority?: boolean;
  /** object-position, ex.: "50% 30%" */
  position?: string;
  parallax?: boolean;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Imagem responsiva com AVIF + WebP gerados por `npm run images` */
export function Picture({ image, alt, sizes, className, imgClassName, priority, position, parallax }: PictureProps) {
  const data = (images as Record<string, { width: number; height: number; widths: number[]; color: string; alt: string }>)[image];
  if (!data) {
    if (import.meta.env.DEV) console.warn(`[Picture] imagem "${image}" não encontrada em src/data/images.json — rode npm run images`);
    return null;
  }
  const srcSet = (format: 'avif' | 'webp') => data.widths.map((w) => `${BASE}/images/${image}-${w}.${format} ${w}w`).join(', ');
  const fallback = data.widths[Math.min(1, data.widths.length - 1)];

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={`${BASE}/images/${image}-${fallback}.webp`}
        width={data.width}
        height={data.height}
        alt={alt ?? data.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={imgClassName}
        data-parallax={parallax ? '' : undefined}
        style={{ backgroundColor: data.color, objectPosition: position }}
      />
    </picture>
  );
}
