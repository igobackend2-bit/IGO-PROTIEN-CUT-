import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import type { Product } from '../types';

interface ComboBannerProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

// Full-bleed promo banner carousel for real combo-pack products — matches
// the "Mutton Masterpiece"-style banner pattern seen on other meat-delivery
// sites (photo background, bold headline, angled discount price tag, order
// CTA). Prices, discounts, and photos are pulled straight from mockData.ts
// combo-pack entries, never invented.
export const ComboBanner: React.FC<ComboBannerProps> = ({ products, onSelectProduct }) => {
  const combos = products.filter((p) => p.category === 'combo-packs');
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (combos.length < 2) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % combos.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [combos.length]);

  if (combos.length === 0) return null;

  const combo = combos[active % combos.length];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl min-h-[260px] sm:min-h-[300px] shadow-xl shadow-black/20">
        <img
          key={combo.id}
          src={combo.image}
          alt={combo.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F12]/92 via-[#0A1F12]/70 to-[#0A1F12]/20" />

        <div className="relative z-10 h-full flex flex-col justify-center gap-4 p-8 py-10 pl-8 sm:pl-16 sm:pr-12 max-w-xl">
          <div className="inline-flex items-center gap-2 w-fit bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Combo Pack</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.05] tracking-tight">{combo.name}</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-md">{combo.shortDescription}</p>

          <div className="flex items-center gap-4 flex-wrap pt-1">
            {/* Discount price tag — same clean two-line style as the other banners */}
            {/* The strikethrough and "N% Off" only appear when a list price is
                actually set above the selling price. Without this guard every
                product rendered "₹649 ₹649 0% Off", because the canonical
                products table has no list-price column — see
                0013_product_list_price.sql. */}
            <div className="bg-[#E0632B] text-white font-black px-4 py-2.5 rounded-xl shadow-lg leading-none">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl">₹{combo.basePrice}</span>
                {combo.discountPercentage > 0 && (
                  <span className="text-xs text-white/70 line-through">₹{combo.originalPrice}</span>
                )}
              </div>
              {combo.discountPercentage > 0 && (
                <span className="block text-[9px] uppercase tracking-widest font-bold mt-1">
                  {combo.discountPercentage}% Off
                </span>
              )}
            </div>

            <button
              onClick={() => onSelectProduct(combo)}
              className="bg-white hover:bg-emerald-50 text-[#0A1F12] font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
            >
              Order Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {combos.length > 1 && (
          <>
            <button
              onClick={() => setActive((prev) => (prev - 1 + combos.length) % combos.length)}
              aria-label="Previous combo"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm items-center justify-center text-white transition cursor-pointer z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActive((prev) => (prev + 1) % combos.length)}
              aria-label="Next combo"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm items-center justify-center text-white transition cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {combos.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActive(idx)}
                  aria-label={`Show ${c.name}`}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
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
