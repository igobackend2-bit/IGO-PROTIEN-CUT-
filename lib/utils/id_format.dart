/// Shortens a Supabase uuid primary key into a compact, human-friendly
/// display id (e.g. "A1B2C3D4") for anywhere a full 36-character uuid would
/// otherwise be shown inline as an order/payment reference.
String shortId(String id) => (id.length >= 8 ? id.substring(0, 8) : id).toUpperCase();
