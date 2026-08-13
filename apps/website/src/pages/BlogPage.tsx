import React, { useState } from 'react';
import { ArrowRight, X, BookOpen } from 'lucide-react';
import { guides, guidesTa, guidesHi, guidesMl, guidesTe, guidesKn, Guide } from '../sections/GuidesSection';
import { useLang, pick } from '../lib/language';

/**
 * BLOG — reuses the same real, genuinely useful cooking/food-safety guides
 * already built for the homepage's "Cook It Right" strip (GuidesSection.tsx)
 * rather than inventing separate blog content. This is the standalone
 * destination the navbar's new "Blog" link points to; the homepage strip
 * still exists as a teaser for these same guides.
 */
export const BlogPage: React.FC = () => {
  const { lang } = useLang();
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);
  const resolvedGuides = lang === 'ta' ? guidesTa : lang === 'hi' ? guidesHi : lang === 'ml' ? guidesMl : lang === 'te' ? guidesTe : lang === 'kn' ? guidesKn : guides;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Hero */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-3 text-white shadow-lg shadow-emerald-950/20">
        <BookOpen className="w-10 h-10 text-emerald-400 mx-auto" />
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{pick(lang, { en: 'IGO Kitchen Guides', ta: 'IGO சமையலறை வழிகாட்டிகள்', hi: 'IGO किचन गाइड', ml: 'IGO അടുക്കള ഗൈഡുകൾ', te: 'IGO వంటగది గైడ్‌లు', kn: 'IGO ಅಡುಗೆಮನೆ ಮಾರ್ಗದರ್ಶಿಗಳು' })}</h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto">
          {pick(lang, {
            en: "Practical, real food-safety and cooking guidance — how to store what you bought, how to judge quality, and how to cook it right. No filler, just what actually matters in your kitchen.",
            ta: 'நடைமுறை, உண்மையான உணவு பாதுகாப்பு மற்றும் சமையல் வழிகாட்டுதல் — நீங்கள் வாங்கியதை எப்படி சேமிப்பது, தரத்தை எப்படி மதிப்பிடுவது, மற்றும் எப்படி சரியாக சமைப்பது. அலங்காரமில்லாமல், உங்கள் சமையலறையில் உண்மையில் முக்கியமானது மட்டும்.',
            hi: 'व्यावहारिक, असली फूड-सेफ्टी और कुकिंग गाइडेंस — आपने जो खरीदा है उसे कैसे स्टोर करें, क्वालिटी कैसे परखें, और सही तरीके से कैसे पकाएं। कोई फिजूल बातें नहीं, बस वही जो आपकी रसोई में सच में मायने रखता है।',
            ml: 'പ്രായോഗികവും യഥാർത്ഥവുമായ ഭക്ഷ്യസുരക്ഷയും പാചക മാർഗ്ഗനിർദ്ദേശവും — നിങ്ങൾ വാങ്ങിയത് എങ്ങനെ സൂക്ഷിക്കാം, ഗുണനിലവാരം എങ്ങനെ വിലയിരുത്താം, ശരിയായി എങ്ങനെ പാചകം ചെയ്യാം. അനാവശ്യമായതൊന്നുമില്ല, നിങ്ങളുടെ അടുക്കളയിൽ യഥാർത്ഥത്തിൽ പ്രധാനപ്പെട്ടത് മാത്രം.',
            te: 'ఆచరణాత్మకమైన, నిజమైన ఫుడ్-సేఫ్టీ మరియు వంట మార్గదర్శకత్వం — మీరు కొన్నది ఎలా నిల్వ చేయాలో, నాణ్యతను ఎలా అంచనా వేయాలో, సరిగ్గా ఎలా వండాలో. అనవసరమైనవి ఏమీ లేవు, మీ వంటగదిలో నిజంగా ముఖ్యమైనది మాత్రమే.',
            kn: 'ಪ್ರಾಯೋಗಿಕ, ನಿಜವಾದ ಆಹಾರ-ಸುರಕ್ಷತೆ ಮತ್ತು ಅಡುಗೆ ಮಾರ್ಗದರ್ಶನ — ನೀವು ಖರೀದಿಸಿದ್ದನ್ನು ಹೇಗೆ ಸಂಗ್ರಹಿಸುವುದು, ಗುಣಮಟ್ಟವನ್ನು ಹೇಗೆ ನಿರ್ಣಯಿಸುವುದು, ಮತ್ತು ಸರಿಯಾಗಿ ಹೇಗೆ ಅಡುಗೆ ಮಾಡುವುದು. ಅನಗತ್ಯವಾದುದೇನೂ ಇಲ್ಲ, ನಿಮ್ಮ ಅಡುಗೆಮನೆಯಲ್ಲಿ ನಿಜವಾಗಿಯೂ ಮುಖ್ಯವಾದದ್ದು ಮಾತ್ರ.',
          })}
        </p>
      </div>

      {/* Guide grid — same cards/modal pattern as the homepage strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {resolvedGuides.map((guide) => {
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
                <h3 className="text-sm font-black text-[#0A1F12] leading-snug">{guide.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{guide.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:gap-2 transition-all">
                  {pick(lang, { en: 'Read Guide', ta: 'வழிகாட்டியைப் படிக்கவும்', hi: 'गाइड पढ़ें', ml: 'ഗൈഡ് വായിക്കുക', te: 'గైడ్ చదవండి', kn: 'ಗೈಡ್ ಓದಿ' })} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Guide modal — identical behavior to the homepage strip */}
      {openGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenGuide(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 bg-neutral-100">
              <img src={openGuide.image} alt={openGuide.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <button
                onClick={() => setOpenGuide(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0A1F12] cursor-pointer transition"
                aria-label={pick(lang, { en: 'Close guide', ta: 'வழிகாட்டியை மூடு', hi: 'गाइड बंद करें', ml: 'ഗൈഡ് അടയ്ക്കുക', te: 'గైడ్‌ను మూసివేయండి', kn: 'ಗೈಡ್ ಮುಚ್ಚಿ' })}
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
    </div>
  );
};
