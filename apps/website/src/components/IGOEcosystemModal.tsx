import React from 'react';
import { X, Layers, ShieldCheck, Snowflake, Waves, ShoppingBag, Sprout, ArrowRight } from 'lucide-react';

interface IGOEcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const IGOEcosystemModal: React.FC<IGOEcosystemModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const divisions = [
    {
      id: 'fresh-farms',
      name: 'IGO Fresh Farms',
      badge: 'Biosecure Livestock',
      icon: <Sprout className="w-6 h-6 text-emerald-600" />,
      desc: 'Certified 100% antibiotic-free, hormone-free poultry & organic grain-fed goat rearing in biosecure green belts.',
      stats: '150+ Partner Farms • Zero Steroids'
    },
    {
      id: 'cold-chain',
      name: 'IGO Cold Chain Express',
      badge: '0-4°C Guaranteed',
      icon: <Snowflake className="w-6 h-6 text-emerald-600" />,
      desc: 'Automated thermal fleets and temperature-monitored dark stores preserving meat cell structure without freezing.',
      stats: '30-Min Delivery Radius • Thermal GPS'
    },
    {
      id: 'aqua-fisheries',
      name: 'IGO Deep Sea & Aqua Fisheries',
      badge: 'Sustainable Harvest',
      icon: <Waves className="w-6 h-6 text-emerald-600" />,
      desc: 'Direct-from-boat daily morning sea catch and bio-floc freshwater fish with zero formalin or synthetic glazes.',
      stats: '4 AM Daily Catch • Chemical Free'
    },
    {
      id: 'organics-spices',
      name: 'IGO Organics & Spices',
      badge: 'Cold-Pressed Masalas',
      icon: <Layers className="w-6 h-6 text-emerald-600" />,
      desc: 'Stone-ground heritage spices, cold-pressed coconut & mustard oils, and artisanal ready-to-cook marinades.',
      stats: '100% Pure Spices • No Colors'
    },
    {
      id: 'mart-express',
      name: 'IGO Mart & Protein Hubs',
      badge: 'Omnichannel Retail',
      icon: <ShoppingBag className="w-6 h-6 text-emerald-600" />,
      desc: 'Ultra-hygienic neighborhood experience stores featuring live view cold butchery glass rooms.',
      stats: '45+ Stores Active • 2M Customers'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 text-[#0A1F12] relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-[#0A1F12] hover:border-emerald-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            IGO GROUPS ECOSYSTEM
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
            The Integrated IGO Agriculture & Protein Ecosystem
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            IGO Protein Cuts is the direct-to-consumer flagship brand powered by IGO Groups—bringing farm, fisheries, cold-chain logistics, and spices under one roof.
          </p>
        </div>

        <div className="space-y-3">
          {divisions.map((div) => (
            <div
              key={div.id}
              className="bg-neutral-50 border border-neutral-200 hover:border-emerald-300 rounded-2xl p-4 transition duration-300 flex items-start gap-4"
            >
              <div className="p-3 bg-white border border-emerald-200 rounded-xl shrink-0">
                {div.icon}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0A1F12] text-sm">{div.name}</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    {div.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">{div.desc}</p>
                <div className="text-[11px] font-semibold text-emerald-700 pt-1">{div.stats}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-500">
            Interested in starting an IGO Franchise or Supply Partnership?
          </div>
          <button
            onClick={() => {
              onClose();
              onNavigate('/franchise');
            }}
            className="w-full sm:w-auto bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            Franchise Opportunities <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
