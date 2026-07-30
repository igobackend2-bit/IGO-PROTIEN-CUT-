import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Building2, Truck, FileBadge, PhoneCall, Percent, Package } from 'lucide-react';

const BUSINESS_TYPES = ['Restaurant / Cloud Kitchen', 'Hotel / Catering', 'Retail / Butcher Shop', 'Hostel / Institution', 'Other Bulk Buyer'];

export const B2BPage: React.FC = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.phone) return;
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
      <div className="bg-[#08120B] border border-black rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-3 text-white shadow-2xl">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">IGO WHOLESALE PORTAL</span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Bulk & B2B Protein Supply</h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto">
          Restaurants, cloud kitchens, hotels, and institutions get wholesale pricing, custom labeling, dedicated delivery slots, and a single point of contact.
        </p>
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
            <h3 className="font-bold text-[#08120B] text-sm">{v.title}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#08120B]">Who We Work With</h2>
          <div className="space-y-4">
            {BUSINESS_TYPES.map((type) => (
              <div key={type} className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-[#08120B]">{type}</span>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#08120B]">Prefer to talk first?</div>
              <p className="text-xs text-neutral-600 mt-1">
                Call our B2B desk at <a href="tel:1800-446-446" className="font-bold text-emerald-700">1800-446-446</a> or email{' '}
                <a href="mailto:b2b@igoproteincuts.com" className="font-bold text-emerald-700">b2b@igoproteincuts.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#08120B] mb-2">Request a Wholesale Quote</h3>
          <p className="text-xs text-neutral-500 mb-6">Our B2B team responds within 24 hours with pricing tailored to your volume.</p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#08120B] text-base">Inquiry Received!</h4>
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
                  placeholder="e.g. Spice Route Kitchen"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                Request Quote <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
