import '../entities/detected_location.dart';

abstract class LocationRepository {
  /// Requests location permission if needed, reads GPS, then reverse-
  /// geocodes it. Every failure mode (permission denied, service off, no
  /// geocoding result) comes back as a [LocationResult.failure] with a
  /// user-facing message rather than throwing.
  Future<LocationResult> getCurrentLocationAndAddress();
}
