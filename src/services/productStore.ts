/**
 * Product Store
 * localStorage-based reactive product store with versioning.
 * If the stored data version doesn't match, it resets to static products.
 * Admin changes broadcast to all listeners via custom events AND storage events.
 */

import { Product } from '../types/product';
import { staticProducts } from '../data/staticProducts';

const STORE_KEY = 'igo_products';
const VERSION_KEY = 'igo_products_version';
const STORE_VERSION = 'v3'; // bump this to force a data reset
const UPDATE_EVENT = 'igo_products_updated';

/** Returns true if stored data is valid for current version */
const isVersionValid = (): boolean => {
  return localStorage.getItem(VERSION_KEY) === STORE_VERSION;
};

/** Load products from localStorage, fallback to static data on any error or version mismatch */
export const loadProducts = (): Product[] => {
  try {
    if (!isVersionValid()) {
      // Version mismatch — reset to fresh static data
      console.log('productStore: version mismatch, resetting to static products');
      saveProducts(staticProducts);
      return staticProducts;
    }
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Product[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanity check: ensure products have expected fields
        const isValid = parsed.every(
          p => typeof p.id === 'number' && typeof p.name === 'string' && typeof p.price === 'number'
        );
        if (isValid) return parsed;
      }
    }
  } catch (e) {
    console.warn('productStore: failed to parse localStorage', e);
  }
  // Fallback — seed from static data and persist
  saveProducts(staticProducts);
  return staticProducts;
};

/** Persist products array to localStorage and broadcast change event */
export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(VERSION_KEY, STORE_VERSION);
  localStorage.setItem(STORE_KEY, JSON.stringify(products));
  // Dispatch custom event for same-tab listeners
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: products }));
};

/** Update a single product (upsert by id) */
export const upsertProduct = (updated: Partial<Product> & { id: number }): Product[] => {
  const current = loadProducts();
  const idx = current.findIndex(p => p.id === updated.id);
  let next: Product[];
  if (idx >= 0) {
    next = current.map(p => p.id === updated.id ? { ...p, ...updated } : p);
  } else {
    next = [...current, updated as Product];
  }
  saveProducts(next);
  return next;
};

/** Delete a product by id */
export const removeProduct = (id: number): Product[] => {
  const current = loadProducts();
  const next = current.filter(p => p.id !== id);
  saveProducts(next);
  return next;
};

/** Force reset all products back to static defaults */
export const resetToDefaults = (): Product[] => {
  saveProducts(staticProducts);
  return staticProducts;
};

/**
 * Subscribe to product changes.
 * Listens to both custom events (same tab) and storage events (cross-tab).
 * Returns unsubscribe fn.
 */
export const subscribeToProducts = (cb: (products: Product[]) => void): (() => void) => {
  const customHandler = (e: Event) => {
    cb((e as CustomEvent<Product[]>).detail);
  };
  // storage event fires when ANOTHER tab updates localStorage
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as Product[];
        if (Array.isArray(parsed)) cb(parsed);
      } catch {}
    }
  };
  window.addEventListener(UPDATE_EVENT, customHandler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(UPDATE_EVENT, customHandler);
    window.removeEventListener('storage', storageHandler);
  };
};

/** Convert a File to a base64 data URL */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
