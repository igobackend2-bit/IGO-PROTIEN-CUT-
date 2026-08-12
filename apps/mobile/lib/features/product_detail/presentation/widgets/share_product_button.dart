import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';

class ShareProductButton extends StatelessWidget {
  final Product product;
  const ShareProductButton({super.key, required this.product});

  void _share(BuildContext context) {
    final box = context.findRenderObject() as RenderBox?;
    Share.share(
      'Check out ${product.name} on Protein Cuts — ₹${product.price.toStringAsFixed(0)} for ${product.weight}!',
      subject: product.name,
      sharePositionOrigin: box != null ? (box.localToGlobal(Offset.zero) & box.size) : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      backgroundColor: Colors.white,
      child: IconButton(
        icon: const Icon(Icons.share_outlined, color: AppColors.textPrimary, size: 20),
        onPressed: () => _share(context),
      ),
    );
  }
}
