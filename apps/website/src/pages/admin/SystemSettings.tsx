import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Save, 
  Bell, 
  Globe, 
  Smartphone, 
  Bot, 
  Truck, 
  CreditCard, 
  Shield,
  Info
} from 'lucide-react';

const SettingSection = ({ title, description, children }: any) => (
  <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm space-y-6">
    <div>
      <h3 className="text-xl font-bold text-neutral-800">{title}</h3>
      <p className="text-neutral-500 text-sm mt-1">{description}</p>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SystemSettings = () => {
  const [announcement, setAnnouncement] = useState(localStorage.getItem('igo_announcement') || 'Free delivery on orders above ₹499! Slaughtered fresh daily.');

  const handleUpdateAnnouncement = () => {
    localStorage.setItem('igo_announcement', announcement);
    window.dispatchEvent(new CustomEvent('announcementUpdate', { detail: announcement }));
    alert('Storefront announcement updated successfully!');
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-neutral-800">System Configuration</h1>
        <p className="text-neutral-500 mt-1">Control your storefront's global parameters and features.</p>
      </div>

      <SettingSection 
        title="Storefront Announcement" 
        description="This message appears in the top delivery bar on every page."
      >
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Active Message</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-igo-green/20 transition-all"
            />
            <button 
              onClick={handleUpdateAnnouncement}
              className="px-6 py-3 bg-igo-green text-white rounded-xl text-sm font-bold shadow-lg shadow-igo-green/20 hover:bg-igo-green/90 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update
            </button>
          </div>
        </div>
      </SettingSection>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingSection 
          title="AI Meat Assistant" 
          description="Configure the behavior of your AI shopping companion."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-igo-green" />
                <span className="text-sm font-bold text-neutral-700">Enable Assistant</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked readOnly />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-igo-green"></div>
              </label>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                Assistant currently uses Gemini 1.5 Flash for recipes and recommendations.
              </p>
            </div>
          </div>
        </SettingSection>

        <SettingSection 
          title="Delivery & Logistics" 
          description="Manage delivery radius and estimated times."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Max Delivery Time (Mins)</label>
              <input type="number" defaultValue={90} className="w-full px-4 py-3 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-igo-green/20 transition-all" />
            </div>
            <div className="flex items-center gap-2 text-igo-gold">
              <Truck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Anna Nagar Hub: Online</span>
            </div>
          </div>
        </SettingSection>
      </div>

      <SettingSection 
        title="Payment Gateways" 
        description="Securely manage your integrated payment methods."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['UPI / QR', 'Cards', 'Cash on Delivery'].map((method) => (
            <div key={method} className="p-4 border border-neutral-100 rounded-2xl flex items-center justify-between hover:border-igo-green/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-neutral-400 group-hover:text-igo-green" />
                <span className="text-sm font-bold text-neutral-600 group-hover:text-neutral-800">{method}</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </div>
          ))}
        </div>
      </SettingSection>

      <div className="flex justify-end gap-4 pt-4">
        <button className="px-8 py-4 bg-neutral-100 text-neutral-500 rounded-2xl font-bold hover:bg-neutral-200 transition-all">
          Discard Changes
        </button>
        <button className="px-10 py-4 bg-igo-green text-white rounded-2xl font-bold shadow-xl shadow-igo-green/20 hover:bg-igo-green/90 transition-all">
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
