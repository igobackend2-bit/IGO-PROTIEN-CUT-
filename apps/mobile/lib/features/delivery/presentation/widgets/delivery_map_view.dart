import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

/// A single lat/lng point the map plots — pickup, destination or the
/// partner's live position. Kept local to this widget (not the domain
/// entities) since it's a rendering concern, not a data shape.
class MapPoint {
  final double lat;
  final double lng;
  const MapPoint(this.lat, this.lng);
}

/// Real-data-driven placeholder for the live map: plots pickup, the
/// partner's current position and the destination, with a straight route
/// line between them. Not to scale, and not tied to real map tiles —
/// wiring in `google_maps_flutter` (GoogleMap + Marker + Polyline widgets)
/// is a drop-in swap for this widget's body once a Google Maps API key is
/// added to the Android/iOS projects, since it consumes the exact same
/// [pickup] / [destination] / [partner] coordinates a real map would.
/// Deliberately not wired to a live GoogleMap here: that needs a Google
/// Cloud API key, a credential this app can't generate for the user.
class DeliveryMapView extends StatelessWidget {
  final MapPoint pickup;
  final MapPoint destination;
  final MapPoint? partner;

  const DeliveryMapView({super.key, required this.pickup, required this.destination, this.partner});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 220,
        width: double.infinity,
        decoration: BoxDecoration(color: AppColors.surfaceLight, border: Border.all(color: AppColors.divider)),
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(painter: _RoutePainter(pickup: pickup, destination: destination, partner: partner)),
            ),
            Positioned(
              top: 10,
              left: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: Colors.black.withOpacity(0.6), borderRadius: BorderRadius.circular(20)),
                child: Text(
                  'Map preview — not to scale',
                  style: GoogleFonts.outfit(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoutePainter extends CustomPainter {
  final MapPoint pickup;
  final MapPoint destination;
  final MapPoint? partner;

  _RoutePainter({required this.pickup, required this.destination, this.partner});

  @override
  void paint(Canvas canvas, Size size) {
    final points = [pickup, destination, if (partner != null) partner!];
    final lats = points.map((p) => p.lat).toList();
    final lngs = points.map((p) => p.lng).toList();
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);

    const padding = 36.0;
    Offset project(MapPoint p) {
      final latSpan = (maxLat - minLat).abs() < 1e-9 ? 1 : (maxLat - minLat);
      final lngSpan = (maxLng - minLng).abs() < 1e-9 ? 1 : (maxLng - minLng);
      final x = padding + ((p.lng - minLng) / lngSpan) * (size.width - padding * 2);
      // Screen y grows downward, latitude grows upward — invert.
      final y = size.height - padding - ((p.lat - minLat) / latSpan) * (size.height - padding * 2);
      return Offset(x, y);
    }

    final pickupPos = project(pickup);
    final destinationPos = project(destination);
    final partnerPos = partner != null ? project(partner!) : null;

    final routePaint = Paint()
      ..color = AppColors.primary.withOpacity(0.4)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    _drawDashedLine(canvas, pickupPos, destinationPos, routePaint);

    _drawMarker(canvas, pickupPos, AppColors.textSecondary, Icons.store_rounded);
    _drawMarker(canvas, destinationPos, AppColors.error, Icons.location_on_rounded);
    if (partnerPos != null) {
      final livePaint = Paint()
        ..color = AppColors.primary
        ..strokeWidth = 3
        ..style = PaintingStyle.stroke;
      _drawDashedLine(canvas, partnerPos, destinationPos, livePaint);
      _drawMarker(canvas, partnerPos, AppColors.primary, Icons.two_wheeler_rounded, pulse: true);
    }
  }

  void _drawDashedLine(Canvas canvas, Offset a, Offset b, Paint paint) {
    const dashLength = 6.0;
    final total = (b - a).distance;
    final steps = (total / (dashLength * 2)).floor();
    if (steps == 0) {
      canvas.drawLine(a, b, paint);
      return;
    }
    final direction = (b - a) / total;
    for (var i = 0; i < steps; i++) {
      final start = a + direction * (i * dashLength * 2);
      final end = start + direction * dashLength;
      canvas.drawLine(start, end, paint);
    }
  }

  void _drawMarker(Canvas canvas, Offset center, Color color, IconData icon, {bool pulse = false}) {
    if (pulse) {
      canvas.drawCircle(center, 16, Paint()..color = color.withOpacity(0.15));
    }
    canvas.drawCircle(center, 11, Paint()..color = Colors.white);
    canvas.drawCircle(center, 11, Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke);

    final textPainter = TextPainter(textDirection: TextDirection.ltr);
    textPainter.text = TextSpan(
      text: String.fromCharCode(icon.codePoint),
      style: TextStyle(fontSize: 13, fontFamily: icon.fontFamily, package: icon.fontPackage, color: color),
    );
    textPainter.layout();
    textPainter.paint(canvas, center - Offset(textPainter.width / 2, textPainter.height / 2));
  }

  @override
  bool shouldRepaint(covariant _RoutePainter oldDelegate) {
    return oldDelegate.pickup != pickup || oldDelegate.destination != destination || oldDelegate.partner != partner;
  }
}
