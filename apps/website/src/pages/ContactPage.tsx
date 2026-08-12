import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Clock, CheckCircle2, Send, LifeBuoy } from 'lucide-react';
import { submitLead } from '../lib/api/catalog';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang } from '../lib/language';

const CONTENT_TA = {
  title: 'வாடிக்கையாளர் சேவையை தொடர்பு கொள்ளுங்கள்',
  intro: 'எக்ஸ்பிரஸ் உதவிக்காக நாங்கள் தினமும் காலை 6:00 மணி முதல் இரவு 11:00 மணி வரை கிடைப்போம்.'
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
  const resolvedContent = lang === 'ta' ? { ...content, ...CONTENT_TA } : content;

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
      setSubmitError(result.error || (lang === 'ta' ? 'உங்கள் செய்தியை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது எங்களுக்கு நேரடியாக மின்னஞ்சல் அனுப்பவும்.' : 'Could not send your message. Please try again or email us directly.'));
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
          <h3 className="font-bold text-[#0A1F12] text-sm">{lang === 'ta' ? 'கட்டணமில்லா ஹாட்லைன்' : 'Toll Free Hotline'}</h3>
          <a href="tel:1800-446-446" className="text-xs text-neutral-500 hover:text-emerald-700 transition">1800-446-446</a>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-[#0A1F12] text-sm">{lang === 'ta' ? 'வாட்ஸ்அப் சேவை' : 'WhatsApp Care'}</h3>
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
          <h3 className="font-bold text-[#0A1F12] text-sm">{lang === 'ta' ? 'மின்னஞ்சல் ஆதரவு' : 'Email Support'}</h3>
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
              <div className="text-sm font-bold text-[#0A1F12]">{lang === 'ta' ? 'பதிவு செய்யப்பட்ட அலுவலகம்' : 'Registered Office'}</div>
              <p className="text-xs text-neutral-500 mt-1">{lang === 'ta' ? 'IGO குரூப்ஸ் தலைமையகம், 100 ஃபீட் ரோடு, இந்திரநகர், பெங்களூரு, KA 560038' : 'IGO Groups HQ, 100 Feet Road, Indiranagar, Bengaluru, KA 560038'}</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0A1F12]">
              <Clock className="w-5 h-5 text-emerald-600" /> {lang === 'ta' ? 'ஆதரவு நேரங்கள்' : 'Support Hours'}
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
              <span className="text-neutral-500">{lang === 'ta' ? 'ஃபோன் & வாட்ஸ்அப்' : 'Phone & WhatsApp'}</span>
              <span className="font-semibold text-[#0A1F12] text-right">{lang === 'ta' ? 'காலை 6:00 – இரவு 11:00, தினமும்' : '6:00 AM – 11:00 PM, all days'}</span>

              <span className="text-neutral-500">{lang === 'ta' ? 'மின்னஞ்சல் ஆதரவு' : 'Email Support'}</span>
              <span className="font-semibold text-[#0A1F12] text-right">{lang === 'ta' ? '4 மணி நேரத்திற்குள் பதில்' : 'Reply within 4 hours'}</span>

              <span className="text-neutral-500">{lang === 'ta' ? 'நேரடி ஆர்டர் கண்காணிப்பு' : 'Live Order Tracking'}</span>
              <span className="font-semibold text-emerald-700 text-right">{lang === 'ta' ? 'உங்கள் கணக்கில் 24/7' : '24/7 in your account'}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <LifeBuoy className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#0A1F12]">{lang === 'ta' ? 'ஆர்டர் உதவி அல்லது FAQ களைத் தேடுகிறீர்களா?' : 'Looking for order help or FAQs?'}</div>
              <p className="text-xs text-neutral-600 mt-1">
                {lang === 'ta' ? (
                  <>
                    ஆர்டர் கண்காணிப்பு, திரும்பப் பெறுதல் மற்றும் பொதுவான கேள்விகளுக்கு எங்கள்{' '}
                    <button onClick={() => onNavigate?.('/support')} className="font-bold text-emerald-700 underline cursor-pointer">
                      ஆதரவு மையத்தை
                    </button>{' '}
                    பார்வையிடவும்.
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
          <h3 className="text-lg font-bold text-[#0A1F12] mb-2">{lang === 'ta' ? 'எங்களுக்கு ஒரு செய்தி அனுப்பவும்' : 'Send Us a Message'}</h3>
          <p className="text-xs text-neutral-500 mb-6">{lang === 'ta' ? 'எங்கள் குழு பொதுவாக சில மணி நேரங்களுக்குள் பதிலளிக்கும்.' : 'Our team typically replies within a few hours.'}</p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#0A1F12] text-base">{lang === 'ta' ? 'செய்தி பெறப்பட்டது!' : 'Message Received!'}</h4>
              <p className="text-xs text-neutral-600">
                {lang === 'ta' ? (
                  <>
                    {formData.name || 'உங்களுக்கு'} விரைவில் பதிலளிப்போம். நேரடியாக தொடர்பு கொள்ள விரும்புகிறீர்களா?{' '}
                    <a href={mailtoHref} className="font-bold text-emerald-700 underline">எங்களுக்கு விவரங்களை மின்னஞ்சல் செய்யவும்</a>.
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
                  <label className="block text-neutral-600 font-semibold mb-1">{lang === 'ta' ? 'உங்கள் பெயர் *' : 'Your Name *'}</label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'ta' ? 'முழு பெயர்' : 'Full name'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">{lang === 'ta' ? 'மின்னஞ்சல் *' : 'Email *'}</label>
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
                <label className="block text-neutral-600 font-semibold mb-1">{lang === 'ta' ? 'பொருள்' : 'Subject'}</label>
                <input
                  type="text"
                  placeholder={lang === 'ta' ? 'உதா. ஆர்டர் தாமதம், தயாரிப்பு விசாரணை, கருத்து' : 'e.g. Order delay, product query, feedback'}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">{lang === 'ta' ? 'செய்தி *' : 'Message *'}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={lang === 'ta' ? 'நாங்கள் எப்படி உதவலாம் என்று சொல்லுங்கள்...' : 'Tell us how we can help...'}
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
                  ? (lang === 'ta' ? 'அனுப்புகிறது…' : 'Sending…')
                  : (<>{lang === 'ta' ? 'செய்தி அனுப்பவும்' : 'Send Message'} <Send className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
