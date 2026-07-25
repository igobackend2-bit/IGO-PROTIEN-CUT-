# IGO Protein Cuts — Admin Dashboard

Internal operations dashboard, built as a Flutter Web app. Riverpod 3 for state, go_router for routing, `fl_chart` for charts, `data_table_2` for tables.

Part of a monorepo — read the [root README](../../README.md) first, especially the note about there being two separate backends.

## Run it

```bash
flutter pub get && flutter run -d chrome
```

Logging in needs a real Supabase Auth user **and** an active row for that user in `admin_users`. Without the membership row the router signs you out and returns you to `/login`. Create it in Supabase first.

Supabase credentials are compiled in from `lib/core/config/supabase_config.dart` (project `aweevhgn…`, shared with `apps/mobile`).

## How it talks to the backend

Every read and write goes through the `admin-*` Edge Functions — this app never queries tables directly. All ten functions share one contract (`POST {action, ...params}` → JSON or `{error}`), so there is exactly one call site for requests and error handling: `lib/core/network/edge_function_client.dart`. Feature datasources go through it and never touch `functions.invoke` themselves.

Authorization is server-side. The `admin_has_permission` RPC is the source of truth for the 17 permission codes listed in `lib/core/permissions/permission_codes.dart`; the app asks about each one at login and uses the answers only to hide nav items and gate screens. Nothing is trusted from the client.

## Layout

```
lib/
  app/          App root, router, and the sidebar/top-bar shell
  core/         Config, theme, Edge Function client, permissions, shared widgets
  features/     One folder per screen, each domain/ + data/ + presentation/
```

## Screens

Dashboard (fans out to eight Edge Functions in parallel for its summary), Products and Categories, Inventory with stock adjustment and history, Orders with detail dialogs, Delivery partners and assignments with live status, Users, Support tickets and FAQs, Coupons/Offers/Combo packs, Notifications, Analytics, Reports with CSV export, and Roles.

Every screen reads live data. Unlike the React admin panel in `apps/website`, nothing here is a hardcoded placeholder.

## Deploy

Deploys to Vercel via `vercel.json` — set the Vercel project's **Root Directory** to `apps/admin`. The build clones the Flutter SDK inline (Vercel has no Flutter runtime), then runs `flutter build web --release` into `build/web`.

## Known gaps

No automated tests beyond the default generated file.
