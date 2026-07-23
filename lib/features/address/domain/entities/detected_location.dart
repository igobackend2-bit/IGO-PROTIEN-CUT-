import 'package:flutter/foundation.dart';

/// Result of "Use Current Location" — GPS coordinates plus whatever the
/// device's native geocoder could resolve from them. Any field the
/// geocoder couldn't determine comes back empty so the form simply leaves
/// that field for the user to fill in, rather than guessing.
@immutable
class DetectedLocation {
  final double latitude;
  final double longitude;
  final String street;
  final String area;
  final String city;
  final String state;
  final String pincode;

  const DetectedLocation({
    required this.latitude,
    required this.longitude,
    this.street = '',
    this.area = '',
    this.city = '',
    this.state = '',
    this.pincode = '',
  });
}

@immutable
class LocationResult {
  final bool isSuccess;
  final String? errorMessage;
  final DetectedLocation? location;

  const LocationResult._({required this.isSuccess, this.errorMessage, this.location});

  factory LocationResult.success(DetectedLocation location) =>
      LocationResult._(isSuccess: true, location: location);

  factory LocationResult.failure(String message) => LocationResult._(isSuccess: false, errorMessage: message);
}
