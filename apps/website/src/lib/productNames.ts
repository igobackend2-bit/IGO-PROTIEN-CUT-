import { Language } from './language';

// Product names live in the shared `products` table (admin-owned, read-only
// from the website per CLAUDE.md — no ALTER TABLE, no new columns, no writes
// from here). To show a translated name per selected language without ever
// touching that table, this is a purely client-side display layer.
//
// IMPORTANT: this dictionary was originally keyed only by the bundled seed
// data's ids (mockData.ts, e.g. 'chk-05'). Those ids are only used when the
// site falls back to the local/seed catalog (VITE_CATALOG_SOURCE=local, or
// before the first successful Supabase fetch). In production the site reads
// the LIVE `products` table (see storage.ts `useRemoteCatalog`), where every
// row gets its own database-generated id (a uuid) that never matches these
// mock ids — so an id-only lookup silently missed every real product and
// always fell back to English. The admin catalog was seeded with the exact
// same English names as mockData.ts though, so this also matches by the
// original English name text (trimmed, case-insensitive) as a second,
// id-independent lookup path that works against the real live catalog too.
export const PRODUCT_NAME_TRANSLATIONS: Record<
  string,
  { en: string; ta: string; hi: string; ml: string; te: string; kn: string }
> = {
  'chk-01': {
    en: 'Fresh Farm Chicken - Curry Cut (Skinless)',
    ta: 'ஃபிரெஷ் ஃபார்ம் சிக்கன் - கறி துண்டு (தோலில்லாதது)',
    hi: 'फ्रेश फार्म चिकन - करी कट (स्किनलेस)',
    ml: 'ഫ്രഷ് ഫാം ചിക്കൻ - കറി കട്ട് (തൊലിയില്ലാത്തത്)',
    te: 'ఫ్రెష్ ఫార్మ్ చికెన్ - కర్రీ కట్ (స్కిన్‌లెస్)',
    kn: 'ಫ್ರೆಶ್ ಫಾರ್ಮ್ ಚಿಕನ್ - ಕರಿ ಕಟ್ (ಚರ್ಮರಹಿತ)',
  },
  'chk-02': {
    en: 'Tender Chicken Breast - Boneless',
    ta: 'மென்மையான சிக்கன் பிரஸ்ட் - எலும்பில்லாதது',
    hi: 'टेंडर चिकन ब्रेस्ट - बोनलेस',
    ml: 'ടെൻഡർ ചിക്കൻ ബ്രെസ്റ്റ് - അസ്ഥിയില്ലാത്തത്',
    te: 'టెండర్ చికెన్ బ్రెస్ట్ - బోన్‌లెస్',
    kn: 'ಟೆಂಡರ್ ಚಿಕನ್ ಬ್ರೆಸ್ಟ್ - ಎಲುಬು ರಹಿತ',
  },
  'chk-03': {
    en: 'Juicy Chicken Drumsticks (Leg Pieces)',
    ta: 'சுவையான சிக்கன் காலடி துண்டுகள்',
    hi: 'जूसी चिकन ड्रमस्टिक (लेग पीस)',
    ml: 'ജ്യൂസി ചിക്കൻ ഡ്രംസ്റ്റിക് (കാൽ കഷണം)',
    te: 'జ్యూసీ చికెన్ డ్రమ్‌స్టిక్స్ (లెగ్ పీసెస్)',
    kn: 'ಜ್ಯೂಸಿ ಚಿಕನ್ ಡ್ರಮ್‌ಸ್ಟಿಕ್ (ಲೆಗ್ ಪೀಸ್)',
  },
  'chk-04': {
    en: 'Chicken Lollipop Cuts',
    ta: 'சிக்கன் லாலிபாப் துண்டுகள்',
    hi: 'चिकन लॉलीपॉप कट्स',
    ml: 'ചിക്കൻ ലോലിപോപ്പ് കട്സ്',
    te: 'చికెన్ లాలీపాప్ కట్స్',
    kn: 'ಚಿಕನ್ ಲಾಲಿಪಾಪ್ ಕಟ್ಸ್',
  },
  'chk-05': {
    en: 'Country Chicken (Nattu Kozhi) - Curry Cut',
    ta: 'நாட்டு கோழி - கறி துண்டு',
    hi: 'देसी मुर्गी (नाट्टू कोझी) - करी कट',
    ml: 'നാടൻ കോഴി (നാട്ടു കോഴി) - കറി കട്ട്',
    te: 'నాటు కోడి - కర్రీ కట్',
    kn: 'ನಾಟಿ ಕೋಳಿ (ನಾಟ್ಟು ಕೋಳಿ) - ಕರಿ ಕಟ್',
  },
  'chk-06': {
    en: 'Farm Fresh Quail (Whole Cleaned)',
    ta: 'ஃபார்ம் ஃபிரெஷ் காடை (முழுவதும் சுத்தம் செய்யப்பட்டது)',
    hi: 'फार्म फ्रेश बटेर (पूरी तरह साफ)',
    ml: 'ഫാം ഫ്രഷ് കാട (പൂർണ്ണമായി വൃത്തിയാക്കിയത്)',
    te: 'ఫార్మ్ ఫ్రెష్ పిట్ట (పూర్తిగా శుభ్రం చేయబడింది)',
    kn: 'ಫಾರ್ಮ್ ಫ್ರೆಶ್ ಕ್ವೇಲ್ (ಪೂರ್ತಿ ಸ್ವಚ್ಛಗೊಳಿಸಿದ)',
  },
  'mut-01': {
    en: 'Premium Goat Mutton - Curry Cut',
    ta: 'பிரீமியம் ஆட்டு இறைச்சி - கறி துண்டு',
    hi: 'प्रीमियम बकरी का मटन - करी कट',
    ml: 'പ്രീമിയം ആട്ടിറച്ചി - കറി കട്ട്',
    te: 'ప్రీమియం మేక మటన్ - కర్రీ కట్',
    kn: 'ಪ್ರೀಮಿಯಂ ಮೇಕೆ ಮಟನ್ - ಕರಿ ಕಟ್',
  },
  'mut-02': {
    en: 'Boneless Goat Mutton (Rich Protein)',
    ta: 'எலும்பில்லாத ஆட்டு இறைச்சி (உயர் புரதம்)',
    hi: 'बोनलेस बकरी मटन (रिच प्रोटीन)',
    ml: 'അസ്ഥിയില്ലാത്ത ആട്ടിറച്ചി (സമ്പന്നമായ പ്രോട്ടീൻ)',
    te: 'బోన్‌లెస్ మేక మటన్ (రిచ్ ప్రోటీన్)',
    kn: 'ಎಲುಬು ರಹಿತ ಮೇಕೆ ಮಟನ್ (ಸಮೃದ್ಧ ಪ್ರೋಟೀನ್)',
  },
  'mut-03': {
    en: 'Goat Mutton Ribs & Chops',
    ta: 'ஆட்டு இறைச்சி விலா & சாப்ஸ்',
    hi: 'बकरी मटन रिब्स एंड चॉप्स',
    ml: 'ആട്ടിറച്ചി വാരിയെല്ലും ചോപ്പും',
    te: 'మేక మటన్ రిబ్స్ & చాప్స్',
    kn: 'ಮೇಕೆ ಮಟನ್ ರಿಬ್ಸ್ & ಚಾಪ್ಸ್',
  },
  'fsh-01': {
    en: 'Fresh Seer Fish / Vanjaram Steak',
    ta: 'ஃபிரெஷ் நண்டு மீன் / வஞ்சிரம் ஸ்டீக்',
    hi: 'फ्रेश सीर फिश / वंजरम स्टेक',
    ml: 'ഫ്രഷ് നെയ്‌മീൻ / വഞ്ചിരം സ്റ്റീക്ക്',
    te: 'ఫ్రెష్ సీర్ ఫిష్ / వంజరం స్టీక్',
    kn: 'ಫ್ರೆಶ್ ಸೀರ್ ಫಿಶ್ / ವಂಜರಂ ಸ್ಟೀಕ್',
  },
  'fsh-02': {
    en: 'Freshwater Rohu / Katla - Curry Cut',
    ta: 'நன்னீர் ரொஹு / கட்லா - கறி துண்டு',
    hi: 'फ्रेशवाटर रोहू / कतला - करी कट',
    ml: 'ശുദ്ധജല രോഹു / കട്‌ല - കറി കട്ട്',
    te: 'మంచినీటి రోహు / కట్ల - కర్రీ కట్',
    kn: 'ಸಿಹಿನೀರಿನ ರೋಹು / ಕಟ್ಲಾ - ಕರಿ ಕಟ್',
  },
  'fsh-03': {
    en: 'Fresh Tiger Prawns - Cleaned & Deveined',
    ta: 'ஃபிரெஷ் புலி இறால் - சுத்தம் செய்யப்பட்டது',
    hi: 'फ्रेश टाइगर प्रॉन्स - क्लीन्ड एंड डिवीन्ड',
    ml: 'ഫ്രഷ് ടൈഗർ ചെമ്മീൻ - വൃത്തിയാക്കിയത്',
    te: 'ఫ్రెష్ టైగర్ రొయ్యలు - శుభ్రం చేయబడినవి',
    kn: 'ಫ್ರೆಶ್ ಟೈಗರ್ ಸೀಗಡಿ - ಸ್ವಚ್ಛಗೊಳಿಸಿ ಡಿವೈನ್ ಮಾಡಿದ',
  },
  'fsh-04': {
    en: 'Norwegian Salmon Fillet (Boneless)',
    ta: 'நார்வேஜியன் சால்மன் ஃபில்லெட் (எலும்பில்லாதது)',
    hi: 'नॉर्वेजियन सैल्मन फिलेट (बोनलेस)',
    ml: 'നോർവീജിയൻ സാൽമൺ ഫില്ലറ്റ് (അസ്ഥിയില്ലാത്തത്)',
    te: 'నార్వేజియన్ సాల్మన్ ఫిల్లెట్ (బోన్‌లెస్)',
    kn: 'ನಾರ್ವೇಜಿಯನ್ ಸಾಲ್ಮನ್ ಫಿಲ್ಲೆಟ್ (ಎಲುಬು ರಹಿತ)',
  },
  'fsh-05': {
    en: 'Fresh Mud Crab (Live Caught)',
    ta: 'ஃபிரெஷ் சேற்று நண்டு (உயிருடன் பிடிக்கப்பட்டது)',
    hi: 'फ्रेश मड क्रैब (लाइव कॉट)',
    ml: 'ഫ്രഷ് ചെളി ഞണ്ട് (ജീവനോടെ പിടിച്ചത്)',
    te: 'ఫ్రెష్ మడ్ క్రాబ్ (సజీవంగా పట్టుకున్నది)',
    kn: 'ಫ್ರೆಶ್ ಮಡ್ ಕ್ರ್ಯಾಬ್ (ಜೀವಂತವಾಗಿ ಹಿಡಿದ)',
  },
  'fsh-06': {
    en: 'Live Mud Crab (Whole, Uncleaned)',
    ta: 'உயிருள்ள சேற்று நண்டு (முழுவதும், சுத்தம் செய்யாதது)',
    hi: 'लाइव मड क्रैब (पूरा, बिना साफ किया हुआ)',
    ml: 'ജീവനുള്ള ചെളി ഞണ്ട് (മുഴുവൻ, വൃത്തിയാക്കാത്തത്)',
    te: 'లైవ్ మడ్ క్రాబ్ (పూర్తి, శుభ్రం చేయనిది)',
    kn: 'ಲೈವ್ ಮಡ್ ಕ್ರ್ಯಾಬ್ (ಪೂರ್ತಿ, ಸ್ವಚ್ಛಗೊಳಿಸದ)',
  },
  'dfsh-01': {
    en: 'Sun-Dried Anchovy (Nethili Karuvadu)',
    ta: 'வெயிலில் உலர்த்திய நெத்திலி (நெத்திலி கருவாடு)',
    hi: 'सन-ड्राइड एंकोवी (नेथिली करुवाडु)',
    ml: 'വെയിലിൽ ഉണക്കിയ നെത്തിലി (നെത്തിലി കരുവാട്)',
    te: 'ఎండలో ఆరబెట్టిన నెత్తిలి (నెత్తిలి కరువాడు)',
    kn: 'ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿದ ಆಂಚೋವಿ (ನೆತ್ತಿಲಿ ಕರುವಾಡು)',
  },
  'egg-01': {
    en: 'Farm Fresh White Eggs (Pack of 12)',
    ta: 'ஃபார்ம் ஃபிரெஷ் வெள்ளை முட்டைகள் (12 பேக்)',
    hi: 'फार्म फ्रेश व्हाइट एग्स (पैक ऑफ 12)',
    ml: 'ഫാം ഫ്രഷ് വൈറ്റ് മുട്ടകൾ (12 എണ്ണം)',
    te: 'ఫార్మ్ ఫ్రెష్ వైట్ ఎగ్స్ (12 ప్యాక్)',
    kn: 'ಫಾರ್ಮ್ ಫ್ರೆಶ್ ಬಿಳಿ ಮೊಟ್ಟೆಗಳು (12 ಪ್ಯಾಕ್)',
  },
  'egg-02': {
    en: 'Organic Brown Country Hen Eggs (Pack of 6)',
    ta: 'ஆர்கானிக் பிரவுன் நாட்டு கோழி முட்டைகள் (6 பேக்)',
    hi: 'ऑर्गेनिक ब्राउन कंट्री हेन एग्स (पैक ऑफ 6)',
    ml: 'ഓർഗാനിക് ബ്രൗൺ നാടൻ കോഴിമുട്ടകൾ (6 എണ്ണം)',
    te: 'ఆర్గానిక్ బ్రౌన్ కంట్రీ హెన్ ఎగ్స్ (6 ప్యాక్)',
    kn: 'ಆರ್ಗಾನಿಕ್ ಬ್ರೌನ್ ನಾಟಿ ಕೋಳಿ ಮೊಟ್ಟೆಗಳು (6 ಪ್ಯಾಕ್)',
  },
  'rtc-01': {
    en: 'Chef Peri Peri Marinated Chicken Wings',
    ta: 'செஃப் பெரி பெரி மேரினேட்டட் சிக்கன் விங்ஸ்',
    hi: 'शेफ पेरी पेरी मैरिनेटेड चिकन विंग्स',
    ml: 'ഷെഫ് പെരി പെരി മാരിനേറ്റഡ് ചിക്കൻ വിംഗ്സ്',
    te: 'చెఫ్ పెరి పెరి మారినేటెడ్ చికెన్ వింగ్స్',
    kn: 'ಶೆಫ್ ಪೆರಿ ಪೆರಿ ಮ್ಯಾರಿನೇಟೆಡ್ ಚಿಕನ್ ವಿಂಗ್ಸ್',
  },
  'rtc-02': {
    en: 'Tandoori Chicken Tikka (Boneless Marinated)',
    ta: 'தந்தூரி சிக்கன் டிக்கா (எலும்பில்லாத மேரினேட்டட்)',
    hi: 'तंदूरी चिकन टिक्का (बोनलेस मैरिनेटेड)',
    ml: 'തന്തൂരി ചിക്കൻ ടിക്ക (അസ്ഥിയില്ലാത്ത മാരിനേറ്റഡ്)',
    te: 'తందూరి చికెన్ టిక్కా (బోన్‌లెస్ మారినేటెడ్)',
    kn: 'ತಂದೂರಿ ಚಿಕನ್ ಟಿಕ್ಕಾ (ಎಲುಬು ರಹಿತ ಮ್ಯಾರಿನೇಟೆಡ್)',
  },
  'rtc-03': {
    en: 'Mutton Seekh Kebab (Marinated)',
    ta: 'மட்டன் சீக் கபாப் (மேரினேட்டட்)',
    hi: 'मटन सीख कबाब (मैरिनेटेड)',
    ml: 'മട്ടൻ സീഖ് കബാബ് (മാരിനേറ്റഡ്)',
    te: 'మటన్ సీక్ కబాబ్ (మారినేటెడ్)',
    kn: 'ಮಟನ್ ಸೀಖ್ ಕಬಾಬ್ (ಮ್ಯಾರಿನೇಟೆಡ್)',
  },
  'rtc-04': {
    en: 'Fish Amritsari (Marinated Fish Fry)',
    ta: 'மீன் அம்ரித்சரி (மேரினேட்டட் மீன் வறுவல்)',
    hi: 'फिश अमृतसरी (मैरिनेटेड फिश फ्राई)',
    ml: 'ഫിഷ് അമൃത്സരി (മാരിനേറ്റഡ് ഫിഷ് ഫ്രൈ)',
    te: 'ఫిష్ అమృత్సరి (మారినేటెడ్ ఫిష్ ఫ్రై)',
    kn: 'ಫಿಶ್ ಅಮೃತ್ಸರಿ (ಮ್ಯಾರಿನೇಟೆಡ್ ಫಿಶ್ ಫ್ರೈ)',
  },
  'rtc-05': {
    en: 'Chicken 65 (Marinated)',
    ta: 'சிக்கன் 65 (மேரினேட்டட்)',
    hi: 'चिकन 65 (मैरिनेटेड)',
    ml: 'ചിക്കൻ 65 (മാരിനേറ്റഡ്)',
    te: 'చికెన్ 65 (మారినేటెడ్)',
    kn: 'ಚಿಕನ್ 65 (ಮ್ಯಾರಿನೇಟೆಡ್)',
  },
  'cmb-01': {
    en: 'Sunday Family Feast Combo',
    ta: 'சண்டே குடும்ப விருந்து காம்போ',
    hi: 'संडे फैमिली फीस्ट कॉम्बो',
    ml: 'ഞായറാഴ്ച കുടുംബ വിരുന്ന് കോംബോ',
    te: 'సండే ఫ్యామిలీ ఫీస్ట్ కాంబో',
    kn: 'ಭಾನುವಾರದ ಕುಟುಂಬ ಔತಣ ಕಾಂಬೋ',
  },
  'cmb-02': {
    en: 'High Protein Gym Bro Bundle',
    ta: 'ஹை புரோட்டீன் ஜிம் ப்ரோ பண்டில்',
    hi: 'हाई प्रोटीन जिम ब्रो बंडल',
    ml: 'ഹൈ പ്രോട്ടീൻ ജിം ബ്രോ ബണ്ടിൽ',
    te: 'హై ప్రోటీన్ జిమ్ బ్రో బండిల్',
    kn: 'ಹೈ ಪ್ರೋಟೀನ್ ಜಿಮ್ ಬ್ರೋ ಬಂಡಲ್',
  },
  'cmb-03': {
    en: 'Festival Combo',
    ta: 'திருவிழா காம்போ',
    hi: 'फेस्टिवल कॉम्बो',
    ml: 'ഫെസ്റ്റിവൽ കോംബോ',
    te: 'ఫెస్టివల్ కాంబో',
    kn: 'ಹಬ್ಬದ ಕಾಂಬೋ',
  },
  'cmb-04': {
    en: 'Seafood Combo',
    ta: 'கடல் உணவு காம்போ',
    hi: 'सीफूड कॉम्बो',
    ml: 'സീഫുഡ് കോംബോ',
    te: 'సీఫుడ్ కాంబో',
    kn: 'ಸೀಫುಡ್ ಕಾಂಬೋ',
  },
  'frz-01': {
    en: 'Frozen Chicken Nuggets',
    ta: 'உறைந்த சிக்கன் நகெட்ஸ்',
    hi: 'फ्रोजन चिकन नगेट्स',
    ml: 'ഫ്രോസൺ ചിക്കൻ നഗ്ഗറ്റ്സ്',
    te: 'ఫ్రోజెన్ చికెన్ నగెట్స్',
    kn: 'ಫ್ರೋಜನ್ ಚಿಕನ್ ನಗೆಟ್ಸ್',
  },
  'frz-02': {
    en: 'Frozen Fish Fillets',
    ta: 'உறைந்த மீன் ஃபில்லெட்ஸ்',
    hi: 'फ्रोजन फिश फिलेट्स',
    ml: 'ഫ്രോസൺ ഫിഷ് ഫില്ലറ്റ്സ്',
    te: 'ఫ్రోజెన్ ఫిష్ ఫిల్లెట్స్',
    kn: 'ಫ್ರೋಜನ್ ಫಿಶ್ ಫಿಲ್ಲೆಟ್ಸ್',
  },
  'frz-03': {
    en: 'Frozen Chicken Seekh Kebabs',
    ta: 'உறைந்த சிக்கன் சீக் கபாப்ஸ்',
    hi: 'फ्रोजन चिकन सीख कबाब',
    ml: 'ഫ്രോസൺ ചിക്കൻ സീഖ് കബാബ്',
    te: 'ఫ్రోజెన్ చికెన్ సీక్ కబాబ్స్',
    kn: 'ಫ್ರೋಜನ್ ಚಿಕನ್ ಸೀಖ್ ಕಬಾಬ್ಸ್',
  },
  'frz-04': {
    en: 'Frozen Green Peas',
    ta: 'உறைந்த பட்டாணி',
    hi: 'फ्रोजन हरी मटर',
    ml: 'ഫ്രോസൺ പച്ചക്കടല',
    te: 'ఫ్రోజెన్ బఠాణీ',
    kn: 'ಫ್ರೋಜನ್ ಹಸಿರು ಬಟಾಣಿ',
  },
  'bir-01': {
    en: 'Chicken Biryani Kit',
    ta: 'சிக்கன் பிரியாணி கிட்',
    hi: 'चिकन बिरयानी किट',
    ml: 'ചിക്കൻ ബിരിയാണി കിറ്റ്',
    te: 'చికెన్ బిర్యానీ కిట్',
    kn: 'ಚಿಕನ್ ಬಿರಿಯಾನಿ ಕಿಟ್',
  },
  'bir-02': {
    en: 'Mutton Biryani Kit',
    ta: 'மட்டன் பிரியாணி கிட்',
    hi: 'मटन बिरयानी किट',
    ml: 'മട്ടൻ ബിരിയാണി കിറ്റ്',
    te: 'మటన్ బిర్యానీ కిట్',
    kn: 'ಮಟನ್ ಬಿರಿಯಾನಿ ಕಿಟ್',
  },
  'bir-03': {
    en: 'Egg Biryani Kit',
    ta: 'முட்டை பிரியாணி கிட்',
    hi: 'एग बिरयानी किट',
    ml: 'മുട്ട ബിരിയാണി കിറ്റ്',
    te: 'ఎగ్ బిర్యానీ కిట్',
    kn: 'ಎಗ್ ಬಿರಿಯಾನಿ ಕಿಟ್',
  },
  'cc-01': {
    en: 'Chicken Salami',
    ta: 'சிக்கன் சலாமி',
    hi: 'चिकन सलामी',
    ml: 'ചിക്കൻ സലാമി',
    te: 'చికెన్ సలామీ',
    kn: 'ಚಿಕನ್ ಸಲಾಮಿ',
  },
  'cc-02': {
    en: 'Chicken Ham',
    ta: 'சிக்கன் ஹேம்',
    hi: 'चिकन हैम',
    ml: 'ചിക്കൻ ഹാം',
    te: 'చికెన్ హామ్',
    kn: 'ಚಿಕನ್ ಹ್ಯಾಮ್',
  },
  'cc-03': {
    en: 'Chicken Breakfast Sausages',
    ta: 'சிக்கன் காலை உணவு சாசேஜ்கள்',
    hi: 'चिकन ब्रेकफास्ट सॉसेज',
    ml: 'ചിക്കൻ ബ്രേക്ക്ഫാസ്റ്റ് സോസേജ്',
    te: 'చికెన్ బ్రేక్‌ఫాస్ట్ సాసేజెస్',
    kn: 'ಚಿಕನ್ ಬ್ರೇಕ್‌ಫಾಸ್ಟ್ ಸಾಸೇಜ್‌ಗಳು',
  },
  'cc-04': {
    en: 'Turkey Bacon',
    ta: 'டர்க்கி பேக்கன்',
    hi: 'टर्की बेकन',
    ml: 'ടർക്കി ബേക്കൺ',
    te: 'టర్కీ బేకన్',
    kn: 'ಟರ್ಕಿ ಬೇಕನ್',
  },
  'sub-01': {
    en: 'Weekly Fitness Protein Pass',
    ta: 'வாராந்திர ஃபிட்னஸ் புரோட்டீன் பாஸ்',
    hi: 'वीकली फिटनेस प्रोटीन पास',
    ml: 'വീക്ക്‌ലി ഫിറ്റ്നസ് പ്രോട്ടീൻ പാസ്',
    te: 'వీక్లీ ఫిట్‌నెస్ ప్రోటీన్ పాస్',
    kn: 'ವಾರದ ಫಿಟ್‌ನೆಸ್ ಪ್ರೋಟೀನ್ ಪಾಸ್',
  },
  'chk-img-01': {
    en: 'Chicken Breast Boneless',
    ta: 'சிக்கன் பிரஸ்ட் எலும்பில்லாதது',
    hi: 'चिकन ब्रेस्ट बोनलेस',
    ml: 'ചിക്കൻ ബ്രെസ്റ്റ് അസ്ഥിയില്ലാത്തത്',
    te: 'చికెన్ బ్రెస్ట్ బోన్‌లెస్',
    kn: 'ಚಿಕನ್ ಬ್ರೆಸ್ಟ್ ಎಲುಬು ರಹಿತ',
  },
  'chk-img-02': {
    en: 'Chicken Drumsticks',
    ta: 'சிக்கன் காலடி துண்டுகள்',
    hi: 'चिकन ड्रमस्टिक्स',
    ml: 'ചിക്കൻ ഡ്രംസ്റ്റിക്സ്',
    te: 'చికెన్ డ్రమ్‌స్టిక్స్',
    kn: 'ಚಿಕನ್ ಡ್ರಮ್‌ಸ್ಟಿಕ್ಸ್',
  },
  'chk-img-03': {
    en: 'Chicken Leg Piece',
    ta: 'சிக்கன் கால் துண்டு',
    hi: 'चिकन लेग पीस',
    ml: 'ചിക്കൻ കാൽ കഷണം',
    te: 'చికెన్ లెగ్ పీస్',
    kn: 'ಚಿಕನ್ ಲೆಗ್ ಪೀಸ್',
  },
  'chk-img-04': {
    en: 'Chicken Liver',
    ta: 'சிக்கன் லிவர்',
    hi: 'चिकन लिवर',
    ml: 'ചിക്കൻ ലിവർ',
    te: 'చికెన్ లివర్',
    kn: 'ಚಿಕನ್ ಲಿವರ್',
  },
  'chk-img-05': {
    en: 'Chicken Mince',
    ta: 'சிக்கன் மிளகாய் அரைத்தது',
    hi: 'चिकन कीमा',
    ml: 'ചിക്കൻ മിൻസ്',
    te: 'చికెన్ మిన్స్',
    kn: 'ಚಿಕನ್ ಮಿನ್ಸ್',
  },
  'chk-img-06': {
    en: 'Chicken Thigh Boneless',
    ta: 'சிக்கன் தொடை எலும்பில்லாதது',
    hi: 'चिकन थाई बोनलेस',
    ml: 'ചിക്കൻ തുട അസ്ഥിയില്ലാത്തത്',
    te: 'చికెన్ తొడ బోన్‌లెస్',
    kn: 'ಚಿಕನ್ ತೊಡೆ ಎಲುಬು ರಹಿತ',
  },
  'chk-img-07': {
    en: 'Chicken Wings',
    ta: 'சிக்கன் இறக்கைகள்',
    hi: 'चिकन विंग्स',
    ml: 'ചിക്കൻ വിംഗ്സ്',
    te: 'చికెన్ వింగ్స్',
    kn: 'ಚಿಕನ್ ವಿಂಗ್ಸ್',
  },
  'chk-img-08': {
    en: 'Whole Chicken',
    ta: 'முழு கோழி',
    hi: 'साबुत मुर्गी',
    ml: 'മുഴുവൻ കോഴി',
    te: 'పూర్తి కోడి',
    kn: 'ಪೂರ್ತಿ ಕೋಳಿ',
  },
  'chk-img-09': {
    en: 'Country Chicken (Naattu Kozhi)',
    ta: 'நாட்டு கோழி (நாட்டு கோழி)',
    hi: 'देसी मुर्गी (नाट्टू कोझी)',
    ml: 'നാടൻ കോഴി (നാട്ടു കോഴി)',
    te: 'నాటు కోడి (నాటు కోడి)',
    kn: 'ನಾಟಿ ಕೋಳಿ (ನಾಟ್ಟು ಕೋಳಿ)',
  },
  'mut-img-01': {
    en: 'Mutton Chops',
    ta: 'மட்டன் சாப்ஸ்',
    hi: 'मटन चॉप्स',
    ml: 'മട്ടൻ ചോപ്പ്',
    te: 'మటన్ చాప్స్',
    kn: 'ಮಟನ್ ಚಾಪ್ಸ್',
  },
  'mut-img-02': {
    en: 'Mutton Leg',
    ta: 'மட்டன் காலு',
    hi: 'मटन लेग',
    ml: 'മട്ടൻ കാൽ',
    te: 'మటన్ లెగ్',
    kn: 'ಮಟನ್ ಲೆಗ್',
  },
  'mut-img-03': {
    en: 'Mutton Liver',
    ta: 'மட்டன் லிவர்',
    hi: 'मटन लिवर',
    ml: 'മട്ടൻ ലിവർ',
    te: 'మటన్ లివర్',
    kn: 'ಮಟನ್ ಲಿವರ್',
  },
  'mut-img-04': {
    en: 'Mutton Mince',
    ta: 'மட்டன் மிளகாய் அரைத்தது',
    hi: 'मटन कीमा',
    ml: 'മട്ടൻ മിൻസ്',
    te: 'మటన్ మిన్స్',
    kn: 'ಮಟನ್ ಮಿನ್ಸ್',
  },
  'mut-img-05': {
    en: 'Mutton Ribs',
    ta: 'மட்டன் விலா எலும்பு',
    hi: 'मटन रिब्स',
    ml: 'മട്ടൻ വാരിയെല്ല്',
    te: 'మటన్ రిబ్స్',
    kn: 'ಮಟನ್ ರಿಬ್ಸ್',
  },
  'mut-img-06': {
    en: 'Mutton Soup Bones',
    ta: 'மட்டன் சூப் எலும்புகள்',
    hi: 'मटन सूप बोन्स',
    ml: 'മട്ടൻ സൂപ്പ് അസ്ഥികൾ',
    te: 'మటన్ సూప్ బోన్స్',
    kn: 'ಮಟನ್ ಸೂಪ್ ಬೋನ್ಸ್',
  },
  'mut-img-07': {
    en: 'Mutton Curry',
    ta: 'மட்டன் கறி',
    hi: 'मटन करी',
    ml: 'മട്ടൻ കറി',
    te: 'మటన్ కర్రీ',
    kn: 'ಮಟನ್ ಕರಿ',
  },
  'mut-img-08': {
    en: 'Mutton Boneless',
    ta: 'மட்டன் எலும்பில்லாதது',
    hi: 'मटन बोनलेस',
    ml: 'മട്ടൻ അസ്ഥിയില്ലാത്തത്',
    te: 'మటన్ బోన్‌లెస్',
    kn: 'ಮಟನ್ ಎಲುಬು ರಹಿತ',
  },
  'bef-img-01': {
    en: 'Beef Cubes',
    ta: 'பீஃப் க்யூப்ஸ்',
    hi: 'बीफ क्यूब्स',
    ml: 'ബീഫ് ക്യൂബ്സ്',
    te: 'బీఫ్ క్యూబ్స్',
    kn: 'ಬೀಫ್ ಕ್ಯೂಬ್ಸ್',
  },
  'bef-img-02': {
    en: 'Beef Curry Cut',
    ta: 'பீஃப் கறி துண்டு',
    hi: 'बीफ करी कट',
    ml: 'ബീഫ് കറി കട്ട്',
    te: 'బీఫ్ కర్రీ కట్',
    kn: 'ಬೀಫ್ ಕರಿ ಕಟ್',
  },
  'bef-img-03': {
    en: 'Beef Liver',
    ta: 'பீஃப் லிவர்',
    hi: 'बीफ लिवर',
    ml: 'ബീഫ് ലിവർ',
    te: 'బీఫ్ లివర్',
    kn: 'ಬೀಫ್ ಲಿವರ್',
  },
  'bef-img-04': {
    en: 'Beef Mince',
    ta: 'பீஃப் மிளகாய் அரைத்தது',
    hi: 'बीफ कीमा',
    ml: 'ബീഫ് മിൻസ്',
    te: 'బీఫ్ మిన్స్',
    kn: 'ಬೀಫ್ ಮಿನ್ಸ್',
  },
  'bef-img-05': {
    en: 'Beef Shank',
    ta: 'பீஃப் ஷேங்க்',
    hi: 'बीफ शैंक',
    ml: 'ബീഫ് ഷാങ്ക്',
    te: 'బీఫ్ షాంక్',
    kn: 'ಬೀಫ್ ಶ್ಯಾಂಕ್',
  },
  'bef-img-06': {
    en: 'Ribeye Steak',
    ta: 'ரிப்ஐ ஸ்டீக்',
    hi: 'रिबआई स्टेक',
    ml: 'റിബ്‌ഐ സ്റ്റീക്ക്',
    te: 'రిబ్‌ఐ స్టీక్',
    kn: 'ರಿಬ್‌ಐ ಸ್ಟೀಕ್',
  },
  'bef-img-07': {
    en: 'Sirloin Steak',
    ta: 'சர்லாயின் ஸ்டீக்',
    hi: 'सिरलॉइन स्टेक',
    ml: 'സിർലോയിൻ സ്റ്റീക്ക്',
    te: 'సర్లాయిన్ స్టీక్',
    kn: 'ಸರ್ಲಾಯಿನ್ ಸ್ಟೀಕ್',
  },
  'bef-img-08': {
    en: 'T-Bone Steak',
    ta: 'டி-போன் ஸ்டீக்',
    hi: 'टी-बोन स्टेक',
    ml: 'ടി-ബോൺ സ്റ്റീക്ക്',
    te: 'టి-బోన్ స్టీక్',
    kn: 'ಟಿ-ಬೋನ್ ಸ್ಟೀಕ್',
  },
  'bef-img-09': {
    en: 'Tenderloin Steak',
    ta: 'டெண்டர்லாயின் ஸ்டீக்',
    hi: 'टेंडरलॉइन स्टेक',
    ml: 'ടെൻഡർലോയിൻ സ്റ്റീക്ക്',
    te: 'టెండర్‌లాయిన్ స్టీక్',
    kn: 'ಟೆಂಡರ್‌ಲಾಯಿನ್ ಸ್ಟೀಕ್',
  },
  'fsh-img-01': {
    en: 'Anchovy',
    ta: 'நெத்திலி',
    hi: 'एंकोवी',
    ml: 'നെത്തിലി',
    te: 'నెత్తిలి',
    kn: 'ಆಂಚೋವಿ',
  },
  'fsh-img-02': {
    en: 'Crab',
    ta: 'நண்டு',
    hi: 'क्रैब',
    ml: 'ഞണ്ട്',
    te: 'పీత',
    kn: 'ಏಡಿ',
  },
  'fsh-img-03': {
    en: 'Mackerel',
    ta: 'கானாங்கெளுத்தி',
    hi: 'मैकेरल',
    ml: 'അയല',
    te: 'మాకరెల్',
    kn: 'ಬಂಗುಡೆ',
  },
  'fsh-img-04': {
    en: 'Prawns',
    ta: 'இறால்',
    hi: 'प्रॉन्स',
    ml: 'ചെമ്മീൻ',
    te: 'రొయ్యలు',
    kn: 'ಸೀಗಡಿ',
  },
  'fsh-img-05': {
    en: 'Rohu Fish',
    ta: 'ரொஹு மீன்',
    hi: 'रोहू फिश',
    ml: 'രോഹു മീൻ',
    te: 'రోహు చేప',
    kn: 'ರೋಹು ಮೀನು',
  },
  'fsh-img-06': {
    en: 'Salmon Fillet',
    ta: 'சால்மன் ஃபில்லெட்',
    hi: 'सैल्मन फिलेट',
    ml: 'സാൽമൺ ഫില്ലറ്റ്',
    te: 'సాల్మన్ ఫిల్లెట్',
    kn: 'ಸಾಲ್ಮನ್ ಫಿಲ್ಲೆಟ್',
  },
  'fsh-img-07': {
    en: 'Sardines',
    ta: 'மத்தி மீன்',
    hi: 'सार्डिन',
    ml: 'ചാള',
    te: 'సార్డిన్స్',
    kn: 'ಬೂತಾಯಿ',
  },
  'fsh-img-08': {
    en: 'Squid',
    ta: 'கணவாய்',
    hi: 'स्क्विड',
    ml: 'കണവ',
    te: 'స్క్విడ్',
    kn: 'ಕಣವೆ',
  },
  'fsh-img-09': {
    en: 'Tuna Steak',
    ta: 'சூரை ஸ்டீக்',
    hi: 'ट्यूना स्टेक',
    ml: 'ചൂര സ്റ്റീക്ക്',
    te: 'ట్యూనా స్టీక్',
    kn: 'ಟ್ಯೂನಾ ಸ್ಟೀಕ್',
  },
  'egg-img-01': {
    en: 'Duck Eggs',
    ta: 'வாத்து முட்டைகள்',
    hi: 'डक एग्स',
    ml: 'താറാവ് മുട്ട',
    te: 'బాతు గుడ్లు',
    kn: 'ಬಾತುಕೋಳಿ ಮೊಟ್ಟೆಗಳು',
  },
  'egg-img-02': {
    en: 'Egg White Pack',
    ta: 'முட்டை வெள்ளை பேக்',
    hi: 'एग व्हाइट पैक',
    ml: 'മുട്ട വെള്ള പായ്ക്ക്',
    te: 'ఎగ్ వైట్ ప్యాక్',
    kn: 'ಎಗ್ ವೈಟ್ ಪ್ಯಾಕ್',
  },
  'egg-img-03': {
    en: 'Farm Fresh Eggs',
    ta: 'ஃபார்ம் ஃபிரெஷ் முட்டைகள்',
    hi: 'फार्म फ्रेश एग्स',
    ml: 'ഫാം ഫ്രഷ് മുട്ടകൾ',
    te: 'ఫార్మ్ ఫ్రెష్ ఎగ్స్',
    kn: 'ಫಾರ್ಮ್ ಫ್ರೆಶ್ ಮೊಟ್ಟೆಗಳು',
  },
  'egg-img-04': {
    en: 'Quail Eggs',
    ta: 'காடை முட்டைகள்',
    hi: 'क्वेल एग्स',
    ml: 'കാട മുട്ട',
    te: 'పిట్ట గుడ్లు',
    kn: 'ಕ್ವೇಲ್ ಮೊಟ್ಟೆಗಳು',
  },
  'had-img-01': {
    en: 'Avocado',
    ta: 'வெண்ணெய் பழம்',
    hi: 'एवोकाडो',
    ml: 'അവക്കാഡോ',
    te: 'అవకాడో',
    kn: 'ಅವಕಾಡೊ',
  },
  'had-img-02': {
    en: 'Bell Peppers',
    ta: 'குடமிளகாய்',
    hi: 'बेल पेपर्स',
    ml: 'ബെൽ പെപ്പർ',
    te: 'బెల్ పెప్పర్స్',
    kn: 'ದೊಣ್ಣೆ ಮೆಣಸಿನಕಾಯಿ',
  },
  'had-img-03': {
    en: 'Broccoli',
    ta: 'ப்ரோக்கோலி',
    hi: 'ब्रोकली',
    ml: 'ബ്രോക്കോളി',
    te: 'బ్రోకలీ',
    kn: 'ಬ್ರೊಕೊಲಿ',
  },
  'had-img-04': {
    en: 'Cherry Tomato',
    ta: 'செர்ரி தக்காளி',
    hi: 'चेरी टमाटर',
    ml: 'ചെറി തക്കാളി',
    te: 'చెర్రీ టమాటో',
    kn: 'ಚೆರ್ರಿ ಟೊಮೇಟೊ',
  },
  'had-img-05': {
    en: 'Cucumber',
    ta: 'வெள்ளரிக்காய்',
    hi: 'खीरा',
    ml: 'വെള്ളരിക്ക',
    te: 'దోసకాయ',
    kn: 'ಸೌತೆಕಾಯಿ',
  },
};

const BY_NAME: Record<string, { en: string; ta: string; hi: string; ml: string; te: string; kn: string }> = {};
for (const key in PRODUCT_NAME_TRANSLATIONS) {
  const entry = PRODUCT_NAME_TRANSLATIONS[key];
  BY_NAME[entry.en.trim().toLowerCase()] = entry;
}

// ---------------------------------------------------------------------------
// Auto-translate fallback for products the admin adds AFTER this dictionary
// was written (a brand-new cut, a new combo pack, etc.). Those products have
// no entry above — the id won't match a mock id, and the name won't match
// any BY_NAME key — so without this, they'd show in English forever in every
// non-English language until someone manually added a translation here.
//
// Instead: the first time such a product is rendered in a non-English
// language, we kick off a background call to MyMemory (a free, no-API-key
// translation service — https://mymemory.translated.net) and cache the
// result in localStorage. translateProductName() itself MUST stay
// synchronous (it's called directly inside JSX across ~20 components, so it
// can't await a network call), so that first render still shows English —
// but the cached translation is picked up automatically on the product's
// NEXT render (next page visit, next re-render from an unrelated state
// change, etc.), with zero changes needed in any of those calling
// components. This never touches the admin-owned `products` table — it's a
// purely client-side, localStorage-only cache.
const RUNTIME_CACHE_KEY = 'igo_product_name_auto_translations_v1';
const inFlightTranslations = new Set<string>();

function loadRuntimeCache(): Record<string, string> {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(RUNTIME_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveRuntimeCacheEntry(cacheKey: string, translated: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const cache = loadRuntimeCache();
    cache[cacheKey] = translated;
    localStorage.setItem(RUNTIME_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Quota exceeded or storage unavailable — the fetch just won't be cached
    // this time; the next render will simply retry it.
  }
}

async function fetchAndCacheTranslation(cacheKey: string, name: string, lang: Language): Promise<void> {
  if (inFlightTranslations.has(cacheKey)) return;
  inFlightTranslations.add(cacheKey);
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(name)}&langpair=en|${lang}`
    );
    if (!res.ok) return;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    // MyMemory echoes the query back untranslated (sometimes with a
    // "NO QUERY SPECIFIED" or quota-exceeded message) when it can't do
    // anything useful — skip caching those so we don't lock in garbage.
    if (
      typeof translated === 'string' &&
      translated.trim().length > 0 &&
      translated.trim().toLowerCase() !== name.trim().toLowerCase() &&
      !translated.toUpperCase().includes('QUERY') &&
      !translated.toUpperCase().includes('QUOTA')
    ) {
      saveRuntimeCacheEntry(cacheKey, translated.trim());
    }
  } catch {
    // Offline / API unreachable — silently keep showing English. Next render
    // of this product will just try again.
  } finally {
    inFlightTranslations.delete(cacheKey);
  }
}

/**
 * Returns the display name for a product in the given language.
 *
 * 1. Tries an id-based lookup (works for the bundled local/seed catalog).
 * 2. Falls back to matching the exact English product name text (works
 *    against the live Supabase catalog, whose rows have their own database
 *    ids but were seeded with the same English names as the local catalog).
 * 3. Falls back to a localStorage-cached auto-translation, if one has
 *    already been fetched for this exact name in this language.
 * 4. If none of the above have it, kicks off a background auto-translate
 *    fetch (see above) for next time, and returns the original English name
 *    for now so nothing ever renders blank.
 */
export function translateProductName(id: string, name: string, lang: Language): string {
  if (lang === 'en') return name;
  const byId = PRODUCT_NAME_TRANSLATIONS[id];
  if (byId) return byId[lang] ?? name;
  const byName = BY_NAME[name.trim().toLowerCase()];
  if (byName) return byName[lang] ?? name;

  const cacheKey = `${lang}::${name.trim().toLowerCase()}`;
  const cached = loadRuntimeCache()[cacheKey];
  if (cached) return cached;

  if (typeof window !== 'undefined') {
    void fetchAndCacheTranslation(cacheKey, name, lang);
  }
  return name;
}
