import React, { useState, useEffect } from 'react';
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
  Sparkles,
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
  Timer
} from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { StoreService } from '../lib/storage';
import { ProductCard } from '../components/ProductCard';
import { FadeImage } from '../components/FadeImage';
import { BULK_TIERS, getActiveBulkTier, getBulkUnitPrice, getBulkLineTotal } from '../lib/pricing';
import { INITIAL_RECIPES } from '../data/mockData';

const CUT_PREFERENCES_BY_CATEGORY: Record<string, string[]> = {
  chicken: ['Curry Cut', 'Boneless Cubes', 'Whole (Skinless)', 'Biryani Cut'],
  mutton: ['Curry Cut', 'Boneless Cubes', 'Keema (Minced)', 'Chops'],
  beef: ['Curry Cut', 'Boneless Cubes', 'Steak Cut', 'Keema (Minced)'],
  fish: ['Whole (Cleaned)', 'Steak Cut', 'Fillet', 'Curry Cut'],
  'dry-fish': ['As Is'],
};

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
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
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
  const [isSubscribeSave, setIsSubscribeSave] = useState(false);
  const [subscribeFreq, setSubscribeFreq] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [pincode, setPincode] = useState('560038');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(() => StoreService.getWishlist().includes(product.id));
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState(product.reviews || []);

  const cutOptions = CUT_PREFERENCES_BY_CATEGORY[product.category] || [];
  const [selectedCut, setSelectedCut] = useState(cutOptions[0] || '');
  const [bundleAdded, setBundleAdded] = useState(false);

  // Quick-scan Key Features table — mirrors the compact spec table pattern
  // used on marketplace PDPs (Blinkit/Amazon) so shoppers don't have to read
  // the full description to answer basic questions.
  const shelfLifeDays = product.category === 'eggs' ? 14 : product.category === 'dry-fish' ? 60 : 2;
  const keyFeatures = [
    { label: 'Shelf Life', value: `${shelfLifeDays} day${shelfLifeDays > 1 ? 's' : ''} (refrigerated)` },
    { label: 'Bone / Boneless', value: product.boneType },
    { label: 'Cut Type', value: product.subcategory },
    { label: 'Antibiotic Residue Free', value: product.freshnessGrade.includes('Antibiotic') ? 'Yes' : 'Not applicable' },
    { label: 'Prep Time', value: `${product.prepTimeMinutes} mins` },
    { label: 'Freshness Grade', value: product.freshnessGrade }
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

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    const newRev = {
      id: `r-${Date.now()}`,
      userName: 'Valued Customer',
      rating: newReviewRating,
      date: 'Just now',
      comment: newReviewComment,
      verifiedPurchase: true
    };
    setReviewsList([newRev, ...reviewsList]);
    setNewReviewComment('');
  };

  // Real recently-viewed tracking — records this product view, then reads
  // back whichever real products the shopper actually opened before this one.
  useEffect(() => {
    StoreService.addRecentlyViewed(product.id);
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
    onAddToCart(product, selectedWeight, 1);
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
        <span className="text-[#08120B] font-semibold truncate">{product.name}</span>
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
              <div className="text-[11px] font-bold text-[#08120B] leading-tight">{b.label}</div>
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
                <img src={product.image} alt="thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
              {product.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-emerald-500' : 'border-neutral-200 opacity-60'
                  }`}
                >
                  <img src={img} alt="thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
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
              <div className="flex items-center gap-1 text-[#08120B] text-xs font-black">
                <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>{product.rating}</span>
                <span className="text-neutral-500 font-normal">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight leading-snug">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Key Features — compact spec table for a quick scan, mirrors
              marketplace PDPs (Shelf Life / Bone-Boneless / Cut Type / etc.) */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <ListChecks className="w-3.5 h-3.5 text-emerald-600" /> Key Features
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {keyFeatures.map((f) => (
                <div key={f.label} className="flex items-start gap-2">
                  <Snowflake className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wide leading-tight">{f.label}</div>
                    <div className="text-xs font-bold text-[#08120B] leading-tight">{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weight Pack Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Select Pack Size / Weight
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.weightOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedWeight(opt)}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedWeight.label === opt.label
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-xs font-bold text-[#08120B]">{opt.label}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">{opt.servings} • {opt.pieces || 'Hand Trimmed'}</div>
                  {opt.netWeightGrams && (
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Gross {opt.weightGrams}g • Net (edible) {opt.netWeightGrams}g
                    </div>
                  )}
                  <div className="mt-2 text-sm font-black text-emerald-700">
                    ₹{opt.price} <span className="text-xs text-neutral-400 line-through">₹{opt.originalPrice}</span>
                  </div>
                </button>
              ))}
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

          {/* Subscribe & Save Option */}
          <div className="bg-[#08120B] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSubscribeSave}
                  onChange={(e) => setIsSubscribeSave(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Subscribe & Save 10% Extra
                </span>
              </label>
            </div>

            {isSubscribeSave && (
              <div className="flex items-center gap-3 pt-2 text-xs">
                <span className="text-neutral-400">Frequency:</span>
                <button
                  onClick={() => setSubscribeFreq('Weekly')}
                  className={`px-3 py-1 rounded-full font-bold border transition ${
                    subscribeFreq === 'Weekly' ? 'bg-white text-black border-white' : 'bg-white/5 text-neutral-300 border-white/10'
                  }`}
                >
                  Weekly Delivery
                </button>
                <button
                  onClick={() => setSubscribeFreq('Monthly')}
                  className={`px-3 py-1 rounded-full font-bold border transition ${
                    subscribeFreq === 'Monthly' ? 'bg-white text-black border-white' : 'bg-white/5 text-neutral-300 border-white/10'
                  }`}
                >
                  Monthly Supply
                </button>
              </div>
            )}
          </div>

          {/* Delivery Availability Checker */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="text-xs font-bold text-[#08120B] flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> Check Express 30-Min Delivery Slot
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter Pincode"
                className="bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-[#08120B] focus:outline-none"
              />
              <button
                onClick={() => setPincodeChecked(true)}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Check
              </button>
            </div>
            {pincodeChecked && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cold chain express delivery active for {pincode}!
              </p>
            )}
          </div>

          {/* Buy More, Save More — Bulk Pricing Tiers */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Buy More, Save More (Gym & Bulk Buyers)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BULK_TIERS.map((tier) => (
                <div
                  key={tier.label}
                  className={`rounded-xl border p-2 text-center transition ${
                    activeBulkTier.label === tier.label
                      ? 'bg-[#0F7B3A] border-[#0F7B3A] text-white'
                      : 'bg-white border-neutral-200 text-neutral-500'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase">{tier.label}</div>
                  <div className="text-xs font-black mt-0.5">
                    {tier.discountPct > 0 ? `${tier.discountPct}% OFF` : 'Base Price'}
                  </div>
                </div>
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
              <div className="text-2xl font-black text-[#08120B]">
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
                <span className="px-3 font-bold text-sm text-[#08120B]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onAddToCart(product, selectedWeight, quantity)}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xl shadow-emerald-900/20"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {frequentlyBoughtWith.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-black text-[#08120B] tracking-tight flex items-center gap-2 mb-6">
            <PackagePlus className="w-5 h-5 text-emerald-600" /> Frequently Bought Together
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {[product, ...frequentlyBoughtWith].map((p, idx) => (
              <React.Fragment key={p.id}>
                {idx > 0 && <Plus className="w-4 h-4 text-neutral-300 shrink-0 hidden sm:block" />}
                <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl p-3 w-full sm:w-auto">
                  <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#08120B] line-clamp-1">{p.name}</div>
                    <div className="text-xs text-emerald-700 font-black">
                      ₹{idx === 0 ? selectedWeight.price : p.weightOptions[0].price}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}

            <div className="sm:ml-auto text-center sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
              <div className="text-[11px] text-neutral-500">
                Total: <span className="line-through text-neutral-400">₹{bundleOriginalTotal}</span>{' '}
                <span className="text-lg font-black text-[#08120B]">₹{bundleTotal}</span>
              </div>
              <button
                onClick={handleAddBundle}
                className={`mt-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  bundleAdded ? 'bg-emerald-500 text-white' : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white'
                }`}
              >
                {bundleAdded ? 'Added All 3!' : 'Add All to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition & Storage Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nutrition Card */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-black text-[#08120B] uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600" /> Nutritional Profile (Per 100g)
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
              <div className="text-lg font-black text-emerald-700">{product.nutrition.protein}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Protein</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl">
              <div className="text-lg font-black text-[#08120B]">{product.nutrition.calories}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Energy</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl">
              <div className="text-lg font-black text-[#08120B]">{product.nutrition.fat}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Total Fat</div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl">
              <div className="text-lg font-black text-[#08120B]">{product.nutrition.carbs}</div>
              <div className="text-[10px] text-neutral-500 font-medium uppercase">Carbs</div>
            </div>
          </div>
        </div>

        {/* Storage Instructions Card */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-3 shadow-sm">
          <h3 className="text-base font-black text-[#08120B] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" /> Storage & Cooking Tips
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            <strong className="text-[#08120B]">Storage:</strong> {product.storageInstructions}
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            <strong className="text-[#08120B]">Chef Note:</strong> {product.recipePairing || 'Ideal for grilling, slow curry, or high-protein stir frying.'}
          </p>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <h3 className="text-2xl font-black text-[#08120B] tracking-tight">Verified Customer Reviews</h3>
            <p className="text-xs text-neutral-500">100% genuine reviews from customers who ordered this item</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-[#08120B]">{product.rating}</div>
            <div>
              <div className="flex text-emerald-600 text-xs">
                {'★'.repeat(Math.floor(product.rating))}
              </div>
              <div className="text-xs text-neutral-500">{reviewsList.length} Ratings</div>
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleAddReview} className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-[#08120B]">Write a Verified Review</div>
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
            className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-[#08120B] focus:outline-none focus:border-emerald-500"
            rows={2}
          />
          <button
            type="submit"
            className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase"
          >
            Submit Review
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#08120B]">{rev.userName}</span>
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

      {/* Q&A Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-black text-[#08120B] tracking-tight flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-emerald-600" /> Questions & Answers
        </h3>

        <form onSubmit={handleAskQuestion} className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about cut, freshness, sourcing, packaging..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs text-[#08120B] focus:outline-none focus:border-emerald-500"
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
                <span className="bg-[#08120B] text-white font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">Q</span>
                <p className="text-[#08120B] font-semibold">{qa.question}</p>
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
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-xl font-black text-[#08120B] tracking-tight flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-emerald-600" /> Frequently Asked Questions
        </h3>
        <div className="divide-y divide-neutral-200 border-t border-neutral-200">
          {productFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx}>
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 py-4 text-left cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#08120B]">{faq.question}</span>
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

      {/* Recipes for This Cut */}
      {relatedRecipes.length > 0 && (
        <div>
          <h3 className="text-xl font-black text-[#08120B] tracking-tight mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Recipes for This Cut
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedRecipes.map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate('/recipes')}
                className="text-left bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                <div className="aspect-video bg-neutral-100 overflow-hidden">
                  <img src={r.image} alt={r.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-[#08120B] line-clamp-1">{r.title}</div>
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
          <h3 className="text-xl font-black text-[#08120B] tracking-tight mb-6">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed — real per-browser view history, not fabricated */}
      {recentlyViewedProducts.length > 0 && (
        <div>
          <h3 className="text-xl font-black text-[#08120B] tracking-tight mb-6">Recently Viewed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add-to-Cart Bar — sits above the fixed mobile tab bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 flex items-center justify-between gap-3 lg:hidden">
        <div>
          <div className="text-[10px] text-neutral-500">Total</div>
          <div className="text-lg font-black text-[#08120B]">₹{selectedWeight.price * quantity}</div>
        </div>
        <button
          onClick={() => onAddToCart(product, selectedWeight, quantity)}
          className="flex-1 max-w-[220px] bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
};
