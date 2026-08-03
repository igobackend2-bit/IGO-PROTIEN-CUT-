import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductWeightOption, ProductCategory } from '../types';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CategoryPageProps {
  category: ProductCategory;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  products,
  onSelectProduct,
  onAddToCart
}) => {
  const [boneFilter, setBoneFilter] = useState<'All' | 'Boneless' | 'With Bone'>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');

  const categoryTitles: Record<ProductCategory, { title: string; desc: string }> = {
    chicken: { title: 'Fresh Farm Chicken Cuts', desc: '100% Antibiotic-Free, vacuum sealed at 0-4°C' },
    mutton: { title: 'Pasture-Fed Goat Mutton', desc: 'Tender young goat cuts with rich flavor' },
    beef: { title: 'Premium Beef Cuts', desc: 'Grain-fed, hygienically dressed beef cuts & steaks' },
    fish: { title: 'Wild Sea Fish & Freshwater Catch', desc: 'Descaled, gutted & sliced fresh every morning' },
    'dry-fish': { title: 'Sun-Dried Organic Seafood', desc: 'Traditional beach dried and hygienically packed' },
    eggs: { title: 'Farm Fresh & Country Eggs', desc: 'Rich golden yolks, zero antibiotic residues' },
    'ready-to-cook': { title: 'Marinated Ready-to-Cook Specials', desc: 'Pre-spiced chef cuts ready to grill in 10 minutes' },
    'combo-packs': { title: 'Protein Combo Value Packs', desc: 'Curated weekend bundles with up to 20% savings' },
    subscription: { title: 'Protein Subscription Plans', desc: 'Scheduled morning deliveries for gym & family' },
    'healthy-addons': { title: 'Healthy Add-ons & Fresh Produce', desc: 'Fresh veggies & fruits to pair with your protein' },
    'frozen-food': { title: 'Frozen Food & Freezer Staples', desc: 'IQF nuggets, kebabs, fillets & veggies — heat & eat in minutes' },
    biryani: { title: 'Biryani Kits', desc: 'Marinated meat, seeraga samba rice & whole spices — dum-cook at home' },
    'cold-cuts': { title: 'Cold Cuts & Deli Meats', desc: 'Ready-to-eat salami, ham, sausages & bacon' }
  };

  const currentInfo = categoryTitles[category] || { title: 'Fresh Cuts', desc: '100% Fresh Antibiotic-free cuts' };

  let filteredProducts = products.filter((p) => p.category === category);

  if (boneFilter !== 'All') {
    filteredProducts = filteredProducts.filter((p) =>
      boneFilter === 'Boneless' ? p.boneType === 'Boneless' : p.boneType !== 'Boneless'
    );
  }

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.basePrice - a.basePrice);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 relative overflow-hidden">
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">IGO PROTEIN CUTS</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0A1F12]">{currentInfo.title}</h1>
          <p className="text-xs sm:text-sm text-neutral-600">{currentInfo.desc}</p>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span className="font-bold uppercase tracking-wider text-neutral-500">Cut Preference:</span>
          {['All', 'Boneless', 'With Bone'].map((type) => (
            <button
              key={type}
              onClick={() => setBoneFilter(type as any)}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
                boneFilter === type
                  ? 'bg-[#0F7B3A] border-emerald-500 text-white'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12] hover:border-neutral-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-emerald-600" />
          <span className="font-bold uppercase tracking-wider text-neutral-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-[#0A1F12] focus:outline-none focus:border-emerald-500"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-3xl text-neutral-500 space-y-2 shadow-sm">
          <h3 className="text-lg font-bold text-[#0A1F12]">No cuts match your current filter</h3>
          <p className="text-xs">Try switching cut preferences or browsing all categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};
