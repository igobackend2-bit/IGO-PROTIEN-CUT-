import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/user_model.dart';
import '../../data/repositories/profile_repository_impl.dart';
import '../../domain/entities/notification_preferences.dart';
import '../../domain/repositories/profile_repository.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) => ProfileRepositoryImpl());

final userProfileProvider = StateNotifierProvider<UserProfileNotifier, AsyncValue<UserModel>>((ref) {
  return UserProfileNotifier(ref.read(profileRepositoryProvider));
});

class UserProfileNotifier extends StateNotifier<AsyncValue<UserModel>> {
  final ProfileRepository _repository;

  UserProfileNotifier(this._repository) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    final cached = _repository.currentUser;
    if (cached != null) {
      state = AsyncValue.data(cached);
      return;
    }
    state = await AsyncValue.guard(() => _repository.loadProfile());
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => _repository.loadProfile());
  }

  Future<bool> updateProfile({
    required String fullName,
    required String phoneNumber,
    DateTime? dateOfBirth,
    String? gender,
  }) async {
    final previous = state;
    final current = state.value;
    if (current != null) {
      state = AsyncValue.data(current.copyWith(
        fullName: fullName,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        gender: gender,
      )); // optimistic
    }
    try {
      final updated = await _repository.updateProfile(
        fullName: fullName,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        gender: gender,
      );
      state = AsyncValue.data(updated);
      return true;
    } catch (_) {
      state = previous; // rollback
      return false;
    }
  }

  Future<bool> uploadPhoto(List<int> bytes, {String fileExt = 'jpg'}) async {
    final current = state.value;
    if (current == null) return false;
    try {
      final url = await _repository.uploadPhoto(bytes, fileExt: fileExt);
      state = AsyncValue.data(current.copyWith(profileImageUrl: url));
      return true;
    } catch (_) {
      return false;
    }
  }
}

final notificationPreferencesProvider =
    StateNotifierProvider<NotificationPreferencesNotifier, AsyncValue<NotificationPreferences>>((ref) {
  return NotificationPreferencesNotifier(ref.read(profileRepositoryProvider));
});

class NotificationPreferencesNotifier extends StateNotifier<AsyncValue<NotificationPreferences>> {
  final ProfileRepository _repository;

  NotificationPreferencesNotifier(this._repository) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    state = await AsyncValue.guard(() => _repository.fetchNotificationPreferences());
  }

  Future<void> retry() => _load();

  Future<void> toggle(String column, bool value) async {
    final current = state.value;
    if (current == null) return;
    final updated = switch (column) {
      'notify_order_updates' => current.copyWith(orderUpdates: value),
      'notify_promotions' => current.copyWith(promotions: value),
      'notify_offers' => current.copyWith(offers: value),
      'notify_stock_alerts' => current.copyWith(stockAlerts: value),
      _ => current,
    };
    state = AsyncValue.data(updated); // optimistic
    try {
      await _repository.updateNotificationPreference(column, value);
    } catch (_) {
      state = AsyncValue.data(current); // rollback
    }
  }
}
