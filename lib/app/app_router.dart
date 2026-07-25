import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/providers/core_providers.dart';
import '../core/router/refresh_stream.dart';
import '../core/router/route_paths.dart';
import '../features/analytics/presentation/screens/analytics_screen.dart';
import '../features/auth/presentation/auth_providers.dart';
import '../features/auth/presentation/screens/forgot_password_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/coupons/presentation/screens/coupons_screen.dart';
import '../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../features/delivery/presentation/screens/delivery_screen.dart';
import '../features/inventory/presentation/screens/inventory_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../features/orders/presentation/screens/orders_screen.dart';
import '../features/products/presentation/screens/products_screen.dart';
import '../features/reports/presentation/screens/reports_screen.dart';
import '../features/roles/presentation/screens/roles_screen.dart';
import '../features/support/presentation/screens/support_screen.dart';
import '../features/users/presentation/screens/users_screen.dart';
import 'admin_shell.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: RoutePaths.dashboard,
    refreshListenable: GoRouterRefreshStream(
      ref.watch(supabaseClientProvider).auth.onAuthStateChange,
    ),
    redirect: (context, state) async {
      final loggingIn = state.matchedLocation == RoutePaths.login ||
          state.matchedLocation == RoutePaths.forgotPassword;
      final authRepo = ref.read(authRepositoryProvider);
      final user = authRepo.currentUser;

      if (user == null) {
        return loggingIn ? null : RoutePaths.login;
      }

      final membership = await ref.read(ownMembershipProvider.future);
      if (membership == null || !membership.isActive) {
        await authRepo.signOut();
        return RoutePaths.login;
      }

      return loggingIn ? RoutePaths.dashboard : null;
    },
    routes: [
      GoRoute(path: RoutePaths.login, builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: RoutePaths.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => AdminShell(child: child),
        routes: [
          GoRoute(path: RoutePaths.dashboard, builder: (context, state) => const DashboardScreen()),
          GoRoute(path: RoutePaths.products, builder: (context, state) => const ProductsScreen()),
          GoRoute(path: RoutePaths.inventory, builder: (context, state) => const InventoryScreen()),
          GoRoute(path: RoutePaths.orders, builder: (context, state) => const OrdersScreen()),
          GoRoute(path: RoutePaths.delivery, builder: (context, state) => const DeliveryScreen()),
          GoRoute(path: RoutePaths.users, builder: (context, state) => const UsersScreen()),
          GoRoute(path: RoutePaths.support, builder: (context, state) => const SupportScreen()),
          GoRoute(path: RoutePaths.coupons, builder: (context, state) => const CouponsScreen()),
          GoRoute(path: RoutePaths.notifications, builder: (context, state) => const NotificationsScreen()),
          GoRoute(path: RoutePaths.analytics, builder: (context, state) => const AnalyticsScreen()),
          GoRoute(path: RoutePaths.reports, builder: (context, state) => const ReportsScreen()),
          GoRoute(path: RoutePaths.roles, builder: (context, state) => const RolesScreen()),
        ],
      ),
    ],
  );
});
