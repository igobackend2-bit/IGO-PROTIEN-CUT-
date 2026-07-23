import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/order_providers.dart';

Future<bool?> showRatingDialog(BuildContext context, WidgetRef ref, String orderId) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (context) => _RatingDialogContent(orderId: orderId),
  );
}

class _RatingDialogContent extends ConsumerStatefulWidget {
  final String orderId;
  const _RatingDialogContent({required this.orderId});

  @override
  ConsumerState<_RatingDialogContent> createState() => _RatingDialogContentState();
}

class _RatingDialogContentState extends ConsumerState<_RatingDialogContent> {
  int _rating = 5;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    try {
      await ref.read(orderRepositoryProvider).submitRating(
            widget.orderId,
            rating: _rating,
            comment: _commentController.text.trim(),
          );
      ref.invalidate(orderRatingProvider(widget.orderId));
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (_) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not submit your rating. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Rate Your Order', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text('How was your delivery experience?', style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (i) {
                    final starValue = i + 1;
                    return GestureDetector(
                      onTap: () => setState(() => _rating = starValue),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Icon(starValue <= _rating ? Icons.star_rounded : Icons.star_outline_rounded, color: const Color(0xFFF39C12), size: 36),
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _commentController,
                maxLines: 3,
                maxLength: 300,
                style: GoogleFonts.outfit(fontSize: 13.5),
                decoration: InputDecoration(
                  hintText: 'Tell us more (optional)...',
                  hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint),
                  filled: true,
                  fillColor: AppColors.surfaceLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text('Submit Rating', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
