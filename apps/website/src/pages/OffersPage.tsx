import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Tag, ShoppingBag, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Product, ProductWeightOption, ComboPack } from '../types';
import { SupabaseService } from '../lib/supabaseClient';
import { fetchComboPacks, ComboPackRow } from '../lib/api/catalog';
import { toWebsiteComboPack } from '../lib/adapters/productAdapter';
import { useLang } from '../lib/language';

interface OffersPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate: (path: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigate
}) => {
  const { lang } = useLang();
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 42 });
  // Starts from the old hardcoded mock (SupabaseService.getComboPacks(),
  // despite its name, never actually queried Supabase) so something renders
  // immediately, then gets replaced with real combo_packs/combo_pack_items
  // rows adapted against the live catalog. Previously this page never fetched
  // real combos at all, so "Add Entire Combo To Cart" pointed at mock product
  // ids that don't exist in the live, Supabase-backed catalog and silently
  // added nothing.
  const [combos, setCombos] = useState<ComboPack[]>(() => SupabaseService.getComboPacks());
  const [comboRows, setComboRows] = useState<ComboPackRow[] | null>(null);
  const [comboToast, setComboToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchComboPacks()
      .then((rows) => {
        if (!cancelled) setComboRows(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-adapt whenever the live catalog updates too (hydrateCatalog() in
  // App.tsx upgrades `products` from the initial cached copy shortly after
  // first paint), so a combo item isn't stuck unresolved just because this
  // ran before the real catalog arrived.
  useEffect(() => {
    if (!comboRows || products.length === 0) return;
    const adapted = comboRows
      .filter((row) => row.active)
      .map((row) => toWebsiteComboPack(row, products))
      .filter((c): c is ComboPack => c !== null);
    setCombos(adapted);
  }, [comboRows, products]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Previously any product flagged isFlashOffer showed up here even when its
  // catalog data had no real markdown (originalPrice === basePrice,
  // discountPercentage 0) — customers saw a "0% OFF" badge and identical
  // "was"/"now" prices, which reads as broken rather than as a deal. Now a
  // product only appears here if there's an actual price cut to show.
  const flashSaleProducts = products.filter(
    (p) => (p.isFlashOffer || p.discountPercentage >= 14) && p.originalPrice > p.basePrice
  );

  const handleAddComboToCart = (combo: ComboPack) => {
    let addedCount = 0;
    combo.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        onAddToCart(p, p.weightOptions[0], item.qty);
        addedCount += 1;
      }
    });
    // Defensive: toWebsiteComboPack() already resolves every item against
    // this same `products` list, so this should never fire — but if the
    // catalog changes between render and click (a product goes out of the
    // catalog entirely), surface that instead of silently adding nothing.
    if (addedCount === 0) {
      setComboToast(lang === 'ta' ? 'மன்னிக்கவும், இந்த காம்போ இப்போது கிடைக்கவில்லை.' : "Sorry, this combo isn't available right now.");
      setTimeout(() => setComboToast(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {comboToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0A1F12] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg">
          {comboToast}
        </div>
      )}
      {/* Top Banner Header */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-950/20">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#0F7B3A] text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-white" /> {lang === 'ta' ? 'பண்டிகை & ஜிம் புரத டீல்கள்' : 'FESTIVAL & GYM PROTEIN DROPS'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {lang === 'ta' ? 'பிரத்யேக காலை புதிய இறைச்சி & கடல் உணவு டீல்கள்' : 'Exclusive Morning Fresh Meat & Seafood Deals'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {lang === 'ta'
              ? 'பிரீமியம் ஆன்டிபயாடிக் இல்லாத கோழி, காட்டு கடல் உணவு, ஆடு மட்டன் கட்ஸ் மற்றும் 1-கிளிக் காம்போ பாக்குகளில் 25% வரை தள்ளுபடி பெறுங்கள். 30-90 நிமிடங்களில் 0-4°C குளிர்ச்சியில் வழங்கப்படும்.'
              : 'Get up to 25% Off on premium antibiotic-free Chicken, wild seafood, goat mutton cuts, and 1-click combo packs. Delivered chilled at 0-4°C in 30-90 minutes.'}
          </p>
        </div>
      </div>

      {/* Live Flash Sale Section with Countdown */}
      <section className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F7B3A] flex items-center justify-center text-white font-black animate-pulse shadow-lg">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{lang === 'ta' ? 'வரையறுக்கப்பட்ட நேர டீல்கள்' : 'LIMITED TIME DROPS'}</div>
              <h2 className="text-2xl font-black text-[#0A1F12] tracking-tight">{lang === 'ta' ? 'ஃபிளாஷ் சேல் — விரைவில் முடிவடையும்!' : 'Flash Sale — Ends Soon!'}</h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-neutral-500 font-bold uppercase">{lang === 'ta' ? 'முடிவடையும்:' : 'Ends in:'}</span>
            <div className="font-mono font-black text-[#0A1F12] text-sm flex items-center gap-1">
              <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">{String(timeLeft.hours).padStart(2, '0')}h</span>:
              <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">{String(timeLeft.minutes).padStart(2, '0')}m</span>:
              <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Flash Products Grid. Previously this rendered nothing at all when
            no product currently qualified (no real markdown set by the
            admin) — a blank white section under a "Flash Sale — Ends Soon!"
            header with a live countdown reads as broken, not as "no deals
            right now". Show an honest empty state instead. */}
        {flashSaleProducts.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Flame className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-sm font-bold text-[#0A1F12]">{lang === 'ta' ? 'இப்போது நேரடி ஃபிளாஷ் டீல்கள் இல்லை' : 'No flash deals live right now'}</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {lang === 'ta'
                ? 'ஒவ்வொரு நாளும் புதிய டீல்கள் வருகின்றன — விரைவில் மீண்டும் பாருங்கள், அல்லது இன்றைய சிறந்த விலைகளுக்கு முழு பட்டியலையும் உலாவுங்கள்.'
                : "New drops go live every day — check back soon, or browse the full catalog for today's best prices."}
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSaleProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl p-4 flex flex-col justify-between space-y-4 cursor-pointer transition group shadow-sm hover:shadow-xl"
            >
              <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-neutral-100">
                <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {lang === 'ta' ? `${p.discountPercentage}% தள்ளுபடி` : `${p.discountPercentage}% OFF`}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-[#0A1F12] text-sm group-hover:text-emerald-600 transition line-clamp-1">{p.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{p.shortDescription}</p>

                {/* Stock remaining bar. Only claims a specific unit count when
                    inventory is actually being tracked for this product — the
                    catalog currently runs with stock_quantity at 0, and
                    "Stock Left: 0 units" on a buyable product is both wrong
                    and off-putting. */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-semibold">
                    <span>
                      {lang === 'ta'
                        ? p.stockQuantity > 0 ? `மீதமுள்ள கையிருப்பு: ${p.stockQuantity} யூனிட்கள்` : 'கையிருப்பில் உள்ளது'
                        : p.stockQuantity > 0 ? `Stock Left: ${p.stockQuantity} units` : 'In Stock'}
                    </span>
                    <span className="text-emerald-700">{lang === 'ta' ? 'வேகமாக விற்கிறது' : 'Selling Fast'}</span>
                  </div>
                  <div className="w-full bg-emerald-50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full w-3/4 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <div className="text-base font-black text-[#0A1F12]">₹{p.basePrice}</div>
                  <div className="text-[10px] text-neutral-400 line-through">₹{p.originalPrice}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(p, p.weightOptions[0], 1);
                  }}
                  className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase"
                >
                  {lang === 'ta' ? 'டீலைப் பெறுங்கள்' : 'Claim Deal'}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* 1-Click Combo Packs Section */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> {lang === 'ta' ? 'பண்டில் & சேமிக்கவும்' : 'BUNDLE & SAVE'}
          </div>
          <h2 className="text-2xl font-black text-[#0A1F12] tracking-tight">{lang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட உயர் புரத காம்போ பாக்குகள்' : 'Curated High-Protein Combo Packs'}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="bg-white border border-neutral-200 hover:border-emerald-400 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition shadow-sm hover:shadow-xl relative"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="bg-[#0F7B3A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {combo.badge}
                  </span>
                  <h3 className="text-xl font-bold text-[#0A1F12] mt-2">{combo.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{combo.tagline}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-emerald-700">₹{combo.comboPrice}</div>
                  <div className="text-xs text-neutral-400 line-through">₹{combo.originalPrice}</div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-1">{combo.savings}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">{lang === 'ta' ? 'இந்த காம்போவில் அடங்கியுள்ள பொருட்கள்:' : 'Items Included in this Combo:'}</div>
                {combo.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-neutral-600">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {it.productName} ({it.weightLabel})
                    </span>
                    <span className="font-bold text-[#0A1F12]">x{it.qty}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddComboToCart(combo)}
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
              >
                <ShoppingBag className="w-4 h-4" /> {lang === 'ta' ? 'முழு காம்போவையும் கார்ட்டில் சேர்க்கவும்' : 'Add Entire Combo To Cart'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
