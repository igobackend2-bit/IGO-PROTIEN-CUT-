import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../../support/presentation/screens/create_ticket_screen.dart';
import '../../../support/presentation/screens/support_center_screen.dart';
import '../../../support/presentation/widgets/contact_options.dart';

void showSupportBottomSheet(BuildContext context, {String? orderId}) {
  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (sheetContext) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Need Help?', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)),
            if (orderId != null)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text('Regarding Order #${shortId(orderId)}', style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary)),
              ),
            const SizedBox(height: 16),
            ContactOptionsRow(orderId: orderId),
            const SizedBox(height: 16),
            _tile(
              icon: Icons.report_gmailerrorred_rounded,
              title: 'Report an Issue',
              subtitle: orderId != null ? 'Missing, wrong, damaged item or delivery/payment issue' : 'Raise a ticket for any order',
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.push(context, MaterialPageRoute(builder: (_) => CreateTicketScreen(initialOrderId: orderId)));
              },
            ),
            _tile(
              icon: Icons.support_agent_rounded,
              title: 'Support Center',
              subtitle: 'FAQs, tickets, refunds and more',
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportCenterScreen()));
              },
            ),
          ],
        ),
      ),
    ),
  );
}

Widget _tile({required IconData icon, required String title, required String subtitle, required VoidCallback onTap}) {
  return ListTile(
    contentPadding: EdgeInsets.zero,
    leading: Container(
      width: 40,
      height: 40,
      decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
      child: Icon(icon, color: AppColors.primary, size: 20),
    ),
    title: Text(title, style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14)),
    subtitle: Text(subtitle, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
    onTap: onTap,
  );
}
