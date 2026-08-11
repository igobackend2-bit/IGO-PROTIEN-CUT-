import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  CheckCircle2,
  ChefHat,
  Drumstick,
  Beef,
  Fish,
  Sun,
  Egg,
  UtensilsCrossed,
  Gift,
  Package,
  Bike,
  Crown,
  Weight,
  Leaf,
  Award,
  Waves,
  Star,
  Instagram,
  Apple,
  Play,
  Send,
  Clock3,
  Snowflake,
  MapPin,
  XCircle,
  Sandwich,
  ShieldCheck,
  Truck,
  User,
  Building2,
  ShoppingCart,
  Briefcase,
  Tag,
  Dumbbell,
  Users
} from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { INITIAL_SUBSCRIPTION_PLANS, INITIAL_RECIPES } from '../data/mockData';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { TrustSection } from '../sections/TrustSection';
import { ComboBanner } from '../sections/ComboBanner';
import { GuidesSection } from '../sections/GuidesSection';
import { ComboCardsGrid } from '../sections/ComboCardsGrid';
import { PromoTileStrip } from '../sections/PromoTileStrip';
import { TodaysDealsBanner } from '../sections/TodaysDealsBanner';
import { OurFarmsSection } from '../sections/OurFarmsSection';
import { Reveal } from '../components/Reveal';
import { BrandPartnersSection } from '../sections/BrandPartnersSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { useSiteContent, renderToken } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { isPincodeServiceable } from '../lib/serviceability';
import { FadeImage } from '../components/FadeImage';

// Small count-up stat used in the hero — animates from 0 to its target once
// on mount, matching the "0 -> real number" counter pattern.
const AnimatedStat: React.FC<{ target: number; suffix?: string; icon: React.ElementType; label: string }> = ({
  target,
  suffix = '',
  icon: Icon,
  label
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-emerald-600" />
      </div>
      <div>
        <div className="font-black text-lg leading-none text-[#0A1F12]">
          {value.toLocaleString()}{suffix}
        </div>
        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
};

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate: (path: string) => void;
  products: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onAddToCart,
  onNavigate,
  products
}) => {
  const [activeHeroTheme, setActiveHeroTheme] = useState(0);
  const [activeCollection, setActiveCollection] = useState<'premium' | 'organic' | 'farm-fresh' | 'seafood'>('premium');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  // Refs + helper for the arrow-button carousel navigation on the
  // horizontal product strips (Today's Fresh Stock, Top Picks, Chef
  // Recommended) — supplements native touch/drag scrolling with clickable
  // prev/next controls for a more polished, desktop-friendly feel.
  const freshStockScrollRef = useRef<HTMLDivElement>(null);
  const topPicksScrollRef = useRef<HTMLDivElement>(null);
  const subscriptionScrollRef = useRef<HTMLDivElement>(null);
  const flashDealsScrollRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.85;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // Auto-scrolling subscription carousel — advances one card every few
  // seconds and loops back to the start once it reaches the end. Pauses
  // while the user is hovering/touching it so it never fights a manual
  // scroll or drag in progress.
  const [isSubscriptionPaused, setIsSubscriptionPaused] = useState(false);
  useEffect(() => {
    if (isSubscriptionPaused) return;
    const el = subscriptionScrollRef.current;
    if (!el) return;
    const timer = setInterval(() => {
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' });
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [isSubscriptionPaused]);

  // Hero rotates through 3 brand themes — mirrors the "Total Traceability /
  // Heritage Farms / Cold-Chain Integrity" multi-story hero pattern, kept on
  // the site's established green/white/black palette.
  // Editable from /admin → Homepage → Hero. The array below is the fallback:
  // if the content block is missing, unpublished or the backend is unreachable,
  // the hero renders exactly this. See src/lib/hooks/useSiteContent.ts.
  const heroBlock = useSiteContent('home.hero', {
    autoRotateMs: 6000,
    themes: [
      {
        label: 'IGO ECOSYSTEM • FRESH CUT ON ORDER',
        headlineTop: 'PURE FARM FRESH CUTS.',
        headlineAccent: '30-MIN EXPRESS',
        headlineBottom: 'COLD CHAIN.',
        description:
          "Experience India's finest antibiotic-free Chicken, pasture-fed Mutton, wild seafood, and gym protein plans. Hand-trimmed by master butchers, chilled at 0-4°C, and delivered to your kitchen in 30 minutes."
      },
      {
        label: 'TOTAL TRACEABILITY',
        headlineTop: 'SCAN. VERIFY.',
        headlineAccent: 'TRUST EVERY',
        headlineBottom: 'CUT YOU BUY.',
        description:
          'Every pack carries a batch ID you can trace back to the exact farm, cut date, and handler — full farm-to-table transparency, not just a promise.'
      },
      {
        label: 'HERITAGE TAMIL FARMS',
        headlineTop: 'FARM-FRESH PROTEINS,',
        headlineAccent: 'TRACED',
        headlineBottom: 'EVERY STEP.',
        description:
          'Never frozen. Always fresh. Always traced. Same-day delivery from heritage farms with 100% cold-chain integrity, hand-selected from certified partner farms.'
      }
    ]
  });

  const heroThemes = heroBlock.themes;

  useEffect(() => {
    const themeTimer = setInterval(() => {
      setActiveHeroTheme((prev) => (prev + 1) % heroThemes.length);
    }, 6000);
    return () => clearInterval(themeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background/visual-card photos synced to the same 3 rotating hero themes
  // above — each real photo pairs with its matching story (heritage farms,
  // cold-chain facility, traceable packaging).
  // Editable from /admin → Homepage → Hero Images.
  //
  // These used to point at igo-protien-cut.vercel.app — an old, unrelated
  // Vercel project that has since been redeployed with a completely
  // different site, so that URL now 404s and every one of these images broke
  // across the whole site (hero, About page, sign-in modal, Our Farms
  // section). The original photos were recovered from an old deployment of
  // that same project and re-hosted locally under /Images/narrative so
  // nothing here depends on an external host again.
  const heroImagesBlock = useSiteContent('home.hero_images', {
    items: [
      { src: '/Images/narrative/farm.jpg', alt: 'Heritage Tamil Farms', caption: 'High Meadows Farm', sub: 'Certified heritage pastures in the Nilgiris range.' },
      { src: '/Images/narrative/facility.jpg', alt: 'Cold-Chain Integrity', caption: 'IGO Cold-Chain Facility', sub: '0-4°C sterile processing, ISO 22000 certified.' },
      { src: '/Images/narrative/packaging.jpg', alt: 'Total Traceability', caption: 'Batch-Tracked Packaging', sub: 'Insulated cold-chain bags, sealed at the point of pack.' }
    ]
  });

  const heroImages = heroImagesBlock.items;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setPincodeStatus('checking');
    // Real check against the serviceable-pincode list (src/lib/serviceability.ts)
    // instead of always reporting "available" — previously this ignored the
    // entered pincode entirely and just waited 700ms before saying yes.
    setTimeout(() => {
      setPincodeStatus(isPincodeServiceable(pincode) ? 'available' : 'unavailable');
    }, 700);
  };

  // Real thumbnails pulled directly from the live @igoproteincuts Instagram
  // grid (igoproteincuts, 115 followers / 1,488 posts at time of writing) —
  // replaces the earlier placeholder that was just reusing category photos.
  // Editable from /admin → Homepage → Instagram.
  //
  // `fit: 'contain'` on an item renders it uncropped — needed for text or
  // contact-info graphics, where object-cover slices the edges off.
  const instagramBlock = useSiteContent('home.instagram', {
    handle: '@igoproteincuts',
    profileUrl: 'https://www.instagram.com/igoproteincuts/',
    items: [
      { image: '/Images/instagram/post-1-shrimp.png', alt: 'Fresh tiger prawns — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-2-eggs-reel.png', alt: 'Farm-fresh eggs reel — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-3-order.png', alt: 'Order info post — @igoproteincuts Instagram post', fit: 'contain' },
      { image: '/Images/instagram/post-4-eggs.png', alt: 'Farm-fresh eggs — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-5-wings.png', alt: 'Chicken wings — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-6-chocolate.png', alt: 'Kitchen prep reel — @igoproteincuts Instagram post' }
    ]
  });

  const instagramPosts = instagramBlock.items;

  // Editable from /admin → Homepage → Stats.
  // {{productCount}} in a value stays live from the catalog.
  const statsBlock = useSiteContent('home.stats', {
    heading: 'ONE ECOSYSTEM, FROM FARM TO FORK',
    items: [
      { value: '10,000+', label: 'HAPPY CUSTOMERS' },
      { value: '0-4°C', label: 'CONTROLLED DELIVERY' },
      { value: '{{productCount}}+', label: 'FRESH PRODUCTS' }
    ]
  });

  // Ambient backdrop photography for each subscription plan card — reuses
  // real product photography already shot for this site (no stock/Pinterest
  // imagery), picked to match what's actually inside that plan.
  const subscriptionPlanImages: Record<string, string> = {
    'plan-01': '/Images/banners/plan-fitness-banner.jpg',
    'plan-02': '/Images/banners/plan-family-banner.jpg',
    'plan-03': '/Images/banners/plan-elite-banner.jpg',
    'plan-04': '/Images/banners/plan-bbq-banner.jpg'
  };
  const subscriptionPlanIcons: Record<string, React.ElementType> = {
    'plan-01': Dumbbell,
    'plan-02': Users,
    'plan-03': Crown,
    'plan-04': Flame
  };

  // Seasonal spotlight banner slides — turned from one static offer into a
  // rotating carousel (arrow nav + dot pagination, matching the multi-offer
  // promo-banner pattern used across meat-delivery sites). Every slide is a
  // real, already-established fact/offer from elsewhere on this site
  // (Combo Offers "up to 20% off", Subscription "save up to ₹1,200/month",
  // and the "Free delivery above ₹499" promo tile) — nothing invented here.
  // Editable from /admin → Homepage → Promo Slides.
  const promoBlock = useSiteContent('home.promo_slides', {
    autoRotateMs: 4500,
    items: [
    {
      eyebrow: 'Seasonal Pick',
      title: 'Monsoon Special:',
      titleAccent: 'Crispy Wings',
      copy: 'Rainy-day cravings, sorted — fresh-cut chicken wings, hand-trimmed to order and delivered in 30 minutes.',
      badgeLine1: 'Starts From',
      badgeLine2: '₹129',
      cta: 'Order Now',
      path: '/search?q=Wings',
      image: '/Images/banners/promo-wings-banner.jpg',
      alt: 'Monsoon Special crispy chicken wings'
    },
    {
      eyebrow: 'Subscriber Perk',
      title: 'Subscribe &',
      titleAccent: 'Save ₹1,200/Month',
      copy: 'Recurring orders unlock zero delivery fees and priority morning delivery slots — set it once, stay stocked automatically.',
      badgeLine1: 'Save Up To',
      badgeLine2: '₹1,200/mo',
      cta: 'Explore Plans',
      path: '/subscriptions',
      image: '/Images/banners/promo-subscriber-banner.jpg',
      alt: 'IGO subscription — whole chicken'
    },
    {
      eyebrow: 'Free Delivery',
      title: 'On All Orders',
      titleAccent: 'Above ₹499',
      copy: 'No minimum-order stress — cross ₹499 and delivery is free, on every category, every time.',
      badgeLine1: 'Free Above',
      badgeLine2: '₹499',
      cta: 'Start Shopping',
      path: '/search',
      image: '/Images/banners/promo-free-delivery-banner.jpg',
      alt: 'Farm-fresh eggs — free delivery above ₹499'
    }
    ]
  });

  const promoSlides = promoBlock.items;

  // Editable from /admin → Homepage → Ticker strip.
  const tickerBlock = useSiteContent('home.ticker', {
    items: [
      { label: '30-Min Express Delivery' },
      { label: '100% Antibiotic-Free' },
      { label: '0-4°C Cold Chain' },
      { label: 'Free Delivery Above ₹499' }
    ]
  });

  // Rail + section headings — editable from /admin → Homepage.
  const categoriesHeading = useSiteContent('home.section_categories', {
    eyebrow: 'The IGO Farm Network',
    heading: 'Farm to Fork, the IGO Way',
    subheading:
      "From fresh cuts to eggs, marinades, and pantry staples — everything here is sourced straight from IGO's own farms, never through a broker.",
    badge: '30-Minute Express Delivery'
  });

  const topPicksHeading = useSiteContent('home.rail_top_picks', {
    eyebrow: 'MOST POPULAR CUTS',
    heading: 'Top Picks For You',
    viewAllLabel: 'View All',
    viewAllPath: '/search'
  });

  const freshStockHeading = useSiteContent('home.rail_fresh_stock', {
    eyebrow: 'CUT FRESH THIS MORNING',
    heading: "Today's Fresh Stock",
    viewAllLabel: 'View All',
    viewAllPath: '/search'
  });

  const valuePropsBlock = useSiteContent('home.value_props', {
    items: [
      { icon: 'Truck', title: 'Fast Delivery', text: 'Reliable cold-chain delivery in 30-90 minutes.' },
      { icon: 'Award', title: 'Premium Quality', text: 'ISO 22000 & HACCP-certified standard.' },
      { icon: 'Tag', title: 'Best Prices', text: 'Real bulk-order and subscription savings.' },
      { icon: 'Leaf', title: 'Sustainable', text: "Sourced through IGO's own farm network." }
    ]
  });

  const newsletterBlock = useSiteContent('home.newsletter', {
    heading: 'Weekly Offers, Straight to Your Inbox',
    body: 'Subscribe for early access to flash sales, seasonal specials, and new-cut launches.',
    placeholder: 'your@email.com',
    cta: 'Subscribe'
  });

  const chefHeading = useSiteContent('home.rail_chef_picks', {
    eyebrow: 'HAND-PICKED BY OUR BUTCHERS',
    heading: 'Chef Recommended Cuts',
    viewAllLabel: 'View All',
    viewAllPath: '/recipes'
  });

  const [activePromoSlide, setActivePromoSlide] = useState(0);
  const [isPromoPaused, setIsPromoPaused] = useState(false);
  useEffect(() => {
    if (isPromoPaused) return;
    const timer = setInterval(() => {
      setActivePromoSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPromoPaused, promoSlides.length]);

  // Curated down to genuine PRODUCT categories only — Subscriptions, Gift
  // Boxes, Offers & Deals and Recipes are site features/pages (already
  // reachable via Navbar/Footer), not product categories, so they were
  // pulled out of this grid. Also fixed two image mismatches while here:
  // Ready to Cook was pointing at an unverified Unsplash stock photo, and
  // Combo Packs was accidentally showing the Country Chicken product photo.
  // Editable from /admin → Homepage → Categories.
  //
  // Icons are stored as NAMES in the content block (jsonb can't hold a React
  // component) and resolved through src/lib/iconMap.ts. Two counts used to be
  // computed from the live catalog; they're now editable text, with
  // {{marinatedCount}} / {{premiumCount}} available if you want them dynamic.
  const categoriesBlock = useSiteContent('home.categories', {
    items: [
      { title: 'Fresh Chicken', path: '/category/chicken', icon: 'Drumstick', count: '16 Cuts', image: '/Images/chicken-whole.png', badge: 'Bestseller' },
      { title: 'Goat Mutton', path: '/category/mutton', icon: 'Beef', count: '12 Cuts', image: '/Images/Meat Images/Mutton/Mutton curry.jpg' },
      { title: 'Premium Beef', path: '/category/beef', icon: 'Beef', count: '9 Cuts', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'Fish', path: '/category/fish', icon: 'Fish', count: '16 Varieties', image: '/Images/seer-fish.png' },
      { title: 'Sun-Dried Fish', path: '/category/dry-fish', icon: 'Sun', count: 'Karuvadu Picks', image: '/Images/Meat Images/Fish/Anchovy.jpg' },
      { title: 'Farm Eggs', path: '/category/eggs', icon: 'Egg', count: '6 Varieties', image: '/Images/eggs.png' },
      { title: 'Ready to Cook', path: '/category/ready-to-cook', icon: 'UtensilsCrossed', count: '5 Specials', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'Marinated Items', path: '/search?q=Marinated', icon: 'Flame', count: '{{marinatedCount}} Marinated Picks', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'Premium Cuts', path: '/search?q=Premium', icon: 'Award', count: '{{premiumCount}}+ Premium Picks', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'Frozen Food', path: '/category/frozen-food', icon: 'Snowflake', count: '4 Freezer Picks', image: '/Images/Meat Images/Fish/Salmon Fillet.jpg' },
      { title: 'Biryani Kits', path: '/category/biryani', icon: 'ChefHat', count: '3 Kits', image: '/Images/mutton-curry.png', badge: 'NEW' },
      { title: 'Cold Cuts', path: '/category/cold-cuts', icon: 'Sandwich', count: '4 Deli Picks', image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg' },
      { title: 'Combo Packs', path: '/category/combo-packs', icon: 'Gift', count: '20% Off', image: '/Images/chicken-breast.png', badge: 'NEW' }
    ]
  });

  const categoryTokens = {
    productCount: products.length,
    marinatedCount: products.filter((p) => /marinated/i.test(p.name)).length,
    premiumCount: products.filter(
      (p) => /premium/i.test(p.name) || /premium/i.test(p.description)
    ).length
  };

  const categoryCards = categoriesBlock.items.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
    count: renderToken(item.count ?? '', categoryTokens)
  }));

  const bestSellers = products.filter((p) => p.isBestSeller);
  const flashDeals = products.filter((p) => p.isFlashOffer || p.discountPercentage >= 14);

  // Today's Fresh Stock — cut fresh this morning
  const todaysFreshStock = products.filter((p) => p.isTodayFresh).slice(0, 10);

  // Curated Collections — Premium / Organic / Farm Fresh / Seafood
  const collectionTabs: { id: 'premium' | 'organic' | 'farm-fresh' | 'seafood'; label: string; icon: React.ElementType }[] = [
    { id: 'premium', label: 'Premium Collection', icon: Crown },
    { id: 'organic', label: 'Organic Collection', icon: Leaf },
    { id: 'farm-fresh', label: 'Farm Fresh Today', icon: Sun },
    { id: 'seafood', label: 'Seafood Collection', icon: Waves }
  ];
  const collectionsMap: Record<string, Product[]> = {
    premium: products.filter((p) => p.rating >= 4.9 || p.category === 'beef').slice(0, 8),
    organic: products.filter((p) => p.freshnessGrade === 'Organic Farm' || p.freshnessGrade === '100% Antibiotic-Free').slice(0, 8),
    'farm-fresh': products.filter((p) => p.isTodayFresh).slice(0, 8),
    seafood: products.filter((p) => p.category === 'fish' || p.category === 'dry-fish').slice(0, 8)
  };
  const activeCollectionProducts = collectionsMap[activeCollection] || [];

  // Chef Recommended — products with a curated recipe pairing
  const chefRecommended = products.filter((p) => !!p.recipePairing).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubmitted(false), 3500);
  };

  // ---------------------------------------------------------------------
  // Section order below is deliberately alternating: one "About IGO / Trust"
  // section, then one "Product" section, repeated down the page — never a
  // whole batch of IGO content followed by a whole batch of product content.
  // Combo Packs & Offers gets its own dedicated product-type section
  // (separate from the general category/collection grids), per request.
  // ---------------------------------------------------------------------
  return (
    <div className="space-y-16 pb-16">
      {/* ============ 1. HERO BANNER ============ */}
      {/* Hero — full-bleed crossfading farm photography behind a white
          gradient, matching the IGO Protein Cuts flagship hero. */}
      <section className="relative min-h-screen flex items-center pt-8 pb-16 overflow-hidden bg-white border-b border-neutral-200">
        {/* Crossfading Background Photo Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeHeroTheme ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover object-center ${idx === activeHeroTheme ? 'animate-kenburns' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 lg:from-white/98 lg:via-white/80 lg:to-white/10" />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Text Column — `min-w-0` is required here: grid/flex items
              default to `min-width: auto`, which lets an unbreakable-looking
              content width (the big bold headline) force this column wider
              than the viewport instead of wrapping, and the section's own
              `overflow-hidden` then clips it instead of letting it wrap —
              exactly the "text cut off on mobile" symptom. */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 bg-[#0F7B3A]/10 border border-[#0F7B3A]/20 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#0F7B3A] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold text-[#0F7B3A] uppercase tracking-wider">
                  Delivering in 30 mins · Free above ₹499
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  FSSAI Certified · Antibiotic-Free
                </span>
              </div>
            </div>

            <div key={activeHeroTheme} className="animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-8 bg-[#D4AF37]" />
                <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-[0.2em]">
                  {heroThemes[activeHeroTheme].label}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#0A1F12] leading-[1.05] mb-4 tracking-tighter">
                {heroThemes[activeHeroTheme].headlineTop}
                <br />
                <span className="text-[#0F7B3A]">{heroThemes[activeHeroTheme].headlineAccent}</span>{' '}
                {heroThemes[activeHeroTheme].headlineBottom}
              </h1>

              <p className="text-neutral-600 text-sm sm:text-base max-w-lg mb-5 leading-relaxed font-medium">
                {heroThemes[activeHeroTheme].description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="w-4 h-4 fill-[#0F7B3A] text-[#0F7B3A]" />
                ))}
              </div>
              <span className="font-bold text-[#0A1F12] text-sm">4.9</span>
              <span className="text-neutral-400 text-xs">from 12,000+ verified reviews</span>
            </div>

            {/* Pincode Checker */}
            <form onSubmit={handleCheckPincode} className="mb-6">
              <div className="flex gap-2 max-w-xs">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      setPincodeStatus('idle');
                    }}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-neutral-200 rounded-xl text-sm font-medium focus:border-[#0F7B3A] focus:outline-none transition-colors bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!pincode.trim()}
                  className="px-4 py-2.5 bg-[#0F7B3A] text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {pincodeStatus === 'checking' ? 'Checking…' : 'Check'}
                </button>
              </div>
              {pincodeStatus === 'available' && (
                <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Great news — we deliver to {pincode}!
                </p>
              )}
              {pincodeStatus === 'unavailable' && (
                <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Sorry, we don't deliver to {pincode} yet. We currently serve Bengaluru only.
                </p>
              )}
            </form>

            {/* Live Stat Counters */}
            <div className="grid grid-cols-3 gap-4 mb-7 max-w-md">
              <AnimatedStat target={10000} suffix="+" icon={Sparkles} label="Happy Customers" />
              <AnimatedStat target={products.length} suffix="+" icon={Package} label="Fresh Cuts Available" />
              <AnimatedStat target={100} suffix="%" icon={ShieldCheck} label="Cold Chain" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/search')}
                className="group bg-[#0F7B3A] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 text-sm cursor-pointer"
              >
                Shop Fresh Now <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('/b2b')}
                className="bg-white/80 backdrop-blur-sm text-[#0A1F12] border-2 border-neutral-200 px-6 py-3.5 rounded-2xl font-bold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all active:scale-95 text-sm cursor-pointer"
              >
                B2B Bulk Orders
              </button>
            </div>

            {/* Highlight Icons */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-xs font-semibold text-neutral-500">
              {[
                { icon: Clock3, label: 'Fresh Daily' },
                { icon: CheckCircle2, label: 'Halal Certified' },
                { icon: Package, label: 'Hygienically Packed' },
                { icon: Truck, label: 'Fast Delivery' }
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right Visual Card — desktop only, rotates with the same 3 photos */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[520px]">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-4/3">
                {heroImages.map((img, idx) => (
                  <div
                    key={img.src}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === activeHeroTheme ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <FadeImage src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{img.alt}</span>
                      <p className="text-white font-black text-lg mt-0.5 leading-tight">{img.caption}</p>
                    </div>
                  </div>
                ))}

                {/* Prev/Next arrows — previously only the dot indicators
                    below could change the photo; there was no explicit
                    forward/back control. */}
                <button
                  onClick={() => setActiveHeroTheme((activeHeroTheme - 1 + heroImages.length) % heroImages.length)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-[#0A1F12] shadow-md transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveHeroTheme((activeHeroTheme + 1) % heroImages.length)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-[#0A1F12] shadow-md transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Origin Badge — previously placed *inside* the
                  overflow-hidden image card above with a negative offset
                  meant to make it "float" outside the card's corner. The
                  overflow-hidden on the parent clipped it instead, cutting
                  the badge off and running it into the caption text
                  underneath on narrower widths. Moving it here, as a sibling
                  of the image card rather than a child, keeps the same
                  floating-corner look without being clipped. */}
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 max-w-[200px] z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-[#0F7B3A]/10 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-[#0F7B3A]" />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-neutral-400">Verified Origin</span>
                </div>
                <p className="text-xs font-bold text-[#0A1F12] leading-tight">{heroImages[activeHeroTheme].caption}</p>
                <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{heroImages[activeHeroTheme].sub}</p>
              </div>

              {/* Delivery Time Badge — same fix as Verified Origin above. */}
              <div className="absolute -bottom-4 -left-4 bg-[#0F7B3A] text-white px-4 py-3 rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center gap-2.5 z-10">
                <Truck className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Delivery Time</p>
                  <p className="font-black text-sm">30 Minutes</p>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex gap-1.5">
                {heroImages.map((img, idx) => (
                  <button
                    key={img.src}
                    onClick={() => setActiveHeroTheme(idx)}
                    aria-label={`Show ${img.alt}`}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === activeHeroTheme ? 'w-6 bg-[#0F7B3A]' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ 2. CATEGORIES ============ */}
      {/* Categories grid, directly below the hero */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{categoriesHeading.eyebrow}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{categoriesHeading.heading}</h2>
            <p className="text-xs text-neutral-500 mt-1">{categoriesHeading.subheading}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-full shrink-0">
              <Bike className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">{categoriesHeading.badge}</span>
            </div>
            <button
              onClick={() => onNavigate('/category/chicken')}
              className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-8">
          {categoryCards.map((cat) => (
            <button
              key={cat.title}
              onClick={() => onNavigate(cat.path)}
              className="group flex flex-col items-center gap-2.5 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-neutral-100 border-2 border-white ring-1 ring-neutral-200 group-hover:ring-emerald-400 shadow-sm group-hover:shadow-md transition duration-300">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                {cat.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm border border-white ${
                      cat.badge === 'NEW'
                        ? 'bg-[#0F7B3A] text-white'
                        : cat.badge === 'HOT'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-emerald-700'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0A1F12] group-hover:text-emerald-600 transition text-center line-clamp-1">
                {cat.title}
              </h3>
            </button>
          ))}
        </div>
      </section>
      </Reveal>
      {/* ============ 3. WHY CHOOSE US ============ */}
      {/* "Why IGO?" banner — stat badges and the four value pillars unified
          into one green section, all in the same round-badge visual
          language, instead of a separate dark card grid underneath. Stats
          and claims are the same ones we already stand behind elsewhere on
          the site — no invented claims. */}
      <Reveal>
      <section className="bg-[#0F7B3A] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-10">
          <div>
            <h2 className="text-white font-black text-2xl sm:text-3xl tracking-tight leading-none">Why IGO?</h2>
            <p className="text-white/70 text-xs font-bold mt-2 uppercase tracking-widest">{statsBlock.heading}</p>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {statsBlock.items.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-white/25 flex flex-col items-center justify-center text-center shadow-md shrink-0">
                  <span className="text-[#0A1F12] font-black text-sm sm:text-base leading-none">
                    {renderToken(badge.value, { productCount: products.length })}
                  </span>
                </div>
                <span className="text-white/85 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-tight text-center w-20 sm:w-24">{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="w-16 h-px bg-white/25" />

          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-8 sm:gap-x-10">
            {valuePropsBlock.items
              .map((item, idx) => ({
                icon: resolveIcon(item.icon),
                title: item.title,
                body: item.text,
                // The first card carries the gold ring on the live page.
                highlight: idx === 0
              }))
              .map((pillar) => (
              <div key={pillar.title} className="flex flex-col items-center gap-2.5 w-32 sm:w-36 shrink-0">
                <div
                  className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md shrink-0 ${
                    pillar.highlight ? 'ring-4 ring-[#D4AF37]' : 'ring-4 ring-white/25'
                  }`}
                >
                  <pillar.icon className={pillar.highlight ? 'w-6 h-6 text-[#D4AF37]' : 'w-6 h-6 text-[#0F7B3A]'} />
                </div>
                <h3 className="text-white font-black text-xs uppercase tracking-wider text-center leading-tight">{pillar.title}</h3>
                <p className="text-white/70 text-[11px] leading-snug text-center">{pillar.body}</p>
              </div>
              ))}
          </div>
        </div>
      </section>
      </Reveal>
      {/* IGO #2 — Why Choose IGO (comparison table, trust pillars,
          certifications, live batch trace tool — all in one section). */}
      {/* ============ 4. BEST SELLERS ============ */}
      {/* Top Picks For You */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <Flame className="w-4 h-4 fill-emerald-600" /> {topPicksHeading.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{topPicksHeading.heading}</h2>
          </div>
          <button
            onClick={() => onNavigate(topPicksHeading.viewAllPath || '/search')}
            className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            {topPicksHeading.viewAllLabel} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative group/carousel">
          <div ref={topPicksScrollRef} className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 scroll-smooth">
            {bestSellers.map((product) => {
              const weight = product.weightOptions[0];
              // Previously this rail's "Add" button skipped the stock check
              // that ProductCard.tsx/BrowseProductCard.tsx already enforce,
              // so a Sold Out product could still be added from here.
              const isOutOfStock = product.stockStatus === 'Out of Stock';
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group/card relative shrink-0 w-40 sm:w-48 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                    <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className={`w-full h-full object-cover group-hover/card:scale-110 transition duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} />
                    {isOutOfStock ? (
                      <span className="absolute top-2 left-2 bg-[#0A1F12] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    ) : product.discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-[#0F7B3A] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                    {/* Quick Shop hover overlay — desktop only */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition items-end justify-center opacity-0 group-hover/card:opacity-100 pb-3">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="bg-white text-[#0A1F12] text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg translate-y-2 group-hover/card:translate-y-0 transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> QUICK VIEW
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#0A1F12] line-clamp-2 leading-snug">{product.name}</h3>
                      <p className="text-[10px] text-neutral-500 mt-1">{weight?.pieces || product.subcategory}</p>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-0.5">
                        <Weight className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{weight?.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 gap-1">
                      <div className="min-w-0">
                        <span className="text-sm font-black text-[#0A1F12]">₹{weight?.price ?? product.basePrice}</span>
                        {weight && weight.originalPrice > weight.price && (
                          <span className="text-[10px] text-neutral-400 line-through ml-1">₹{weight.originalPrice}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isOutOfStock) return;
                          onAddToCart(product, weight, 1);
                        }}
                        disabled={isOutOfStock}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition shrink-0 ${
                          isOutOfStock
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white cursor-pointer'
                        }`}
                      >
                        {isOutOfStock ? 'Sold Out' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrow navigation — desktop only, fades in on hover of the carousel */}
          <button
            onClick={() => scrollByAmount(topPicksScrollRef, 'left')}
            aria-label="Scroll left"
            className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByAmount(topPicksScrollRef, 'right')}
            aria-label="Scroll right"
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
      </Reveal>
      <Reveal><TrustSection /></Reveal>
      {/* ============ 5. TODAY'S FRESH STOCK ============ */}
      {/* Sits directly below the certifications strip inside TrustSection, per request */}
      {todaysFreshStock.length > 0 && (
        <Reveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <Clock3 className="w-3.5 h-3.5" /> CUT THIS MORNING
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{freshStockHeading.heading}</h2>
            </div>
            <button
              onClick={() => onNavigate('/search')}
              className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative group/carousel">
            <div ref={freshStockScrollRef} className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 scroll-smooth">
              {todaysFreshStock.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group/card relative shrink-0 w-36 sm:w-40 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                >
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                    <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-white/95 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> FRESH TODAY
                    </span>
                    {/* Quick Shop hover overlay — desktop only */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition items-end justify-center opacity-0 group-hover/card:opacity-100 pb-3">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="bg-white text-[#0A1F12] text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg translate-y-2 group-hover/card:translate-y-0 transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> QUICK VIEW
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-[11px] font-bold text-[#0A1F12] line-clamp-2 leading-snug">{product.name}</h3>
                    <div className="text-xs font-black text-emerald-700 mt-1">₹{product.basePrice}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Arrow navigation — desktop only, fades in on hover of the carousel */}
            <button
              onClick={() => scrollByAmount(freshStockScrollRef, 'left')}
              aria-label="Scroll left"
              className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollByAmount(freshStockScrollRef, 'right')}
              aria-label="Scroll right"
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
        </Reveal>
      )}
      {/* Featured combo carousel — pulled up next to Best Sellers per request;
          the rest of the Combo Offers section (grid + flash deals) still
          lives further down under its own "7. COMBO OFFERS" heading. */}
      <Reveal><ComboBanner products={products} onSelectProduct={onSelectProduct} /></Reveal>
      {/* IGO #6 — Farm & Supply Partners (sourcing trust network) */}
      <Reveal><BrandPartnersSection /></Reveal>
      {/* IGO #3 — B2C vs B2B banner (how IGO serves home cooks vs businesses),
          styled as photo-backed premium banner cards. */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Cooks & Families */}
          <div className="group relative overflow-hidden rounded-3xl min-h-[420px] flex flex-col justify-between p-8 sm:p-9 shadow-xl shadow-emerald-950/20">
            <img
              src="/Images/banners/b2c-delivery-banner.jpg"
              alt="Fresh packed cuts delivered to your kitchen"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover animate-kenburns group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F7B3A]/92 via-[#0F7B3A]/55 to-[#0F7B3A]/20" />

            <div className="relative z-10 space-y-5">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">For Home Cooks &amp; Families</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 leading-tight">Everyday Fresh, Delivered.</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-emerald-50">
                {['Same-day 30-min express delivery', 'Money-back freshness guarantee', 'Subscribe & Save early access'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-white/90 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onNavigate('/category/chicken')}
              className="relative z-10 mt-6 w-fit bg-white hover:bg-emerald-50 text-[#0F7B3A] font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
            >
              Shop Fresh Now <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {/* Restaurants & Businesses */}
          <div className="group relative overflow-hidden rounded-3xl min-h-[420px] flex flex-col justify-between p-8 sm:p-9 shadow-xl shadow-black/30">
            <img
              src="/Images/banners/b2b-facility-banner.jpg"
              alt="IGO cold-chain processing facility for bulk supply"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover animate-kenburns group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12]/94 via-[#0A1F12]/65 to-[#0A1F12]/25" />

            <div className="relative z-10 space-y-5">
              <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">For Restaurants &amp; Businesses</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 leading-tight">Bulk Supply, Simplified.</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-neutral-300">
                {['Wholesale pricing & tiered discounts', 'Custom labeling & GST invoicing', 'Dedicated delivery slots for kitchens'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onNavigate('/b2b')}
              className="relative z-10 mt-6 w-fit bg-[#D4AF37] hover:bg-[#c4a12e] text-[#0A1F12] font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
            >
              Request Wholesale Quote <Briefcase className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
      </Reveal>
      {/* (Supplementary) Curated Collections — not in the spec's numbered
          list, kept as a bonus product showcase; moved to sit right after
          Farm & Supply Partners / B2C-B2B per request. */}
      {/* Our Collections */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Curated For You</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">Our Collections</h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {collectionTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCollection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCollection(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F7B3A] border-emerald-500 text-white shadow'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400 hover:text-[#0A1F12]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeCollectionProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-xs text-neutral-500">
            No items in this collection yet — check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {activeCollectionProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                  <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  {product.discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 bg-[#0F7B3A] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="text-xs font-bold text-[#0A1F12] line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> {product.rating} ({product.reviewCount})
                  </div>
                  <div className="text-sm font-black text-emerald-700">₹{product.basePrice}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </Reveal>
      {/* ============ 6. TODAY'S DEALS ============ */}
      <Reveal><TodaysDealsBanner products={products} onNavigate={onNavigate} /></Reveal>
      {/* Colored promo tile strip — free delivery, newly added category,
          real top bestseller, and Subscribe & Save, each linking to a real
          route. */}
      <Reveal><PromoTileStrip products={products} onNavigate={onNavigate} /></Reveal>
      {/* How It Works — moved up next to Today's Deals so first-time
          visitors see "how ordering works" earlier in the scroll, right
          alongside the deals that would prompt them to actually order. */}
      <Reveal><HowItWorksSection /></Reveal>
      {/* PRODUCT #7 — Seasonal spotlight banner: full-bleed photo carousel
          (dark scrim, bold overlaid headline, angled price-tag badge,
          Order Now CTA, arrow nav + dot pagination) — rebuilt to match the
          full-width banner-carousel style used across meat-delivery sites,
          crossfading between slides instead of an instant cut. Every slide
          is still a real, already-established IGO offer (Monsoon Wings /
          Subscription Savings / Free Delivery); no third-party photos, copy,
          or branding — this is IGO's own photography and pricing throughout.
          The "Combo Savings" slide that used to live here was removed — it
          duplicated the dedicated Bundle & Save banner section above
          word-for-word, so the same offer was appearing twice on the page. */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative bg-[#0A1F12] rounded-3xl overflow-hidden shadow-xl shadow-black/20"
          onMouseEnter={() => setIsPromoPaused(true)}
          onMouseLeave={() => setIsPromoPaused(false)}
        >
          {/* Scrolling ticker — editable from /admin → Homepage → Ticker strip.
              Duplicated twice so the marquee loops seamlessly. */}
          <div className="relative z-20 bg-[#0A1F12] border-b border-white/10 overflow-hidden py-1.5">
            <div className="flex w-max whitespace-nowrap animate-marquee">
              {[0, 1].map((dupIdx) => (
                <div key={dupIdx} className="flex items-center shrink-0">
                  {tickerBlock.items.map((item, idx) => (
                    <span key={idx} className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-6 flex items-center gap-6 shrink-0">
                      {item.label} <span className="text-white/30">•</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[340px] sm:min-h-[400px]">
            {promoSlides.map((slide, idx) => (
              <div
                key={slide.eyebrow}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${idx === activePromoSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover ${idx === activePromoSlide ? 'animate-kenburns' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F12]/95 via-[#0A1F12]/75 to-[#0A1F12]/15" />

                <div className="relative z-10 h-full flex flex-col justify-center gap-3 p-8 py-12 sm:pl-16 sm:pr-12 max-w-xl">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{slide.eyebrow}</span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight">
                    {slide.title} <span className="text-[#D4AF37]">{slide.titleAccent}</span>
                  </h2>
                  <p className="text-white/75 text-sm sm:text-base font-medium max-w-sm">{slide.copy}</p>
                  <button
                    onClick={() => onNavigate(slide.path)}
                    className="w-fit bg-white hover:bg-emerald-50 text-[#0A1F12] font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer mt-3 shadow-lg flex items-center gap-2"
                  >
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Angled price/offer tag — same visual language as the Combo Banner */}
                <div className="hidden sm:block absolute top-8 right-10 z-10 bg-[#E0632B] text-white font-black px-4 py-2.5 rounded-lg shadow-lg rotate-3">
                  <span className="block text-[9px] uppercase tracking-widest font-bold opacity-90">{slide.badgeLine1}</span>
                  <span className="text-xl leading-tight">{slide.badgeLine2}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Arrow navigation */}
          <button
            onClick={() => setActivePromoSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
            aria-label="Previous offer"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white transition cursor-pointer z-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActivePromoSlide((prev) => (prev + 1) % promoSlides.length)}
            aria-label="Next offer"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white transition cursor-pointer z-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot pagination */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {promoSlides.map((slide, idx) => (
              <button
                key={slide.eyebrow}
                onClick={() => setActivePromoSlide(idx)}
                aria-label={`Go to offer ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === activePromoSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
      </Reveal>
      {/* ============ 7. SUBSCRIPTION ============ */}
      {/* Subscription Plans (an IGO service/offering) — horizontally
          scrollable so a 4th/5th plan never orphans onto its own row the
          way a fixed 3-column grid did. Deep-forest-green background
          (instead of flat near-black) to read as its own distinct section
          rather than a repeat of the charcoal "Why IGO" pillar grid. */}
      <Reveal>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1F12] to-[#0A1F12] py-16">
        {/* Ambient texture — same subtle dot-grid used on the Freshness
            Promise section elsewhere in this codebase, swapped in after the
            colored glow blobs (emerald/gold blur circles) read as an odd
            color patch rather than depth. Neutral and much more subtle. */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AUTOMATED GYM & FAMILY SUPPLIES</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Protein Cuts Subscriptions</h2>
            <p className="text-xs text-neutral-300">Save up to ₹1,200/month with zero delivery fees and priority morning slots.</p>
          </div>

          <div
            className="relative group/carousel"
            onMouseEnter={() => setIsSubscriptionPaused(true)}
            onMouseLeave={() => setIsSubscriptionPaused(false)}
            onTouchStart={() => setIsSubscriptionPaused(true)}
            onTouchEnd={() => setIsSubscriptionPaused(false)}
          >
            <div
              ref={subscriptionScrollRef}
              className="flex items-stretch gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
            >
              {INITIAL_SUBSCRIPTION_PLANS.map((plan) => {
                const PlanIcon = subscriptionPlanIcons[plan.id] || Package;
                return (
                <div
                  key={plan.id}
                  className="group snap-start shrink-0 w-72 sm:w-80 bg-[#0A1F12] border border-white/10 hover:border-emerald-500/70 rounded-3xl flex flex-col overflow-hidden relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-950/50"
                >
                  {/* Photo header band — real IGO photography, fully visible
                      (previous version buried it at 14% opacity behind a near
                      opaque scrim, which read as "no image" — now it's the
                      clear top visual with the content panel solid below it). */}
                  <div className="relative h-44 w-full overflow-hidden shrink-0">
                    <img
                      src={subscriptionPlanImages[plan.id]}
                      alt={plan.title}
                      className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Single soft bottom-only fade so the photo reads clearly
                        instead of being darkened top and bottom at once —
                        just enough to blend into the panel below. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12] via-[#0A1F12]/5 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent h-1/3" />

                    <div className="absolute top-3.5 left-3.5 w-9 h-9 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center">
                      <PlanIcon className="w-4.5 h-4.5 text-white" />
                    </div>
                    {plan.badge && (
                      <span className="absolute top-3.5 right-3.5 bg-[#0F7B3A] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-between grow p-6 pt-5 space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-snug">{plan.title}</h3>
                      <p className="text-xs text-neutral-400 mt-1">{plan.tagline}</p>

                      <div className="my-4 pt-4 border-t border-white/10">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-2xl font-black text-white">₹{plan.pricePerMonth}</span>
                          {plan.originalPrice > plan.pricePerMonth && (
                            <span className="text-xs text-neutral-500 line-through">₹{plan.originalPrice}</span>
                          )}
                          <span className="text-xs text-neutral-500 font-normal">/ month</span>
                        </div>
                        <div className="text-xs text-emerald-400 font-bold mt-0.5">{plan.savings}</div>
                      </div>

                      <ul className="space-y-2 text-xs text-neutral-300">
                        {plan.itemsIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => onNavigate('/subscriptions')}
                      className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/30"
                    >
                      Activate Subscription <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Edge fades — signal there's more to scroll instead of an abrupt card cut */}
            <div className="hidden sm:block absolute top-0 bottom-2 left-0 w-10 bg-gradient-to-r from-[#0A1F12] to-transparent pointer-events-none" />
            <div className="hidden sm:block absolute top-0 bottom-2 right-0 w-16 bg-gradient-to-l from-[#0A1F12] to-transparent pointer-events-none" />

            {/* Arrow navigation — desktop only, fades in on hover of the carousel */}
            <button
              onClick={() => scrollByAmount(subscriptionScrollRef, 'left')}
              aria-label="Scroll left"
              className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollByAmount(subscriptionScrollRef, 'right')}
              aria-label="Scroll right"
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
      </Reveal>
      {/* ============ 8. CHEF RECOMMENDED CUTS ============ */}
      {/* Moved directly below the IGO Advantage Elite banner per request */}
      {chefRecommended.length > 0 && (
        <Reveal>
        <section className="bg-emerald-50/60 border-y border-emerald-100 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {chefHeading.eyebrow}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{chefHeading.heading}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {chefRecommended.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
                >
                  <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                    <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <span className="absolute top-2 left-2 bg-[#0A1F12] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <ChefHat className="w-3 h-3" /> Chef's Pick
                    </span>
                  </div>
                  <div className="p-3 space-y-1 flex-1">
                    <h3 className="text-xs font-bold text-[#0A1F12] line-clamp-1">{product.name}</h3>
                    <p className="text-[10px] text-neutral-500 line-clamp-1">Best for: {product.recipePairing}</p>
                    <div className="text-sm font-black text-emerald-700 pt-1">₹{product.basePrice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </Reveal>
      )}
      {/* ============ 9. COMBO OFFERS ============ */}
      {/* Combo Packs & Offers, its own dedicated section
          (separate from the general category/collection grids above). */}
      <Reveal><ComboCardsGrid products={products} onSelectProduct={onSelectProduct} /></Reveal>

      {/* ============ 10. SIGNATURE MEAT RECIPES ============ */}
      {/* Moved directly below the Combo Offers grid per request */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <ChefHat className="w-4 h-4" /> CHEF INSPIRATIONS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">Signature Meat Recipes</h2>
          </div>
          <button
            onClick={() => onNavigate('/recipes')}
            className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer"
          >
            Explore All Recipes <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_RECIPES.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onNavigate('/recipes')}
              className="relative aspect-4/5 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={rec.image}
                alt={rec.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3 bg-[#0F7B3A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {rec.difficulty}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5">
                <h3 className="font-black text-white text-base leading-tight group-hover:text-emerald-300 transition">{rec.title}</h3>
                <div className="flex items-center gap-3 text-[11px] text-white/80 font-semibold">
                  <span>Prep: {rec.prepTime}</span>
                  <span>Protein: <strong className="text-emerald-400">{rec.protein}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </Reveal>

      {flashDeals.length > 0 && (
        <Reveal>
        <section className="bg-[#0F7B3A] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 shrink-0 md:w-72">
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-white font-black animate-pulse shrink-0">
                  <Flame className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider leading-tight">Today's Flash Meat Deals</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">Limited quantity morning fresh cuts with instant extra discount</p>
                </div>
              </div>

              <div className="relative group/flash flex-1 min-w-0">
                <div
                  ref={flashDealsScrollRef}
                  className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
                >
                  {flashDeals.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="bg-white/95 border border-white hover:border-black/20 p-2.5 rounded-xl flex items-center gap-3 shrink-0 snap-start cursor-pointer transition shadow-sm"
                    >
                      <img src={prod.image} alt={prod.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-[#0A1F12] line-clamp-1">{prod.name}</div>
                        <div className="text-xs text-emerald-700 font-black">₹{prod.basePrice} <span className="text-[10px] text-neutral-400 line-through">₹{prod.originalPrice}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edge fade + arrow nav — same scroll affordance used on the
                    other horizontal strips, so the last tile signals "more to
                    scroll" instead of just clipping at the container edge. */}
                <div className="hidden sm:block absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-[#0F7B3A] to-transparent pointer-events-none" />
                <button
                  onClick={() => scrollByAmount(flashDealsScrollRef, 'right')}
                  aria-label="Scroll deals right"
                  className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-white shadow-md items-center justify-center text-[#0F7B3A] opacity-0 group-hover/flash:opacity-100 transition cursor-pointer z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollByAmount(flashDealsScrollRef, 'left')}
                  aria-label="Scroll deals left"
                  className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-white shadow-md items-center justify-center text-[#0F7B3A] opacity-0 group-hover/flash:opacity-100 transition cursor-pointer z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-white">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-bold">Bundle &amp; save more with our curated Combo Packs — up to 20% off.</span>
              </div>
              <button
                onClick={() => onNavigate('/category/combo-packs')}
                className="bg-white hover:bg-emerald-50 text-[#0F7B3A] font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2"
              >
                Shop Combo Packs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
        </Reveal>
      )}
      {/* ============ 11. CUSTOMER REVIEWS ============ */}
      {/* Kitchen Guides — swapped with Testimonials per request */}
      <Reveal><GuidesSection /></Reveal>
      {/* ============ 12. DOWNLOAD APP ============ */}
      {/* Scan to Shop — full-width banner (photo / bold copy / QR / store
          badges), styled after the premium "Scan Me" app banners on other
          meat-delivery sites. The QR honestly opens our own live site —
          reordering/tracking are real features already on the site, so the
          copy stays accurate rather than promising a separate native app. */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A1F12] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-[0.9fr_1.3fr_0.8fr] items-stretch relative">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Real product photo */}
          <div className="relative overflow-hidden aspect-4/3 lg:aspect-auto bg-neutral-900 min-h-[220px]">
            <img
              src="/Images/Meat Images/Chicken/Chicken Drumsticks.jpg"
              alt="Fresh chicken drumsticks"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A1F12]/60 lg:to-[#0A1F12]" />
          </div>

          {/* Bold stacked copy — punchier multi-line treatment (matches the
              reference banner's energy) while staying honest: the app is
              real but not yet live on the stores, so this says "coming
              soon" instead of "download now". */}
          <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-center gap-2.5">
            <span className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.25em]">Scan Me</span>
            <h2 className="text-white text-2xl sm:text-3xl font-black leading-[1.05] uppercase tracking-tight">
              Shop Faster<br />on Your Phone
            </h2>
            <p className="text-[#D4AF37] font-black text-sm sm:text-base uppercase tracking-wide flex items-center gap-1.5">
              <Clock3 className="w-4 h-4 shrink-0" /> Our New App — Coming Soon
            </p>
            <p className="text-neutral-300 text-sm max-w-sm">
              Reorder in seconds and track your delivery live — right from your phone's browser, no install required.
            </p>
            <div className="mt-1 inline-flex items-center gap-2 bg-[#0F7B3A]/15 border border-[#0F7B3A]/30 px-3.5 py-1.5 rounded-full w-fit">
              <span className="text-emerald-400 font-black text-xs">FIRSTCUT</span>
              <span className="text-neutral-300 text-xs">— Flat ₹75 off your first order</span>
            </div>
          </div>

          {/* QR + store badges */}
          <div className="relative z-10 p-8 flex flex-row lg:flex-col items-center justify-center gap-4 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&bgcolor=ffffff&color=08120B&data=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.origin : 'https://igoproteincuts.com'
                )}`}
                alt="Scan to open IGO Protein Cuts on your phone"
                className="w-24 h-24 sm:w-28 sm:h-28 block"
              />
              <p className="text-[9px] font-black text-[#0A1F12] text-center mt-1 uppercase tracking-wider">Scan Me</p>
            </div>
            <div className="flex flex-col gap-2">
              {/* Greyed-out, clearly-labeled "coming soon" state — not
                  functional buttons, since the app isn't published to
                  either store yet. Avoids implying it's downloadable now. */}
              <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-3.5 py-2 rounded-xl overflow-hidden">
                <Apple className="w-4 h-4 shrink-0" />
                <div className="leading-tight">
                  <div className="text-[8px] text-neutral-500">Coming soon to the</div>
                  <div className="text-[11px] font-bold">App Store</div>
                </div>
              </div>
              <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-3.5 py-2 rounded-xl overflow-hidden">
                <Play className="w-4 h-4 shrink-0 fill-white/50" />
                <div className="leading-tight">
                  <div className="text-[8px] text-neutral-500">Coming soon on</div>
                  <div className="text-[11px] font-bold">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Reveal>
      {/* Instagram Feed Strip — swapped with Scan to Shop banner per request */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-black text-[#0A1F12] tracking-tight">Follow @igoproteincuts</h2>
          </div>
          <a
            href="https://www.instagram.com/igoproteincuts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition"
          >
            Follow Us <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {instagramPosts.map((post) => (
            <a
              key={post.image}
              href="https://www.instagram.com/igoproteincuts"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square rounded-xl overflow-hidden ${post.fit === 'contain' ? 'bg-white' : 'bg-neutral-100'}`}
            >
              <img
                src={post.image}
                alt={post.alt}
                referrerPolicy="no-referrer"
                className={`w-full h-full group-hover:scale-110 transition duration-500 ${post.fit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
            </a>
          ))}
        </div>
      </section>
      </Reveal>
      {/* Customer Testimonials — swapped with Kitchen Guides per request */}
      <Reveal><TestimonialsSection /></Reveal>
      {/* ============ 13. OUR FARMS ============ */}
      <Reveal><OurFarmsSection /></Reveal>

      {/* ============ 14. NEWSLETTER ============ */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
              <Send className="w-4 h-4" /> {newsletterBlock.heading}
            </div>
            <p className="text-xs text-neutral-600">{newsletterBlock.body}</p>
          </div>
          {newsletterSubmitted ? (
            <div className="bg-white border border-emerald-300 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 shrink-0">
              <CheckCircle2 className="w-4 h-4" /> You're subscribed! Watch your inbox for this week's offers.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full sm:w-auto shrink-0">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 sm:w-64 bg-white border border-emerald-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-[#0A1F12] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
      </Reveal>

    </div>
  );
};
