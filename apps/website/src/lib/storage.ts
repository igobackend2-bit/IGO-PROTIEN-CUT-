import { Product, Order, FranchiseLead, Coupon, UserProfile, CartItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, DEFAULT_USER_PROFILE } from '../data/mockData';
import { fetchCatalog, fetchCoupons, submitLead } from './api/catalog';
import {
  fetchMyOrders,
  placeOrder as placeOrderApi,
  cancelOrder as cancelOrderApi,
  WebsiteOrderSummary
} from './api/orders';
import { fetchWishlistIds, addWishlistItemRemote, removeWishlistItemRemote } from './api/wishlist';
import { isSupabaseConfigured } from './supabase';

/**
 * CATALOG SOURCE SWITCH
 *
 * 'supabase' (default) — the catalog comes from the canonical, ADMIN-OWNED
 *   `products` table. Editing a price, toggling availability or changing stock
 *   in the Flutter admin dashboard changes the website.
 * 'local' — the old behaviour: the 83 hardcoded products in mockData.ts.
 *
 * Set VITE_CATALOG_SOURCE=local in .env to roll back instantly without a code
 * change, e.g. if the live catalog turns out to be incomplete.
 */
const CATALOG_SOURCE = (import.meta.env.VITE_CATALOG_SOURCE as string) || 'supabase';
const useRemoteCatalog = CATALOG_SOURCE !== 'local' && isSupabaseConfigured;

const PRODUCTS_KEY = 'protein_cuts_products_v2';
// Separate key for the Supabase-backed catalog so switching VITE_CATALOG_SOURCE
// never mixes remote rows with the old locally-seeded copy.
const REMOTE_PRODUCTS_KEY = 'protein_cuts_catalog_v1';
const ORDERS_KEY = 'protein_cuts_orders_v1';
const CART_KEY = 'protein_cuts_cart_v1';
const LEADS_KEY = 'protein_cuts_leads_v1';
const COUPONS_KEY = 'protein_cuts_coupons_v1';
const USER_KEY = 'protein_cuts_user_v1';
const WISHLIST_KEY = 'protein_cuts_wishlist_v1';
const GIFT_NOTE_KEY = 'protein_cuts_gift_note_v1';
const RECENTLY_VIEWED_KEY = 'protein_cuts_recently_viewed_v1';

/**
 * Converts a canonical order row into the website's richer `Order` shape.
 *
 * Kept outside the class so it stays a pure function — it is the one place
 * that knows how a database order becomes a UI order, and it's the natural
 * first thing to unit-test.
 */
function mapRemoteOrder(o: WebsiteOrderSummary, catalogById: Map<string, Product>): Order {
  const items: CartItem[] = o.items.map((line) => {
    const product = line.productId ? catalogById.get(line.productId) : undefined;

    if (product) {
      // Match the weight option whose price equals what was actually charged,
      // so historical orders keep showing the weight the customer bought even
      // if the ladder has changed since.
      const selectedWeight =
        product.weightOptions.find((w) => w.price === line.price) ?? product.weightOptions[0];
      return { product, selectedWeight, quantity: line.quantity };
    }

    // Product no longer in the catalog — render what the order itself recorded
    // rather than dropping the line.
    const stub: Product = {
      id: line.productId ?? 'unknown',
      name: line.name,
      category: 'healthy-addons',
      subcategory: '',
      description: '',
      shortDescription: '',
      basePrice: line.price,
      originalPrice: line.price,
      discountPercentage: 0,
      image: line.imageUrl ?? '',
      galleryImages: line.imageUrl ? [line.imageUrl] : [],
      weightOptions: [
        {
          label: '—',
          weightGrams: 0,
          price: line.price,
          originalPrice: line.price,
          servings: ''
        }
      ],
      nutrition: { protein: '—', calories: '—', fat: '—', carbs: '—' },
      freshnessGrade: 'Chilled 0-4°C',
      boneType: 'With Bone',
      stockStatus: 'Out of Stock',
      stockQuantity: 0,
      rating: 0,
      reviewCount: 0,
      prepTimeMinutes: 0,
      storageInstructions: '',
      reviews: []
    };
    return { product: stub, selectedWeight: stub.weightOptions[0], quantity: line.quantity };
  });

  const subtotal = items.reduce((sum, i) => sum + i.selectedWeight.price * i.quantity, 0);

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    customerName: o.address?.name ?? '',
    customerEmail: '',
    customerPhone: o.address?.phone ?? '',
    shippingAddress: {
      id: o.id,
      type: 'Home',
      name: o.address?.name ?? '',
      phone: o.address?.phone ?? '',
      flatNo: '',
      street: o.address?.line ?? '',
      landmark: '',
      pincode: o.address?.pincode ?? '',
      city: o.address?.city ?? '',
      fullAddress: o.address?.line ?? ''
    },
    items,
    subtotal,
    discountAmount: o.discountAmount,
    deliveryFee: o.deliveryFee,
    tax: o.tax,
    totalAmount: o.totalAmount,
    paymentMethod: (o.paymentMethod as Order['paymentMethod']) ?? 'Cash on Delivery',
    paymentStatus: o.status === 'Delivered' ? 'Paid' : 'Pending',
    status: o.status,
    deliverySlot: o.deliverySlot ?? '',
    trackingStep: o.trackingStep,
    // The delivery OTP is issued by the app's own delivery flow. Only surface
    // it; never generate one. Rider name/phone/vehicle now come from the real
    // `delivery_partners` join (orders.ts) instead of a hard-coded placeholder.
    ...(o.deliveryOtp
      ? {
          driverDetails: {
            name: o.deliveryPartner?.name ?? 'Assigned rider',
            phone: o.deliveryPartner?.phone ?? '',
            vehicleNo: o.deliveryPartner?.vehicleNo ?? '',
            rating: o.deliveryPartner?.rating ?? 0,
            otp: o.deliveryOtp
          }
        }
      : {})
  };
}

export class StoreService {
  // PRODUCTS
  //
  // getProducts() stays SYNCHRONOUS on purpose — it has ~20 call sites,
  // including React useState initialisers. It returns the best copy available
  // right now (the cached remote catalog, else the bundled seed data), and
  // `hydrateCatalog()` refreshes that cache in the background and fires
  // 'protein_cuts_products_updated' so the UI re-renders. Classic
  // stale-while-revalidate: no call site had to change, and a Supabase outage
  // degrades to the last good catalog instead of an empty shop.
  static getProducts(): Product[] {
    if (useRemoteCatalog) {
      try {
        const cached = localStorage.getItem(REMOTE_PRODUCTS_KEY);
        if (cached) {
          const parsed: Product[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // Corrupt cache — fall through to the bundled seed data below.
      }
      // First visit, before hydrateCatalog() resolves. Showing the seed
      // catalog beats showing nothing; it is replaced moments later.
      return INITIAL_PRODUCTS;
    }

    return this.getLocalProducts();
  }

  /**
   * Fetches the live catalog from the canonical, admin-owned `products` table
   * and caches it. Call once on app start. Safe to call repeatedly.
   *
   * Returns the products on success, or null if the remote catalog was
   * unavailable (in which case the cached/seed catalog stays in place).
   */
  static async hydrateCatalog(): Promise<Product[] | null> {
    if (!useRemoteCatalog) return null;

    const products = await fetchCatalog();

    // null = backend unreachable or query failed -> keep what we have.
    // [] = the query worked but the catalog is genuinely empty; treat that as
    // suspicious rather than wiping the shop, and keep the fallback.
    if (!products || products.length === 0) {
      if (products && products.length === 0) {
        console.warn(
          '[catalog] The products table returned zero rows. Keeping the local catalog. ' +
            'Add products via the admin dashboard, or set VITE_CATALOG_SOURCE=local.'
        );
      }
      return null;
    }

    try {
      localStorage.setItem(REMOTE_PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // Quota exceeded — the in-memory copy still reaches the UI below.
    }
    window.dispatchEvent(new Event('protein_cuts_products_updated'));
    return products;
  }

  /** The original bundled-seed behaviour, used when VITE_CATALOG_SOURCE=local. */
  private static getLocalProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      if (data) {
        const stored: Product[] = JSON.parse(data);
        // Catalog products (anything with an id that exists in mockData.ts)
        // always take the CURRENT mockData.ts values — name, image, price,
        // everything. Previously this only added brand-new products missing
        // from a browser's cached copy, but left existing ones frozen at
        // whatever they looked like on a user's first visit, so any later
        // edit here (a new banner photo, a price change) silently never
        // reached anyone who'd already been to the site. Only products NOT
        // in mockData.ts at all (something created at runtime, e.g. via the
        // admin dashboard) are preserved from the cached copy.
        const initialIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
        const customExtras = stored.filter((p) => !initialIds.has(p.id));
        const merged = [...INITIAL_PRODUCTS, ...customExtras];
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch {
      // fallback
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  static saveProducts(products: Product[]): void {
    if (useRemoteCatalog) {
      // The `products` table is owned by the Flutter admin dashboard. The
      // website is a read-only consumer of it, so a local write here would
      // only create a copy that silently diverges from what the admin shows.
      console.warn(
        '[catalog] saveProducts() ignored — products are managed in the admin dashboard.'
      );
      return;
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('protein_cuts_products_updated'));
  }

  static updateProduct(product: Product): Product[] {
    if (useRemoteCatalog) {
      console.warn(
        '[catalog] updateProduct() ignored — edit this product in the admin dashboard instead.'
      );
      return this.getProducts();
    }
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.unshift(product);
    }
    this.saveProducts(products);
    return products;
  }

  static deleteProduct(productId: string): Product[] {
    if (useRemoteCatalog) {
      console.warn(
        '[catalog] deleteProduct() ignored — delete this product in the admin dashboard instead.'
      );
      return this.getProducts();
    }
    const products = this.getProducts().filter((p) => p.id !== productId);
    this.saveProducts(products);
    return products;
  }

  // ORDERS
  static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [
      {
        id: 'ord-1001',
        orderNumber: 'PC-2026-9812',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        customerName: 'Anand Kumar',
        customerEmail: 'anand@example.com',
        customerPhone: '+91 98765 43210',
        shippingAddress: DEFAULT_USER_PROFILE.addresses[0],
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            selectedWeight: INITIAL_PRODUCTS[0].weightOptions[0],
            quantity: 1
          },
          {
            product: INITIAL_PRODUCTS[1],
            selectedWeight: INITIAL_PRODUCTS[1].weightOptions[0],
            quantity: 2
          }
        ],
        subtotal: 687,
        discountAmount: 100,
        deliveryFee: 0,
        tax: 30,
        totalAmount: 617,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        status: 'Out for Express Delivery',
        deliverySlot: 'Express 30 Mins',
        trackingStep: 3,
        driverDetails: {
          name: 'Ramesh Rider',
          phone: '+91 91234 56789',
          vehicleNo: 'KA-01-EV-4092',
          rating: 4.9,
          otp: '4892'
        }
      }
    ];
  }

  static saveOrders(orders: Order[]): void {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('protein_cuts_orders_updated'));
  }

  /**
   * Pulls the signed-in customer's real orders from the canonical `orders`
   * table — the SAME table the mobile app writes to and the admin dashboard
   * manages — and caches them in the shape the existing UI already renders.
   *
   * Same stale-while-revalidate pattern as the catalog, so `getOrders()` stays
   * synchronous and none of its call sites had to change.
   *
   * Returns null when there's no backend or no signed-in user, in which case
   * the cached/demo orders stay on screen.
   */
  static async hydrateOrders(): Promise<Order[] | null> {
    if (!useRemoteCatalog) return null;

    const remote = await fetchMyOrders();
    if (!remote) return null;

    // Look up full Product objects from the cached catalog so order lines keep
    // their images, weights and names. Falls back to a minimal stub for a
    // product that has since been deleted from the catalog.
    const catalog = this.getProducts();
    const byId = new Map(catalog.map((p) => [p.id, p]));

    const mapped: Order[] = remote.map((o) => mapRemoteOrder(o, byId));

    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(mapped));
    } catch {
      // Quota exceeded — the in-memory copy still reaches the UI.
    }
    window.dispatchEvent(new Event('protein_cuts_orders_updated'));
    return mapped;
  }

  /**
   * Places an order against the CANONICAL `orders` / `order_items` /
   * `addresses` / `payments` tables, using the signed-in customer's own
   * session — the same path lib/services/order_service.dart takes in the
   * mobile app. The order therefore shows up in the admin dashboard's Orders
   * screen immediately, assignable and refundable.
   *
   * Returns `{ ok: false, error }` on failure. This is the important
   * behavioural change from the old `placeOrder()`, which fired a
   * `fetch('/api/orders')` it never awaited and reported success regardless —
   * so a failed write silently lost the order while the customer saw a
   * confirmation screen.
   */
  static async placeOrderRemote(
    newOrder: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingStep'>,
    couponCode?: string | null
  ): Promise<{ ok: boolean; order?: Order; error?: string }> {
    if (!useRemoteCatalog) {
      // Local/demo mode (VITE_CATALOG_SOURCE=local, or Supabase not
      // configured) skips the real backend entirely — so unlike the remote
      // path below, it has no RLS to fall back on for enforcing "only a
      // signed-in customer can place an order". The cart page's own UI gate
      // (CartPage.tsx goToStep) already checks this before a guest can even
      // reach checkout, but that's a client-side check only; this repeats it
      // here so the guarantee holds even if this function is ever called
      // from anywhere that skips that UI gate.
      if (!this.isLoggedIn()) {
        return { ok: false, error: 'Please sign in to place an order.' };
      }
      // Local/demo mode — keep the original optimistic behaviour.
      return { ok: true, order: this.placeOrder(newOrder) };
    }

    const result = await placeOrderApi({
      items: newOrder.items,
      shippingAddress: newOrder.shippingAddress,
      subtotal: newOrder.subtotal,
      discountAmount: newOrder.discountAmount,
      deliveryFee: newOrder.deliveryFee,
      tax: newOrder.tax,
      totalAmount: newOrder.totalAmount,
      paymentMethod: newOrder.paymentMethod,
      paymentStatus: newOrder.paymentStatus,
      deliverySlot: newOrder.deliverySlot,
      couponCode: couponCode ?? null
    });

    if (!result.ok || !result.orderId) {
      return { ok: false, error: result.error ?? 'Could not place your order. Please try again.' };
    }

    const order: Order = {
      ...newOrder,
      id: result.orderId,
      orderNumber: result.orderId.slice(0, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      trackingStep: 1
    };

    // Refresh the cached list so My Orders shows it straight away.
    this.hydrateOrders().catch(() => {});

    return { ok: true, order };
  }

  /** @deprecated Local-only. Use `placeOrderRemote()` — it reports failures. */
  static placeOrder(newOrder: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingStep'>): Order {
    const orders = this.getOrders();
    const orderNum = `PC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder: Order = {
      ...newOrder,
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      trackingStep: 1,
      driverDetails: {
        name: 'Suresh Express',
        phone: '+91 98888 77777',
        vehicleNo: 'KA-05-EV-1029',
        rating: 4.95,
        otp: `${Math.floor(1000 + Math.random() * 9000)}`
      }
    };
    orders.unshift(fullOrder);
    this.saveOrders(orders);

    // No server call here any more. Real orders go straight to the canonical
    // `orders` table via placeOrderRemote(); the old fire-and-forget
    // fetch('/api/orders') would 404 on Vercel, where the Express server in
    // server.ts doesn't run.
    return fullOrder;
  }

  static updateOrderStatus(orderId: string, status: Order['status']): Order[] {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = status;
      if (status === 'Placed') orders[idx].trackingStep = 1;
      if (status === 'Freshly Cut') orders[idx].trackingStep = 2;
      if (status === 'Quality Passed') orders[idx].trackingStep = 2;
      if (status === 'Out for Express Delivery') orders[idx].trackingStep = 3;
      if (status === 'Delivered') orders[idx].trackingStep = 4;
      this.saveOrders(orders);

      // Order status is owned by the admin dashboard, which writes it directly
      // to the canonical `orders` table. The only status change a customer may
      // make is cancelling their own order, which goes through
      // cancelOrder() in src/lib/api/orders.ts. This local update is just the
      // optimistic UI echo.
      if (status === 'Cancelled' && useRemoteCatalog) {
        void cancelOrderApi(orderId, 'Cancelled by customer').then((res) => {
          if (res.ok) {
            void this.hydrateOrders();
          } else {
            console.error('[orders] cancel failed:', res.error);
          }
        });
      }
    }
    return orders;
  }

  // FRANCHISE LEADS
  static getLeads(): FranchiseLead[] {
    try {
      const data = localStorage.getItem(LEADS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [
      {
        id: 'f-1',
        fullName: 'Rajesh Malhotra',
        email: 'rajesh@retailgroup.in',
        phone: '+91 98200 11223',
        city: 'Hyderabad',
        state: 'Telangana',
        budget: '₹25 Lakhs - ₹35 Lakhs',
        preferredLocation: 'Gachibowli Main Road',
        experience: '5+ years Food & Grocery Franchisee',
        createdAt: new Date().toISOString(),
        status: 'In Discussion'
      }
    ];
  }

  static addLead(lead: Omit<FranchiseLead, 'id' | 'createdAt' | 'status'>): FranchiseLead {
    const leads = this.getLeads();
    const newLead: FranchiseLead = {
      ...lead,
      id: `f-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'New'
    };
    leads.unshift(newLead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    window.dispatchEvent(new Event('protein_cuts_leads_updated'));

    // Persist to the website-owned `igo_leads` table so an enquiry survives
    // the browser it was typed in. Insert is open to anyone (it's a public
    // contact form); reading leads back requires an active admin account.
    // Fire-and-forget is acceptable here and only here: the local copy is
    // already saved and the customer's next step doesn't depend on the write.
    submitLead({
      leadType: 'franchise',
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      state: lead.state,
      budget: lead.budget,
      preferredLocation: lead.preferredLocation,
      experience: lead.experience
    }).catch(() => {
      // Non-fatal — the lead is still in localStorage for recovery.
    });

    return newLead;
  }

  // CART
  static getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  }

  static saveCart(cart: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('protein_cuts_cart_updated'));
  }

  // GIFT NOTE — an optional personalized message attached to the current
  // cart when a gift box is added from the Gifting page. Cleared once the
  // cart itself is emptied (see CartPage) so stale notes don't linger.
  static getGiftNote(): { recipientName: string; message: string } | null {
    try {
      const data = localStorage.getItem(GIFT_NOTE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  }

  static saveGiftNote(note: { recipientName: string; message: string }): void {
    localStorage.setItem(GIFT_NOTE_KEY, JSON.stringify(note));
    window.dispatchEvent(new Event('protein_cuts_cart_updated'));
  }

  static clearGiftNote(): void {
    localStorage.removeItem(GIFT_NOTE_KEY);
    window.dispatchEvent(new Event('protein_cuts_cart_updated'));
  }

  // WISHLIST
  //
  // localStorage stays the synchronous, always-available cache (never the
  // source of truth, per CLAUDE.md rule #4) — every existing call site keeps
  // calling getWishlist()/toggleWishlist() exactly as before. When signed
  // in, toggleWishlist() also fires a background sync to the canonical
  // `wishlist_items` table so the wishlist survives clearing site data and
  // matches across the app/website. hydrateWishlist() (called once on app
  // start / auth change, like hydrateCatalog()) pulls the authoritative
  // server list down and merges it into the cache.
  static getWishlist(): string[] {
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // A first-time visitor (nothing in localStorage yet) has an empty
    // wishlist — full stop. This used to fall back to two hard-coded fake
    // ids ('chk-01', 'fsh-01') left over from old mockData.ts, which don't
    // exist in the real product catalog. That's exactly this bug: the navbar
    // badge counted them (wishlist.length === 2) while the Wishlist page
    // correctly filtered them out (no matching real product), showing 0.
    return [];
  }

  static toggleWishlist(productId: string): string[] {
    let list = this.getWishlist();
    const wasWishlisted = list.includes(productId);
    if (wasWishlisted) {
      list = list.filter((id) => id !== productId);
    } else {
      list.push(productId);
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('protein_cuts_wishlist_updated'));

    // Best-effort background sync — never blocks the UI, silently no-ops
    // when signed out (see addWishlistItemRemote/removeWishlistItemRemote).
    if (isSupabaseConfigured) {
      const sync = wasWishlisted ? removeWishlistItemRemote(productId) : addWishlistItemRemote(productId);
      sync.catch(() => {});
    }

    return list;
  }

  /**
   * Pulls the signed-in customer's real wishlist from `wishlist_items` and
   * merges it into the local cache (union of both, so nothing wishlisted
   * offline is lost). No-ops when signed out or Supabase isn't configured.
   */
  static async hydrateWishlist(): Promise<void> {
    const remoteIds = await fetchWishlistIds();
    if (!remoteIds) return; // not signed in, or unreachable — keep the local cache as-is

    const localIds = this.getWishlist();
    const merged = Array.from(new Set([...localIds, ...remoteIds]));

    // Anything only in the local cache (added while offline / before this
    // sync existed) still needs pushing up so it's not lost server-side.
    const onlyLocal = localIds.filter((id) => !remoteIds.includes(id));
    onlyLocal.forEach((id) => addWishlistItemRemote(id).catch(() => {}));

    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(merged));
    } catch {
      // Quota exceeded — the in-memory merge still reaches listeners below.
    }
    window.dispatchEvent(new Event('protein_cuts_wishlist_updated'));
  }

  // RECENTLY VIEWED — genuinely tracks the products a shopper has opened,
  // most-recent-first, deduplicated, capped at 12. No fabricated activity.
  static getRecentlyViewed(): string[] {
    try {
      const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  }

  static addRecentlyViewed(productId: string): void {
    try {
      const list = this.getRecentlyViewed().filter((id) => id !== productId);
      list.unshift(productId);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list.slice(0, 12)));
    } catch {
      // localStorage unavailable — recently-viewed simply won't persist
    }
  }

  // USER PROFILE
  static isLoggedIn(): boolean {
    return (
      localStorage.getItem('protein_cuts_is_logged_in') === 'true' ||
      sessionStorage.getItem('protein_cuts_is_logged_in') === 'true'
    );
  }

  // `remember` controls whether the login survives closing the browser
  // (localStorage, the default) or only lasts for this tab session
  // (sessionStorage) — real behavior behind the login page's "Remember Me"
  // checkbox, not a decorative toggle.
  static setLoggedIn(status: boolean, remember: boolean = true): void {
    const primary = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    primary.setItem('protein_cuts_is_logged_in', status ? 'true' : 'false');
    other.removeItem('protein_cuts_is_logged_in');
    window.dispatchEvent(new Event('protein_cuts_user_updated'));
  }

  static getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(USER_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
    return DEFAULT_USER_PROFILE;
  }

  static assignDeliveryPartner(orderId: string, partnerName: string): Order[] {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].deliveryPartnerName = partnerName;
      if (!orders[idx].driverDetails) {
        orders[idx].driverDetails = {
          name: partnerName,
          phone: '+91 98000 11122',
          vehicleNo: 'KA-01-EV-3001',
          rating: 4.9,
          otp: '1234'
        };
      } else {
        orders[idx].driverDetails.name = partnerName;
      }
      this.saveOrders(orders);

      // No server call. Delivery assignment belongs to the admin dashboard —
      // it writes `orders.delivery_partner_id` and creates the matching
      // delivery_assignments row through the admin-delivery Edge Function.
      // The website must never assign a rider; this method only exists for
      // local demo mode.
    }
    return orders;
  }

  static saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('protein_cuts_user_updated'));
  }

  static updateUserProfile(profile: UserProfile): void {
    this.saveUserProfile(profile);
  }

  static addWalletFunds(amount: number): UserProfile {
    const profile = this.getUserProfile();
    const updated: UserProfile = {
      ...profile,
      walletBalance: (profile.walletBalance || 0) + amount,
      IGOWalletBalance: (profile.IGOWalletBalance || 0) + amount
    };
    this.saveUserProfile(updated);
    return updated;
  }

  // COUPONS
  //
  // Same stale-while-revalidate shape as the catalog: synchronous read from
  // cache, refreshed by hydrateCoupons(). The canonical `coupons` table is
  // owned by the admin dashboard — the website only displays and validates.
  static getCoupons(): Coupon[] {
    try {
      const data = localStorage.getItem(COUPONS_KEY);
      if (data) {
        const parsed: Coupon[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    if (!useRemoteCatalog) {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(INITIAL_COUPONS));
    }
    return INITIAL_COUPONS;
  }

  /** Refreshes the coupon cache from the admin-owned `coupons` table. */
  static async hydrateCoupons(): Promise<Coupon[] | null> {
    if (!useRemoteCatalog) return null;
    const coupons = await fetchCoupons();
    if (!coupons) return null;
    try {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    } catch {
      // Quota exceeded — non-fatal.
    }
    window.dispatchEvent(new Event('protein_cuts_coupons_updated'));
    return coupons;
  }
}
