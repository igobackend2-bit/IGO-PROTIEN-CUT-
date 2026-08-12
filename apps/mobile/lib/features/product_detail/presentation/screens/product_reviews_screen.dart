import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../data/models/product_review_model.dart';
import '../providers/product_detail_providers.dart';
import '../providers/review_providers.dart';
import '../widgets/rating_summary_card.dart';
import '../widgets/review_card.dart';
import '../widgets/review_empty_state.dart';
import '../widgets/review_error_state.dart';
import '../widgets/review_skeleton.dart';
import 'write_review_screen.dart';

class ProductReviewsScreen extends ConsumerWidget {
  final Product product;
  const ProductReviewsScreen({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(reviewListProvider(product.id));
    final sorted = ref.watch(sortedReviewsProvider(product.id));
    final notifier = ref.read(reviewListProvider(product.id).notifier);
    final currentUserId = Supabase.instance.client.auth.currentUser?.id;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Reviews', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: _buildBody(context, ref, state, sorted, notifier, currentUserId),
    );
  }

  Widget _buildBody(
    BuildContext context,
    WidgetRef ref,
    ReviewListState state,
    List<ProductReview> sorted,
    ReviewListNotifier notifier,
    String? currentUserId,
  ) {
    if (state.isLoading) return const ReviewSkeleton();
    if (state.error != null) return ReviewErrorState(onRetry: notifier.retry);
    if (state.reviews.isEmpty) {
      return RefreshIndicator(color: AppColors.primary, onRefresh: notifier.refresh, child: ListView(physics: const AlwaysScrollableScrollPhysics(), children: const [ReviewEmptyState()]));
    }

    final sort = ref.watch(reviewSortProvider);

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: notifier.refresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          RatingSummaryCard(summary: state.summary),
          const SizedBox(height: 16),
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: ReviewSortOption.values.map((option) {
                final isSelected = option == sort;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(option.label, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600)),
                    selected: isSelected,
                    onSelected: (_) => ref.read(reviewSortProvider.notifier).state = option,
                    selectedColor: AppColors.primary,
                    backgroundColor: AppColors.surfaceLight,
                    labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? AppColors.primary : AppColors.inputBorder)),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          ...sorted.map((review) => ReviewCard(
                review: review,
                isOwnReview: review.userId == currentUserId,
                onToggleHelpful: () => notifier.toggleHelpful(review),
                onEdit: review.userId == currentUserId
                    ? () async {
                        final result = await Navigator.push<bool>(
                          context,
                          MaterialPageRoute(builder: (_) => WriteReviewScreen(productId: product.id, existingReview: review)),
                        );
                        if (result == true) notifier.refresh();
                      }
                    : null,
                onDelete: review.userId == currentUserId ? () => _handleDelete(context, ref, review, notifier) : null,
              )),
        ],
      ),
    );
  }

  Future<void> _handleDelete(BuildContext context, WidgetRef ref, ProductReview review, ReviewListNotifier notifier) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Delete Review?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text("This can't be undone.", style: GoogleFonts.outfit(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Delete', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700))),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ref.read(reviewRepositoryProvider).deleteReview(review.id);
      notifier.refresh();
      ref.invalidate(reviewEligibilityProvider(product.id));
      ref.invalidate(reviewsProvider(product.id));
      ref.invalidate(hasReviewedProvider(product.id));
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not delete your review. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    }
  }
}
