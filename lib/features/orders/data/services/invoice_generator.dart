import 'dart:typed_data';

import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import '../../../../utils/id_format.dart';
import '../../domain/entities/order_summary.dart';

/// Pure PDF-bytes generator — no file I/O, no sharing. Keeping this
/// side-effect-free makes it trivial to test and reuse (screen preview vs.
/// share/download both just need the bytes).
class InvoiceGenerator {
  static Future<Uint8List> generate(OrderSummary order) async {
    final doc = pw.Document();
    final deliveryFee = order.deliveryFee ?? 30.0;
    final tax = order.taxAmount ?? 15.0;
    final discount = order.discountAmount ?? 0.0;
    final grandTotal = order.totalPrice + deliveryFee + tax - discount;

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('PROTEIN CUTS', style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold)),
                  pw.Text('INVOICE', style: pw.TextStyle(fontSize: 16, color: PdfColors.grey700)),
                ],
              ),
              pw.SizedBox(height: 4),
              pw.Text('Premium Fresh Meat & Protein', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
              pw.Divider(height: 24),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Order ID', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600)),
                      pw.Text('#${shortId(order.id)}', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Date', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600)),
                      pw.Text(DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt), style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Payment', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600)),
                      pw.Text(order.paymentMethod ?? 'Cash on Delivery', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              if (order.address != null) ...[
                pw.SizedBox(height: 16),
                pw.Text('Bill To', style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600)),
                pw.Text(order.address!.fullName, style: pw.TextStyle(fontSize: 11, fontWeight: pw.FontWeight.bold)),
                pw.Text(order.address!.formattedAddress, style: const pw.TextStyle(fontSize: 10)),
              ],
              pw.SizedBox(height: 20),
              pw.Table(
                border: pw.TableBorder.all(color: PdfColors.grey300),
                columnWidths: {0: const pw.FlexColumnWidth(3), 1: const pw.FlexColumnWidth(1), 2: const pw.FlexColumnWidth(1), 3: const pw.FlexColumnWidth(1)},
                children: [
                  pw.TableRow(
                    decoration: const pw.BoxDecoration(color: PdfColors.grey200),
                    children: [
                      _cell('Item', bold: true),
                      _cell('Qty', bold: true),
                      _cell('Price', bold: true),
                      _cell('Total', bold: true),
                    ],
                  ),
                  ...order.items.map(
                    (item) => pw.TableRow(children: [
                      _cell(item.productName),
                      _cell('${item.quantity}'),
                      _cell('Rs.${item.price.toStringAsFixed(0)}'),
                      _cell('Rs.${item.subtotal.toStringAsFixed(0)}'),
                    ]),
                  ),
                ],
              ),
              pw.SizedBox(height: 20),
              pw.Align(
                alignment: pw.Alignment.centerRight,
                child: pw.SizedBox(
                  width: 220,
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                    children: [
                      _summaryRow('Subtotal', order.totalPrice),
                      _summaryRow('Delivery Fee', deliveryFee),
                      _summaryRow('GST & Packing', tax),
                      if (discount > 0) _summaryRow('Discount', -discount),
                      pw.Divider(),
                      _summaryRow('Grand Total', grandTotal, bold: true),
                    ],
                  ),
                ),
              ),
              pw.SizedBox(height: 24),
              pw.Text('Thank you for shopping with Protein Cuts!', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
            ],
          );
        },
      ),
    );

    return doc.save();
  }

  static pw.Widget _cell(String text, {bool bold = false}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(6),
      child: pw.Text(text, style: pw.TextStyle(fontSize: 10, fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal)),
    );
  }

  static pw.Widget _summaryRow(String label, double value, {bool bold = false}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 3),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label, style: pw.TextStyle(fontSize: bold ? 12 : 10, fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal)),
          pw.Text('Rs.${value.toStringAsFixed(0)}', style: pw.TextStyle(fontSize: bold ? 12 : 10, fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal)),
        ],
      ),
    );
  }
}
