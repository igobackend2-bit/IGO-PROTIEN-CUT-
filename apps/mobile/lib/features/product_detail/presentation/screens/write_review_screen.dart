import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../utils/app_colors.dart';
import '../../data/models/product_review_model.dart';
import '../providers/product_detail_providers.dart';
import '../providers/review_providers.dart';

/// Handles both writing a new review and editing an existing one — pass
/// [orderId] for a new review (the verified-purchase order) or
/// [existingReview] to edit/delete an existing one.
class WriteReviewScreen extends ConsumerStatefulWidget {
  final String productId;
  final String? orderId;
  final ProductReview? existingReview;

  const WriteReviewScreen({super.key, required this.productId, this.orderId, this.existingReview});

  bool get isEditing => existingReview != null;

  @override
  ConsumerState<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends ConsumerState<WriteReviewScreen> {
  late int _rating = widget.existingReview?.rating ?? 5;
  late final _titleController = TextEditingController(text: widget.existingReview?.title ?? '');
  late final _commentController = TextEditingController(text: widget.existingReview?.comment ?? '');
  late final List<String> _existingPhotoUrls = List.of(widget.existingReview?.photos ?? const []);
  final List<XFile> _newPhotos = [];
  bool _isSubmitting = false;
  String? _error;

  int get _totalPhotoCount => _existingPhotoUrls.length + _newPhotos.length;

  @override
  void dispose() {
    _titleController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _pickPhotos() async {
    final remaining = 5 - _totalPhotoCount;
    if (remaining <= 0) return;
    final picked = await ImagePicker().pickMultiImage(imageQuality: 75, maxWidth: 1280);
    if (picked.isEmpty) return;
    setState(() => _newPhotos.addAll(picked.take(remaining)));
  }

  Future<void> _submit() async {
    if (_commentController.text.trim().isEmpty) {
      setState(() => _error = 'Please share a few words about the product.');
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      final repository = ref.read(reviewRepositoryProvider);

      final uploadedUrls = <String>[];
      for (var i = 0; i < _newPhotos.length; i++) {
        final bytes = await _newPhotos[i].readAsBytes();
        final ext = _newPhotos[i].path.split('.').last.toLowerCase();
        final url = await repository.uploadReviewPhoto(
          bytes,
          folder: '${widget.productId}_${DateTime.now().millisecondsSinceEpoch}',
          fileName: 'photo_$i.${ext.isEmpty ? 'jpg' : ext}',
        );
        uploadedUrls.add(url);
      }
      final photos = [..._existingPhotoUrls, ...uploadedUrls];

      if (widget.isEditing) {
        await repository.updateReview(
          reviewId: widget.existingReview!.id,
          rating: _rating,
          title: _titleController.text,
          comment: _commentController.text,
          photoUrls: photos,
        );
      } else {
        await repository.submitReview(
          productId: widget.productId,
          orderId: widget.orderId!,
          rating: _rating,
          title: _titleController.text,
          comment: _commentController.text,
          photoUrls: photos,
        );
      }

      _refreshReviewData();
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isSubmitting = false;
        _error = 'Could not submit your review. Please try again.';
      });
    }
  }

  Future<void> _handleDelete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Delete Review?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text('This can\'t be undone.', style: GoogleFonts.outfit(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Delete', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700))),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _isSubmitting = true);
    try {
      await ref.read(reviewRepositoryProvider).deleteReview(widget.existingReview!.id);
      _refreshReviewData();
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isSubmitting = false;
        _error = 'Could not delete your review. Please try again.';
      });
    }
  }

  void _refreshReviewData() {
    ref.invalidate(reviewListProvider(widget.productId));
    ref.invalidate(reviewEligibilityProvider(widget.productId));
    ref.invalidate(reviewsProvider(widget.productId));
    ref.invalidate(hasReviewedProvider(widget.productId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Edit Review' : 'Write a Review', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          if (widget.isEditing)
            IconButton(onPressed: _isSubmitting ? null : _handleDelete, icon: const Icon(Icons.delete_outline_rounded, color: Colors.white)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (_error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.error.withOpacity(0.08), borderRadius: BorderRadius.circular(12)),
              child: Text(_error!, style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.error, fontWeight: FontWeight.w600)),
            ),
          Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) {
                final starValue = i + 1;
                return GestureDetector(
                  onTap: () => setState(() => _rating = starValue),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(starValue <= _rating ? Icons.star_rounded : Icons.star_outline_rounded, color: const Color(0xFFF39C12), size: 38),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 20),
          _label('Review Title (optional)'),
          TextField(
            controller: _titleController,
            maxLength: 80,
            style: GoogleFonts.outfit(fontSize: 13.5),
            decoration: InputDecoration(
              hintText: 'Summarize your experience',
              hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint),
              filled: true,
              fillColor: AppColors.surfaceLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 12),
          _label('Your Review'),
          TextField(
            controller: _commentController,
            maxLines: 5,
            maxLength: 500,
            style: GoogleFonts.outfit(fontSize: 13.5),
            decoration: InputDecoration(
              hintText: 'Share your experience with this product...',
              hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint),
              filled: true,
              fillColor: AppColors.surfaceLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 8),
          _label('Add Photos ($_totalPhotoCount/5)'),
          SizedBox(
            height: 76,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ..._existingPhotoUrls.map((url) => _photoThumb(
                      image: Image.network(url, width: 72, height: 72, fit: BoxFit.cover),
                      onRemove: () => setState(() => _existingPhotoUrls.remove(url)),
                    )),
                ..._newPhotos.map((file) => _photoThumb(
                      image: Image.file(File(file.path), width: 72, height: 72, fit: BoxFit.cover),
                      onRemove: () => setState(() => _newPhotos.remove(file)),
                    )),
                if (_totalPhotoCount < 5)
                  GestureDetector(
                    onTap: _pickPhotos,
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.inputBorder)),
                      child: const Icon(Icons.add_a_photo_outlined, color: AppColors.primary, size: 22),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          SizedBox(
            height: 54,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              child: _isSubmitting
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(widget.isEditing ? 'Update Review' : 'Submit Review', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _photoThumb({required Widget image, required VoidCallback onRemove}) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Stack(
        children: [
          ClipRRect(borderRadius: BorderRadius.circular(10), child: image),
          Positioned(
            top: -4,
            right: -4,
            child: GestureDetector(
              onTap: onRemove,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                child: const Icon(Icons.close_rounded, color: Colors.white, size: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
      );
}
