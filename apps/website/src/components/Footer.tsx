import React from 'react';
import {
  ShieldCheck,
  Truck,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  Heart,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Layers,
  Sprout,
  Award
} from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#050D08] border-t border-emerald-900/60 text-neutral-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Trust Value Props Band */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-3xl bg-emerald-950/40 border border-emerald-800/50">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">30-Min Cold Chain Delivery</h4>
              <p className="text-[11px] text-neutral-400 mt-1">Temperature controlled at 0-4°C right to your kitchen.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">100% Antibiotic Free</h4>
              <p className="text-[11px] text-neutral-400 mt-1">Zero synthetic hormones, chemical glazes, or preservatives.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Certified Biosecure Farms</h4>
              <p className="text-[11px] text-neutral-400 mt-1">Directly sourced from IGO Fresh Farm partner growers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Fresh Cut On Order</h4>
              <p className="text-[11px] text-neutral-400 mt-1">Custom trimmed by master butchers in clean room dark stores.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F7B3A] to-black p-0.5 shadow-lg shadow-emerald-950">
                <div className="w-full h-full bg-[#08120B] rounded-[10px] flex items-center justify-center font-black text-emerald-400 text-lg">
                  PC
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-white tracking-tight">IGO PROTEIN CUTS</div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">IGO GROUPS ECOSYSTEM</div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              IGO Protein Cuts is India’s flagship farm-to-table protein enterprise specializing in fresh Chicken, Mutton, Seafood, Eggs, Ready-to-Cook specials, and automated fitness subscriptions.
            </p>

            <div className="flex items-center gap-3 pt-2">
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

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-emerald-400">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('/category/chicken')} className="hover:text-emerald-300 transition">Fresh Chicken Cuts</button></li>
              <li><button onClick={() => onNavigate('/category/mutton')} className="hover:text-emerald-300 transition">Goat Mutton & Chops</button></li>
              <li><button onClick={() => onNavigate('/category/fish')} className="hover:text-emerald-300 transition">Sea Fish & Prawns</button></li>
              <li><button onClick={() => onNavigate('/category/dry-fish')} className="hover:text-emerald-300 transition">Sun-Dried Seafood</button></li>
              <li><button onClick={() => onNavigate('/category/eggs')} className="hover:text-emerald-300 transition">Farm Eggs</button></li>
              <li><button onClick={() => onNavigate('/category/ready-to-cook')} className="hover:text-emerald-300 transition">Marinated Ready to Cook</button></li>
              <li><button onClick={() => onNavigate('/category/frozen-food')} className="hover:text-emerald-300 transition">Frozen Food</button></li>
              <li><button onClick={() => onNavigate('/category/biryani')} className="hover:text-emerald-300 transition">Biryani Kits</button></li>
              <li><button onClick={() => onNavigate('/category/cold-cuts')} className="hover:text-emerald-300 transition">Cold Cuts &amp; Deli</button></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-emerald-400">IGO Corporate</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('/about')} className="hover:text-emerald-300 transition">About IGO Groups</button></li>
              <li><button onClick={() => onNavigate('/subscriptions')} className="hover:text-emerald-300 transition">Gym Subscriptions</button></li>
              <li><button onClick={() => onNavigate('/gifts')} className="hover:text-emerald-300 transition">Gift Boxes</button></li>
              <li><button onClick={() => onNavigate('/wishlist')} className="hover:text-emerald-300 transition">My Wishlist</button></li>
              <li><button onClick={() => onNavigate('/franchise')} className="hover:text-emerald-300 transition">Franchise Opportunities</button></li>
              <li><button onClick={() => onNavigate('/b2b')} className="hover:text-emerald-300 transition">B2B / Wholesale Portal</button></li>
              <li><button onClick={() => onNavigate('/careers')} className="hover:text-emerald-300 transition">Careers & Culture</button></li>
              <li><button onClick={() => onNavigate('/contact')} className="hover:text-emerald-300 transition">Contact Support</button></li>
              <li><button onClick={() => onNavigate('/policy')} className="hover:text-emerald-300 transition">Shipping & Delivery Policy</button></li>
              <li><button onClick={() => onNavigate('/policy')} className="hover:text-emerald-300 transition">Terms & Refund Policy</button></li>
              <li><button onClick={() => onNavigate('/policy')} className="hover:text-emerald-300 transition">Privacy Policy</button></li>
            </ul>
          </div>

          {/* Col 4: Contact & App */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-emerald-400">Customer Support</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">1800-446-446 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@igoproteincuts.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>IGO Groups HQ, Indiranagar, Bengaluru, KA 560038</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div>
            © {new Date().getFullYear()} IGO Protein Cuts. All rights reserved. Flagship of IGO Groups Ecosystem.
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>FSSAI Lic: 10022043000918</span>
            <span>•</span>
            <span>ISO 22000 Certified</span>
            <span>•</span>
            <button onClick={() => onNavigate('/admin')} className="hover:text-emerald-400 transition cursor-pointer">
              Staff / Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
