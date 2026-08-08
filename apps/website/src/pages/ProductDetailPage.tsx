import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBag,
  Flame,
  CheckCircle2,
  Share2,
  Clock,
  ChevronRight,
  ThumbsUp,
  MapPin,
  RefreshCw,
  Scissors,
  PackagePlus,
  MessageCircleQuestion,
  Award,
  Undo2,
  Plus,
  ListChecks,
  Snowflake,
  ChevronDown,
  BookOpen,
  Timer,
  Bone,
  Check
} from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { StoreService } from '../lib/storage';
import { BrowseProductCard } from '../components/BrowseProductCard';
import { FadeImage } from '../components/FadeImage';
import { BULK_TIERS, getActiveBulkTier, getBulkUnitPrice, getBulkLineTotal } from '../lib/pricing';
import { INITIAL_RECIPES } from '../data/mockData';
import { fetchProduct } from '../lib/api/catalog';
import { submitReview, fetchMyReview, deleteMyReview, MyReview } from '../lib/api/reviews';

const CUT_PREFERENCES_BY_CATEGORY: Record<string, string[]> = {
  chicken: ['Curry Cut', 'Boneless Cubes', 'Whole (Skinless)', 'Biryani Cut'],
  mutton: ['Curry Cut', 'Boneless Cubes', 'Keema (Minced)', 'Chops'],
  beef: ['Curry Cut', 'Boneless Cubes', 'Steak Cut', 'Keema (Minced)'],
  fish: ['Whole (Cleaned)', 'Steak Cut', 'Fillet', 'Curry Cut'],
  'dry-fish': ['As Is'],
};

/**
 * Pulls an itemized "what's inside" list out of a combo product's free-text
 * description.
 *
 * There is no structured column for this on the admin's `products` table —
 * it's admin-owned, read-only free text (see productAdapter.ts /
 * CLAUDE.md), so the breakdown only exists if the admin typed one into the
 * Description field. Checking `shortDescription` (the first sentence only,
 * via `firstSentence()` in productAdapter.ts) was the earlier bug: any
 * item list written after the opening marketing line got truncated away
 * before this ever saw it. Reading the FULL description and trying a few
 * realistic admin phrasings ("+", "Includes: A, B, C") fixes that for any
 * combo product, not just one.
 */
function extractComboItems(description: string): string[] {
  if (!description) return [];

  if (description.includes('+')) {
    // Isolate the sentence/clause that actually contains the '+' chain, in
    // case there's marketing copy before or after it in the same paragraph.
    const clause =
      description.split(/(?<=[.!])\s+/).find((s) => s.includes('+')) ?? description;
    return clause
      .replace(/^[^:]{0,40}:\s*/, '') // drop a leading "Includes:" / "Contains:" label
      .replace(/\.$/, '')
      .split('+')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // Fall back to an explicit "Includes / Contains / Inside: A, B, C" clause.
  const labeled = description.match(/(?:includes?|contains?|inside)[:\-]\s*([^.]+)\./i);
  if (labeled) {
    return labeled[1]
      .split(/,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  askedBy: string;
  date: string;
}

interface FaqEntry {
  question: string;
  answer: string;
}

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  // 4th param is optional so every other caller of the same shared
  // App.tsx `handleAddToCart` (ProductCard, BrowseProductCard, category/search
  // pages, etc.) keeps compiling unchanged — only this page ever has a
  // "Preferred Cut Style" picker to pass through.
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number, cutPreference?: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onAddToCart,
  onSelectProduct,
  onNavigate
}) => {
  const [selectedWeight, setSelectedWeight] = useState<ProductWeightOption>(product.weightOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  const [isWishlisted, setIsWishlisted] = useState(() => StoreService.getWishlist().includes(product.id));

  // Keeps the heart icon in sync when the same product's wishlist state is
  // toggled elsewhere (a card in "You Might Also Like"/"Recently Viewed" on
  // this same page, or a different tab) — also re-checks on product.id
  // change since this page is reused for every product, not remounted.
  useEffect(() => {
    const sync = () => setIsWishlisted(StoreService.getWishlist().includes(product.id));
    sync();
    window.addEventListener('protein_cuts_wishlist_updated', sync);
    return () => window.removeEventListener('protein_cuts_wishlist_updated', sync);
  }, [product.id]);

  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  // The current customer's own review for this product (any product they've
  // already reviewed), so the "Write a Verified Review" form doesn't invite a
  // second submission. Reviews go through admin approval now (see
  // reviews.ts submitReview), so this also tells them whether theirs is
  // still pending or already live.
  const [myReview, setMyReview] = useState<MyReview | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const cutOptions = CUT_PREFERENCES_BY_CATEGORY[product.category] || [];
  const [selectedCut, setSelectedCut] = useState(cutOptions[0] || '');
  const [bundleAdded, setBundleAdded] = useState(false);

  // Quick-scan Key Features table — mirrors the compact spec table pattern
  // used on marketplace PDPs (Blinkit/Amazon) so shoppers don't have to read
  // the full description to answer basic questions.
  const shelfLifeDays = product.category === 'eggs' ? 14 : product.category === 'dry-fish' ? 60 : 2;
  const comboItems = product.category === 'combo-packs' ? extractComboItems(product.description) : [];
  const keyFeatures = [
    { label: 'Shelf Life', value: `${shelfLifeDays} day${shelfLifeDays > 1 ? 's' : ''} (refrigerated)`, icon: Snowflake },
    { label: 'Bone / Boneless', value: product.boneType, icon: Bone },
    { label: 'Cut Type', value: product.subcategory, icon: Scissors },
    { label: 'Antibiotic Residue Free', value: product.freshnessGrade.includes('Antibiotic') ? 'Yes' : 'Not applicable', icon: ShieldCheck },
    { label: 'Prep Time', value: `${product.prepTimeMinutes} mins`, icon: Timer },
    { label: 'Freshness Grade', value: product.freshnessGrade, icon: Award }
  ];

  // Product-specific FAQ — generated from the product's own data fields so
  // every catalog item gets accurate, scannable answers without hand-writing
  // FAQs per SKU. Matches Blinkit/Amazon's per-product FAQ accordion pattern.
  const productFaqs: FaqEntry[] = [
    { question: `Is this ${product.name.toLowerCase()} fresh or frozen?`, answer: `It is fresh, never frozen, and graded "${product.freshnessGrade}".` },
    { question: 'Is it boneless or with bone?', answer: `This item is ${product.boneType}.` },
    { question: 'How long does it stay fresh?', answer: `Shelf life is ${shelfLifeDays} day${shelfLifeDays > 1 ? 's' : ''} when refrigerated. ${product.storageInstructions}` },
    { question: 'How long does it take to cook?', answer: `It typically cooks in about ${product.prepTimeMinutes} minutes, depending on the recipe.` },
    { question: 'What dishes can I make with it?', answer: product.recipePairing || 'Great for curries, fries, or grilled preparations — see the recipe suggestions below.' },
    { question: 'Is it hygienically packed?', answer: 'Yes, every order is vacuum-sealed and chilled at 0-4°C from cutting to delivery.' },
    { question: 'Can I choose a different cut style?', answer: cutOptions.length > 0 ? `Yes — pick from ${cutOptions.join(', ')} above before adding to cart.` : 'This item is prepared in a single standard style.' }
  ];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  // Q&A + FAQ used to render open on every product page, pushing the recipes
  // and related products far down. Collapsed behind a single button instead —
  // the content and all its state/logic below is unchanged, just hidden
  // until someone actually wants it.
  const [showQA, setShowQA] = useState(false);
  const askInputRef = useRef<HTMLInputElement>(null);
  // "Have a Question?" only told the customer how many questions already
  // existed — nothing signalled that THEY could ask one. This opens the
  // panel and drops focus straight into the ask box instead of leaving them
  // to find it themselves after expanding.
  const handleOpenAsk = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQA(true);
    setTimeout(() => askInputRef.current?.focus(), 50);
  };

  // Recipes tied to this product — exact relatedProductId match first, then
  // any recipe in the same category, mirroring Blinkit's "[Cut] recipes for
  // you" strip on the PDP.
  const relatedRecipes = [
    ...INITIAL_RECIPES.filter((r) => r.relatedProductId === product.id),
    ...INITIAL_RECIPES.filter((r) => r.relatedProductId !== product.id && r.category === product.category)
  ].slice(0, 3);

  const [qaList, setQaList] = useState<QAEntry[]>([
    {
      id: 'qa-1',
      question: 'Is this cut boneless or with bone?',
      answer: `This item is ${product.boneType}. You can also pick a preferred cut style above before adding to cart.`,
      askedBy: 'Priya S.',
      date: '3 days ago'
    },
    {
      id: 'qa-2',
      question: 'How fresh is it — same day cut?',
      answer: `Yes, sourced and cut fresh with grade "${product.freshnessGrade}" and held in cold chain until delivery.`,
      askedBy: 'Arun K.',
      date: '1 week ago'
    }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQaList([
      {
        id: `qa-${Date.now()}`,
        question: newQuestion,
        answer: "Our quality team typically responds within 2 hours. We'll notify you here and via SMS once answered.",
        askedBy: 'You',
        date: 'Just now'
      },
      ...qaList
    ]);
    setNewQuestion('');
  };

  const handleToggleWishlist = () => {
    const list = StoreService.toggleWishlist(product.id);
    setIsWishlisted(list.includes(product.id));
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim() || isSubmittingReview) return;

    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    const result = await submitReview(product.id, newReviewRating, newReviewComment);

    if (!result.ok) {
      setReviewError(result.error ?? 'Could not submit your review. Please try again.');
      setIsSubmittingReview(false);
      return;
    }

    // The DB is the source of truth (it also enforces verified-purchase),
    // so re-read the product's real reviews rather than faking the new row
    // locally — this is the same fetchProduct() the rest of the catalog
    // fetch pipeline uses, just scoped to one product.
    const fresh = await fetchProduct(product.id);
    if (fresh) setReviewsList(fresh.reviews);
    // The just-submitted review is hidden until an admin approves it, so it
    // won't appear in `fresh.reviews` above — re-read it separately to swap
    // the form for the "pending approval" state immediately.
    const mine = await fetchMyReview(product.id);
    if (mine) setMyReview(mine);

    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewSuccess(true);
    setIsSubmittingReview(false);
  };

  const handleDeleteMyReview = async () => {
    if (!myReview || isDeletingReview) return;
    setIsDeletingReview(true);
    const result = await deleteMyReview(myReview.id);
    if (result.ok) {
      setMyReview(null);
      setReviewsList((list) => list.filter((r) => r.id !== myReview.id));
      setReviewSuccess(false);
    } else {
      setReviewError(result.error ?? 'Could not delete your review. Please try again.');
    }
    setIsDeletingReview(false);
  };

  // Real recently-viewed tracking — records this product view, then reads
  // back whichever real products the shopper actually opened before this one.
  useEffect(() => {
    StoreService.addRecentlyViewed(product.id);
  }, [product.id]);

  // The `product` prop comes from the catalog list fetch, which never
  // bundles individual review rows (see toWebsiteProduct in
  // productAdapter.ts — `reviews: []` always, to keep the list payload
  // small). Load this product's real reviews once, specifically for this
  // page, the same way a submitted review refreshes them above.
  useEffect(() => {
    let cancelled = false;

    // Reset every piece of review-form state up front — without this, a
    // success/error banner, a half-typed comment, or a chosen star rating
    // left over from the PREVIOUS product's form was staying visible for a
    // beat (or longer, if the customer never touched the form) after
    // navigating straight to a new product.
    setReviewsList(product.reviews || []);
    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewError(null);
    setReviewSuccess(false);
    setIsSubmittingReview(false);
    setMyReview(null);

    fetchProduct(product.id).then((fresh) => {
      // Always take the fresh read as the source of truth, including the
      // empty-array case — previously this only overwrote when the new
      // product had reviews, so a product with zero reviews kept showing
      // the last-viewed product's review list.
      if (!cancelled && fresh) setReviewsList(fresh.reviews);
    });
    fetchMyReview(product.id).then((mine) => {
      if (!cancelled) setMyReview(mine);
    });
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const recentlyViewedProducts = StoreService.getRecentlyViewed()
    .filter((id) => id !== product.id)
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  const relatedProducts = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const frequentlyBoughtWith = allProducts.filter((p) => p.id !== product.id && p.category !== product.category).slice(0, 2);
  const bundleTotal =
    selectedWeight.price + frequentlyBoughtWith.reduce((sum, p) => sum + p.weightOptions[0].price, 0);
  const bundleOriginalTotal =
    selectedWeight.originalPrice + frequentlyBoughtWith.reduce((sum, p) => sum + p.weightOptions[0].originalPrice, 0);

  const handleAddBundle = () => {
    onAddToCart(product, selectedWeight, 1, selectedCut || undefined);
    frequentlyBoughtWith.forEach((p) => onAddToCart(p, p.weightOptions[0], 1));
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 1800);
  };

  // Bulk / wholesale pricing tiers — rewards gym & daily-buyer volume orders.
  // Same tiers are applied for real in the Cart, so this preview always matches.
  const activeBulkTier = getActiveBulkTier(quantity);
  const bulkTotal = getBulkLineTotal(selectedWeight.price, quantity);
  const bulkSavings = selectedWeight.price * quantity - bulkTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-44 lg:pb-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <button onClick={() => onNavigate('/')} className="hover:text-emerald-600 transition">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate(`/category/${product.category}`)} className="hover:text-emerald-600 uppercase transition font-bold">
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0A1F12] font-semibold truncate">{product.name}</span>
      </div>

      {/* Trust Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: ShieldCheck, label: 'Quality Checked', sub: '3-stage inspection' },
          { icon: Truck, label: 'Cold Chain Delivery', sub: 'Zero temp. break' },
          { icon: Undo2, label: 'Easy Replacement', sub: 'If not satisfied' },
          { icon: Award, label: '100% Fresh Guarantee', sub: 'Or full refund' }
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 rounded-2xl px-3 py-2.5">
            <b.icon className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-[#0A1F12] leading-tight">{b.label}</div>
              <div className="text-[10px] text-neutral-500 leading-tight">{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Product Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-200 shadow-sm">
            <FadeImage
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-[#0F7B3A] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <ShieldCheck className="w-4 h-4" /> {product.freshnessGrade}
            </span>

            <button
              onClick={handleToggleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition cursor-pointer shadow-lg ${
                isWishlisted ? 'bg-emerald-600 text-white' : 'bg-white/90 text-neutral-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.galleryImages && product.galleryImages.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveImage(product.image)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                  activeImage === product.image ? 'border-emerald-500' : 'border-neutral-200 opacity-60'
                }`}
              >
                <FadeImage src={product.image} alt="thumb" className="w-full h-full object-cover" />
              </button>
              {product.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-emerald-500' : 'border-neutral-200 opacity-60'
                  }`}
                >
                  <FadeImage src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Weight Selection, Pricing, Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                {product.boneType}
              </span>
              {reviewsList.length > 0 ? (
                <div className="flex items-center gap-1 text-[#0A1F12] text-xs font-black">
                  <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  <span>{product.rating}</span>
                  <span className="text-neutral-500 font-normal">({reviewsList.length} reviews)</span>
                </div>
              ) : (
                // A literal "0 ★ (0 reviews)" reads as a broken/empty widget
                // rather than "no reviews yet" — hide the star and say so
                // plainly instead.
                <span className="text-neutral-400 text-xs font-semibold">No reviews yet</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight leading-snug">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
              {product.description}
            </p>

            {/* What's Inside This Box — combo packs bundle several items
                together; the description alone doesn't always say how much
                of each is in the box, only the total weight further down
                does (e.g. "2.5kg Total"). `extractComboItems()` pulls an
                itemized breakdown out of the full description whenever the
                admin has written one (e.g. "...Includes 1 Whole Chicken +
                500g Mutton Curry Cut + 12 Farm Fresh Eggs."). If the live
                description has no itemized list at all, this box simply
                doesn't render — that's a real content gap in the admin's
                Description field for that product, not a website bug. */}
            {comboItems.length >= 2 && (
              <div className="mt-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2.5">
                  What&rsquo;s Inside This Box
                </div>
                <ul className="space-y-1.5">
                  {comboItems.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs font-semibold text-[#0A1F12]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Features — compact spec table for a quick scan, mirrors
              marketplace PDPs (Shelf Life / Bone-Boneless / Cut Type / etc.) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-4">
              <ListChecks className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-[#0A1F12] uppercase tracking-wider">Key Features</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {keyFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider leading-tight">{f.label}</div>
                      <div className="text-xs font-bold text-[#0A1F12] leading-tight mt-0.5 truncate">{f.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weight Pack Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Select Pack Size / Weight
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.weightOptions.map((opt) => {
                const isSelected = selectedWeight.label === opt.label;
                const hasDiscount = opt.originalPrice > opt.price;
                const savingsPercent = hasDiscount ? Math.round(((opt.originalPrice - opt.price) / opt.originalPrice) * 100) : 0;
                const perKg = opt.weightGrams > 0 ? Math.round((opt.price / opt.weightGrams) * 1000) : null;

                return (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedWeight(opt)}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-md'
                        : 'bg-white border-neutral-200 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0F7B3A] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}

                    <div className="pr-6">
                      <div className="text-sm font-black text-[#0A1F12]">{opt.label}</div>
                      <div className="text-[11px] text-neutral-500 mt-1">{opt.servings} • {opt.pieces || 'Hand Trimmed'}</div>
                      {opt.netWeightGrams && (
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          Gross {opt.weightGrams}g • Net (edible) {opt.netWeightGrams}g
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-end justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-emerald-700">₹{opt.price}</span>
                          {hasDiscount && (
                            <span className="text-xs text-neutral-400 line-through">₹{opt.originalPrice}</span>
                          )}
                        </div>
                        {perKg && <div className="text-[10px] text-neutral-400 mt-0.5">≈ ₹{perKg}/kg</div>}
                      </div>
                      {hasDiscount && (
                        <span className="shrink-0 bg-[#0F7B3A] text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wide">
                          {savingsPercent}% Off
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cut Preference Selector */}
          {cutOptions.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-emerald-600" /> Preferred Cut Style
              </label>
              <div className="flex flex-wrap gap-2">
                {cutOptions.map((cut) => (
                  <button
                    key={cut}
                    onClick={() => setSelectedCut(cut)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                      selectedCut === cut
                        ? 'bg-[#0F7B3A] border-[#0F7B3A] text-white'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400'
                    }`}
                  >
                    {cut}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500">Our butchers will cut fresh to your preference before packing.</p>
            </div>
          )}

          {/* Buy More, Save More — Bulk Pricing Tiers */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Buy More, Save More (Gym & Bulk Buyers)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Previously these were plain, non-interactive <div>s — the
                  active tier only ever updated as a side-effect of the
                  quantity stepper below, so a customer couldn't tap "10+
                  units" to jump straight to that quantity. Now each tile
                  sets the quantity to that tier's minimum directly. */}
              {BULK_TIERS.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setQuantity(tier.minQty)}
                  className={`rounded-xl border p-2 text-center transition cursor-pointer ${
                    activeBulkTier.label === tier.label
                      ? 'bg-[#0F7B3A] border-[#0F7B3A] text-white'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:border-emerald-400 hover:text-[#0A1F12]'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase">{tier.label}</div>
                  <div className="text-xs font-black mt-0.5">
                    {tier.discountPct > 0 ? `${tier.discountPct}% OFF` : 'Base Price'}
                  </div>
                </button>
              ))}
            </div>
            {bulkSavings > 0 && (
              <p className="text-[11px] text-emerald-700 font-semibold">
                At {quantity} units, you save an extra ₹{bulkSavings} (₹{getBulkUnitPrice(selectedWeight.price, quantity)}/unit).
              </p>
            )}
          </div>

          {/* Price & Add To Cart CTA */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-neutral-500">Total Price</div>
              <div className="text-2xl font-black text-[#0A1F12]">
                ₹{bulkTotal}
                <span className="text-xs text-neutral-400 font-normal ml-2">Incl. all taxes</span>
              </div>
              {bulkSavings > 0 && (
                <div className="text-[11px] text-neutral-400 line-through">₹{selectedWeight.price * quantity}</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Qty Selector */}
              <div className="flex items-center bg-white border border-neutral-200 rounded-2xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
                >
                  -
                </button>
                <span className="px-3 font-bold text-sm text-[#0A1F12]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onAddToCart(product, selectedWeight, quantity, selectedCut || undefined)}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xl shadow-emerald-900/20"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together — green banner treatment so it reads as
          a merchandising bundle rather than another plain white card, with
          each item on its own white card for clear separation. */}
      {frequentlyBoughtWith.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F7B3A] to-[#0A1F12] p-6 sm:p-8 shadow-xl shadow-emerald-950/20">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '28px 28px'
          }} />

          <div className="relative z-10">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mb-1">
              <PackagePlus className="w-5 h-5 text-emerald-300" /> Frequently Bought Together
            </h3>
            <p className="text-xs text-emerald-100/70 mb-6">Bundle these {frequentlyBoughtWith.length + 1} items and add them to your cart in one go.</p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {[product, ...frequentlyBoughtWith].map((p, idx) => (
                <React.Fragment key={p.id}>
                  {idx > 0 && (
                    <div className="hidden sm:flex w-7 h-7 rounded-full bg-white items-center justify-center shrink-0 shadow">
                      <Plus className="w-3.5 h-3.5 text-[#0F7B3A]" />
                    </div>
                  )}
                  <div className="relative flex items-center gap-3 bg-white rounded-2xl p-3 w-full sm:w-auto shadow-md">
                    {idx === 0 && (
                      <span className="absolute -top-2 -left-2 bg-[#D4AF37] text-[#0A1F12] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                        This Item
                      </span>
                    )}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                      <FadeImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0A1F12] line-clamp-1">{p.name}</div>
                      <div className="text-xs text-emerald-700 font-black">
                        ₹{idx === 0 ? selectedWeight.price : p.weightOptions[0].price}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              <div className="sm:ml-auto text-center sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/15">
                <div className="text-[11px] text-emerald-100/70">
                  Total price
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <span className="line-through text-white/40 text-sm">₹{bundleOriginalTotal}</span>
                  <span className="text-2xl font-black text-white">₹{bundleTotal}</span>
                </div>
                <button
                  onClick={handleAddBundle}
                  className={`mt-2.5 w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg ${
                    bundleAdded ? 'bg-emerald-400 text-[#0A1F12]' : 'bg-white hover:bg-emerald-50 text-[#0F7B3A]'
                  }`}
                >
                  {bundleAdded ? 'Added All 3!' : 'Add All to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition & Storage Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nutrition Card — amber accent so it reads as its own topic, not
            a repeat of the green Key Features card above it. */}
        <div className="bg-white border border-neutral-200 border-t-4 border-t-orange-400 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-black text-[#0A1F12] uppercase tracking-wider flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-orange-500" />
            </span>
            Nutritional Profile (Per 100g)
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
              <div className="text-lg font-black text-emerald-700">{product.nutrition.protein}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Protein</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl">
              <div className="text-lg font-black text-[#0A1F12]">{product.nutrition.calories}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Energy</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl">
              <div className="text-lg font-black text-[#0A1F12]">{product.nutrition.fat}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Total Fat</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl">
              <div className="text-lg font-black text-[#0A1F12]">{product.nutrition.carbs}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Carbs</div>
            </div>
          </div>
        </div>

        {/* Storage Instructions Card — sky-blue accent (cold-chain/info cue),
            distinct from the amber Nutrition card beside it. */}
        <div className="bg-white border border-neutral-200 border-t-4 border-t-sky-400 rounded-3xl p-6 space-y-3 shadow-sm">
          <h3 className="text-base font-black text-[#0A1F12] uppercase tracking-wider flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-sky-500" />
            </span>
            Storage & Cooking Tips
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            <strong className="text-[#0A1F12]">Storage:</strong> {product.storageInstructions}
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            <strong className="text-[#0A1F12]">Chef Note:</strong> {product.recipePairing || 'Ideal for grilling, slow curry, or high-protein stir frying.'}
          </p>
        </div>
      </div>

      {/* Verified Reviews Section — gold accent, matching the star-rating
          color used everywhere else on the site so this reads as the
          "trust/social proof" section at a glance. */}
      <div className="bg-white border border-neutral-200 border-t-4 border-t-[#D4AF37] rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <h3 className="text-2xl font-black text-[#0A1F12] tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              </span>
              Verified Customer Reviews
            </h3>
            <p className="text-xs text-neutral-500 mt-1">100% genuine reviews from customers who ordered this item</p>
          </div>

          {reviewsList.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-[#0A1F12]">{product.rating}</div>
              <div>
                <div className="flex text-emerald-600 text-xs">
                  {'★'.repeat(Math.floor(product.rating))}
                </div>
                <div className="text-xs text-neutral-500">{reviewsList.length} Ratings</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 font-semibold bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
              No ratings yet — be the first to review this product.
            </div>
          )}
        </div>

        {/* Add Review Form — hidden once this customer already has a review
            for this product, so they can't submit a second one. */}
        {myReview ? (
          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#0A1F12]">Your Review</div>
              {myReview.isHidden ? (
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Pending Approval
                </span>
              ) : (
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              )}
            </div>
            <div className="text-emerald-600 text-xs">{'★'.repeat(myReview.rating)}</div>
            <p className="text-xs text-neutral-600 leading-relaxed">{myReview.comment}</p>
            {myReview.isHidden && (
              <p className="text-[11px] text-neutral-500">
                Our team reviews new submissions before they go live — thanks for your patience.
              </p>
            )}
            {reviewError && (
              <div className="bg-[#0A1F12] border border-black rounded-xl p-2.5 text-[11px] text-white">{reviewError}</div>
            )}
            <button
              type="button"
              onClick={handleDeleteMyReview}
              disabled={isDeletingReview}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeletingReview ? 'Deleting…' : 'Delete my review'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddReview} className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-[#0A1F12]">Write a Verified Review</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReviewRating(star)}
                  className={`text-lg transition ${star <= newReviewRating ? 'text-emerald-600' : 'text-neutral-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience regarding cut precision, freshness, and packaging..."
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-[#0A1F12] focus:outline-none focus:border-emerald-500"
              rows={2}
            />
            {reviewError && (
              <div className="bg-[#0A1F12] border border-black rounded-xl p-2.5 text-[11px] text-white">{reviewError}</div>
            )}
            {reviewSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-700 font-semibold">
                Thanks — your review is submitted and pending approval.
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-[#0F7B3A] hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl text-xs uppercase"
            >
              {isSubmittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0A1F12]">{rev.userName}</span>
                  {rev.verifiedPurchase && (
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-neutral-400 text-[11px]">{rev.date}</span>
              </div>
              <div className="text-emerald-600 text-xs">{'★'.repeat(rev.rating)}</div>
              <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Q&A + FAQ — collapsed behind one button instead of always taking up
          a full screen of space; opens in place when clicked. Violet accent
          marks it as the "help/support" section, distinct from the amber
          Nutrition, sky Storage and gold Reviews cards above it. */}
      <div className="bg-white border border-neutral-200 border-t-4 border-t-violet-400 rounded-3xl shadow-sm overflow-hidden">
        <div className="w-full flex items-center justify-between gap-3 p-6 sm:p-8">
          <button
            onClick={() => setShowQA((s) => !s)}
            className="flex items-center gap-3 text-left cursor-pointer min-w-0 flex-1"
          >
            <span className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
              <MessageCircleQuestion className="w-4 h-4 text-violet-500" />
            </span>
            <span className="text-left min-w-0">
              <span className="block text-base sm:text-lg font-black text-[#0A1F12] tracking-tight">
                Have a Question About This Product?
              </span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                {qaList.length} answered questions &amp; {productFaqs.length} FAQs — cut, freshness, packaging &amp; more
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {/* Makes it explicit that a customer can ask their own question
                here, not just read what others already asked. */}
            <button
              onClick={handleOpenAsk}
              className="hidden sm:flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-bold px-3.5 py-2 rounded-full text-[11px] uppercase tracking-wide transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Ask a Question
            </button>
            <button
              onClick={() => setShowQA((s) => !s)}
              aria-label={showQA ? 'Collapse questions' : 'Expand questions'}
              className="p-1 cursor-pointer"
            >
              <ChevronDown className={`w-5 h-5 text-violet-500 shrink-0 transition-transform ${showQA ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Compact mobile equivalent of the Ask a Question button above */}
        <button
          onClick={handleOpenAsk}
          className="sm:hidden mx-6 mb-5 flex items-center justify-center gap-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-bold px-3.5 py-2.5 rounded-full text-[11px] uppercase tracking-wide transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Ask a Question
        </button>

        {showQA && (
          <div className="px-6 sm:px-8 pb-8 space-y-8 border-t border-neutral-100 pt-6">
            {/* Q&A Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#0A1F12] uppercase tracking-wider">Questions &amp; Answers</h3>

              <form onSubmit={handleAskQuestion} className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex items-center gap-3">
                <input
                  ref={askInputRef}
                  type="text"
                  placeholder="Ask about cut, freshness, sourcing, packaging..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase shrink-0"
                >
                  Ask
                </button>
              </form>

              <div className="space-y-4">
                {qaList.map((qa) => (
                  <div key={qa.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <span className="bg-[#0A1F12] text-white font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">Q</span>
                      <p className="text-[#0A1F12] font-semibold">{qa.question}</p>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <span className="bg-emerald-600 text-white font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">A</span>
                      <p className="text-neutral-600 leading-relaxed">{qa.answer}</p>
                    </div>
                    <p className="text-[10px] text-neutral-400 pl-7">Asked by {qa.askedBy} • {qa.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product FAQ Accordion — dynamically generated per product */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#0A1F12] uppercase tracking-wider">Frequently Asked Questions</h3>
              <div className="divide-y divide-neutral-200 border-t border-neutral-200">
                {productFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between gap-3 py-4 text-left cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-bold text-[#0A1F12]">{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-emerald-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <p className="text-xs text-neutral-600 leading-relaxed pb-4 pr-8">{faq.answer}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipes for This Cut */}
      {relatedRecipes.length > 0 && (
        <div>
          <h3 className="text-xl font-black text-[#0A1F12] tracking-tight mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Recipes for This Cut
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedRecipes.map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate(`/recipes/${r.id}`)}
                className="text-left bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                <div className="aspect-video bg-neutral-100 overflow-hidden">
                  <FadeImage src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-[#0A1F12] line-clamp-1">{r.title}</div>
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                    <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-emerald-600" /> {r.prepTime}</span>
                    <span>{r.difficulty}</span>
                    <span>{r.protein}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* You Might Also Like */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-xl font-black text-[#0A1F12] tracking-tight mb-6">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <BrowseProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed — real per-browser view history, not fabricated */}
      {recentlyViewedProducts.length > 0 && (
        <div>
          <h3 className="text-xl font-black text-[#0A1F12] tracking-tight mb-6">Recently Viewed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewedProducts.map((p) => (
              <BrowseProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add-to-Cart Bar — sits above the fixed mobile tab bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 flex items-center justify-between gap-3 lg:hidden">
        <div>
          <div className="text-[10px] text-neutral-500">Total</div>
          {/* Was showing the raw undiscounted price*quantity here while the
              desktop total above correctly applies the bulk-tier discount —
              two different totals for the same quantity on the same page. */}
          <div className="text-lg font-black text-[#0A1F12]">₹{bulkTotal}</div>
        </div>
        <button
          onClick={() => onAddToCart(product, selectedWeight, quantity, selectedCut || undefined)}
          className="flex-1 max-w-[220px] bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
};
