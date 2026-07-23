import '../../../../models/user_model.dart';
import '../../../../services/auth_service.dart';
import '../entities/notification_preferences.dart';

abstract class ProfileRepository {
  UserModel? get currentUser;
  Future<UserModel> loadProfile();

  Future<UserModel> updateProfile({
    required String fullName,
    required String phoneNumber,
    DateTime? dateOfBirth,
    String? gender,
  });

  Future<String> uploadPhoto(List<int> bytes, {String fileExt});

  Future<AuthResult> changePassword({required String currentPassword, required String newPassword});

  Future<void> logoutAllDevices();

  Future<NotificationPreferences> fetchNotificationPreferences();
  Future<void> updateNotificationPreference(String column, bool value);
}
