// Real delivery-serviceability check for the pincode checkers on the
// homepage hero (HomePage.tsx) and the navbar "Deliver to" picker
// (Navbar.tsx). Both previously accepted *any* 6-digit string and always
// said "we deliver" — this gives them a real, shared list to check against
// instead of just validating string length.
//
// IGO Protein Cuts currently operates out of Bengaluru (HQ: 100 Feet Road,
// Indiranagar, Bengaluru, KA 560038 — see ContactPage.tsx), so serviceable
// pincodes are the real Bengaluru postal codes below. Extend this list (or
// swap it for a live `igo_serviceable_pincodes` table) as delivery zones
// expand to new cities — that's a website-owned concern, not admin data.
export const SERVICEABLE_PINCODES: readonly string[] = [
  '560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008',
  '560009', '560010', '560011', '560017', '560018', '560019', '560020', '560021',
  '560022', '560025', '560027', '560029', '560030', '560033', '560034', '560035',
  '560037', '560038', '560040', '560041', '560042', '560043', '560046', '560047',
  '560048', '560051', '560052', '560055', '560066', '560068', '560069', '560070',
  '560071', '560075', '560076', '560078', '560079', '560080', '560082', '560083',
  '560085', '560087', '560091', '560092', '560093', '560094', '560095', '560096',
  '560097', '560100', '560102', '560103'
];

export function isValidPincodeFormat(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function isPincodeServiceable(pincode: string): boolean {
  const trimmed = pincode.trim();
  return isValidPincodeFormat(trimmed) && SERVICEABLE_PINCODES.includes(trimmed);
}
