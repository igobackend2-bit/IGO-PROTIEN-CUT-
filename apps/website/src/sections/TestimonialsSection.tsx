import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { useLang } from '../lib/language';

// NOTE: real customer testimonials aren't live yet. `product_reviews` now
// exists in the database with an enforce_verified_purchase trigger and admin
// moderation in the Flutter dashboard, so the pipeline is there — this section
// just isn't wired to it yet.
//
// Until it is, the cards state real, already-established site facts (30-min
// delivery, freshness grading, subscription support) rather than inventing
// named customers and quotes labelled "Verified", which would be a
// false-advertising risk.
//
// Editable from /admin → Sections → Trust Strip.
const FALLBACK = {
  eyebrow: 'WHY CUSTOMERS STAY',
  heading: 'Built Around Trust, Not Just Delivery',
  items: [
    {
      icon: 'Truck',
      title: 'Fast, ice-cold delivery',
      text: 'Cuts are packed in insulated, ice-lined boxes and delivered within your promised morning slot — every order, every time.'
    },
    {
      icon: 'ShieldCheck',
      title: 'Hygiene-first sourcing',
      text: 'Every cut carries a freshness grade and is antibiotic-free, cleaned and portioned exactly to the spec you order.'
    },
    {
      icon: 'Repeat',
      title: 'Real subscription support',
      text: 'Pause, reschedule, or change your plan anytime — backed by a support team that actually picks up the phone.'
    }
  ]
};

const FALLBACK_TA = {
  eyebrow: 'வாடிக்கையாளர்கள் ஏன் தங்குகிறார்கள்',
  heading: 'நம்பிக்கையை மையமாகக் கொண்டது, டெலிவரி மட்டுமல்ல',
  items: [
    {
      icon: 'Truck',
      title: 'வேகமான, பனிக்குளிர் டெலிவரி',
      text: 'கட்ஸ் இன்சுலேட்டட், ஐஸ்-லைன்டு பெட்டிகளில் பேக் செய்யப்பட்டு, உங்கள் உறுதியான காலை நேரத்திற்குள் டெலிவரி செய்யப்படுகிறது — ஒவ்வொரு ஆர்டரிலும், எப்போதும்.'
    },
    {
      icon: 'ShieldCheck',
      title: 'சுகாதாரம்-முதன்மை ஆதாரம்',
      text: 'ஒவ்வொரு கட்டும் ஒரு புத்துணர்ச்சி தரத்தை கொண்டுள்ளது, ஆன்டிபயாடிக் இல்லாதது, நீங்கள் ஆர்டர் செய்யும் விவரக்குறிப்பிற்கு சரியாக சுத்தம் செய்யப்பட்டு பங்கிடப்படுகிறது.'
    },
    {
      icon: 'Repeat',
      title: 'உண்மையான சந்தா ஆதரவு',
      text: 'எப்போது வேண்டுமானாலும் இடைநிறுத்தவும், மறு அட்டவணைப்படுத்தவும், அல்லது உங்கள் திட்டத்தை மாற்றவும் — உண்மையிலேயே போன் எடுக்கும் ஆதரவு குழுவின் ஆதரவுடன்.'
    }
  ]
};

export const TestimonialsSection: React.FC = () => {
  const { lang } = useLang();
  const block = useSiteContent('sections.trust_strip', FALLBACK);
  const resolvedBlock = lang === 'ta' ? FALLBACK_TA : block;
  const valueProps = resolvedBlock.items.map((item) => ({
    icon: resolveIcon(item.icon),
    title: item.title,
    body: item.text
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          {lang === 'ta' ? 'குடும்பங்கள் ஏன் எங்களைத் தேர்வு செய்கின்றன' : 'Why Households Choose Us'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
          {lang === 'ta' ? 'நம்பிக்கையை மையமாகக் கொண்டது, டெலிவரி மட்டுமல்ல' : 'Built Around Trust, Not Just Delivery'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {valueProps.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-[#0A1F12] mb-2">{v.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{v.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
