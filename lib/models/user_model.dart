import 'package:supabase_flutter/supabase_flutter.dart' show User;

class UserModel {
  final String id;
  final String fullName;
  final String email;
  final String phoneNumber;
  final String? profileImageUrl;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    this.profileImageUrl,
    required this.createdAt,
  });

  /// Create from Supabase Auth user + profiles table row
  factory UserModel.fromSupabase(User authUser, Map<String, dynamic>? profile) {
    return UserModel(
      id: authUser.id,
      fullName: profile?['full_name'] as String? ??
          authUser.userMetadata?['full_name'] as String? ??
          'Protein Fan',
      email: authUser.email ?? '',
      phoneNumber: profile?['phone_number'] as String? ?? '',
      profileImageUrl: profile?['profile_image_url'] as String?,
      createdAt: DateTime.tryParse(authUser.createdAt) ?? DateTime.now(),
    );
  }

  /// Create from a plain map (e.g., local storage or JSON API)
  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      fullName: map['full_name'] ?? map['fullName'] ?? '',
      email: map['email'] ?? '',
      phoneNumber: map['phone_number'] ?? map['phoneNumber'] ?? '',
      profileImageUrl: map['profile_image_url'] ?? map['profileImageUrl'],
      createdAt: DateTime.tryParse(
              map['created_at'] ?? map['createdAt'] ?? '') ??
          DateTime.now(),
    );
  }

  /// Serialize for Supabase profiles table insert/update
  Map<String, dynamic> toSupabase() {
    return {
      'id': id,
      'full_name': fullName,
      'phone_number': phoneNumber,
      if (profileImageUrl != null) 'profile_image_url': profileImageUrl,
    };
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'profileImageUrl': profileImageUrl,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? fullName,
    String? email,
    String? phoneNumber,
    String? profileImageUrl,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  String toString() =>
      'UserModel(id: $id, fullName: $fullName, email: $email, phone: $phoneNumber)';
}
