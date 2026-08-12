import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Star, Truck } from 'lucide-react';
import { Order, Product } from '../types';
import { submitReview, fetchMyReview, MyReview } from '../lib/api/reviews';
import { submitOrderFeedback, fetchMyOrderFeedback, MyOrderFeedback } from '../lib/api/orderFeedback';

interface OrderFeedbackModalProps {
  order: Order;
  onClose: () => void;
}

interface ProductFeedbackState {
  rating: number;
  comment: string;
  myReview: MyReview | null;
  loaded: boolean;
  submitting: boolean;
  error: string | null;
  success: boolean;
}

const StarPicker: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-lg transition ${star <= value ? 'text-emerald-600' : 'text-neutral-300'}`}
      >
        <Star className={`w-5 h-5 ${star <= value ? 'fill-emerald-600' : ''}`} />
      </button>
    ))}
  </div>
);

/**
 * Post-delivery feedback form — covers "product to delivery" in one place:
 *   1. A per-product star rating + comment for every distinct item in the
 *      order, written to `product_reviews` via the existing submitReview()
 *      (reviews.ts) — same table, same admin moderation queue
 *      (/admin → Reviews), same "shows on the specific product once
 *      approved" behavior that already exists.
 *   2. One overall delivery-experience rating + comment, written to the new
 *      website-owned `igo_order_feedback` table via submitOrderFeedback()
 *      (orderFeedback.ts) — surfaced in /admin → Delivery Feedback.
 *
 * Each half tracks its own submitted/pending state independently so a
 * customer can rate products now and come back for delivery feedback later
 * (or vice versa) without losing what they already sent.
 */
export const OrderFeedbackModal: React.FC<OrderFeedbackModalProps> = ({ order, onClose }) => {
  // Deleted/legacy products with no real catalog id all fall back to the same
  // stub id ("unknown" — see mapRemoteOrder in storage.ts), which would
  // otherwise collapse multiple distinct deleted items into one entry here
  // and try to submit a review against a non-existent product id. There's no
  // real product page for these to attach a review to, so they're simply not
  // offered a rating row — only the delivery-experience section still applies.
  const uniqueProducts: Product[] = Array.from(
    new Map<string, Product>(
      order.items.filter((item) => item.product.id && item.product.id !== 'unknown').map((item) => [item.product.id, item.product])
    ).values()
  );

  const [productState, setProductState] = useState<Record<string, ProductFeedbackState>>({});
  const [overallRating, setOverallRating] = useState(5);
  const [overallComment, setOverallComment] = useState('');
  const [myFeedback, setMyFeedback] = useState<MyOrderFeedback | null>(null);
  const [overallLoaded, setOverallLoaded] = useState(false);
  const [overallSubmitting, setOverallSubmitting] = useState(false);
  const [overallError, setOverallError] = useState<string | null>(null);
  const [overallSuccess, setOverallSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchMyOrderFeedback(order.id).then((mine) => {
      if (!cancelled) {
        setMyFeedback(mine);
        setOverallLoaded(true);
      }
    });

    uniqueProducts.forEach((product) => {
      fetchMyReview(product.id).then((mine) => {
        if (cancelled) return;
        setProductState((prev) => ({
          ...prev,
          [product.id]: {
            rating: mine?.rating ?? 5,
            comment: mine?.comment ?? '',
            myReview: mine,
            loaded: true,
            submitting: false,
            error: null,
            success: false
          }
        }));
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const updateProduct = (productId: string, patch: Partial<ProductFeedbackState>) => {
    setProductState((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } }));
  };

  const handleSubmitProduct = async (productId: string) => {
    const state = productState[productId];
    // Guard against a fast double-click firing this twice before the
    // `disabled` prop re-renders — React state updates aren't synchronous,
    // so checking `state.submitting` here (not just relying on the button's
    // disabled attribute) closes that race.
    if (!state || state.submitting) return;
    updateProduct(productId, { submitting: true, error: null });
    const result = await submitReview(productId, state.rating, state.comment);
    if (!result.ok) {
      updateProduct(productId, { submitting: false, error: result.error ?? 'Could not submit. Please try again.' });
      return;
    }
    const mine = await fetchMyReview(productId);
    updateProduct(productId, { submitting: false, success: true, myReview: mine });
  };

  const handleSubmitOverall = async () => {
    if (overallSubmitting) return;
    setOverallSubmitting(true);
    setOverallError(null);
    const result = await submitOrderFeedback(order.id, overallRating, overallComment);
    if (!result.ok) {
      setOverallSubmitting(false);
      setOverallError(result.error ?? 'Could not submit. Please try again.');
      return;
    }
    const mine = await fetchMyOrderFeedback(order.id);
    setMyFeedback(mine);
    setOverallSubmitting(false);
    setOverallSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col text-[#0A1F12] shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-base">Rate Your Order</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Order #{order.orderNumber} — tell us how it went</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-[#0A1F12] hover:bg-neutral-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Delivery experience */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A1F12]">
              <Truck className="w-4 h-4 text-emerald-600" /> Delivery Experience
            </div>

            {!overallLoaded ? (
              <div className="text-xs text-neutral-400">Loading…</div>
            ) : myFeedback || overallSuccess ? (
              <div className="space-y-2">
                <div className="text-emerald-600 text-xs">{'★'.repeat(myFeedback?.deliveryRating ?? overallRating)}</div>
                <p className="text-xs text-neutral-600">{myFeedback?.comment || overallComment || 'Thanks for your feedback!'}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submitted — thank you!
                </div>
              </div>
            ) : (
              <>
                <StarPicker value={overallRating} onChange={setOverallRating} />
                <textarea
                  placeholder="How was packaging, delivery time, and the overall handover?"
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
                {overallError && (
                  <div className="bg-[#0A1F12] rounded-xl p-2.5 text-[11px] text-white">{overallError}</div>
                )}
                <button
                  type="button"
                  onClick={handleSubmitOverall}
                  disabled={overallSubmitting}
                  className="bg-[#0F7B3A] hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl text-xs uppercase"
                >
                  {overallSubmitting ? 'Submitting…' : 'Submit Delivery Feedback'}
                </button>
              </>
            )}
          </div>

          {/* Per-product reviews */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#0A1F12]">Rate Your Products</div>
            {uniqueProducts.map((product) => {
              const state = productState[product.id];
              return (
                <div key={product.id} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover bg-white border border-neutral-200 shrink-0"
                    />
                    <div className="text-xs font-bold text-[#0A1F12] truncate">{product.name}</div>
                  </div>

                  {!state || !state.loaded ? (
                    <div className="text-xs text-neutral-400">Loading…</div>
                  ) : state.myReview || state.success ? (
                    <div className="space-y-1.5">
                      <div className="text-emerald-600 text-xs">{'★'.repeat(state.myReview?.rating ?? state.rating)}</div>
                      {(state.myReview?.comment || state.comment) && (
                        <p className="text-xs text-neutral-600">{state.myReview?.comment || state.comment}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {state.myReview?.isHidden ? 'Submitted — pending approval' : 'Live on the product page'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <StarPicker value={state.rating} onChange={(n) => updateProduct(product.id, { rating: n })} />
                      <textarea
                        placeholder="Cut precision, freshness, packaging..."
                        value={state.comment}
                        onChange={(e) => updateProduct(product.id, { comment: e.target.value })}
                        className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 text-xs text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                        rows={2}
                      />
                      {state.error && (
                        <div className="bg-[#0A1F12] rounded-xl p-2 text-[11px] text-white">{state.error}</div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSubmitProduct(product.id)}
                        disabled={state.submitting}
                        className="border border-[#0F7B3A] text-[#0F7B3A] hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed font-bold px-3 py-1.5 rounded-xl text-[11px] uppercase"
                      >
                        {state.submitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-neutral-100 hover:bg-neutral-200 text-[#0A1F12] font-bold py-2.5 rounded-xl text-xs uppercase transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
