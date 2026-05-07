import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Product } from '../types/product';

export interface CartItem extends Product {
  quantity: number;
  selectedWeight: string;
  finalPrice: number;
}
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, weight?: string) => void;
  removeFromCart: (productId: number, weight?: string) => void;
  updateQuantity: (productId: number, weight: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  notification: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  lastAddedItem: CartItem | null;
  isAddedModalOpen: boolean;
  setIsAddedModalOpen: (open: boolean) => void;
  deliverySlot: string;
  setDeliverySlot: (slot: string) => void;
  deliveryDate: string;
  setDeliveryDate: (date: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [isAddedModalOpen, setIsAddedModalOpen] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState('express');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = useCallback((product: Product, weight = '500g') => {
    const weightOpt = product.weightOptions?.find(w => w.label === weight);
    const multiplier = weightOpt?.priceMultiplier ?? 0.5;
    const finalPrice = Math.round(product.price * multiplier);
    const itemKey = `${product.id}-${weight}`;

    setCart((prev) => {
      const existing = prev.find(i => i.id === product.id && i.selectedWeight === weight);
      if (existing) {
        return prev.map(i =>
          i.id === product.id && i.selectedWeight === weight
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      const newItem = { ...product, quantity: 1, selectedWeight: weight, finalPrice };
      setLastAddedItem(newItem);
      return [...prev, newItem];
    });

    setIsAddedModalOpen(true);
    showNotification(`${product.name} (${weight}) added to cart!`);
  }, []);

  const removeFromCart = (productId: number, weight = '500g') => {
    setCart(prev => prev.filter(i => !(i.id === productId && i.selectedWeight === weight)));
  };

  const updateQuantity = (productId: number, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setCart(prev =>
      prev.map(i =>
        i.id === productId && i.selectedWeight === weight ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, notification,
      isCartOpen, setIsCartOpen,
      wishlist, toggleWishlist,
      lastAddedItem, isAddedModalOpen, setIsAddedModalOpen,
      deliverySlot, setDeliverySlot, deliveryDate, setDeliveryDate
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
