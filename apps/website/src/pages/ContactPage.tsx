import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Clock, CheckCircle2, Send, LifeBuoy } from 'lucide-react';
import { submitLead } from '../lib/api/catalog';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang, pick } from '../lib/language';

const CONTENT_TA = {
  title: 'வாடிக்கையாளர் சேவையை தொடர்பு கொள்ளுங்கள்',
  intro: 'எக்ஸ்பிரஸ் உதவிக்காக நாங்கள் தினமும் காலை 6:00 மணி முதல் இரவு 11:00 மணி வரை கிடைப்போம்.'
};

const CONTENT_HI = {
  title: 'ग्राहक सेवा से संपर्क करें',
  intro: 'हम त्वरित सहायता के लिए हर दिन सुबह 6:00 बजे से रात 11:00 बजे तक उपलब्ध हैं।'
};

const CONTENT_ML = {
  title: 'ഉപഭോക്തൃ സേവനവുമായി ബന്ധപ്പെടുക',
  intro: 'അതിവേഗ സഹായത്തിനായി ഞങ്ങൾ എല്ലാ ദിവസവും രാവിലെ 6:00 മുതൽ രാത്രി 11:00 വരെ ലഭ്യമാണ്.'
};

const CONTENT_TE = {
  title: 'కస్టమర్ కేర్‌ను సంప్రదించండి',
  intro: 'త్వరిత సహాయం కోసం మేము ప్రతిరోజూ ఉదయం 6:00 నుండి రాత్రి 11:00 వరకు అందుబాటులో ఉంటాము.'
};

interface ContactPageProps {
  onNavigate?: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { lang } = useLang();
  // Only the hero title/intro/support email are admin-editable (via /admin →
  // Pages & SEO → Contact page). The toll-free/WhatsApp numbers, address and
  // hours cards stay hardcoded — the saved content block only has one
  // generic phone/address/hours field each, and this page shows several
  // distinct contact channels, so forcing them in would be lossy.
  const content = useSiteContent('pages.contact', {
    title: 'Contact Customer Care',
    intro: 'We are available 6:00 AM to 11:00 PM every day for express assistance.',
    email: 'support@igoproteincuts.com'
  });
  const resolvedContent =
    lang === 'ta'
      ? { ...content, ...CONTENT_TA }
      : lang === 'hi'
      ? { ...content, ...CONTENT_HI }
      : lang === 'ml'
      ? { ...content, ...CONTENT_ML }
      : lang === 'te'
      ? { ...content, ...CONTENT_TE }
      : content;

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Previously this only flipped local `submitted` state to true — nothing
  // was ever saved anywhere, so this contact form silently went nowhere no
  // matter how many customers used it. Now it writes to the same `igo_leads`
  // table the admin's Leads tab reads, so real enquiries actually show up.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitError(null);
    setIsSubmitting(true);
    const result = await submitLead({
      leadType: 'contact',
      fullName: formData.name,
      email: formData.email,
      phone: '',
      message: `Subject: ${formData.subject || 'Website Inquiry'}\n\n${formData.message}`
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error || pick(lang, {
        en: 'Could not send your message. Please try again or email us directly.',
        ta: 'உங்கள் செய்தியை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது எங்களுக்கு நேரடியாக மின்னஞ்சல் அனுப்பவும்.',
        hi: 'आपका संदेश भेजा नहीं जा सका। कृपया फिर से प्रयास करें या हमें सीधे ईमेल करें।',
        ml: 'നിങ്ങളുടെ സന്ദേശം അയയ്ക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ ഞങ്ങൾക്ക് നേരിട്ട് ഇമെയിൽ ചെയ്യുക.',
        te: 'మీ సందేశాన్ని పంపడం సాధ్యం కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా నేరుగా మాకు ఇమెయిల్ చేయండి.'
      }));
      return;
    }
    setSubmitted(true);
  };

  const mailtoHref = `mailto:${content.email}?subject=${encodeURIComponent(
    formData.subject || 'Website Inquiry'
  )}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-2 text-white shadow-lg shadow-emerald-950/20">
        <h1 className="text-3xl font-black">{resolvedContent.title}</h1>
        <p className="text-xs text-neutral-300">{resolvedContent.intro}</p>
      </div>

      {/* Quick Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <Phone className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-[#0A1F12] text-sm">{pick(lang, { en: 'Toll Free Hotline', ta: 'கட்டணமில்லா ஹாட்லைன்', hi: 'टोल फ्री हॉटलाइन', ml: 'ടോൾ ഫ്രീ ഹോട്ട്‌ലൈൻ', te: 'టోల్ ఫ్రీ హాట్‌లైన్' })}</h3>
          <a href="tel:1800-446-446" className="text-xs text-neutral-500 hover:text-emerald-700 transition">1800-446-446</a>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-[#0A1F12] text-sm">{pick(lang, { en: 'WhatsApp Care', ta: 'வாட்ஸ்அப் சேவை', hi: 'व्हाट्सएप केयर', ml: 'വാട്ട്‌സാപ്പ് കെയർ', te: 'వాట్సాప్ కేర్' })}</h3>
          <a
            href="https://wa.me/919840000000?text=Hi%20IGO%20Protein%20Cuts%2C%20I%20need%20help%20with%20my%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-emerald-700 transition"
          >
            +91 98400 00000
          </a>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <Mail className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-[#0A1F12] text-sm">{pick(lang, { en: 'Email Support', ta: 'மின்னஞ்சல் ஆதரவு', hi: 'ईमेल सहायता', ml: 'ഇമെയിൽ പിന്തുണ', te: 'ఇమెయిల్ మద్దతు' })}</h3>
          <a href={`mailto:${content.email}`} className="text-xs text-neutral-500 hover:text-emerald-700 transition">
            {content.email}
          </a>
        </div>
      </div>

      {/* Form + Address/Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Address, Hours, Support link */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#0A1F12]">{pick(lang, { en: 'Registered Office', ta: 'பதிவு செய்யப்பட்ட அலுவலகம்', hi: 'पंजीकृत कार्यालय', ml: 'രജിസ്റ്റർ ചെയ്ത ഓഫീസ്', te: 'రిజిస్టర్డ్ కార్యాలయం' })}</div>
              <p className="text-xs text-neutral-500 mt-1">{pick(lang, { en: 'IGO Groups HQ, 100 Feet Road, Indiranagar, Bengaluru, KA 560038', ta: 'IGO குரூப்ஸ் தலைமையகம், 100 ஃபீட் ரோடு, இந்திரநகர், பெங்களூரு, KA 560038', hi: 'आईजीओ ग्रुप्स मुख्यालय, 100 फीट रोड, इंदिरानगर, बेंगलुरु, KA 560038', ml: 'ഐജിഒ ഗ്രൂപ്‌സ് ആസ്ഥാനം, 100 ഫീറ്റ് റോഡ്, ഇന്ദിരാനഗർ, ബെംഗളൂരു, KA 560038', te: 'ఐజీవో గ్రూప్స్ ప్రధాన కార్యాలయం, 100 ఫీట్ రోడ్, ఇందిరానగర్, బెంగళూరు, KA 560038' })}</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0A1F12]">
              <Clock className="w-5 h-5 text-emerald-600" /> {pick(lang, { en: 'Support Hours', ta: 'ஆதரவு நேரங்கள்', hi: 'सहायता समय', ml: 'പിന്തുണാ സമയം', te: 'మద్దతు వేళలు' })}
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
              <span className="text-neutral-500">{pick(lang, { en: 'Phone & WhatsApp', ta: 'ஃபோன் & வாட்ஸ்அப்', hi: 'फोन और व्हाट्सएप', ml: 'ഫോൺ & വാട്ട്‌സാപ്പ്', te: 'ఫోన్ & వాట్సాప్' })}</span>
              <span className="font-semibold text-[#0A1F12] text-right">{pick(lang, { en: '6:00 AM – 11:00 PM, all days', ta: 'காலை 6:00 – இரவு 11:00, தினமும்', hi: 'सुबह 6:00 – रात 11:00, सभी दिन', ml: 'രാവിലെ 6:00 – രാത്രി 11:00, എല്ലാ ദിവസവും', te: 'ఉదయం 6:00 – రాత్రి 11:00, అన్ని రోజులు' })}</span>

              <span className="text-neutral-500">{pick(lang, { en: 'Email Support', ta: 'மின்னஞ்சல் ஆதரவு', hi: 'ईमेल सहायता', ml: 'ഇമെയിൽ പിന്തുണ', te: 'ఇమెయిల్ మద్దతు' })}</span>
              <span className="font-semibold text-[#0A1F12] text-right">{pick(lang, { en: 'Reply within 4 hours', ta: '4 மணி நேரத்திற்குள் பதில்', hi: '4 घंटे के भीतर जवाब', ml: '4 മണിക്കൂറിനുള്ളിൽ മറുപടി', te: '4 గంటల్లో సమాధానం' })}</span>

              <span className="text-neutral-500">{pick(lang, { en: 'Live Order Tracking', ta: 'நேரடி ஆர்டர் கண்காணிப்பு', hi: 'लाइव ऑर्डर ट्रैकिंग', ml: 'തത്സമയ ഓർഡർ ട്രാക്കിംഗ്', te: 'లైవ్ ఆర్డర్ ట్రాకింగ్' })}</span>
              <span className="font-semibold text-emerald-700 text-right">{pick(lang, { en: '24/7 in your account', ta: 'உங்கள் கணக்கில் 24/7', hi: 'आपके खाते में 24/7', ml: 'നിങ്ങളുടെ അക്കൗണ്ടിൽ 24/7', te: 'మీ ఖాతాలో 24/7' })}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <LifeBuoy className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#0A1F12]">{pick(lang, { en: 'Looking for order help or FAQs?', ta: 'ஆர்டர் உதவி அல்லது FAQ களைத் தேடுகிறீர்களா?', hi: 'ऑर्डर सहायता या सामान्य प्रश्न ढूंढ रहे हैं?', ml: 'ഓർഡർ സഹായമോ പതിവുചോദ്യങ്ങളോ തിരയുകയാണോ?', te: 'ఆర్డర్ సహాయం లేదా తరచుగా అడిగే ప్రశ్నల కోసం చూస్తున్నారా?' })}</div>
              <p className="text-xs text-neutral-600 mt-1">
                {lang === 'ta' ? (
                  <>
                    ஆர்டர் கண்காணிப்பு, திரும்பப் பெறுதல் மற்றும் பொதுவான கேள்விகளுக்கு எங்கள்{' '}
                    <button onClick={() => onNavigate?.('/support')} className="font-bold text-emerald-700 underline cursor-pointer">
                      ஆதரவு மையத்தை
                    </button>{' '}
                    பார்வையிடவும்.
                  </>
                ) : lang === 'hi' ? (
                  <>
                    ऑर्डर ट्रैकिंग, रिटर्न और सामान्य सवालों के लिए हमारे{' '}
                    <button onClick={() => onNavigate?.('/support')} className="font-bold text-emerald-700 underline cursor-pointer">
                      सहायता केंद्र
                    </button>{' '}
                    पर जाएं।
                  </>
                ) : lang === 'ml' ? (
                  <>
                    ഓർഡർ ട്രാക്കിംഗ്, റിട്ടേണുകൾ, പൊതുവായ ചോദ്യങ്ങൾക്കായി ഞങ്ങളുടെ{' '}
                    <button onClick={() => onNavigate?.('/support')} className="font-bold text-emerald-700 underline cursor-pointer">
                      സപ്പോർട്ട് സെന്റർ
                    </button>{' '}
                    സന്ദർശിക്കുക.
                  </>
                ) : lang === 'te' ? (
                  <>
                    ఆర్డర్ ట్రాకింగ్, రిటర్న్‌లు మరియు సాధారణ ప్రశ్నల కోసం మా{' '}
                    <button onClick={() => onNavigate?.('/support')} className="font-bold text-emerald-700 underline cursor-pointer">
                      సపోర్ట్ సెంటర్
                    </button>{' '}
                    సందర్శించండి.
                  </>
                ) : (
                  <>
                    Visit our{' '}
                    <button onClick={() => onNavigate?.('/support')} className="font-bold text-emerald-700 underline cursor-pointer">
                      Support Center
                    </button>{' '}
                    for order tracking, returns, and common questions.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0A1F12] mb-2">{pick(lang, { en: 'Send Us a Message', ta: 'எங்களுக்கு ஒரு செய்தி அனுப்பவும்', hi: 'हमें संदेश भेजें', ml: 'ഞങ്ങൾക്ക് ഒരു സന്ദേശം അയയ്ക്കുക', te: 'మాకు సందేశం పంపండి' })}</h3>
          <p className="text-xs text-neutral-500 mb-6">{pick(lang, { en: 'Our team typically replies within a few hours.', ta: 'எங்கள் குழு பொதுவாக சில மணி நேரங்களுக்குள் பதிலளிக்கும்.', hi: 'हमारी टीम आमतौर पर कुछ घंटों के भीतर जवाब देती है।', ml: 'ഞങ്ങളുടെ ടീം സാധാരണയായി ഏതാനും മണിക്കൂറുകൾക്കുള്ളിൽ മറുപടി നൽകും.', te: 'మా బృందం సాధారణంగా కొన్ని గంటల్లో స్పందిస్తుంది.' })}</p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#0A1F12] text-base">{pick(lang, { en: 'Message Received!', ta: 'செய்தி பெறப்பட்டது!', hi: 'संदेश प्राप्त हुआ!', ml: 'സന്ദേശം ലഭിച്ചു!', te: 'సందేశం అందింది!' })}</h4>
              <p className="text-xs text-neutral-600">
                {lang === 'ta' ? (
                  <>
                    {formData.name || 'உங்களுக்கு'} விரைவில் பதிலளிப்போம். நேரடியாக தொடர்பு கொள்ள விரும்புகிறீர்களா?{' '}
                    <a href={mailtoHref} className="font-bold text-emerald-700 underline">எங்களுக்கு விவரங்களை மின்னஞ்சல் செய்யவும்</a>.
                  </>
                ) : lang === 'hi' ? (
                  <>
                    {formData.name || 'आपसे'} जल्द ही संपर्क करेंगे। सीधे संपर्क करना चाहते हैं?{' '}
                    <a href={mailtoHref} className="font-bold text-emerald-700 underline">हमें विवरण ईमेल करें</a>.
                  </>
                ) : lang === 'ml' ? (
                  <>
                    {formData.name || 'നിങ്ങളെ'} ഞങ്ങൾ ഉടൻ ബന്ധപ്പെടും. നേരിട്ട് ബന്ധപ്പെടണോ?{' '}
                    <a href={mailtoHref} className="font-bold text-emerald-700 underline">വിശദാംശങ്ങൾ ഞങ്ങൾക്ക് ഇമെയിൽ ചെയ്യുക</a>.
                  </>
                ) : lang === 'te' ? (
                  <>
                    {formData.name || 'మిమ్మల్ని'} మేము త్వరలో సంప్రదిస్తాము. నేరుగా సంప్రదించాలనుకుంటున్నారా?{' '}
                    <a href={mailtoHref} className="font-bold text-emerald-700 underline">వివరాలను మాకు ఇమెయిల్ చేయండి</a>.
                  </>
                ) : (
                  <>
                    We'll get back to {formData.name || 'you'} shortly. Want to follow up directly?{' '}
                    <a href={mailtoHref} className="font-bold text-emerald-700 underline">Email us the details</a>.
                  </>
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">{pick(lang, { en: 'Your Name *', ta: 'உங்கள் பெயர் *', hi: 'आपका नाम *', ml: 'നിങ്ങളുടെ പേര് *', te: 'మీ పేరు *' })}</label>
                  <input
                    type="text"
                    required
                    placeholder={pick(lang, { en: 'Full name', ta: 'முழு பெயர்', hi: 'पूरा नाम', ml: 'മുഴുവൻ പേര്', te: 'పూర్తి పేరు' })}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">{pick(lang, { en: 'Email *', ta: 'மின்னஞ்சல் *', hi: 'ईमेल *', ml: 'ഇമെയിൽ *', te: 'ఇమెయిల్ *' })}</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">{pick(lang, { en: 'Subject', ta: 'பொருள்', hi: 'विषय', ml: 'വിഷയം', te: 'విషయం' })}</label>
                <input
                  type="text"
                  placeholder={pick(lang, { en: 'e.g. Order delay, product query, feedback', ta: 'உதா. ஆர்டர் தாமதம், தயாரிப்பு விசாரணை, கருத்து', hi: 'उदा. ऑर्डर में देरी, उत्पाद पूछताछ, प्रतिक्रिया', ml: 'ഉദാ. ഓർഡർ വൈകൽ, ഉൽപ്പന്ന അന്വേഷണം, അഭിപ്രായം', te: 'ఉదా. ఆర్డర్ ఆలస్యం, ఉత్పత్తి విచారణ, అభిప్రాయం' })}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">{pick(lang, { en: 'Message *', ta: 'செய்தி *', hi: 'संदेश *', ml: 'സന്ദേശം *', te: 'సందేశం *' })}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={pick(lang, { en: 'Tell us how we can help...', ta: 'நாங்கள் எப்படி உதவலாம் என்று சொல்லுங்கள்...', hi: 'हमें बताएं हम कैसे मदद कर सकते हैं...', ml: 'ഞങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാമെന്ന് പറയൂ...', te: 'మేము ఎలా సహాయం చేయగలమో మాకు చెప్పండి...' })}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                  ? pick(lang, { en: 'Sending…', ta: 'அனுப்புகிறது…', hi: 'भेजा जा रहा है…', ml: 'അയയ്ക്കുന്നു…', te: 'పంపుతోంది…' })
                  : (<>{pick(lang, { en: 'Send Message', ta: 'செய்தி அனுப்பவும்', hi: 'संदेश भेजें', ml: 'സന്ദേശം അയയ്ക്കുക', te: 'సందేశం పంపండి' })} <Send className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
