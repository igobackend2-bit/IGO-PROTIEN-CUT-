import React, { useState } from 'react';
import { StoreService } from '../lib/storage';
import { CheckCircle2, ShieldAlert, ArrowRight, Building2, Wallet } from 'lucide-react';

export const FranchisePage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    budget: '₹25 Lakhs - ₹35 Lakhs',
    preferredLocation: '',
    experience: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    StoreService.addLead(formData);
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Banner */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-3 text-white shadow-lg shadow-emerald-950/20">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">IGO PARTNERSHIP OPPORTUNITY</span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Own a Protein Cuts Dark Store Franchise</h1>
        <p className="text-xs sm:text-sm text-neutral-300">
          Partner with India's fastest-growing luxury meat and seafood e-commerce ecosystem. High ROI dark store & retail express model with centralized supply chain support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0A1F12]">Why Invest in IGO Protein Cuts?</h2>

          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <Building2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-[#0A1F12] text-sm">Turnkey Dark Store Setup</h3>
                <p className="text-xs text-neutral-600">Complete chilling equipment, POS, master butcher training, and rider app integration provided.</p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <Wallet className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-[#0A1F12] text-sm">High Profit Margin (22-28%)</h3>
                <p className="text-xs text-neutral-600">Low wastage model supported by AI demand forecasting and daily morning farm replenishment.</p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-[#0A1F12] text-sm">Centralized Marketing & App Demands</h3>
                <p className="text-xs text-neutral-600">We drive 100% app order volumes directly to your pincode dark store.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0A1F12] mb-2">Apply for Franchise Partnership</h3>
          <p className="text-xs text-neutral-500 mb-6">Fill the application below. Our IGO Business Development Director will connect in 24 hours.</p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-[#0A1F12] text-base">Application Received!</h4>
              <p className="text-xs text-neutral-600">Your franchise lead reference has been recorded in the IGO Admin Portal.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Malhotra"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Investment Budget</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  >
                    <option>₹15 Lakhs - ₹25 Lakhs</option>
                    <option>₹25 Lakhs - ₹35 Lakhs</option>
                    <option>₹35 Lakhs - ₹50 Lakhs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Preferred Location / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Gachibowli Main Road"
                  value={formData.preferredLocation}
                  onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                Submit Franchise Lead <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
