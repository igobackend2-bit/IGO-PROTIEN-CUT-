import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, ChevronDown, X, Check } from 'lucide-react';

const areas = [
  'Coimbatore', 'Chennai', 'Bangalore', 'Salem', 'Tiruppur',
  'Erode', 'Pollachi', 'Tiruchy', 'Madurai', 'Ooty'
];

const DeliveryBar = () => {
  const [selectedArea, setSelectedArea] = useState('Coimbatore');
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(localStorage.getItem('igo_announcement') || 'Slaughtered fresh daily. Delivered within 90 mins.');

  React.useEffect(() => {
    const handler = (e: Event) => {
      setAnnouncement((e as CustomEvent).detail);
    };
    window.addEventListener('announcementUpdate', handler);
    return () => window.removeEventListener('announcementUpdate', handler);
  }, []);

  return (
    <div className="relative bg-neutral-dark text-white py-2 px-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[10px] sm:text-xs">
        {/* Location */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 hover:text-igo-gold transition-colors group"
        >
          <MapPin className="w-3.5 h-3.5 text-igo-gold" />
          <span className="text-white/60 hidden sm:inline">Deliver to:</span>
          <span className="font-bold">{selectedArea}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dynamic Announcement */}
        <div className="flex-1 text-center truncate px-4 text-white/80 font-medium">
          {announcement}
        </div>

        {/* Delivery Time */}
        <div className="flex items-center gap-2 text-white/70">
          <div className="w-2 h-2 rounded-full bg-igo-green animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-igo-green" />
          <span className="hidden sm:inline font-bold text-igo-green">60-90 mins</span>
        </div>
      </div>


      {/* Area Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-neutral-100 z-50 p-4"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-neutral-dark">Select Delivery Area</h4>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {areas.map(area => (
                  <button
                    key={area}
                    onClick={() => { setSelectedArea(area); setIsOpen(false); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedArea === area
                        ? 'bg-igo-green text-white shadow-lg shadow-igo-green/20'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-igo-green/10 hover:text-igo-green'
                    }`}
                  >
                    {selectedArea === area && <Check className="w-3 h-3" />}
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryBar;
