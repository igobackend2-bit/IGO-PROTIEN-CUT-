import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowUpDown,
  Download,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  PackageX,
  Package,
  Sparkles
} from 'lucide-react';
import { Product } from '../../types/product';
import { loadProducts, upsertProduct, removeProduct, fileToDataUrl } from '../../services/productStore';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Chicken', 'Mutton', 'Fish', 'Seafood', 'Eggs', 'Exotic'];

  useEffect(() => {
    setProducts(loadProducts());
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleDelete = (id: number) => {
    if (confirm('Delete this product? This removes it from the live storefront.')) {
      const next = removeProduct(id);
      setProducts(next);
    }
  };

  const handleToggleStock = (product: Product) => {
    const updated = { ...product, stockLeft: product.stockLeft === 0 ? 50 : 0 };
    const next = upsertProduct(updated);
    setProducts(next);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setImagePreview(product.image);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    const newId = Math.max(0, ...products.map(p => p.id)) + 1;
    setFormData({
      id: newId,
      name: '',
      description: '',
      price: 0,
      category: 'Chicken',
      image: '',
      unit: 'kg',
      badge: 'Fresh',
      stockLeft: 50,
      weightOptions: [
        { label: '500g', priceMultiplier: 0.5 },
        { label: '1kg', priceMultiplier: 1 },
      ],
    });
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
    setFormData(prev => ({ ...prev, image: dataUrl }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.price) {
      alert('Please fill in the product name and price.');
      return;
    }
    if (!formData.image) {
      alert('Please upload a product image.');
      return;
    }
    setIsSaving(true);
    // Simulate brief async (feels real)
    await new Promise(r => setTimeout(r, 500));
    const next = upsertProduct(formData as Product & { id: number });
    setProducts(next);
    setIsSaving(false);
    setIsModalOpen(false);
    setSavedMsg(editingProduct ? `"${formData.name}" updated on storefront!` : `"${formData.name}" added to storefront!`);
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Category', 'Price', 'Stock'],
      ...products.map(p => [p.id, p.name, p.category, p.price, p.stockLeft ?? 'N/A']),
    ].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'igo_products.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Success toast */}
      <AnimatePresence>
        {savedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[200] bg-green-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            {savedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Inventory Catalog</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{products.length} products · Changes update storefront instantly</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-igo-green text-white rounded-xl text-sm font-bold shadow-lg shadow-igo-green/20 hover:bg-igo-green/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-igo-green/20 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-igo-green text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1607623814075-e512199b4472?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-800 line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">SKU: IGO-{String(product.id).padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-lg text-[10px] font-bold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-neutral-800">₹{product.price}</span>
                        {product.isDynamicPricingEnabled && (
                          <Sparkles className="w-3 h-3 text-igo-gold" />
                        )}
                      </div>
                      {product.originalPrice && (
                        <span className="text-[10px] text-neutral-300 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStock(product)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        product.stockLeft === 0
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {product.stockLeft === 0 ? (
                        <><PackageX className="w-3.5 h-3.5" />Out of Stock</>
                      ) : (
                        <><Package className="w-3.5 h-3.5" />In Stock</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 text-neutral-400 hover:text-igo-green hover:bg-igo-green/5 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-neutral-400 text-sm">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[28px] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-7">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-800">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">
                      {editingProduct ? 'Changes save instantly to the live storefront.' : 'Fill in details to list a new cut.'}
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Product Image</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="relative w-full h-48 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-igo-green cursor-pointer transition-all overflow-hidden bg-neutral-50 flex items-center justify-center group"
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-center">
                              <Upload className="w-7 h-7 mx-auto mb-2" />
                              <p className="text-sm font-bold">Change Image</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-neutral-400">
                          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                          <p className="text-sm font-bold">Click to upload image</p>
                          <p className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFile}
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Fresh Farm Chicken (Whole)"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-igo-green/30 focus:border-igo-green outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Short product description..."
                      rows={2}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-igo-green/30 focus:border-igo-green outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Category + Price row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Category</label>
                      <select
                        value={formData.category || 'Chicken'}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-igo-green/30 outline-none appearance-none cursor-pointer transition-all"
                      >
                        {['Chicken', 'Mutton', 'Fish', 'Seafood', 'Eggs', 'Exotic'].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Price (₹) *</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.price || ''}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="350"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-igo-green/30 focus:border-igo-green outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Original Price + Badge row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Original Price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.originalPrice || ''}
                        onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) || undefined })}
                        placeholder="400 (for sale badge)"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-igo-green/30 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Badge</label>
                      <input
                        type="text"
                        value={formData.badge || ''}
                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="Fresh Today / Premium"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-igo-green/30 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* AI Dynamic Pricing Section */}
                  <div className="p-5 bg-igo-gold/5 border border-igo-gold/20 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-igo-gold/10 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-igo-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-800">AI Dynamic Pricing</p>
                          <p className="text-[10px] text-neutral-400">Optimize revenue based on demand &amp; freshness</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          isDynamicPricingEnabled: !prev.isDynamicPricingEnabled
                        }))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          formData.isDynamicPricingEnabled ? 'bg-igo-gold' : 'bg-neutral-200'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          formData.isDynamicPricingEnabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {formData.isDynamicPricingEnabled && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-igo-gold/10">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Suggested Price</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-igo-gold">
                              ₹{Math.round((formData.basePrice || formData.price || 0) * (formData.demandFactor || 1) * ((formData.freshnessIndex || 1) >= 0.9 ? 1 : 0.85))}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium">/ {formData.unit}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                          <button 
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              price: Math.round((prev.basePrice || prev.price || 0) * (prev.demandFactor || 1) * ((prev.freshnessIndex || 1) >= 0.9 ? 1 : 0.85))
                            }))}
                            className="text-[10px] font-bold text-igo-gold hover:underline uppercase tracking-wider"
                          >
                            Apply AI Price
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stock status toggle */}
                  <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-neutral-800">In Stock</p>
                      <p className="text-xs text-neutral-400">Toggle off to mark as Out of Stock on storefront</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        stockLeft: prev.stockLeft === 0 ? 50 : 0
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.stockLeft !== 0 ? 'bg-igo-green' : 'bg-neutral-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        formData.stockLeft !== 0 ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 bg-neutral-100 text-neutral-600 rounded-2xl font-bold hover:bg-neutral-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3.5 bg-igo-green text-white rounded-2xl font-bold shadow-lg shadow-igo-green/20 hover:bg-igo-green/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      editingProduct ? 'Save Changes' : 'Add to Storefront'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;
