import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../utils/app_colors.dart';
import '../providers/profile_providers.dart';
import '../widgets/avatar_picker.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  DateTime? _dateOfBirth;
  String? _gender;
  bool _isSaving = false;
  bool _initialized = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _initFromUser() {
    if (_initialized) return;
    final user = ref.read(userProfileProvider).value;
    _nameController = TextEditingController(text: user?.fullName ?? '');
    _phoneController = TextEditingController(text: user?.phoneNumber ?? '');
    _dateOfBirth = user?.dateOfBirth;
    _gender = user?.gender;
    _initialized = true;
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(now.year - 20),
      firstDate: DateTime(now.year - 100),
      lastDate: now,
    );
    if (picked != null) setState(() => _dateOfBirth = picked);
  }

  Future<void> _handleSave() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter your name.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
      return;
    }
    setState(() => _isSaving = true);
    final success = await ref.read(userProfileProvider.notifier).updateProfile(
          fullName: _nameController.text.trim(),
          phoneNumber: _phoneController.text.trim(),
          dateOfBirth: _dateOfBirth,
          gender: _gender,
        );
    if (!mounted) return;
    setState(() => _isSaving = false);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Profile updated.', style: GoogleFonts.outfit()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not update your profile. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _initFromUser();
    final userAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Edit Profile', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(child: AvatarPicker(currentImageUrl: userAsync.value?.profileImageUrl)),
          const SizedBox(height: 28),
          _label('Full Name'),
          TextField(controller: _nameController, style: GoogleFonts.outfit(fontSize: 14)),
          const SizedBox(height: 18),
          _label('Phone Number'),
          TextField(controller: _phoneController, keyboardType: TextInputType.phone, style: GoogleFonts.outfit(fontSize: 14)),
          const SizedBox(height: 18),
          _label('Date of Birth'),
          GestureDetector(
            onTap: _pickDateOfBirth,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(color: AppColors.inputFill, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.inputBorder)),
              child: Row(
                children: [
                  const Icon(Icons.cake_outlined, size: 18, color: AppColors.textHint),
                  const SizedBox(width: 10),
                  Text(
                    _dateOfBirth == null ? 'Not set' : DateFormat('dd MMM yyyy').format(_dateOfBirth!),
                    style: GoogleFonts.outfit(fontSize: 14, color: _dateOfBirth == null ? AppColors.textHint : AppColors.textPrimary),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          _label('Gender (optional)'),
          Wrap(
            spacing: 10,
            children: ['Female', 'Male', 'Other'].map((option) {
              final isSelected = _gender == option;
              return ChoiceChip(
                label: Text(option, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w600)),
                selected: isSelected,
                onSelected: (_) => setState(() => _gender = isSelected ? null : option),
                selectedColor: AppColors.primary,
                backgroundColor: AppColors.surfaceLight,
                labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? AppColors.primary : AppColors.inputBorder)),
              );
            }).toList(),
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 54,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _handleSave,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              child: _isSaving
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text('Save Changes', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
      );
}
