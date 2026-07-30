import React, { useState } from 'react';
import { X, Sparkles, Search, ArrowRight, ChefHat } from 'lucide-react';
import { Product } from '../types';
import { StoreService } from '../lib/storage';
import { localAiSearch } from '../lib/aiSearchFallback';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    // The server endpoint exists in local dev (server.ts) and on Vercel
    // (api/ai-search.ts), but NOT on the live Hostinger deployment, which is
    // static files only. So treat a 404 as "no AI server here" and answer from
    // the real catalog instead of showing a connection error.
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.resultText) {
          try {
            const cleaned = data.resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            setResponse(JSON.parse(cleaned));
          } catch {
            setResponse({ rawText: data.resultText });
          }
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Network error or no such endpoint — fall through to the catalog search.
    }

    const local = localAiSearch(query, StoreService.getProducts());
    if (local.recommendations.length > 0) {
      setResponse(local);
    } else {
      setResponse({
        rawText:
          "I couldn't find a good match for that. Try naming a protein (chicken, mutton, fish, prawns) " +
          'or what you want from it — high protein, boneless, quick to cook.'
      });
    }
    setIsLoading(false);
  };

  const samplePrompts = [
    'High protein zero bone meal for gym diet',
    'Best fish for quick 10-minute tawa fry',
    'Keto dinner for 4 people with mutton',
    'Fresh organic eggs for morning breakfast'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full text-[#08120B] p-6 relative shadow-2xl overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-[#08120B] cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
          <Sparkles className="w-5 h-5" />
          <span>Protein Cuts AI Sommelier & Meat Chef</span>
        </div>
        <p className="text-xs text-neutral-500 mb-6">
          Ask our AI chef anything about fresh cuts, protein macros, cooking times, or recipe pairings.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="e.g. 'I want high protein chicken breast for weight loss prep'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-[#08120B] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Ask AI <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Sample Prompts */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <span className="text-[10px] text-neutral-500 font-bold uppercase py-1">Try asking:</span>
          {samplePrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setQuery(p);
              }}
              className="text-[11px] bg-neutral-50 border border-neutral-200 hover:border-emerald-400 px-2.5 py-1 rounded-full text-neutral-600 hover:text-[#08120B] transition cursor-pointer"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* AI Output Result Card */}
        {response && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3 max-h-64 overflow-y-auto custom-scrollbar text-xs">
            {response.recommendations ? (
              response.recommendations.map((rec: any, idx: number) => {
                const matchedProduct = products.find(
                  (p) => p.name.toLowerCase().includes(rec.name?.toLowerCase()) || p.category === rec.category
                ) || products[0];

                return (
                  <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-3 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#08120B] text-sm flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-emerald-600" /> {rec.name}
                      </h4>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {rec.protein}
                      </span>
                    </div>
                    <p className="text-neutral-600 text-xs">{rec.reason}</p>
                    <div className="bg-neutral-50 p-2 rounded-lg text-neutral-600 text-[11px] border border-neutral-200">
                      <strong>Quick Recipe:</strong> {rec.quickRecipe}
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(matchedProduct);
                      }}
                      className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      View Product & Buy <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-neutral-600 leading-relaxed">{response.rawText || response.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
