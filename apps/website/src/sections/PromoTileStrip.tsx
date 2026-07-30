import React, { useRef } from 'react';
import { Truck, Sparkles, Flame, RefreshCw, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';

interface PromoTileStripProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

// Horizontally scrolling row of colored promo tiles — matches the
// "Free Delivery / Newly Added / Bestseller" tile-strip pattern seen on
// other meat-delivery sites. Every tile links to a real route and states a
// fact already established elsewhere on this site (free delivery threshold,
// the real NEW-badged category, the actual top bestseller by rating, and
// the real Subscribe & Save feature) — nothing invented for this strip.
export const PromoTileStrip: React.FC<PromoTileStripProps> = ({ products, onNavigate }) => {
  const topBestSeller = [...products].filter((p) => p.isBestSeller).sort((a, b) => b.reviewCount - a.reviewCount)[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -336 : 336, behavior: 'smooth' });
  };

  const tiles = [
    {
      badge: null,
      title: 'Free Delivery',
      subtitle: 'On all orders above ₹499',
      note: 'T&C Apply',
      cta: 'Shop Now',
      path: '/search',
      image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
      bg: 'bg-neutral-50 border border-neutral-200',
      text: 'text-[#08120B]',
      icon: Truck,
      iconColor: 'text-emerald-600'
    },
    {
      badge: 'NEWLY ADDED',
      title: 'Biryani Kits',
      subtitle: 'Everything pre-portioned, ready to cook',
      note: null,
      cta: 'Order Now',
      path: '/category/biryani',
      image: '/Images/banners/biryani-kit.jpg',
      bg: 'bg-[#0F7B3A]',
      text: 'text-white',
      icon: Sparkles,
      iconColor: 'text-white'
    },
    ...(topBestSeller
      ? [
          {
            badge: 'BESTSELLER',
            title: topBestSeller.name,
            subtitle: `${topBestSeller.reviewCount}+ reviews, ${topBestSeller.rating}★ rated`,
            note: null,
            cta: 'Order Now',
            path: `/category/${topBestSeller.category}`,
            image: topBestSeller.image,
            bg: 'bg-[#D4AF37]',
            text: 'text-[#08120B]',
            icon: Flame,
            iconColor: 'text-[#08120B]'
          }
        ]
      : []),
    {
      badge: null,
      title: 'Subscribe & Save',
      subtitle: 'Recurring orders, subscriber-only pricing',
      note: null,
      cta: 'Set Up Plan',
      path: '/subscriptions',
      // Was '/Images/eggs.png' — a transparent product cutout that was
      // effectively invisible against this light background. Swapped for a
      // real full-bleed photo so the tile actually shows an image.
      image: '/Images/banners/promo-subscriber-banner.jpg',
      bg: 'bg-emerald-50 border border-emerald-200',
      text: 'text-[#08120B]',
      icon: RefreshCw,
      iconColor: 'text-emerald-600'
    }
  ];

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
              {tile.note && <span className={`block text-[9px] opacity-50 ${tile.text}`}>{tile.note}</span>}
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
