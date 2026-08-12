import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Building2, Truck, FileBadge, PhoneCall, Percent, Package } from 'lucide-react';
import { submitLead } from '../lib/api/catalog';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang } from '../lib/language';

const BUSINESS_TYPES = ['Restaurant / Cloud Kitchen', 'Hotel / Catering', 'Retail / Butcher Shop', 'Hostel / Institution', 'Other Bulk Buyer'];
const BUSINESS_TYPES_TA: Record<string, string> = {
  'Restaurant / Cloud Kitchen': 'உணவகம் / கிளவுட் கிச்சன்',
  'Hotel / Catering': 'ஹோட்டல் / கேட்டரிங்',
  'Retail / Butcher Shop': 'சில்லறை / கசாப்புக் கடை',
  'Hostel / Institution': 'ஹாஸ்டல் / நிறுவனம்',
  'Other Bulk Buyer': 'மற்ற மொத்த வாங்குபவர்'
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
  const resolvedContent = lang === 'ta' ? contentTa : content;

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
      return lang === 'ta' ? 'சரியான வணிகப் பெயரை உள்ளிடவும்.' : 'Please enter a valid business name.';
    }
    const digitsOnlyPhone = formData.phone.replace(/[^0-9]/g, '');
    // Indian mobile numbers: 10 digits, optionally prefixed with a 91
    // country code (so "+91 98200 11223" and "9820011223" both pass).
    const localPhone = digitsOnlyPhone.length === 12 && digitsOnlyPhone.startsWith('91')
      ? digitsOnlyPhone.slice(2)
      : digitsOnlyPhone;
    if (!/^[6-9][0-9]{9}$/.test(localPhone)) {
      return lang === 'ta' ? 'சரியான 10-இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return lang === 'ta' ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.' : 'Please enter a valid email address.';
    }
    if (!/[a-zA-Z]/.test(formData.city.trim()) || formData.city.trim().length < 2) {
      return lang === 'ta' ? 'சரியான நகரத்தின் பெயரை உள்ளிடவும்.' : 'Please enter a valid city name.';
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
      setSubmitError(result.error || (lang === 'ta' ? 'உங்கள் விசாரணையை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது நேரடியாக அழையுங்கள்/மின்னஞ்சல் செய்யுங்கள்.' : 'Could not submit your enquiry. Please try again or call/email us directly.'));
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
          {lang === 'ta' ? 'IGO மொத்த விற்பனை போர்ட்டல்' : 'IGO WHOLESALE PORTAL'}
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
            {lang === 'ta' ? 'நாங்கள் யாருடன் பணிபுரிகிறோம்' : 'Who We Work With'}
          </h2>
          <div className="space-y-4">
            {BUSINESS_TYPES.map((type) => (
              <div key={type} className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-[#0A1F12]">
                  {lang === 'ta' ? BUSINESS_TYPES_TA[type] ?? type : type}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#0A1F12]">
                {lang === 'ta' ? 'முதலில் பேச விரும்புகிறீர்களா?' : 'Prefer to talk first?'}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                {lang === 'ta' ? 'எங்கள் B2B டெஸ்கை அழையுங்கள்' : 'Call our B2B desk at'}{' '}
                <a href="tel:1800-446-446" className="font-bold text-emerald-700">1800-446-446</a>{' '}
                {lang === 'ta' ? 'அல்லது மின்னஞ்சல்' : 'or email'}{' '}
                <a href="mailto:b2b@igoproteincuts.com" className="font-bold text-emerald-700">b2b@igoproteincuts.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0A1F12] mb-2">
            {lang === 'ta' ? 'மொத்த விலை மேற்கோள் கோருங்கள்' : 'Request a Wholesale Quote'}
          </h3>
          <p className="text-xs text-neutral-500 mb-6">
            {lang === 'ta'
              ? 'உங்கள் B2B குழு உங்கள் அளவிற்கு ஏற்ப விலையுடன் 24 மணி நேரத்திற்குள் பதிலளிக்கும்.'
              : 'Our B2B team responds within 24 hours with pricing tailored to your volume.'}
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#0A1F12] text-base">
                {lang === 'ta' ? 'விசாரணை பெறப்பட்டது!' : 'Inquiry Received!'}
              </h4>
              <p className="text-xs text-neutral-600">
                {lang === 'ta'
                  ? `நாங்கள் விரைவில் ${formData.contactName || 'உங்களை'} தொடர்பு கொள்வோம். நேரடியாக பின்தொடர விரும்புகிறீர்களா?`
                  : `We'll reach out to ${formData.contactName || 'you'} shortly. Want to follow up directly?`}{' '}
                <a href={mailtoHref} className="font-bold text-emerald-700 underline">
                  {lang === 'ta' ? 'விவரங்களை மின்னஞ்சல் செய்யுங்கள்' : 'Email us the details'}
                </a>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  {lang === 'ta' ? 'வணிகத்தின் பெயர் *' : 'Business Name *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder={lang === 'ta' ? 'எ.கா. ஸ்பைஸ் ரூட் கிச்சன்' : 'e.g. Spice Route Kitchen'}
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">
                    {lang === 'ta' ? 'தொடர்பு பெயர்' : 'Contact Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ta' ? 'உங்கள் பெயர்' : 'Your name'}
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">
                    {lang === 'ta' ? 'தொலைபேசி *' : 'Phone *'}
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
                  {lang === 'ta' ? 'மின்னஞ்சல்' : 'Email'}
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
                    {lang === 'ta' ? 'வணிக வகை' : 'Business Type'}
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{lang === 'ta' ? BUSINESS_TYPES_TA[t] ?? t : t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">
                    {lang === 'ta' ? 'மதிப்பிடப்பட்ட மாதாந்திர அளவு' : 'Est. Monthly Volume'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ta' ? 'எ.கா. 200kg / மாதம்' : 'e.g. 200kg / month'}
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  {lang === 'ta' ? 'நகரம் *' : 'City *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder={lang === 'ta' ? 'எ.கா. பெங்களூரு' : 'e.g. Bengaluru'}
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
                  ? (lang === 'ta' ? 'சமர்ப்பிக்கிறது…' : 'Submitting…')
                  : (<>{lang === 'ta' ? 'மேற்கோள் கோருங்கள்' : 'Request Quote'} <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
