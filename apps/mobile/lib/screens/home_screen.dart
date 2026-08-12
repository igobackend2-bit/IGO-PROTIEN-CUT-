import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/app_colors.dart';
import '../features/cart/presentation/providers/cart_providers.dart';
import '../features/cart/presentation/screens/cart_screen.dart';
import '../features/home/presentation/screens/home_tab_screen.dart';
import '../features/notifications/presentation/widgets/notification_toast_listener.dart';
import '../features/orders/presentation/screens/orders_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/subscriptions/presentation/widgets/subscription_processor_runner.dart';

/// Bottom-nav shell: Home / Search / Cart / Orders / Profile.
/// Home tab content lives in features/home; Cart tab reuses the existing
/// features/cart CartScreen as-is (same widget the /cart route already
/// pushes from Wishlist/Product Detail/Order Detail — no duplicate
/// implementation); Orders tab lives in features/orders (Phase 8); Profile
/// tab lives in features/profile (Phase 10) — Search is unchanged.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  bool _isInit = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is int) {
        _selectedIndex = args;
      }
      _isInit = false;
    }
  }

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.home_rounded, label: 'Home'),
    _NavItem(icon: Icons.search_rounded, label: 'Search'),
    _NavItem(icon: Icons.shopping_cart_rounded, label: 'Cart', showsCartBadge: true),
    _NavItem(icon: Icons.shopping_bag_rounded, label: 'Orders'),
    _NavItem(icon: Icons.person_rounded, label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return SubscriptionProcessorRunner(
      child: NotificationToastListener(
        child: Scaffold(
          backgroundColor: AppColors.background,
          body: IndexedStack(
            index: _selectedIndex,
            children: [
              const HomeTabScreen(),
              _buildSearchTab(),
              const CartScreen(),
              const OrdersScreen(),
              const ProfileScreen(),
            ],
          ),
          bottomNavigationBar: _buildBottomNav(),
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: const Border(top: BorderSide(color: AppColors.divider, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(_navItems.length, (i) {
              final item = _navItems[i];
              final isSelected = i == _selectedIndex;
              return GestureDetector(
                onTap: () => setState(() => _selectedIndex = i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: isSelected
                        ? AppColors.primary.withOpacity(0.12)
                        : Colors.transparent,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(
                            item.icon,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textHint,
                            size: 22,
                          ),
                          if (item.showsCartBadge) _CartBadge(),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.label,
                        style: GoogleFonts.outfit(
                          fontSize: 10,
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.textHint,
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildSearchTab() {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Search Meals', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.inputBorder, width: 1.5),
              ),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search steaks, chicken, snacks...',
                  hintStyle: GoogleFonts.outfit(color: AppColors.textHint),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                ),
                onSubmitted: (value) {
                  if (value.isNotEmpty) {
                    Navigator.pushNamed(context, '/products', arguments: value);
                  }
                },
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Popular Tags',
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                _buildSearchTagChip('🍗 Chicken'),
                _buildSearchTagChip('🥩 Beef'),
                _buildSearchTagChip('🍖 Mutton'),
                _buildSearchTagChip('🐟 Fish'),
                _buildSearchTagChip('🥚 Eggs'),
                _buildSearchTagChip('🥗 Healthy Add-ons'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchTagChip(String label) {
    final cleanLabel = label.replaceAll(RegExp(r'[^\w\s]'), '').trim();
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/products', arguments: cleanLabel);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: AppColors.divider),
        ),
        child: Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

}

class _NavItem {
  final IconData icon;
  final String label;
  final bool showsCartBadge;
  const _NavItem({required this.icon, required this.label, this.showsCartBadge = false});
}

/// Live cart item count on the Cart tab icon — reuses the existing
/// cartProvider (no new state, no new fetch); hidden entirely when the
/// cart is empty.
class _CartBadge extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartProvider.select((s) => s.items.length));
    if (count == 0) return const SizedBox.shrink();

    return Positioned(
      right: -8,
      top: -4,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
        constraints: const BoxConstraints(minWidth: 16),
        decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(10)),
        child: Text(
          count > 99 ? '99+' : '$count',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
        ),
      ),
    );
  }
}
