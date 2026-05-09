export interface WeightOption {
  label: string;
  priceMultiplier: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  category: string;
  badge?: string;
  isPremium?: boolean;
  rating?: number;
  reviewCount?: number;
  soldToday?: number;
  stockLeft?: number;
  idealFor?: string[];
  chefTip?: string;
  protein?: string;
  piecesPerKg?: string;
  weightOptions?: WeightOption[];
  // AI related fields
  basePrice?: number;
  demandFactor?: number; // 0.5 to 1.5
  freshnessIndex?: number; // 0 to 1
  isDynamicPricingEnabled?: boolean;
}
