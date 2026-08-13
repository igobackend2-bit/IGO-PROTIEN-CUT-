import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Building2, Truck, FileBadge, PhoneCall, Percent, Package } from 'lucide-react';
import { submitLead } from '../lib/api/catalog';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang, pick } from '../lib/language';

const BUSINESS_TYPES = ['Restaurant / Cloud Kitchen', 'Hotel / Catering', 'Retail / Butcher Shop', 'Hostel / Institution', 'Other Bulk Buyer'];
const BUSINESS_TYPES_TA: Record<string, string> = {
  'Restaurant / Cloud Kitchen': 'உணவகம் / கிளவுட் கிச்சன்',
  'Hotel / Catering': 'ஹோட்டல் / கேட்டரிங்',
  'Retail / Butcher Shop': 'சில்லறை / கசாப்புக் கடை',
  'Hostel / Institution': 'ஹாஸ்டல் / நிறுவனம்',
  'Other Bulk Buyer': 'மற்ற மொத்த வாங்குபவர்'
};
const BUSINESS_TYPES_HI: Record<string, string> = {
  'Restaurant / Cloud Kitchen': 'रेस्टोरेंट / क्लाउड किचन',
  'Hotel / Catering': 'होटल / कैटरिंग',
  'Retail / Butcher Shop': 'रिटेल / कसाई की दुकान',
  'Hostel / Institution': 'हॉस्टल / संस्थान',
  'Other Bulk Buyer': 'अन्य थोक खरीदार'
};
const BUSINESS_TYPES_ML: Record<string, string> = {
  'Restaurant / Cloud Kitchen': 'റെസ്റ്റോറന്റ് / ക്ലൗഡ് കിച്ചൻ',
  'Hotel / Catering': 'ഹോട്ടൽ / കാറ്ററിംഗ്',
  'Retail / Butcher Shop': 'റീട്ടെയിൽ / ബുച്ചർ ഷോപ്പ്',
  'Hostel / Institution': 'ഹോസ്റ്റൽ / സ്ഥാപനം',
  'Other Bulk Buyer': 'മറ്റ് മൊത്ത വാങ്ങുന്നവർ'
};
const BUSINESS_TYPES_TE: Record<string, string> = {
  'Restaurant / Cloud Kitchen': 'రెస్టారెంట్ / క్లౌడ్ కిచెన్',
  'Hotel / Catering': 'హోటల్ / క్యాటరింగ్',
  'Retail / Butcher Shop': 'రిటైల్ / బుచర్ షాప్',
  'Hostel / Institution': 'హాస్టల్ / సంస్థ',
  'Other Bulk Buyer': 'ఇతర హోల్‌సేల్ కొనుగోలుదారు'
};

export const B2BPage: React.FC = () => {
  const { lang } = useLang();
  // Only the hero title/intro are admin-editable (via /admin → Pages & SEO →
  // B2B page). The value-prop cards and form below stay hardcoded — they
  // aren't a generic heading/body list.
  const content = useSiteContent('pages.b2b', {
    title: 'Bulk & B2B Protein Supply',
    intro:
      'Restaurants, cloud kitchens, hotels, and institutions get wholesale pricing, custom labeling, dedicated delivery slots, and a single point of contact.'
  });
  const contentTa = {
    title: 'மொத்த & B2B புரதம் சப்ளை',
    intro:
      'உணவகங்கள், கிளவுட் கிச்சன்கள், ஹோட்டல்கள் மற்றும் நிறுவனங்கள் மொத்த விலை, தனிப்பயன் லேபிளிங், பிரத்யேக டெலிவரி நேரங்கள் மற்றும் ஒரே தொடர்பு புள்ளியைப் பெறுகின்றன.'
  };
  const contentHi = {
    title: 'थोक और B2B प्रोटीन आपूर्ति',
    intro:
      'रेस्टोरेंट, क्लाउड किचन, होटल और संस्थानों को थोक मूल्य, कस्टम लेबलिंग, समर्पित डिलीवरी स्लॉट और एक ही संपर्क बिंदु मिलता है।'
  };
  const contentMl = {
    title: 'മൊത്ത & B2B പ്രോട്ടീൻ വിതരണം',
    intro:
      'റെസ്റ്റോറന്റുകൾ, ക്ലൗഡ് കിച്ചണുകൾ, ഹോട്ടലുകൾ, സ്ഥാപനങ്ങൾ എന്നിവയ്ക്ക് മൊത്ത വില, കസ്റ്റം ലേബലിംഗ്, സമർപ്പിത ഡെലിവറി സ്ലോട്ടുകൾ, ഒരൊറ്റ ബന്ധപ്പെടാനുള്ള പോയിന്റ് എന്നിവ ലഭിക്കുന്നു.'
  };
  const contentTe = {
    title: 'హోల్‌సేల్ & B2B ప్రోటీన్ సరఫరా',
    intro:
      'రెస్టారెంట్లు, క్లౌడ్ కిచెన్లు, హోటళ్లు మరియు సంస్థలకు హోల్‌సేల్ ధర, కస్టమ్ లేబులింగ్, ప్రత్యేక డెలివరీ స్లాట్‌లు మరియు ఒకే సంప్రదింపు పాయింట్ లభిస్తుంది.'
  };
  const resolvedContent = lang === 'ta' ? contentTa
    : lang === 'hi' ? contentHi
    : lang === 'ml' ? contentMl
    : lang === 'te' ? contentTe
    : content;

  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: BUSINESS_TYPES[0],
    monthlyVolume: '',
    city: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Previously the only check here was "is businessName/phone non-empty" —
  // any string passed, so the form happily accepted things like "fjhgjh" as
  // a business name, an 18-digit string as a phone number, or digits typed
  // into the City field. This validates real formats before anything is
  // sent to the leads table.
  const validate = (): string | null => {
    if (formData.businessName.trim().length < 2) {
      return pick(lang, { en: 'Please enter a valid business name.', ta: 'சரியான வணிகப் பெயரை உள்ளிடவும்.', hi: 'कृपया एक मान्य व्यवसाय नाम दर्ज करें।', ml: 'ദയവായി സാധുവായ ബിസിനസ്സ് പേര് നൽകുക.', te: 'దయచేసి చెల్లుబాటు అయ్యే వ్యాపార పేరును నమోదు చేయండి.' });
    }
    const digitsOnlyPhone = formData.phone.replace(/[^0-9]/g, '');
    // Indian mobile numbers: 10 digits, optionally prefixed with a 91
    // country code (so "+91 98200 11223" and "9820011223" both pass).
    const localPhone = digitsOnlyPhone.length === 12 && digitsOnlyPhone.startsWith('91')
      ? digitsOnlyPhone.slice(2)
      : digitsOnlyPhone;
    if (!/^[6-9][0-9]{9}$/.test(localPhone)) {
      return pick(lang, { en: 'Please enter a valid 10-digit Indian mobile number.', ta: 'சரியான 10-இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்.', hi: 'कृपया एक मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।', ml: 'ദയവായി സാധുവായ 10 അക്ക ഇന്ത്യൻ മൊബൈൽ നമ്പർ നൽകുക.', te: 'దయచేసి చెల్లుబాటు అయ్యే 10-అంకెల భారతీయ మొబైల్ నంబర్‌ను నమోదు చేయండి.' });
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return pick(lang, { en: 'Please enter a valid email address.', ta: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.', hi: 'कृपया एक मान्य ईमेल पता दर्ज करें।', ml: 'ദയവായി സാധുവായ ഇമെയിൽ വിലാസം നൽകുക.', te: 'దయచేసి చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామాను నమోదు చేయండి.' });
    }
    if (!/[a-zA-Z]/.test(formData.city.trim()) || formData.city.trim().length < 2) {
      return pick(lang, { en: 'Please enter a valid city name.', ta: 'சரியான நகரத்தின் பெயரை உள்ளிடவும்.', hi: 'कृपया एक मान्य शहर का नाम दर्ज करें।', ml: 'ദയവായി സാധുവായ നഗരത്തിന്റെ പേര് നൽകുക.', te: 'దయచేసి చెల్లుబాటు అయ్యే నగరం పేరును నమోదు చేయండి.' });
    }
    return null;
  };

  // Previously this only flipped local `submitted` state to true — nothing
  // was ever saved anywhere, so every "Inquiry Received!" the customer saw
  // was fake and the admin's Leads tab stayed empty forever regardless of
  // how many people filled this form in. Now it actually writes to the same
  // `igo_leads` table the Franchise page's form already saves to correctly.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.phone) return;

    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    const result = await submitLead({
      leadType: 'b2b',
      fullName: formData.contactName || formData.businessName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      message: `Business Name: ${formData.businessName}\nBusiness Type: ${formData.businessType}\nEstimated Monthly Volume: ${formData.monthlyVolume || 'Not specified'}`
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error || pick(lang, {
        en: 'Could not submit your enquiry. Please try again or call/email us directly.',
        ta: 'உங்கள் விசாரணையை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது நேரடியாக அழையுங்கள்/மின்னஞ்சல் செய்யுங்கள்.',
        hi: 'आपकी पूछताछ सबमिट नहीं हो सकी। कृपया पुनः प्रयास करें या सीधे हमें कॉल/ईमेल करें।',
        ml: 'നിങ്ങളുടെ അന്വേഷണം സമർപ്പിക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ ഞങ്ങളെ നേരിട്ട് വിളിക്കുക/ഇമെയിൽ ചെയ്യുക.',
        te: 'మీ విచారణను సమర్పించలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి లేదా నేరుగా మాకు కాల్/ఇమెయిల్ చేయండి.'
      }));
      return;
    }
    setSubmitted(true);
  };

  const mailtoHref = `mailto:b2b@igoproteincuts.com?subject=B2B%20Wholesale%20Inquiry%20-%20${encodeURIComponent(
    formData.businessName || 'New Business'
  )}&body=${encodeURIComponent(
    `Business Name: ${formData.businessName}\nContact: ${formData.contactName}\nPhone: ${formData.phone}\nBusiness Type: ${formData.businessType}\nEstimated Monthly Volume: ${formData.monthlyVolume}\nCity: ${formData.city}`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Banner */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-3 text-white shadow-lg shadow-emerald-950/20">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          {pick(lang, { en: 'IGO WHOLESALE PORTAL', ta: 'IGO மொத்த விற்பனை போர்ட்டல்', hi: 'IGO होलसेल पोर्टल', ml: 'IGO ഹോൾസെയിൽ പോർട്ടൽ', te: 'IGO హోల్‌సేల్ పోర్టల్' })}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{resolvedContent.title}</h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto">{resolvedContent.intro}</p>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(lang === 'ta'
          ? [
              { icon: Percent, title: 'மொத்த விலை', desc: 'மாதாந்திர அளவிற்கு ஏற்ப, பட்டியல் விலையில் 15% வரை அடுக்கு தள்ளுபடிகள்.' },
              { icon: Truck, title: 'பிரத்யேக டெலிவரி நேரங்கள்', desc: 'உங்கள் சமையலறை தயாரிப்பு அட்டவணைக்கு ஏற்ப முன்னுரிமை அதிகாலை டெலிவரி நேரங்கள்.' },
              { icon: FileBadge, title: 'தனிப்பயன் லேபிளிங்', desc: 'உங்கள் வணிகத்திற்கு வொயிட்-லேபிள் பேக்கேஜிங் மற்றும் GST-இணக்கமான இன்வாய்சிங்.' },
              { icon: Package, title: 'நிலையான சப்ளை', desc: 'ஒப்பந்த அளவுகளுக்கு உத்தரவாத பங்கு ஒதுக்கீடு — கடைசி நிமிட பற்றாக்குறை இல்லை.' }
            ]
          : lang === 'hi'
          ? [
              { icon: Percent, title: 'थोक मूल्य', desc: 'मासिक मात्रा के अनुसार बढ़ते हुए, कैटलॉग मूल्य पर 15% तक की स्तरीय छूट।' },
              { icon: Truck, title: 'समर्पित डिलीवरी स्लॉट', desc: 'आपके किचन प्रेप शेड्यूल के अनुसार प्राथमिकता वाले सुबह जल्दी डिलीवरी विंडो।' },
              { icon: FileBadge, title: 'कस्टम लेबलिंग', desc: 'आपके व्यवसाय के लिए व्हाइट-लेबल पैकेजिंग और GST-अनुपालक चालान।' },
              { icon: Package, title: 'निरंतर आपूर्ति', desc: 'अनुबंधित मात्रा के लिए गारंटीशुदा स्टॉक आवंटन — कोई अंतिम समय की कमी नहीं।' }
            ]
          : lang === 'ml'
          ? [
              { icon: Percent, title: 'മൊത്ത വില', desc: 'പ്രതിമാസ അളവിനനുസരിച്ച് ഉയരുന്ന, കാറ്റലോഗ് വിലയിൽ 15% വരെ തട്ടുതട്ടായുള്ള കിഴിവുകൾ.' },
              { icon: Truck, title: 'സമർപ്പിത ഡെലിവറി സ്ലോട്ടുകൾ', desc: 'നിങ്ങളുടെ അടുക്കള തയ്യാറെടുപ്പ് ഷെഡ്യൂളിന് ചുറ്റും നിർമ്മിച്ച മുൻഗണനാ അതിരാവിലെ ഡെലിവറി വിൻഡോകൾ.' },
              { icon: FileBadge, title: 'കസ്റ്റം ലേബലിംഗ്', desc: 'നിങ്ങളുടെ ബിസിനസ്സിനായി വൈറ്റ്-ലേബൽ പാക്കേജിംഗും GST-അനുസൃത ഇൻവോയ്സിംഗും.' },
              { icon: Package, title: 'സ്ഥിരമായ വിതരണം', desc: 'കരാർ ചെയ്ത അളവുകൾക്ക് ഗ്യാരണ്ടിഡ് സ്റ്റോക്ക് അലോക്കേഷൻ — അവസാന നിമിഷ ക്ഷാമമില്ല.' }
            ]
          : lang === 'te'
          ? [
              { icon: Percent, title: 'హోల్‌సేల్ ధర', desc: 'నెలవారీ పరిమాణానికి అనుగుణంగా పెరుగుతూ, కేటలాగ్ ధరపై 15% వరకు అంచెల తగ్గింపులు.' },
              { icon: Truck, title: 'ప్రత్యేక డెలివరీ స్లాట్‌లు', desc: 'మీ కిచెన్ ప్రిప్ షెడ్యూల్ చుట్టూ రూపొందించిన ప్రాధాన్యత గల ఉదయపు డెలివరీ విండోలు.' },
              { icon: FileBadge, title: 'కస్టమ్ లేబులింగ్', desc: 'మీ వ్యాపారం కోసం వైట్-లేబుల్ ప్యాకేజింగ్ మరియు GST-అనుకూల ఇన్వాయిసింగ్.' },
              { icon: Package, title: 'స్థిరమైన సరఫరా', desc: 'ఒప్పంద పరిమాణాలకు హామీ ఇవ్వబడిన స్టాక్ కేటాయింపు — చివరి నిమిషంలో కొరత ఉండదు.' }
            ]
          : [
              { icon: Percent, title: 'Wholesale Pricing', desc: 'Tiered discounts up to 15% off catalog price, scaling with monthly volume.' },
              { icon: Truck, title: 'Dedicated Delivery Slots', desc: 'Priority early-morning delivery windows built around your kitchen prep schedule.' },
              { icon: FileBadge, title: 'Custom Labeling', desc: 'White-label packaging and GST-compliant invoicing for your business.' },
              { icon: Package, title: 'Consistent Supply', desc: 'Guaranteed stock allocation for contracted volumes — no last-minute shortages.' }
            ]
        ).map((v) => (
          <div key={v.title} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <v.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0A1F12] text-sm">{v.title}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0A1F12]">
            {pick(lang, { en: 'Who We Work With', ta: 'நாங்கள் யாருடன் பணிபுரிகிறோம்', hi: 'हम किनके साथ काम करते हैं', ml: 'ഞങ്ങൾ ആരുമായി ചേർന്ന് പ്രവർത്തിക്കുന്നു', te: 'మేము ఎవరితో పని చేస్తాము' })}
          </h2>
          <div className="space-y-4">
            {BUSINESS_TYPES.map((type) => (
              <div key={type} className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-[#0A1F12]">
                  {lang === 'ta' ? BUSINESS_TYPES_TA[type] ?? type
                    : lang === 'hi' ? BUSINESS_TYPES_HI[type] ?? type
                    : lang === 'ml' ? BUSINESS_TYPES_ML[type] ?? type
                    : lang === 'te' ? BUSINESS_TYPES_TE[type] ?? type
                    : type}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#0A1F12]">
                {pick(lang, { en: 'Prefer to talk first?', ta: 'முதலில் பேச விரும்புகிறீர்களா?', hi: 'पहले बात करना पसंद करेंगे?', ml: 'ആദ്യം സംസാരിക്കാൻ താൽപ്പര്യമുണ്ടോ?', te: 'ముందుగా మాట్లాడాలనుకుంటున్నారా?' })}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                {pick(lang, { en: 'Call our B2B desk at', ta: 'எங்கள் B2B டெஸ்கை அழையுங்கள்', hi: 'हमारे B2B डेस्क पर कॉल करें', ml: 'ഞങ്ങളുടെ B2B ഡെസ്കിലേക്ക് വിളിക്കുക', te: 'మా B2B డెస్క్‌కు కాల్ చేయండి' })}{' '}
                <a href="tel:1800-446-446" className="font-bold text-emerald-700">1800-446-446</a>{' '}
                {pick(lang, { en: 'or email', ta: 'அல்லது மின்னஞ்சல்', hi: 'या ईमेल करें', ml: 'അല്ലെങ്കിൽ ഇമെയിൽ ചെയ്യുക', te: 'లేదా ఇమెయిల్ చేయండి' })}{' '}
                <a href="mailto:b2b@igoproteincuts.com" className="font-bold text-emerald-700">b2b@igoproteincuts.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0A1F12] mb-2">
            {pick(lang, { en: 'Request a Wholesale Quote', ta: 'மொத்த விலை மேற்கோள் கோருங்கள்', hi: 'थोक कोटेशन का अनुरोध करें', ml: 'മൊത്ത വില ക്വോട്ട് അഭ്യർത്ഥിക്കുക', te: 'హోల్‌సేల్ కోట్‌ను అభ్యర్థించండి' })}
          </h3>
          <p className="text-xs text-neutral-500 mb-6">
            {pick(lang, {
              en: 'Our B2B team responds within 24 hours with pricing tailored to your volume.',
              ta: 'உங்கள் B2B குழு உங்கள் அளவிற்கு ஏற்ப விலையுடன் 24 மணி நேரத்திற்குள் பதிலளிக்கும்.',
              hi: 'हमारी B2B टीम आपकी मात्रा के अनुसार मूल्य निर्धारण के साथ 24 घंटे के भीतर जवाब देती है।',
              ml: 'നിങ്ങളുടെ അളവിന് അനുയോജ്യമായ വിലനിർണ്ണയത്തോടെ ഞങ്ങളുടെ B2B ടീം 24 മണിക്കൂറിനുള്ളിൽ പ്രതികരിക്കും.',
              te: 'మీ పరిమాణానికి అనుగుణంగా ధరతో మా B2B బృందం 24 గంటల్లో స్పందిస్తుంది.'
            })}
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#0A1F12] text-base">
                {pick(lang, { en: 'Inquiry Received!', ta: 'விசாரணை பெறப்பட்டது!', hi: 'पूछताछ प्राप्त हुई!', ml: 'അന്വേഷണം ലഭിച്ചു!', te: 'విచారణ స్వీకరించబడింది!' })}
              </h4>
              <p className="text-xs text-neutral-600">
                {pick(lang, {
                  en: `We'll reach out to ${formData.contactName || 'you'} shortly. Want to follow up directly?`,
                  ta: `நாங்கள் விரைவில் ${formData.contactName || 'உங்களை'} தொடர்பு கொள்வோம். நேரடியாக பின்தொடர விரும்புகிறீர்களா?`,
                  hi: `हम जल्द ही ${formData.contactName || 'आपसे'} संपर्क करेंगे। सीधे फॉलो-अप करना चाहते हैं?`,
                  ml: `ഞങ്ങൾ ഉടൻ ${formData.contactName || 'നിങ്ങളെ'} ബന്ധപ്പെടും. നേരിട്ട് ഫോളോ-അപ്പ് ചെയ്യണോ?`,
                  te: `మేము త్వరలో ${formData.contactName || 'మిమ్మల్ని'} సంప్రదిస్తాము. నేరుగా ఫాలో అప్ చేయాలనుకుంటున్నారా?`
                })}{' '}
                <a href={mailtoHref} className="font-bold text-emerald-700 underline">
                  {pick(lang, { en: 'Email us the details', ta: 'விவரங்களை மின்னஞ்சல் செய்யுங்கள்', hi: 'हमें विवरण ईमेल करें', ml: 'വിശദാംശങ്ങൾ ഞങ്ങൾക്ക് ഇമെയിൽ ചെയ്യുക', te: 'వివరాలను మాకు ఇమెయిల్ చేయండి' })}
                </a>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  {pick(lang, { en: 'Business Name *', ta: 'வணிகத்தின் பெயர் *', hi: 'व्यवसाय का नाम *', ml: 'ബിസിനസ്സിന്റെ പേര് *', te: 'వ్యాపార పేరు *' })}
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder={pick(lang, { en: 'e.g. Spice Route Kitchen', ta: 'எ.கா. ஸ்பைஸ் ரூட் கிச்சன்', hi: 'उदा. स्पाइस रूट किचन', ml: 'ഉദാ. സ്പൈസ് റൂട്ട് കിച്ചൻ', te: 'ఉదా. స్పైస్ రూట్ కిచెన్' })}
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">
                    {pick(lang, { en: 'Contact Name', ta: 'தொடர்பு பெயர்', hi: 'संपर्क नाम', ml: 'ബന്ധപ്പെടേണ്ട പേര്', te: 'సంప్రదింపు పేరు' })}
                  </label>
                  <input
                    type="text"
                    placeholder={pick(lang, { en: 'Your name', ta: 'உங்கள் பெயர்', hi: 'आपका नाम', ml: 'നിങ്ങളുടെ പേര്', te: 'మీ పేరు' })}
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">
                    {pick(lang, { en: 'Phone *', ta: 'தொலைபேசி *', hi: 'फ़ोन *', ml: 'ഫോൺ *', te: 'ఫోన్ *' })}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={17}
                    placeholder="+91 98200 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  {pick(lang, { en: 'Email', ta: 'மின்னஞ்சல்', hi: 'ईमेल', ml: 'ഇമെയിൽ', te: 'ఇమెయిల్' })}
                </label>
                <input
                  type="email"
                  placeholder="you@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">
                    {pick(lang, { en: 'Business Type', ta: 'வணிக வகை', hi: 'व्यवसाय का प्रकार', ml: 'ബിസിനസ്സ് തരം', te: 'వ్యాపార రకం' })}
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {lang === 'ta' ? BUSINESS_TYPES_TA[t] ?? t
                          : lang === 'hi' ? BUSINESS_TYPES_HI[t] ?? t
                          : lang === 'ml' ? BUSINESS_TYPES_ML[t] ?? t
                          : lang === 'te' ? BUSINESS_TYPES_TE[t] ?? t
                          : t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">
                    {pick(lang, { en: 'Est. Monthly Volume', ta: 'மதிப்பிடப்பட்ட மாதாந்திர அளவு', hi: 'अनुमानित मासिक मात्रा', ml: 'ഏകദേശ പ്രതിമാസ അളവ്', te: 'అంచనా నెలవారీ పరిమాణం' })}
                  </label>
                  <input
                    type="text"
                    placeholder={pick(lang, { en: 'e.g. 200kg / month', ta: 'எ.கா. 200kg / மாதம்', hi: 'उदा. 200kg / माह', ml: 'ഉദാ. 200kg / മാസം', te: 'ఉదా. 200kg / నెల' })}
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  {pick(lang, { en: 'City *', ta: 'நகரம் *', hi: 'शहर *', ml: 'നഗരം *', te: 'నగరం *' })}
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder={pick(lang, { en: 'e.g. Bengaluru', ta: 'எ.கா. பெங்களூரு', hi: 'उदा. बेंगलुरु', ml: 'ഉദാ. ബെംഗളൂരു', te: 'ఉదా. బెంగళూరు' })}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {submitError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{submitError}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? pick(lang, { en: 'Submitting…', ta: 'சமர்ப்பிக்கிறது…', hi: 'सबमिट हो रहा है…', ml: 'സമർപ്പിക്കുന്നു…', te: 'సమర్పిస్తోంది…' })
                  : (<>{pick(lang, { en: 'Request Quote', ta: 'மேற்கோள் கோருங்கள்', hi: 'कोटेशन का अनुरोध करें', ml: 'ക്വോട്ട് അഭ്യർത്ഥിക്കുക', te: 'కోట్‌ను అభ్యర్థించండి' })} <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
