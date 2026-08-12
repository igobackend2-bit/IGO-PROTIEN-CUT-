import React, { useState } from 'react';
import { Snowflake, Fish, Flame, BookOpen, X, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang } from '../lib/language';

export interface Guide {
  title: string;
  excerpt: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  paragraphs: string[];
}

// Real, genuinely useful short guides (general food-safety and cooking
// knowledge — e.g. USDA's 74°C/165°F safe chicken temperature — not brand
// claims), presented as clickable cards in the TenderCuts "guide article"
// style. Clicking a card opens the full guide in a modal rather than
// linking to a blog that doesn't exist on this site.
export const guides: Guide[] = [
  {
    title: 'How to Store Fresh Cuts at Home',
    excerpt: "Just because it's delivered fresh doesn't mean it stays that way — here's how to store your cuts to lock in freshness.",
    icon: Snowflake,
    image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    paragraphs: [
      "Refrigerate immediately: Move your delivery straight into the fridge (0-4°C) or freezer within 20 minutes of arrival — don't let it sit at room temperature.",
      "Use within 24-48 hours: Fresh, never-frozen cuts taste best used within 1-2 days. If you won't cook it that soon, freeze it.",
      'Freeze it right: Wrap tightly in an airtight bag or container, pressing out excess air, and label with the date. Most cuts stay good frozen for 1-3 months without quality loss.',
      "Thaw safely: Always thaw in the fridge overnight, not on the counter — this keeps bacteria growth in check.",
      "Keep raw and cooked separate: Store raw meat on the lowest fridge shelf so juices can't drip onto other food, and use separate cutting boards."
    ]
  },
  {
    title: 'The Ultimate Dry Fish Buying Guide',
    excerpt: 'Karuvadu (sun-dried fish) is a pantry staple across South India — here\'s what actually separates good dry fish from bad.',
    icon: Fish,
    image: '/Images/Meat Images/Fish/Anchovy.jpg',
    paragraphs: [
      "Look, don't just smell: Good dry fish should look firm and slightly glossy, not chalky or overly dark. A strong, briny smell is normal; a sour or ammonia-like smell means it's turned.",
      'Check the salt: Traditional sun-drying uses salt as a natural preservative — a light white crust is fine, but excessive salt build-up usually means poor drying conditions.',
      'Pick your variety by dish: Anchovies (nethili) and small prawns work well in quick stir-fries and chutneys; larger dried fish like shark or seer strips are better slow-cooked in curries.',
      'Store it right: Keep dry fish in an airtight container in a cool, dry place — refrigerate for longer shelf life, especially in humid weather.',
      'Soak before cooking: A 10-15 minute soak in warm water softens the fish and washes off excess surface salt before you cook.'
    ]
  },
  {
    title: 'Marinated Chicken: Cooking Tips for Perfect Results',
    excerpt: "Marinated and ready to cook doesn't mean foolproof — a few small habits make the difference between rubbery and restaurant-quality.",
    icon: Flame,
    image: '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    paragraphs: [
      "Bring it to room temperature first: Let marinated chicken sit out for 15-20 minutes before cooking so it cooks evenly instead of staying cold in the center.",
      "Don't overcrowd the pan: Cook in batches if needed — overcrowding traps steam and stops the marinade from caramelizing properly.",
      'Match heat to the cut: Boneless pieces cook fast on high heat (great for a char); bone-in pieces need medium heat and longer time so the inside cooks through without burning the outside.',
      'Check doneness properly: Chicken is safely cooked at an internal temperature of 74°C (165°F) — a meat thermometer is more reliable than cutting it open and guessing.',
      'Rest before serving: Let cooked chicken rest for 3-5 minutes off the heat so the juices redistribute instead of running out onto the plate.'
    ]
  }
];

// The admin's `plans.guides` block edits title/excerpt/image/category/
// readTime — it has no notion of an icon or the full step-by-step
// `paragraphs` shown in the modal, since those aren't part of the generic
// content-editor schema (see supabase/migrations/0012_pages_and_seo.sql).
// So the CMS only drives the card grid; the modal's icon/paragraphs are
// looked up locally by id, matching the original `guide-01`/02/03 ids seeded
// alongside it. A guide an admin adds beyond the original three still
// renders — with a generic icon and its excerpt as the modal body.
interface CmsGuideItem {
  id?: string;
  title: string;
  excerpt: string;
  image: string;
  readTime?: string;
  category?: string;
}

const GUIDES_FALLBACK: { eyebrow: string; heading: string; items: CmsGuideItem[] } = {
  eyebrow: 'Kitchen Guides',
  heading: 'Cook It Right',
  items: guides.map((g, i) => ({
    id: `guide-0${i + 1}`,
    title: g.title,
    excerpt: g.excerpt,
    image: g.image
  }))
};

const GUIDE_DETAILS_BY_ID: Record<string, Guide> = Object.fromEntries(
  guides.map((g, i) => [`guide-0${i + 1}`, g])
);

// Tamil versions of the same 3 guides, same ids/order/images so the modal
// lookup by id still works. Selected at render time via `lang`, same pattern
// as the rest of this translation pass.
export const guidesTa: Guide[] = [
  {
    title: 'வீட்டில் புதிய கட்ஸை எப்படி சேமிப்பது',
    excerpt: 'புதிதாக டெலிவரி செய்யப்பட்டது என்பதால் அது எப்போதும் அப்படியே இருக்கும் என்று அர்த்தமல்ல — உங்கள் கட்ஸின் புத்துணர்ச்சியை பாதுகாக்க இதோ வழிமுறைகள்.',
    icon: Snowflake,
    image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    paragraphs: [
      'உடனடியாக குளிர்சாதனப்பெட்டியில் வையுங்கள்: வந்த 20 நிமிடங்களுக்குள் உங்கள் டெலிவரியை நேரடியாக ஃபிரிட்ஜில் (0-4°C) அல்லது ஃப்ரீசரில் வையுங்கள் — அறை வெப்பநிலையில் வைக்க வேண்டாம்.',
      '24-48 மணி நேரத்திற்குள் பயன்படுத்துங்கள்: புதிய, ஒருபோதும் உறையாத கட்ஸ் 1-2 நாட்களுக்குள் பயன்படுத்தினால் சிறந்த சுவை தரும். அவ்வளவு விரைவில் சமைக்க முடியாவிட்டால், அதை உறைய வையுங்கள்.',
      'சரியாக உறைய வையுங்கள்: காற்றுப்புகா பையில் அல்லது கொள்கலனில் இறுக்கமாக சுற்றி, அதிக காற்றை அழுத்தி வெளியேற்றி, தேதியுடன் லேபிள் செய்யுங்கள். பெரும்பாலான கட்ஸ் தரம் இழக்காமல் 1-3 மாதங்கள் உறைந்த நிலையில் நன்றாக இருக்கும்.',
      'பாதுகாப்பாக உருகவையுங்கள்: எப்போதும் ஃபிரிட்ஜில் இரவு முழுவதும் உருகவையுங்கள், மேசையில் அல்ல — இது கிருமி வளர்ச்சியை கட்டுப்படுத்தும்.',
      'பச்சை மற்றும் சமைத்ததை தனியாக வையுங்கள்: பச்சை இறைச்சியை ஃபிரிட்ஜின் கீழ் அடுக்கில் வையுங்கள், இதனால் சாறு மற்ற உணவில் சொட்டாது, தனித்தனி வெட்டும் பலகைகளைப் பயன்படுத்துங்கள்.'
    ]
  },
  {
    title: 'கருவாடு வாங்குவதற்கான முழுமையான வழிகாட்டி',
    excerpt: 'கருவாடு (வெயிலில் உலர்த்திய மீன்) தென்னிந்தியா முழுவதும் சமையலறையின் அத்தியாவசியப் பொருள் — நல்ல கருவாட்டையும் மோசமான கருவாட்டையும் பிரிப்பது என்ன என்பது இதோ.',
    icon: Fish,
    image: '/Images/Meat Images/Fish/Anchovy.jpg',
    paragraphs: [
      'பாருங்கள், வாசனை மட்டும் பார்க்க வேண்டாம்: நல்ல கருவாடு உறுதியாகவும் சற்று பளபளப்பாகவும் இருக்க வேண்டும், சுண்ணாம்பு போலவோ அதிக கருமையாகவோ இருக்கக்கூடாது. கடுமையான உப்பு வாசனை இயல்பானது; புளிப்பு அல்லது அம்மோனியா போன்ற வாசனை என்றால் அது கெட்டுவிட்டது என்று அர்த்தம்.',
      'உப்பைச் சரிபார்க்கவும்: பாரம்பரிய வெயிலில் உலர்த்துதல் உப்பை இயற்கை பாதுகாப்பாகப் பயன்படுத்துகிறது — லேசான வெள்ளை படை பரவாயில்லை, ஆனால் அதிக உப்பு படிவு பொதுவாக மோசமான உலர்த்தும் நிலைமைகளைக் குறிக்கும்.',
      'உணவுக்கு ஏற்ப வகையைத் தேர்ந்தெடுக்கவும்: நெத்திலி மற்றும் சிறிய இறால் விரைவான வறுவல் மற்றும் சட்னிகளுக்கு நன்றாக இருக்கும்; சுறா அல்லது வஞ்சிரம் போன்ற பெரிய கருவாடு குழம்புகளில் மெதுவாக சமைப்பதற்கு சிறந்தது.',
      'சரியாக சேமிக்கவும்: கருவாட்டை குளிர்ந்த, உலர்ந்த இடத்தில் காற்றுப்புகா கொள்கலனில் வையுங்கள் — ஈரப்பதமான காலநிலையில் நீண்ட நாள் உபயோகத்திற்கு ஃபிரிட்ஜில் வையுங்கள்.',
      'சமைப்பதற்கு முன் ஊற வையுங்கள்: 10-15 நிமிடங்கள் வெதுவெதுப்பான நீரில் ஊற வைப்பது மீனை மென்மையாக்கி, சமைப்பதற்கு முன் மேற்பரப்பு உப்பை கழுவும்.'
    ]
  },
  {
    title: 'மசாலா தடவப்பட்ட கோழி: சிறந்த முடிவுகளுக்கான சமையல் குறிப்புகள்',
    excerpt: 'மசாலா தடவப்பட்டு சமைக்க தயாராக இருப்பது என்பது தவறு நடக்காது என்று அர்த்தமல்ல — சில சிறிய பழக்கங்கள்தான் ரப்பர் போன்ற சுவைக்கும் ரெஸ்டாரன்ட் தரத்திற்கும் இடையே உள்ள வித்தியாசத்தை உருவாக்கும்.',
    icon: Flame,
    image: '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    paragraphs: [
      'முதலில் அறை வெப்பநிலைக்கு கொண்டு வாருங்கள்: மசாலா தடவப்பட்ட கோழியை சமைப்பதற்கு முன் 15-20 நிமிடங்கள் வெளியே வைக்கவும், இதனால் நடுவில் குளிர்ச்சியாக இல்லாமல் சமமாக சமையும்.',
      'பாத்திரத்தில் அதிகமாக நிரப்ப வேண்டாம்: தேவைப்பட்டால் தொகுதிகளாக சமைக்கவும் — அதிகமாக நிரப்புவது நீராவியை சிக்க வைத்து மசாலா சரியாக காரமெலைஸ் ஆவதை தடுக்கும்.',
      'கட்டுக்கு ஏற்ப வெப்பத்தை பொருத்தவும்: எலும்பில்லா துண்டுகள் அதிக வெப்பத்தில் விரைவாக சமையும் (சிறப்பாக வறுக்க); எலும்புடன் கூடிய துண்டுகளுக்கு நடுத்தர வெப்பமும் அதிக நேரமும் தேவை, இதனால் வெளியே கருகாமல் உள்ளே முழுமையாக சமையும்.',
      'சரியாக சமைந்ததா என்று சரிபார்க்கவும்: கோழி 74°C (165°F) உள் வெப்பநிலையில் பாதுகாப்பாக சமைகிறது — வெட்டிப் பார்த்து யூகிப்பதை விட இறைச்சி தெர்மாமீட்டர் நம்பகமானது.',
      'பரிமாறும் முன் ஓய்வு கொடுங்கள்: சமைத்த கோழியை வெப்பத்திலிருந்து எடுத்து 3-5 நிமிடங்கள் ஓய்வு கொடுங்கள், இதனால் சாறு தட்டில் ஓடாமல் மீண்டும் பரவும்.'
    ]
  }
];

const GUIDES_FALLBACK_TA: { eyebrow: string; heading: string; items: CmsGuideItem[] } = {
  eyebrow: 'சமையலறை வழிகாட்டிகள்',
  heading: 'சரியாக சமையுங்கள்',
  items: guidesTa.map((g, i) => ({
    id: `guide-0${i + 1}`,
    title: g.title,
    excerpt: g.excerpt,
    image: g.image
  }))
};

const GUIDE_DETAILS_BY_ID_TA: Record<string, Guide> = Object.fromEntries(
  guidesTa.map((g, i) => [`guide-0${i + 1}`, g])
);

export const GuidesSection: React.FC = () => {
  const { lang } = useLang();
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);

  const block = useSiteContent('plans.guides', GUIDES_FALLBACK);
  const resolvedDetailsById = lang === 'ta' ? GUIDE_DETAILS_BY_ID_TA : GUIDE_DETAILS_BY_ID;
  const resolvedGuides = lang === 'ta' ? guidesTa : guides;
  // In Tamil, always show the local Tamil fallback rather than whatever the
  // CMS block resolved to — the CMS only ever stores English text (no
  // per-language field), so trusting it here silently mixed English guide
  // titles into an otherwise-Tamil page. English keeps reading straight from
  // the CMS block as before, so admin edits still show up.
  const items: CmsGuideItem[] = lang === 'ta' ? GUIDES_FALLBACK_TA.items : block.items;
  const resolvedHeadingBlock = lang === 'ta' ? GUIDES_FALLBACK_TA : block;

  const displayGuides: Guide[] = items.map((item, i) => {
    const detail = (item.id && resolvedDetailsById[item.id]) || resolvedGuides[i];
    return {
      title: item.title,
      excerpt: item.excerpt,
      image: item.image,
      icon: detail?.icon ?? BookOpen,
      paragraphs: detail && detail.title === item.title ? detail.paragraphs : [item.excerpt]
    };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{resolvedHeadingBlock.eyebrow}</div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{resolvedHeadingBlock.heading}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {displayGuides.map((guide) => {
          const Icon = guide.icon;
          return (
            <button
              key={guide.title}
              onClick={() => setOpenGuide(guide)}
              className="group text-left bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
            >
              <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-700" />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-black text-[#0A1F12] leading-snug line-clamp-2">{guide.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{guide.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:gap-2 transition-all">
                  {lang === 'ta' ? 'வழிகாட்டியைப் படிக்க' : 'Read Guide'} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Guide modal */}
      {openGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpenGuide(null)}>
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 bg-neutral-100">
              <img src={openGuide.image} alt={openGuide.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <button
                onClick={() => setOpenGuide(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0A1F12] cursor-pointer transition"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 sm:p-7 space-y-4">
              <h3 className="text-xl font-black text-[#0A1F12] leading-tight">{openGuide.title}</h3>
              <div className="space-y-3">
                {openGuide.paragraphs.map((para, idx) => (
                  <p key={idx} className="text-sm text-neutral-600 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
