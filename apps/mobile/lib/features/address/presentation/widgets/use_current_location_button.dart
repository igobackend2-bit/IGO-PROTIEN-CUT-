import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/detected_location.dart';
import '../providers/address_providers.dart';

/// No Google Maps API key is configured, so this uses GPS + the device's
/// native geocoder only — no map picker. See LocationRepositoryImpl for
/// the full explanation and the upgrade path once a key is added.
class UseCurrentLocationButton extends ConsumerStatefulWidget {
  final ValueChanged<DetectedLocation> onDetected;

  const UseCurrentLocationButton({super.key, required this.onDetected});

  @override
  ConsumerState<UseCurrentLocationButton> createState() => _UseCurrentLocationButtonState();
}

class _UseCurrentLocationButtonState extends ConsumerState<UseCurrentLocationButton> {
  bool _isLoading = false;
  String? _error;

  Future<void> _detect() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final result = await ref.read(locationRepositoryProvider).getCurrentLocationAndAddress();

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result.isSuccess && result.location != null) {
      widget.onDetected(result.location!);
    } else {
      setState(() => _error = result.errorMessage ?? 'Could not detect your location.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OutlinedButton.icon(
          onPressed: _isLoading ? null : _detect,
          icon: _isLoading
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
              : const Icon(Icons.my_location_rounded, size: 17, color: AppColors.primary),
          label: Text('Use Current Location', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.primary),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(_error!, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.error)),
          ),
      ],
    );
  }
}
