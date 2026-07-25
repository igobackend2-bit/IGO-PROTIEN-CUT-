import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../navigation/nav_item.dart';

/// Sidebar nav list, reused as a full desktop sidebar, a collapsed tablet
/// rail (icon-only), or the contents of a compact-width [Drawer].
class Sidebar extends StatelessWidget {
  final List<NavItem> items;
  final String currentRoute;
  final bool extended;

  const Sidebar({
    super.key,
    required this.items,
    required this.currentRoute,
    required this.extended,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: extended ? 240 : 76,
      color: Colors.white,
      child: Column(
        children: [
          SizedBox(
            height: 64,
            child: Row(
              mainAxisAlignment: extended ? MainAxisAlignment.start : MainAxisAlignment.center,
              children: [
                if (extended) const SizedBox(width: 20),
                Container(
                  width: 36,
                  height: 36,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: scheme.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.storefront, color: Colors.white, size: 20),
                ),
                if (extended) ...[
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Protein Cuts',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: items.map((item) {
                final selected = item.route == currentRoute;
                final tile = Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  child: Material(
                    color: selected ? scheme.primaryContainer : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(14),
                      onTap: () => context.go(item.route),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(
                          mainAxisAlignment: extended ? MainAxisAlignment.start : MainAxisAlignment.center,
                          children: [
                            Icon(
                              item.icon,
                              size: 21,
                              color: selected ? scheme.primary : scheme.onSurfaceVariant,
                            ),
                            if (extended) ...[
                              const SizedBox(width: 14),
                              Expanded(
                                child: Text(
                                  item.label,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: selected ? scheme.primary : scheme.onSurface,
                                    fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                );
                return extended ? tile : Tooltip(message: item.label, child: tile);
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
