/// Mirrors `STORE_LOCATION` in `supabase/functions/_shared/geo.ts` — this
/// project has one fulfillment location today, so both the client-side map
/// preview and the server-side ETA math point at the same constant. Keep
/// them in sync if the pickup point ever changes; Dart can't import the
/// Deno Edge Function source directly, hence the duplication.
class StoreLocation {
  static const double lat = 12.7969;
  static const double lng = 80.2467;
}
