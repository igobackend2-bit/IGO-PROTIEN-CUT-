import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../models/order_status.dart';
import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../../orders/presentation/providers/order_providers.dart';
import '../../domain/entities/ticket_category.dart';
import '../providers/support_providers.dart';
import 'ticket_detail_screen.dart';

const _returnReasons = ['Wrong item', 'Damaged item', 'Quality issue', 'Changed my mind', 'Other'];

/// Handles both "Order Help" (missing/wrong/damaged/delivery/payment,
/// auto-linked to an order) and "Returns" (category = return, eligible
/// orders only) — one screen, since both are just a [SupportTicket] with a
/// different category, per the brief's "no duplicate repositories".
class CreateTicketScreen extends ConsumerStatefulWidget {
  final String? initialOrderId;
  final TicketCategory? initialCategory;

  const CreateTicketScreen({super.key, this.initialOrderId, this.initialCategory});

  @override
  ConsumerState<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends ConsumerState<CreateTicketScreen> {
  late TicketCategory _category;
  String? _orderId;
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  File? _attachment;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _category = widget.initialCategory ?? TicketCategory.other;
    _orderId = widget.initialOrderId;
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 75, maxWidth: 1280);
    if (picked == null) return;
    setState(() => _attachment = File(picked.path));
  }

  void _applyReturnReason(String reason) {
    setState(() {
      _subjectController.text = 'Return request — $reason';
      if (_descriptionController.text.trim().isEmpty) {
        _descriptionController.text = 'I would like to return this order. Reason: $reason.';
      }
    });
  }

  Future<void> _submit() async {
    final subject = _subjectController.text.trim();
    final description = _descriptionController.text.trim();
    if (subject.isEmpty || description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please fill in the subject and description.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
      return;
    }
    if (_category == TicketCategory.returnRequest && _orderId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select the order you want to return.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      String? attachmentUrl;
      if (_attachment != null) {
        final bytes = await _attachment!.readAsBytes();
        final ext = _attachment!.path.split('.').last.toLowerCase();
        attachmentUrl = await ref.read(supportRepositoryProvider).uploadAttachment(
              bytes,
              fileName: 'ticket_${DateTime.now().millisecondsSinceEpoch}.${ext.isEmpty ? 'jpg' : ext}',
            );
      }

      final ticket = await ref.read(createTicketProvider.notifier).submit(
            category: _category,
            subject: subject,
            description: description,
            orderId: _orderId,
            attachmentUrl: attachmentUrl,
          );

      if (!mounted) return;
      if (ticket == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not submit your ticket. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
        );
        return;
      }
      ref.read(ticketListProvider.notifier).refresh();
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: ticket.id)));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isReturn = _category == TicketCategory.returnRequest;
    final orders = ref.watch(ordersListProvider).orders;
    final eligibleOrders = isReturn ? orders.where((o) => o.status == OrderStatus.delivered).toList() : orders;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(isReturn ? 'Request a Return' : 'Raise a Ticket', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Category', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: TicketCategory.values.map((c) {
              final selected = c == _category;
              return ChoiceChip(
                label: Text(c.label, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: selected ? Colors.white : AppColors.textPrimary)),
                avatar: Icon(c.icon, size: 15, color: selected ? Colors.white : AppColors.primary),
                selected: selected,
                onSelected: (_) => setState(() => _category = c),
                selectedColor: AppColors.primary,
                backgroundColor: Colors.white,
                side: BorderSide(color: selected ? AppColors.primary : AppColors.divider),
              );
            }).toList(),
          ),
          if (isReturn) ...[
            const SizedBox(height: 18),
            Text('Return Reason', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _returnReasons
                  .map((r) => ActionChip(
                        label: Text(r, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600)),
                        onPressed: () => _applyReturnReason(r),
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: AppColors.divider),
                      ))
                  .toList(),
            ),
          ],
          const SizedBox(height: 18),
          Text(isReturn ? 'Order to Return' : 'Related Order (optional)', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.divider)),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: eligibleOrders.isEmpty
                ? Padding(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    child: Text(
                      isReturn ? 'No delivered orders are eligible for a return right now.' : 'No past orders found.',
                      style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint),
                    ),
                  )
                : DropdownButtonHideUnderline(
                    child: DropdownButton<String?>(
                      isExpanded: true,
                      value: eligibleOrders.any((o) => o.id == _orderId) ? _orderId : null,
                      hint: Text('Select an order', style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint)),
                      items: [
                        if (!isReturn) DropdownMenuItem<String?>(value: null, child: Text('None', style: GoogleFonts.outfit(fontSize: 13))),
                        ...eligibleOrders.map(
                          (o) => DropdownMenuItem<String?>(
                            value: o.id,
                            child: Text('#${shortId(o.id)} • ₹${o.totalPrice.toStringAsFixed(0)} • ${o.itemsSummary}', style: GoogleFonts.outfit(fontSize: 13), overflow: TextOverflow.ellipsis),
                          ),
                        ),
                      ],
                      onChanged: (value) => setState(() => _orderId = value),
                    ),
                  ),
          ),
          const SizedBox(height: 18),
          Text('Subject', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _subjectController,
            style: GoogleFonts.outfit(fontSize: 13.5),
            decoration: InputDecoration(
              hintText: 'A short summary of the issue',
              hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.divider)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.divider)),
            ),
          ),
          const SizedBox(height: 18),
          Text('Description', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _descriptionController,
            minLines: 4,
            maxLines: 8,
            style: GoogleFonts.outfit(fontSize: 13.5),
            decoration: InputDecoration(
              hintText: 'Tell us what happened…',
              hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.divider)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.divider)),
            ),
          ),
          const SizedBox(height: 18),
          Text('Attach Image (optional)', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _pickImage,
            child: _attachment == null
                ? Container(
                    height: 100,
                    width: double.infinity,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.divider, style: BorderStyle.solid)),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add_a_photo_outlined, color: AppColors.primary, size: 22),
                        const SizedBox(height: 6),
                        Text('Add a photo', style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textHint)),
                      ],
                    ),
                  )
                : Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(_attachment!, height: 140, width: double.infinity, fit: BoxFit.cover),
                      ),
                      Positioned(
                        top: 6,
                        right: 6,
                        child: GestureDetector(
                          onTap: () => setState(() => _attachment = null),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                            child: const Icon(Icons.close_rounded, color: Colors.white, size: 16),
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isSubmitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(isReturn ? 'Submit Return Request' : 'Submit Ticket', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}
