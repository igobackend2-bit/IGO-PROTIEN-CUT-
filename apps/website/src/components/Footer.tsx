import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  Send,
  CheckCircle2
} from 'lucide-react';
import { submitLead } from '../lib/api/catalog';
import { useLang } from '../lib/language';

interface FooterProps {
  onNavigate: (path: string) => void;
}

// Restyled to match the reference layout requested: logo + tagline on the
// left, Customer Care / Account link columns, a Newsletter signup, a Follow
// Us icon row, and a single centered copyright line — replacing the previous
// 3-column Quick Links / Contact Us layout. Real routes only (no invented
// pages); the newsletter signup persists to the same `igo_leads` table the
// B2B/franchise/signup flows already use, tagged `leadType: 'newsletter'`,
// rather than being a fake no-op form.
export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSending(true);
    const result = await submitLead({
      leadType: 'newsletter',
      fullName: 'Newsletter Subscriber',
      email: email.trim(),
      phone: '',
      message: 'Subscribed via website footer newsletter form.'
    });
    setIsSending(false);
    if (result.ok) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  return (
    <footer className="bg-[#0F7B3A] border-t border-emerald-800 text-white/80 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr] gap-10">
          {/* Col 1: Logo + tagline */}
          <div className="space-y-4">
            <button onClick={() => onNavigate('/')} className="block cursor-pointer w-fit">
              {/* No white card here — the footer background is a solid flat
                  color (#0F7B3A), so mix-blend-multiply alone is enough to
                  make the logo's white JPG margin disappear into it, same as
                  putting the mark directly on the page like the reference. */}
              {/* Big logo is desktop/web-view only — kept compact on mobile
                  so it doesn't crowd the stacked single-column footer. */}
              <div className="h-14 sm:h-20 lg:h-28 overflow-hidden flex items-center -ml-2">
                <img
                  src="/Images/protein-cuts-logo.jpg"
                  alt="IGO Protein Cuts"
                  className="h-full w-auto object-contain mix-blend-multiply scale-125 sm:scale-[1.4] lg:scale-150"
                />
              </div>
            </button>
            <p className="text-sm text-white/70">{t('footerTagline')}</p>
          </div>

          {/* Col 2: Customer Care */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{t('customerCare')}</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                // Previously all four policy links pointed at the exact same
                // /policy URL, so they all opened the same undifferentiated
                // page — now each deep-links its own section (see
                // PolicyPage.tsx's `section` prop) and scrolls straight to it.
                { label: t('termsConditions'), path: '/policy?section=terms' },
                { label: t('privacyPolicy'), path: '/policy?section=privacy' },
                { label: t('shippingPolicy'), path: '/policy?section=shipping' },
                { label: t('returnPolicy'), path: '/policy?section=returns' },
                { label: t('contactUs'), path: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className="text-white font-medium hover:text-white/70 hover:underline transition cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Account */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{t('accountHeading')}</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: t('myAccount'), path: '/account' },
                { label: t('cartNav'), path: '/cart' },
                { label: t('wishlist'), path: '/wishlist' },
                { label: t('productNav'), path: '/search' },
                { label: t('blog'), path: '/blog' }
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className="text-white font-medium hover:text-white/70 hover:underline transition cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter + Follow Us */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{t('newsletter')}</h4>
              {subscribed ? (
                <div className="flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-3 rounded-full">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {t('subscribedMsg')}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center bg-white border border-white/20 rounded-full overflow-hidden shadow-sm transition">
                  <input
                    type="email"
                    required
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent px-4 py-2.5 text-sm text-[#0A1F12] placeholder-neutral-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    className="shrink-0 flex items-center gap-1.5 bg-[#0A1F12] hover:bg-[#0B5C2A] text-white font-bold px-5 py-2.5 text-xs uppercase tracking-wide transition cursor-pointer disabled:opacity-60"
                  >
                    {isSending ? '...' : t('subscribe')} <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{t('followUs')}</h4>
              <div className="flex items-center gap-3">
                <a href="https://facebook.com/igoproteincuts" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition">
                  <Facebook className="w-4 h-4" fill="currentColor" />
                </a>
                <a
                  href="https://instagram.com/igoproteincuts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:opacity-90 transition"
                  style={{ background: 'radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar — single centered copyright line, matching the reference */}
        <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-white/70 text-center">
          <span>© {new Date().getFullYear()} {t('copyright')}</span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="text-white/60">{t('fssaiLic')}</span>
        </div>
      </div>
    </footer>
  );
};
