import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../data/models/product_review_model.dart';
import '../providers/review_providers.dart';
import '../screens/product_reviews_screen.dart';
import '../screens/write_review_screen.dart';
import 'rating_summary_card.dart';
import 'review_card.dart';

class ReviewsRatingsSection extends ConsumerWidget {
  final Product product;
  const ReviewsRatingsSection({super.key, required this.product});

  Future<void> _openWriteReview(BuildContext context, WidgetRef ref, {required String orderId}) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => WriteReviewScreen(productId: product.id, orderId: orderId)),
    );
    if (result == true) ref.read(reviewListProvider(product.id).notifier).refresh();
  }

  Future<void> _openEditReview(BuildContext context, WidgetRef ref, ProductReview review) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => WriteReviewScreen(productId: product.id, existingReview: review)),
    );
    if (result == true) ref.read(reviewListProvider(product.id).notifier).refresh();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(reviewListProvider(product.id));
    final eligibilityAsync = ref.watch(reviewEligibilityProvider(product.id));
    final currentUserId = Supabase.instance.client.auth.currentUser?.id;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Ratings & Reviews', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            eligibilityAsync.when(
              data: (eligibility) {
                if (eligibility.hasReviewed) {
                  final myReview = state.reviews.where((r) => r.userId == currentUserId).firstOrNull;
                  if (myReview == null) return const SizedBox.shrink();
                  return TextButton.icon(
                    onPressed: () => _openEditReview(context, ref, myReview),
                    icon: const Icon(Icons.edit_outlined, size: 16, color: AppColors.primary),
                    label: Text('Edit Your Review', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  );
                }
                if (!eligibility.canWriteReview) return const SizedBox.shrink();
                return TextButton.icon(
                  onPressed: () => _openWriteReview(context, ref, orderId: eligibility.verifiedOrderId!),
                  icon: const Icon(Icons.edit_outlined, size: 16, color: AppColors.primary),
                  label: Text('Write a Review', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (state.isLoading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5)),
          )
        else if (state.error != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Center(child: Text("Couldn't load reviews right now.", style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint))),
          )
        else if (state.reviews.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Column(
              children: [
                const Icon(Icons.rate_review_outlined, size: 36, color: AppColors.textHint),
                const SizedBox(height: 8),
                Text('No reviews yet', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13.5, color: AppColors.textPrimary)),
                const SizedBox(height: 4),
                Text('Be the first to share your experience!', style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textHint)),
              ],
            ),
          )
        else ...[
          RatingSummaryCard(summary: state.summary),
          const SizedBox(height: 14),
          ...state.reviews.take(3).map((review) => ReviewCard(
                review: review,
                isOwnReview: review.userId == currentUserId,
                onToggleHelpful: () => ref.read(reviewListProvider(product.id).notifier).toggleHelpful(review),
                onEdit: review.userId == currentUserId ? () => _openEditReview(context, ref, review) : null,
              )),
          if (state.reviews.length > 3)
            Center(
              child: TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ProductReviewsScreen(product: product))),
                child: Text('View All ${state.reviews.length} Reviews', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
              ),
            ),
        ],
      ],
    );
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
