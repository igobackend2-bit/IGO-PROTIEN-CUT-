import React, { useState, useEffect } from 'react';
import { Flame, Clock3, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang } from '../lib/language';

interface TodaysDealsBannerProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

// Genuine countdown to midnight (deals genuinely do refresh daily since
// isTodayFresh / flash-offer flags are date-driven) — not a fake arbitrary
// timer that resets meaninglessly on every page load. Every slide's photo,
// name, and discount % come straight from the live catalogue — nothing
// staged for this banner specifically.
// Restricted to core meat/seafood categories only: this is the site's hero
// "Today's Special" banner, so it should never surface a Healthy Add-on
// (e.g. cucumber) as a headline deal just because it happens to carry the
// highest discount percentage — that undermines the meat-delivery identity.
const CORE_MEAT_CATEGORIES: Product['category'][] = ['chicken', 'mutton', 'beef', 'fish'];

export const TodaysDealsBanner: React.FC<TodaysDealsBannerProps> = ({ products, onNavigate }) => {
  const { lang } = useLang();
  // Editable from /admin → Homepage → Flash Deals — heading.
  // The discount percentage stays computed from the live catalog — it must
  // never be typed, or it could advertise a discount that isn't real.
  const flashHeading = useSiteContent('home.rail_flash_deals', {
    eyebrow: "Today's Special",
    heading: "Today's Flash Meat Deals",
    ctaLabel: 'Shop All Deals',
    ctaPath: '/offers'
  });
  const flashHeadingTa = {
    eyebrow: 'இன்றைய சிறப்பு',
    heading: 'இன்றைய சிறப்பு தள்ளுபடி சலுகைகள்',
    ctaLabel: 'அனைத்து சலுகைகளையும் காண்க',
    ctaPath: '/offers'
  };
  const resolvedFlashHeading = lang === 'ta' ? flashHeadingTa : flashHeading;

  // Best discounted product per core category (deduped, so it's a genuine
  // spread across chicken/mutton/beef/fish rather than 4 chicken items just
  // because chicken happens to dominate the catalogue), highest discount
  // first — this is what turns the banner from one static deal into a
  // rotating carousel of today's actual best cuts.
  const dealsByCategory = CORE_MEAT_CATEGORIES.map((cat) =>
    [...products]
      .filter((p) => (p.discountPercentage || 0) > 0 && p.category === cat)
      .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))[0]
  ).filter((p): p is Product => Boolean(p));
  const deals = dealsByCategory.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));

  const [activeDeal, setActiveDeal] = useState(0);
  const [isDealPaused, setIsDealPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => getMsUntilMidnight());

  function getMsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getMsUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDealPaused || deals.length < 2) return;
    const timer = setInterval(() => {
      setActiveDeal((prev) => (prev + 1) % deals.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isDealPaused, deals.length]);

  if (deals.length === 0) return null;
  // Keep the active index valid if the deal list ever shrinks (e.g. a
  // category temporarily has no active discount).
  const safeActive = activeDeal % deals.length;
  const topDeal = deals[safeActive];
  const maxDiscount = topDeal.discountPercentage || 0;

  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl min-h-[280px] sm:min-h-[320px] flex items-center shadow-xl shadow-orange-950/20"
        onMouseEnter={() => setIsDealPaused(true)}
        onMouseLeave={() => setIsDealPaused(false)}
        onTouchStart={() => setIsDealPaused(true)}
        onTouchEnd={() => setIsDealPaused(false)}
      >
        {deals.map((deal, idx) => (
          <img
            key={deal.id}
            src={deal.image}
            alt={deal.name}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
              idx === safeActive ? 'opacity-100 animate-kenburns' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F12]/95 via-[#0A1F12]/80 to-[#E0632B]/50" />

        <div className="relative z-10 px-6 sm:pl-16 sm:pr-12 py-8 sm:py-10 w-full flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{resolvedFlashHeading.eyebrow}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tighter mb-3">
              {lang === 'ta' ? `${maxDiscount}% வரை தள்ளுபடி` : `Up to ${maxDiscount}% OFF`}
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-medium mb-6">
              {lang === 'ta'
                ? `${topDeal.name} மற்றும் இன்றைய சிறந்த கட்ஸில் — குறுகிய காலத்திற்கு மட்டும்.`
                : `On ${topDeal.name} and today's best cuts — limited time only.`}
            </p>
            <button
              onClick={() => onNavigate('/offers')}
              className="bg-white hover:bg-orange-50 text-[#0A1F12] font-black px-7 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
            >
              {resolvedFlashHeading.ctaLabel} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 bg-black/40 border border-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 shrink-0">
            <Clock3 className="w-5 h-5 text-white/80" />
            <div>
              <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-1">
                {lang === 'ta' ? 'சலுகை புதுப்பிக்கப்படும் நேரம்' : 'Deal Refreshes In'}
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-white text-2xl tracking-wider leading-none">
                <span>{pad(hours)}</span>:<span>{pad(minutes)}</span>:<span>{pad(seconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {deals.length > 1 && (
          <>
            {/* Arrow navigation */}
            <button
              onClick={() => setActiveDeal((prev) => (prev - 1 + deals.length) % deals.length)}
              aria-label="Previous deal"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm items-center justify-center text-white transition cursor-pointer z-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveDeal((prev) => (prev + 1) % deals.length)}
              aria-label="Next deal"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm items-center justify-center text-white transition cursor-pointer z-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dot pagination */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {deals.map((deal, idx) => (
                <button
                  key={deal.id}
                  onClick={() => setActiveDeal(idx)}
                  aria-label={`Show ${deal.name} deal`}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === safeActive ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
