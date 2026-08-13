import React from 'react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { useLang, pick } from '../lib/language';

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

const FALLBACK_HI = {
  eyebrow: 'ग्राहक हमारे साथ क्यों बने रहते हैं',
  heading: 'सिर्फ डिलीवरी नहीं, भरोसे पर आधारित',
  items: [
    {
      icon: 'Truck',
      title: 'तेज़, बर्फ-ठंडी डिलीवरी',
      text: 'कट्स को इंसुलेटेड, आइस-लाइन्ड बॉक्स में पैक करके आपके तय सुबह के स्लॉट में डिलीवर किया जाता है — हर ऑर्डर में, हर बार।'
    },
    {
      icon: 'ShieldCheck',
      title: 'स्वच्छता-प्राथमिकता वाली सोर्सिंग',
      text: 'हर कट को एक फ्रेशनेस ग्रेड दी जाती है और वह एंटीबायोटिक-मुक्त होता है, आपके ऑर्डर की स्पेसिफिकेशन के अनुसार बिल्कुल सही तरीके से साफ और पोर्शन किया जाता है।'
    },
    {
      icon: 'Repeat',
      title: 'वास्तविक सब्सक्रिप्शन सपोर्ट',
      text: 'कभी भी अपनी योजना को रोकें, फिर से शेड्यूल करें, या बदलें — एक सपोर्ट टीम के साथ जो वाकई फोन उठाती है।'
    }
  ]
};

const FALLBACK_ML = {
  eyebrow: 'ഉപഭോക്താക്കൾ എന്തുകൊണ്ട് ഞങ്ങളോടൊപ്പം തുടരുന്നു',
  heading: 'വിശ്വാസത്തെ അടിസ്ഥാനമാക്കി, കേവലം ഡെലിവറി മാത്രമല്ല',
  items: [
    {
      icon: 'Truck',
      title: 'വേഗതയേറിയ, ഐസ്-തണുപ്പുള്ള ഡെലിവറി',
      text: 'കട്ടുകൾ ഇൻസുലേറ്റഡ്, ഐസ്-ലൈൻഡ് ബോക്സുകളിൽ പായ്ക്ക് ചെയ്ത് നിങ്ങൾ വാഗ്ദാനം ചെയ്ത രാവിലത്തെ സ്ലോട്ടിനുള്ളിൽ ഡെലിവർ ചെയ്യുന്നു — എല്ലാ ഓർഡറിലും, എപ്പോഴും.'
    },
    {
      icon: 'ShieldCheck',
      title: 'ശുചിത്വത്തിന് മുൻഗണന നൽകുന്ന സോഴ്സിംഗ്',
      text: 'ഓരോ കട്ടിനും ഒരു ഫ്രെഷ്നസ് ഗ്രേഡ് ഉണ്ട്, ആന്റിബയോട്ടിക് രഹിതമാണ്, നിങ്ങൾ ഓർഡർ ചെയ്യുന്ന സ്പെസിഫിക്കേഷന് അനുസരിച്ച് കൃത്യമായി വൃത്തിയാക്കി വിഭജിച്ചിരിക്കുന്നു.'
    },
    {
      icon: 'Repeat',
      title: 'യഥാർത്ഥ സബ്സ്ക്രിപ്ഷൻ പിന്തുണ',
      text: 'എപ്പോൾ വേണമെങ്കിലും താൽക്കാലികമായി നിർത്തുക, വീണ്ടും ഷെഡ്യൂൾ ചെയ്യുക, അല്ലെങ്കിൽ നിങ്ങളുടെ പ്ലാൻ മാറ്റുക — ശരിക്കും ഫോൺ എടുക്കുന്ന ഒരു പിന്തുണാ ടീമിന്റെ പിന്തുണയോടെ.'
    }
  ]
};

const FALLBACK_TE = {
  eyebrow: 'కస్టమర్లు ఎందుకు మాతో ఉంటారు',
  heading: 'కేవలం డెలివరీ కాదు, నమ్మకంపై ఆధారపడింది',
  items: [
    {
      icon: 'Truck',
      title: 'వేగవంతమైన, మంచు-చల్లని డెలివరీ',
      text: 'కట్స్ ఇన్సులేటెడ్, ఐస్-లైన్డ్ బాక్సుల్లో ప్యాక్ చేయబడి మీ నిర్ధారిత ఉదయం స్లాట్‌లో డెలివరీ చేయబడతాయి — ప్రతి ఆర్డర్‌లో, ప్రతిసారీ.'
    },
    {
      icon: 'ShieldCheck',
      title: 'పరిశుభ్రత-ప్రాధాన్యత సోర్సింగ్',
      text: 'ప్రతి కట్‌కు ఫ్రెష్‌నెస్ గ్రేడ్ ఉంటుంది మరియు యాంటీబయాటిక్-రహితంగా ఉంటుంది, మీరు ఆర్డర్ చేసిన స్పెసిఫికేషన్‌కు సరిగ్గా సరిపోయేలా శుభ్రం చేసి భాగాలుగా చేయబడుతుంది.'
    },
    {
      icon: 'Repeat',
      title: 'నిజమైన సబ్‌స్క్రిప్షన్ మద్దతు',
      text: 'ఎప్పుడైనా పాజ్ చేయండి, రీషెడ్యూల్ చేయండి, లేదా మీ ప్లాన్ మార్చండి — నిజంగా ఫోన్ ఎత్తే మద్దతు బృందం అండగా.'
    }
  ]
};

export const TestimonialsSection: React.FC = () => {
  const { lang } = useLang();
  const block = useSiteContent('sections.trust_strip', FALLBACK);
  const resolvedBlock = lang === 'ta' ? FALLBACK_TA : lang === 'hi' ? FALLBACK_HI : lang === 'ml' ? FALLBACK_ML : lang === 'te' ? FALLBACK_TE : block;
  const valueProps = resolvedBlock.items.map((item) => ({
    icon: resolveIcon(item.icon),
    title: item.title,
    body: item.text
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          {pick(lang, { en: 'Why Households Choose Us', ta: 'குடும்பங்கள் ஏன் எங்களைத் தேர்வு செய்கின்றன', hi: 'परिवार हमें क्यों चुनते हैं', ml: 'കുടുംബങ്ങൾ ഞങ്ങളെ തിരഞ്ഞെടുക്കുന്നത് എന്തുകൊണ്ട്', te: 'కుటుంబాలు మమ్మల్ని ఎందుకు ఎంచుకుంటాయి' })}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
          {pick(lang, { en: 'Built Around Trust, Not Just Delivery', ta: 'நம்பிக்கையை மையமாகக் கொண்டது, டெலிவரி மட்டுமல்ல', hi: 'सिर्फ डिलीवरी नहीं, भरोसे पर आधारित', ml: 'വിശ്വാസത്തെ അടിസ്ഥാനമാക്കി, കേവലം ഡെലിവറി മാത്രമല്ല', te: 'కేవలం డెలివరీ కాదు, నమ్మకంపై ఆధారపడింది' })}
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
