import React from 'react';
import { motion } from 'motion/react';
import { 
  Info, 
  HelpCircle, 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  Box,
  TicketPercent,
  FileText,
  ChevronRight
} from 'lucide-react';

const HelpCard = ({ icon: Icon, title, useCase, benefit }: any) => (
  <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm space-y-4 hover:shadow-md transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-4 rounded-2xl bg-igo-green/10 text-igo-green group-hover:bg-igo-green group-hover:text-white transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-neutral-800">{title}</h3>
    </div>
    
    <div className="space-y-4 pt-2">
      <div>
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">What is this for?</h4>
        <p className="text-sm text-neutral-600 leading-relaxed">{useCase}</p>
      </div>
      <div>
        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Why use it?</h4>
        <p className="text-sm text-neutral-700 font-medium leading-relaxed">{benefit}</p>
      </div>
    </div>
  </div>
);

const AdminHelp = () => {
  const sections = [
    {
      icon: LayoutDashboard,
      title: 'Operational Overview',
      useCase: 'Provides a high-level summary of daily business health, including total revenue, active order counts, and live system logs.',
      benefit: 'Crucial for business owners to make quick decisions, identify anomalies in real-time, and monitor immediate fulfillment performance.'
    },
    {
      icon: ShoppingBag,
      title: 'Product Management',
      useCase: 'The central hub for your inventory catalog. Add new meat cuts, edit prices, update descriptions, and manage stock levels.',
      benefit: 'Ensures your live storefront always reflects current availability and pricing, preventing customer disappointment and maximizing sales.'
    },
    {
      icon: Box,
      title: 'Order Lifecycle',
      useCase: 'Track every customer transaction from the moment it\'s placed until it reaches the doorstep.',
      benefit: 'Directly impacts customer satisfaction. Managing statuses accurately triggers automated notifications and helps logistics plan routes efficiently.'
    },
    {
      icon: Users,
      title: 'Customer Intelligence',
      useCase: 'A detailed database of your registered users, their lifetime spend, and individual preferences.',
      benefit: 'Allows for targeted marketing, loyalty rewards, and personalized service, which are the foundations of high customer retention.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      useCase: 'Advanced visual data showing growth trends, category-wise popularity, and conversion rates.',
      benefit: 'Transforms raw numbers into actionable strategy. Tells you which products are underperforming and where your next growth opportunity lies.'
    },
    {
      icon: Settings,
      title: 'System Configuration',
      useCase: 'Manage global parameters like delivery announcements, AI Assistant status, and payment gateway health.',
      benefit: 'Allows you to adapt the platform instantly to holidays, seasonal changes, or technical maintenance without touching code.'
    }
  ];

  return (
    <div className="max-w-5xl space-y-12 pb-20">
      <div className="flex items-center gap-6 p-10 bg-neutral-dark rounded-[48px] text-white overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-igo-green/20 rounded-full blur-[100px]" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-igo-green/20 text-igo-green rounded-full text-[10px] font-bold uppercase tracking-widest">
            <Info className="w-3 h-3" /> System Guidance
          </div>
          <h1 className="text-4xl font-display font-bold">Admin Intelligence Hub</h1>
          <p className="text-neutral-400 max-w-xl">Master every feature of the IGO Protein Cuts Control Center. This guide explains the strategic importance of each management module.</p>
        </div>
        <HelpCircle className="w-32 h-32 text-white/5 absolute right-10 bottom-[-20px] rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, i) => (
          <HelpCard key={i} {...section} />
        ))}
      </div>

      <div className="bg-igo-gold/5 border border-igo-gold/20 p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-3xl bg-igo-gold flex items-center justify-center text-white flex-shrink-0">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-neutral-800">Need live assistance?</h3>
          <p className="text-neutral-500 text-sm mt-1">Our technical team is available 24/7 to help you with enterprise integrations and custom reporting.</p>
        </div>
        <button className="px-8 py-4 bg-neutral-dark text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all flex items-center gap-2">
          Contact Support <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminHelp;
