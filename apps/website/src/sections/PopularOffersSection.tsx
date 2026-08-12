import React, { useState } from 'react';
import { Tag, Copy, Check, ArrowRight } from 'lucide-react';
import { StoreService } from '../lib/storage';

interface PopularOffersSectionProps {
  onNavigate: (path: string) => void;
}

// Real, working coupon codes — pulled from the same INITIAL_COUPONS list
// that CartPage.tsx validates against at checkout, so "Copy Code" here
// genuinely works when pasted into the cart. Not decorative offer text.
export const PopularOffersSection: React.FC<PopularOffersSectionProps> = ({ onNavigate }) => {
  const coupons = StoreService.getCoupons();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (coupons.length === 0) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Save More</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">Popular Offers</h2>
        </div>
        <button
          onClick={() => onNavigate('/offers')}
          className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer shrink-0"
        >
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="relative bg-white border-2 border-dashed border-emerald-300 rounded-2xl p-5 flex flex-col items-center text-center gap-2 shadow-sm hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Use Code</span>
            <span className="text-xl font-black text-[#0F7B3A] font-mono tracking-wide">{coupon.code}</span>
            <p className="text-xs text-neutral-500 leading-snug">{coupon.description}</p>

            <button
              onClick={() => handleCopy(coupon.code)}
              className={`mt-2 w-full flex items-center justify-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer ${
                copiedCode === coupon.code
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white'
              }`}
            >
              {copiedCode === coupon.code ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
