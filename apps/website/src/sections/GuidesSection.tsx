import React, { useState } from 'react';
import { Snowflake, Fish, Flame, BookOpen, X, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang, pick } from '../lib/language';

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

// Hindi/Malayalam/Telugu versions of the same 3 guides, same ids/order/images
// so the modal lookup by id still works — same pattern as guidesTa above.
export const guidesHi: Guide[] = [
  {
    title: 'घर पर ताज़े कट्स को कैसे स्टोर करें',
    excerpt: 'सिर्फ इसलिए कि यह ताज़ा डिलीवर हुआ है इसका मतलब यह नहीं कि यह हमेशा वैसा ही रहेगा — यहाँ बताया गया है कि अपने कट्स की ताज़गी बनाए रखने के लिए उन्हें कैसे स्टोर करें।',
    icon: Snowflake,
    image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    paragraphs: [
      'तुरंत फ्रिज में रखें: डिलीवरी के 20 मिनट के भीतर सीधे फ्रिज (0-4°C) या फ्रीज़र में रखें — इसे कमरे के तापमान पर न रहने दें।',
      '24-48 घंटों के भीतर इस्तेमाल करें: ताज़े, कभी फ्रोज़न न हुए कट्स 1-2 दिनों के भीतर इस्तेमाल करने पर सबसे अच्छा स्वाद देते हैं। अगर आप इतनी जल्दी नहीं पकाएंगे, तो इसे फ्रीज़ कर दें।',
      'सही तरीके से फ्रीज़ करें: एयरटाइट बैग या कंटेनर में कसकर लपेटें, अतिरिक्त हवा निकालें, और तारीख के साथ लेबल लगाएं। अधिकांश कट्स गुणवत्ता खोए बिना 1-3 महीने तक फ्रोज़न रहते हैं।',
      'सुरक्षित रूप से पिघलाएं: हमेशा फ्रिज में रातभर पिघलाएं, काउंटर पर नहीं — इससे बैक्टीरिया की वृद्धि नियंत्रित रहती है।',
      'कच्चे और पके हुए को अलग रखें: कच्चे मांस को फ्रिज की सबसे निचली शेल्फ पर रखें ताकि रस दूसरे खाने पर न टपके, और अलग कटिंग बोर्ड इस्तेमाल करें।'
    ]
  },
  {
    title: 'अंतिम सूखी मछली खरीद गाइड',
    excerpt: 'करुवाडु (धूप में सुखाई गई मछली) पूरे दक्षिण भारत में रसोई की एक ज़रूरी चीज़ है — यहाँ बताया गया है कि अच्छी सूखी मछली को खराब मछली से क्या अलग करता है।',
    icon: Fish,
    image: '/Images/Meat Images/Fish/Anchovy.jpg',
    paragraphs: [
      'देखें, सिर्फ सूंघें नहीं: अच्छी सूखी मछली दृढ़ और थोड़ी चमकदार दिखनी चाहिए, चॉकी या बहुत गहरे रंग की नहीं। तेज़, नमकीन गंध सामान्य है; खट्टी या अमोनिया जैसी गंध का मतलब है कि यह खराब हो गई है।',
      'नमक जांचें: पारंपरिक धूप-सुखाने में नमक को प्राकृतिक परिरक्षक के रूप में इस्तेमाल किया जाता है — हल्की सफेद परत ठीक है, लेकिन अत्यधिक नमक जमाव आमतौर पर खराब सुखाने की स्थिति दर्शाता है।',
      'व्यंजन के हिसाब से किस्म चुनें: एंकोवी (नेथिली) और छोटे झींगे तेज़ स्टिर-फ्राई और चटनी में अच्छे लगते हैं; शार्क या सीर जैसी बड़ी सूखी मछली करी में धीमी आंच पर पकाने के लिए बेहतर होती है।',
      'सही तरीके से स्टोर करें: सूखी मछली को ठंडी, सूखी जगह पर एयरटाइट कंटेनर में रखें — नम मौसम में लंबे शेल्फ लाइफ के लिए रेफ्रिजरेट करें।',
      'पकाने से पहले भिगोएं: गर्म पानी में 10-15 मिनट भिगोने से मछली नरम हो जाती है और पकाने से पहले सतह का अतिरिक्त नमक धुल जाता है।'
    ]
  },
  {
    title: 'मैरिनेटेड चिकन: बेहतरीन नतीजों के लिए पकाने के टिप्स',
    excerpt: 'मैरिनेटेड और पकाने के लिए तैयार होने का मतलब यह नहीं कि यह फुलप्रूफ है — कुछ छोटी आदतें रबड़ जैसे और रेस्टोरेंट-क्वालिटी के बीच फ़र्क़ बनाती हैं।',
    icon: Flame,
    image: '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    paragraphs: [
      'पहले कमरे के तापमान पर लाएं: पकाने से पहले मैरिनेटेड चिकन को 15-20 मिनट बाहर रखें ताकि यह बीच में ठंडा रहने के बजाय समान रूप से पके।',
      'पैन में ज़्यादा न भरें: ज़रूरत पड़ने पर बैचों में पकाएं — ज़्यादा भरने से भाप फंस जाती है और मैरिनेड ठीक से कैरामलाइज़ नहीं हो पाता।',
      'कट के हिसाब से आंच मिलाएं: बोनलेस टुकड़े तेज़ आंच पर जल्दी पकते हैं (चार के लिए बढ़िया); बोन-इन टुकड़ों को मध्यम आंच और लंबे समय की ज़रूरत होती है ताकि बाहर जले बिना अंदर तक पके।',
      'सही तरीके से पकना जांचें: चिकन 74°C (165°F) के आंतरिक तापमान पर सुरक्षित रूप से पकता है — काटकर अंदाज़ा लगाने से बेहतर है मीट थर्मामीटर।',
      'परोसने से पहले आराम दें: पके हुए चिकन को आंच से उतारकर 3-5 मिनट आराम दें ताकि रस प्लेट पर बहने के बजाय फिर से फैल जाए।'
    ]
  }
];

export const guidesMl: Guide[] = [
  {
    title: 'വീട്ടിൽ പുതിയ കട്ടുകൾ എങ്ങനെ സൂക്ഷിക്കാം',
    excerpt: 'പുതുതായി ഡെലിവർ ചെയ്തു എന്നത് കൊണ്ട് അത് എപ്പോഴും അങ്ങനെ തന്നെ ഇരിക്കുമെന്ന് അർത്ഥമില്ല — നിങ്ങളുടെ കട്ടുകളുടെ പുതുമ നിലനിർത്താൻ അവ എങ്ങനെ സൂക്ഷിക്കാം എന്നത് ഇതാ.',
    icon: Snowflake,
    image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    paragraphs: [
      'ഉടൻ ഫ്രിഡ്ജിൽ വയ്ക്കുക: ഡെലിവറി ലഭിച്ച് 20 മിനിറ്റിനുള്ളിൽ നേരിട്ട് ഫ്രിഡ്ജിലേക്ക് (0-4°C) അല്ലെങ്കിൽ ഫ്രീസറിലേക്ക് മാറ്റുക — മുറി താപനിലയിൽ വയ്ക്കരുത്.',
      '24-48 മണിക്കൂറിനുള്ളിൽ ഉപയോഗിക്കുക: പുതിയ, ഒരിക്കലും ഫ്രീസ് ചെയ്യാത്ത കട്ടുകൾ 1-2 ദിവസത്തിനുള്ളിൽ ഉപയോഗിക്കുമ്പോൾ ഏറ്റവും നല്ല രുചി നൽകും. അത്ര വേഗം പാചകം ചെയ്യില്ലെങ്കിൽ, അത് ഫ്രീസ് ചെയ്യുക.',
      'ശരിയായി ഫ്രീസ് ചെയ്യുക: എയർടൈറ്റ് ബാഗിലോ കണ്ടെയ്നറിലോ മുറുകെ പൊതിഞ്ഞ്, അധിക വായു അമർത്തി കളഞ്ഞ്, തീയതി രേഖപ്പെടുത്തുക. മിക്ക കട്ടുകളും ഗുണനിലവാരം നഷ്ടപ്പെടാതെ 1-3 മാസം ഫ്രീസ് ചെയ്ത് സൂക്ഷിക്കാം.',
      'സുരക്ഷിതമായി ഉരുക്കുക: എപ്പോഴും ഫ്രിഡ്ജിൽ രാത്രി മുഴുവൻ ഉരുക്കുക, കൗണ്ടറിൽ അല്ല — ഇത് ബാക്ടീരിയ വളർച്ച നിയന്ത്രിക്കും.',
      'പച്ചയും പാകം ചെയ്തതും വേറെ വയ്ക്കുക: അസംസ്കൃത മാംസം ഫ്രിഡ്ജിന്റെ ഏറ്റവും താഴത്തെ ഷെൽഫിൽ വയ്ക്കുക, അങ്ങനെ ജ്യൂസ് മറ്റ് ഭക്ഷണത്തിലേക്ക് ഇറ്റിറ്റ് വീഴില്ല, കൂടാതെ വേറെ കട്ടിംഗ് ബോർഡുകൾ ഉപയോഗിക്കുക.'
    ]
  },
  {
    title: 'സമ്പൂർണ്ണ ഉണക്കമീൻ വാങ്ങൽ ഗൈഡ്',
    excerpt: 'കരുവാട് (വെയിലിൽ ഉണക്കിയ മീൻ) ദക്ഷിണേന്ത്യയിലുടനീളം അടുക്കളയിലെ ഒരു അവശ്യ വസ്തുവാണ് — നല്ല ഉണക്കമീനിനെ മോശം ഉണക്കമീനിൽ നിന്ന് വേർതിരിക്കുന്നത് എന്താണെന്ന് ഇതാ.',
    icon: Fish,
    image: '/Images/Meat Images/Fish/Anchovy.jpg',
    paragraphs: [
      'നോക്കുക, മണം മാത്രം നോക്കരുത്: നല്ല ഉണക്കമീൻ ഉറപ്പുള്ളതും അല്പം തിളക്കമുള്ളതും ആയിരിക്കണം, ചോക്ക് പോലെയോ അമിതമായി ഇരുണ്ടതോ ആകരുത്. ശക്തമായ ഉപ്പ് മണം സാധാരണമാണ്; പുളിച്ചതോ അമോണിയ പോലുള്ളതോ ആയ മണം അത് കേടായി എന്നാണ് അർത്ഥമാക്കുന്നത്.',
      'ഉപ്പ് പരിശോധിക്കുക: പരമ്പരാഗത വെയിലിൽ ഉണക്കൽ ഉപ്പിനെ പ്രകൃതിദത്ത സംരക്ഷകമായി ഉപയോഗിക്കുന്നു — നേരിയ വെളുത്ത പാട ശരിയാണ്, എന്നാൽ അമിതമായ ഉപ്പ് അടിഞ്ഞുകൂടൽ സാധാരണയായി മോശം ഉണക്കൽ അവസ്ഥയെ സൂചിപ്പിക്കുന്നു.',
      'വിഭവത്തിനനുസരിച്ച് ഇനം തിരഞ്ഞെടുക്കുക: നെത്തിലിയും ചെറിയ ചെമ്മീനും വേഗത്തിലുള്ള വറുവലിനും ചട്നിക്കും നന്നായി യോജിക്കും; സ്രാവ് അല്ലെങ്കിൽ വഞ്ചിരം പോലുള്ള വലിയ ഉണക്കമീൻ കറികളിൽ പതുക്കെ വേവിക്കുന്നതാണ് നല്ലത്.',
      'ശരിയായി സൂക്ഷിക്കുക: ഉണക്കമീൻ തണുത്തതും ഉണങ്ങിയതുമായ സ്ഥലത്ത് എയർടൈറ്റ് കണ്ടെയ്നറിൽ സൂക്ഷിക്കുക — ഈർപ്പമുള്ള കാലാവസ്ഥയിൽ കൂടുതൽ കാലം സൂക്ഷിക്കാൻ ഫ്രിഡ്ജിൽ വയ്ക്കുക.',
      'പാചകത്തിന് മുൻപ് കുതിർക്കുക: ചൂടുവെള്ളത്തിൽ 10-15 മിനിറ്റ് കുതിർക്കുന്നത് മീനിനെ മൃദുവാക്കുകയും പാചകത്തിന് മുൻപ് ഉപരിതലത്തിലെ അധിക ഉപ്പ് കഴുകിക്കളയുകയും ചെയ്യുന്നു.'
    ]
  },
  {
    title: 'മാരിനേറ്റഡ് ചിക്കൻ: മികച്ച ഫലങ്ങൾക്കുള്ള പാചക നുറുങ്ങുകൾ',
    excerpt: 'മാരിനേറ്റ് ചെയ്ത് പാചകത്തിന് തയ്യാറായി എന്നത് കൊണ്ട് അത് പിഴവില്ലാത്തതാണ് എന്ന് അർത്ഥമില്ല — റബ്ബർ പോലെയും റെസ്റ്റോറന്റ്-നിലവാരവും തമ്മിലുള്ള വ്യത്യാസം ഉണ്ടാക്കുന്നത് ചില ചെറിയ ശീലങ്ങളാണ്.',
    icon: Flame,
    image: '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    paragraphs: [
      'ആദ്യം മുറി താപനിലയിലേക്ക് കൊണ്ടുവരിക: പാചകം ചെയ്യുന്നതിന് മുൻപ് മാരിനേറ്റഡ് ചിക്കൻ 15-20 മിനിറ്റ് പുറത്ത് വയ്ക്കുക, അങ്ങനെ നടുവിൽ തണുപ്പായി നിൽക്കാതെ ഒരുപോലെ വേവും.',
      'പാനിൽ അധികം നിറയ്ക്കരുത്: ആവശ്യമെങ്കിൽ ബാച്ചുകളായി പാചകം ചെയ്യുക — അധികം നിറയ്ക്കുന്നത് ആവി കുടുങ്ങാൻ കാരണമാകുകയും മാരിനേഡ് ശരിയായി കാരമലൈസ് ചെയ്യുന്നത് തടയുകയും ചെയ്യും.',
      'കട്ടിനനുസരിച്ച് ചൂട് ക്രമീകരിക്കുക: എല്ലില്ലാത്ത കഷ്ണങ്ങൾ ഉയർന്ന ചൂടിൽ വേഗം വേവും (ചാർ ചെയ്യാൻ മികച്ചത്); എല്ലുള്ള കഷ്ണങ്ങൾക്ക് ഇടത്തരം ചൂടും കൂടുതൽ സമയവും വേണം, അങ്ങനെ പുറത്ത് കരിയാതെ അകത്ത് പൂർണ്ണമായി വേവും.',
      'വേവ് ശരിയായി പരിശോധിക്കുക: ചിക്കൻ 74°C (165°F) ആന്തരിക താപനിലയിൽ സുരക്ഷിതമായി വേവുന്നു — വെട്ടി ഊഹിക്കുന്നതിനേക്കാൾ ഒരു മീറ്റ് തെർമോമീറ്റർ വിശ്വസനീയമാണ്.',
      'വിളമ്പുന്നതിന് മുൻപ് വിശ്രമിക്കാൻ അനുവദിക്കുക: വേവിച്ച ചിക്കൻ ചൂടിൽ നിന്ന് മാറ്റി 3-5 മിനിറ്റ് വിശ്രമിക്കാൻ അനുവദിക്കുക, അങ്ങനെ ജ്യൂസ് പ്ലേറ്റിലേക്ക് ഒഴുകാതെ വീണ്ടും വ്യാപിക്കും.'
    ]
  }
];

export const guidesTe: Guide[] = [
  {
    title: 'ఇంట్లో తాజా కట్స్‌ను ఎలా నిల్వ చేయాలి',
    excerpt: 'తాజాగా డెలివరీ చేయబడింది కాబట్టి అది ఎప్పుడూ అలాగే ఉంటుందని కాదు — మీ కట్స్ తాజాదనాన్ని కాపాడుకోవడానికి వాటిని ఎలా నిల్వ చేయాలో ఇక్కడ ఉంది.',
    icon: Snowflake,
    image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    paragraphs: [
      'వెంటనే రిఫ్రిజిరేటర్‌లో పెట్టండి: డెలివరీ వచ్చిన 20 నిమిషాల్లోపు నేరుగా ఫ్రిజ్‌లో (0-4°C) లేదా ఫ్రీజర్‌లో పెట్టండి — గది ఉష్ణోగ్రత వద్ద ఉంచవద్దు.',
      '24-48 గంటల్లోపు వాడండి: తాజా, ఎప్పుడూ ఫ్రీజ్ చేయని కట్స్ 1-2 రోజుల్లో వాడితే రుచిగా ఉంటాయి. అంత త్వరగా వండకపోతే, దానిని ఫ్రీజ్ చేయండి.',
      'సరిగ్గా ఫ్రీజ్ చేయండి: గాలి చొరబడని బ్యాగ్ లేదా కంటైనర్‌లో గట్టిగా చుట్టి, అదనపు గాలిని నొక్కి తీసి, తేదీతో లేబుల్ చేయండి. చాలా కట్స్ నాణ్యత కోల్పోకుండా 1-3 నెలలు ఫ్రీజ్‌లో బాగుంటాయి.',
      'సురక్షితంగా కరిగించండి: ఎల్లప్పుడూ రాత్రంతా ఫ్రిజ్‌లో కరిగించండి, కౌంటర్‌పై కాదు — ఇది బ్యాక్టీరియా పెరుగుదలను అదుపులో ఉంచుతుంది.',
      'పచ్చి మరియు వండినవి వేరుగా ఉంచండి: పచ్చి మాంసాన్ని ఫ్రిజ్‌లో అత్యంత దిగువ షెల్ఫ్‌లో ఉంచండి, తద్వారా రసం ఇతర ఆహారంపై చుక్కలు పడదు, మరియు వేర్వేరు కటింగ్ బోర్డులను వాడండి.'
    ]
  },
  {
    title: 'అంతిమ ఎండు చేప కొనుగోలు గైడ్',
    excerpt: 'కరువాడు (ఎండలో ఎండబెట్టిన చేప) దక్షిణ భారతదేశం అంతటా వంటగదిలో ఒక అవసరమైన వస్తువు — మంచి ఎండు చేపను చెడు దాని నుండి నిజంగా వేరు చేసేది ఏమిటో ఇక్కడ ఉంది.',
    icon: Fish,
    image: '/Images/Meat Images/Fish/Anchovy.jpg',
    paragraphs: [
      'చూడండి, వాసన మాత్రమే చూడకండి: మంచి ఎండు చేప గట్టిగా, కొద్దిగా మెరుస్తూ కనిపించాలి, సుద్దలా లేదా అతిగా నల్లగా ఉండకూడదు. బలమైన, ఉప్పు వాసన సాధారణమే; పుల్లని లేదా అమోనియా వంటి వాసన అంటే అది చెడిపోయిందని అర్థం.',
      'ఉప్పును తనిఖీ చేయండి: సాంప్రదాయ ఎండలో ఎండబెట్టడంలో ఉప్పును సహజ సంరక్షకంగా వాడతారు — తేలికపాటి తెల్లని పొర పరవాలేదు, కానీ అధిక ఉప్పు పేరుకుపోవడం సాధారణంగా సరిగా ఎండబెట్టని పరిస్థితిని సూచిస్తుంది.',
      'వంటకాన్ని బట్టి రకాన్ని ఎంచుకోండి: నెత్తిలి (అంచోవీ) మరియు చిన్న రొయ్యలు త్వరిత వేపుడు మరియు చట్నీలకు బాగా సరిపోతాయి; సొరచేప లేదా సీర్ వంటి పెద్ద ఎండు చేపలు కూరల్లో నెమ్మదిగా వండటానికి మంచివి.',
      'సరిగ్గా నిల్వ చేయండి: ఎండు చేపను చల్లని, పొడి ప్రదేశంలో గాలి చొరబడని కంటైనర్‌లో ఉంచండి — తేమ వాతావరణంలో ఎక్కువ కాలం నిల్వ ఉండాలంటే ఫ్రిజ్‌లో ఉంచండి.',
      'వండే ముందు నానబెట్టండి: వెచ్చని నీటిలో 10-15 నిమిషాలు నానబెట్టడం చేపను మృదువుగా చేసి, వండే ముందు ఉపరితలంపై ఉన్న అదనపు ఉప్పును కడిగివేస్తుంది.'
    ]
  },
  {
    title: 'మెరినేటెడ్ చికెన్: పరిపూర్ణ ఫలితాల కోసం వంట చిట్కాలు',
    excerpt: 'మెరినేట్ చేసి వండటానికి సిద్ధంగా ఉండటం అంటే తప్పు జరగదని కాదు — రబ్బరులా అనిపించడానికి, రెస్టారెంట్-నాణ్యతకు మధ్య తేడాను కొన్ని చిన్న అలవాట్లు నిర్ణయిస్తాయి.',
    icon: Flame,
    image: '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    paragraphs: [
      'మొదట గది ఉష్ణోగ్రతకు తీసుకురండి: వండే ముందు మెరినేటెడ్ చికెన్‌ను 15-20 నిమిషాలు బయట ఉంచండి, తద్వారా మధ్యలో చల్లగా ఉండకుండా సమానంగా ఉడుకుతుంది.',
      'పాన్‌లో అధికంగా నింపవద్దు: అవసరమైతే బ్యాచ్‌లలో వండండి — అధికంగా నింపడం ఆవిరిని బంధించి మెరినేడ్ సరిగ్గా కారమలైజ్ కాకుండా ఆపుతుంది.',
      'కట్‌కు తగినట్టు వేడిని సర్దుబాటు చేయండి: ఎముక లేని ముక్కలు అధిక వేడిలో త్వరగా ఉడుకుతాయి (చార్ చేయడానికి బాగుంటుంది); ఎముకతో కూడిన ముక్కలకు మధ్యస్థ వేడి మరియు ఎక్కువ సమయం అవసరం, తద్వారా బయట కాలిపోకుండా లోపల పూర్తిగా ఉడుకుతుంది.',
      'సరిగ్గా ఉడికిందో లేదో తనిఖీ చేయండి: చికెన్ 74°C (165°F) అంతర్గత ఉష్ణోగ్రత వద్ద సురక్షితంగా ఉడుకుతుంది — కోసి ఊహించడం కంటే మీట్ థర్మామీటర్ నమ్మదగినది.',
      'వడ్డించే ముందు విశ్రాంతి ఇవ్వండి: ఉడికిన చికెన్‌ను వేడి నుండి తీసి 3-5 నిమిషాలు విశ్రాంతి ఇవ్వండి, తద్వారా రసం ప్లేట్‌పైకి పారకుండా మళ్లీ వ్యాపిస్తుంది.'
    ]
  }
];

export const guidesKn: Guide[] = [
  {
    title: 'ಮನೆಯಲ್ಲಿ ತಾಜಾ ಕಟ್ಸ್ ಅನ್ನು ಹೇಗೆ ಸಂಗ್ರಹಿಸುವುದು',
    excerpt: 'ತಾಜಾವಾಗಿ ಡೆಲಿವರಿ ಆಗಿದೆ ಎಂದ ಮಾತ್ರಕ್ಕೆ ಅದು ಯಾವಾಗಲೂ ಹಾಗೆಯೇ ಇರುತ್ತದೆ ಎಂದಲ್ಲ — ನಿಮ್ಮ ಕಟ್ಸ್‌ನ ತಾಜಾತನವನ್ನು ಕಾಪಾಡಲು ಅವುಗಳನ್ನು ಹೇಗೆ ಸಂಗ್ರಹಿಸಬೇಕು ಎಂಬುದು ಇಲ್ಲಿದೆ.',
    icon: Snowflake,
    image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    paragraphs: [
      'ತಕ್ಷಣ ಫ್ರಿಡ್ಜ್‌ಗೆ ಸೇರಿಸಿ: ಡೆಲಿವರಿ ಬಂದ 20 ನಿಮಿಷಗಳ ಒಳಗೆ ನೇರವಾಗಿ ಫ್ರಿಡ್ಜ್‌ಗೆ (0-4°C) ಅಥವಾ ಫ್ರೀಜರ್‌ಗೆ ಹಾಕಿ — ಕೊಠಡಿಯ ಉಷ್ಣತೆಯಲ್ಲಿ ಬಿಡಬೇಡಿ.',
      '24-48 ಗಂಟೆಗಳ ಒಳಗೆ ಬಳಸಿ: ತಾಜಾ, ಎಂದಿಗೂ ಫ್ರೀಜ್ ಆಗದ ಕಟ್ಸ್ 1-2 ದಿನಗಳ ಒಳಗೆ ಬಳಸಿದರೆ ಅತ್ಯುತ್ತಮ ರುಚಿ ಸಿಗುತ್ತದೆ. ಅಷ್ಟು ಬೇಗ ಅಡುಗೆ ಮಾಡದಿದ್ದರೆ, ಅದನ್ನು ಫ್ರೀಜ್ ಮಾಡಿ.',
      'ಸರಿಯಾಗಿ ಫ್ರೀಜ್ ಮಾಡಿ: ಗಾಳಿ ಆಡದ ಚೀಲ ಅಥವಾ ಪಾತ್ರೆಯಲ್ಲಿ ಬಿಗಿಯಾಗಿ ಸುತ್ತಿ, ಹೆಚ್ಚುವರಿ ಗಾಳಿಯನ್ನು ಒತ್ತಿ ತೆಗೆದು, ದಿನಾಂಕದೊಂದಿಗೆ ಲೇಬಲ್ ಮಾಡಿ. ಹೆಚ್ಚಿನ ಕಟ್ಸ್ ಗುಣಮಟ್ಟ ಕಳೆದುಕೊಳ್ಳದೆ 1-3 ತಿಂಗಳು ಫ್ರೀಜ್‌ನಲ್ಲಿ ಚೆನ್ನಾಗಿರುತ್ತವೆ.',
      'ಸುರಕ್ಷಿತವಾಗಿ ಕರಗಿಸಿ: ಯಾವಾಗಲೂ ರಾತ್ರಿಯಿಡೀ ಫ್ರಿಡ್ಜ್‌ನಲ್ಲಿ ಕರಗಿಸಿ, ಕೌಂಟರ್‌ನಲ್ಲಿ ಅಲ್ಲ — ಇದು ಬ್ಯಾಕ್ಟೀರಿಯಾ ಬೆಳವಣಿಗೆಯನ್ನು ನಿಯಂತ್ರಣದಲ್ಲಿಡುತ್ತದೆ.',
      'ಕಚ್ಚಾ ಮತ್ತು ಬೇಯಿಸಿದ್ದನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿಡಿ: ಕಚ್ಚಾ ಮಾಂಸವನ್ನು ಫ್ರಿಡ್ಜ್‌ನ ಅತ್ಯಂತ ಕೆಳಗಿನ ಶೆಲ್ಫ್‌ನಲ್ಲಿಡಿ, ಇದರಿಂದ ರಸ ಇತರ ಆಹಾರದ ಮೇಲೆ ತೊಟ್ಟಿಕ್ಕುವುದಿಲ್ಲ, ಮತ್ತು ಪ್ರತ್ಯೇಕ ಕಟಿಂಗ್ ಬೋರ್ಡ್‌ಗಳನ್ನು ಬಳಸಿ.'
    ]
  },
  {
    title: 'ಪರಿಪೂರ್ಣ ಒಣ ಮೀನು ಖರೀದಿ ಮಾರ್ಗದರ್ಶಿ',
    excerpt: 'ಕರುವಾಡು (ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿದ ಮೀನು) ದಕ್ಷಿಣ ಭಾರತದಾದ್ಯಂತ ಅಡುಗೆಮನೆಯ ಅಗತ್ಯ ವಸ್ತು — ಒಳ್ಳೆಯ ಒಣ ಮೀನನ್ನು ಕೆಟ್ಟದರಿಂದ ನಿಜವಾಗಿ ಬೇರ್ಪಡಿಸುವುದು ಏನು ಎಂಬುದು ಇಲ್ಲಿದೆ.',
    icon: Fish,
    image: '/Images/Meat Images/Fish/Anchovy.jpg',
    paragraphs: [
      'ನೋಡಿ, ಕೇವಲ ವಾಸನೆ ನೋಡಬೇಡಿ: ಒಳ್ಳೆಯ ಒಣ ಮೀನು ಗಟ್ಟಿಯಾಗಿ ಮತ್ತು ಸ್ವಲ್ಪ ಹೊಳಪಾಗಿ ಕಾಣಬೇಕು, ಸುಣ್ಣದಂತೆ ಅಥವಾ ಅತಿಯಾಗಿ ಕಪ್ಪಾಗಿರಬಾರದು. ಬಲವಾದ, ಉಪ್ಪಿನ ವಾಸನೆ ಸಾಮಾನ್ಯ; ಹುಳಿ ಅಥವಾ ಅಮೋನಿಯದಂತಹ ವಾಸನೆ ಎಂದರೆ ಅದು ಕೆಟ್ಟುಹೋಗಿದೆ ಎಂದರ್ಥ.',
      'ಉಪ್ಪನ್ನು ಪರಿಶೀಲಿಸಿ: ಸಾಂಪ್ರದಾಯಿಕ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸುವಿಕೆ ಉಪ್ಪನ್ನು ನೈಸರ್ಗಿಕ ಸಂರಕ್ಷಕವಾಗಿ ಬಳಸುತ್ತದೆ — ಹಗುರವಾದ ಬಿಳಿ ಪದರ ಸರಿ, ಆದರೆ ಅತಿಯಾದ ಉಪ್ಪಿನ ಶೇಖರಣೆ ಸಾಮಾನ್ಯವಾಗಿ ಸರಿಯಾಗಿ ಒಣಗಿಸದ ಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.',
      'ಖಾದ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ವಿಧವನ್ನು ಆರಿಸಿ: ನೆತ್ತಿಲಿ (ಆಂಚೊವಿ) ಮತ್ತು ಸಣ್ಣ ಸೀಗಡಿಗಳು ಬೇಗನೆ ಫ್ರೈ ಮಾಡಲು ಮತ್ತು ಚಟ್ನಿಗಳಿಗೆ ಚೆನ್ನಾಗಿ ಹೊಂದುತ್ತವೆ; ಶಾರ್ಕ್ ಅಥವಾ ಸೀರ್‌ನಂತಹ ದೊಡ್ಡ ಒಣ ಮೀನುಗಳು ಸಾರುಗಳಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬೇಯಿಸಲು ಉತ್ತಮ.',
      'ಸರಿಯಾಗಿ ಸಂಗ್ರಹಿಸಿ: ಒಣ ಮೀನನ್ನು ತಂಪಾದ, ಒಣ ಸ್ಥಳದಲ್ಲಿ ಗಾಳಿ ಆಡದ ಪಾತ್ರೆಯಲ್ಲಿಡಿ — ತೇವಾಂಶದ ಹವಾಮಾನದಲ್ಲಿ ಹೆಚ್ಚು ಕಾಲ ಬಾಳಿಕೆಗಾಗಿ ಫ್ರಿಡ್ಜ್‌ನಲ್ಲಿಡಿ.',
      'ಅಡುಗೆಗೆ ಮುನ್ನ ನೆನೆಸಿ: ಬಿಸಿನೀರಿನಲ್ಲಿ 10-15 ನಿಮಿಷ ನೆನೆಸುವುದು ಮೀನನ್ನು ಮೃದುಗೊಳಿಸುತ್ತದೆ ಮತ್ತು ಅಡುಗೆಗೆ ಮುನ್ನ ಮೇಲ್ಮೈಯ ಹೆಚ್ಚುವರಿ ಉಪ್ಪನ್ನು ತೊಳೆಯುತ್ತದೆ.'
    ]
  },
  {
    title: 'ಮ್ಯಾರಿನೇಟೆಡ್ ಚಿಕನ್: ಪರಿಪೂರ್ಣ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ ಅಡುಗೆ ಸಲಹೆಗಳು',
    excerpt: 'ಮ್ಯಾರಿನೇಟ್ ಮಾಡಿ ಅಡುಗೆಗೆ ಸಿದ್ಧವಾಗಿದೆ ಎಂದ ಮಾತ್ರಕ್ಕೆ ಅದು ತಪ್ಪಿಲ್ಲದೆಂದಲ್ಲ — ರಬ್ಬರಿನಂತಾಗುವುದು ಮತ್ತು ರೆಸ್ಟೋರೆಂಟ್-ಗುಣಮಟ್ಟದ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ಕೆಲವು ಸಣ್ಣ ಅಭ್ಯಾಸಗಳೇ ಸೃಷ್ಟಿಸುತ್ತವೆ.',
    icon: Flame,
    image: '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    paragraphs: [
      'ಮೊದಲು ಕೊಠಡಿಯ ಉಷ್ಣತೆಗೆ ತನ್ನಿ: ಅಡುಗೆ ಮಾಡುವ ಮೊದಲು ಮ್ಯಾರಿನೇಟೆಡ್ ಚಿಕನ್ ಅನ್ನು 15-20 ನಿಮಿಷ ಹೊರಗೆ ಇಡಿ, ಇದರಿಂದ ಮಧ್ಯದಲ್ಲಿ ತಣ್ಣಗಿರದೆ ಸಮನಾಗಿ ಬೇಯುತ್ತದೆ.',
      'ಪ್ಯಾನ್‌ನಲ್ಲಿ ಹೆಚ್ಚು ತುಂಬಬೇಡಿ: ಅಗತ್ಯವಿದ್ದರೆ ಬ್ಯಾಚ್‌ಗಳಲ್ಲಿ ಬೇಯಿಸಿ — ಹೆಚ್ಚು ತುಂಬುವುದು ಆವಿಯನ್ನು ಸಿಕ್ಕಿಸಿ ಮ್ಯಾರಿನೇಡ್ ಸರಿಯಾಗಿ ಕ್ಯಾರಮಲೈಸ್ ಆಗದಂತೆ ತಡೆಯುತ್ತದೆ.',
      'ಕಟ್‌ಗೆ ತಕ್ಕಂತೆ ಶಾಖವನ್ನು ಹೊಂದಿಸಿ: ಎಲುಬಿಲ್ಲದ ತುಂಡುಗಳು ಹೆಚ್ಚಿನ ಶಾಖದಲ್ಲಿ ಬೇಗ ಬೇಯುತ್ತವೆ (ಚಾರ್ ಮಾಡಲು ಉತ್ತಮ); ಎಲುಬಿನೊಂದಿಗಿನ ತುಂಡುಗಳಿಗೆ ಮಧ್ಯಮ ಶಾಖ ಮತ್ತು ಹೆಚ್ಚಿನ ಸಮಯ ಬೇಕು, ಇದರಿಂದ ಹೊರಗೆ ಸುಡದೆ ಒಳಗೆ ಪೂರ್ತಿಯಾಗಿ ಬೇಯುತ್ತದೆ.',
      'ಸರಿಯಾಗಿ ಬೆಂದಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ: ಚಿಕನ್ 74°C (165°F) ಒಳಗಿನ ಉಷ್ಣತೆಯಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಬೇಯುತ್ತದೆ — ಕತ್ತರಿಸಿ ಊಹಿಸುವುದಕ್ಕಿಂತ ಮೀಟ್ ಥರ್ಮಾಮೀಟರ್ ಹೆಚ್ಚು ವಿಶ್ವಾಸಾರ್ಹ.',
      'ಬಡಿಸುವ ಮೊದಲು ವಿಶ್ರಾಂತಿ ನೀಡಿ: ಬೆಂದ ಚಿಕನ್ ಅನ್ನು ಶಾಖದಿಂದ ತೆಗೆದು 3-5 ನಿಮಿಷ ವಿಶ್ರಾಂತಿ ನೀಡಿ, ಇದರಿಂದ ರಸ ತಟ್ಟೆಗೆ ಹರಿಯದೆ ಮತ್ತೆ ಹರಡುತ್ತದೆ.'
    ]
  }
];

const GUIDES_FALLBACK_HI: { eyebrow: string; heading: string; items: CmsGuideItem[] } = {
  eyebrow: 'किचन गाइड',
  heading: 'सही तरीके से पकाएं',
  items: guidesHi.map((g, i) => ({
    id: `guide-0${i + 1}`,
    title: g.title,
    excerpt: g.excerpt,
    image: g.image
  }))
};

const GUIDES_FALLBACK_ML: { eyebrow: string; heading: string; items: CmsGuideItem[] } = {
  eyebrow: 'അടുക്കള ഗൈഡുകൾ',
  heading: 'ശരിയായി പാചകം ചെയ്യുക',
  items: guidesMl.map((g, i) => ({
    id: `guide-0${i + 1}`,
    title: g.title,
    excerpt: g.excerpt,
    image: g.image
  }))
};

const GUIDES_FALLBACK_TE: { eyebrow: string; heading: string; items: CmsGuideItem[] } = {
  eyebrow: 'వంటగది గైడ్‌లు',
  heading: 'సరిగ్గా వండండి',
  items: guidesTe.map((g, i) => ({
    id: `guide-0${i + 1}`,
    title: g.title,
    excerpt: g.excerpt,
    image: g.image
  }))
};

const GUIDES_FALLBACK_KN: { eyebrow: string; heading: string; items: CmsGuideItem[] } = {
  eyebrow: 'ಅಡುಗೆಮನೆ ಮಾರ್ಗದರ್ಶಿಗಳು',
  heading: 'ಸರಿಯಾಗಿ ಅಡುಗೆ ಮಾಡಿ',
  items: guidesKn.map((g, i) => ({
    id: `guide-0${i + 1}`,
    title: g.title,
    excerpt: g.excerpt,
    image: g.image
  }))
};

const GUIDE_DETAILS_BY_ID_HI: Record<string, Guide> = Object.fromEntries(
  guidesHi.map((g, i) => [`guide-0${i + 1}`, g])
);
const GUIDE_DETAILS_BY_ID_ML: Record<string, Guide> = Object.fromEntries(
  guidesMl.map((g, i) => [`guide-0${i + 1}`, g])
);
const GUIDE_DETAILS_BY_ID_TE: Record<string, Guide> = Object.fromEntries(
  guidesTe.map((g, i) => [`guide-0${i + 1}`, g])
);
const GUIDE_DETAILS_BY_ID_KN: Record<string, Guide> = Object.fromEntries(
  guidesKn.map((g, i) => [`guide-0${i + 1}`, g])
);

export const GuidesSection: React.FC = () => {
  const { lang } = useLang();
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);

  const block = useSiteContent('plans.guides', GUIDES_FALLBACK);
  const resolvedDetailsById =
    lang === 'ta' ? GUIDE_DETAILS_BY_ID_TA : lang === 'hi' ? GUIDE_DETAILS_BY_ID_HI : lang === 'ml' ? GUIDE_DETAILS_BY_ID_ML : lang === 'te' ? GUIDE_DETAILS_BY_ID_TE : lang === 'kn' ? GUIDE_DETAILS_BY_ID_KN : GUIDE_DETAILS_BY_ID;
  const resolvedGuides = lang === 'ta' ? guidesTa : lang === 'hi' ? guidesHi : lang === 'ml' ? guidesMl : lang === 'te' ? guidesTe : lang === 'kn' ? guidesKn : guides;
  // In non-English languages, always show the local fallback rather than
  // whatever the CMS block resolved to — the CMS only ever stores English
  // text (no per-language field), so trusting it here silently mixed English
  // guide titles into an otherwise-translated page. English keeps reading
  // straight from the CMS block as before, so admin edits still show up.
  const items: CmsGuideItem[] =
    lang === 'ta' ? GUIDES_FALLBACK_TA.items : lang === 'hi' ? GUIDES_FALLBACK_HI.items : lang === 'ml' ? GUIDES_FALLBACK_ML.items : lang === 'te' ? GUIDES_FALLBACK_TE.items : lang === 'kn' ? GUIDES_FALLBACK_KN.items : block.items;
  const resolvedHeadingBlock =
    lang === 'ta' ? GUIDES_FALLBACK_TA : lang === 'hi' ? GUIDES_FALLBACK_HI : lang === 'ml' ? GUIDES_FALLBACK_ML : lang === 'te' ? GUIDES_FALLBACK_TE : lang === 'kn' ? GUIDES_FALLBACK_KN : block;

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
                  {pick(lang, { en: 'Read Guide', ta: 'வழிகாட்டியைப் படிக்க', hi: 'गाइड पढ़ें', ml: 'ഗൈഡ് വായിക്കുക', te: 'గైడ్ చదవండి', kn: 'ಗೈಡ್ ಓದಿ' })} <ArrowRight className="w-3.5 h-3.5" />
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
