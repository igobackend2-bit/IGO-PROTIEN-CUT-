import 'package:supabase_flutter/supabase_flutter.dart' show User;

class UserModel {
  final String id;
  final String fullName;
  final String email;
  final String phoneNumber;
  final String? profileImageUrl;
  final DateTime? dateOfBirth;
  final String? gender;
  final double walletBalance;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    this.profileImageUrl,
    this.dateOfBirth,
    this.gender,
    this.walletBalance = 0,
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
      dateOfBirth: DateTime.tryParse(profile?['date_of_birth']?.toString() ?? ''),
      gender: profile?['gender'] as String?,
      walletBalance: (profile?['wallet_balance'] as num?)?.toDouble() ?? 0,
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
      dateOfBirth: DateTime.tryParse((map['date_of_birth'] ?? map['dateOfBirth'] ?? '').toString()),
      gender: map['gender'],
      walletBalance: (map['wallet_balance'] as num?)?.toDouble() ?? 0,
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
      if (dateOfBirth != null) 'date_of_birth': dateOfBirth!.toIso8601String().split('T').first,
      if (gender != null) 'gender': gender,
    };
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'profileImageUrl': profileImageUrl,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'walletBalance': walletBalance,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? fullName,
    String? email,
    String? phoneNumber,
    String? profileImageUrl,
    DateTime? dateOfBirth,
    String? gender,
    double? walletBalance,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      walletBalance: walletBalance ?? this.walletBalance,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  String toString() =>
      'UserModel(id: $id, fullName: $fullName, email: $email, phone: $phoneNumber)';
}
