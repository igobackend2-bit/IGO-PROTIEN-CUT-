import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Info, Scale, Flame, Zap, Star } from 'lucide-react';

const comparisons = [
  {
    category: 'Chicken Breast',
    igo: {
      protein: '31g',
      fat: '3.6g',
      source: 'Verified Heritage Farm',
      antibiotics: 'Zero (Certified)',
      texture: 'Tender & Juicy',
      healthTip: 'Highest protein-to-calorie ratio.'
    },
    standard: {
      protein: '25g',
      fat: '6.2g',
      source: 'Generic Poultry',
      antibiotics: 'Not Verified',
      texture: 'Often Stringy',
      healthTip: 'Lower nutrient density.'
    }
  },
  {
    category: 'Mutton Curry Cut',
    igo: {
      protein: '22g',
      fat: '14g',
      source: 'Grass-fed (Ooty Hills)',
      antibiotics: 'Zero (Certified)',
      texture: 'Butter-Soft',
      healthTip: 'Rich in Vitamin B12.'
    },
    standard: {
      protein: '18g',
      fat: '22g',
      source: 'Local Mandi',
      antibiotics: 'Unknown',
      texture: 'Can be Tough',
      healthTip: 'Higher saturated fats.'
    }
  }
];

const AIProductComparison = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-igo-green font-bold text-sm uppercase tracking-widest"
          >
            Science of Freshness
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold mt-4 text-neutral-dark"
          >
            How We <span className="text-igo-green">Compare.</span>
          </motion.h2>
          <p className="mt-4 text-neutral-500 max-w-2xl mx-auto">
            Don't just take our word for it. See the nutritional and quality 
            metrics that set IGO apart from standard market meat.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {comparisons.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                activeIndex === i 
                  ? 'bg-igo-green text-white shadow-lg' 
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {c.category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* IGO Card */}
          <motion.div
            key={`igo-${activeIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5 }}
            className="group/igo bg-gradient-to-br from-igo-green/10 via-white to-igo-green/5 border-2 border-igo-green rounded-[3rem] p-10 relative overflow-hidden transition-all shadow-xl hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            <div className="absolute top-0 right-0 bg-igo-green text-white px-6 py-2 rounded-bl-3xl font-bold text-xs uppercase tracking-widest group-hover/igo:bg-igo-gold transition-colors z-10 shadow-sm">
              The IGO Advantage
            </div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-igo-green shadow-md group-hover/igo:scale-110 group-hover/igo:rotate-3 transition-all duration-300 border border-igo-green/20">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-neutral-dark drop-shadow-sm">Premium IGO Cut</h3>
                <span className="text-[10px] font-bold text-igo-green uppercase tracking-widest flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-igo-green" />
                  Health Spotlight: {comparisons[activeIndex].igo.healthTip}
                </span>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-center pb-6 border-b border-igo-green/10">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-igo-red drop-shadow-sm" />
                  <span className="font-medium text-neutral-700">Protein (per 100g)</span>
                </div>
                <span className="text-2xl font-black text-igo-green drop-shadow-sm">{comparisons[activeIndex].igo.protein}</span>
              </div>
              <div className="flex justify-between items-center pb-6 border-b border-igo-green/10">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-igo-gold drop-shadow-sm" />
                  <span className="font-medium text-neutral-700">Total Fat</span>
                </div>
                <span className="text-2xl font-black text-neutral-dark">{comparisons[activeIndex].igo.fat}</span>
              </div>
              <div className="flex justify-between items-center pb-6 border-b border-igo-green/10">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-igo-green drop-shadow-sm" />
                  <span className="font-medium text-neutral-700">Antibiotics</span>
                </div>
                <span className="text-sm font-black text-igo-green uppercase tracking-wider">{comparisons[activeIndex].igo.antibiotics}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-neutral-400 drop-shadow-sm" />
                  <span className="font-medium text-neutral-700">Sourcing</span>
                </div>
                <span className="text-sm font-black text-neutral-dark bg-white px-3 py-1 rounded-lg border border-neutral-100 shadow-sm">{comparisons[activeIndex].igo.source}</span>
              </div>
            </div>
          </motion.div>

          {/* Standard Card */}
          <motion.div
            key={`std-${activeIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-neutral-50 border border-neutral-200 rounded-[3rem] p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-neutral-200 text-neutral-500 px-6 py-2 rounded-bl-3xl font-bold text-xs uppercase tracking-widest shadow-inner">
              Standard Market
            </div>

            <div className="flex items-center gap-4 mb-10 grayscale opacity-70">
              <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-inner">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold text-neutral-500">Generic Market Cut</h3>
            </div>

            <div className="space-y-8 opacity-60">
              <div className="flex justify-between items-center pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-neutral-400" />
                  <span className="font-medium text-neutral-400">Protein (per 100g)</span>
                </div>
                <span className="text-xl font-bold text-neutral-400">{comparisons[activeIndex].standard.protein}</span>
              </div>
              <div className="flex justify-between items-center pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-neutral-400" />
                  <span className="font-medium text-neutral-400">Total Fat</span>
                </div>
                <span className="text-xl font-bold text-neutral-400">{comparisons[activeIndex].standard.fat}</span>
              </div>
              <div className="flex justify-between items-center pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-neutral-400" />
                  <span className="font-medium text-neutral-400">Antibiotics</span>
                </div>
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">{comparisons[activeIndex].standard.antibiotics}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-neutral-400" />
                  <span className="font-medium text-neutral-400">Sourcing</span>
                </div>
                <span className="text-sm font-bold text-neutral-400">{comparisons[activeIndex].standard.source}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIProductComparison;
