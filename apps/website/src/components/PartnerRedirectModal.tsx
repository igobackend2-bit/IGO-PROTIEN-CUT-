import { useState } from 'react';
import {
  ExternalLink,
  ShoppingBag,
  Check,
  X,
  Store,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { RequiredIngredient } from '../types';

interface PartnerRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStore: "Farmer's Factory" | 'IGO Mart';
  ingredients: RequiredIngredient[];
  dishName: string;
}

export const PartnerRedirectModal = ({
  isOpen,
  onClose,
  targetStore,
  ingredients,
  dishName
}: PartnerRedirectModalProps) => {
  if (!isOpen) return null;

  const isFarmer = targetStore === "Farmer's Factory";
  const storeUrl = isFarmer ? 'https://farmersfactory.com' : 'https://igomart.com';
  const storeBadgeColor = isFarmer ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#0F7B3A] text-white border-emerald-600';

  const [selectedItems, setSelectedItems] = useState<string[]>(ingredients.map((i) => i.id));
  const [copied, setCopied] = useState(false);

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleProceedToStore = () => {
    // Open target website in new window
    window.open(storeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyChecklist = () => {
    const active = ingredients.filter((i) => selectedItems.includes(i.id));
    const text = `${targetStore} Ingredients for ${dishName}:\n` +
      active.map((i) => `• ${i.name} (${i.quantity}) - ₹${i.estimatedPrice}`).join('\n') +
      `\nOrder online at: ${storeUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEst = ingredients
    .filter((i) => selectedItems.includes(i.id))
    .reduce((sum, item) => sum + item.estimatedPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border-2 border-neutral-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-[#08120B]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F7B3A] text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${storeBadgeColor}`}>
                Partner Redirect • {targetStore}
              </span>
              <h3 className="text-lg font-black text-[#08120B] mt-0.5">
                {isFarmer ? 'Fresh Produce & Vegetables' : 'Masalas, Spices & Groceries'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-[#08120B] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs space-y-1">
            <p className="text-neutral-600">
              Selected recipe preparation: <strong className="text-emerald-700">{dishName}</strong>
            </p>
            <p className="text-neutral-500">
              The following required {isFarmer ? 'farm-fresh vegetables' : 'authentic masalas & spices'} will be pre-filled for your cart on <strong className="text-[#08120B]">{targetStore}</strong> ({storeUrl}).
            </p>
          </div>

          {/* Ingredient Checkbox List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-neutral-500 font-bold uppercase tracking-wider">
              <span>Required Recipe Items ({selectedItems.length})</span>
              <span>Est. Cost</span>
            </div>

            <div className="space-y-2">
              {ingredients.map((item) => {
                const isChecked = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-400 text-[#08120B]'
                        : 'bg-white border-neutral-200 text-neutral-500 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                        isChecked ? 'bg-[#0F7B3A] border-emerald-400 text-white' : 'border-neutral-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-neutral-200" />
                      <div>
                        <div className="text-xs font-bold text-[#08120B]">{item.name}</div>
                        <div className="text-[10px] text-neutral-500">{item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-xs font-black text-emerald-700">₹{item.estimatedPrice}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500">Total Est. Partner Order</span>
              <div className="text-xl font-black text-emerald-700">₹{totalEst}</div>
            </div>
            <button
              onClick={handleCopyChecklist}
              className="text-xs text-emerald-700 hover:text-emerald-600 bg-white hover:bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5" />}
              {copied ? 'Copied List!' : 'Copy List'}
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-neutral-200 text-neutral-600 hover:text-[#08120B] py-3 rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            Stay in Cart
          </button>
          <button
            onClick={handleProceedToStore}
            className="flex-1 bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            Redirect to {targetStore} <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
