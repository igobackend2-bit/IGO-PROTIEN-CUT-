import React, { useState } from 'react';
import { X } from 'lucide-react';

interface StickyOfferRibbonProps {
  onNavigate: (path: string) => void;
}

// Fixed left-edge discount ribbon — the vertical "GET 20% OFF" tag pattern
// seen on premium D2C meat sites (dartagnan.com and similar). Dismissible so
// it doesn't nag returning visitors once they've seen it, and only ever
// links to the real /offers page rather than promising a specific code.
export const StickyOfferRibbon: React.FC<StickyOfferRibbonProps> = ({ onNavigate }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    // Narrower footprint than before: the dismiss button used to be a
    // separate adjacent 20px-wide column, which pushed the ribbon's total
    // width past the horizontal margin outside the centered max-w-7xl page
    // container on common laptop widths (~1280-1366px) — that's what was
    // overlapping/cutting into the leftmost category circle images. The
    // dismiss control is now a small corner badge on the same tab instead,
    // so the whole thing takes roughly half the horizontal space.
    <div className="hidden md:block fixed left-0 top-1/2 -translate-y-1/2 z-40">
      <div className="relative">
        <button
          onClick={() => onNavigate('/offers')}
          className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider pl-2 pr-2.5 py-4 rounded-r-xl shadow-lg shadow-emerald-900/20 transition cursor-pointer flex items-center"
          style={{ writingMode: 'vertical-rl' }}
          title="View today's offers"
        >
          Get Up To 20% Off
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss offer ribbon"
          title="Dismiss"
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#08120B] border border-white/20 text-white/80 hover:text-white flex items-center justify-center shadow-sm cursor-pointer"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
