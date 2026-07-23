import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/order_status.dart';

class OrderStatusBadge extends StatelessWidget {
  final OrderStatus status;
  const OrderStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: status.color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
      child: Text(
        status.label.toUpperCase(),
        style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: status.color, letterSpacing: 0.4),
      ),
    );
  }
}
