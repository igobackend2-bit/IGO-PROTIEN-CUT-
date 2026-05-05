import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Percent, ChevronDown } from 'lucide-react';

interface SubscribeSaveProps {
  onToggle: (active: boolean, frequency: string) => void;
  basePrice: number;
  discountPercent?: number;
}

const SubscribeSave: React.FC<SubscribeSaveProps> = ({ onToggle, basePrice, discountPercent = 10 }) => {
  const [isActive, setIsActive] = useState(false);
  const [frequency, setFrequency] = useState('Every Week');
  const [showFreq, setShowFreq] = useState(false);

  const discountedPrice = Math.round(basePrice * (1 - discountPercent / 100));

  const frequencies = ['Every Week', 'Every 2 Weeks', 'Every Month'];

  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    onToggle(nextState, frequency);
  };

  return (
    <div className={`mt-4 p-4 rounded-2xl border-2 transition-all duration-300 ${isActive ? 'border-igo-green bg-igo-green/5 shadow-inner' : 'border-neutral-100 bg-neutral-50/50'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-igo-green text-white' : 'bg-white text-neutral-400'}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isActive ? 'text-igo-green' : 'text-neutral-600'}`}>Subscribe & Save</span>
              <span className="px-1.5 py-0.5 bg-red-100 text-red-500 text-[9px] font-bold rounded uppercase">-{discountPercent}%</span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium">Regular delivery, better price</p>
          </div>
        </div>
        
        <button 
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-igo-green' : 'bg-neutral-300'}`}
        >
          <motion.div 
            animate={{ x: isActive ? 24 : 2 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </button>
      </div>

      {isActive && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 pt-4 border-t border-igo-green/10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-500">Frequency:</span>
            <div className="relative">
              <button 
                onClick={() => setShowFreq(!showFreq)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:border-igo-green transition-colors"
              >
                {frequency}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFreq ? 'rotate-180' : ''}`} />
              </button>
              
              {showFreq && (
                <div className="absolute bottom-full mb-2 right-0 w-40 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                  {frequencies.map(f => (
                    <button
                      key={f}
                      onClick={() => {
                        setFrequency(f);
                        setShowFreq(false);
                        onToggle(true, f);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-neutral-50 hover:text-igo-green transition-colors"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl border border-white">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sub Price:</span>
            <span className="text-sm font-bold text-igo-green">₹{discountedPrice} <span className="text-[10px] text-neutral-300 line-through">₹{basePrice}</span></span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SubscribeSave;
