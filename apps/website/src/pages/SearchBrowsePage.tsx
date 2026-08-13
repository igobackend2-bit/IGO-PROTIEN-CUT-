import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List as ListIcon,
  X,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Star,
  Flame,
  ArrowUpDown,
  ChevronRight
} from 'lucide-react';
import { Product, ProductCategory, ProductWeightOption } from '../types';
import { BrowseProductCard } from '../components/BrowseProductCard';
import { useLang, pick } from '../lib/language';
import { scoreProductMatch } from '../lib/search';

interface SearchBrowsePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate: (path: string) => void;
  initialCategory?: string;
  initialSearchQuery?: string;
}

export const SearchBrowsePage: React.FC<SearchBrowsePageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigate,
  initialCategory = 'all',
  initialSearchQuery = ''
}) => {
  const { t, lang } = useLang();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedBoneType, setSelectedBoneType] = useState<string>('all');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [selectedPackSize, setSelectedPackSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Recent & Trending Queries
  const recentSearches = ['Chicken Breast Boneless', 'Atlantic Salmon Steak', 'Organic Eggs 6 Pack', 'Goat Mutton Curry Cut'];
  const trendingSearches = ['Boneless Chicken', 'Tiger Prawns', 'Brown Country Eggs', 'Lamb Chop'];

  const CATEGORY_NAMES_TA: Record<string, string> = {
    all: 'அனைத்து புதிய புரதம்',
    chicken: 'புதிய கோழி',
    mutton: 'ஆடு மட்டன்',
    beef: 'பிரீமியம் மாட்டிறைச்சி',
    fish: 'மீன் & கடல் உணவு',
    'dry-fish': 'வெயிலில் உலர்த்திய மீன்',
    eggs: 'பண்ணை முட்டைகள்',
    'healthy-addons': 'ஆரோக்கிய சேர்க்கைகள்',
    'ready-to-cook': 'சமைக்க தயார்',
    'frozen-food': 'உறைந்த உணவு',
    biryani: 'பிரியாணி கிட்ஸ்',
    'cold-cuts': 'கோல்ட் கட்ஸ்',
    'combo-packs': 'காம்போ பாக்குகள்'
  };

  const CATEGORY_NAMES_HI: Record<string, string> = {
    all: 'सभी फ्रेश प्रोटीन',
    chicken: 'फ्रेश चिकन',
    mutton: 'बकरी मटन',
    beef: 'प्रीमियम बीफ',
    fish: 'मछली और सीफूड',
    'dry-fish': 'धूप में सुखाई मछली',
    eggs: 'फार्म अंडे',
    'healthy-addons': 'हेल्दी ऐड-ऑन',
    'ready-to-cook': 'रेडी-टू-कुक',
    'frozen-food': 'फ्रोज़न फूड',
    biryani: 'बिरयानी किट्स',
    'cold-cuts': 'कोल्ड कट्स',
    'combo-packs': 'कॉम्बो पैक्स'
  };

  const CATEGORY_NAMES_ML: Record<string, string> = {
    all: 'എല്ലാ ഫ്രഷ് പ്രോട്ടീനും',
    chicken: 'ഫ്രഷ് ചിക്കൻ',
    mutton: 'ആട്ടിറച്ചി (മട്ടൺ)',
    beef: 'പ്രീമിയം ബീഫ്',
    fish: 'മീനും സീഫുഡും',
    'dry-fish': 'വെയിലത്ത് ഉണക്കിയ മീൻ',
    eggs: 'ഫാം മുട്ട',
    'healthy-addons': 'ആരോഗ്യകരമായ ആഡ്-ഓണുകൾ',
    'ready-to-cook': 'റെഡി-ടു-കുക്ക്',
    'frozen-food': 'ഫ്രോസൺ ഫുഡ്',
    biryani: 'ബിരിയാണി കിറ്റുകൾ',
    'cold-cuts': 'കോൾഡ് കട്സ്',
    'combo-packs': 'കോംബോ പാക്കുകൾ'
  };

  const CATEGORY_NAMES_TE: Record<string, string> = {
    all: 'అన్ని ఫ్రెష్ ప్రోటీన్',
    chicken: 'ఫ్రెష్ చికెన్',
    mutton: 'మేక మటన్',
    beef: 'ప్రీమియం బీఫ్',
    fish: 'చేపలు & సీఫుడ్',
    'dry-fish': 'ఎండు చేపలు',
    eggs: 'ఫార్మ్ గుడ్లు',
    'healthy-addons': 'ఆరోగ్యకరమైన యాడ్-ఆన్‌లు',
    'ready-to-cook': 'రెడీ-టు-కుక్',
    'frozen-food': 'ఫ్రోజెన్ ఫుడ్',
    biryani: 'బిర్యానీ కిట్స్',
    'cold-cuts': 'కోల్డ్ కట్స్',
    'combo-packs': 'కాంబో ప్యాక్స్'
  };

  const CATEGORY_NAMES_KN: Record<string, string> = {
    all: 'ಎಲ್ಲಾ ಫ್ರೆಶ್ ಪ್ರೋಟೀನ್',
    chicken: 'ಫ್ರೆಶ್ ಚಿಕನ್',
    mutton: 'ಮೇಕೆ ಮಟನ್',
    beef: 'ಪ್ರೀಮಿಯಂ ಬೀಫ್',
    fish: 'ಮೀನು & ಸೀಫುಡ್',
    'dry-fish': 'ಒಣ ಮೀನು',
    eggs: 'ಫಾರ್ಮ್ ಮೊಟ್ಟೆಗಳು',
    'healthy-addons': 'ಆರೋಗ್ಯಕರ ಆಡ್-ಆನ್‌ಗಳು',
    'ready-to-cook': 'ರೆಡಿ-ಟು-ಕುಕ್',
    'frozen-food': 'ಫ್ರೋಜನ್ ಫುಡ್',
    biryani: 'ಬಿರಿಯಾನಿ ಕಿಟ್‌ಗಳು',
    'cold-cuts': 'ಕೋಲ್ಡ್ ಕಟ್ಸ್',
    'combo-packs': 'ಕಾಂಬೊ ಪ್ಯಾಕ್‌ಗಳು'
  };

  const categories = [
    { id: 'all', name: 'All Fresh Protein' },
    { id: 'chicken', name: 'Fresh Chicken' },
    { id: 'mutton', name: 'Goat Mutton' },
    { id: 'beef', name: 'Premium Beef' },
    { id: 'fish', name: 'Fish & Seafood' },
    { id: 'dry-fish', name: 'Sun-Dried Fish' },
    { id: 'eggs', name: 'Farm Eggs' },
    { id: 'healthy-addons', name: 'Healthy Add-ons' },
    { id: 'ready-to-cook', name: 'Ready-to-Cook' },
    { id: 'frozen-food', name: 'Frozen Food' },
    { id: 'biryani', name: 'Biryani Kits' },
    { id: 'cold-cuts', name: 'Cold Cuts' },
    { id: 'combo-packs', name: 'Combo Packs' }
  ];
  const categoryDisplayName = (cat: { id: string; name: string }) =>
    lang === 'ta'
      ? CATEGORY_NAMES_TA[cat.id] ?? cat.name
      : lang === 'hi'
      ? CATEGORY_NAMES_HI[cat.id] ?? cat.name
      : lang === 'ml'
      ? CATEGORY_NAMES_ML[cat.id] ?? cat.name
      : lang === 'te'
      ? CATEGORY_NAMES_TE[cat.id] ?? cat.name
      : lang === 'kn'
      ? CATEGORY_NAMES_KN[cat.id] ?? cat.name
      : cat.name;

  const handleSimulateReload = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // Previously this only updated local state, so the URL never changed when
  // switching categories from the sidebar. That left the browser's Back
  // button pointing at whatever category the page originally loaded with —
  // e.g. open /category/chicken, switch to Mutton via the sidebar, view a
  // product, then hit Back and land on Fresh Chicken again instead of
  // Mutton, because Mutton was never actually pushed as its own history
  // entry. Routing through onNavigate (App.tsx's navigate()) makes each
  // category switch a real, back-button-able URL — mirrors exactly what
  // clicking a category card elsewhere on the site already does.
  const handleSelectCategory = (catId: string) => {
    if (catId === 'all') {
      onNavigate('/search');
    } else {
      onNavigate(`/category/${catId}`);
    }
  };

  // Unique subcategories available within the currently selected category (e.g. Wings, Boneless, Drumsticks under Chicken)
  const subcategoriesInCategory = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const unique = new Set(
      products.filter((p) => p.category === selectedCategory).map((p) => p.subcategory)
    );
    return Array.from(unique);
  }, [products, selectedCategory]);

  // Unique pack sizes (weight option labels) available within the current
  // category — mirrors BigBasket's "Pack Size" facet (250 g, 500 g, 1 kg,
  // etc). Scoped to the selected category (same as subcategoriesInCategory)
  // rather than the whole catalog — across every category the catalog has
  // ~70 distinct labels, which blew this facet into a single-column list of
  // dozens of chips instead of a handful of relevant sizes.
  const availablePackSizes = useMemo(() => {
    const scoped = selectedCategory === 'all' ? products : products.filter((p) => p.category === selectedCategory);
    const unique = new Set<string>();
    scoped.forEach((p) => p.weightOptions.forEach((w) => unique.add(w.label)));
    return Array.from(unique).slice(0, 8);
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Subcategory match
      if (selectedSubcategory !== 'all' && p.subcategory !== selectedSubcategory) return false;

      // Text query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }

      // Bone type
      if (selectedBoneType !== 'all' && p.boneType !== selectedBoneType) return false;

      // Freshness
      if (selectedFreshness !== 'all' && p.freshnessGrade !== selectedFreshness) return false;

      // Rating
      if (minRating > 0 && p.rating < minRating) return false;

      // Price limit
      if (p.basePrice > maxPrice) return false;

      // Discount bucket (BigBasket-style: "min X% off")
      if (minDiscount > 0 && p.discountPercentage < minDiscount) return false;

      // Pack size
      if (selectedPackSize !== 'all' && !p.weightOptions.some((w) => w.label === selectedPackSize)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isTodayFresh ? 1 : 0) - (a.isTodayFresh ? 1 : 0);
      // Default ("Featured") sort with an active text search — previously
      // this returned 0 (no reorder), so results kept the catalog's
      // original order and a search for "on" could show Watermelon before
      // Onion just because Watermelon happened to be earlier in the
      // catalog. Rank by the same relevance score the Navbar's live
      // dropdown uses (see src/lib/search.ts) so the closest name matches
      // surface first here too.
      if (searchQuery.trim()) {
        return scoreProductMatch(searchQuery, b) - scoreProductMatch(searchQuery, a);
      }
      return 0;
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, selectedBoneType, selectedFreshness, minRating, maxPrice, minDiscount, selectedPackSize, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedBoneType('all');
    setSelectedFreshness('all');
    setMinRating(0);
    setMaxPrice(1500);
    setMinDiscount(0);
    setSelectedPackSize('all');
    setSortBy('featured');
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubcategory !== 'all' ? 1 : 0) +
    (selectedBoneType !== 'all' ? 1 : 0) +
    (selectedFreshness !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (maxPrice < 1500 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (selectedPackSize !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  const currentCategoryName = currentCategoryObj
    ? categoryDisplayName(currentCategoryObj)
    : pick(lang, { en: 'Category', ta: 'வகை', hi: 'श्रेणी', ml: 'വിഭാഗം', te: 'కేటగిరీ', kn: 'ವರ್ಗ' });

  // Shared filter controls, rendered both in the desktop sidebar and the
  // mobile filter drawer — trimmed down to just Category + Price Range, the
  // two facets actually needed to browse a category. The other state
  // (subcategory, discount, pack size, bone type, freshness, rating) is left
  // in place further up so the underlying filtering logic doesn't change,
  // it's just no longer exposed as extra sidebar controls.
  const filterControlsContent = (
    <>
      {/* Categories */}
      <div className="space-y-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat.id)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#0F7B3A] text-white shadow'
                : 'text-neutral-600 hover:bg-emerald-50 hover:text-[#0A1F12]'
            }`}
          >
            {categoryDisplayName(cat)}
          </button>
        ))}
      </div>

      {/* Price Range */}
      <div className="space-y-2.5 rounded-2xl border border-neutral-200 p-4 mt-5">
        <label className="text-xs font-bold text-[#0A1F12] uppercase tracking-wider block">{pick(lang, { en: 'Price Range', ta: 'விலை வரம்பு', hi: 'मूल्य सीमा', ml: 'വില പരിധി', te: 'ధర పరిధి', kn: 'ಬೆಲೆ ಶ್ರೇಣಿ' })}</label>
        <input
          type="range"
          min={100}
          max={1500}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">{pick(lang, { en: 'To', ta: 'வரை', hi: 'तक', ml: 'വരെ', te: 'వరకు', kn: 'ವರೆಗೆ' })}</span>
          <span className="font-black text-emerald-700">
            {pick(lang, {
              en: `Up to ₹${maxPrice}`,
              ta: `₹${maxPrice} வரை`,
              hi: `₹${maxPrice} तक`,
              ml: `₹${maxPrice} വരെ`,
              te: `₹${maxPrice} వరకు`,
              kn: `₹${maxPrice} ವರೆಗೆ`
            })}
          </span>
        </div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pt-1 border-t border-neutral-100">
          {pick(lang, {
            en: `${filteredProducts.length} products match`,
            ta: `${filteredProducts.length} தயாரிப்புகள் பொருந்துகின்றன`,
            hi: `${filteredProducts.length} उत्पाद मेल खाते हैं`,
            ml: `${filteredProducts.length} ഉൽപ്പന്നങ്ങൾ പൊരുത്തപ്പെടുന്നു`,
            te: `${filteredProducts.length} ఉత్పత్తులు సరిపోలాయి`,
            kn: `${filteredProducts.length} ಉತ್ಪನ್ನಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ`
          })}
        </p>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Breadcrumb */}
      {selectedCategory !== 'all' && (
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <button onClick={() => onNavigate('/')} className="hover:text-emerald-600 transition cursor-pointer font-semibold">
            {t('home')}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0A1F12] font-bold">{currentCategoryName}</span>
        </nav>
      )}

      {/* Content Layout: Left Sidebar Filters + Right Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <h3 className="font-black text-[#0A1F12] text-sm flex items-center gap-1.5 mb-3">
              <Filter className="w-4 h-4 text-emerald-600" /> {pick(lang, { en: 'Categories', ta: 'வகைகள்', hi: 'श्रेणियां', ml: 'വിഭാഗങ്ങൾ', te: 'కేటగిరీలు', kn: 'ವರ್ಗಗಳು' })}
            </h3>
            {filterControlsContent}
          </div>
        </aside>

        {/* Right Main Product Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Sort Selector */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="text-xs text-neutral-500 font-semibold">
              {lang === 'ta' ? (
                <>
                  <strong className="text-[#0A1F12] font-black">{filteredProducts.length}</strong> பொருட்கள் உங்கள் தேடலுடன் பொருந்துகின்றன
                </>
              ) : lang === 'hi' ? (
                <>
                  आपकी शर्तों से मेल खाने वाले <strong className="text-[#0A1F12] font-black">{filteredProducts.length}</strong> आइटम मिले
                </>
              ) : lang === 'ml' ? (
                <>
                  നിങ്ങളുടെ മാനദണ്ഡങ്ങളുമായി പൊരുത്തപ്പെടുന്ന <strong className="text-[#0A1F12] font-black">{filteredProducts.length}</strong> ഇനങ്ങൾ കണ്ടെത്തി
                </>
              ) : lang === 'te' ? (
                <>
                  మీ ప్రమాణాలకు సరిపోలే <strong className="text-[#0A1F12] font-black">{filteredProducts.length}</strong> వస్తువులు కనుగొనబడ్డాయి
                </>
              ) : lang === 'kn' ? (
                <>
                  ನಿಮ್ಮ ಮಾನದಂಡಗಳಿಗೆ ಹೊಂದುವ <strong className="text-[#0A1F12] font-black">{filteredProducts.length}</strong> ವಸ್ತುಗಳು ಕಂಡುಬಂದಿವೆ
                </>
              ) : (
                <>
                  Found <strong className="text-[#0A1F12] font-black">{filteredProducts.length}</strong> items matching your criteria
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0A1F12] transition cursor-pointer shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                {pick(lang, { en: 'Filters', ta: 'வடிகட்டிகள்', hi: 'फ़िल्टर', ml: 'ഫിൽട്ടറുകൾ', te: 'ఫిల్టర్‌లు', kn: 'ಫಿಲ್ಟರ್‌ಗಳು' })}
                {activeFilterCount > 0 && (
                  <span className="bg-[#0F7B3A] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs">
                <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                <span className="text-neutral-500 font-bold hidden sm:inline">{pick(lang, { en: 'Sort By:', ta: 'வரிசைப்படுத்து:', hi: 'क्रमबद्ध करें:', ml: 'ക്രമീകരിക്കുക:', te: 'క్రమబద్ధీకరించు:', kn: 'ವಿಂಗಡಿಸಿ:' })}</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-white border border-neutral-200 text-[#0A1F12] rounded-xl px-3 py-1.5 focus:outline-none font-bold text-xs cursor-pointer"
                >
                  <option value="featured">{pick(lang, { en: 'Featured Fresh Cuts', ta: 'சிறப்பு புதிய கட்ஸ்', hi: 'फीचर्ड फ्रेश कट्स', ml: 'ഫീച്ചേർഡ് ഫ്രഷ് കട്സ്', te: 'ఫీచర్డ్ ఫ్రెష్ కట్స్', kn: 'ವಿಶೇಷ ತಾಜಾ ಕಟ್ಸ್' })}</option>
                  <option value="newest">{pick(lang, { en: 'Newest Arrivals', ta: 'புதிய வரவுகள்', hi: 'नवीनतम आगमन', ml: 'ഏറ്റവും പുതിയവ', te: 'కొత్తగా వచ్చినవి', kn: 'ಹೊಸ ಆಗಮನೆಗಳು' })}</option>
                  <option value="price-low">{pick(lang, { en: 'Price: Low to High', ta: 'விலை: குறைவு முதல் அதிகம்', hi: 'कीमत: कम से ज़्यादा', ml: 'വില: കുറഞ്ഞത് മുതൽ കൂടിയത് വരെ', te: 'ధర: తక్కువ నుండి ఎక్కువ', kn: 'ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚಿಗೆ' })}</option>
                  <option value="price-high">{pick(lang, { en: 'Price: High to Low', ta: 'விலை: அதிகம் முதல் குறைவு', hi: 'कीमत: ज़्यादा से कम', ml: 'വില: കൂടിയത് മുതൽ കുറഞ്ഞത് വരെ', te: 'ధర: ఎక్కువ నుండి తక్కువ', kn: 'ಬೆಲೆ: ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆಗೆ' })}</option>
                  <option value="rating">{pick(lang, { en: 'Highest Rated', ta: 'அதிக மதிப்பீடு', hi: 'सबसे ज़्यादा रेटेड', ml: 'ഏറ്റവും ഉയർന്ന റേറ്റിംഗ്', te: 'అత్యధిక రేటింగ్', kn: 'ಅತಿ ಹೆಚ್ಚು ರೇಟಿಂಗ್' })}</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5 STATES HANDLING */}
          {/* STATE 1: LOADING SKELETON */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded-3xl p-4 space-y-4 animate-pulse shadow-sm">
                  <div className="w-full h-48 bg-neutral-100 rounded-2xl" />
                  <div className="h-4 bg-neutral-100 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  <div className="h-10 bg-neutral-100 rounded-2xl mt-4" />
                </div>
              ))}
            </div>
          ) : hasError ? (
            /* STATE 2: ERROR STATE + RETRY */
            <div className="bg-[#0A1F12] rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">{pick(lang, { en: 'Failed to sync fresh catalog', ta: 'புதிய பட்டியலை ஒத்திசைக்க முடியவில்லை', hi: 'फ्रेश कैटलॉग सिंक नहीं हो सका', ml: 'ഫ്രഷ് കാറ്റലോഗ് സിങ്ക് ചെയ്യാൻ കഴിഞ്ഞില്ല', te: 'ఫ్రెష్ కేటలాగ్‌ను సింక్ చేయలేకపోయాము', kn: 'ತಾಜಾ ಕ್ಯಾಟಲಾಗ್ ಸಿಂಕ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ' })}</h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                {pick(lang, {
                  en: 'Unable to retrieve the latest temperature-monitored darkstore inventory. Please retry.',
                  ta: 'சமீபத்திய வெப்பநிலை-கண்காணிக்கப்பட்ட டார்க்ஸ்டோர் இருப்பை மீட்டெடுக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
                  hi: 'नवीनतम तापमान-निगरानी वाले डार्कस्टोर इन्वेंट्री को प्राप्त करने में असमर्थ। कृपया फिर से कोशिश करें।',
                  ml: 'ഏറ്റവും പുതിയ താപനില-നിരീക്ഷിത ഡാർക്ക്സ്റ്റോർ ഇൻവെന്ററി വീണ്ടെടുക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.',
                  te: 'తాజా ఉష్ణోగ్రత-పర్యవేక్షిత డార్క్‌స్టోర్ ఇన్వెంటరీని పొందలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.',
                  kn: 'ಇತ್ತೀಚಿನ ತಾಪಮಾನ-ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿದ ಡಾರ್ಕ್‌ಸ್ಟೋರ್ ದಾಸ್ತಾನನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
                })}
              </p>
              <button
                onClick={handleSimulateReload}
                className="bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {pick(lang, { en: 'Retry Loading', ta: 'மீண்டும் ஏற்றவும்', hi: 'फिर से लोड करें', ml: 'വീണ്ടും ലോഡ് ചെയ്യൂ', te: 'మళ్లీ లోడ్ చేయండి', kn: 'ಮತ್ತೆ ಲೋಡ್ ಮಾಡಿ' })}
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* STATE 3: EMPTY STATE */
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <ShoppingBag className="w-16 h-16 mx-auto text-emerald-200" />
              <h3 className="text-xl font-black text-[#0A1F12]">{pick(lang, { en: 'No Fresh Cuts Match Your Search', ta: 'உங்கள் தேடலுக்கு பொருந்தும் புதிய கட்ஸ் இல்லை', hi: 'आपकी खोज से मेल खाने वाले कोई फ्रेश कट्स नहीं मिले', ml: 'നിങ്ങളുടെ തിരയലുമായി പൊരുത്തപ്പെടുന്ന ഫ്രഷ് കട്സ് ഇല്ല', te: 'మీ శోధనకు సరిపోలే ఫ్రెష్ కట్స్ లేవు', kn: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದುವ ತಾಜಾ ಕಟ್ಸ್ ಇಲ್ಲ' })}</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                {pick(lang, {
                  en: "We couldn't find any protein products matching your selected filters. Try broadening your criteria or reset filters.",
                  ta: 'உங்கள் தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுடன் பொருந்தும் புரத தயாரிப்புகள் எதுவும் கிடைக்கவில்லை. உங்கள் அளவுகோல்களை விரிவுபடுத்த முயற்சிக்கவும் அல்லது வடிகட்டிகளை மீட்டமைக்கவும்.',
                  hi: 'हमें आपके चुने हुए फ़िल्टर से मेल खाने वाले कोई प्रोटीन उत्पाद नहीं मिले। अपने मानदंड को व्यापक बनाने की कोशिश करें या फ़िल्टर रीसेट करें।',
                  ml: 'നിങ്ങൾ തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകളുമായി പൊരുത്തപ്പെടുന്ന പ്രോട്ടീൻ ഉൽപ്പന്നങ്ങളൊന്നും ഞങ്ങൾക്ക് കണ്ടെത്താനായില്ല. നിങ്ങളുടെ മാനദണ്ഡങ്ങൾ വിശാലമാക്കുകയോ ഫിൽട്ടറുകൾ റീസെറ്റ് ചെയ്യുകയോ ചെയ്യുക.',
                  te: 'మీరు ఎంచుకున్న ఫిల్టర్‌లకు సరిపోలే ప్రోటీన్ ఉత్పత్తులు మాకు కనిపించలేదు. మీ ప్రమాణాలను విస్తృతం చేయడానికి ప్రయత్నించండి లేదా ఫిల్టర్‌లను రీసెట్ చేయండి.',
                  kn: 'ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದುವ ಯಾವುದೇ ಪ್ರೋಟೀನ್ ಉತ್ಪನ್ನಗಳು ನಮಗೆ ಸಿಗಲಿಲ್ಲ. ನಿಮ್ಮ ಮಾನದಂಡಗಳನ್ನು ವಿಸ್ತರಿಸಲು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ.'
                })}
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {pick(lang, { en: 'Reset All Filters', ta: 'அனைத்து வடிகட்டிகளையும் மீட்டமைக்கவும்', hi: 'सभी फ़िल्टर रीसेट करें', ml: 'എല്ലാ ഫിൽട്ടറുകളും റീസെറ്റ് ചെയ്യൂ', te: 'అన్ని ఫిల్టర్‌లను రీసెట్ చేయండి', kn: 'ಎಲ್ಲಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ' })}
              </button>
            </div>
          ) : (
            /* STATE 4 & 5: POPULATED & REALTIME UPDATING */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'
                  : 'grid grid-cols-2 sm:grid-cols-3 gap-4'
              }
            >
              {filteredProducts.map((product) => (
                <BrowseProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 sticky -top-6 bg-white pt-1 -mt-1">
              <h3 className="font-black text-[#0A1F12] text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" /> {pick(lang, { en: 'Filter Cuts', ta: 'கட்ஸை வடிகட்டவும்', hi: 'कट्स फ़िल्टर करें', ml: 'കട്സ് ഫിൽട്ടർ ചെയ്യൂ', te: 'కట్స్‌ను ఫిల్టర్ చేయండి', kn: 'ಕಟ್ಸ್ ಫಿಲ್ಟರ್ ಮಾಡಿ' })}
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {filterControlsContent}

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              {pick(lang, {
                en: `Show ${filteredProducts.length} Results`,
                ta: `${filteredProducts.length} முடிவுகளைக் காட்டு`,
                hi: `${filteredProducts.length} परिणाम दिखाएं`,
                ml: `${filteredProducts.length} ഫലങ്ങൾ കാണിക്കൂ`,
                te: `${filteredProducts.length} ఫలితాలను చూపించు`,
                kn: `${filteredProducts.length} ಫಲಿತಾಂಶಗಳನ್ನು ತೋರಿಸು`
              })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
