import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared review service, following the same plain-Supabase-wrapper
/// pattern as OrderService/PaymentService/WishlistService. Talks to
/// `product_reviews`, `review_helpful`, `review_replies` and the
/// `review-photos` Storage bucket. Reads fail closed (empty/false) if
/// those don't exist yet; writes surface failures.
class ReviewService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> fetchReviews(String productId) async {
    try {
      final response = await _client
          .from('product_reviews')
          .select()
          .eq('product_id', productId)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> fetchReplies(List<String> reviewIds) async {
    if (reviewIds.isEmpty) return [];
    try {
      final response = await _client.from('review_replies').select().inFilter('review_id', reviewIds);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<Set<String>> fetchMyHelpfulVotes(List<String> reviewIds) async {
    final user = _client.auth.currentUser;
    if (user == null || reviewIds.isEmpty) return {};
    try {
      final response = await _client
          .from('review_helpful')
          .select('review_id')
          .eq('user_id', user.id)
          .inFilter('review_id', reviewIds);
      return (response as List).map((e) => e['review_id'].toString()).toSet();
    } catch (_) {
      return {};
    }
  }

  Future<bool> hasReviewed(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) return false;
    try {
      final response = await _client
          .from('product_reviews')
          .select('id')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .maybeSingle();
      return response != null;
    } catch (_) {
      return false;
    }
  }

  Future<Map<String, dynamic>?> fetchMyReview(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    try {
      return await _client
          .from('product_reviews')
          .select()
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .maybeSingle();
    } catch (_) {
      return null;
    }
  }

  /// Most recent non-cancelled order that actually contains this product,
  /// for the current user — null if they've never purchased it. Reuses the
  /// existing `orders`/`order_items` tables directly rather than adding any
  /// Order-module logic.
  Future<String?> findVerifiedOrderId(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    try {
      final response = await _client
          .from('order_items')
          .select('order_id, orders!inner(id, user_id, status, created_at)')
          .eq('product_id', productId)
          .eq('orders.user_id', user.id)
          .neq('orders.status', 'Cancelled')
          .order('created_at', referencedTable: 'orders', ascending: false)
          .limit(1);
      final rows = List<Map<String, dynamic>>.from(response as List);
      if (rows.isEmpty) return null;
      return rows.first['order_id']?.toString();
    } catch (_) {
      return null;
    }
  }

  Future<void> submitReview({
    required String productId,
    required String orderId,
    required int rating,
    String? title,
    required String comment,
    required List<String> photoUrls,
  }) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to write a review.');

    final userName = (user.userMetadata?['full_name'] as String?)?.trim();

    await _client.from('product_reviews').insert({
      'product_id': productId,
      'user_id': user.id,
      'order_id': orderId,
      'user_name': (userName == null || userName.isEmpty) ? 'Verified Buyer' : userName,
      'rating': rating.clamp(1, 5),
      'title': title?.trim().isEmpty == true ? null : title?.trim(),
      'comment': comment.trim(),
      'photos': photoUrls,
    });
  }

  Future<void> updateReview({
    required String reviewId,
    required int rating,
    String? title,
    required String comment,
    required List<String> photoUrls,
  }) async {
    await _client.from('product_reviews').update({
      'rating': rating.clamp(1, 5),
      'title': title?.trim().isEmpty == true ? null : title?.trim(),
      'comment': comment.trim(),
      'photos': photoUrls,
    }).eq('id', reviewId);
  }

  Future<void> deleteReview(String reviewId) async {
    await _client.from('product_reviews').delete().eq('id', reviewId);
  }

  /// Toggles the current user's helpful vote — insert if absent, delete if
  /// present (the unique(review_id, user_id) constraint plus this
  /// check-then-act is what prevents duplicate votes). Returns the new
  /// helpful state (true = now marked helpful).
  Future<bool> toggleHelpful(String reviewId) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to mark reviews as helpful.');

    final existing = await _client
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing != null) {
      await _client.from('review_helpful').delete().eq('id', existing['id']);
      return false;
    } else {
      await _client.from('review_helpful').insert({'review_id': reviewId, 'user_id': user.id});
      return true;
    }
  }

  Future<String> uploadReviewPhoto(List<int> bytes, {required String folder, required String fileName}) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to upload photos.');
    final path = '${user.id}/$folder/$fileName';
    await _client.storage.from('review-photos').uploadBinary(path, Uint8List.fromList(bytes), fileOptions: const FileOptions(upsert: true));
    return _client.storage.from('review-photos').getPublicUrl(path);
  }
}
