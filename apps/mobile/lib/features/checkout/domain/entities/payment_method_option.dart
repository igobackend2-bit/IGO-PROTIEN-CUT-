import 'package:flutter/material.dart';

/// Cash on Delivery is the only method actually wired up end-to-end. The
/// others are deliberately modeled here — enum, icon, label — so a real
/// gateway integration later only needs to add its processing logic and
/// flip `isAvailable`; no UI/architecture rework.
enum PaymentMethodOption {
  cashOnDelivery('Cash on Delivery', Icons.payments_outlined, true),
  upi('UPI', Icons.qr_code_rounded, false),
  card('Credit / Debit Card', Icons.credit_card_rounded, false),
  wallet('Wallet', Icons.account_balance_wallet_outlined, false),
  razorpay('Razorpay', Icons.bolt_rounded, false);

  final String label;
  final IconData icon;
  final bool isAvailable;

  const PaymentMethodOption(this.label, this.icon, this.isAvailable);
}
