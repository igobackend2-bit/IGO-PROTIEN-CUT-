import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../models/product_model.dart';
import '../../../../shared/providers/admin_providers.dart';
import '../../../../shared/providers/catalog_providers.dart';
import '../../../../utils/app_colors.dart';

/// Narrow, purpose-built admin utility — upload a real photo for an
/// existing product straight from this device, replacing the old "paste an
/// external image URL" flow entirely. Not the Admin Dashboard (that's
/// Phase 19): there's no create/delete/pricing here, just photo upload,
/// because that's the one gap explicitly asked for. Writing goes through
/// AdminService, which is gated by the same `products.manage` RBAC
/// permission as every other admin write in this app.
class AdminProductPhotosScreen extends ConsumerStatefulWidget {
  const AdminProductPhotosScreen({super.key});

  @override
  ConsumerState<AdminProductPhotosScreen> createState() => _AdminProductPhotosScreenState();
}

class _AdminProductPhotosScreenState extends ConsumerState<AdminProductPhotosScreen> {
  final Set<String> _uploadingIds = {};

  Future<void> _pickAndUpload(Product product) async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85, maxWidth: 1600);
    if (picked == null) return;

    setState(() => _uploadingIds.add(product.id));
    try {
      final bytes = await picked.readAsBytes();
      final ext = picked.path.split('.').last.toLowerCase();
      final admin = ref.read(adminServiceProvider);
      final url = await admin.uploadProductImage(product.id, bytes, fileExt: ext.isEmpty ? 'jpg' : ext);
      await admin.products('update', {'id': product.id, 'image_url': url});

      // Same shared provider Home/Product Discovery read — invalidating it
      // here is what makes the new photo "automatically reflect" for the
      // customer app the next time either screen loads.
      ref.invalidate(catalogSnapshotProvider);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${product.name} photo updated.', style: GoogleFonts.outfit()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed: ${e.toString().replaceFirst('Exception: ', '')}', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    } finally {
      if (mounted) setState(() => _uploadingIds.remove(product.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final catalogAsync = ref.watch(catalogSnapshotProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Product Photos', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: catalogAsync.when(
        data: (products) {
          if (products.isEmpty) return Center(child: Text('No products found.', style: GoogleFonts.outfit()));
          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(catalogSnapshotProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: products.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) => _ProductPhotoTile(
                product: products[index],
                isUploading: _uploadingIds.contains(products[index].id),
                onUpload: () => _pickAndUpload(products[index]),
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (_, __) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text("Couldn't load products.", style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              TextButton(onPressed: () => ref.invalidate(catalogSnapshotProvider), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProductPhotoTile extends StatelessWidget {
  final Product product;
  final bool isUploading;
  final VoidCallback onUpload;

  const _ProductPhotoTile({required this.product, required this.isUploading, required this.onUpload});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 56,
              height: 56,
              child: product.imageUrl.isEmpty
                  ? const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.shopping_bag_outlined, color: AppColors.primary, size: 26))
                  : CachedNetworkImage(
                      imageUrl: product.imageUrl,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.shopping_bag_outlined, color: AppColors.primary, size: 26)),
                    ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text('${product.category} • ₹${product.price.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          isUploading
              ? const SizedBox(width: 36, height: 36, child: Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)))
              : IconButton(
                  onPressed: onUpload,
                  icon: const Icon(Icons.upload_rounded, color: AppColors.primary),
                  style: IconButton.styleFrom(backgroundColor: AppColors.surfaceLight, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                  tooltip: 'Upload photo',
                ),
        ],
      ),
    );
  }
}
