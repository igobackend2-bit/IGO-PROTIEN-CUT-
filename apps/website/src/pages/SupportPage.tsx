import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  HelpCircle,
  RotateCcw,
  PhoneCall,
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { FAQItem, SupportTicket, Order } from '../types';
import { SupabaseService } from '../lib/supabaseClient';
import { StoreService } from '../lib/storage';
import { useLang, pick } from '../lib/language';

interface SupportPageProps {
  onNavigate: (path: string) => void;
}

const FAQ_CATEGORIES_TA: Record<string, string> = {
  All: 'அனைத்தும்',
  'Quality & Sourcing': 'தரம் & மூலம்',
  Delivery: 'டெலிவரி',
  Subscriptions: 'சந்தாக்கள்',
  'Refunds & Returns': 'பணத்திரும்பம் & திரும்பப் பெறுதல்',
  'Payment & Orders': 'கட்டணம் & ஆர்டர்கள்'
};

const FAQ_CATEGORIES_HI: Record<string, string> = {
  All: 'सभी',
  'Quality & Sourcing': 'गुणवत्ता और स्रोत',
  Delivery: 'डिलीवरी',
  Subscriptions: 'सदस्यता',
  'Refunds & Returns': 'रिफंड और रिटर्न',
  'Payment & Orders': 'भुगतान और ऑर्डर'
};

const FAQ_CATEGORIES_ML: Record<string, string> = {
  All: 'എല്ലാം',
  'Quality & Sourcing': 'ഗുണനിലവാരവും സ്രോതസ്സും',
  Delivery: 'ഡെലിവറി',
  Subscriptions: 'സബ്സ്ക്രിപ്ഷനുകൾ',
  'Refunds & Returns': 'റീഫണ്ടും റിട്ടേണും',
  'Payment & Orders': 'പേയ്മെന്റും ഓർഡറുകളും'
};

const FAQ_CATEGORIES_TE: Record<string, string> = {
  All: 'అన్నీ',
  'Quality & Sourcing': 'నాణ్యత & సోర్సింగ్',
  Delivery: 'డెలివరీ',
  Subscriptions: 'సబ్‌స్క్రిప్షన్లు',
  'Refunds & Returns': 'రీఫండ్‌లు & రిటర్న్‌లు',
  'Payment & Orders': 'చెల్లింపు & ఆర్డర్‌లు'
};

const FAQ_CATEGORIES_KN: Record<string, string> = {
  All: 'ಎಲ್ಲಾ',
  'Quality & Sourcing': 'ಗುಣಮಟ್ಟ & ಮೂಲ',
  Delivery: 'ಡೆಲಿವರಿ',
  Subscriptions: 'ಚಂದಾದಾರಿಕೆಗಳು',
  'Refunds & Returns': 'ಮರುಪಾವತಿ & ಹಿಂತಿರುಗಿಸುವಿಕೆ',
  'Payment & Orders': 'ಪಾವತಿ & ಆರ್ಡರ್‌ಗಳು'
};

const RETURN_REASONS_TA: Record<string, string> = {
  'Temperature deviation (Above 4°C)': 'வெப்பநிலை மாறுபாடு (4°C க்கு மேல்)',
  'Pack seal damaged in transit': 'போக்குவரத்தில் பேக் சீல் சேதமடைந்தது',
  'Cut precision issue (Not matching boneless/pieces)': 'வெட்டு துல்லிய பிரச்சனை (எலும்பில்லா/துண்டுகள் பொருந்தவில்லை)',
  'Weight discrepancy': 'எடை முரண்பாடு',
  Other: 'மற்றவை'
};

const RETURN_REASONS_HI: Record<string, string> = {
  'Temperature deviation (Above 4°C)': 'तापमान विचलन (4°C से अधिक)',
  'Pack seal damaged in transit': 'परिवहन के दौरान पैक सील क्षतिग्रस्त',
  'Cut precision issue (Not matching boneless/pieces)': 'कटिंग सटीकता समस्या (बोनलेस/टुकड़े मेल नहीं खाते)',
  'Weight discrepancy': 'वजन में अंतर',
  Other: 'अन्य'
};

const RETURN_REASONS_ML: Record<string, string> = {
  'Temperature deviation (Above 4°C)': 'താപനില വ്യതിയാനം (4°C-ന് മുകളിൽ)',
  'Pack seal damaged in transit': 'ഗതാഗതത്തിനിടെ പായ്ക്ക് സീൽ കേടായി',
  'Cut precision issue (Not matching boneless/pieces)': 'കട്ട് കൃത്യതയിലെ പ്രശ്നം (എല്ലില്ലാത്ത/കഷണങ്ങൾ പൊരുത്തപ്പെടുന്നില്ല)',
  'Weight discrepancy': 'ഭാരത്തിലെ പൊരുത്തക്കേട്',
  Other: 'മറ്റുള്ളവ'
};

const RETURN_REASONS_TE: Record<string, string> = {
  'Temperature deviation (Above 4°C)': 'ఉష్ణోగ్రత వ్యత్యాసం (4°C కంటే ఎక్కువ)',
  'Pack seal damaged in transit': 'రవాణాలో ప్యాక్ సీల్ దెబ్బతింది',
  'Cut precision issue (Not matching boneless/pieces)': 'కట్ ఖచ్చితత్వ సమస్య (ఎముక లేని/ముక్కలు సరిపోలడం లేదు)',
  'Weight discrepancy': 'బరువు వ్యత్యాసం',
  Other: 'ఇతరం'
};

const RETURN_REASONS_KN: Record<string, string> = {
  'Temperature deviation (Above 4°C)': 'ತಾಪಮಾನ ವ್ಯತ್ಯಾಸ (4°C ಗಿಂತ ಹೆಚ್ಚು)',
  'Pack seal damaged in transit': 'ಸಾಗಣೆಯ ಸಮಯದಲ್ಲಿ ಪ್ಯಾಕ್ ಸೀಲ್ ಹಾನಿಗೊಂಡಿದೆ',
  'Cut precision issue (Not matching boneless/pieces)': 'ಕಟ್ ನಿಖರತೆ ಸಮಸ್ಯೆ (ಎಲುಬು ಇಲ್ಲದ/ತುಂಡುಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ)',
  'Weight discrepancy': 'ತೂಕದ ವ್ಯತ್ಯಾಸ',
  Other: 'ಇತರೆ'
};

// The 7 seeded FAQs (INITIAL_FAQS in mockData.ts) are website-owned local
// mock data, not a live Supabase table — SupabaseService.getFAQs() just
// caches them to localStorage. Safe to translate via an id-keyed lookup,
// same pattern used for the mock recipes/subscription plans elsewhere.
const FAQ_TA: Record<string, { question: string; answer: string }> = {
  'faq-1': {
    question: 'டெலிவரியின் போது 0-4°C புத்துணர்ச்சியை எப்படி உறுதிசெய்கிறீர்கள்?',
    answer: 'எங்கள் அனைத்து இறைச்சியும் 2°C இல் இயங்கும் வெப்பநிலை கட்டுப்படுத்தப்பட்ட இருண்ட கடைகளில் வெட்டப்படுகிறது. பாக்கேஜ்கள் தெர்மல் டெலிவரி பைகளுக்குள் உணவு-தர ஜெல் ஐஸ் பேட்களால் இன்சுலேட் செய்யப்பட்டு, ஒப்படைக்கும் வரை கண்டிப்பாக 0-4°C ஐ பராமரிக்கின்றன.'
  },
  'faq-2': {
    question: 'உங்கள் கோழிகள் ஆன்டிபயாடிக் மற்றும் இரசாயனம் இல்லாதவையா?',
    answer: 'ஆம்! நாங்கள் சான்றளிக்கப்பட்ட உயிர்பாதுகாப்பு பண்ணைகளுடன் மட்டும் கூட்டு சேர்கிறோம். பறவைகள் எந்த ஆன்டிபயாடிக் வளர்ச்சி ஊக்குவிப்பான்கள், ஸ்டீராய்டுகள் அல்லது செயற்கை ஹார்மோன்கள் இல்லாமல் இயற்கை தானிய உணவில் வளர்க்கப்படுகின்றன.'
  },
  'faq-3': {
    question: 'எக்ஸ்பிரஸ் 30-90 நிமிட டெலிவரி என்றால் என்ன?',
    answer: '4கிமீ சுற்றளவில் உள்ள இருண்ட கடைகளில் இருந்து இயங்கும் எங்கள் ஹைப்பர்-லோக்கல் டெலிவரி சேவை எக்ஸ்பிரஸ் 30-90 நிமிடம். உங்கள் பின்கோட் தகுதியுடையதாக இருந்தால், கசாப்புக்காரர் பேக்கிங் செய்த உடனேயே உங்கள் ஆர்டர் அனுப்பப்படும்.'
  },
  'faq-4': {
    question: 'ப்ரோட்டீன் கட்ஸ் சந்தா எப்படி வேலை செய்கிறது?',
    answer: 'உங்களுக்கு விருப்பமான கட்கள், அதிர்வெண் (தினசரி, வாராந்திரம், மாதாந்திரம்) மற்றும் விருப்பமான டெலிவரி நேரத்தைத் தேர்ந்தெடுக்கவும். நீங்கள் தானியங்கு பூஜ்ஜிய-டெலிவரி-கட்டண காலை டெலிவரிகளைப் பெறுவீர்கள், மேலும் எப்போது வேண்டுமானாலும் இடைநிறுத்தலாம் அல்லது ரத்து செய்யலாம்.'
  },
  'faq-5': {
    question: 'சேதமடைந்த பேக்கேஜிங்குடன் ஒரு பொருள் கிடைத்தால் என்ன செய்வது?',
    answer: 'டெலிவரி ஆன 2 மணி நேரத்திற்குள் நீங்கள் ஒரு புகைப்பட டிக்கெட்டை எழுப்பினால், நாங்கள் உடனடி 100% மாற்று அல்லது உங்கள் IGO வாலெட்டுக்கு முழு பணத்திரும்பத்தை வழங்குகிறோம்.'
  },
  'faq-6': {
    question: 'ஹலால் இறைச்சி கிடைக்குமா?',
    answer: 'ஆம். IGO ப்ரோட்டீன் கட்ஸ் எங்கள் ஆன்டிபயாடிக் இல்லாத மூல தரநிலையுடன் 100% ஹலால் சான்றளிக்கப்பட்டுள்ளது — எங்கள் முழு சான்றிதழ்களையும் About பக்கத்தில் பார்க்கவும்.'
  },
  'faq-7': {
    question: 'நீங்கள் எந்த கட்டண முறைகளை ஏற்கிறீர்கள்?',
    answer: 'UPI, கிரெடிட்/டெபிட் கார்டு, IGO வாலெட் மற்றும் டெலிவரியின் போது பணம் — செக்அவுட்டில் நீங்கள் விரும்பியதைத் தேர்ந்தெடுக்கவும்.'
  }
};

const FAQ_HI: Record<string, { question: string; answer: string }> = {
  'faq-1': {
    question: 'डिलीवरी के दौरान आप 0-4°C ताज़गी कैसे सुनिश्चित करते हैं?',
    answer: 'हमारा सारा मांस 2°C पर तापमान-नियंत्रित डार्क स्टोर में काटा जाता है। पैकेजों को थर्मल डिलीवरी बैग के अंदर फूड-ग्रेड जेल आइस पैक से इंसुलेट किया जाता है, जो सौंपे जाने तक सख्ती से 0-4°C बनाए रखते हैं।'
  },
  'faq-2': {
    question: 'क्या आपकी मुर्गियाँ एंटीबायोटिक और रसायन मुक्त हैं?',
    answer: 'हाँ! हम केवल प्रमाणित बायोसिक्योर फार्मों के साथ साझेदारी करते हैं। पक्षियों को बिना किसी एंटीबायोटिक ग्रोथ प्रमोटर, स्टेरॉयड या सिंथेटिक हार्मोन के प्राकृतिक अनाज आहार पर पाला जाता है।'
  },
  'faq-3': {
    question: 'एक्सप्रेस 30-90 मिनट डिलीवरी क्या है?',
    answer: '4 किमी के दायरे में डार्क स्टोर से संचालित हमारी हाइपर-लोकल डिलीवरी सेवा एक्सप्रेस 30-90 मिनट है। यदि आपका पिनकोड योग्य है, तो कसाई द्वारा पैकिंग पूरी होते ही आपका ऑर्डर भेज दिया जाता है।'
  },
  'faq-4': {
    question: 'प्रोटीन कट्स सदस्यता कैसे काम करती है?',
    answer: 'अपनी पसंदीदा कट्स, आवृत्ति (दैनिक, साप्ताहिक, मासिक) और पसंदीदा डिलीवरी समय चुनें। आपको स्वचालित रूप से शून्य-डिलीवरी-शुल्क सुबह की डिलीवरी मिलती है, और आप कभी भी रोक या रद्द कर सकते हैं।'
  },
  'faq-5': {
    question: 'अगर मुझे क्षतिग्रस्त पैकेजिंग वाला आइटम मिले तो क्या करूं?',
    answer: 'यदि आप डिलीवरी के 2 घंटे के भीतर फोटो टिकट उठाते हैं, तो हम तुरंत 100% प्रतिस्थापन या आपके IGO वॉलेट में पूरा रिफंड प्रदान करते हैं।'
  },
  'faq-6': {
    question: 'क्या हलाल मांस उपलब्ध है?',
    answer: 'हाँ। IGO प्रोटीन कट्स हमारे एंटीबायोटिक-मुक्त सोर्सिंग मानक के साथ-साथ 100% हलाल प्रमाणित है — About पेज पर हमारे सभी प्रमाणपत्र देखें।'
  },
  'faq-7': {
    question: 'आप कौन से भुगतान तरीके स्वीकार करते हैं?',
    answer: 'UPI, क्रेडिट/डेबिट कार्ड, IGO वॉलेट और डिलीवरी पर नकद — चेकआउट पर जो चाहें चुनें।'
  }
};

const FAQ_ML: Record<string, { question: string; answer: string }> = {
  'faq-1': {
    question: 'ഡെലിവറി സമയത്ത് 0-4°C പുതുമ എങ്ങനെ ഉറപ്പാക്കുന്നു?',
    answer: 'ഞങ്ങളുടെ എല്ലാ മാംസവും 2°C-ൽ പ്രവർത്തിക്കുന്ന താപനില നിയന്ത്രിത ഡാർക്ക് സ്റ്റോറുകളിൽ മുറിക്കുന്നു. തെർമൽ ഡെലിവറി ബാഗുകൾക്കുള്ളിൽ ഭക്ഷ്യയോഗ്യമായ ജെൽ ഐസ് പായ്ക്കുകൾ ഉപയോഗിച്ച് പാക്കേജുകൾ ഇൻസുലേറ്റ് ചെയ്യുന്നു, ഇത് കൈമാറുന്നത് വരെ കർശനമായി 0-4°C നിലനിർത്തുന്നു.'
  },
  'faq-2': {
    question: 'നിങ്ങളുടെ കോഴികൾ ആന്റിബയോട്ടിക്, രാസവസ്തു രഹിതമാണോ?',
    answer: 'അതെ! ഞങ്ങൾ സർട്ടിഫൈഡ് ബയോസെക്യൂർ ഫാമുകളുമായി മാത്രമേ പങ്കാളിത്തം വഹിക്കൂ. ആന്റിബയോട്ടിക് ഗ്രോത്ത് പ്രമോട്ടറുകളോ സ്റ്റിറോയിഡുകളോ കൃത്രിമ ഹോർമോണുകളോ ഇല്ലാതെ പ്രകൃതിദത്ത ധാന്യാഹാരത്തിലാണ് പക്ഷികളെ വളർത്തുന്നത്.'
  },
  'faq-3': {
    question: 'എക്സ്പ്രസ് 30-90 മിനിറ്റ് ഡെലിവറി എന്താണ്?',
    answer: '4 കിലോമീറ്റർ ചുറ്റളവിലുള്ള ഡാർക്ക് സ്റ്റോറുകളിൽ നിന്ന് പ്രവർത്തിക്കുന്ന ഞങ്ങളുടെ ഹൈപ്പർ-ലോക്കൽ ഡെലിവറി സേവനമാണ് എക്സ്പ്രസ് 30-90 മിനിറ്റ്. നിങ്ങളുടെ പിൻകോഡ് യോഗ്യമാണെങ്കിൽ, ബുച്ചർ പാക്കിംഗ് പൂർത്തിയാക്കിയ ഉടൻ നിങ്ങളുടെ ഓർഡർ അയക്കും.'
  },
  'faq-4': {
    question: 'പ്രോട്ടീൻ കട്സ് സബ്സ്ക്രിപ്ഷൻ എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
    answer: 'നിങ്ങൾക്ക് ഇഷ്ടമുള്ള കട്ടുകൾ, ആവൃത്തി (ദിവസേന, പ്രതിവാരം, പ്രതിമാസം) കൂടാതെ ഇഷ്ടമുള്ള ഡെലിവറി സമയവും തിരഞ്ഞെടുക്കുക. നിങ്ങൾക്ക് സ്വയമേവ സീറോ-ഡെലിവറി-ഫീ രാവിലെ ഡെലിവറികൾ ലഭിക്കും, എപ്പോൾ വേണമെങ്കിലും താൽക്കാലികമായി നിർത്താനോ റദ്ദാക്കാനോ കഴിയും.'
  },
  'faq-5': {
    question: 'കേടായ പാക്കേജിംഗുള്ള ഒരു ഇനം ലഭിച്ചാൽ എന്ത് ചെയ്യണം?',
    answer: 'ഡെലിവറി കഴിഞ്ഞ് 2 മണിക്കൂറിനുള്ളിൽ നിങ്ങൾ ഒരു ഫോട്ടോ ടിക്കറ്റ് ഉയർത്തിയാൽ, ഞങ്ങൾ ഉടനടി 100% മാറ്റിസ്ഥാപിക്കൽ അല്ലെങ്കിൽ നിങ്ങളുടെ IGO വാലറ്റിലേക്ക് പൂർണ്ണ റീഫണ്ട് നൽകുന്നു.'
  },
  'faq-6': {
    question: 'ഹലാൽ മാംസം ലഭ്യമാണോ?',
    answer: 'അതെ. ഞങ്ങളുടെ ആന്റിബയോട്ടിക് രഹിത സോഴ്സിംഗ് നിലവാരത്തോടൊപ്പം IGO പ്രോട്ടീൻ കട്സ് 100% ഹലാൽ സർട്ടിഫൈഡ് ആണ് — ഞങ്ങളുടെ എല്ലാ സർട്ടിഫിക്കറ്റുകളും About പേജിൽ കാണുക.'
  },
  'faq-7': {
    question: 'നിങ്ങൾ ഏതെല്ലാം പേയ്മെന്റ് രീതികൾ സ്വീകരിക്കുന്നു?',
    answer: 'UPI, ക്രെഡിറ്റ്/ഡെബിറ്റ് കാർഡ്, IGO വാലറ്റ്, ഡെലിവറിക്ക് ശേഷം പണം — ചെക്ക്ഔട്ടിൽ നിങ്ങൾക്ക് ഇഷ്ടമുള്ളത് തിരഞ്ഞെടുക്കുക.'
  }
};

const FAQ_TE: Record<string, { question: string; answer: string }> = {
  'faq-1': {
    question: 'డెలివరీ సమయంలో 0-4°C తాజాదనాన్ని మీరు ఎలా నిర్ధారిస్తారు?',
    answer: 'మా మాంసం మొత్తం 2°C వద్ద పనిచేసే ఉష్ణోగ్రత-నియంత్రిత డార్క్ స్టోర్లలో కట్ చేయబడుతుంది. ప్యాకేజీలు థర్మల్ డెలివరీ బ్యాగుల లోపల ఫుడ్-గ్రేడ్ జెల్ ఐస్ ప్యాక్‌లతో ఇన్సులేట్ చేయబడతాయి, ఇవి అందజేసే వరకు కచ్చితంగా 0-4°C ఉంచుతాయి.'
  },
  'faq-2': {
    question: 'మీ కోళ్లు యాంటీబయాటిక్ మరియు రసాయన రహితమా?',
    answer: 'అవును! మేము సర్టిఫైడ్ బయోసెక్యూర్ ఫారాలతో మాత్రమే భాగస్వామ్యం కలిగి ఉంటాము. పక్షులను యాంటీబయాటిక్ గ్రోత్ ప్రమోటర్లు, స్టెరాయిడ్లు లేదా సింథటిక్ హార్మోన్లు లేకుండా సహజ ధాన్యాహారంతో పెంచుతారు.'
  },
  'faq-3': {
    question: 'ఎక్స్‌ప్రెస్ 30-90 నిమిషాల డెలివరీ అంటే ఏమిటి?',
    answer: '4 కి.మీ పరిధిలోని డార్క్ స్టోర్ల నుండి పనిచేసే మా హైపర్-లోకల్ డెలివరీ సేవ ఎక్స్‌ప్రెస్ 30-90 నిమిషాలు. మీ పిన్‌కోడ్ అర్హత కలిగి ఉంటే, బుచర్ ప్యాకింగ్ పూర్తి చేసిన వెంటనే మీ ఆర్డర్ పంపబడుతుంది.'
  },
  'faq-4': {
    question: 'ప్రోటీన్ కట్స్ సబ్‌స్క్రిప్షన్ ఎలా పనిచేస్తుంది?',
    answer: 'మీకు నచ్చిన కట్‌లు, ఫ్రీక్వెన్సీ (రోజువారీ, వారానికోసారి, నెలవారీ) మరియు ఇష్టమైన డెలివరీ సమయాన్ని ఎంచుకోండి. మీకు స్వయంచాలకంగా జీరో-డెలివరీ-ఫీ ఉదయం డెలివరీలు లభిస్తాయి, ఎప్పుడైనా పాజ్ చేయవచ్చు లేదా రద్దు చేయవచ్చు.'
  },
  'faq-5': {
    question: 'దెబ్బతిన్న ప్యాకేజింగ్‌తో ఒక వస్తువు వస్తే ఏం చేయాలి?',
    answer: 'డెలివరీ అయిన 2 గంటల్లోపు మీరు ఫోటో టికెట్ లేవనెత్తితే, మేము తక్షణమే 100% రీప్లేస్‌మెంట్ లేదా మీ IGO వాలెట్‌కు పూర్తి రీఫండ్ అందిస్తాము.'
  },
  'faq-6': {
    question: 'హలాల్ మాంసం అందుబాటులో ఉందా?',
    answer: 'అవును. మా యాంటీబయాటిక్-రహిత సోర్సింగ్ ప్రమాణంతో పాటు IGO ప్రోటీన్ కట్స్ 100% హలాల్ సర్టిఫైడ్ — మా పూర్తి సర్టిఫికేట్లను About పేజీలో చూడండి.'
  },
  'faq-7': {
    question: 'మీరు ఏ చెల్లింపు పద్ధతులను అంగీకరిస్తారు?',
    answer: 'UPI, క్రెడిట్/డెబిట్ కార్డ్, IGO వాలెట్ మరియు డెలివరీ సమయంలో నగదు — చెక్అవుట్‌లో మీకు నచ్చినది ఎంచుకోండి.'
  }
};

const FAQ_KN: Record<string, { question: string; answer: string }> = {
  'faq-1': {
    question: 'ಡೆಲಿವರಿ ಸಮಯದಲ್ಲಿ 0-4°C ತಾಜಾತನವನ್ನು ನೀವು ಹೇಗೆ ಖಚಿತಪಡಿಸುತ್ತೀರಿ?',
    answer: 'ನಮ್ಮ ಎಲ್ಲಾ ಮಾಂಸವನ್ನು 2°C ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ತಾಪಮಾನ-ನಿಯಂತ್ರಿತ ಡಾರ್ಕ್ ಸ್ಟೋರ್‌ಗಳಲ್ಲಿ ಕತ್ತರಿಸಲಾಗುತ್ತದೆ. ಪ್ಯಾಕೇಜ್‌ಗಳನ್ನು ಥರ್ಮಲ್ ಡೆಲಿವರಿ ಬ್ಯಾಗ್‌ಗಳ ಒಳಗೆ ಆಹಾರ-ದರ್ಜೆಯ ಜೆಲ್ ಐಸ್ ಪ್ಯಾಕ್‌ಗಳಿಂದ ಇನ್ಸುಲೇಟ್ ಮಾಡಲಾಗುತ್ತದೆ, ಇವು ಹಸ್ತಾಂತರಿಸುವವರೆಗೆ ಕಟ್ಟುನಿಟ್ಟಾಗಿ 0-4°C ಅನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತವೆ.'
  },
  'faq-2': {
    question: 'ನಿಮ್ಮ ಕೋಳಿಗಳು ಆಂಟಿಬಯಾಟಿಕ್ ಮತ್ತು ರಾಸಾಯನಿಕ ಮುಕ್ತವೇ?',
    answer: 'ಹೌದು! ನಾವು ಪ್ರಮಾಣೀಕೃತ ಬಯೋಸೆಕ್ಯೂರ್ ಫಾರ್ಮ್‌ಗಳೊಂದಿಗೆ ಮಾತ್ರ ಪಾಲುದಾರಿಕೆ ಹೊಂದಿದ್ದೇವೆ. ಪಕ್ಷಿಗಳನ್ನು ಯಾವುದೇ ಆಂಟಿಬಯಾಟಿಕ್ ಬೆಳವಣಿಗೆ ಉತ್ತೇಜಕಗಳು, ಸ್ಟೀರಾಯ್ಡ್‌ಗಳು ಅಥವಾ ಕೃತಕ ಹಾರ್ಮೋನ್‌ಗಳಿಲ್ಲದೆ ನೈಸರ್ಗಿಕ ಧಾನ್ಯ ಆಹಾರದಲ್ಲಿ ಬೆಳೆಸಲಾಗುತ್ತದೆ.'
  },
  'faq-3': {
    question: 'ಎಕ್ಸ್‌ಪ್ರೆಸ್ 30-90 ನಿಮಿಷ ಡೆಲಿವರಿ ಎಂದರೇನು?',
    answer: '4 ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ ಡಾರ್ಕ್ ಸ್ಟೋರ್‌ಗಳಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ನಮ್ಮ ಹೈಪರ್-ಲೋಕಲ್ ಡೆಲಿವರಿ ಸೇವೆಯೇ ಎಕ್ಸ್‌ಪ್ರೆಸ್ 30-90 ನಿಮಿಷ. ನಿಮ್ಮ ಪಿನ್‌ಕೋಡ್ ಅರ್ಹವಾಗಿದ್ದರೆ, ಬುಚರ್ ಪ್ಯಾಕಿಂಗ್ ಮುಗಿಸಿದ ತಕ್ಷಣ ನಿಮ್ಮ ಆರ್ಡರ್ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.'
  },
  'faq-4': {
    question: 'ಪ್ರೋಟೀನ್ ಕಟ್ಸ್ ಚಂದಾದಾರಿಕೆ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?',
    answer: 'ನಿಮಗೆ ಇಷ್ಟವಾದ ಕಟ್‌ಗಳು, ಆವರ್ತನ (ದೈನಂದಿನ, ವಾರಕ್ಕೊಮ್ಮೆ, ತಿಂಗಳಿಗೊಮ್ಮೆ) ಮತ್ತು ಇಷ್ಟದ ಡೆಲಿವರಿ ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನಿಮಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಶೂನ್ಯ-ಡೆಲಿವರಿ-ಶುಲ್ಕ ಬೆಳಗಿನ ಡೆಲಿವರಿಗಳು ಸಿಗುತ್ತವೆ, ಮತ್ತು ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ವಿರಾಮಗೊಳಿಸಬಹುದು ಅಥವಾ ರದ್ದುಗೊಳಿಸಬಹುದು.'
  },
  'faq-5': {
    question: 'ಹಾನಿಗೊಂಡ ಪ್ಯಾಕೇಜಿಂಗ್‌ನೊಂದಿಗೆ ಒಂದು ವಸ್ತು ಬಂದರೆ ಏನು ಮಾಡಬೇಕು?',
    answer: 'ಡೆಲಿವರಿಯಾದ 2 ಗಂಟೆಗಳ ಒಳಗೆ ನೀವು ಫೋಟೋ ಟಿಕೆಟ್ ಎತ್ತಿದರೆ, ನಾವು ತಕ್ಷಣ 100% ಬದಲಿ ಅಥವಾ ನಿಮ್ಮ IGO ವಾಲೆಟ್‌ಗೆ ಪೂರ್ಣ ಮರುಪಾವತಿಯನ್ನು ನೀಡುತ್ತೇವೆ.'
  },
  'faq-6': {
    question: 'ಹಲಾಲ್ ಮಾಂಸ ಲಭ್ಯವಿದೆಯೇ?',
    answer: 'ಹೌದು. IGO ಪ್ರೋಟೀನ್ ಕಟ್ಸ್ ನಮ್ಮ ಆಂಟಿಬಯಾಟಿಕ್ ಮುಕ್ತ ಸೋರ್ಸಿಂಗ್ ಗುಣಮಟ್ಟದೊಂದಿಗೆ 100% ಹಲಾಲ್ ಪ್ರಮಾಣೀಕೃತವಾಗಿದೆ — ನಮ್ಮ ಎಲ್ಲಾ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು About ಪುಟದಲ್ಲಿ ನೋಡಿ.'
  },
  'faq-7': {
    question: 'ನೀವು ಯಾವ ಪಾವತಿ ವಿಧಾನಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ?',
    answer: 'UPI, ಕ್ರೆಡಿಟ್/ಡೆಬಿಟ್ ಕಾರ್ಡ್, IGO ವಾಲೆಟ್ ಮತ್ತು ಡೆಲಿವರಿ ಸಮಯದಲ್ಲಿ ನಗದು — ಚೆಕ್‌ಔಟ್‌ನಲ್ಲಿ ನಿಮಗೆ ಇಷ್ಟವಾದುದನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
  }
};

const TICKET_CATEGORIES_TA: Record<string, string> = {
  'Quality Concern': 'தர கவலை',
  'Delivery Delay': 'டெலிவரி தாமதம்',
  'Billing & Refund': 'பில்லிங் & பணத்திரும்பம்',
  'Subscription Modification': 'சந்தா மாற்றம்',
  'General Inquiry': 'பொது விசாரணை'
};

const TICKET_CATEGORIES_HI: Record<string, string> = {
  'Quality Concern': 'गुणवत्ता संबंधी चिंता',
  'Delivery Delay': 'डिलीवरी में देरी',
  'Billing & Refund': 'बिलिंग और रिफंड',
  'Subscription Modification': 'सदस्यता में बदलाव',
  'General Inquiry': 'सामान्य पूछताछ'
};

const TICKET_CATEGORIES_ML: Record<string, string> = {
  'Quality Concern': 'ഗുണനിലവാര ആശങ്ക',
  'Delivery Delay': 'ഡെലിവറി കാലതാമസം',
  'Billing & Refund': 'ബില്ലിംഗും റീഫണ്ടും',
  'Subscription Modification': 'സബ്സ്ക്രിപ്ഷൻ മാറ്റം',
  'General Inquiry': 'പൊതു അന്വേഷണം'
};

const TICKET_CATEGORIES_TE: Record<string, string> = {
  'Quality Concern': 'నాణ్యత సమస్య',
  'Delivery Delay': 'డెలివరీ ఆలస్యం',
  'Billing & Refund': 'బిల్లింగ్ & రీఫండ్',
  'Subscription Modification': 'సబ్‌స్క్రిప్షన్ మార్పు',
  'General Inquiry': 'సాధారణ విచారణ'
};

const TICKET_CATEGORIES_KN: Record<string, string> = {
  'Quality Concern': 'ಗುಣಮಟ್ಟದ ಕಾಳಜಿ',
  'Delivery Delay': 'ಡೆಲಿವರಿ ವಿಳಂಬ',
  'Billing & Refund': 'ಬಿಲ್ಲಿಂಗ್ & ಮರುಪಾವತಿ',
  'Subscription Modification': 'ಚಂದಾದಾರಿಕೆ ಮಾರ್ಪಾಡು',
  'General Inquiry': 'ಸಾಮಾನ್ಯ ವಿಚಾರಣೆ'
};

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<'faqs' | 'tickets' | 'return'>('faqs');
  const [faqs, setFaqs] = useState<FAQItem[]>(() => SupabaseService.getFAQs());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => SupabaseService.getTickets());
  const [orders] = useState<Order[]>(() => StoreService.getOrders());

  // FAQ state
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Ticket detail / Chat state
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  // New ticket form
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<SupportTicket['category']>('Quality Concern');
  const [newTicketOrderId, setNewTicketOrderId] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  // Return request form
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('Quality issue / Temperature deviation');
  const [returnComments, setReturnComments] = useState('');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(SupabaseService.getTickets());
    };
    window.addEventListener('protein_cuts_tickets_updated', handleUpdate);
    return () => window.removeEventListener('protein_cuts_tickets_updated', handleUpdate);
  }, []);

  const handleVoteFAQ = (id: string, isHelpful: boolean) => {
    const updated = SupabaseService.voteFAQ(id, isHelpful);
    setFaqs(updated);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMessage) return;

    const created = SupabaseService.createTicket(
      {
        subject: newTicketSubject,
        category: newTicketCategory,
        orderId: newTicketOrderId || undefined,
        priority: 'High'
      },
      newTicketMessage
    );

    setTickets(SupabaseService.getTickets());
    setActiveTicket(created);
    setShowCreateTicketModal(false);
    setNewTicketSubject('');
    setNewTicketMessage('');
    setActiveTab('tickets');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !chatMessageInput.trim()) return;

    SupabaseService.addMessageToTicket(activeTicket.id, 'Customer', chatMessageInput, 'user');
    setChatMessageInput('');

    // Reload active ticket
    const updatedTickets = SupabaseService.getTickets();
    setTickets(updatedTickets);
    const found = updatedTickets.find((t) => t.id === activeTicket.id);
    if (found) setActiveTicket(found);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId) return;

    SupabaseService.submitReturnRequest({
      orderId: returnOrderId,
      reason: returnReason,
      itemNames: ['Fresh Chicken Cut', 'Cold Chain Sealed Pack'],
      comments: returnComments,
      refundAmount: 399
    });

    setReturnSuccessMsg(
      pick(lang, {
        en: 'Your return request has been lodged! Our quality manager will inspect the batch records and process immediate store credit or bank refund.',
        ta: 'உங்கள் திரும்பப் பெறும் கோரிக்கை பதிவு செய்யப்பட்டது! எங்கள் தர மேலாளர் பேட்ச் பதிவுகளை ஆய்வு செய்து உடனடி ஸ்டோர் கிரெடிட் அல்லது வங்கி பணத்திரும்பத்தை செயல்படுத்துவார்.',
        hi: 'आपका रिटर्न अनुरोध दर्ज कर लिया गया है! हमारा गुणवत्ता प्रबंधक बैच रिकॉर्ड की जांच करेगा और तुरंत स्टोर क्रेडिट या बैंक रिफंड प्रोसेस करेगा।',
        ml: 'നിങ്ങളുടെ റിട്ടേൺ അഭ്യർത്ഥന രജിസ്റ്റർ ചെയ്തു! ഞങ്ങളുടെ ക്വാളിറ്റി മാനേജർ ബാച്ച് രേഖകൾ പരിശോധിച്ച് ഉടനടി സ്റ്റോർ ക്രെഡിറ്റ് അല്ലെങ്കിൽ ബാങ്ക് റീഫണ്ട് നടപ്പിലാക്കും.',
        te: 'మీ రిటర్న్ అభ్యర్థన నమోదు చేయబడింది! మా క్వాలిటీ మేనేజర్ బ్యాచ్ రికార్డులను పరిశీలించి తక్షణమే స్టోర్ క్రెడిట్ లేదా బ్యాంక్ రీఫండ్ ప్రాసెస్ చేస్తారు.',
        kn: 'ನಿಮ್ಮ ರಿಟರ್ನ್ ವಿನಂತಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ! ನಮ್ಮ ಕ್ವಾಲಿಟಿ ಮ್ಯಾನೇಜರ್ ಬ್ಯಾಚ್ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ತಕ್ಷಣ ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ಮರುಪಾವತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತಾರೆ.'
      })
    );
    setTimeout(() => {
      setReturnSuccessMsg(null);
      setReturnOrderId('');
      setReturnComments('');
    }, 4000);
  };

  const filteredFaqs = faqs.filter((f) => {
    if (faqCategory !== 'All' && f.category !== faqCategory) return false;
    if (faqSearch.trim()) {
      const q = faqSearch.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {pick(lang, { en: '24/7 FRESH QUALITY HELPDESK', ta: '24/7 புதிய தர உதவி மையம்', hi: '24/7 ताज़ा गुणवत्ता हेल्पडेस्क', ml: '24/7 ഫ്രഷ് ക്വാളിറ്റി ഹെൽപ്ഡെസ്ക്', te: '24/7 ఫ్రెష్ క్వాలిటీ హెల్ప్‌డెస్క్', kn: '24/7 ಫ್ರೆಶ್ ಕ್ವಾಲಿಟಿ ಹೆಲ್ಪ್‌ಡೆಸ್ಕ್' })}
          </div>
          <h1 className="text-3xl font-black tracking-tight">{pick(lang, { en: 'How Can We Help You Today?', ta: 'இன்று உங்களுக்கு எப்படி உதவ முடியும்?', hi: 'आज हम आपकी कैसे मदद कर सकते हैं?', ml: 'ഇന്ന് ഞങ്ങൾക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?', te: 'ఈరోజు మేము మీకు ఎలా సహాయపడగలం?', kn: 'ಇಂದು ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?' })}</h1>
          <p className="text-xs text-neutral-300">
            {pick(lang, {
              en: 'Dedicated resolution for temperature logs, order delays, refund claims, and preparation tips.',
              ta: 'வெப்பநிலை பதிவுகள், ஆர்டர் தாமதங்கள், பணத்திரும்ப கோரிக்கைகள் மற்றும் தயாரிப்பு குறிப்புகளுக்கான அர்ப்பணிக்கப்பட்ட தீர்வு.',
              hi: 'तापमान लॉग, ऑर्डर में देरी, रिफंड दावों और तैयारी संबंधी सुझावों के लिए समर्पित समाधान।',
              ml: 'താപനില ലോഗുകൾ, ഓർഡർ കാലതാമസങ്ങൾ, റീഫണ്ട് ക്ലെയിമുകൾ, തയ്യാറാക്കൽ നുറുങ്ങുകൾ എന്നിവയ്ക്കുള്ള സമർപ്പിത പരിഹാരം.',
              te: 'ఉష్ణోగ్రత లాగ్‌లు, ఆర్డర్ ఆలస్యాలు, రీఫండ్ క్లెయిమ్‌లు మరియు తయారీ చిట్కాల కోసం ప్రత్యేక పరిష్కారం.',
              kn: 'ತಾಪಮಾನ ಲಾಗ್‌ಗಳು, ಆರ್ಡರ್ ವಿಳಂಬಗಳು, ಮರುಪಾವತಿ ಕ್ಲೈಮ್‌ಗಳು ಮತ್ತು ತಯಾರಿಕೆಯ ಸಲಹೆಗಳಿಗಾಗಿ ಸಮರ್ಪಿತ ಪರಿಹಾರ.'
            })}
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0">
          <div className="p-3 rounded-xl bg-[#0F7B3A] text-white">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 uppercase font-bold">{pick(lang, { en: 'Toll-Free Helpline', ta: 'கட்டணமில்லா உதவி எண்', hi: 'टोल-फ्री हेल्पलाइन', ml: 'ടോൾ-ഫ്രീ ഹെൽപ്ലൈൻ', te: 'టోల్-ఫ్రీ హెల్ప్‌లైన్', kn: 'ಟೋಲ್-ಫ್ರೀ ಹೆಲ್ಪ್‌ಲೈನ್' })}</div>
            <div className="text-lg font-black text-white">1800-446-446</div>
            <div className="text-[10px] text-neutral-300">{pick(lang, { en: 'Mon-Sun 06:00 AM - 11:00 PM', ta: 'திங்கள்-ஞாயிறு காலை 06:00 - இரவு 11:00', hi: 'सोम-रवि सुबह 06:00 - रात 11:00', ml: 'തിങ്കൾ-ഞായർ രാവിലെ 06:00 - രാത്രി 11:00', te: 'సోమ-ఆది ఉదయం 06:00 - రాత్రి 11:00', kn: 'ಸೋಮ-ಭಾನುವಾರ ಬೆಳಿಗ್ಗೆ 06:00 - ರಾತ್ರಿ 11:00' })}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'faqs' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> {pick(lang, { en: 'FAQs & Knowledge Base', ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள் & அறிவுத் தளம்', hi: 'सामान्य प्रश्न और नॉलेज बेस', ml: 'പതിവുചോദ്യങ്ങളും വിജ്ഞാനകേന്ദ്രവും', te: 'తరచుగా అడిగే ప్రశ్నలు & నాలెడ్జ్ బేస్', kn: 'ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು & ಜ್ಞಾನ ಮೂಲ' })}
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'tickets' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> {pick(lang, {
            en: `Live Support Chat & Tickets (${tickets.length})`,
            ta: `நேரடி ஆதரவு அரட்டை & டிக்கெட்டுகள் (${tickets.length})`,
            hi: `लाइव सपोर्ट चैट और टिकट (${tickets.length})`,
            ml: `തത്സമയ പിന്തുണ ചാറ്റും ടിക്കറ്റുകളും (${tickets.length})`,
            te: `లైవ్ సపోర్ట్ చాట్ & టికెట్లు (${tickets.length})`,
            kn: `ಲೈವ್ ಸಪೋರ್ಟ್ ಚಾಟ್ & ಟಿಕೆಟ್‌ಗಳು (${tickets.length})`
          })}
        </button>

        <button
          onClick={() => setActiveTab('return')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'return' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> {pick(lang, { en: 'Freshness Guarantee & Returns', ta: 'புத்துணர்ச்சி உத்தரவாதம் & திரும்பப் பெறுதல்', hi: 'ताज़गी गारंटी और रिटर्न', ml: 'പുതുമ ഗ്യാരണ്ടിയും റിട്ടേണും', te: 'తాజాదనం గ్యారంటీ & రిటర్న్‌లు', kn: 'ತಾಜಾತನ ಗ್ಯಾರಂಟಿ & ಹಿಂತಿರುಗಿಸುವಿಕೆ' })}
        </button>
      </div>

      {/* TAB 1: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* FAQ Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={pick(lang, {
                en: 'Search FAQs e.g., cold chain temperature, antibiotic testing, refund timeline...',
                ta: 'FAQ களைத் தேடுங்கள் — உதா. குளிர்சாதன வெப்பநிலை, ஆன்டிபயாடிக் சோதனை, பணத்திரும்ப காலவரிசை...',
                hi: 'FAQ खोजें जैसे, कोल्ड चेन तापमान, एंटीबायोटिक परीक्षण, रिफंड समयसीमा...',
                ml: 'FAQ തിരയുക ഉദാ. കോൾഡ് ചെയിൻ താപനില, ആന്റിബയോട്ടിക് ടെസ്റ്റിംഗ്, റീഫണ്ട് സമയപരിധി...',
                te: 'FAQలను శోధించండి ఉదా. కోల్డ్ చైన్ ఉష్ణోగ్రత, యాంటీబయాటిక్ టెస్టింగ్, రీఫండ్ టైమ్‌లైన్...',
                kn: 'FAQ ಗಳನ್ನು ಹುಡುಕಿ ಉದಾ. ಕೋಲ್ಡ್ ಚೈನ್ ತಾಪಮಾನ, ಆಂಟಿಬಯಾಟಿಕ್ ಪರೀಕ್ಷೆ, ಮರುಪಾವತಿ ಸಮಯಪಟ್ಟಿ...'
              })}
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-2xl px-12 py-3.5 text-xs text-[#0A1F12] focus:outline-none shadow-sm"
            />
            <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-4" />
          </div>

          {/* FAQ Categories */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 text-xs">
            {['All', 'Quality & Sourcing', 'Delivery', 'Subscriptions', 'Refunds & Returns', 'Payment & Orders'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`px-4 py-2 rounded-xl border transition cursor-pointer whitespace-nowrap font-bold ${
                  faqCategory === cat
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
                }`}
              >
                {lang === 'ta' ? FAQ_CATEGORIES_TA[cat] ?? cat
                  : lang === 'hi' ? FAQ_CATEGORIES_HI[cat] ?? cat
                  : lang === 'ml' ? FAQ_CATEGORIES_ML[cat] ?? cat
                  : lang === 'te' ? FAQ_CATEGORIES_TE[cat] ?? cat
                  : lang === 'kn' ? FAQ_CATEGORIES_KN[cat] ?? cat
                  : cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const faqTranslated = lang === 'ta' ? FAQ_TA[faq.id]
                : lang === 'hi' ? FAQ_HI[faq.id]
                : lang === 'ml' ? FAQ_ML[faq.id]
                : lang === 'te' ? FAQ_TE[faq.id]
                : lang === 'kn' ? FAQ_KN[faq.id]
                : undefined;
              const displayQuestion = faqTranslated ? faqTranslated.question : faq.question;
              const displayAnswer = faqTranslated ? faqTranslated.answer : faq.answer;
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden transition shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-[#0A1F12] hover:text-emerald-600 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      {displayQuestion}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 border-t border-neutral-100 leading-relaxed space-y-3">
                      <p>{displayAnswer}</p>
                      <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                        <span>{pick(lang, { en: 'Was this answer helpful?', ta: 'இந்த பதில் உதவியாக இருந்ததா?', hi: 'क्या यह उत्तर सहायक था?', ml: 'ഈ ഉത്തരം സഹായകമായിരുന്നോ?', te: 'ఈ సమాధానం సహాయకరంగా ఉందా?', kn: 'ಈ ಉತ್ತರ ಸಹಾಯಕವಾಗಿತ್ತೇ?' })}</span>
                        <button
                          onClick={() => handleVoteFAQ(faq.id, true)}
                          className="flex items-center gap-1 hover:text-emerald-600 font-bold"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> {pick(lang, {
                            en: `Yes (${faq.helpfulVotes})`,
                            ta: `ஆம் (${faq.helpfulVotes})`,
                            hi: `हाँ (${faq.helpfulVotes})`,
                            ml: `അതെ (${faq.helpfulVotes})`,
                            te: `అవును (${faq.helpfulVotes})`,
                            kn: `ಹೌದು (${faq.helpfulVotes})`
                          })}
                        </button>
                        <button
                          onClick={() => handleVoteFAQ(faq.id, false)}
                          className="flex items-center gap-1 hover:text-[#0A1F12] font-bold"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> {pick(lang, {
                            en: `No (${faq.unhelpfulVotes})`,
                            ta: `இல்லை (${faq.unhelpfulVotes})`,
                            hi: `नहीं (${faq.unhelpfulVotes})`,
                            ml: `ഇല്ല (${faq.unhelpfulVotes})`,
                            te: `కాదు (${faq.unhelpfulVotes})`,
                            kn: `ಇಲ್ಲ (${faq.unhelpfulVotes})`
                          })}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TICKETS & LIVE CHAT */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Tickets List */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="font-bold text-[#0A1F12] text-sm">{pick(lang, { en: 'Your Support Tickets', ta: 'உங்கள் ஆதரவு டிக்கெட்டுகள்', hi: 'आपके सपोर्ट टिकट', ml: 'നിങ്ങളുടെ പിന്തുണ ടിക്കറ്റുകൾ', te: 'మీ సపోర్ట్ టికెట్లు', kn: 'ನಿಮ್ಮ ಸಪೋರ್ಟ್ ಟಿಕೆಟ್‌ಗಳು' })}</h3>
              <button
                onClick={() => setShowCreateTicketModal(true)}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> {pick(lang, { en: 'Create Ticket', ta: 'டிக்கெட் உருவாக்கு', hi: 'टिकट बनाएं', ml: 'ടിക്കറ്റ് സൃഷ്ടിക്കുക', te: 'టికెట్ సృష్టించండి', kn: 'ಟಿಕೆಟ್ ರಚಿಸಿ' })}
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition ${
                    activeTicket?.id === t.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-md'
                      : 'bg-neutral-50 border-neutral-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-700">{t.ticketNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#0A1F12] text-white border border-black'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-[#0A1F12] truncate">{t.subject}</div>
                  <div className="text-[10px] text-neutral-500 mt-1">{t.category} • {t.priority} {pick(lang, { en: 'Priority', ta: 'முன்னுரிமை', hi: 'प्राथमिकता', ml: 'മുൻഗണന', te: 'ప్రాధాన్యత', kn: 'ಆದ್ಯತೆ' })}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Ticket Live Chat Window */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 h-[600px] flex flex-col justify-between shadow-sm">
            {activeTicket ? (
              <>
                {/* Chat Header */}
                <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-700">{activeTicket.ticketNumber}</div>
                    <h3 className="text-base font-bold text-[#0A1F12]">{activeTicket.subject}</h3>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">{activeTicket.priority} {pick(lang, { en: 'Priority', ta: 'முன்னுரிமை', hi: 'प्राथमिकता', ml: 'മുൻഗണന', te: 'ప్రాధాన్యత', kn: 'ಆದ್ಯತೆ' })}</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar pr-2">
                  {activeTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs ${
                          m.sender === 'user'
                            ? 'bg-[#0F7B3A] text-white rounded-br-none'
                            : 'bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-bl-none'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-emerald-100 mb-1">{m.senderName}</div>
                        <p>{m.message}</p>
                        <div className="text-[9px] opacity-60 text-right mt-1 font-mono">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={pick(lang, {
                      en: 'Type your message to our support executive...',
                      ta: 'எங்கள் ஆதரவு நிர்வாகிக்கு உங்கள் செய்தியை தட்டச்சு செய்யவும்...',
                      hi: 'हमारे सपोर्ट एग्जीक्यूटिव को अपना संदेश टाइप करें...',
                      ml: 'ഞങ്ങളുടെ പിന്തുണ എക്സിക്യൂട്ടീവിന് നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക...',
                      te: 'మా సపోర్ట్ ఎగ్జిక్యూటివ్‌కు మీ సందేశాన్ని టైప్ చేయండి...',
                      kn: 'ನಮ್ಮ ಸಪೋರ್ಟ್ ಎಗ್ಸಿಕ್ಯುಟಿವ್‌ಗೆ ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...'
                    })}
                    value={chatMessageInput}
                    onChange={(e) => setChatMessageInput(e.target.value)}
                    className="flex-1 bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-[#0A1F12] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-2">
                <MessageSquare className="w-12 h-12 text-emerald-200" />
                <div className="text-sm font-bold text-[#0A1F12]">{pick(lang, { en: 'Select a Ticket to View Chat History', ta: 'அரட்டை வரலாற்றைப் பார்க்க ஒரு டிக்கெட்டைத் தேர்ந்தெடுக்கவும்', hi: 'चैट इतिहास देखने के लिए एक टिकट चुनें', ml: 'ചാറ്റ് ചരിത്രം കാണാൻ ഒരു ടിക്കറ്റ് തിരഞ്ഞെടുക്കുക', te: 'చాట్ చరిత్రను చూడటానికి ఒక టికెట్‌ను ఎంచుకోండి', kn: 'ಚಾಟ್ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಲು ಒಂದು ಟಿಕೆಟ್ ಆಯ್ಕೆಮಾಡಿ' })}</div>
                <p className="text-xs max-w-xs">{pick(lang, {
                  en: 'Click any ticket on the left or create a new inquiry ticket.',
                  ta: 'இடதுபுறத்தில் உள்ள ஏதேனும் டிக்கெட்டைக் கிளிக் செய்யவும் அல்லது புதிய விசாரணை டிக்கெட்டை உருவாக்கவும்.',
                  hi: 'बाईं ओर किसी भी टिकट पर क्लिक करें या नई पूछताछ टिकट बनाएं।',
                  ml: 'ഇടതുവശത്തുള്ള ഏതെങ്കിലും ടിക്കറ്റിൽ ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ പുതിയ അന്വേഷണ ടിക്കറ്റ് സൃഷ്ടിക്കുക.',
                  te: 'ఎడమవైపు ఏదైనా టికెట్‌పై క్లిక్ చేయండి లేదా కొత్త విచారణ టికెట్‌ను సృష్టించండి.',
                  kn: 'ಎಡಭಾಗದಲ್ಲಿರುವ ಯಾವುದೇ ಟಿಕೆಟ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಹೊಸ ವಿಚಾರಣೆ ಟಿಕೆಟ್ ರಚಿಸಿ.'
                })}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RETURN REQUEST FORM */}
      {activeTab === 'return' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#0A1F12]">{pick(lang, { en: '100% Quality & Freshness Guarantee Refund Claim', ta: '100% தரம் & புத்துணர்ச்சி உத்தரவாத பணத்திரும்ப கோரிக்கை', hi: '100% गुणवत्ता और ताज़गी गारंटी रिफंड दावा', ml: '100% ഗുണനിലവാരവും പുതുമ ഗ്യാരണ്ടി റീഫണ്ട് ക്ലെയിമും', te: '100% నాణ్యత & తాజాదనం గ్యారంటీ రీఫండ్ క్లెయిమ్', kn: '100% ಗುಣಮಟ್ಟ & ತಾಜಾತನ ಗ್ಯಾರಂಟಿ ಮರುಪಾವತಿ ಕ್ಲೈಮ್' })}</h3>
            <p className="text-xs text-neutral-500">
              {pick(lang, {
                en: 'If your meat or seafood arrives outside the 0-4°C safety range or fails cut quality, request an immediate replacement or store credit refund.',
                ta: 'உங்கள் இறைச்சி அல்லது கடல் உணவு 0-4°C பாதுகாப்பு வரம்பிற்கு வெளியே வந்தால் அல்லது வெட்டு தரம் தோல்வியடைந்தால், உடனடி மாற்று அல்லது ஸ்டோர் கிரெடிட் பணத்திரும்பத்தை கோரவும்.',
                hi: 'यदि आपका मांस या समुद्री भोजन 0-4°C सुरक्षा सीमा से बाहर पहुंचता है या कट गुणवत्ता में विफल रहता है, तो तुरंत प्रतिस्थापन या स्टोर क्रेडिट रिफंड का अनुरोध करें।',
                ml: 'നിങ്ങളുടെ മാംസമോ കടൽ വിഭവങ്ങളോ 0-4°C സുരക്ഷാ പരിധിക്ക് പുറത്ത് എത്തുകയോ കട്ട് ഗുണനിലവാരം പരാജയപ്പെടുകയോ ചെയ്താൽ, ഉടനടി മാറ്റിസ്ഥാപിക്കൽ അല്ലെങ്കിൽ സ്റ്റോർ ക്രെഡിറ്റ് റീഫണ്ട് അഭ്യർത്ഥിക്കുക.',
                te: 'మీ మాంసం లేదా సీఫుడ్ 0-4°C భద్రతా పరిధి దాటి వస్తే లేదా కట్ నాణ్యత విఫలమైతే, తక్షణ రీప్లేస్‌మెంట్ లేదా స్టోర్ క్రెడిట్ రీఫండ్‌ను అభ్యర్థించండి.',
                kn: 'ನಿಮ್ಮ ಮಾಂಸ ಅಥವಾ ಸೀಫುಡ್ 0-4°C ಸುರಕ್ಷತಾ ಮಿತಿಯ ಹೊರಗೆ ಬಂದರೆ ಅಥವಾ ಕಟ್ ಗುಣಮಟ್ಟ ವಿಫಲವಾದರೆ, ತಕ್ಷಣದ ಬದಲಿ ಅಥವಾ ಸ್ಟೋರ್ ಕ್ರೆಡಿಟ್ ಮರುಪಾವತಿಯನ್ನು ವಿನಂತಿಸಿ.'
              })}
            </p>
          </div>

          {returnSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{returnSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 mb-1">{pick(lang, { en: 'Select Order Number', ta: 'ஆர்டர் எண்ணைத் தேர்ந்தெடுக்கவும்', hi: 'ऑर्डर नंबर चुनें', ml: 'ഓർഡർ നമ്പർ തിരഞ്ഞെടുക്കുക', te: 'ఆర్డర్ నంబర్‌ను ఎంచుకోండి', kn: 'ಆರ್ಡರ್ ಸಂಖ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' })}</label>
              <select
                value={returnOrderId}
                onChange={(e) => setReturnOrderId(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">{pick(lang, { en: '-- Choose Recent Order --', ta: '-- சமீபத்திய ஆர்டரைத் தேர்ந்தெடுக்கவும் --', hi: '-- हाल का ऑर्डर चुनें --', ml: '-- സമീപകാല ഓർഡർ തിരഞ്ഞെടുക്കുക --', te: '-- ఇటీవలి ఆర్డర్‌ను ఎంచుకోండి --', kn: '-- ಇತ್ತೀಚಿನ ಆರ್ಡರ್ ಆಯ್ಕೆಮಾಡಿ --' })}</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.orderNumber}>
                    {o.orderNumber} ({o.status} - ₹{o.totalAmount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">{pick(lang, { en: 'Reason for Claim', ta: 'கோரிக்கைக்கான காரணம்', hi: 'दावे का कारण', ml: 'ക്ലെയിമിന്റെ കാരണം', te: 'క్లెయిమ్‌కు కారణం', kn: 'ಕ್ಲೈಮ್‌ಗೆ ಕಾರಣ' })}</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
              >
                {Object.keys(RETURN_REASONS_TA).map((reason) => (
                  <option key={reason} value={reason}>
                    {lang === 'ta' ? RETURN_REASONS_TA[reason]
                      : lang === 'hi' ? RETURN_REASONS_HI[reason]
                      : lang === 'ml' ? RETURN_REASONS_ML[reason]
                      : lang === 'te' ? RETURN_REASONS_TE[reason]
                      : lang === 'kn' ? RETURN_REASONS_KN[reason]
                      : reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">{pick(lang, { en: 'Additional Details', ta: 'கூடுதல் விவரங்கள்', hi: 'अतिरिक्त विवरण', ml: 'അധിക വിവരങ്ങൾ', te: 'అదనపు వివరాలు', kn: 'ಹೆಚ್ಚುವರಿ ವಿವರಗಳು' })}</label>
              <textarea
                placeholder={pick(lang, {
                  en: 'Explain the condition upon delivery...',
                  ta: 'டெலிவரியின் போது நிலைமையை விளக்கவும்...',
                  hi: 'डिलीवरी के समय स्थिति बताएं...',
                  ml: 'ഡെലിവറി സമയത്തെ അവസ്ഥ വിശദീകരിക്കുക...',
                  te: 'డెలివరీ సమయంలో పరిస్థితిని వివరించండి...',
                  kn: 'ಡೆಲಿವರಿ ಸಮಯದಲ್ಲಿನ ಸ್ಥಿತಿಯನ್ನು ವಿವರಿಸಿ...'
                })}
                value={returnComments}
                onChange={(e) => setReturnComments(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs"
            >
              {pick(lang, { en: 'Lodge Instant Return Request', ta: 'உடனடி திரும்பப் பெறும் கோரிக்கையை பதிவு செய்யவும்', hi: 'तुरंत रिटर्न अनुरोध दर्ज करें', ml: 'തൽക്ഷണ റിട്ടേൺ അഭ്യർത്ഥന രജിസ്റ്റർ ചെയ്യുക', te: 'తక్షణ రిటర్న్ అభ్యర్థనను నమోదు చేయండి', kn: 'ತಕ್ಷಣದ ರಿಟರ್ನ್ ವಿನಂತಿಯನ್ನು ದಾಖಲಿಸಿ' })}
            </button>
          </form>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 text-[#0A1F12] space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">{pick(lang, { en: 'Lodge Support Ticket', ta: 'ஆதரவு டிக்கெட்டைப் பதிவு செய்யவும்', hi: 'सपोर्ट टिकट दर्ज करें', ml: 'പിന്തുണ ടിക്കറ്റ് രജിസ്റ്റർ ചെയ്യുക', te: 'సపోర్ట్ టికెట్‌ను నమోదు చేయండి', kn: 'ಸಪೋರ್ಟ್ ಟಿಕೆಟ್ ದಾಖಲಿಸಿ' })}</h3>
            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">{pick(lang, { en: 'Subject', ta: 'பொருள்', hi: 'विषय', ml: 'വിഷയം', te: 'విషయం', kn: 'ವಿಷಯ' })}</label>
                <input
                  type="text"
                  placeholder={pick(lang, {
                    en: 'e.g. Delivery slot delay or product inquiry',
                    ta: 'உதா. டெலிவரி நேர தாமதம் அல்லது தயாரிப்பு விசாரணை',
                    hi: 'उदा. डिलीवरी स्लॉट में देरी या उत्पाद पूछताछ',
                    ml: 'ഉദാ. ഡെലിവറി സ്ലോട്ട് കാലതാമസം അല്ലെങ്കിൽ ഉൽപ്പന്ന അന്വേഷണം',
                    te: 'ఉదా. డెలివరీ స్లాట్ ఆలస్యం లేదా ఉత్పత్తి విచారణ',
                    kn: 'ಉದಾ. ಡೆಲಿವರಿ ಸ್ಲಾಟ್ ವಿಳಂಬ ಅಥವಾ ಉತ್ಪನ್ನ ವಿಚಾರಣೆ'
                  })}
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">{pick(lang, { en: 'Category', ta: 'வகை', hi: 'श्रेणी', ml: 'വിഭാഗം', te: 'వర్గం', kn: 'ವರ್ಗ' })}</label>
                <select
                  value={newTicketCategory}
                  onChange={(e: any) => setNewTicketCategory(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(TICKET_CATEGORIES_TA).map((cat) => (
                    <option key={cat} value={cat}>
                      {lang === 'ta' ? TICKET_CATEGORIES_TA[cat]
                        : lang === 'hi' ? TICKET_CATEGORIES_HI[cat]
                        : lang === 'ml' ? TICKET_CATEGORIES_ML[cat]
                        : lang === 'te' ? TICKET_CATEGORIES_TE[cat]
                        : lang === 'kn' ? TICKET_CATEGORIES_KN[cat]
                        : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">{pick(lang, { en: 'Message Detail', ta: 'செய்தி விவரம்', hi: 'संदेश विवरण', ml: 'സന്ദേശ വിവരണം', te: 'సందేశ వివరాలు', kn: 'ಸಂದೇಶ ವಿವರ' })}</label>
                <textarea
                  placeholder={pick(lang, {
                    en: 'Describe your issue...',
                    ta: 'உங்கள் பிரச்சனையை விவரிக்கவும்...',
                    hi: 'अपनी समस्या बताएं...',
                    ml: 'നിങ്ങളുടെ പ്രശ്നം വിവരിക്കുക...',
                    te: 'మీ సమస్యను వివరించండి...',
                    kn: 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ...'
                  })}
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:text-[#0A1F12]"
                >
                  {pick(lang, { en: 'Cancel', ta: 'ரத்து செய்', hi: 'रद्द करें', ml: 'റദ്ദാക്കുക', te: 'రద్దు చేయండి', kn: 'ರದ್ದುಗೊಳಿಸಿ' })}
                </button>
                <button
                  type="submit"
                  className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl uppercase"
                >
                  {pick(lang, { en: 'Submit Ticket', ta: 'டிக்கெட்டைச் சமர்ப்பிக்கவும்', hi: 'टिकट सबमिट करें', ml: 'ടിക്കറ്റ് സമർപ്പിക്കുക', te: 'టికెట్‌ను సమర్పించండి', kn: 'ಟಿಕೆಟ್ ಸಲ್ಲಿಸಿ' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
