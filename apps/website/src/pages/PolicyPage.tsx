import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface PolicyPageProps {
  // Deep-links a specific policy section (Footer.tsx passes e.g.
  // /policy?section=shipping). Previously every footer policy link —
  // Terms, Privacy, Shipping, Return — pointed at the exact same /policy
  // URL with no way to tell which one was clicked, so all four always
  // opened the same undifferentiated page from the top.
  section?: string;
}

const SECTION_IDS: Record<string, string> = {
  shipping: 'shipping-policy',
  returns: 'return-policy',
  privacy: 'privacy-policy',
  terms: 'terms-of-use'
};

export const PolicyPage: React.FC<PolicyPageProps> = ({ section }) => {
  const highlightId = section ? SECTION_IDS[section] : undefined;

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(highlightId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [highlightId]);

  // p-4 -m-4 and the border are applied to EVERY section, highlighted or
  // not, so the box always reserves the same layout space — only its
  // background/border color toggles. Previously those were only added when
  // highlighted, so the negative margin made the box visually bigger
  // without reserving that extra space, and it bled into the next
  // section's heading (customers reported the green highlight box
  // overlapping "4. Terms & Conditions").
  const sectionClass = (id: string) =>
    `space-y-2 scroll-mt-24 rounded-2xl transition-colors p-4 -m-4 border ${
      highlightId === id ? 'bg-emerald-50 border-emerald-200' : 'border-transparent'
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-4 shadow-sm">
        <h1 className="text-2xl font-black text-[#0A1F12] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> IGO Protein Cuts Policies & Terms
        </h1>

        <div className="space-y-6 text-xs text-neutral-600 leading-relaxed">
          <section id="shipping-policy" className={sectionClass('shipping-policy')}>
            <h2 className="text-sm font-bold uppercase text-emerald-700">1. Cold Chain & Delivery (Shipping) Policy</h2>
            <p>
              Protein Cuts guarantees 30-90 minute express delivery in insulated cold bags. Freshness is strictly maintained at 0°C to 4°C. If any product is delivered above 8°C, we provide 100% instant refund or replacement.
            </p>
          </section>

          <section id="return-policy" className={sectionClass('return-policy')}>
            <h2 className="text-sm font-bold uppercase text-emerald-700">2. Refund & Return Policy</h2>
            <p>
              Due to food safety standards, raw meat products cannot be physically returned once accepted at doorstep. However, if you inspect any quality or freshness discrepancy upon receipt, notify our customer care team within 2 hours for instant refund to your IGO Wallet.
            </p>
          </section>

          <section id="privacy-policy" className={sectionClass('privacy-policy')}>
            <h2 className="text-sm font-bold uppercase text-emerald-700">3. Privacy Policy & Data Security</h2>
            <p>
              Your contact details, delivery addresses, and payment information are encrypted under SSL 256-bit protocol and never shared with third parties outside order fulfillment.
            </p>
          </section>

          <section id="terms-of-use" className={sectionClass('terms-of-use')}>
            <h2 className="text-sm font-bold uppercase text-emerald-700">4. Terms & Conditions</h2>
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
