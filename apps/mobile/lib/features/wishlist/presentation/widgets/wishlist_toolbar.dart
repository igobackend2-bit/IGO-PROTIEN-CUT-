import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/wishlist_providers.dart';

/// Search field + sort chips + result count, sitting on top of the
/// Wishlist grid. Purely a view over [wishlistSearchQueryProvider] /
/// [wishlistSortProvider] — no logic of its own.
class WishlistToolbar extends ConsumerWidget {
  final int resultCount;
  const WishlistToolbar({super.key, required this.resultCount});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sort = ref.watch(wishlistSortProvider);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.inputBorder, width: 1),
            ),
            child: TextField(
              onChanged: (value) => ref.read(wishlistSearchQueryProvider.notifier).state = value,
              style: GoogleFonts.outfit(fontSize: 13.5),
              decoration: InputDecoration(
                hintText: 'Search your wishlist...',
                hintStyle: GoogleFonts.outfit(color: AppColors.textHint, fontSize: 13.5),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
                border: InputBorder.none,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(
                '$resultCount ${resultCount == 1 ? 'item' : 'items'}',
                style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
              ),
              const Spacer(),
              ...WishlistSortOption.values.map((option) {
                final isSelected = option == sort;
                return Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: ChoiceChip(
                    label: Text(option.label, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600)),
                    selected: isSelected,
                    onSelected: (_) => ref.read(wishlistSortProvider.notifier).state = option,
                    selectedColor: AppColors.primary,
                    backgroundColor: AppColors.surfaceLight,
                    labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? AppColors.primary : AppColors.inputBorder)),
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }
}
