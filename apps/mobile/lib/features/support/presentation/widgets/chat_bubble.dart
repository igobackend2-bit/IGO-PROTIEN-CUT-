import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/ticket_message.dart';

class ChatBubble extends StatelessWidget {
  final TicketMessage message;
  final bool isPending;
  const ChatBubble({super.key, required this.message, this.isPending = false});

  @override
  Widget build(BuildContext context) {
    if (message.sender == MessageSender.system) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(20)),
            child: Text(message.message, style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textSecondary)),
          ),
        ),
      );
    }

    final isCustomer = message.sender == MessageSender.customer;

    return Align(
      alignment: isCustomer ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: isCustomer ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          if (!isCustomer)
            Padding(
              padding: const EdgeInsets.only(left: 4, bottom: 3),
              child: Text('Support Agent', style: GoogleFonts.outfit(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
            ),
          Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
            margin: const EdgeInsets.symmetric(vertical: 3),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isCustomer ? AppColors.primary : Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(16),
                topRight: const Radius.circular(16),
                bottomLeft: Radius.circular(isCustomer ? 16 : 4),
                bottomRight: Radius.circular(isCustomer ? 4 : 16),
              ),
              border: isCustomer ? null : Border.all(color: AppColors.divider),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (message.attachment != null) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: CachedNetworkImage(
                      imageUrl: message.attachment!,
                      width: 180,
                      height: 130,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                Text(message.message, style: GoogleFonts.outfit(fontSize: 13.5, color: isCustomer ? Colors.white : AppColors.textPrimary, height: 1.35)),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      isPending ? 'Sending…' : DateFormat('hh:mm a').format(message.createdAt),
                      style: GoogleFonts.outfit(fontSize: 10, color: isCustomer ? Colors.white70 : AppColors.textHint),
                    ),
                    if (!isCustomer && !message.isRead) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(6)),
                        child: Text('NEW', style: GoogleFonts.outfit(fontSize: 8.5, fontWeight: FontWeight.w800, color: Colors.white)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
