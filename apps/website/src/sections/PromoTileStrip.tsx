import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang } from '../lib/language';

interface PromoTileStripProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

/**
 * Editable from /admin → Homepage → Promo tiles (4-up).
 * The array below is the fallback if the content block is missing — matches
 * 0011_content_sections.sql exactly, so nothing changes visually until an
 * admin edits it.
 */
const FALLBACK = {
  items: [
    { title: 'Free Delivery', subtitle: 'Above ₹499', cta: 'SHOP NOW', path: '/search', image: '/Images/banners/promo-free-delivery-banner.jpg', theme: 'light' },
    { title: 'Biryani Kits', subtitle: 'Everything included', cta: 'ORDER NOW', path: '/category/biryani', image: '/Images/banners/biryani-kit.jpg', theme: 'dark', badge: 'NEW' },
    { title: 'Weekly Fitness Protein Pass', subtitle: '12 deliveries', cta: 'VIEW PLAN', path: '/subscriptions', image: '/Images/banners/plan-fitness-banner.jpg', theme: 'dark' },
    { title: 'Subscribe & Save', subtitle: 'Up to 20% off', cta: 'GET STARTED', path: '/subscriptions', image: '/Images/banners/promo-subscriber-banner.jpg', theme: 'light' }
  ]
};

// Horizontally scrolling row of colored promo tiles — matches the
// "Free Delivery / Newly Added / Bestseller" tile-strip pattern seen on
// other meat-delivery sites. Content, images and links come from the CMS
// (sections.promo_tiles), editable in /admin without a code change.
const FALLBACK_TA = {
  items: [
    { title: 'இலவச டெலிவரி', subtitle: '₹499 க்கு மேல்', cta: 'இப்போது ஷாப் செய்யுங்கள்', path: '/search', image: '/Images/banners/promo-free-delivery-banner.jpg', theme: 'light' },
    { title: 'பிரியாணி கிட்ஸ்', subtitle: 'அனைத்தும் அடங்கும்', cta: 'இப்போது ஆர்டர் செய்யுங்கள்', path: '/category/biryani', image: '/Images/banners/biryani-kit.jpg', theme: 'dark', badge: 'புதியது' },
    { title: 'வாராந்திர ஃபிட்னஸ் புரோட்டீன் பாஸ்', subtitle: '12 டெலிவரிகள்', cta: 'திட்டத்தைக் காண்க', path: '/subscriptions', image: '/Images/banners/plan-fitness-banner.jpg', theme: 'dark' },
    { title: 'சந்தா செய்து சேமிக்கவும்', subtitle: '20% வரை தள்ளுபடி', cta: 'தொடங்குங்கள்', path: '/subscriptions', image: '/Images/banners/promo-subscriber-banner.jpg', theme: 'light' }
  ]
};

export const PromoTileStrip: React.FC<PromoTileStripProps> = ({ onNavigate }) => {
  const { lang } = useLang();
  const block = useSiteContent('sections.promo_tiles', FALLBACK);
  const resolvedBlock = lang === 'ta' ? FALLBACK_TA : block;
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -336 : 336, behavior: 'smooth' });
  };

  const tiles = resolvedBlock.items.map((item) => {
    const light = item.theme === 'light';
    return {
      badge: item.badge ?? null,
      title: item.title,
      subtitle: item.subtitle,
      cta: item.cta,
      path: item.path,
      image: item.image,
      bg: light ? 'bg-neutral-50 border border-neutral-200' : 'bg-[#0F7B3A]',
      text: light ? 'text-[#0A1F12]' : 'text-white'
    };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative group/tiles">
        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        >
        {tiles.map((tile) => (
          <button
            key={tile.title}
            onClick={() => onNavigate(tile.path)}
            className={`group snap-start relative shrink-0 w-72 sm:w-80 h-44 rounded-2xl overflow-hidden ${tile.bg} shadow-sm hover:shadow-lg transition cursor-pointer text-left flex items-center justify-between p-6`}
          >
            <div className="relative z-10 max-w-[64%] space-y-1.5">
              {tile.badge && (
                <span className="inline-block bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-1">
                  {tile.badge}
                </span>
              )}
              <h3 className={`font-black text-xl sm:text-2xl leading-[1.05] tracking-tight line-clamp-2 ${tile.text}`}>{tile.title}</h3>
              <p className={`text-xs leading-snug line-clamp-2 opacity-70 ${tile.text}`}>{tile.subtitle}</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide mt-2 ${tile.text} group-hover:gap-2 transition-all`}>
                {tile.cta} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full overflow-hidden translate-x-4 translate-y-4 opacity-90">
              <img src={tile.image} alt={tile.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
          </button>
        ))}
        </div>

        {/* Edge fade + arrow nav — signals there's more to scroll instead of
            the last tile just getting clipped by the viewport with no cue. */}
        <div className="hidden sm:block absolute top-0 bottom-1 right-0 w-14 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        <button
          onClick={() => scrollByAmount('left')}
          aria-label="Scroll left"
          className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/tiles:opacity-100 transition cursor-pointer z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scrollByAmount('right')}
          aria-label="Scroll right"
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/tiles:opacity-100 transition cursor-pointer z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
