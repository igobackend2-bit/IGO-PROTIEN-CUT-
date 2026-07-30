import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-4 shadow-sm">
        <h1 className="text-2xl font-black text-[#08120B] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> IGO Protein Cuts Policies & Terms
        </h1>

        <div className="space-y-6 text-xs text-neutral-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase text-emerald-700">1. Cold Chain & Delivery Policy</h2>
            <p>
              Protein Cuts guarantees 30-minute express delivery in insulated cold bags. Freshness is strictly maintained at 0°C to 4°C. If any product is delivered above 8°C, we provide 100% instant refund or replacement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase text-emerald-700">2. Refund & Return Guarantee</h2>
            <p>
              Due to food safety standards, raw meat products cannot be physically returned once accepted at doorstep. However, if you inspect any quality or freshness discrepancy upon receipt, notify our customer care team within 2 hours for instant refund to your IGO Wallet.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase text-emerald-700">3. Privacy & Data Security</h2>
            <p>
              Your contact details, delivery addresses, and payment information are encrypted under SSL 256-bit protocol and never shared with third parties outside order fulfillment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase text-emerald-700">4. Terms of Use</h2>
            <p>
              By placing an order on Protein Cuts, you confirm the delivery details provided are accurate and that you (or an authorized adult) will be available to receive the order. Prices, discounts, and product availability are subject to change without prior notice and may vary by delivery pincode.
            </p>
            <p>
              We reserve the right to cancel or limit any order in cases of suspected fraud, stock unavailability, or delivery-area restrictions — in which case any amount already charged is refunded in full to your original payment method or IGO Wallet.
            </p>
            <p>
              Continued use of this website constitutes acceptance of these terms. These terms are governed by the laws of India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
