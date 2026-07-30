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
  CheckCircle2,
  Flame,
  ArrowUpDown,
  ChevronRight
} from 'lucide-react';
import { Product, ProductCategory, ProductWeightOption } from '../types';
import { ProductCard } from '../components/ProductCard';

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

  const handleSimulateReload = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('all');
  };

  // Unique subcategories available within the currently selected category (e.g. Wings, Boneless, Drumsticks under Chicken)
  const subcategoriesInCategory = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const unique = new Set(
      products.filter((p) => p.category === selectedCategory).map((p) => p.subcategory)
    );
    return Array.from(unique);
  }, [products, selectedCategory]);

  // Unique pack sizes (weight option labels) available across the current catalog —
  // mirrors BigBasket's "Pack Size" facet (250 g, 500 g, 1 kg, etc.)
  const availablePackSizes = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((p) => p.weightOptions.forEach((w) => unique.add(w.label)));
    return Array.from(unique);
  }, [products]);

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

  const currentCategoryName = categories.find((c) => c.id === selectedCategory)?.name || 'Category';

  // Shared filter controls, rendered both in the desktop sidebar and the mobile filter drawer
  const filterControlsContent = (
    <>
      {/* Categories Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Category</label>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-[#0F7B3A] text-white shadow'
                  : 'text-neutral-600 hover:bg-emerald-50 hover:text-[#08120B]'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.id && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Filter (only when a specific category is active) */}
      {selectedCategory !== 'all' && subcategoriesInCategory.length > 1 && (
        <div className="space-y-2 pt-4 border-t border-neutral-200">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Cut Type</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              All
            </button>
            {subcategoriesInCategory.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                  selectedSubcategory === sub
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      <div className="space-y-2 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-neutral-500 uppercase tracking-wider">Max Price</label>
          <span className="text-emerald-700 font-black">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min={100}
          max={1500}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span>₹100</span>
          <span>₹1500</span>
        </div>
      </div>

      {/* Discount Buckets */}
      <div className="space-y-2 pt-4 border-t border-neutral-200">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Discount</label>
        <div className="space-y-1.5 text-xs">
          {[
            { value: 0, label: 'Any Discount' },
            { value: 5, label: '5% or more' },
            { value: 10, label: '10% or more' },
            { value: 15, label: '15% or more' },
            { value: 25, label: '25% or more' }
          ].map((d) => (
            <button
              key={d.value}
              onClick={() => setMinDiscount(d.value)}
              className={`w-full text-left px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                minDiscount === d.value
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pack Size */}
      {availablePackSizes.length > 1 && (
        <div className="space-y-2 pt-4 border-t border-neutral-200">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Pack Size</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedPackSize('all')}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                selectedPackSize === 'all'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              All
            </button>
            {availablePackSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedPackSize(size)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                  selectedPackSize === size
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bone & Cut Type */}
      <div className="space-y-2 pt-4 border-t border-neutral-200">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Bone & Prep Cut</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {['all', 'Boneless', 'With Bone', 'Cleaned & Gutted'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedBoneType(type)}
              className={`p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                selectedBoneType === type
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              {type === 'all' ? 'All Cuts' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Freshness Grade */}
      <div className="space-y-2 pt-4 border-t border-neutral-200">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Quality Grade</label>
        <div className="space-y-1.5 text-xs">
          {['all', '100% Antibiotic-Free', 'Fresh Water Catch', 'Deep Sea Fresh'].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedFreshness(grade)}
              className={`w-full text-left px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                selectedFreshness === grade
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              {grade === 'all' ? 'All Quality Standards' : grade}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 pt-4 border-t border-neutral-200">
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Minimum Rating</label>
        <div className="flex items-center gap-2">
          {[0, 4.0, 4.5, 4.8].map((star) => (
            <button
              key={star}
              onClick={() => setMinRating(star)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                minRating === star
                  ? 'bg-[#08120B] border-[#08120B] text-white'
                  : 'bg-white border-neutral-200 text-neutral-600'
              }`}
            >
              {star === 0 ? 'Any' : `${star}★`}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      {selectedCategory !== 'all' && (
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <button onClick={() => onNavigate('/')} className="hover:text-emerald-600 transition cursor-pointer font-semibold">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#08120B] font-bold">{currentCategoryName}</span>
        </nav>
      )}

      {/* Header Title & Live Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> SMART PRODUCT DISCOVERY
          </div>
          <h1 className="text-3xl font-black text-[#08120B] tracking-tight mt-1">
            {selectedCategory === 'all' ? 'Browse Pure Fresh Protein Catalog' : currentCategoryName}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Showing {filteredProducts.length} verified 0-4°C fresh cuts available for 30-min express dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateReload}
            className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-[#08120B] hover:border-neutral-300 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Grid / List toggle */}
          <div className="bg-white border border-neutral-200 rounded-xl p-1 flex items-center gap-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-[#0F7B3A] text-white' : 'text-neutral-400 hover:text-[#08120B]'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-[#0F7B3A] text-white' : 'text-neutral-400 hover:text-[#08120B]'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subcategory Quick Filter Tabs */}
      {selectedCategory !== 'all' && subcategoriesInCategory.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`shrink-0 px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer ${
              selectedSubcategory === 'all'
                ? 'bg-[#0F7B3A] border-emerald-500 text-white shadow'
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400 hover:text-[#08120B]'
            }`}
          >
            All
          </button>
          {subcategoriesInCategory.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`shrink-0 px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedSubcategory === sub
                  ? 'bg-[#0F7B3A] border-emerald-500 text-white shadow'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400 hover:text-[#08120B]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Main Search Input & Type-Ahead */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chicken breast, mutton curry cut, wild prawns, salmon, organic eggs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-neutral-200 focus:border-emerald-500 rounded-2xl px-12 py-3.5 text-sm text-[#08120B] placeholder-neutral-400 focus:outline-none shadow-sm transition"
          />
          <Search className="w-5 h-5 text-emerald-600 absolute left-4 top-4" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 p-1 rounded-full text-neutral-400 hover:text-[#08120B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500 font-bold text-[11px] uppercase tracking-wider">Trending:</span>
          {trendingSearches.map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="bg-white hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-400 px-3 py-1 rounded-full text-neutral-600 font-medium transition cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-emerald-700">Active Filters ({activeFilterCount}):</span>
            {selectedCategory !== 'all' && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                Category: {selectedCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => handleSelectCategory('all')} />
              </span>
            )}
            {selectedSubcategory !== 'all' && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                Cut Type: {selectedSubcategory} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubcategory('all')} />
              </span>
            )}
            {selectedBoneType !== 'all' && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                Cut: {selectedBoneType} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBoneType('all')} />
              </span>
            )}
            {selectedFreshness !== 'all' && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                {selectedFreshness} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFreshness('all')} />
              </span>
            )}
            {minRating > 0 && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                ★ {minRating}+ Stars <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
              </span>
            )}
            {maxPrice < 1500 && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                Under ₹{maxPrice} <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice(1500)} />
              </span>
            )}
            {minDiscount > 0 && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                {minDiscount}%+ OFF <X className="w-3 h-3 cursor-pointer" onClick={() => setMinDiscount(0)} />
              </span>
            )}
            {selectedPackSize !== 'all' && (
              <span className="bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                Pack: {selectedPackSize} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPackSize('all')} />
              </span>
            )}
          </div>

          <button
            onClick={clearAllFilters}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Content Layout: Left Sidebar Filters + Right Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-neutral-200 rounded-3xl p-6 space-y-6 sticky top-24 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <h3 className="font-black text-[#08120B] text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" /> Filter Cuts
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live DB
            </span>
          </div>

          {filterControlsContent}
        </aside>

        {/* Right Main Product Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Sort Selector */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="text-xs text-neutral-500 font-semibold">
              Found <strong className="text-[#08120B] font-black">{filteredProducts.length}</strong> items matching your criteria
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-xl px-3 py-1.5 text-xs font-bold text-[#08120B] transition cursor-pointer shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#0F7B3A] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs">
                <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                <span className="text-neutral-500 font-bold hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-white border border-neutral-200 text-[#08120B] rounded-xl px-3 py-1.5 focus:outline-none font-bold text-xs cursor-pointer"
                >
                  <option value="featured">Featured Fresh Cuts</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
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
            <div className="bg-[#08120B] border border-black rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Failed to sync fresh catalog</h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                Unable to retrieve the latest temperature-monitored darkstore inventory. Please retry.
              </p>
              <button
                onClick={handleSimulateReload}
                className="bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* STATE 3: EMPTY STATE */
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <ShoppingBag className="w-16 h-16 mx-auto text-emerald-200" />
              <h3 className="text-xl font-black text-[#08120B]">No Fresh Cuts Match Your Search</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                We couldn't find any protein products matching your selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* STATE 4 & 5: POPULATED & REALTIME UPDATING */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                  onNavigate={onNavigate}
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
              <h3 className="font-black text-[#08120B] text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" /> Filter Cuts
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
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
