import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Building2, Truck, FileBadge, PhoneCall, Percent, Package } from 'lucide-react';
import { submitLead } from '../lib/api/catalog';
import { useSiteContent } from '../lib/hooks/useSiteContent';

const BUSINESS_TYPES = ['Restaurant / Cloud Kitchen', 'Hotel / Catering', 'Retail / Butcher Shop', 'Hostel / Institution', 'Other Bulk Buyer'];

export const B2BPage: React.FC = () => {
  // Only the hero title/intro are admin-editable (via /admin → Pages & SEO →
  // B2B page). The value-prop cards and form below stay hardcoded — they
  // aren't a generic heading/body list.
  const content = useSiteContent('pages.b2b', {
    title: 'Bulk & B2B Protein Supply',
    intro:
      'Restaurants, cloud kitchens, hotels, and institutions get wholesale pricing, custom labeling, dedicated delivery slots, and a single point of contact.'
  });

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
      return 'Please enter a valid business name.';
    }
    const digitsOnlyPhone = formData.phone.replace(/[^0-9]/g, '');
    // Indian mobile numbers: 10 digits, optionally prefixed with a 91
    // country code (so "+91 98200 11223" and "9820011223" both pass).
    const localPhone = digitsOnlyPhone.length === 12 && digitsOnlyPhone.startsWith('91')
      ? digitsOnlyPhone.slice(2)
      : digitsOnlyPhone;
    if (!/^[6-9][0-9]{9}$/.test(localPhone)) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!/[a-zA-Z]/.test(formData.city.trim()) || formData.city.trim().length < 2) {
      return 'Please enter a valid city name.';
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
      setSubmitError(result.error || 'Could not submit your enquiry. Please try again or call/email us directly.');
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
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">IGO WHOLESALE PORTAL</span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{content.title}</h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto">{content.intro}</p>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Percent, title: 'Wholesale Pricing', desc: 'Tiered discounts up to 15% off catalog price, scaling with monthly volume.' },
          { icon: Truck, title: 'Dedicated Delivery Slots', desc: 'Priority early-morning delivery windows built around your kitchen prep schedule.' },
          { icon: FileBadge, title: 'Custom Labeling', desc: 'White-label packaging and GST-compliant invoicing for your business.' },
          { icon: Package, title: 'Consistent Supply', desc: 'Guaranteed stock allocation for contracted volumes — no last-minute shortages.' }
        ].map((v) => (
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
          <h2 className="text-2xl font-black text-[#0A1F12]">Who We Work With</h2>
          <div className="space-y-4">
            {BUSINESS_TYPES.map((type) => (
              <div key={type} className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-[#0A1F12]">{type}</span>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#0A1F12]">Prefer to talk first?</div>
              <p className="text-xs text-neutral-600 mt-1">
                Call our B2B desk at <a href="tel:1800-446-446" className="font-bold text-emerald-700">1800-446-446</a> or email{' '}
                <a href="mailto:b2b@igoproteincuts.com" className="font-bold text-emerald-700">b2b@igoproteincuts.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0A1F12] mb-2">Request a Wholesale Quote</h3>
          <p className="text-xs text-neutral-500 mb-6">Our B2B team responds within 24 hours with pricing tailored to your volume.</p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#0A1F12] text-base">Inquiry Received!</h4>
              <p className="text-xs text-neutral-600">
                We'll reach out to {formData.contactName || 'you'} shortly. Want to follow up directly?{' '}
                <a href={mailtoHref} className="font-bold text-emerald-700 underline">Email us the details</a>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Spice Route Kitchen"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Phone *</label>
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
                <label className="block text-neutral-600 font-semibold mb-1">Email</label>
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
                  <label className="block text-neutral-600 font-semibold mb-1">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Est. Monthly Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 200kg / month"
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder="e.g. Bengaluru"
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
                {isSubmitting ? 'Submitting…' : (<>Request Quote <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
