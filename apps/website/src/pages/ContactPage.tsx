import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Clock, CheckCircle2, Send, LifeBuoy } from 'lucide-react';

interface ContactPageProps {
  onNavigate?: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const mailtoHref = `mailto:support@igoproteincuts.com?subject=${encodeURIComponent(
    formData.subject || 'Website Inquiry'
  )}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="bg-[#08120B] border border-black rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-2 text-white shadow-2xl">
        <h1 className="text-3xl font-black">Contact Customer Care</h1>
        <p className="text-xs text-neutral-300">We are available 6:00 AM to 11:00 PM every day for express assistance.</p>
      </div>

      {/* Quick Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <Phone className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-[#08120B] text-sm">Toll Free Hotline</h3>
          <a href="tel:1800-446-446" className="text-xs text-neutral-500 hover:text-emerald-700 transition">1800-446-446</a>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-[#08120B] text-sm">WhatsApp Care</h3>
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
          <h3 className="font-bold text-[#08120B] text-sm">Email Support</h3>
          <a href="mailto:support@igoproteincuts.com" className="text-xs text-neutral-500 hover:text-emerald-700 transition">
            support@igoproteincuts.com
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
              <div className="text-sm font-bold text-[#08120B]">Registered Office</div>
              <p className="text-xs text-neutral-500 mt-1">IGO Groups HQ, 100 Feet Road, Indiranagar, Bengaluru, KA 560038</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[#08120B]">
              <Clock className="w-5 h-5 text-emerald-600" /> Support Hours
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Phone &amp; WhatsApp</span>
                <span className="font-semibold text-[#08120B]">6:00 AM – 11:00 PM, all days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Email Support</span>
                <span className="font-semibold text-[#08120B]">Reply within 4 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Live Order Tracking</span>
                <span className="font-semibold text-emerald-700">24/7 in your account</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
            <LifeBuoy className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#08120B]">Looking for order help or FAQs?</div>
              <p className="text-xs text-neutral-600 mt-1">
                Visit our{' '}
                <button onClick={() => onNavigate?.('/support')} className="font-bold text-emerald-700 underline cursor-pointer">
                  Support Center
                </button>{' '}
                for order tracking, returns, and common questions.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#08120B] mb-2">Send Us a Message</h3>
          <p className="text-xs text-neutral-500 mb-6">Our team typically replies within a few hours.</p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#08120B] text-base">Message Received!</h4>
              <p className="text-xs text-neutral-600">
                We'll get back to {formData.name || 'you'} shortly. Want to follow up directly?{' '}
                <a href={mailtoHref} className="font-bold text-emerald-700 underline">Email us the details</a>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Order delay, product query, feedback"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#08120B] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
