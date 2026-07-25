import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../utils/app_colors.dart';
import '../providers/profile_providers.dart';

/// Camera/Gallery → Crop → Compress (via picker's imageQuality) → Upload,
/// with an optimistic local preview while the upload is in flight.
class AvatarPicker extends ConsumerStatefulWidget {
  final String? currentImageUrl;
  const AvatarPicker({super.key, required this.currentImageUrl});

  @override
  ConsumerState<AvatarPicker> createState() => _AvatarPickerState();
}

class _AvatarPickerState extends ConsumerState<AvatarPicker> {
  File? _localPreview;
  bool _isUploading = false;

  Future<void> _pickAndUpload(ImageSource source) async {
    final picked = await ImagePicker().pickImage(
      source: source,
      imageQuality: 80,
      maxWidth: 1024,
      maxHeight: 1024,
    );
    if (picked == null) return;

    final cropped = await ImageCropper().cropImage(
      sourcePath: picked.path,
      aspectRatio: const CropAspectRatio(ratioX: 1, ratioY: 1),
      compressQuality: 85,
      uiSettings: [
        AndroidUiSettings(
          toolbarTitle: 'Crop Photo',
          toolbarColor: AppColors.primary,
          toolbarWidgetColor: Colors.white,
          lockAspectRatio: true,
        ),
        IOSUiSettings(title: 'Crop Photo', aspectRatioLockEnabled: true),
      ],
    );
    if (cropped == null) return;

    final file = File(cropped.path);
    setState(() {
      _localPreview = file;
      _isUploading = true;
    });

    try {
      final bytes = await file.readAsBytes();
      final ext = file.path.split('.').last.toLowerCase();
      final success = await ref.read(userProfileProvider.notifier).uploadPhoto(bytes, fileExt: ext.isEmpty ? 'jpg' : ext);
      if (!mounted) return;
      if (!success) {
        setState(() => _localPreview = null);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not upload your photo. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
        );
      }
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  void _showSourceSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Update Profile Photo', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.photo_camera_outlined, color: AppColors.primary),
                title: Text('Take Photo', style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14)),
                onTap: () {
                  Navigator.pop(sheetContext);
                  _pickAndUpload(ImageSource.camera);
                },
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
                title: Text('Choose from Gallery', style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14)),
                onTap: () {
                  Navigator.pop(sheetContext);
                  _pickAndUpload(ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _isUploading ? null : _showSourceSheet,
      child: Stack(
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.primary, width: 3),
              color: AppColors.surfaceLight,
            ),
            child: ClipOval(child: _buildImage()),
          ),
          if (_isUploading)
            Positioned.fill(
              child: DecoratedBox(
                decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.black38),
                child: const Center(child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white)),
              ),
            ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: 30,
              height: 30,
              decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle, border: Border.fromBorderSide(BorderSide(color: Colors.white, width: 2))),
              child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 15),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImage() {
    if (_localPreview != null) return Image.file(_localPreview!, fit: BoxFit.cover);
    final url = widget.currentImageUrl;
    if (url != null && url.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        errorWidget: (_, __, ___) => const Icon(Icons.person_rounded, size: 56, color: AppColors.primary),
      );
    }
    return const Icon(Icons.person_rounded, size: 56, color: AppColors.primary);
  }
}
