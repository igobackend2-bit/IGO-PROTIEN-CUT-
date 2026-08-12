import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { Search, Sparkles } from 'lucide-react';

interface ExploreSectionProps {
  onNavigate: (path: string) => void;
}

// Popular Searches tag cloud — deep-links into the real /search?q= route
// using actual product names from mockData.ts (not invented terms). This
// used to also carry a duplicate FAQ accordion, but that content already
// exists verbatim as the "Brand Story / SEO Trust Accordion" (infoBlocks)
// elsewhere on the homepage, so it was removed from here to avoid showing
// the same four questions twice on one page.
/** Editable from /admin → Sections → Popular searches. */
const POPULAR_FALLBACK = {
  heading: 'Popular right now',
  items: [
    { label: 'Chicken Curry Cut' },
    { label: 'Boneless Chicken Breast' },
    { label: 'Country Chicken' },
    { label: 'Goat Mutton Curry Cut' },
    { label: 'Tiger Prawns' },
    { label: 'Seer Fish Steak' },
    { label: 'Farm Fresh Eggs' },
    { label: 'Chicken Biryani Kit' },
    { label: 'Tandoori Chicken Tikka' },
    { label: 'Mutton Seekh Kebab' }
  ]
};

export const ExploreSection: React.FC<ExploreSectionProps> = ({ onNavigate }) => {
  const popularBlock = useSiteContent('sections.popular_searches', POPULAR_FALLBACK);
  const popularSearches = popularBlock.items.map((i) => i.label);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Trending Now</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#0A1F12] mb-4">Popular Searches</h3>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => onNavigate(`/search?q=${encodeURIComponent(term)}`)}
              className="group flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-700 text-xs font-bold px-3.5 py-2 rounded-full transition cursor-pointer"
            >
              <Search className="w-3 h-3 text-neutral-400 group-hover:text-emerald-500 shrink-0" />
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
