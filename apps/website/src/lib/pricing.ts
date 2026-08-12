// Shared bulk/wholesale pricing tiers — used identically on the Product Detail
// Page (as a preview) and in the Cart (as the actual applied discount), so the
// price a customer previews always matches what they're charged.
//
// Rewards higher-volume buyers (gym users buying in bulk, daily buyers,
// families) the way ZappFresh's "Bulk" category and FreshToHome's combo
// pricing do.

export interface BulkTier {
  minQty: number;
  label: string;
  discountPct: number;
}

export const BULK_TIERS: BulkTier[] = [
  { minQty: 1, label: '1-2 units', discountPct: 0 },
  { minQty: 3, label: '3-5 units', discountPct: 5 },
  { minQty: 6, label: '6-9 units', discountPct: 10 },
  { minQty: 10, label: '10+ units', discountPct: 15 }
];

export function getActiveBulkTier(quantity: number): BulkTier {
  return [...BULK_TIERS].reverse().find((t) => quantity >= t.minQty) || BULK_TIERS[0];
}

/** Unit price after applying the bulk tier discount for this quantity. */
export function getBulkUnitPrice(basePrice: number, quantity: number): number {
  const tier = getActiveBulkTier(quantity);
  return Math.round(basePrice * (1 - tier.discountPct / 100));
}

/** Total line price (unit price x quantity) after bulk discount. */
export function getBulkLineTotal(basePrice: number, quantity: number): number {
  return getBulkUnitPrice(basePrice, quantity) * quantity;
}
