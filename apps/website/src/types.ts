export type ProductCategory =
  | 'chicken'
  | 'mutton'
  | 'beef'
  | 'fish'
  | 'dry-fish'
  | 'eggs'
  | 'ready-to-cook'
  | 'combo-packs'
  | 'subscription'
  | 'healthy-addons'
  | 'frozen-food'
  | 'biryani'
  | 'cold-cuts';

export interface ProductWeightOption {
  label: string;
  weightGrams: number;
  price: number;
  originalPrice: number;
  servings: string;
  pieces?: string;
  // Net (cleaned/deshelled/edible) weight, distinct from the gross/as-caught
  // weightGrams — mainly used for seafood like prawns and crabs where a
  // meaningful portion of the gross weight is shell/husk. Shown alongside
  // the gross weight for pricing transparency (TenderCuts-style disclosure).
  netWeightGrams?: number;
}

export interface ProductNutrition {
  protein: string;
  calories: string;
  fat: string;
  carbs: string;
  iron?: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  userAvatar?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  originalPrice: number;
  discountPercentage: number;
  image: string;
  galleryImages: string[];
  weightOptions: ProductWeightOption[];
  nutrition: ProductNutrition;
  freshnessGrade: '100% Antibiotic-Free' | 'Fresh Water Catch' | 'Deep Sea Fresh' | 'Organic Farm' | 'Chilled 0-4°C';
  boneType: 'Boneless' | 'With Bone' | 'Cleaned & Gutted' | 'Whole';
  isBestSeller?: boolean;
  isTodayFresh?: boolean;
  isFlashOffer?: boolean;
  stockStatus: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  storageInstructions: string;
  recipePairing?: string;
  reviews: ProductReview[];
}

export type CookingType =
  | 'Biryani'
  | 'Curry / Gravy'
  | 'Fry / Roast'
  | 'Kebab / Tandoori'
  | 'Soup / Broth'
  | 'Salad / Meal Prep';

export interface RequiredIngredient {
  id: string;
  name: string;
  category: 'vegetable' | 'masala_spice';
  quantity: string;
  estimatedPrice: number;
  redirectTarget: 'farmers_factory' | 'igo_mart';
  redirectUrl: string;
  storeName: "Farmer's Factory" | 'IGO Mart';
  image: string;
}

export interface CookingRecipeIngredients {
  cookingType: CookingType;
  dishName: string;
  cookingTime: string;
  servingSize: string;
  vegetables: RequiredIngredient[];
  masalasAndSpices: RequiredIngredient[];
}

export interface CartItem {
  product: Product;
  selectedWeight: ProductWeightOption;
  quantity: number;
  cutPreference?: string;
  cookingType?: CookingType;
  cookingNotes?: string;
}

export interface DeliverySlot {
  id: string;
  date: string; // e.g. "Today, July 25"
  timeRange: string; // e.g. "Express (30 Mins)", "07:00 AM - 09:00 AM"
  type: 'express' | 'standard';
  fee: number;
}

export interface SavedAddress {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  label?: string;
  name: string;
  phone: string;
  flatNo: string;
  street: string;
  landmark: string;
  pincode: string;
  city: string;
  state?: string;
  fullAddress?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'Placed'
  | 'Freshly Cut'
  | 'Quality Passed'
  | 'Out for Express Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: SavedAddress;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'IGO Wallet' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  status: OrderStatus;
  deliverySlot: string;
  trackingStep: number; // 1 to 4
  deliveryPartnerName?: string;
  driverDetails?: {
    name: string;
    phone: string;
    vehicleNo: string;
    rating: number;
    otp: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  tagline: string;
  category: 'Fitness' | 'Family' | 'Custom';
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  itemsIncluded: string[];
  pricePerMonth: number;
  originalPrice: number;
  savings: string;
  recommendedFor: string;
  badge?: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: ProductCategory;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Chef Special';
  calories: string;
  protein: string;
  image: string;
  videoUrl?: string;
  ingredients: string[];
  steps: string[];
  relatedProductId?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

export interface FranchiseLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  budget: string;
  preferredLocation: string;
  experience: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'In Discussion' | 'Approved' | 'Rejected';
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  description: string;
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipTier: 'Gold' | 'Platinum' | 'Elite';
  IGOWalletBalance: number;
  walletBalance: number;
  rewardPoints: number;
  referralCode: string;
  addresses: SavedAddress[];
  savedAddresses: SavedAddress[];
  avatarUrl?: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'flash_sale' | 'coupon' | 'referral' | 'subscription' | 'support';
  createdAt: string;
  isRead: boolean;
  deepLink?: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
  attachmentUrl?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'Damaged/Missing Item' | 'Delivery Delay' | 'Payment/Refund Issue' | 'Quality Issue' | 'Subscription Query' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Delivery' | 'Quality & Sourcing' | 'Orders & Payment' | 'Subscriptions' | 'Refunds & Returns';
  helpfulVotes: number;
  unhelpfulVotes: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber?: string;
  reason: string;
  itemNames: string[];
  refundAmount: number;
  status: 'Requested' | 'Approved' | 'Pickup Scheduled' | 'Refund Completed' | 'Rejected';
  createdAt: string;
  comments?: string;
  photoUrl?: string;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planTitle: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  nextDeliveryDate: string;
  itemsSummary: string;
  pricePerDelivery: number;
  status: 'Active' | 'Paused' | 'Cancelled';
  deliverySlot: string;
  addressId: string;
  deliveriesCompleted: number;
  createdAt: string;
}

export interface ComboPack {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  originalPrice: number;
  comboPrice: number;
  savings: string;
  image: string;
  items: {
    productId: string;
    productName: string;
    weightLabel: string;
    qty: number;
  }[];
}

export interface RewardTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
  rating: number;
  activeOrdersCount: number;
  status: 'Available' | 'On Delivery' | 'Offline';
  currentLocation?: { lat: number; lng: number; areaName: string };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Inventory Staff' | 'Support Staff' | 'Delivery Manager';
  department: string;
  status: 'Active' | 'Suspended';
}

export interface AuditLog {
  id: string;
  performedBy: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
}

