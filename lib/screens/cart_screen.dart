import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/cart_service.dart';
import '../utils/app_colors.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _cartService = CartService();
  final _supabase = Supabase.instance.client;

  List<Map<String, dynamic>> cartItems = [];
  bool loading = true;
  bool isCheckingOut = false;

  @override
  void initState() {
    super.initState();
    loadCart();
  }

  Future<void> loadCart() async {
    try {
      final data = await _cartService.getCartItems();
      debugPrint("DEBUG: CartScreen loaded ${data.length} items: $data");
      setState(() {
        cartItems = data;
        loading = false;
      });
    } catch (e) {
      debugPrint("DEBUG: CartScreen loadCart error: $e");
      setState(() {
        loading = false;
      });
    }
  }

  double get totalPrice {
    double total = 0;

    for (final item in cartItems) {
      final product = item['products'];
      final rawPrice = product?['price'];
      final price = rawPrice is num ? rawPrice.toDouble() : 0.0;
      final rawQty = item['quantity'];
      final qty = rawQty is num ? rawQty.toInt() : 0;

      total += (price * qty);
    }
    return total;
  }

  Future<void> updateQty(int id, int qty) async {
    await _cartService.updateQuantity(id, qty);
    loadCart();
  }

  Future<void> removeItem(int id) async {
    await _cartService.removeItem(id);
    loadCart();
  }

  Future<void> checkout() async {
    final user = _supabase.auth.currentUser;

    if (user == null || cartItems.isEmpty || isCheckingOut) return;

    setState(() => isCheckingOut = true);

    try {
      // 1️⃣ Create Order
      final order = await _supabase
          .from('orders')
          .insert({
            'user_id': user.id,
            'total_price': totalPrice,
            'status': 'Pending',
          })
          .select()
          .single();

      final orderId = order['id'];

      // 2️⃣ Insert Order Items
      final items = cartItems.map((item) {
        final product = item['products'];

        return {
          'order_id': orderId,
          'product_id': product['id'],
          'quantity': item['quantity'],
          'price': product['price'],
        };
      }).toList();

      await _supabase.from('order_items').insert(items);

      // 3️⃣ Clear Cart
      await _cartService.clearCart();

      // 4️⃣ Refresh UI
      await loadCart();

      if (!mounted) return;

      // 5️⃣ Go to success screen
      Navigator.pushNamed(context, '/success');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Checkout failed: $e"),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => isCheckingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,

      appBar: AppBar(
        title: Text(
          "My Cart",
          style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
        ),
        backgroundColor: AppColors.primary,
      ),

      body: loading
          ? const Center(child: CircularProgressIndicator())
          : cartItems.isEmpty
              ? Center(
                  child: Text(
                    "Your cart is empty 🛒",
                    style: GoogleFonts.outfit(fontSize: 16),
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: cartItems.length,
                        itemBuilder: (context, index) {
                          final item = cartItems[index];
                          final product = item['products'];

                          return Dismissible(
                            key: Key(item['id'].toString()),
                            direction: DismissDirection.endToStart,
                            onDismissed: (_) => removeItem(item['id']),
                            background: Container(
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 20),
                              color: Colors.red,
                              child: const Icon(Icons.delete, color: Colors.white),
                            ),
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 8,
                                  )
                                ],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    height: 60,
                                    width: 60,
                                    decoration: BoxDecoration(
                                      color: Colors.grey.shade100,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: (product?['image_url'] as String? ?? '').isNotEmpty
                                          ? (product!['image_url'] as String).startsWith('http')
                                              ? Image.network(
                                                  product['image_url'],
                                                  fit: BoxFit.cover,
                                                  errorBuilder: (_, __, ___) => const Icon(
                                                    Icons.shopping_bag_outlined,
                                                    color: AppColors.primary,
                                                  ),
                                                )
                                              : Center(
                                                  child: Text(
                                                    product['image_url'],
                                                    style: const TextStyle(fontSize: 24),
                                                  ),
                                                )
                                          : const Icon(
                                              Icons.shopping_bag_outlined,
                                              color: AppColors.primary,
                                            ),
                                    ),
                                  ),

                                  const SizedBox(width: 12),

                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          product?['name'] ?? 'Unknown',
                                          style: GoogleFonts.outfit(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          "₹${product?['price'] ?? 0}",
                                          style: GoogleFonts.outfit(
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  Row(
                                    children: [
                                      IconButton(
                                        onPressed: () {
                                          final qty = item['quantity'];
                                          if (qty > 1) {
                                            updateQty(item['id'], qty - 1);
                                          } else {
                                            removeItem(item['id']);
                                          }
                                        },
                                        icon: const Icon(Icons.remove_circle_outline),
                                      ),

                                      Text(
                                        "${item['quantity']}",
                                        style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),

                                      IconButton(
                                        onPressed: () {
                                          updateQty(item['id'], item['quantity'] + 1);
                                        },
                                        icon: const Icon(Icons.add_circle_outline),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 12,
                            offset: const Offset(0, -3),
                          )
                        ],
                      ),
                      child: SafeArea(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  "Total",
                                  style: GoogleFonts.outfit(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  "₹${totalPrice.toStringAsFixed(0)}",
                                  style: GoogleFonts.outfit(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),

                            ElevatedButton(
                              onPressed: isCheckingOut ? null : checkout,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 28,
                                  vertical: 14,
                                ),
                                minimumSize: const Size(140, 48),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: isCheckingOut
                                  ? const SizedBox(
                                      height: 18,
                                      width: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : Text(
                                      "Checkout",
                                      style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            )
                          ],
                        ),
                      ),
                    )
                  ],
                ),
    );
  }
}