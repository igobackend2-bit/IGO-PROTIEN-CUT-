import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Product, ProductWeightOption } from '../types';

interface AddedToCartOverlayProps {
  info: { product: Product; weight: ProductWeightOption; quantity: number } | null;
  onClose: () => void;
}

/**
 * Full-screen "Added to Cart" confirmation — replaces the old silent,
 * easy-to-miss per-card "Added!" state with something unmissable no matter
 * which Add button (homepage rails, product page, category grid, combo
 * banners, etc.) was clicked. Auto-dismisses; also dismissible by tapping
 * the backdrop.
 */
export const AddedToCartOverlay: React.FC<AddedToCartOverlayProps> = ({ info, onClose }) => {
  useEffect(() => {
    if (!info) return;
    const timer = setTimeout(onClose, 1800);
    return () => clearTimeout(timer);
  }, [info, onClose]);

  if (!info) return null;

  const { product, weight, quantity } = info;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4 animate-popIn cursor-default"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-[#0F7B3A]" />
        </div>

        <div>
          <h2 className="text-lg font-black text-[#08120B]">Added to Cart!</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Fresh and on its way to checkout</p>
        </div>

        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-left">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#08120B] line-clamp-1">{product.name}</div>
            <div className="text-[11px] text-neutral-500">
              {weight.label} &middot; Qty {quantity}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
