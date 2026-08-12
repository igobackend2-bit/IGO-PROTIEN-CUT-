import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/navigation/nav_item.dart';
import '../core/permissions/permissions_controller.dart';
import '../core/utils/responsive.dart';
import '../core/widgets/sidebar.dart';
import '../core/widgets/top_bar.dart';
import '../features/auth/presentation/auth_providers.dart';

/// Responsive authenticated-area shell: full sidebar on desktop, a
/// collapsed icon rail on tablet, a drawer on compact widths. Wraps every
/// route inside the router's ShellRoute.
class AdminShell extends ConsumerWidget {
  final Widget child;

  const AdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final permissions = ref.watch(permissionsControllerProvider).value ?? const <String>{};
    final visibleItems = navItems.where((i) => permissions.any(i.anyOfPermissions.contains)).toList();
    final currentRoute = GoRouterState.of(context).matchedLocation;
    final matchingItems = visibleItems.where((i) => i.route == currentRoute);
    final currentTitle = matchingItems.isEmpty ? 'Protein Cuts Admin' : matchingItems.first.label;
    final userEmail = ref.watch(authRepositoryProvider).currentUser?.email;
    final size = Responsive.sizeOf(context);

    Future<void> logout() async {
      await ref.read(authRepositoryProvider).signOut();
      if (context.mounted) context.go('/login');
    }

    if (size == ScreenSize.compact) {
      return Scaffold(
        appBar: TopBar(title: currentTitle, userEmail: userEmail, onLogout: logout),
        drawer: Drawer(
          child: Sidebar(items: visibleItems, currentRoute: currentRoute, extended: true),
        ),
        body: child,
      );
    }

    final extended = size == ScreenSize.desktop;
    return Scaffold(
      body: Row(
        children: [
          Sidebar(items: visibleItems, currentRoute: currentRoute, extended: extended),
          Expanded(
            child: Column(
              children: [
                TopBar(title: currentTitle, userEmail: userEmail, onLogout: logout),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: child,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
