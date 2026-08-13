import React from 'react';
import { ShieldCheck, Award, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { FadeImage } from '../components/FadeImage';
import { TraceabilitySection } from '../sections/TraceabilitySection';
import { useLang, pick } from '../lib/language';

const CONTENT_TA = {
  title: 'ப்ரோட்டீன் கட்ஸ் கதை',
  intro:
    'இந்திய வீடுகளில் இருந்து இரசாயன பாதுகாப்பான்கள், ஆன்டிபயாடிக்குகள் மற்றும் பழைய உறைந்த இறைச்சிகளை ஒழிக்க வேண்டும் என்ற ஒரே ஆர்வத்தில் இருந்து ப்ரோட்டீன் கட்ஸ் பிறந்தது. மதிப்புமிக்க IGO குரூப்ஸ் சுற்றுச்சூழல் அமைப்பின் ஒரு பகுதியாக, தொழில்நுட்பம், பண்ணை கூட்டாண்மைகள் மற்றும் குளிர்சாதன சேமிப்பு லாஜிஸ்டிக்ஸை பயன்படுத்தி 30-90 நிமிடங்களில் தூய்மையான, புதிய புரதத்தை வழங்குகிறோம்.'
};

const CONTENT_HI = {
  title: 'प्रोटीन कट्स की कहानी',
  intro:
    'प्रोटीन कट्स का जन्म एक ही जुनून से हुआ: भारतीय घरों से रासायनिक परिरक्षकों, एंटीबायोटिक्स और बासी जमे हुए मांस को खत्म करना। प्रतिष्ठित आईजीओ ग्रुप्स इकोसिस्टम के हिस्से के रूप में, हम तकनीक, फार्म साझेदारी और कोल्ड-चेन लॉजिस्टिक्स का उपयोग करके 30-90 मिनट में शुद्ध, ताज़ा प्रोटीन पहुंचाते हैं।'
};

const CONTENT_ML = {
  title: 'പ്രോട്ടീൻ കട്ട്‌സിന്റെ കഥ',
  intro:
    'ഇന്ത്യൻ വീടുകളിൽ നിന്ന് രാസ പ്രിസർവേറ്റീവുകൾ, ആന്റിബയോട്ടിക്കുകൾ, പഴകിയ ഫ്രോസൺ മാംസം എന്നിവ ഇല്ലാതാക്കുക എന്ന ഒരൊറ്റ ലക്ഷ്യത്തിൽ നിന്നാണ് പ്രോട്ടീൻ കട്ട്‌സ് പിറന്നത്. അഭിമാനകരമായ ഐജിഒ ഗ്രൂപ്‌സ് ഇക്കോസിസ്റ്റത്തിന്റെ ഭാഗമായി, സാങ്കേതികവിദ്യ, ഫാം പങ്കാളിത്തങ്ങൾ, കോൾഡ്-ചെയിൻ ലോജിസ്റ്റിക്‌സ് എന്നിവ ഉപയോഗിച്ച് ഞങ്ങൾ 30-90 മിനിറ്റിനുള്ളിൽ ശുദ്ധവും പുതിയതുമായ പ്രോട്ടീൻ എത്തിക്കുന്നു.'
};

const CONTENT_TE = {
  title: 'ప్రోటీన్ కట్స్ కథ',
  intro:
    'భారతీయ ఇళ్ల నుండి రసాయన సంరక్షణకారులు, యాంటీబయాటిక్స్ మరియు పాత ఫ్రోజెన్ మాంసాన్ని తొలగించాలనే ఒకే ఒక్క తపనతో ప్రోటీన్ కట్స్ పుట్టింది. ప్రతిష్టాత్మకమైన ఐజీవో గ్రూప్స్ పర్యావరణ వ్యవస్థలో భాగంగా, సాంకేతికత, వ్యవసాయ భాగస్వామ్యాలు మరియు కోల్డ్-చైన్ లాజిస్టిక్స్‌ను ఉపయోగించి మేము 30-90 నిమిషాల్లో స్వచ్ఛమైన, తాజా ప్రోటీన్‌ను అందిస్తాము.'
};

const CONTENT_KN = {
  title: 'ಪ್ರೋಟೀನ್ ಕಟ್ಸ್ ಕಥೆ',
  intro:
    'ಭಾರತೀಯ ಮನೆಗಳಿಂದ ರಾಸಾಯನಿಕ ಸಂರಕ್ಷಕಗಳು, ಆಂಟಿಬಯಾಟಿಕ್‌ಗಳು ಮತ್ತು ಹಳೆಯ ಫ್ರೋಜನ್ ಮಾಂಸವನ್ನು ತೊಡೆದುಹಾಕಬೇಕೆಂಬ ಒಂದೇ ಗುರಿಯಿಂದ ಪ್ರೋಟೀನ್ ಕಟ್ಸ್ ಹುಟ್ಟಿಕೊಂಡಿತು. ಪ್ರತಿಷ್ಠಿತ ಐಜಿಒ ಗ್ರೂಪ್ಸ್ ಪರಿಸರ ವ್ಯವಸ್ಥೆಯ ಭಾಗವಾಗಿ, ತಂತ್ರಜ್ಞಾನ, ಫಾರ್ಮ್ ಪಾಲುದಾರಿಕೆಗಳು ಮತ್ತು ಕೋಲ್ಡ್-ಚೈನ್ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಬಳಸಿ ನಾವು 30-90 ನಿಮಿಷಗಳಲ್ಲಿ ಶುದ್ಧ, ತಾಜಾ ಪ್ರೋಟೀನ್ ಅನ್ನು ತಲುಪಿಸುತ್ತೇವೆ.'
};

const WHAT_WE_SELL_TA = [
  'புதிய கோழி',
  'மட்டன் & மாட்டிறைச்சி',
  'மீன் & கடல் உணவு',
  'பண்ணை முட்டைகள்',
  'சமைக்க தயார்',
  'உறைந்த சிற்றுண்டிகள்',
  'காம்போ பாக்குகள்',
  'இறைச்சி சந்தாக்கள்'
];

const WHAT_WE_SELL_HI = [
  'ताज़ा चिकन',
  'मटन और बीफ़',
  'मछली और सीफूड',
  'फार्म अंडे',
  'रेडी-टू-कुक',
  'फ्रोज़न स्नैक्स',
  'कॉम्बो पैक',
  'मीट सब्सक्रिप्शन'
];

const WHAT_WE_SELL_ML = [
  'ഫ്രഷ് ചിക്കൻ',
  'മട്ടൻ & ബീഫ്',
  'മീൻ & കടൽ വിഭവങ്ങൾ',
  'ഫാം മുട്ടകൾ',
  'റെഡി-ടു-കുക്ക്',
  'ഫ്രോസൺ സ്നാക്സ്',
  'കോംബോ പാക്കുകൾ',
  'മീറ്റ് സബ്സ്ക്രിപ്ഷനുകൾ'
];

const WHAT_WE_SELL_TE = [
  'తాజా చికెన్',
  'మటన్ & బీఫ్',
  'చేపలు & సీఫుడ్',
  'ఫార్మ్ గుడ్లు',
  'రెడీ-టు-కుక్',
  'ఫ్రోజెన్ స్నాక్స్',
  'కాంబో ప్యాక్‌లు',
  'మీట్ సబ్‌స్క్రిప్షన్‌లు'
];

const WHAT_WE_SELL_KN = [
  'ತಾಜಾ ಚಿಕನ್',
  'ಮಟನ್ & ಬೀಫ್',
  'ಮೀನು & ಸೀಫುಡ್',
  'ಫಾರ್ಮ್ ಮೊಟ್ಟೆಗಳು',
  'ರೆಡಿ-ಟು-ಕುಕ್',
  'ಫ್ರೋಜನ್ ಸ್ನ್ಯಾಕ್ಸ್',
  'ಕಾಂಬೋ ಪ್ಯಾಕ್‌ಗಳು',
  'ಮೀಟ್ ಸಬ್‌ಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು'
];

export const AboutPage: React.FC = () => {
  const { lang } = useLang();
  // Only the hero title/intro are admin-editable here (via /admin → Pages &
  // SEO → About page). The sections below (Trust, Founder Message,
  // Certifications) are bespoke layouts, not a generic heading/body list, so
  // they stay hardcoded rather than being forced into a shape that doesn't
  // fit them.
  const content = useSiteContent('pages.about', {
    title: 'The Protein Cuts Story',
    intro:
      'Protein Cuts was born out of a single obsession: to eradicate chemical preservatives, antibiotics, and stale frozen meats from Indian households. As part of the prestigious IGO Groups ecosystem, we leverage technology, farm partnerships, and cold-chain logistics to deliver pure, fresh protein in 30-90 minutes.'
  });
  const resolvedContent =
    lang === 'ta' ? CONTENT_TA : lang === 'hi' ? CONTENT_HI : lang === 'ml' ? CONTENT_ML : lang === 'te' ? CONTENT_TE : lang === 'kn' ? CONTENT_KN : content;
  const whatWeSellItems =
    lang === 'ta'
      ? WHAT_WE_SELL_TA
      : lang === 'hi'
      ? WHAT_WE_SELL_HI
      : lang === 'ml'
      ? WHAT_WE_SELL_ML
      : lang === 'te'
      ? WHAT_WE_SELL_TE
      : lang === 'kn'
      ? WHAT_WE_SELL_KN
      : [
          'Fresh Chicken',
          'Mutton & Beef',
          'Fish & Seafood',
          'Farm Eggs',
          'Ready-to-Cook',
          'Frozen Snacks',
          'Combo Packs',
          'Meat Subscriptions'
        ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-lg shadow-emerald-950/20 text-white">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{pick(lang, { en: 'IGO ECOSYSTEM BRAND', ta: 'IGO சுற்றுச்சூழல் அமைப்பு பிராண்ட்', hi: 'आईजीओ इकोसिस्टम ब्रांड', ml: 'ഐജിഒ ഇക്കോസിസ്റ്റം ബ്രാൻഡ്', te: 'ఐజీవో పర్యావరణ వ్యవస్థ బ్రాండ్', kn: 'ಐಜಿಒ ಪರಿಸರ ವ್ಯವಸ್ಥೆ ಬ್ರಾಂಡ್' })}</span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{resolvedContent.title}</h1>
        <p className="text-xs sm:text-base text-neutral-300 leading-relaxed">{resolvedContent.intro}</p>
      </div>

      {/* What We Sell — customer feedback pointed out that everything above
          this point is guarantees/brand-story copy (antibiotic-free, cold
          chain, certifications) without ever plainly stating what's actually
          for sale. A new visitor reading only the hero had no quick way to
          tell this is a fresh-meat-and-seafood delivery service rather than,
          say, a supplement or grocery brand. This section says it directly. */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{pick(lang, { en: 'What We Sell', ta: 'நாங்கள் விற்பது என்ன', hi: 'हम क्या बेचते हैं', ml: 'ഞങ്ങൾ വിൽക്കുന്നത്', te: 'మేము ఏమి విక్రయిస్తాము', kn: 'ನಾವು ಏನು ಮಾರಾಟ ಮಾಡುತ್ತೇವೆ' })}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight mt-2">
            {pick(lang, {
              en: 'Fresh chicken, mutton, fish, seafood and eggs — cut to order and delivered in 30-90 minutes.',
              ta: 'புதிய கோழி, மட்டன், மீன், கடல் உணவு மற்றும் முட்டைகள் — ஆர்டர் செய்யும்போது வெட்டப்பட்டு 30-90 நிமிடங்களில் வழங்கப்படும்.',
              hi: 'ताज़ा चिकन, मटन, मछली, सीफूड और अंडे — ऑर्डर के अनुसार काटे जाते हैं और 30-90 मिनट में डिलीवर होते हैं।',
              ml: 'ഫ്രഷ് ചിക്കൻ, മട്ടൻ, മീൻ, കടൽ വിഭവങ്ങൾ, മുട്ടകൾ — ഓർഡർ അനുസരിച്ച് മുറിച്ച് 30-90 മിനിറ്റിനുള്ളിൽ എത്തിക്കുന്നു.',
              te: 'తాజా చికెన్, మటన్, చేపలు, సీఫుడ్ మరియు గుడ్లు — ఆర్డర్ చేసిన వెంటనే కట్ చేసి 30-90 నిమిషాల్లో డెలివరీ చేస్తాము.',
              kn: 'ತಾಜಾ ಚಿಕನ್, ಮಟನ್, ಮೀನು, ಸೀಫುಡ್ ಮತ್ತು ಮೊಟ್ಟೆಗಳು — ಆರ್ಡರ್ ಮಾಡಿದಂತೆ ಕತ್ತರಿಸಿ 30-90 ನಿಮಿಷಗಳಲ್ಲಿ ತಲುಪಿಸಲಾಗುತ್ತದೆ.'
            })}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed mt-3">
            {pick(lang, {
              en: 'Protein Cuts is an online butcher: you pick the cut and weight, our butchers dress it fresh after you order, and it reaches your door chilled at 0-4°C. Beyond individual cuts, we also sell ready-to-cook marinated items, frozen snacks, combo packs for families or gym-goers, and recurring meat subscriptions.',
              ta: 'ப்ரோட்டீன் கட்ஸ் ஒரு ஆன்லைன் கசாப்புக் கடை: நீங்கள் வெட்டு மற்றும் எடையைத் தேர்ந்தெடுக்கிறீர்கள், நீங்கள் ஆர்டர் செய்த பிறகு எங்கள் கசாப்புக்காரர்கள் அதை புதிதாக தயார் செய்கிறார்கள், அது 0-4°C குளிர்ச்சியில் உங்கள் வீட்டிற்கு வருகிறது. தனிப்பட்ட வெட்டுகளுக்கு அப்பால், நாங்கள் சமைக்கத் தயார் மேரினேட் செய்யப்பட்ட பொருட்கள், உறைந்த சிற்றுண்டிகள், குடும்பங்கள் அல்லது ஜிம் பயனர்களுக்கான காம்போ பாக்குகள் மற்றும் தொடர் இறைச்சி சந்தாக்களையும் விற்கிறோம்.',
              hi: 'प्रोटीन कट्स एक ऑनलाइन कसाई की दुकान है: आप कट और वज़न चुनते हैं, आपके ऑर्डर के बाद हमारे कसाई इसे ताज़ा तैयार करते हैं, और यह 0-4°C पर ठंडा होकर आपके दरवाज़े तक पहुँचता है। अलग-अलग कट्स के अलावा, हम रेडी-टू-कुक मैरिनेटेड आइटम, फ्रोज़न स्नैक्स, परिवारों या जिम जाने वालों के लिए कॉम्बो पैक, और नियमित मीट सब्सक्रिप्शन भी बेचते हैं।',
              ml: 'പ്രോട്ടീൻ കട്ട്‌സ് ഒരു ഓൺലൈൻ ബുച്ചർ ഷോപ്പ് ആണ്: നിങ്ങൾ കട്ടും തൂക്കവും തിരഞ്ഞെടുക്കുന്നു, നിങ്ങൾ ഓർഡർ ചെയ്ത ശേഷം ഞങ്ങളുടെ ബുച്ചർമാർ അത് പുതുതായി തയ്യാറാക്കുന്നു, അത് 0-4°C തണുപ്പിൽ നിങ്ങളുടെ വീട്ടിലെത്തുന്നു. ഒറ്റ കട്ടുകൾക്ക് പുറമേ, റെഡി-ടു-കുക്ക് മാരിനേറ്റഡ് ഐറ്റങ്ങൾ, ഫ്രോസൺ സ്നാക്സ്, കുടുംബങ്ങൾക്കോ ജിം പോകുന്നവർക്കോ ഉള്ള കോംബോ പാക്കുകൾ, ആവർത്തിക്കുന്ന മീറ്റ് സബ്സ്ക്രിപ്ഷനുകൾ എന്നിവയും ഞങ്ങൾ വിൽക്കുന്നു.',
              te: 'ప్రోటీన్ కట్స్ ఒక ఆన్‌లైన్ మాంస దుకాణం: మీరు కట్ మరియు బరువు ఎంచుకుంటారు, మీరు ఆర్డర్ చేసిన తర్వాత మా కసాయిలు దానిని తాజాగా సిద్ధం చేస్తారు, అది 0-4°C చల్లదనంలో మీ ఇంటికి చేరుతుంది. వ్యక్తిగత కట్స్‌తో పాటు, రెడీ-టు-కుక్ మెరినేటెడ్ వస్తువులు, ఫ్రోజెన్ స్నాక్స్, కుటుంబాలు లేదా జిమ్ వెళ్ళేవారి కోసం కాంబో ప్యాక్‌లు, పునరావృత మీట్ సబ్‌స్క్రిప్షన్‌లను కూడా మేము విక్రయిస్తాము.',
              kn: 'ಪ್ರೋಟೀನ್ ಕಟ್ಸ್ ಒಂದು ಆನ್‌ಲೈನ್ ಮಾಂಸದಂಗಡಿ: ನೀವು ಕಟ್ ಮತ್ತು ತೂಕವನ್ನು ಆಯ್ಕೆ ಮಾಡುತ್ತೀರಿ, ನೀವು ಆರ್ಡರ್ ಮಾಡಿದ ನಂತರ ನಮ್ಮ ಬುಚರ್‌ಗಳು ಅದನ್ನು ತಾಜಾವಾಗಿ ಸಿದ್ಧಪಡಿಸುತ್ತಾರೆ, ಅದು 0-4°C ತಂಪಿನಲ್ಲಿ ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ ತಲುಪುತ್ತದೆ. ಪ್ರತ್ಯೇಕ ಕಟ್‌ಗಳ ಜೊತೆಗೆ, ರೆಡಿ-ಟು-ಕುಕ್ ಮ್ಯಾರಿನೇಟೆಡ್ ಪದಾರ್ಥಗಳು, ಫ್ರೋಜನ್ ಸ್ನ್ಯಾಕ್ಸ್, ಕುಟುಂಬಗಳಿಗೆ ಅಥವಾ ಜಿಮ್‌ಗೆ ಹೋಗುವವರಿಗೆ ಕಾಂಬೋ ಪ್ಯಾಕ್‌ಗಳು, ಮತ್ತು ಪುನರಾವರ್ತಿತ ಮೀಟ್ ಸಬ್‌ಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳನ್ನೂ ನಾವು ಮಾರಾಟ ಮಾಡುತ್ತೇವೆ.'
            })}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {whatWeSellItems.map((item) => (
            <div
              key={item}
              className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 font-bold text-[#0A1F12] text-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Trust / Traceability — real facility photo, real facts already
          established elsewhere on the site (batch ID traceability, 0-4°C
          cold chain, heritage Nilgiris farms) rather than a fabricated
          phone/QR-code composite image. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="space-y-5">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{pick(lang, { en: 'Trust Your Protein', ta: 'உங்கள் புரதத்தை நம்புங்கள்', hi: 'अपने प्रोटीन पर भरोसा करें', ml: 'നിങ്ങളുടെ പ്രോട്ടീനിൽ വിശ്വസിക്കുക', te: 'మీ ప్రోటీన్‌ను నమ్మండి', kn: 'ನಿಮ್ಮ ಪ್ರೋಟೀನ್ ಅನ್ನು ನಂಬಿ' })}</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            <span className="text-[#0A1F12]">{pick(lang, { en: 'Know Your Source.', ta: 'உங்கள் மூலத்தை அறியுங்கள்.', hi: 'अपना स्रोत जानें।', ml: 'നിങ്ങളുടെ ഉറവിടം അറിയുക.', te: 'మీ మూలాన్ని తెలుసుకోండి.', kn: 'ನಿಮ್ಮ ಮೂಲವನ್ನು ತಿಳಿಯಿರಿ.' })}</span>
            <br />
            <span className="text-[#D4AF37]">{pick(lang, { en: 'Trust Your Cut.', ta: 'உங்கள் வெட்டை நம்புங்கள்.', hi: 'अपने कट पर भरोसा करें।', ml: 'നിങ്ങളുടെ കട്ട് വിശ്വസിക്കുക.', te: 'మీ కట్‌ను నమ్మండి.', kn: 'ನಿಮ್ಮ ಕಟ್ ಅನ್ನು ನಂಬಿ.' })}</span>
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
            {pick(lang, {
              en: 'Our technology-driven traceability system provides complete farm-to-table transparency. Every pack carries a unique batch ID and QR code that reveals the journey of your meat — from the specific farm to the temperature logs of its delivery.',
              ta: 'எங்கள் தொழில்நுட்ப-இயங்கும் கண்காணிப்பு அமைப்பு பண்ணையிலிருந்து மேசைக்கு முழுமையான வெளிப்படைத்தன்மையை வழங்குகிறது. ஒவ்வொரு பாக்கிலும் ஒரு தனித்துவமான பேட்ச் ஐடி மற்றும் QR குறியீடு உள்ளது, இது உங்கள் இறைச்சியின் பயணத்தை — குறிப்பிட்ட பண்ணையிலிருந்து அதன் டெலிவரியின் வெப்பநிலை பதிவுகள் வரை — வெளிப்படுத்துகிறது.',
              hi: 'हमारा तकनीक-संचालित ट्रेसेबिलिटी सिस्टम फार्म से टेबल तक पूरी पारदर्शिता प्रदान करता है। हर पैक में एक अनोखा बैच आईडी और क्यूआर कोड होता है जो आपके मांस की यात्रा को उजागर करता है — विशिष्ट फार्म से लेकर उसकी डिलीवरी के तापमान लॉग तक।',
              ml: 'ഞങ്ങളുടെ സാങ്കേതികവിദ്യാധിഷ്ഠിത ട്രെയ്സബിലിറ്റി സിസ്റ്റം ഫാം മുതൽ മേശ വരെ പൂർണ്ണ സുതാര്യത നൽകുന്നു. ഓരോ പാക്കിനും ഒരു അതുല്യമായ ബാച്ച് ഐഡിയും ക്യുആർ കോഡും ഉണ്ട്, അത് നിങ്ങളുടെ മാംസത്തിന്റെ യാത്ര — നിർദ്ദിഷ്ട ഫാമിൽ നിന്ന് അതിന്റെ ഡെലിവറിയുടെ താപനില രേഖകൾ വരെ — വെളിപ്പെടുത്തുന്നു.',
              te: 'మా సాంకేతికత ఆధారిత ట్రేసబిలిటీ వ్యవస్థ వ్యవసాయ క్షేత్రం నుండి టేబుల్ వరకు పూర్తి పారదర్శకతను అందిస్తుంది. ప్రతి ప్యాక్‌లో ఒక ప్రత్యేకమైన బ్యాచ్ ఐడీ మరియు క్యూఆర్ కోడ్ ఉంటుంది, ఇది మీ మాంసం ప్రయాణాన్ని — నిర్దిష్ట వ్యవసాయ క్షేత్రం నుండి దాని డెలివరీ ఉష్ణోగ్రత రికార్డుల వరకు — వెల్లడిస్తుంది.',
              kn: 'ನಮ್ಮ ತಂತ್ರಜ್ಞಾನ ಆಧಾರಿತ ಟ್ರೇಸಬಿಲಿಟಿ ವ್ಯವಸ್ಥೆ ಫಾರ್ಮ್‌ನಿಂದ ಮೇಜಿನವರೆಗೆ ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ. ಪ್ರತಿ ಪ್ಯಾಕ್‌ನಲ್ಲಿ ಒಂದು ವಿಶಿಷ್ಟ ಬ್ಯಾಚ್ ಐಡಿ ಮತ್ತು ಕ್ಯೂಆರ್ ಕೋಡ್ ಇರುತ್ತದೆ, ಇದು ನಿಮ್ಮ ಮಾಂಸದ ಪ್ರಯಾಣವನ್ನು — ನಿರ್ದಿಷ್ಟ ಫಾರ್ಮ್‌ನಿಂದ ಅದರ ವಿತರಣೆಯ ತಾಪಮಾನ ದಾಖಲೆಗಳವರೆಗೆ — ಬಹಿರಂಗಪಡಿಸುತ್ತದೆ.'
            })}
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-[#0A1F12] text-sm">{pick(lang, { en: 'Verified Origins', ta: 'சரிபார்க்கப்பட்ட தோற்றங்கள்', hi: 'सत्यापित मूल', ml: 'സ്ഥിരീകരിച്ച ഉറവിടങ്ങൾ', te: 'ధృవీకరించబడిన మూలాలు', kn: 'ಪರಿಶೀಲಿತ ಮೂಲಗಳು' })}</div>
                <p className="text-xs text-neutral-500">{pick(lang, { en: 'Traced back to heritage farms in the Nilgiris range, Tamil Nadu.', ta: 'தமிழ்நாட்டின் நீலகிரி மலைத்தொடரில் உள்ள பாரம்பரிய பண்ணைகளுக்கு கண்டறியப்பட்டது.', hi: 'तमिलनाडु के नीलगिरि पर्वतमाला की पारंपरिक फार्मों तक वापस खोजा गया।', ml: 'തമിഴ്‌നാട്ടിലെ നീലഗിരി മലനിരകളിലെ പൈതൃക ഫാമുകളിലേക്ക് കണ്ടെത്തിയത്.', te: 'తమిళనాడులోని నీలగిరి పర్వత శ్రేణిలోని వారసత్వ వ్యవసాయ క్షేత్రాలకు గుర్తించబడింది.', kn: 'ತಮಿಳುನಾಡಿನ ನೀಲಗಿರಿ ಪರ್ವತ ಶ್ರೇಣಿಯ ಪಾರಂಪರಿಕ ಫಾರ್ಮ್‌ಗಳಿಗೆ ಗುರುತಿಸಲಾಗಿದೆ.' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-bold text-[#0A1F12] text-sm">{pick(lang, { en: 'Cold Chain Transparency', ta: 'குளிர்சாதன சேமிப்பு வெளிப்படைத்தன்மை', hi: 'कोल्ड चेन पारदर्शिता', ml: 'കോൾഡ് ചെയിൻ സുതാര്യത', te: 'కోల్డ్ చైన్ పారదర్శకత', kn: 'ಕೋಲ್ಡ್ ಚೈನ್ ಪಾರದರ್ಶಕತೆ' })}</div>
                <p className="text-xs text-neutral-500">{pick(lang, { en: 'Every batch stays tracked within a 0-4°C window, farm to door.', ta: 'ஒவ்வொரு பேட்சும் பண்ணையிலிருந்து வீடு வரை 0-4°C வரம்பிற்குள் கண்காணிக்கப்படுகிறது.', hi: 'हर बैच फार्म से दरवाज़े तक 0-4°C के दायरे में ट्रैक किया जाता है।', ml: 'ഓരോ ബാച്ചും ഫാമിൽ നിന്ന് വീട്ടിലേക്ക് 0-4°C പരിധിക്കുള്ളിൽ ട്രാക്ക് ചെയ്യപ്പെടുന്നു.', te: 'ప్రతి బ్యాచ్ వ్యవసాయ క్షేత్రం నుండి ఇంటి వరకు 0-4°C పరిధిలో ట్రాక్ చేయబడుతుంది.', kn: 'ಪ್ರತಿ ಬ್ಯಾಚ್ ಫಾರ್ಮ್‌ನಿಂದ ಮನೆ ಬಾಗಿಲಿನವರೆಗೆ 0-4°C ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲ್ಪಡುತ್ತದೆ.' })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-black/20 min-h-[320px]">
          {/* Was pointed at igo-protien-cut.vercel.app, an old, unrelated
              Vercel project that's since been redeployed with a different
              site — the URL now 404s. Recovered the original photo from an
              old deployment of that same project and re-hosted it locally. */}
          <FadeImage
            src="/Images/narrative/facility.jpg"
            alt="IGO cold-chain facility — batch-tracked processing"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12]/85 via-[#0A1F12]/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{pick(lang, { en: 'Interactive Journey', ta: 'ஊடாடும் பயணம்', hi: 'इंटरैक्टिव यात्रा', ml: 'ഇന്ററാക്ടീവ് യാത്ര', te: 'ఇంటరాక్టివ్ ప్రయాణం', kn: 'ಇಂಟರಾಕ್ಟಿವ್ ಪ್ರಯಾಣ' })}</div>
              <div className="text-sm font-black text-white">{pick(lang, { en: '0-4°C Supply Chain Integrity', ta: '0-4°C விநியோக சங்கிலி ஒருமைப்பாடு', hi: '0-4°C आपूर्ति श्रृंखला अखंडता', ml: '0-4°C സപ്ലൈ ചെയിൻ ഇന്റഗ്രിറ്റി', te: '0-4°C సరఫరా గొలుసు సమగ్రత', kn: '0-4°C ಸರಬರಾಜು ಸರಪಳಿ ಸಮಗ್ರತೆ' })}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Real batch lookup — was built but never wired into any page, so the
          "scan your pack" claim above had no actual tool behind it. Backed by
          igo_batch_trace (see supabase/migrations/0019_batch_traceability.sql). */}
      <TraceabilitySection />

      {/* Leadership & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold text-emerald-700 uppercase">{pick(lang, { en: 'QUALITY HYGIENE MANIFESTO', ta: 'தர சுகாதார அறிக்கை', hi: 'गुणवत्ता स्वच्छता घोषणापत्र', ml: 'ഗുണനിലവാര ശുചിത്വ പ്രഖ്യാപനം', te: 'నాణ్యత పరిశుభ్రత ప్రకటన', kn: 'ಗುಣಮಟ್ಟ ನೈರ್ಮಲ್ಯ ಪ್ರಣಾಳಿಕೆ' })}</span>
          <h2 className="text-2xl font-black text-[#0A1F12]">{pick(lang, { en: 'Founder & CEO Message', ta: 'நிறுவனர் & CEO செய்தி', hi: 'संस्थापक और सीईओ का संदेश', ml: 'സ്ഥാപകൻ & സിഇഒ സന്ദേശം', te: 'వ్యవస్థాపకుడు & సీఈఓ సందేశం', kn: 'ಸಂಸ್ಥಾಪಕ & ಸಿಇಒ ಸಂದೇಶ' })}</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {pick(lang, {
              en: '"Meat shouldn\'t sit on open counters exposed to dirt and flies, nor should it be injected with water or steroids. At Protein Cuts, every single cut is dressed under temperature-controlled dark stores, subjected to 150+ lab checkpoints, and delivered in sealed thermal bags."',
              ta: '"இறைச்சி அழுக்கு மற்றும் ஈக்களுக்கு வெளிப்படும் திறந்த கவுண்டர்களில் இருக்கக்கூடாது, தண்ணீர் அல்லது ஸ்டீராய்டுகள் ஏற்றப்படவும் கூடாது. ப்ரோட்டீன் கட்ஸில், ஒவ்வொரு வெட்டும் வெப்பநிலை கட்டுப்படுத்தப்பட்ட இருண்ட கடைகளில் தயார் செய்யப்படுகிறது, 150+ ஆய்வக சோதனைச் சாவடிகளுக்கு உட்படுத்தப்படுகிறது, மற்றும் மூடப்பட்ட தெர்மல் பைகளில் வழங்கப்படுகிறது."',
              hi: '"मांस को धूल और मक्खियों के संपर्क में खुले काउंटर पर नहीं रखा जाना चाहिए, न ही उसमें पानी या स्टेरॉयड इंजेक्ट किया जाना चाहिए। प्रोटीन कट्स में, हर एक कट तापमान-नियंत्रित डार्क स्टोर्स में तैयार किया जाता है, 150+ लैब चेकपॉइंट्स से गुजरता है, और सीलबंद थर्मल बैग में डिलीवर किया जाता है।"',
              ml: '"മാംസം അഴുക്കും ഈച്ചകളും തുറന്നിരിക്കുന്ന കൗണ്ടറുകളിൽ വയ്ക്കരുത്, വെള്ളമോ സ്റ്റിറോയിഡുകളോ കുത്തിവയ്ക്കുകയും അരുത്. പ്രോട്ടീൻ കട്ട്‌സിൽ, ഓരോ കട്ടും താപനില നിയന്ത്രിത ഡാർക്ക് സ്റ്റോറുകളിൽ തയ്യാറാക്കുന്നു, 150+ ലാബ് ചെക്ക്‌പോയിന്റുകൾക്ക് വിധേയമാക്കുന്നു, സീൽ ചെയ്ത തെർമൽ ബാഗുകളിൽ എത്തിക്കുന്നു."',
              te: '"మాంసం ధూళి మరియు ఈగలకు గురయ్యే బహిరంగ కౌంటర్లపై ఉండకూడదు, అలాగే దానిలో నీరు లేదా స్టెరాయిడ్లు ఇంజెక్ట్ చేయకూడదు. ప్రోటీన్ కట్స్‌లో, ప్రతి కట్ ఉష్ణోగ్రత-నియంత్రిత డార్క్ స్టోర్లలో సిద్ధం చేయబడుతుంది, 150+ ల్యాబ్ చెక్‌పాయింట్‌లకు లోబడి ఉంటుంది, మరియు సీల్డ్ థర్మల్ బ్యాగుల్లో డెలివరీ చేయబడుతుంది."',
              kn: '"ಮಾಂಸವನ್ನು ಧೂಳು ಮತ್ತು ನೊಣಗಳಿಗೆ ತೆರೆದಿರುವ ಕೌಂಟರ್‌ಗಳಲ್ಲಿ ಇಡಬಾರದು, ಅದಕ್ಕೆ ನೀರು ಅಥವಾ ಸ್ಟೀರಾಯ್ಡ್‌ಗಳನ್ನು ಇಂಜೆಕ್ಟ್ ಮಾಡಲೂಬಾರದು. ಪ್ರೋಟೀನ್ ಕಟ್ಸ್‌ನಲ್ಲಿ, ಪ್ರತಿಯೊಂದು ಕಟ್ ಅನ್ನು ತಾಪಮಾನ-ನಿಯಂತ್ರಿತ ಡಾರ್ಕ್ ಸ್ಟೋರ್‌ಗಳಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತದೆ, 150+ ಲ್ಯಾಬ್ ಚೆಕ್‌ಪಾಯಿಂಟ್‌ಗಳಿಗೆ ಒಳಪಡಿಸಲಾಗುತ್ತದೆ, ಮತ್ತು ಸೀಲ್ ಮಾಡಿದ ಥರ್ಮಲ್ ಬ್ಯಾಗ್‌ಗಳಲ್ಲಿ ತಲುಪಿಸಲಾಗುತ್ತದೆ."'
            })}
          </p>
          <div className="font-bold text-[#0A1F12] text-sm pt-2">
            {pick(lang, { en: '— IGO Executive Board & Master Butchery Team', ta: '— IGO நிர்வாக குழு & மாஸ்டர் கசாப்பு குழு', hi: '— आईजीओ कार्यकारी बोर्ड और मास्टर बुचरी टीम', ml: '— ഐജിഒ എക്സിക്യൂട്ടീവ് ബോർഡ് & മാസ്റ്റർ ബുച്ചറി ടീം', te: '— ఐజీవో ఎగ్జిక్యూటివ్ బోర్డ్ & మాస్టర్ బుచరీ టీమ్', kn: '— ಐಜಿಒ ಎಕ್ಸಿಕ್ಯೂಟಿವ್ ಬೋರ್ಡ್ & ಮಾಸ್ಟರ್ ಬುಚರಿ ತಂಡ' })}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-[#0A1F12] text-base">{pick(lang, { en: 'Key IGO Certifications', ta: 'முக்கிய IGO சான்றிதழ்கள்', hi: 'प्रमुख आईजीओ प्रमाणपत्र', ml: 'പ്രധാന ഐജിഒ സർട്ടിഫിക്കേഷനുകൾ', te: 'ప్రధాన ఐజీవో సర్టిఫికేషన్‌లు', kn: 'ಪ್ರಮುಖ ಐಜಿಒ ಪ್ರಮಾಣೀಕರಣಗಳು' })}</h3>
          <div className="space-y-3 text-xs text-neutral-600">
            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">{pick(lang, { en: 'FSSAI Certified Unit', ta: 'FSSAI சான்றளிக்கப்பட்ட யூனிட்', hi: 'एफएसएसएआई प्रमाणित इकाई', ml: 'എഫ്എസ്എസ്എഐ സർട്ടിഫൈഡ് യൂണിറ്റ്', te: 'ఎఫ్‌ఎస్‌ఎస్‌ఏఐ సర్టిఫైడ్ యూనిట్', kn: 'ಎಫ್‌ಎಸ್‌ಎಸ್‌ಎಐ ಪ್ರಮಾಣೀಕೃತ ಘಟಕ' })}</strong>
                <span>{pick(lang, { en: 'License No. 10020042001928', ta: 'உரிமம் எண். 10020042001928', hi: 'लाइसेंस संख्या. 10020042001928', ml: 'ലൈസൻസ് നമ്പർ. 10020042001928', te: 'లైసెన్స్ నం. 10020042001928', kn: 'ಲೈಸೆನ್ಸ್ ಸಂಖ್ಯೆ. 10020042001928' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">{pick(lang, { en: '100% Halal & Antibiotic-Free', ta: '100% ஹலால் & ஆன்டிபயாடிக் இல்லாதது', hi: '100% हलाल और एंटीबायोटिक-मुक्त', ml: '100% ഹലാൽ & ആന്റിബയോട്ടിക് രഹിതം', te: '100% హలాల్ & యాంటీబయాటిక్ రహితం', kn: '100% ಹಲಾಲ್ & ಆಂಟಿಬಯಾಟಿಕ್ ಮುಕ್ತ' })}</strong>
                <span>{pick(lang, { en: 'Strict ritual compliance and zero chemical residue guarantees', ta: 'கடுமையான சடங்கு இணக்கம் மற்றும் பூஜ்ஜிய இரசாயன எச்ச உத்தரவாதங்கள்', hi: 'सख्त अनुष्ठान अनुपालन और शून्य रासायनिक अवशेष की गारंटी', ml: 'കർശനമായ ആചാര പാലനവും പൂജ്യം രാസ അവശിഷ്ട ഉറപ്പും', te: 'కఠినమైన సంప్రదాయ అనుసరణ మరియు సున్నా రసాయన అవశేష హామీలు', kn: 'ಕಟ್ಟುನಿಟ್ಟಾದ ಸಂಪ್ರದಾಯ ಪಾಲನೆ ಮತ್ತು ಶೂನ್ಯ ರಾಸಾಯನಿಕ ಅವಶೇಷ ಖಾತರಿಗಳು' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-[#0A1F12] block">{pick(lang, { en: 'ISO 22000 Food Safety Standard', ta: 'ISO 22000 உணவு பாதுகாப்பு தரநிலை', hi: 'आईएसओ 22000 खाद्य सुरक्षा मानक', ml: 'ISO 22000 ഭക്ഷ്യ സുരക്ഷാ നിലവാരം', te: 'ISO 22000 ఆహార భద్రతా ప్రమాణం', kn: 'ISO 22000 ಆಹಾರ ಸುರಕ್ಷತಾ ಮಾನದಂಡ' })}</strong>
                <span>{pick(lang, { en: 'HACCP temperature monitoring from 0°C to 4°C throughout transport', ta: 'போக்குவரத்து முழுவதும் 0°C முதல் 4°C வரை HACCP வெப்பநிலை கண்காணிப்பு', hi: 'परिवहन के दौरान 0°C से 4°C तक HACCP तापमान निगरानी', ml: 'ഗതാഗതത്തിലുടനീളം 0°C മുതൽ 4°C വരെ HACCP താപനില നിരീക്ഷണം', te: 'రవాణా అంతటా 0°C నుండి 4°C వరకు HACCP ఉష్ణోగ్రత పర్యవేక్షణ', kn: 'ಸಾಗಣೆಯ ಉದ್ದಕ್ಕೂ 0°C ನಿಂದ 4°C ವರೆಗೆ HACCP ತಾಪಮಾನ ಮೇಲ್ವಿಚಾರಣೆ' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
