import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang } from '../lib/language';

const REPO_RAW = 'https://raw.githubusercontent.com/igobackend2-bit/IGO-PROTIEN-CUT-/main/static/images/Brands';

const brandIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Editable from /admin → Sections → Our Farm & Supply Partners. */
const FALLBACK = {
  eyebrow: 'Trusted Sourcing Network',
  heading: 'Our Farm & Supply Partners',
  subheading: 'Sourced directly from certified farms and hatcheries across the region.'
};
const FALLBACK_TA = {
  eyebrow: 'நம்பகமான ஆதார நெட்வொர்க்',
  heading: 'எங்கள் பண்ணை & சப்ளை பங்குதாரர்கள்',
  subheading: 'பிராந்தியம் முழுவதும் உள்ள சான்றளிக்கப்பட்ட பண்ணைகள் மற்றும் அடைகாக்கும் நிலையங்களிலிருந்து நேரடியாக பெறப்படுகிறது.'
};
const FALLBACK_HI = {
  eyebrow: 'भरोसेमंद सोर्सिंग नेटवर्क',
  heading: 'हमारे फार्म और सप्लाई पार्टनर्स',
  subheading: 'क्षेत्र भर के प्रमाणित फार्मों और हैचरी से सीधे प्राप्त किया जाता है।'
};
const FALLBACK_ML = {
  eyebrow: 'വിശ്വസനീയമായ സോഴ്‌സിംഗ് നെറ്റ്‌വർക്ക്',
  heading: 'ഞങ്ങളുടെ ഫാം & സപ്ലൈ പാർട്ണർമാർ',
  subheading: 'പ്രദേശത്തുടനീളമുള്ള സർട്ടിഫൈഡ് ഫാമുകളിൽ നിന്നും ഹാച്ചറികളിൽ നിന്നും നേരിട്ട് ലഭ്യമാക്കുന്നു.'
};
const FALLBACK_TE = {
  eyebrow: 'నమ్మకమైన సోర్సింగ్ నెట్‌వర్క్',
  heading: 'మా ఫార్మ్ & సప్లై భాగస్వాములు',
  subheading: 'ప్రాంతం అంతటా సర్టిఫైడ్ ఫార్మ్‌ల నుండి మరియు హేచరీల నుండి నేరుగా సేకరించబడుతుంది.'
};
const FALLBACK_KN = {
  eyebrow: 'ವಿಶ್ವಾಸಾರ್ಹ ಸೋರ್ಸಿಂಗ್ ನೆಟ್‌ವರ್ಕ್',
  heading: 'ನಮ್ಮ ಫಾರ್ಮ್ & ಸಪ್ಲೈ ಪಾಲುದಾರರು',
  subheading: 'ಪ್ರದೇಶದಾದ್ಯಂತ ಪ್ರಮಾಣೀಕೃತ ಫಾರ್ಮ್‌ಗಳು ಮತ್ತು ಹ್ಯಾಚರಿಗಳಿಂದ ನೇರವಾಗಿ ಪಡೆಯಲಾಗುತ್ತದೆ.'
};

export const BrandPartnersSection: React.FC = () => {
  const { lang } = useLang();
  const block = useSiteContent('sections.partners', FALLBACK);
  const resolved = lang === 'ta' ? FALLBACK_TA : lang === 'hi' ? FALLBACK_HI : lang === 'ml' ? FALLBACK_ML : lang === 'te' ? FALLBACK_TE : lang === 'kn' ? FALLBACK_KN : block;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{resolved.eyebrow}</span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{resolved.heading}</h2>
        <p className="text-xs text-neutral-600">{resolved.subheading}</p>
      </div>

      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2 opacity-80">
        {brandIds.map((id) => (
          <div
            key={id}
            className="shrink-0 w-28 h-16 rounded-xl bg-white border border-neutral-200 flex items-center justify-center p-3 hover:opacity-100 hover:border-emerald-400 transition shadow-sm"
          >
            <img
              src={`${REPO_RAW}/${id}.jpg`}
              alt={`Partner brand ${id}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
