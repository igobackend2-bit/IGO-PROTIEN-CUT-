import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';

/// Real contact channels — same numbers/address used by the pre-Phase-16
/// support bottom sheet, now centralized here so both it and the new
/// Support Center stay in sync instead of drifting.
class SupportContacts {
  static const phone = '+919876543210';
  static const email = 'support@proteincuts.com';
  static const whatsapp = '919876543210';
}

Future<void> _launch(BuildContext context, Uri uri) async {
  final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Could not open that app.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
    );
  }
}

Future<void> launchSupportCall(BuildContext context) => _launch(context, Uri(scheme: 'tel', path: SupportContacts.phone));

Future<void> launchSupportEmail(BuildContext context, {String? orderId}) => _launch(
      context,
      Uri(scheme: 'mailto', path: SupportContacts.email, query: orderId != null ? 'subject=Order #${shortId(orderId)}' : null),
    );

Future<void> launchSupportWhatsApp(BuildContext context, {String? orderId}) {
  final text = orderId != null ? 'Hi, I need help with order #${shortId(orderId)}' : 'Hi, I need help with my Protein Cuts order';
  return _launch(context, Uri.parse('https://wa.me/${SupportContacts.whatsapp}?text=${Uri.encodeComponent(text)}'));
}

/// The three real contact channels (WhatsApp / Call / Email), rendered as
/// a row of tiles — reused by both the Support Center and Order Detail's
/// quick support sheet.
class ContactOptionsRow extends StatelessWidget {
  final String? orderId;
  const ContactOptionsRow({super.key, this.orderId});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _ContactTile(icon: Icons.chat_rounded, label: 'WhatsApp', color: const Color(0xFF25D366), onTap: () => launchSupportWhatsApp(context, orderId: orderId))),
        const SizedBox(width: 10),
        Expanded(child: _ContactTile(icon: Icons.call_rounded, label: 'Call Us', color: AppColors.primary, onTap: () => launchSupportCall(context))),
        const SizedBox(width: 10),
        Expanded(child: _ContactTile(icon: Icons.email_rounded, label: 'Email', color: const Color(0xFF2471A3), onTap: () => launchSupportEmail(context, orderId: orderId))),
      ],
    );
  }
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ContactTile({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.divider)),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 6),
            Text(label, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ],
        ),
      ),
    );
  }
}
