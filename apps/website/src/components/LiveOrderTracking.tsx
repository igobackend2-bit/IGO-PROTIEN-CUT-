import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, PhoneCall, Clock, MapPin, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { Order } from '../types';
import { StoreService } from '../lib/storage';
import { subscribeToOrder } from '../lib/api/orders';
import { useLang } from '../lib/language';
import { translateProductName } from '../lib/productNames';

interface LiveOrderTrackingProps {
  orderId: string;
  onBack: () => void;
}

export const LiveOrderTracking: React.FC<LiveOrderTrackingProps> = ({
  orderId,
  onBack
}) => {
  // Match the requested order ONLY. This previously fell back to `orders[0]`
  // when the id didn't match, which silently showed a different order —
  // including its delivery OTP and address. Harmless when tracking was reached
  // by pressing a button, actively misleading now that /tracking/<id> is a real
  // URL someone can mistype or share. An unknown id shows "Order Not Found".
  const [order, setOrder] = useState<Order | null>(
    () => StoreService.getOrders().find((o) => o.id === orderId) ?? null
  );
  const { lang } = useLang();

  useEffect(() => {
    const syncOrder = () => {
      const found = StoreService.getOrders().find((o) => o.id === orderId);
      setOrder(found ?? null);
    };

    window.addEventListener('protein_cuts_orders_updated', syncOrder);

    // Genuinely live tracking. The app's phase7_8 migration already added
    // `orders` to the `supabase_realtime` publication, so when an admin moves
    // this order to "Out for Delivery" in the dashboard, Postgres pushes the
    // change straight here — no polling, and no backend change was needed.
    const unsubscribe = subscribeToOrder(orderId, () => {
      // Re-hydrate the whole list so the cached copy and this view agree.
      StoreService.hydrateOrders().catch(() => {});
    });

    // Pull once on mount too, in case the status moved while the page was closed.
    StoreService.hydrateOrders().catch(() => {});

    return () => {
      window.removeEventListener('protein_cuts_orders_updated', syncOrder);
      unsubscribe();
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#0A1F12]">Order Not Found</h2>
        <button onClick={onBack} className="mt-4 bg-[#0F7B3A] text-white px-4 py-2 rounded-xl text-xs font-bold">
          Back to Home
        </button>
      </div>
    );
  }

  const steps = [
    { label: 'Order Confirmed', desc: 'Received & sent to Master Butcher', stepNum: 1 },
    { label: 'Freshly Cut & Inspected', desc: 'Dressed & vacuum sealed at 0-4°C', stepNum: 2 },
    { label: 'Out for Express Delivery', desc: 'Rider en route in thermal bag', stepNum: 3 },
    { label: 'Arrived at Doorstep', desc: 'Verify OTP & Enjoy fresh meal', stepNum: 4 }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#0A1F12] transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Account / Orders
        </button>

        <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> LIVE STATUS UPDATES
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4 mb-6">
          <div>
            <div className="text-xs text-neutral-500">Order Reference</div>
            <h1 className="text-xl font-black text-[#0A1F12] tracking-tight">{order.orderNumber}</h1>
            <div className="text-xs text-neutral-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleTimeString()}</div>
          </div>

          {order.driverDetails?.otp && (
            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-right">
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Delivery OTP</div>
              <div className="text-lg font-black text-[#0A1F12] tracking-widest">{order.driverDetails.otp}</div>
            </div>
          )}
        </div>

        {/* Step Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative mb-6">
          {steps.map((s) => {
            const isDone = order.trackingStep >= s.stepNum;
            const isCurrent = order.trackingStep === s.stepNum;

            return (
              <div
                key={s.stepNum}
                className={`p-3 rounded-2xl border transition relative ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-500 text-[#0A1F12] shadow-md'
                    : isDone
                    ? 'bg-white border-emerald-200 text-emerald-700'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider">Step {s.stepNum}</span>
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-neutral-400" />}
                </div>
                <h4 className="text-xs font-bold text-[#0A1F12] mb-0.5">{s.label}</h4>
                <p className="text-[10px] text-neutral-500 line-clamp-2">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Driver Details Card */}
        {order.driverDetails && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0A1F12] text-sm">{order.driverDetails.name}</h4>
                <div className="text-xs text-neutral-600">
                  {order.driverDetails.vehicleNo} • ⭐ {order.driverDetails.rating} Delivery Executive
                </div>
              </div>
            </div>

            <a
              href={`tel:${order.driverDetails.phone}`}
              className="bg-[#0F7B3A] hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Rider ({order.driverDetails.phone})
            </a>
          </div>
        )}
      </div>

      {/* Delivery progress panel. This is a decorative step visualizer, not a
          live GPS map — the website has no real-time rider coordinates feed,
          so it deliberately doesn't claim live location or a specific ETA
          minute count (both were hard-coded/fake before this fix). */}
      <div className="bg-[#0A1F12] rounded-3xl p-6 relative overflow-hidden h-64 flex flex-col justify-between shadow-lg shadow-emerald-950/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white border border-white/20">
            <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Delivering to: {order.shippingAddress.flatNo}, {order.shippingAddress.street}</span>
          </div>
          {order.trackingStep === 3 && (
            <span className="text-xs text-emerald-300 font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              On The Way
            </span>
          )}
        </div>

        {/* Route Animation Line */}
        <div className="relative z-10 my-auto flex items-center justify-between px-8">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#0F7B3A] text-white flex items-center justify-center font-bold text-xs">
              PC
            </div>
            <span className="text-[10px] text-neutral-400 mt-1">Dark Store</span>
          </div>

          <div className="flex-1 mx-4 h-1 bg-white/10 rounded-full relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
              style={{ width: `${Math.min(100, (order.trackingStep / 4) * 100)}%` }}
            />
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-neutral-400 mt-1">Your Home</span>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-neutral-300 bg-white/10 p-2 rounded-xl text-center border border-white/20">
          Thermal Insulated Cold Box keeps meat at 0°C - 4°C throughout transport.
        </div>
      </div>

      {/* Ordered Items Summary */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-[#0A1F12] text-sm mb-4">Items in this Order</h3>
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <div className="font-bold text-[#0A1F12]">{translateProductName(item.product.id, item.product.name, lang)}</div>
                  <div className="text-[11px] text-neutral-500">{item.selectedWeight.label} × {item.quantity}</div>
                </div>
              </div>
              <div className="font-bold text-emerald-700">₹{item.selectedWeight.price * item.quantity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
