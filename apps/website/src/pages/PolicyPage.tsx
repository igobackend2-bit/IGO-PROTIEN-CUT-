import React, { useEffect } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface PolicyPageProps {
  // Deep-links a specific policy section on the combined /policy page (e.g.
  // /policy?section=shipping). Ignored when `only` is set.
  section?: string;
  // Renders just this one policy as its own standalone page (e.g.
  // /privacy-policy, /terms-conditions) instead of the combined page with
  // all four. Previously every policy — Shipping, Returns, Privacy, Terms —
  // only ever existed as one section on a single shared /policy page; there
  // was no dedicated URL for "just the Privacy Policy" the way most
  // e-commerce sites have, which is what this adds.
  only?: string;
  onNavigate?: (path: string) => void;
}

// Single source of truth for all four policies — used by both the combined
// /policy page (all four, with optional highlight-and-scroll to one) and
// the standalone single-policy pages (/privacy-policy, /terms-conditions,
// /shipping-policy, /refund-policy).
const POLICIES: { id: string; path: string; number: number; title: string; body: string[] }[] = [
  {
    id: 'shipping-policy',
    path: '/shipping-policy',
    number: 1,
    title: 'Cold Chain & Delivery (Shipping) Policy',
    body: [
      'Protein Cuts guarantees 30-90 minute express delivery in insulated cold bags. Freshness is strictly maintained at 0°C to 4°C. If any product is delivered above 8°C, we provide 100% instant refund or replacement.'
    ]
  },
  {
    id: 'return-policy',
    path: '/refund-policy',
    number: 2,
    title: 'Refund & Return Policy',
    body: [
      'Due to food safety standards, raw meat products cannot be physically returned once accepted at doorstep. However, if you inspect any quality or freshness discrepancy upon receipt, notify our customer care team within 2 hours for instant refund to your IGO Wallet.'
    ]
  },
  {
    id: 'privacy-policy',
    path: '/privacy-policy',
    number: 3,
    title: 'Privacy Policy & Data Security',
    body: [
      'Your contact details, delivery addresses, and payment information are encrypted under SSL 256-bit protocol and never shared with third parties outside order fulfillment.'
    ]
  },
  {
    id: 'terms-of-use',
    path: '/terms-conditions',
    number: 4,
    title: 'Terms & Conditions',
    body: [
      'By placing an order on Protein Cuts, you confirm the delivery details provided are accurate and that you (or an authorized adult) will be available to receive the order. Prices, discounts, and product availability are subject to change without prior notice and may vary by delivery pincode.',
      'We reserve the right to cancel or limit any order in cases of suspected fraud, stock unavailability, or delivery-area restrictions — in which case any amount already charged is refunded in full to your original payment method or IGO Wallet.',
      'Continued use of this website constitutes acceptance of these terms. These terms are governed by the laws of India.'
    ]
  }
];

const SECTION_IDS: Record<string, string> = {
  shipping: 'shipping-policy',
  returns: 'return-policy',
  privacy: 'privacy-policy',
  terms: 'terms-of-use'
};

export const PolicyPage: React.FC<PolicyPageProps> = ({ section, only, onNavigate }) => {
  const highlightId = section ? SECTION_IDS[section] : undefined;

  useEffect(() => {
    if (!highlightId || only) return;
    const el = document.getElementById(highlightId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [highlightId, only]);

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

  // Standalone single-policy page (e.g. /privacy-policy).
  if (only) {
    const policy = POLICIES.find((p) => p.id === only);
    if (!policy) return null;
    const others = POLICIES.filter((p) => p.id !== only);

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {onNavigate && (
          <button
            onClick={() => onNavigate('/policy')}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-emerald-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All policies
          </button>
        )}

        <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-4 shadow-sm">
          <h1 className="text-2xl font-black text-[#0A1F12] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> {policy.title}
          </h1>
          <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
            {policy.body.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {onNavigate && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-6">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Related Policies</p>
            <div className="flex flex-wrap gap-2">
              {others.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onNavigate(p.path)}
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full px-3.5 py-1.5 transition cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Combined page — all four policies on one page, with optional
  // highlight-and-scroll to one via ?section=.
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-4 shadow-sm">
        <h1 className="text-2xl font-black text-[#0A1F12] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> IGO Protein Cuts Policies & Terms
        </h1>

        <div className="space-y-6 text-xs text-neutral-600 leading-relaxed">
          {POLICIES.map((policy) => (
            <section key={policy.id} id={policy.id} className={sectionClass(policy.id)}>
              <h2 className="text-sm font-bold uppercase text-emerald-700">
                {policy.number}. {policy.title}
              </h2>
              {policy.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
