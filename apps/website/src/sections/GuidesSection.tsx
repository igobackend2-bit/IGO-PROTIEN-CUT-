import React, { useState } from 'react';
import { Snowflake, Fish, Flame, BookOpen, X, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../lib/hooks/useSiteContent';

export interface Guide {
  title: string;
  excerpt: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  paragraphs: string[];
}

// Real, genuinely useful short guides (general food-safety and cooking
// knowledge — e.g. USDA's 74°C/165°F safe chicken temperature — not brand
// claims), presented as clickable cards in the TenderCuts "guide article"
// style. Clicking a card opens the full guide in a modal rather than
// linking to a blog that doesn't exist on this site.
export const guides: Guide[] = [
  {
    title: 'How to Store Fresh Cuts at Home',
    excerpt: "Just because it's delivered fresh doesn't mean it stays that way — here's how to store your cuts to lock in freshness.",
    icon: Snowflake,
    image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    paragraphs: [
      "Refrigerate immediately: Move your delivery straight into the fridge (0-4°C) or freezer within 20 minutes of arrival — don't let it sit at room temperature.",
      "Use within 24-48 hours: Fresh, never-frozen cuts taste best used within 1-2 days. If you won't cook it that soon, freeze it.",
      'Freeze it right: Wrap tightly in an airtight bag or container, pressing out excess air, and label with the date. Most cuts stay good frozen for 1-3 months without quality loss.',
      "Thaw safely: Always thaw in the fridge overnight, not on the counter — this keeps bacteria growth in check.",
      "Keep raw and cooked separate: Store raw meat on the lowest fridge shelf so juices can't drip onto other food, and use separate cutting boards."
    ]
  },
  {
    title: 'The Ultimate Dry Fish Buying Guide',
    excerpt: 'Karuvadu (sun-dried fish) is a pantry staple across South India — here\'s what actually separates good dry fish from bad.',
    icon: Fish,
    image: '/Images/Meat Images/Fish/Anchovy.jpg',
    paragraphs: [
      "Look, don't just smell: Good dry fish should look firm and slightly glossy, not chalky or overly dark. A strong, briny smell is normal; a sour or ammonia-like smell means it's turned.",
      'Check the salt: Traditional sun-drying uses salt as a natural preservative — a light white crust is fine, but excessive salt build-up usually means poor drying conditions.',
      'Pick your variety by dish: Anchovies (nethili) and small prawns work well in quick stir-fries and chutneys; larger dried fish like shark or seer strips are better slow-cooked in curries.',
      'Store it right: Keep dry fish in an airtight container in a cool, dry place — refrigerate for longer shelf life, especially in humid weather.',
      'Soak before cooking: A 10-15 minute soak in warm water softens the fish and washes off excess surface salt before you cook.'
    ]
  },
  {
    title: 'Marinated Chicken: Cooking Tips for Perfect Results',
    excerpt: "Marinated and ready to cook doesn't mean foolproof — a few small habits make the difference between rubbery and restaurant-quality.",
    icon: Flame,
    image: '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    paragraphs: [
      "Bring it to room temperature first: Let marinated chicken sit out for 15-20 minutes before cooking so it cooks evenly instead of staying cold in the center.",
      "Don't overcrowd the pan: Cook in batches if needed — overcrowding traps steam and stops the marinade from caramelizing properly.",
      'Match heat to the cut: Boneless pieces cook fast on high heat (great for a char); bone-in pieces need medium heat and longer time so the inside cooks through without burning the outside.',
      'Check doneness properly: Chicken is safely cooked at an internal temperature of 74°C (165°F) — a meat thermometer is more reliable than cutting it open and guessing.',
      'Rest before serving: Let cooked chicken rest for 3-5 minutes off the heat so the juices redistribute instead of running out onto the plate.'
    ]
  }
];

// The admin's `plans.guides` block edits title/excerpt/image/category/
// readTime — it has no notion of an icon or the full step-by-step
// `paragraphs` shown in the modal, since those aren't part of the generic
// content-editor schema (see supabase/migrations/0012_pages_and_seo.sql).
// So the CMS only drives the card grid; the modal's icon/paragraphs are
// looked up locally by id, matching the original `guide-01`/02/03 ids seeded
// alongside it. A guide an admin adds beyond the original three still
// renders — with a generic icon and its excerpt as the modal body.
interface CmsGuideItem {
  id?: string;
  title: string;
  excerpt: string;
  image: string;
  readTime?: string;
  category?: string;
}

const GUIDES_FALLBACK: { eyebrow: string; heading: string; items: CmsGuideItem[] } = {
  eyebrow: 'Kitchen Guides',
  heading: 'Cook It Right',
  items: guides.map((g, i) => ({
    id: `guide-0${i + 1}`,
    title: g.title,
    excerpt: g.excerpt,
    image: g.image
  }))
};

const GUIDE_DETAILS_BY_ID: Record<string, Guide> = Object.fromEntries(
  guides.map((g, i) => [`guide-0${i + 1}`, g])
);

export const GuidesSection: React.FC = () => {
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);

  const block = useSiteContent('plans.guides', GUIDES_FALLBACK);
  const items: CmsGuideItem[] = Array.isArray(block.items) && block.items.length > 0 ? block.items : GUIDES_FALLBACK.items;

  const displayGuides: Guide[] = items.map((item, i) => {
    const detail = (item.id && GUIDE_DETAILS_BY_ID[item.id]) || guides[i];
    return {
      title: item.title,
      excerpt: item.excerpt,
      image: item.image,
      icon: detail?.icon ?? BookOpen,
      paragraphs: detail && detail.title === item.title ? detail.paragraphs : [item.excerpt]
    };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{block.eyebrow}</div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{block.heading}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {displayGuides.map((guide) => {
          const Icon = guide.icon;
          return (
            <button
              key={guide.title}
              onClick={() => setOpenGuide(guide)}
              className="group text-left bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
            >
              <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-700" />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-black text-[#0A1F12] leading-snug line-clamp-2">{guide.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{guide.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:gap-2 transition-all">
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Guide modal */}
      {openGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpenGuide(null)}>
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 bg-neutral-100">
              <img src={openGuide.image} alt={openGuide.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <button
                onClick={() => setOpenGuide(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#0A1F12] cursor-pointer transition"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 sm:p-7 space-y-4">
              <h3 className="text-xl font-black text-[#0A1F12] leading-tight">{openGuide.title}</h3>
              <div className="space-y-3">
                {openGuide.paragraphs.map((para, idx) => (
                  <p key={idx} className="text-sm text-neutral-600 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
