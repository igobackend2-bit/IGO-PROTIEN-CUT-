import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Linkedin, Instagram, Twitter, MessageSquare } from 'lucide-react';

const Footer = () => {
  const BrandLogo = () => (
    <div className="flex items-center gap-4 group">
      <div className="relative w-14 h-14 rounded-full flex items-center justify-center border-[1.5px] border-white/20 transition-transform group-hover:rotate-[360deg] duration-1000">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-display font-extrabold text-xs text-neutral-dark">
          IGO
        </div>
        <div className="absolute -inset-1 border border-igo-gold/30 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="font-display font-bold text-2xl tracking-tight leading-none text-white">
          PROTEIN <span className="text-igo-green">CUTS</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 text-white/40">
          Unit of IGO Group
        </span>
      </div>
    </div>
  );

  const footerLinks = {
    Shop: ['Steaks', 'Poultry', 'Fish', 'Lamb', 'Bulk Ordering'],
    B2B: ['Wholesale API', 'Partner Login', 'White Label', 'Logistics', 'Inquiry Form'],
    Company: ['Our Heritage', 'Certifications', 'Sustainability', 'Farm Network', 'Careers'],
    Support: ['Traceability Help', 'FAQs', 'Contact Us', 'Terms of Service', 'Privacy Policy']
  };

  return (
    <footer className="bg-neutral-dark text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2">
            <div className="mb-8">
              <BrandLogo />
            </div>
            <p className="text-white/40 max-w-sm mb-10 leading-relaxed text-sm">
              Premium farm-to-table protein cuts from IGO Agritech Farms. 
              Pioneering quality and traceability excellence globally since 1994.
            </p>
            <div className="flex gap-4">
              {[Linkedin, Instagram, Twitter, MessageSquare].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-igo-green transition-all border border-white/5"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h4 className="font-display font-bold text-lg mb-8 text-white">{title}</h4>
              <ul className="space-y-4">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-white/40 hover:text-igo-gold text-sm transition-colors font-medium">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap items-center gap-12 text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-igo-gold" />
              +91 9421-IGO-000
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-igo-gold" />
              support@igoatech.com
            </div>
          </div>
          
          <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20">
            © 2026 IGO Agritech Farms. Quality & Traceability CoE.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
