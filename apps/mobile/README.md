# IGO Protein Cuts — Customer Mobile App

Flutter customer app for the IGO Protein Cuts delivery platform. Targets Android, iOS and Windows.

Part of a monorepo — read the [root README](../../README.md) first, especially the note about there being two separate backends.

## Run it

```bash
flutter pub get && flutter run
```

Supabase credentials are compiled in from `lib/utils/supabase_config.dart` (project `aweevhgn…`, shared with `apps/admin`). There is no `.env` step. Authentication is real Supabase Auth — email and password.

## Layout

```
lib/
  main.dart          Supabase init, theme (light + dark), named routes
  features/          17 feature modules, each domain/ + data/ + presentation/
  screens/           Pre-refactor screens: splash, login, signup, home, order success
  services/          Singleton services shared across features
  models/            Cross-feature entities (product, cart item, order status, …)
  shared/            Providers and widgets used by more than one feature
  utils/             Colors, formatters, Supabase config
  widgets/           Generic UI primitives
```

Newer features follow a clean-architecture split — `domain/` holds entities and repository interfaces, `data/` the Supabase-backed implementations, `presentation/` the Riverpod providers, screens and widgets. `screens/` and `services/` are the older flat layout that predates it; both are live.

## Features

17 modules across 49 screens: product discovery with filter and sort, product detail with nutrition facts and reviews, cart with coupons, multi-step checkout, address management with geolocation, order history, live order tracking, PDF invoices, subscriptions, loyalty tiers and wallet, offers and combo packs, support tickets with FAQs, wishlist, notification centre, and profile settings.

## Known gaps

- **Cash on Delivery is the only working payment method.** `RazorpayPaymentGateway` in `lib/services/payment_gateway.dart` throws `UnimplementedError` — the interface is ready, no API key is configured.
- `lib/services/admin_service.dart` is a complete typed client for the `admin-*` Edge Functions but is unused; `apps/admin` supersedes it. The only admin surface here is the product-photo upload screen.
- No store release and no CI pipeline. Tests are the default generated file only.

## Backend

Schema and Edge Functions live at the repo root in [`supabase/`](../../supabase), shared with `apps/admin`. Privileged writes go through Edge Functions; this app only reads its own rows via RLS.
