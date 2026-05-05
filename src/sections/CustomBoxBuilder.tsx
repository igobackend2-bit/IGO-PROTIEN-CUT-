import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Plus, Minus, Info, ShoppingBag, CheckCircle2, ThermometerSnowflake } from 'lucide-react';

const availableCuts = [
  { id: 101, name: 'Premium Chicken Breast', weight: '500g', price: 210, img: '/images/products/chicken-breast.png' },
  { id: 102, name: 'Mutton Curry Cut', weight: '500g', price: 450, img: '/images/products/mutton-curry.png' },
  { id: 103, name: 'Seer Fish Steaks', weight: '500g', price: 350, img: '/images/products/seer-fish.png' },
  { id: 104, name: 'Nattu Kozhi Eggs', weight: '6pk', price: 90, img: '/images/products/eggs.png' },
  { id: 105, name: 'Jumbo Prawns', weight: '250g', price: 240, img: '/images/products/tiger-prawns.png' },
];

const CustomBoxBuilder = () => {
  const [box, setBox] = useState<any[]>([]);
  const maxItems = 6;

  const addItem = (item: any) => {
    if (box.length < maxItems) {
      setBox([...box, { ...item, boxId: Math.random() }]);
    }
  };

  const removeItem = (boxId: number) => {
    setBox(box.filter(item => item.boxId !== boxId));
  };

  const total = box.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="py-24 bg-neutral-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-igo-gold font-bold text-sm uppercase tracking-widest">Personalized Protein</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 text-neutral-dark">
            Build Your <span className="text-igo-green">Custom Box.</span>
          </h2>
          <p className="mt-4 text-neutral-500 max-w-2xl mx-auto">
            Choose your favorite cuts and we'll pack them in our signature 
            temperature-controlled "Smart Cooler" for the ultimate freshness.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Selection Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-neutral-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-igo-green" />
                Select Your Cuts
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {availableCuts.map(item => (
                  <div 
                    key={item.id} 
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-neutral-light hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-igo-green/20"
                    onClick={() => addItem(item)}
                  >
                    <img src={item.img} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-neutral-dark truncate">{item.name}</h4>
                      <p className="text-xs text-neutral-400">{item.weight} • ₹{item.price}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white text-igo-green shadow-sm flex items-center justify-center group-hover:bg-igo-green group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-igo-green/5 rounded-[2rem] p-8 border border-igo-green/10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-igo-green shadow-sm shrink-0">
                <ThermometerSnowflake className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-dark">Smart Cooler Technology</h4>
                <p className="text-sm text-neutral-500">Every custom box includes a reusable ice-gel pack that maintains 0-4°C for up to 6 hours.</p>
              </div>
            </div>
          </div>

          {/* Virtual Box Preview */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-neutral-dark rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
              {/* Box Top Lip Visual */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-white/10" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Box className="w-6 h-6 text-igo-gold" />
                  <h3 className="text-xl font-bold text-white">Your Smart Cooler</h3>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                  {box.length} / {maxItems} Full
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(box.length / maxItems) * 100}%` }}
                  className="h-full bg-igo-gold"
                />
              </div>

              {/* Slot Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[...Array(maxItems)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden group/slot">
                    <AnimatePresence mode="popLayout">
                      {box[i] ? (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 bg-white"
                        >
                          <img src={box[i].img} alt="" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeItem(box[i].boxId)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ) : (
                        <Plus className="w-6 h-6 text-white/5 group-hover/slot:text-white/20 transition-colors" />
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm font-medium">Box Subtotal</span>
                  <span className="text-2xl font-display font-bold text-igo-gold">₹{total}</span>
                </div>
                
                {box.length >= 3 && (
                  <div className="flex justify-between items-center bg-igo-gold/10 p-3 rounded-xl border border-igo-gold/20">
                    <span className="text-[10px] font-bold text-igo-gold uppercase tracking-wider">Bundle Savings:</span>
                    <span className="text-xs font-bold text-igo-gold">-₹{Math.round(total * 0.1)} (10% Off)</span>
                  </div>
                )}
                
                {box.length === 0 ? (
                  <div className="text-center py-4 text-neutral-500 text-sm italic">
                    Start adding items to fill your box
                  </div>
                ) : (
                  <button className="w-full bg-igo-gold text-neutral-dark py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-igo-gold/10">
                    <ShoppingBag className="w-5 h-5" />
                    Add Box to Cart
                  </button>
                )}
                
                <div className="flex items-center gap-2 justify-center text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3 text-igo-green" />
                  Eco-Friendly Recyclable Box
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomBoxBuilder;
