import React from 'react';
import { Check, Minus } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { COMPARISON_FALLBACK } from './WhyIGOSection';
import { useLang, pick } from '../lib/language';

const COMPARISON_FALLBACK_TA = {
  eyebrow: 'போட்டி முன்னிலை',
  heading: 'ஏன் IGO புரோட்டீன் கட்ஸ்?',
  subheading:
    'இறைச்சி துறையில் தரத்திற்கான புதிய தரநிலையை நாங்கள் அமைத்துள்ளோம். உள்ளூர் சந்தையுடன் எங்களை ஒப்பிட்டு, வெளிப்படைத்தன்மை ஏற்படுத்தும் வித்தியாசத்தைப் பாருங்கள்.',
  columns: { feature: 'அம்சம்', igo: 'IGO தரநிலை', local: 'உள்ளூர் சந்தை', competitor: 'போட்டியாளர்கள்' },
  rows: [
    { feature: 'கண்காணிப்பு', igo: 'முழு பண்ணை-முதல்-மேசை (QR ஸ்கேன்)', local: 'இல்லை / வாய்மொழி', competitor: 'குறைந்த பேட்ச் தகவல்' },
    { feature: 'புத்துணர்ச்சி', igo: 'ஒருபோதும் உறையாது (0-4°C எப்போதும்)', local: 'அறை வெப்பநிலை / மாறுபடும்', competitor: 'சேமிப்புக்காக உறைய வைக்கப்பட்டது' },
    { feature: 'செயலாக்கம்', igo: 'ISO 22000 கிருமி நீக்க வசதி', local: 'திறந்தவெளி சந்தை', competitor: 'சாதாரண கிடங்கு' },
    { feature: 'டெலிவரி', igo: '30-90 நிமிட குளிர் சங்கிலி', local: 'டெலிவரி இல்லை', competitor: '3-4 மணி நேரம் / உலர் பை' },
    { feature: 'ஆன்டிபயாடிக்குகள்', igo: '100% ஆன்டிபயாடிக் இல்லாதது', local: 'தெரியவில்லை', competitor: 'தேர்ந்தெடுக்கப்பட்டது' }
  ]
};

const COMPARISON_FALLBACK_HI = {
  eyebrow: 'प्रतिस्पर्धी बढ़त',
  heading: 'IGO प्रोटीन कट्स को क्यों चुनें?',
  subheading:
    'हमने मीट इंडस्ट्री में गुणवत्ता के लिए एक नया मानदंड स्थापित किया है। हमें स्थानीय बाज़ार से तुलना करें और पारदर्शिता से आने वाला फ़र्क़ देखें।',
  columns: { feature: 'विशेषता', igo: 'IGO मानक', local: 'स्थानीय बाज़ार', competitor: 'प्रतिस्पर्धी' },
  rows: [
    { feature: 'ट्रेसेबिलिटी', igo: 'पूरी फार्म-टू-टेबल (QR स्कैन)', local: 'कुछ नहीं / मुंह-ज़बानी', competitor: 'सीमित बैच जानकारी' },
    { feature: 'ताज़गी', igo: 'कभी फ्रोज़न नहीं (हमेशा 0-4°C)', local: 'कमरे का तापमान / अनिश्चित', competitor: 'भंडारण के लिए फ्रोज़न' },
    { feature: 'प्रोसेसिंग', igo: 'ISO 22000 स्टेराइल फैसिलिटी', local: 'खुले बाज़ार में', competitor: 'सामान्य गोदाम' },
    { feature: 'डिलीवरी', igo: '30-90 मिनट कोल्ड-चेन', local: 'कोई डिलीवरी नहीं', competitor: '3-4 घंटे / सूखा बैग' },
    { feature: 'एंटीबायोटिक्स', igo: '100% एंटीबायोटिक-मुक्त', local: 'अज्ञात', competitor: 'चुनिंदा' }
  ]
};

const COMPARISON_FALLBACK_ML = {
  eyebrow: 'മത്സരപരമായ മുൻതൂക്കം',
  heading: 'എന്തുകൊണ്ട് IGO പ്രോട്ടീൻ കട്സ് തിരഞ്ഞെടുക്കണം?',
  subheading:
    'മാംസ വ്യവസായത്തിൽ ഗുണനിലവാരത്തിന് ഞങ്ങൾ ഒരു പുതിയ മാനദണ്ഡം സ്ഥാപിച്ചിരിക്കുന്നു. ഞങ്ങളെ പ്രാദേശിക വിപണിയുമായി താരതമ്യം ചെയ്ത്, സുതാര്യത ഉണ്ടാക്കുന്ന വ്യത്യാസം കാണുക.',
  columns: { feature: 'സവിശേഷത', igo: 'IGO നിലവാരം', local: 'പ്രാദേശിക വിപണി', competitor: 'എതിരാളികൾ' },
  rows: [
    { feature: 'ട്രെയ്സബിലിറ്റി', igo: 'സമ്പൂർണ്ണ ഫാം-ടു-ടേബിൾ (QR സ്കാൻ)', local: 'ഒന്നുമില്ല / വാമൊഴി', competitor: 'പരിമിതമായ ബാച്ച് വിവരം' },
    { feature: 'പുതുമ', igo: 'ഒരിക്കലും ഫ്രീസ് ചെയ്യാറില്ല (എപ്പോഴും 0-4°C)', local: 'മുറി താപനില / വ്യത്യാസപ്പെടും', competitor: 'സംഭരണത്തിനായി ഫ്രീസ് ചെയ്തത്' },
    { feature: 'പ്രോസസ്സിംഗ്', igo: 'ISO 22000 അണുവിമുക്ത സൗകര്യം', local: 'തുറന്ന വിപണി', competitor: 'സാധാരണ വെയർഹൗസ്' },
    { feature: 'ഡെലിവറി', igo: '30-90 മിനിറ്റ് കോൾഡ്-ചെയിൻ', local: 'ഡെലിവറി ഇല്ല', competitor: '3-4 മണിക്കൂർ / ഡ്രൈ ബാഗ്' },
    { feature: 'ആന്റിബയോട്ടിക്കുകൾ', igo: '100% ആന്റിബയോട്ടിക് രഹിതം', local: 'അജ്ഞാതം', competitor: 'തിരഞ്ഞെടുത്തത്' }
  ]
};

const COMPARISON_FALLBACK_TE = {
  eyebrow: 'పోటీ ప్రయోజనం',
  heading: 'IGO ప్రోటీన్ కట్స్‌ను ఎందుకు ఎంచుకోవాలి?',
  subheading:
    'మాంస పరిశ్రమలో నాణ్యత కోసం మేము ఒక కొత్త ప్రమాణాన్ని నెలకొల్పాము. మమ్మల్ని స్థానిక మార్కెట్‌తో పోల్చి, పారదర్శకత తెచ్చే తేడాను చూడండి.',
  columns: { feature: 'ఫీచర్', igo: 'IGO ప్రమాణం', local: 'స్థానిక మార్కెట్', competitor: 'పోటీదారులు' },
  rows: [
    { feature: 'ట్రేసబిలిటీ', igo: 'పూర్తి ఫార్మ్-టు-టేబుల్ (QR స్కాన్)', local: 'ఏమీ లేదు / మాటల ద్వారా', competitor: 'పరిమిత బ్యాచ్ సమాచారం' },
    { feature: 'తాజాదనం', igo: 'ఎప్పుడూ ఫ్రీజ్ చేయబడదు (ఎల్లప్పుడూ 0-4°C)', local: 'గది ఉష్ణోగ్రత / మారుతూ ఉంటుంది', competitor: 'నిల్వ కోసం ఫ్రీజ్ చేయబడింది' },
    { feature: 'ప్రాసెసింగ్', igo: 'ISO 22000 స్టెరైల్ ఫెసిలిటీ', local: 'బహిరంగ మార్కెట్', competitor: 'సాధారణ గోడౌన్' },
    { feature: 'డెలివరీ', igo: '30-90 నిమిషాల కోల్డ్-చైన్', local: 'డెలివరీ లేదు', competitor: '3-4 గంటలు / డ్రై బ్యాగ్' },
    { feature: 'యాంటీబయాటిక్స్', igo: '100% యాంటీబయాటిక్-రహితం', local: 'తెలియదు', competitor: 'ఎంపిక చేయబడింది' }
  ]
};

// Consolidated "Why Choose IGO" trust section — merges what used to be five
// separate stacked sections (Freshness Promise pillars, Farm-to-Home 4-step
// process, Why-IGO comparison table + bento grid, and Quality Certifications
// carousel) into ONE section so the homepage doesn't read as a wall of
// repeated "we're antibiotic-free / cold chain / certified" messaging.
// Every unique fact from those sections is still here — the table, the 4
// trust pillars, and the cert badges — just presented once, compactly,
// instead of several times in several different visual styles. (The batch
// trace tool that used to live at the bottom of this section was removed
// from the homepage per explicit request.)

/**
 * Reads the SAME two blocks as WhyIGOSection and QualityCertificationsSection.
 *
 * Before this, the comparison table was copy-pasted here verbatim and the
 * certification list existed in three files with three different sets of
 * entries — TrustSection listed 3, QualityCertifications listed 4 including a
 * duplicate, OurFarms listed 4 including "100% Halal" that the others omitted.
 * They're now one authoritative block each, edited in /admin → Sections.
 */
const CERTS_FALLBACK = {
  eyebrow: 'Verified Origins',
  heading: 'Premium Standards, Verified and Trusted.',
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck', desc: 'Food Safety Management', year: '2027' },
    { name: 'HACCP', icon: 'Award', desc: 'Risk Assessment Standard', year: '2027' },
    { name: 'FSSAI Licensed', icon: 'Globe', desc: 'Lic: 10022043000918', year: '2027' },
    { name: '100% Halal', icon: 'Sprout', desc: 'Zabiha certified sourcing', year: '' }
  ]
};
const CERTS_FALLBACK_TA = {
  eyebrow: 'சரிபார்க்கப்பட்ட தோற்றம்',
  heading: 'உயர்தர தரநிலைகள், சரிபார்க்கப்பட்டு நம்பப்படுகிறது.',
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck', desc: 'உணவு பாதுகாப்பு மேலாண்மை', year: '2027' },
    { name: 'HACCP', icon: 'Award', desc: 'ஆபத்து மதிப்பீட்டு தரநிலை', year: '2027' },
    { name: 'FSSAI உரிமம்', icon: 'Globe', desc: 'உரிமம்: 10022043000918', year: '2027' },
    { name: '100% ஹலால்', icon: 'Sprout', desc: 'ஜபிஹா சான்றளிக்கப்பட்ட ஆதாரம்', year: '' }
  ]
};

const CERTS_FALLBACK_HI = {
  eyebrow: 'सत्यापित मूल',
  heading: 'प्रीमियम मानक, सत्यापित और भरोसेमंद।',
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck', desc: 'खाद्य सुरक्षा प्रबंधन', year: '2027' },
    { name: 'HACCP', icon: 'Award', desc: 'जोखिम मूल्यांकन मानक', year: '2027' },
    { name: 'FSSAI लाइसेंस प्राप्त', icon: 'Globe', desc: 'लाइसेंस: 10022043000918', year: '2027' },
    { name: '100% हलाल', icon: 'Sprout', desc: 'ज़बीहा प्रमाणित सोर्सिंग', year: '' }
  ]
};
const CERTS_FALLBACK_ML = {
  eyebrow: 'സ്ഥിരീകരിച്ച ഉത്ഭവം',
  heading: 'പ്രീമിയം നിലവാരം, സ്ഥിരീകരിച്ചതും വിശ്വസനീയവും.',
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck', desc: 'ഭക്ഷ്യ സുരക്ഷാ മാനേജ്മെന്റ്', year: '2027' },
    { name: 'HACCP', icon: 'Award', desc: 'റിസ്ക് അസസ്മെന്റ് സ്റ്റാൻഡേർഡ്', year: '2027' },
    { name: 'FSSAI ലൈസൻസുള്ളത്', icon: 'Globe', desc: 'ലൈസൻസ്: 10022043000918', year: '2027' },
    { name: '100% ഹലാൽ', icon: 'Sprout', desc: 'സബീഹ സർട്ടിഫൈഡ് സോഴ്സിംഗ്', year: '' }
  ]
};
const CERTS_FALLBACK_TE = {
  eyebrow: 'ధృవీకరించబడిన మూలం',
  heading: 'ప్రీమియం ప్రమాణాలు, ధృవీకరించబడినవి మరియు నమ్మదగినవి.',
  items: [
    { name: 'ISO 22000', icon: 'ShieldCheck', desc: 'ఆహార భద్రతా నిర్వహణ', year: '2027' },
    { name: 'HACCP', icon: 'Award', desc: 'రిస్క్ అసెస్‌మెంట్ ప్రమాణం', year: '2027' },
    { name: 'FSSAI లైసెన్స్ పొందినది', icon: 'Globe', desc: 'లైసెన్స్: 10022043000918', year: '2027' },
    { name: '100% హలాల్', icon: 'Sprout', desc: 'జబీహా సర్టిఫైడ్ సోర్సింగ్', year: '' }
  ]
};

export const TrustSection: React.FC = () => {
  const { lang } = useLang();
  const comparisonBlock = useSiteContent('sections.comparison', COMPARISON_FALLBACK);
  const certsBlock = useSiteContent('sections.certifications', CERTS_FALLBACK);

  const resolvedComparison =
    lang === 'ta' ? COMPARISON_FALLBACK_TA : lang === 'hi' ? COMPARISON_FALLBACK_HI : lang === 'ml' ? COMPARISON_FALLBACK_ML : lang === 'te' ? COMPARISON_FALLBACK_TE : comparisonBlock;
  const resolvedCerts =
    lang === 'ta' ? CERTS_FALLBACK_TA : lang === 'hi' ? CERTS_FALLBACK_HI : lang === 'ml' ? CERTS_FALLBACK_ML : lang === 'te' ? CERTS_FALLBACK_TE : certsBlock;

  const comparison = resolvedComparison.rows;
  const certs = resolvedCerts.items.map((c) => ({
    name: c.name,
    desc: c.desc,
    icon: resolveIcon(c.icon)
  }));

  return (
    <section className="bg-emerald-50/60 border-y border-emerald-100 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            {pick(lang, { en: 'Why Choose Us', ta: 'ஏன் எங்களை தேர்வு செய்ய வேண்டும்', hi: 'हमें क्यों चुनें', ml: 'ഞങ്ങളെ എന്തുകൊണ്ട് തിരഞ്ഞെടുക്കണം', te: 'మమ్మల్ని ఎందుకు ఎంచుకోవాలి' })}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
            {pick(lang, { en: 'Why Choose IGO Protein Cuts?', ta: 'ஏன் IGO புரோட்டீன் கட்ஸை தேர்வு செய்ய வேண்டும்?', hi: 'IGO प्रोटीन कट्स को क्यों चुनें?', ml: 'എന്തുകൊണ്ട് IGO പ്രോട്ടീൻ കട്സ് തിരഞ്ഞെടുക്കണം?', te: 'IGO ప్రోటీన్ కట్స్‌ను ఎందుకు ఎంచుకోవాలి?' })}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            {pick(lang, {
              en: 'An objective, feature-by-feature comparison — not marketing copy. See exactly what "farm to table" means in practice.',
              ta: 'ஒரு புறநிலையான, அம்சம்-வாரியான ஒப்பீடு — சந்தைப்படுத்தல் பிரதி அல்ல. "பண்ணையிலிருந்து மேசை வரை" என்பது நடைமுறையில் என்ன என்பதைப் பாருங்கள்.',
              hi: 'एक निष्पक्ष, फीचर-दर-फीचर तुलना — मार्केटिंग कॉपी नहीं। देखें कि व्यवहार में "फार्म टू टेबल" का वास्तव में क्या मतलब है।',
              ml: 'വസ്തുനിഷ്ഠമായ, സവിശേഷത അടിസ്ഥാനത്തിലുള്ള താരതമ്യം — മാർക്കറ്റിംഗ് വാചകമല്ല. "ഫാം ടു ടേബിൾ" പ്രായോഗികമായി എന്താണ് അർത്ഥമാക്കുന്നതെന്ന് കൃത്യമായി കാണുക.',
              te: 'ఒక నిష్పాక్షిక, ఫీచర్-బై-ఫీచర్ పోలిక — మార్కెటింగ్ కాపీ కాదు. ఆచరణలో "ఫార్మ్ టు టేబుల్" అంటే నిజంగా ఏమిటో సరిగ్గా చూడండి.'
            })}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto no-scrollbar rounded-3xl border border-neutral-200 shadow-lg shadow-emerald-950/5 bg-white">
          <table className="w-full border-collapse min-w-[640px] text-left">
            <thead>
              <tr className="bg-[#0A1F12]">
                <th className="py-5 px-6 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                  {resolvedComparison.columns.feature}
                </th>
                <th className="py-5 px-6 bg-[#0F7B3A]/20 border-x border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#0F7B3A] rounded-lg flex items-center justify-center text-white shadow">
                      {React.createElement(resolveIcon('ShieldCheck'), { className: 'w-4.5 h-4.5' })}
                    </div>
                    <span className="font-black text-white text-sm tracking-tight">
                      {resolvedComparison.columns.igo}
                    </span>
                  </div>
                </th>
                <th className="py-5 px-6 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                  {resolvedComparison.columns.local}
                </th>
                <th className="py-5 px-6 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                  {resolvedComparison.columns.competitor}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={`border-b border-neutral-100 last:border-0 hover:bg-emerald-50/40 transition-colors ${
                    idx % 2 === 1 ? 'bg-neutral-50/50' : 'bg-white'
                  }`}
                >
                  <td className="py-5 px-6 font-bold text-[#0A1F12] text-xs">{row.feature}</td>
                  <td className="py-5 px-6 bg-emerald-50/50 border-x border-emerald-100/70">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-xs">
                      <div className="w-6 h-6 rounded-full bg-[#0F7B3A] flex items-center justify-center shrink-0 shadow-sm shadow-emerald-900/30">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      {row.igo}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-neutral-500 text-xs">
                    <div className="flex items-center gap-2">
                      <Minus className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                      {row.local}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-neutral-500 text-xs">
                    <div className="flex items-center gap-2">
                      <Minus className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                      {row.competitor}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Certification Badge Strip — 4 items, so the grid steps through
            1 -> 2 -> 4 columns rather than 3, which stranded the 4th badge
            alone on its own half-empty row. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {certs.map((cert) => {
            const Icon = cert.icon;
            return (
              <div
                key={cert.name}
                className="flex items-center gap-3 bg-white border border-emerald-100 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#0A1F12] leading-tight">{cert.name}</div>
                  <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">{cert.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
