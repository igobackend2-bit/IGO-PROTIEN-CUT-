import React from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowRight
} from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#050D08] border-t border-emerald-900/60 text-neutral-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Links Grid — logo/vision, quick links, contact us */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.6fr] gap-10">
          {/* Col 1: Brand + Vision */}
          <div className="space-y-4">
            <button onClick={() => onNavigate('/')} className="block cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
                <img
                  src="/Images/protein-cuts-logo.jpg"
                  alt="IGO Protein Cuts"
                  className="w-full h-full object-contain"
                />
              </div>
            </button>

            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Vision</h4>
              {/* Same story already told on the About page — condensed, not
                  invented. */}
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                To eradicate chemical preservatives, antibiotics, and stale frozen meat from Indian households — delivering pure, farm-traced protein in 30 minutes, as part of the IGO Groups ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a href="https://instagram.com/igoproteincuts" target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 hover:text-white hover:border-emerald-500 transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/igoproteincuts" target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 hover:text-white hover:border-emerald-500 transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/igoproteincuts" target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 hover:text-white hover:border-emerald-500 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/@igoproteincuts" target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400 hover:text-white hover:border-emerald-500 transition">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 pb-3 border-b border-emerald-900/60">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Shop All Products', path: '/search' },
                { label: 'Subscriptions', path: '/subscriptions' },
                { label: 'Recipes', path: '/recipes' },
                { label: 'Gift Boxes', path: '/gifts' },
                { label: 'B2B / Wholesale', path: '/b2b' },
                { label: 'Support & FAQ', path: '/support' },
                { label: 'Careers', path: '/careers' }
              ].map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className="flex items-center gap-1.5 hover:text-emerald-300 transition cursor-pointer group"
                  >
                    <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Us — real address/phone/email from the Contact
              page, plus a Get in Touch CTA and the same Mission-adjacent
              language used on the About page. */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 pb-3 border-b border-emerald-900/60">Contact Us</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 rounded-full border border-emerald-800 text-emerald-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <span className="pt-1">IGO Groups HQ, 100 Feet Road, Indiranagar, Bengaluru, KA 560038</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 rounded-full border border-emerald-800 text-emerald-400 shrink-0">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </span>
                  <div className="pt-1 space-y-0.5">
                    <a href="tel:1800-446-446" className="block hover:text-emerald-300 transition">1800-446-446 (Toll Free)</a>
                    <a href="https://wa.me/919840000000" target="_blank" rel="noopener noreferrer" className="block hover:text-emerald-300 transition">+91 98400 00000 (WhatsApp)</a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2.5 text-xs">
                  <span className="p-1.5 rounded-full border border-emerald-800 text-emerald-400 shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <a href="mailto:support@igoproteincuts.com" className="pt-1 hover:text-emerald-300 transition">support@igoproteincuts.com</a>
                </div>

                <button
                  onClick={() => onNavigate('/contact')}
                  className="inline-flex items-center gap-1.5 bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-[11px] uppercase tracking-wide transition cursor-pointer"
                >
                  Get in Touch <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div>
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Mission</h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Every cut dressed in temperature-controlled dark stores, checked at 150+ points, and delivered in a sealed cold-chain bag — so trust is never a leap of faith.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span>© {new Date().getFullYear()} IGO Protein Cuts. All rights reserved.</span>
            <span className="hidden sm:inline text-neutral-700">•</span>
            <span className="text-neutral-400">FSSAI Lic: 10022043000918</span>
          </div>
          {/* The "Staff / Admin Login" link was removed from here. /admin is
              still reachable by typing the URL and is gated on an active row in
              admin_users — it just isn't advertised to customers any more. */}
          <div className="flex items-center gap-5 text-neutral-400">
            <button onClick={() => onNavigate('/policy')} className="hover:text-emerald-300 transition cursor-pointer">Privacy Policy</button>
            <button onClick={() => onNavigate('/policy')} className="hover:text-emerald-300 transition cursor-pointer">Terms of Service</button>
            <button onClick={() => onNavigate('/policy')} className="hover:text-emerald-300 transition cursor-pointer">Shipping Info</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
