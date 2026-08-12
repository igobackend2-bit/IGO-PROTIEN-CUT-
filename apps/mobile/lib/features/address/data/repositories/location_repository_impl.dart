import 'package:geocoding/geocoding.dart' as geocoding;
import 'package:geolocator/geolocator.dart';

import '../../domain/entities/detected_location.dart';
import '../../domain/repositories/location_repository.dart';

/// No Google Maps/Places API key is configured in this project, so this
/// deliberately only uses GPS (device hardware) + the platform's built-in
/// native geocoder — both work with zero API keys or billing setup. A
/// visual map picker / Places Autocomplete would need `google_maps_flutter`
/// and a real key; until then this is the "gracefully fall back to manual
/// entry" path the address form already supports.
class LocationRepositoryImpl implements LocationRepository {
  // geocoding 5.x moved reverse-geocoding from a top-level function to a
  // method on this class.
  final geocoding.Geocoding _geocoder = geocoding.Geocoding();

  @override
  Future<LocationResult> getCurrentLocationAndAddress() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return LocationResult.failure('Location services are turned off. Please enable them and try again.');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      return LocationResult.failure('Location permission denied.');
    }
    if (permission == LocationPermission.deniedForever) {
      return LocationResult.failure('Location permission permanently denied. Enable it in app settings.');
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      String street = '';
      String area = '';
      String city = '';
      String state = '';
      String pincode = '';

      try {
        final placemarks = await _geocoder.placemarkFromCoordinates(position.latitude, position.longitude);
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          street = p.street ?? '';
          area = p.subLocality ?? '';
          city = p.locality ?? '';
          state = p.administrativeArea ?? '';
          pincode = p.postalCode ?? '';
        }
      } catch (_) {
        // GPS succeeded but reverse geocoding failed — still hand back the
        // coordinates so the user can fill the rest in manually.
      }

      return LocationResult.success(DetectedLocation(
        latitude: position.latitude,
        longitude: position.longitude,
        street: street,
        area: area,
        city: city,
        state: state,
        pincode: pincode,
      ));
    } catch (e) {
      return LocationResult.failure('Could not detect your location. Please enter it manually.');
    }
  }
}
