import React from 'react';
import { Percent, ArrowRight, Zap } from 'lucide-react';
import type { Product } from '../types';

interface OfferStripProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

// Slim, full-width discount ribbon — matches the compact promo-strip pattern
// seen on other meat-delivery sites (bold color block, one clear offer, one
// CTA). The percentage shown is genuinely computed as the best live discount
// across the current catalogue, not a made-up number.
export const OfferStrip: React.FC<OfferStripProps> = ({ products, onNavigate }) => {
  const maxDiscount = products.reduce((max, p) => Math.max(max, p.discountPercentage || 0), 0);
  if (maxDiscount <= 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => onNavigate('/search')}
        className="w-full group flex items-center justify-between gap-4 bg-gradient-to-r from-[#123A5C] to-[#1D6FB0] rounded-2xl px-5 sm:px-7 py-4 cursor-pointer transition hover:shadow-lg hover:shadow-blue-950/20"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Percent className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0 text-left">
            <div className="text-white font-black text-sm sm:text-base leading-tight flex items-center gap-1.5 flex-wrap">
              Up to {maxDiscount}% Off <span className="hidden sm:inline text-white/70 font-bold text-xs">on today's best fresh cuts</span>
              <Zap className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
            </div>
            <p className="text-white/60 text-[11px] sm:hidden">On today's best fresh cuts</p>
          </div>
        </div>

        <span className="shrink-0 flex items-center gap-1.5 bg-white text-[#123A5C] font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl group-hover:bg-blue-50 transition">
          Shop Now <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </button>
    </section>
  );
};
