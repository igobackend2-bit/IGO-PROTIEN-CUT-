import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Tag, ShoppingBag, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Product, ProductWeightOption, ComboPack } from '../types';
import { SupabaseService } from '../lib/supabaseClient';
import { fetchComboPacks, ComboPackRow } from '../lib/api/catalog';
import { toWebsiteComboPack } from '../lib/adapters/productAdapter';
import { useLang, pick } from '../lib/language';
import { translateProductName } from '../lib/productNames';

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
      setComboToast(pick(lang, {
        en: "Sorry, this combo isn't available right now.",
        ta: 'மன்னிக்கவும், இந்த காம்போ இப்போது கிடைக்கவில்லை.',
        hi: 'क्षमा करें, यह कॉम्बो अभी उपलब्ध नहीं है।',
        ml: 'ക്ഷമിക്കണം, ഈ കോംബോ ഇപ്പോൾ ലഭ്യമല്ല.',
        te: 'క్షమించండి, ఈ కాంబో ప్రస్తుతం అందుబాటులో లేదు.',
        kn: 'ಕ್ಷಮಿಸಿ, ಈ ಕಾಂಬೊ ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ.',
      }));
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
            <Flame className="w-4 h-4 fill-white" /> {pick(lang, { en: 'FESTIVAL & GYM PROTEIN DROPS', ta: 'பண்டிகை & ஜிம் புரத டீல்கள்', hi: 'फेस्टिवल और जिम प्रोटीन डील्स', ml: 'ഫെസ്റ്റിവൽ & ജിം പ്രോട്ടീൻ ഡീലുകൾ', te: 'పండుగ & జిమ్ ప్రోటీన్ డీల్స్', kn: 'ಹಬ್ಬ & ಜಿಮ್ ಪ್ರೋಟೀನ್ ಡೀಲ್‌ಗಳು' })}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {pick(lang, { en: 'Exclusive Morning Fresh Meat & Seafood Deals', ta: 'பிரத்யேக காலை புதிய இறைச்சி & கடல் உணவு டீல்கள்', hi: 'एक्सक्लूसिव सुबह की ताज़ा मीट और सीफूड डील्स', ml: 'എക്‌സ്‌ക്ലൂസീവ് രാവിലെ ഫ്രഷ് മീറ്റ് & സീഫുഡ് ഡീലുകൾ', te: 'ప్రత్యేకమైన మార్నింగ్ ఫ్రెష్ మీట్ & సీఫుడ్ డీల్స్', kn: 'ವಿಶೇಷ ಬೆಳಗಿನ ಫ್ರೆಶ್ ಮೀಟ್ & ಸೀಫುಡ್ ಡೀಲ್‌ಗಳು' })}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {pick(lang, {
              en: 'Get up to 25% Off on premium antibiotic-free Chicken, wild seafood, goat mutton cuts, and 1-click combo packs. Delivered chilled at 0-4°C in 30-90 minutes.',
              ta: 'பிரீமியம் ஆன்டிபயாடிக் இல்லாத கோழி, காட்டு கடல் உணவு, ஆடு மட்டன் கட்ஸ் மற்றும் 1-கிளிக் காம்போ பாக்குகளில் 25% வரை தள்ளுபடி பெறுங்கள். 30-90 நிமிடங்களில் 0-4°C குளிர்ச்சியில் வழங்கப்படும்.',
              hi: 'प्रीमियम एंटीबायोटिक-फ्री चिकन, वाइल्ड सीफूड, बकरे के मटन कट्स और 1-क्लिक कॉम्बो पैक्स पर 25% तक की छूट पाएं। 30-90 मिनट में 0-4°C पर चिल्ड डिलीवर किया जाता है।',
              ml: 'പ്രീമിയം ആന്റിബയോട്ടിക്-ഫ്രീ ചിക്കൻ, വൈൽഡ് സീഫുഡ്, ആട്ടിറച്ചി കട്ടുകൾ, 1-ക്ലിക്ക് കോംബോ പാക്കുകൾ എന്നിവയിൽ 25% വരെ കിഴിവ് നേടൂ. 30-90 മിനിറ്റിനുള്ളിൽ 0-4°C ൽ ചില്ഡ് ആയി ഡെലിവർ ചെയ്യുന്നു.',
              te: 'ప్రీమియం యాంటీబయాటిక్-ఫ్రీ చికెన్, వైల్డ్ సీఫుడ్, మేక మటన్ కట్స్ మరియు 1-క్లిక్ కాంబో ప్యాక్‌లపై 25% వరకు తగ్గింపు పొందండి. 30-90 నిమిషాల్లో 0-4°C వద్ద చల్లగా డెలివర్ చేయబడుతుంది.',
              kn: 'ಪ್ರೀಮಿಯಂ ಆಂಟಿಬಯಾಟಿಕ್-ಫ್ರೀ ಚಿಕನ್, ವೈಲ್ಡ್ ಸೀಫುಡ್, ಮೇಕೆ ಮಟನ್ ಕಟ್‌ಗಳು ಮತ್ತು 1-ಕ್ಲಿಕ್ ಕಾಂಬೊ ಪ್ಯಾಕ್‌ಗಳ ಮೇಲೆ 25% ವರೆಗೆ ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ. 30-90 ನಿಮಿಷಗಳಲ್ಲಿ 0-4°C ನಲ್ಲಿ ತಂಪಾಗಿ ಡೆಲಿವರಿ ಮಾಡಲಾಗುತ್ತದೆ.',
            })}
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
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{pick(lang, { en: 'LIMITED TIME DROPS', ta: 'வரையறுக்கப்பட்ட நேர டீல்கள்', hi: 'सीमित समय की डील्स', ml: 'പരിമിത സമയ ഡീലുകൾ', te: 'పరిమిత సమయ డీల్స్', kn: 'ಸೀಮಿತ ಸಮಯದ ಡೀಲ್‌ಗಳು' })}</div>
              <h2 className="text-2xl font-black text-[#0A1F12] tracking-tight">{pick(lang, { en: 'Flash Sale — Ends Soon!', ta: 'ஃபிளாஷ் சேல் — விரைவில் முடிவடையும்!', hi: 'फ्लैश सेल — जल्द खत्म हो रही है!', ml: 'ഫ്ലാഷ് സെയിൽ — ഉടൻ അവസാനിക്കും!', te: 'ఫ్లాష్ సేల్ — త్వరలో ముగుస్తుంది!', kn: 'ಫ್ಲ್ಯಾಶ್ ಸೇಲ್ — ಶೀಘ್ರದಲ್ಲೇ ಮುಗಿಯುತ್ತದೆ!' })}</h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-neutral-500 font-bold uppercase">{pick(lang, { en: 'Ends in:', ta: 'முடிவடையும்:', hi: 'समाप्त होने में:', ml: 'അവസാനിക്കുന്നത്:', te: 'ముగియడానికి:', kn: 'ಮುಗಿಯಲು:' })}</span>
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
            <p className="text-sm font-bold text-[#0A1F12]">{pick(lang, { en: 'No flash deals live right now', ta: 'இப்போது நேரடி ஃபிளாஷ் டீல்கள் இல்லை', hi: 'अभी कोई फ्लैश डील लाइव नहीं है', ml: 'ഇപ്പോൾ ലൈവ് ഫ്ലാഷ് ഡീലുകൾ ഇല്ല', te: 'ప్రస్తుతం లైవ్ ఫ్లాష్ డీల్స్ లేవు', kn: 'ಪ್ರಸ್ತುತ ಲೈವ್ ಫ್ಲ್ಯಾಶ್ ಡೀಲ್‌ಗಳಿಲ್ಲ' })}</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {pick(lang, {
                en: "New drops go live every day — check back soon, or browse the full catalog for today's best prices.",
                ta: 'ஒவ்வொரு நாளும் புதிய டீல்கள் வருகின்றன — விரைவில் மீண்டும் பாருங்கள், அல்லது இன்றைய சிறந்த விலைகளுக்கு முழு பட்டியலையும் உலாவுங்கள்.',
                hi: 'हर दिन नई डील्स आती हैं — जल्द ही फिर से देखें, या आज की बेहतरीन कीमतों के लिए पूरा कैटलॉग ब्राउज़ करें।',
                ml: 'ഓരോ ദിവസവും പുതിയ ഡീലുകൾ വരുന്നു — ഉടൻ വീണ്ടും പരിശോധിക്കുക, അല്ലെങ്കിൽ ഇന്നത്തെ മികച്ച വിലകൾക്കായി മുഴുവൻ കാറ്റലോഗും ബ്രൗസ് ചെയ്യുക.',
                te: 'ప్రతిరోజూ కొత్త డీల్స్ వస్తాయి — త్వరలో మళ్ళీ చూడండి, లేదా నేటి ఉత్తమ ధరల కోసం పూర్తి కేటలాగ్‌ను బ్రౌజ్ చేయండి.',
                kn: 'ಪ್ರತಿದಿನ ಹೊಸ ಡೀಲ್‌ಗಳು ಬರುತ್ತವೆ — ಶೀಘ್ರದಲ್ಲೇ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ, ಅಥವಾ ಇಂದಿನ ಅತ್ಯುತ್ತಮ ಬೆಲೆಗಳಿಗಾಗಿ ಪೂರ್ಣ ಕ್ಯಾಟಲಾಗ್ ಬ್ರೌಸ್ ಮಾಡಿ.',
              })}
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
                <img src={p.image} alt={translateProductName(p.id, p.name, lang)} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {pick(lang, { en: `${p.discountPercentage}% OFF`, ta: `${p.discountPercentage}% தள்ளுபடி`, hi: `${p.discountPercentage}% छूट`, ml: `${p.discountPercentage}% കിഴിവ്`, te: `${p.discountPercentage}% తగ్గింపు`, kn: `${p.discountPercentage}% ರಿಯಾಯಿತಿ` })}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-[#0A1F12] text-sm group-hover:text-emerald-600 transition line-clamp-1">{translateProductName(p.id, p.name, lang)}</h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{p.shortDescription}</p>

                {/* Stock remaining bar. Only claims a specific unit count when
                    inventory is actually being tracked for this product — the
                    catalog currently runs with stock_quantity at 0, and
                    "Stock Left: 0 units" on a buyable product is both wrong
                    and off-putting. */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-semibold">
                    <span>
                      {p.stockQuantity > 0
                        ? pick(lang, {
                            en: `Stock Left: ${p.stockQuantity} units`,
                            ta: `மீதமுள்ள கையிருப்பு: ${p.stockQuantity} யூனிட்கள்`,
                            hi: `बचा हुआ स्टॉक: ${p.stockQuantity} यूनिट`,
                            ml: `ബാക്കിയുള്ള സ്റ്റോക്ക്: ${p.stockQuantity} യൂണിറ്റുകൾ`,
                            te: `మిగిలిన స్టాక్: ${p.stockQuantity} యూనిట్లు`,
                            kn: `ಉಳಿದ ಸ್ಟಾಕ್: ${p.stockQuantity} ಯೂನಿಟ್‌ಗಳು`,
                          })
                        : pick(lang, { en: 'In Stock', ta: 'கையிருப்பில் உள்ளது', hi: 'स्टॉक में है', ml: 'സ്റ്റോക്കിൽ ഉണ്ട്', te: 'స్టాక్‌లో ఉంది', kn: 'ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ' })}
                    </span>
                    <span className="text-emerald-700">{pick(lang, { en: 'Selling Fast', ta: 'வேகமாக விற்கிறது', hi: 'तेज़ी से बिक रहा है', ml: 'വേഗത്തിൽ വിറ്റുപോകുന്നു', te: 'వేగంగా అమ్ముడవుతోంది', kn: 'ವೇಗವಾಗಿ ಮಾರಾಟವಾಗುತ್ತಿದೆ' })}</span>
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
                  {pick(lang, { en: 'Claim Deal', ta: 'டீலைப் பெறுங்கள்', hi: 'डील पाएं', ml: 'ഡീൽ നേടൂ', te: 'డీల్ పొందండి', kn: 'ಡೀಲ್ ಪಡೆಯಿರಿ' })}
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
            <Sparkles className="w-4 h-4" /> {pick(lang, { en: 'BUNDLE & SAVE', ta: 'பண்டில் & சேமிக்கவும்', hi: 'बंडल करें और बचाएं', ml: 'ബണ്ടിൽ ചെയ്ത് ലാഭിക്കൂ', te: 'బండిల్ చేసి ఆదా చేయండి', kn: 'ಬಂಡಲ್ ಮಾಡಿ ಉಳಿಸಿ' })}
          </div>
          <h2 className="text-2xl font-black text-[#0A1F12] tracking-tight">{pick(lang, { en: 'Curated High-Protein Combo Packs', ta: 'தேர்ந்தெடுக்கப்பட்ட உயர் புரத காம்போ பாக்குகள்', hi: 'चुनिंदा हाई-प्रोटीन कॉम्बो पैक', ml: 'തിരഞ്ഞെടുത്ത ഹൈ-പ്രോട്ടീൻ കോംബോ പാക്കുകൾ', te: 'ఎంపిక చేసిన హై-ప్రోటీన్ కాంబో ప్యాక్‌లు', kn: 'ಆಯ್ದ ಹೈ-ಪ್ರೋಟೀನ್ ಕಾಂಬೋ ಪ್ಯಾಕ್‌ಗಳು' })}</h2>
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
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">{pick(lang, { en: 'Items Included in this Combo:', ta: 'இந்த காம்போவில் அடங்கியுள்ள பொருட்கள்:', hi: 'इस कॉम्बो में शामिल आइटम:', ml: 'ഈ കോംബോയിൽ ഉൾപ്പെടുന്ന ഇനങ്ങൾ:', te: 'ఈ కాంబోలో చేర్చిన అంశాలు:', kn: 'ಈ ಕಾಂಬೋದಲ್ಲಿ ಸೇರಿಸಲಾದ ವಸ್ತುಗಳು:' })}</div>
                {combo.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-neutral-600">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {translateProductName(it.productId, it.productName, lang)} ({it.weightLabel})
                    </span>
                    <span className="font-bold text-[#0A1F12]">x{it.qty}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddComboToCart(combo)}
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
              >
                <ShoppingBag className="w-4 h-4" /> {pick(lang, { en: 'Add Entire Combo To Cart', ta: 'முழு காம்போவையும் கார்ட்டில் சேர்க்கவும்', hi: 'पूरा कॉम्बो कार्ट में जोड़ें', ml: 'മുഴുവൻ കോംബോയും കാർട്ടിലേക്ക് ചേർക്കുക', te: 'మొత్తం కాంబోను కార్ట్‌కు జోడించండి', kn: 'ಸಂಪೂರ್ಣ ಕಾಂಬೋವನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' })}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
