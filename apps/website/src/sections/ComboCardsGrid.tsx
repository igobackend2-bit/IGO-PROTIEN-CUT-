import React, { useState } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { StoreService } from '../lib/storage';
import type { Product } from '../types';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang, pick } from '../lib/language';

interface ComboCardsGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

// Combo product cards — real combo-pack products from mockData.ts, styled
// after the "BEST COMBO! / FEAST COMBO!" ribbon-tag card pattern seen on
// other meat-delivery sites, with a genuinely functional wishlist heart
// (StoreService.toggleWishlist, same as every other product card on this
// site) rather than a decorative icon.
export const ComboCardsGrid: React.FC<ComboCardsGridProps> = ({ products, onSelectProduct }) => {
  const { lang } = useLang();
  // Editable from /admin → Homepage → Combo Packs — heading.
  const comboHeading = useSiteContent('home.rail_combo_packs', {
    eyebrow: 'Bundle & Save',
    heading: 'Combo Packs',
    subheading: 'Curated bundles at a better price than buying each cut separately.',
    viewAllLabel: 'View All',
    viewAllPath: '/category/combo-packs'
  });
  const comboHeadingTa = {
    eyebrow: 'தொகுத்து சேமிக்கவும்',
    heading: 'காம்போ பேக்குகள்',
    subheading: 'ஒவ்வொரு கட்டையும் தனித்தனியாக வாங்குவதை விட சிறந்த விலையில் தேர்ந்தெடுக்கப்பட்ட தொகுப்புகள்.',
    viewAllLabel: 'அனைத்தையும் காண்க',
    viewAllPath: '/category/combo-packs'
  };
  const comboHeadingHi = {
    eyebrow: 'बंडल करें और बचाएं',
    heading: 'कॉम्बो पैक',
    subheading: 'हर कट अलग से खरीदने से बेहतर कीमत पर चुने हुए बंडल।',
    viewAllLabel: 'सभी देखें',
    viewAllPath: '/category/combo-packs'
  };
  const comboHeadingMl = {
    eyebrow: 'ബണ്ടിൽ ചെയ്ത് ലാഭിക്കൂ',
    heading: 'കോംബോ പായ്ക്കുകൾ',
    subheading: 'ഓരോ കട്ടും പ്രത്യേകം വാങ്ങുന്നതിനേക്കാൾ മികച്ച വിലയിൽ തിരഞ്ഞെടുത്ത ബണ്ടിലുകൾ.',
    viewAllLabel: 'എല്ലാം കാണുക',
    viewAllPath: '/category/combo-packs'
  };
  const comboHeadingTe = {
    eyebrow: 'బండిల్ చేసి ఆదా చేయండి',
    heading: 'కాంబో ప్యాక్‌లు',
    subheading: 'ప్రతి ముక్కను విడిగా కొనడం కంటే మంచి ధరలో ఎంపిక చేసిన బండిల్స్.',
    viewAllLabel: 'అన్నీ చూడండి',
    viewAllPath: '/category/combo-packs'
  };
  const resolvedComboHeading = lang === 'ta' ? comboHeadingTa : lang === 'hi' ? comboHeadingHi : lang === 'ml' ? comboHeadingMl : lang === 'te' ? comboHeadingTe : comboHeading;

  const combos = products.filter((p) => p.category === 'combo-packs');
  const [wishlist, setWishlist] = useState<string[]>(() => StoreService.getWishlist());

  if (combos.length === 0) return null;

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    StoreService.toggleWishlist(id);
    setWishlist(StoreService.getWishlist());
  };

  const ribbonTags = lang === 'ta'
    ? ['சிறந்த காம்போ!', 'விருந்து காம்போ!', 'மதிப்பு காம்போ!']
    : lang === 'hi'
    ? ['बेस्ट कॉम्बो!', 'फीस्ट कॉम्बो!', 'वैल्यू कॉम्बो!']
    : lang === 'ml'
    ? ['ബെസ്റ്റ് കോംബോ!', 'ഫീസ്റ്റ് കോംബോ!', 'വാല്യൂ കോംബോ!']
    : lang === 'te'
    ? ['బెస్ట్ కాంబో!', 'ఫీస్ట్ కాంబో!', 'వాల్యూ కాంబో!']
    : ['Best Combo!', 'Feast Combo!', 'Value Combo!'];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{resolvedComboHeading.eyebrow}</div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{resolvedComboHeading.heading}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {combos.map((combo, idx) => {
          const isWishlisted = wishlist.includes(combo.id);
          return (
            <div
              key={combo.id}
              onClick={() => onSelectProduct(combo)}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F7B3A] to-emerald-700 p-6 cursor-pointer shadow-md hover:shadow-xl transition min-h-[220px] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between relative z-10">
                <span className="bg-white text-[#0F7B3A] font-black text-sm uppercase tracking-tight px-3 py-1.5 rounded-xl shadow-sm -rotate-2">
                  {ribbonTags[idx % ribbonTags.length]}
                </span>
                <button
                  onClick={(e) => toggleWishlist(e, combo.id)}
                  className="p-2 rounded-full bg-white/90 backdrop-blur-md text-neutral-700 hover:text-emerald-600 transition shadow-sm shrink-0"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                </button>
              </div>

              <div className="absolute right-0 bottom-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white/30 translate-x-6 translate-y-6 group-hover:translate-x-4 group-hover:translate-y-4 transition duration-500">
                <img src={combo.image} alt={combo.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>

              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-white font-black text-base leading-tight mb-1">{combo.name}</h3>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-2">{combo.shortDescription}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white font-black text-lg">₹{combo.basePrice}</span>
                    {combo.discountPercentage > 0 && (
                      <span className="text-white/60 text-xs line-through">₹{combo.originalPrice}</span>
                    )}
                  </div>
                  {!!combo.discountPercentage && (
                    <span className="bg-[#D4AF37] text-[#0A1F12] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      {combo.discountPercentage}% {pick(lang, { en: 'Off', ta: 'தள்ளுபடி', hi: 'छूट', ml: 'കിഴിവ്', te: 'తగ్గింపు' })}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-white text-[10px] font-black uppercase tracking-wider mt-2 group-hover:gap-1.5 transition-all">
                  {pick(lang, { en: 'Order Now', ta: 'இப்போது ஆர்டர் செய்யுங்கள்', hi: 'अभी ऑर्डर करें', ml: 'ഇപ്പോൾ ഓർഡർ ചെയ്യുക', te: 'ఇప్పుడే ఆర్డర్ చేయండి' })} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
