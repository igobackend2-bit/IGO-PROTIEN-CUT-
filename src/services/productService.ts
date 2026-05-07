import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types/product';
import { loadProducts, saveProducts } from './productStore';

/**
 * Product Service (Supabase)
 * Handles production inventory management.
 */

export const getProducts = async (): Promise<Product[]> => {
  try {
    if (!isSupabaseConfigured) {
      return loadProducts();
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      // Sync local cache for offline/performance
      saveProducts(data);
      return data;
    }

    return loadProducts();
  } catch (error) {
    console.error('Fetch Products Error:', error);
    return loadProducts();
  }
};

export const syncProductToDb = async (product: Product) => {
  try {
    if (!isSupabaseConfigured) return { success: false, message: 'Supabase not configured' };

    const { data, error } = await supabase
      .from('products')
      .upsert({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice,
        category: product.category,
        image: product.image,
        unit: product.unit || 'kg',
        badge: product.badge,
        stock_left: product.stockLeft,
        weight_options: product.weightOptions,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Sync Product Error:', error);
    return { success: false, error };
  }
};

export const deleteProductFromDb = async (id: number) => {
  try {
    if (!isSupabaseConfigured) return { success: false };

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete Product Error:', error);
    return { success: false, error };
  }
};
