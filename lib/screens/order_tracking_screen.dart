import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../utils/app_colors.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderId;

  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  final _supabase = Supabase.instance.client;

  Map<String, dynamic>? order;
  List<Map<String, dynamic>> items = [];
  bool loading = true;

  final List<String> steps = [
    "Pending",
    "Packing",
    "Out for Delivery",
    "Delivered",
  ];

  @override
  void initState() {
    super.initState();
    loadOrder();
  }

  Future<void> loadOrder() async {
    try {
      final orderData = await _supabase
          .from('orders')
          .select()
          .eq('id', widget.orderId)
          .single();

      final itemsData = await _supabase
          .from('order_items')
          .select('*, products(name, price)')
          .eq('order_id', widget.orderId);

      setState(() {
        order = orderData;
        items = List<Map<String, dynamic>>.from(itemsData);
        loading = false;
      });
    } catch (e) {
      setState(() {
        loading = false;
      });
    }
  }

  int getCurrentStep(String status) {
    final index = steps.indexOf(status);
    return index == -1 ? 0 : index;
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final status = order?['status'] ?? 'Pending';
    final currentStep = getCurrentStep(status);

    return Scaffold(
      backgroundColor: AppColors.background,

      appBar: AppBar(
        title: Text(
          "Track Order",
          style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
        ),
        backgroundColor: AppColors.primary,
      ),

      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 🟢 ORDER CARD
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Order ID",
                    style: GoogleFonts.outfit(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.orderId,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "Status: $status",
                    style: GoogleFonts.outfit(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 🟢 SWIGGY STYLE STEP TRACKER
            Expanded(
              child: ListView.builder(
                itemCount: steps.length,
                itemBuilder: (context, index) {
                  final isActive = index <= currentStep;
                  final isCurrent = index == currentStep;

                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isActive
                                  ? AppColors.primary
                                  : Colors.grey.shade300,
                            ),
                            child: Icon(
                              isActive ? Icons.check : Icons.circle_outlined,
                              size: 16,
                              color: Colors.white,
                            ),
                          ),

                          if (index != steps.length - 1)
                            Container(
                              width: 2,
                              height: 50,
                              color: isActive
                                  ? AppColors.primary
                                  : Colors.grey.shade300,
                            ),
                        ],
                      ),

                      const SizedBox(width: 12),

                      Expanded(
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                steps[index],
                                style: GoogleFonts.outfit(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: isActive
                                      ? Colors.black
                                      : Colors.grey,
                                ),
                              ),

                              const SizedBox(height: 4),

                              Text(
                                _getSubtitle(steps[index]),
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                              ),

                              if (isCurrent)
                                Padding(
                                  padding: const EdgeInsets.only(top: 6),
                                  child: Text(
                                    "Currently in progress...",
                                    style: GoogleFonts.outfit(
                                      fontSize: 11,
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),

            // 🟢 ITEMS CARD
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Items",
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ...items.map((item) {
                    final product = item['products'];
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              product?['name'] ?? '',
                              style: GoogleFonts.outfit(fontSize: 13),
                            ),
                          ),
                          Text(
                            "x${item['quantity']}",
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getSubtitle(String step) {
    switch (step) {
      case "Pending":
        return "Order received successfully";
      case "Packing":
        return "Fresh meat is being packed";
      case "Out for Delivery":
        return "On the way to your address";
      case "Delivered":
        return "Order delivered successfully";
      default:
        return "";
    }
  }
}