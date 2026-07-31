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
  // Farmer's Factory is live at famersfactory.com (part of the same IGO
  // Group ecosystem). IGO Mart's own storefront isn't live yet, so it has no
  // real URL to send anyone to — this shows "Coming Soon" instead of
  // redirecting to a domain that doesn't exist.
  const storeUrl = isFarmer ? 'https://famersfactory.com' : null;
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
    if (!storeUrl) return; // IGO Mart — no live site to redirect to yet.
    window.open(storeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyChecklist = () => {
    const active = ingredients.filter((i) => selectedItems.includes(i.id));
    const text = `${targetStore} Ingredients for ${dishName}:\n` +
      active.map((i) => `• ${i.name} (${i.quantity})`).join('\n') +
      (storeUrl ? `\nOrder online at: ${storeUrl}` : `\n${targetStore} is coming soon.`);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              {storeUrl ? (
                <>
                  The following required farm-fresh vegetables will be pre-filled for your cart on{' '}
                  <strong className="text-[#08120B]">{targetStore}</strong> ({storeUrl}).
                </>
              ) : (
                <>
                  <strong className="text-[#08120B]">{targetStore}</strong> isn&rsquo;t live yet — you can still copy this
                  checklist of authentic masalas &amp; spices to order elsewhere in the meantime.
                </>
              )}
            </p>
          </div>

          {/* Ingredient Checklist — just what's needed, no pricing or photos
              since those aren't real numbers/images for a store that isn't
              live to buy from yet. */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
              Required Recipe Items ({selectedItems.length})
            </div>

            <div className="space-y-2">
              {ingredients.map((item) => {
                const isChecked = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-400 text-[#08120B]'
                        : 'bg-white border-neutral-200 text-neutral-500 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                      isChecked ? 'bg-[#0F7B3A] border-emerald-400 text-white' : 'border-neutral-300'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#08120B]">{item.name}</div>
                      <div className="text-[10px] text-neutral-500">{item.quantity}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Copy the checklist */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-neutral-500">{selectedItems.length} item{selectedItems.length === 1 ? '' : 's'} selected</span>
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
            disabled={!storeUrl}
            className={`flex-1 font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              storeUrl
                ? 'bg-[#0F7B3A] hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 cursor-pointer'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {storeUrl ? (
              <>
                Redirect to {targetStore} <ExternalLink className="w-4 h-4" />
              </>
            ) : (
              `${targetStore} — Coming Soon`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
