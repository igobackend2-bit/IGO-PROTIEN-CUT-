import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, MessageSquare, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const BrandLogo = () => (
    <Link to="/" className="flex items-center gap-4 group">
      <div className="relative w-16 h-16 overflow-hidden rounded-full border border-white/10 bg-white flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
        <img
          src="/logo.png"
          alt="Protein Cuts Logo"
          className="w-full h-full object-cover scale-110"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-display font-bold text-2xl tracking-tight leading-none text-white">
          PROTEIN <span className="text-igo-green">CUTS</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 text-white/40">
          Unit of IGO Group
        </span>
      </div>
    </Link>
  );

  const footerLinks = {
    Shop: [
      { name: 'Fresh Chicken', href: '/#products' },
      { name: 'Premium Mutton', href: '/#products' },
      { name: 'Sea Fresh Fish', href: '/#products' },
      { name: 'Prawns & Seafood', href: '/#products' },
      { name: 'Heritage Eggs', href: '/#products' },
      { name: 'Exotic Delights', href: '/#products' },
      { name: 'Bulk & B2B', href: '/#b2b' }
    ],
    B2B: [
      { name: 'Wholesale Portal', href: '/#b2b' },
      { name: 'Partner Login', href: '/admin/login', isRoute: true },
      { name: 'White Label', href: '/#b2b' },
      { name: 'Supply Chain', href: '/#b2b' },
      { name: 'Inquiry Form', href: '/#b2b' }
    ],
    Company: [
      { name: 'Our Heritage', href: '/#about' },
      { name: 'Farm Network', href: '/#about' },
      { name: 'Sustainability', href: '/#about' },
      { name: 'Certifications', href: '/#about' },
      { name: 'Careers', href: '/#about' }
    ],
    Support: [
      { name: 'Track Order', href: '/#traceability' },
      { name: 'FAQs', href: '/#about' },
      { name: 'Contact Us', href: '/#about' },
      { name: 'Return Policy', href: '/#about' },
      { name: 'Privacy Policy', href: '/#about' }
    ],
  };

  const certifications = [
    { name: 'FSSAI', desc: 'Food Safety Certified' },
    { name: 'ISO', desc: 'ISO 22000 Quality' },
    { name: 'HACCP', desc: 'Hazard Control Plan' },
    { name: 'Halal', desc: 'Halal Certified' },
  ];

  return (
    <footer className="bg-neutral-dark text-white border-t border-white/5">
      {/* Certifications Bar */}
      <div className="border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {certifications.map((cert) => (
              <div key={cert.name} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-igo-gold/10 border border-igo-gold/20 flex items-center justify-center group-hover:bg-igo-gold/20 transition-colors">
                  <Award className="w-5 h-5 text-igo-gold" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{cert.name}</div>
                  <div className="text-xs text-white/40">{cert.desc}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-igo-green/10 border border-igo-green/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-igo-green" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">100% Safe</div>
                <div className="text-xs text-white/40">Lab Tested Batches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
            <div className="col-span-2">
              <div className="mb-6">
                <BrandLogo />
              </div>
              <p className="text-white/40 max-w-sm mb-8 leading-relaxed text-sm">
                Premium farm-to-table protein cuts from IGO Agritech Farms.
                Pioneering quality and traceability excellence globally since 1994.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, href: 'https://www.facebook.com/igoproteincuts/' },
                  { Icon: Instagram, href: 'https://www.instagram.com/igoproteincuts/' },
                  { Icon: Twitter, href: '#' },
                  { Icon: MessageSquare, href: '#' }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-igo-green transition-all border border-white/5 hover:border-igo-green"
                  >
                    <social.Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="col-span-1">
                <h4 className="font-display font-bold text-base mb-6 text-white">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link: any) => (
                    <li key={link.name}>
                      {link.isRoute ? (
                        <Link to={link.href} className="text-white/40 hover:text-igo-gold text-sm transition-colors font-medium">
                          {link.name}
                        </Link>
                      ) : (
                        <a href={link.href} className="text-white/40 hover:text-igo-gold text-sm transition-colors font-medium">
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* App Download */}
          <div className="bg-white/5 rounded-3xl p-8 mb-10 border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display font-bold text-xl text-white mb-2">📱 Order Faster on Our App</h3>
                <p className="text-white/50 text-sm">Get exclusive app-only deals and real-time order tracking</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button className="bg-white text-neutral-dark px-6 py-3 rounded-2xl font-bold text-sm hover:bg-neutral-100 transition-colors flex items-center gap-2">
                  <span>🍎</span> App Store
                </button>
                <button className="bg-white text-neutral-dark px-6 py-3 rounded-2xl font-bold text-sm hover:bg-neutral-100 transition-colors flex items-center gap-2">
                  <span>🤖</span> Google Play
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-igo-gold" />
                +91 9421-IGO-000
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-igo-gold" />
                support@igoatech.com
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-igo-gold" />
                Coimbatore, Tamil Nadu
              </div>
            </div>

            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20">
              © 2026 IGO Agritech Farms. Quality & Traceability CoE.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
