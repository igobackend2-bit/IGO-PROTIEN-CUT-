import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';

const REPO_RAW = 'https://raw.githubusercontent.com/igobackend2-bit/IGO-PROTIEN-CUT-/main/static/images/Brands';

const brandIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Editable from /admin → Sections → Our Farm & Supply Partners. */
const FALLBACK = {
  eyebrow: 'Trusted Sourcing Network',
  heading: 'Our Farm & Supply Partners',
  subheading: 'Sourced directly from certified farms and hatcheries across the region.'
};

export const BrandPartnersSection: React.FC = () => {
  const block = useSiteContent('sections.partners', FALLBACK);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{block.eyebrow}</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight">{block.heading}</h2>
        <p className="text-xs text-neutral-600">{block.subheading}</p>
      </div>

      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2 opacity-80">
        {brandIds.map((id) => (
          <div
            key={id}
            className="shrink-0 w-28 h-16 rounded-xl bg-white border border-neutral-200 flex items-center justify-center p-3 hover:opacity-100 hover:border-emerald-400 transition shadow-sm"
          >
            <img
              src={`${REPO_RAW}/${id}.jpg`}
              alt={`Partner brand ${id}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
