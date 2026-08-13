import React, { useState } from 'react';
import { X, Dumbbell, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useLang } from '../lib/language';
import { translateProductName } from '../lib/productNames';

interface ProteinCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

export const ProteinCalculatorModal: React.FC<ProteinCalculatorModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [weightKg, setWeightKg] = useState<number>(70);
  const [goal, setGoal] = useState<'muscle' | 'fatloss' | 'maintenance'>('muscle');
  const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'athlete'>('athlete');
  const [calculatedTarget, setCalculatedTarget] = useState<number | null>(null);
  const { lang } = useLang();

  if (!isOpen) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    let multiplier = 1.4;
    if (goal === 'muscle') multiplier = activity === 'athlete' ? 2.2 : 1.8;
    else if (goal === 'fatloss') multiplier = 1.8;
    else multiplier = 1.4;

    const target = Math.round(weightKg * multiplier);
    setCalculatedTarget(target);
  };

  const getRecommendedProducts = () => {
    return products.filter((p) => p.category === 'chicken' || p.category === 'fish' || p.category === 'combo-packs').slice(0, 3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-xl w-full p-6 text-[#0A1F12] relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-[#0A1F12] hover:border-emerald-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
            <Dumbbell className="w-4 h-4 text-emerald-600" />
            NUTRITION & MACRO ASSISTANT
          </div>
          <h2 className="text-2xl font-black text-[#0A1F12] tracking-tight">Daily Protein Intake Calculator</h2>
          <p className="text-xs text-neutral-500">
            Find your precise daily protein requirement based on body weight, fitness goals, and training intensity.
          </p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Body Weight (kg)</label>
            <input
              type="number"
              min={30}
              max={180}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-[#0A1F12] focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Primary Fitness Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'muscle', label: 'Muscle Building' },
                { id: 'fatloss', label: 'Fat Loss & Lean' },
                { id: 'maintenance', label: 'General Health' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    goal === g.id
                      ? 'bg-[#0F7B3A] border-emerald-400 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-[#0A1F12]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Activity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sedentary', label: 'Light Exercise' },
                { id: 'moderate', label: '3-4 Workouts/Wk' },
                { id: 'athlete', label: 'Heavy Athlete / Gym' }
              ].map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActivity(act.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    activity === act.id
                      ? 'bg-[#0F7B3A] border-emerald-400 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-[#0A1F12]'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20"
          >
            Calculate Protein Goal
          </button>
        </form>

        {calculatedTarget !== null && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">Your Recommended Daily Target</div>
                <div className="text-3xl font-black text-[#0A1F12]">{calculatedTarget}g <span className="text-xs text-emerald-700 font-normal">Pure Protein / day</span></div>
              </div>
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="text-xs text-neutral-600 leading-relaxed border-t border-emerald-200 pt-3 space-y-2">
              <div className="font-bold text-[#0A1F12] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Suggested Daily Meat Intake:
              </div>
              <p className="text-xs text-neutral-600">
                To reach {calculatedTarget}g protein, you need approx. <strong>{Math.round((calculatedTarget / 31) * 100)}g</strong> of fresh Chicken Breast or <strong>{Math.round((calculatedTarget / 26) * 100)}g</strong> of Seer Fish steaks per day.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Recommended Cuts in Catalog:</div>
              <div className="space-y-2">
                {getRecommendedProducts().map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(prod);
                    }}
                    className="p-2.5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-xl flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-[#0A1F12] line-clamp-1">{translateProductName(prod.id, prod.name, lang)}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">{prod.nutrition.protein} per serving</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
