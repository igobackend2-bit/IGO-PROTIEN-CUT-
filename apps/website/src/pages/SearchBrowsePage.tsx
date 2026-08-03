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
            {cat.name}
          </button>
        ))}
      </div>

      {/* Price Range */}
      <div className="space-y-2.5 rounded-2xl border border-neutral-200 p-4 mt-5">
        <label className="text-xs font-bold text-[#0A1F12] uppercase tracking-wider block">Price Range</label>
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
          <span className="text-neutral-400">To</span>
          <span className="font-black text-emerald-700">Up to ₹{maxPrice}</span>
        </div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pt-1 border-t border-neutral-100">
          {filteredProducts.length} products match
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
            Home
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
              <Filter className="w-4 h-4 text-emerald-600" /> Categories
            </h3>
            {filterControlsContent}
          </div>
        </aside>

        {/* Right Main Product Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Sort Selector */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="text-xs text-neutral-500 font-semibold">
              Found <strong className="text-[#0A1F12] font-black">{filteredProducts.length}</strong> items matching your criteria
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0A1F12] transition cursor-pointer shadow-sm"
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
                  className="bg-white border border-neutral-200 text-[#0A1F12] rounded-xl px-3 py-1.5 focus:outline-none font-bold text-xs cursor-pointer"
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
            <div className="bg-[#0A1F12] rounded-3xl p-12 text-center space-y-4">
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
              <h3 className="text-xl font-black text-[#0A1F12]">No Fresh Cuts Match Your Search</h3>
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
