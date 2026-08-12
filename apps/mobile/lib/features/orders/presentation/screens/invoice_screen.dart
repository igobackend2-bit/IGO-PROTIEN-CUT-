import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../data/services/invoice_generator.dart';
import '../../domain/entities/order_summary.dart';

class InvoiceScreen extends StatefulWidget {
  final OrderSummary order;
  const InvoiceScreen({super.key, required this.order});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> {
  bool _isSharing = false;

  Future<void> _downloadAndShare() async {
    setState(() => _isSharing = true);
    try {
      final bytes = await InvoiceGenerator.generate(widget.order);
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/invoice_order_${widget.order.id}.pdf');
      await file.writeAsBytes(bytes);
      await Share.shareXFiles([XFile(file.path)], text: 'Invoice for Order #${widget.order.id}');
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not generate the invoice. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    } finally {
      if (mounted) setState(() => _isSharing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final deliveryFee = order.deliveryFee ?? 30.0;
    final tax = order.taxAmount ?? 15.0;
    final discount = order.discountAmount ?? 0.0;
    final grandTotal = order.totalPrice + deliveryFee + tax - discount;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Invoice', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('PROTEIN CUTS', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)),
                    Text('INVOICE', style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint, fontWeight: FontWeight.w700)),
                  ],
                ),
                const Divider(height: 28),
                _row('Order ID', '#${shortId(order.id)}'),
                _row('Date', DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt)),
                _row('Payment', order.paymentMethod ?? 'Cash on Delivery'),
                if (order.address != null) ...[
                  const SizedBox(height: 12),
                  Text('Bill To', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint)),
                  Text(order.address!.fullName, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700)),
                  Text(order.address!.formattedAddress, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                ],
                const SizedBox(height: 20),
                ...order.items.map((item) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 5),
                      child: Row(
                        children: [
                          Expanded(child: Text('${item.productName} x${item.quantity}', style: GoogleFonts.outfit(fontSize: 12.5))),
                          Text('₹${item.subtotal.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    )),
                const Divider(height: 28),
                _row('Subtotal', '₹${order.totalPrice.toStringAsFixed(0)}'),
                _row('Delivery Fee', '₹${deliveryFee.toStringAsFixed(0)}'),
                _row('GST & Packing', '₹${tax.toStringAsFixed(0)}'),
                if (discount > 0) _row('Discount', '-₹${discount.toStringAsFixed(0)}'),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Grand Total', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800)),
                    Text('₹${grandTotal.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _isSharing ? null : _downloadAndShare,
              icon: _isSharing
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.download_rounded),
              label: Text('Download / Share Invoice', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary)),
          Text(value, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
