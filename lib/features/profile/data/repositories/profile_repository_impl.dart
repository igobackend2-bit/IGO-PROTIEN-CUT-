import '../../../../models/user_model.dart';
import '../../../../services/auth_service.dart';
import '../../domain/entities/notification_preferences.dart';
import '../../domain/repositories/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final AuthService _service;
  ProfileRepositoryImpl({AuthService? service}) : _service = service ?? AuthService();

  @override
  UserModel? get currentUser => _service.currentUser;

  @override
  Future<UserModel> loadProfile() async {
    await _service.isLoggedIn();
    return _service.currentUser!;
  }

  @override
  Future<UserModel> updateProfile({
    required String fullName,
    required String phoneNumber,
    DateTime? dateOfBirth,
    String? gender,
  }) {
    return _service.updateProfile(
      fullName: fullName,
      phoneNumber: phoneNumber,
      dateOfBirth: dateOfBirth,
      gender: gender,
    );
  }

  @override
  Future<String> uploadPhoto(List<int> bytes, {String fileExt = 'jpg'}) {
    return _service.uploadProfilePhoto(bytes, fileExt: fileExt);
  }

  @override
  Future<AuthResult> changePassword({required String currentPassword, required String newPassword}) {
    return _service.changePassword(currentPassword: currentPassword, newPassword: newPassword);
  }

  @override
  Future<void> logoutAllDevices() => _service.logoutAllDevices();

  @override
  Future<NotificationPreferences> fetchNotificationPreferences() async {
    final map = await _service.fetchNotificationPreferences();
    return NotificationPreferences.fromMap(map);
  }

  @override
  Future<void> updateNotificationPreference(String column, bool value) {
    return _service.updateNotificationPreference(column, value);
  }
}
