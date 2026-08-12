import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle2, Briefcase, PartyPopper, Heart, Home as HomeIcon } from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { ProductCard } from '../components/ProductCard';
import { StoreService } from '../lib/storage';

interface GiftingPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate: (path: string) => void;
}

// Occasion tags mapped by product id — since our catalog doesn't have a
// dedicated "occasion" field, we curate the gift-worthy picks here rather
// than modifying the shared Product type just for this one page.
const OCCASION_TAGS: Record<string, string[]> = {
  'cmb-01': ['Family', 'Festival'],
  'cmb-02': ['Fitness', 'Housewarming'],
  'bef-img-06': ['Anniversary', 'Corporate'],
  'fsh-04': ['Anniversary', 'Housewarming']
};

const OCCASIONS = ['All', 'Family', 'Festival', 'Fitness', 'Housewarming', 'Anniversary', 'Corporate'];

export const GiftingPage: React.FC<GiftingPageProps> = ({ products, onSelectProduct, onAddToCart, onNavigate }) => {
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const giftableProducts = products.filter((p) => Object.keys(OCCASION_TAGS).includes(p.id));
  const filteredGifts =
    selectedOccasion === 'All'
      ? giftableProducts
      : giftableProducts.filter((p) => OCCASION_TAGS[p.id]?.includes(selectedOccasion));

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !message.trim()) return;
    StoreService.saveGiftNote({ recipientName, message });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-3 text-white shadow-lg shadow-emerald-950/20">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Gift className="w-4 h-4" /> IGO GIFTING
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Give the Gift of Fresh Protein</h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto">
          Curated meat &amp; seafood gift boxes for housewarmings, festivals, anniversaries, and corporate hampers — delivered fresh, with a personalized note.
        </p>
      </div>

      {/* Occasion Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {OCCASIONS.map((occ) => (
          <button
            key={occ}
            onClick={() => setSelectedOccasion(occ)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              selectedOccasion === occ
                ? 'bg-[#0F7B3A] border-[#0F7B3A] text-white shadow'
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400 hover:text-[#0A1F12]'
            }`}
          >
            {occ === 'Corporate' && <Briefcase className="w-3.5 h-3.5" />}
            {occ === 'Festival' && <PartyPopper className="w-3.5 h-3.5" />}
            {occ === 'Anniversary' && <Heart className="w-3.5 h-3.5" />}
            {occ === 'Housewarming' && <HomeIcon className="w-3.5 h-3.5" />}
            {occ}
          </button>
        ))}
      </div>

      {/* Gift Box Grid */}
      {filteredGifts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredGifts.map((p) => (
            <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-sm text-neutral-500">
          No gift picks tagged for this occasion yet — try "All".
        </div>
      )}

      {/* Corporate Gifting Callout */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
        <Briefcase className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-[#0A1F12]">Bulk Corporate Gifting?</div>
          <p className="text-xs text-neutral-600 mt-1">
            Sending gift boxes to employees or clients at scale? Our{' '}
            <button onClick={() => onNavigate('/b2b')} className="font-bold text-emerald-700 underline cursor-pointer">
              B2B / Bulk desk
            </button>{' '}
            handles custom quantities, labeling, and scheduled delivery.
          </p>
        </div>
      </div>

      {/* Personalized Gift Message */}
      <div className="max-w-xl mx-auto bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#0A1F12] mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" /> Add a Personalized Gift Note
        </h3>
        <p className="text-xs text-neutral-500 mb-5">
          Add a gift box to your cart above, then save a note here — we'll attach it to your order at checkout.
        </p>

        {noteSaved ? (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-[#0A1F12]">Gift note saved! It'll show up in your cart.</p>
          </div>
        ) : (
          <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Priya"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Gift Message *</label>
              <textarea
                required
                rows={3}
                placeholder="Wishing you a house full of good food and better memories!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              Save Gift Note
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
