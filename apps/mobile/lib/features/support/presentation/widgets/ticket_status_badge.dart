import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../domain/entities/ticket_status.dart';

class TicketStatusBadge extends StatelessWidget {
  final TicketStatus status;
  final bool isReturn;
  const TicketStatusBadge({super.key, required this.status, this.isReturn = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: status.color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(
        isReturn ? status.returnLabel : status.label,
        style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w800, color: status.color),
      ),
    );
  }
}
