import React, { useState, useEffect } from 'react';

interface FadeImageProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
}

/** Brand mark, shown when a product has no usable photo. */
const FALLBACK_SRC = '/Images/protein-cuts-logo.jpg';

/**
 * Drop-in replacement for a plain <img> that shows a shimmering skeleton
 * until the photo loads, then cross-fades it in.
 *
 * It also handles failure. A product whose image is missing, or points at a
 * host that no longer resolves, previously rendered as a browser
 * broken-image icon with the alt text spilling across the card — which looks
 * far worse than no photo at all, and was especially bad on mobile where the
 * text wrapped over several lines. Now it falls back to the brand mark once,
 * and if even that fails, to a neutral tile.
 *
 * `key`-less src changes are handled explicitly: React reuses the same <img>
 * element when only the src prop changes, so the loaded/failed state has to
 * be reset in an effect or a previously-failed image would keep showing the
 * fallback after being given a valid src.
 */
export const FadeImage: React.FC<FadeImageProps> = ({
  src,
  alt,
  className,
  referrerPolicy = 'no-referrer'
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const hasSrc = typeof src === 'string' && src.trim().length > 0;
  const effectiveSrc = !hasSrc || failed ? FALLBACK_SRC : src;

  // Both the real photo and the fallback failed — render a plain tile rather
  // than an endless retry loop.
  if (failed && (!hasSrc || src === FALLBACK_SRC)) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-neutral-100">
        <span className="px-2 text-center text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          {alt || 'Image unavailable'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!loaded && <div className="absolute inset-0 skeleton-shimmer" />}
      <img
        src={effectiveSrc}
        alt={alt}
        referrerPolicy={referrerPolicy}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          // First failure swaps in the brand mark; a second failure (handled
          // above) drops to the neutral tile.
          setFailed(true);
          setLoaded(false);
        }}
        className={`${className || ''} transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
