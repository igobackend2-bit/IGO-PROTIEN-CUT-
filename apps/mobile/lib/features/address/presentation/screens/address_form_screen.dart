import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/address_model.dart';
import '../../../../utils/app_colors.dart';
import '../../domain/entities/detected_location.dart';
import '../../domain/entities/pincode_check_result.dart';
import '../providers/address_providers.dart';
import '../widgets/address_type_selector.dart';
import '../widgets/use_current_location_button.dart';

/// Shared Add/Edit screen — [existing] null means "add new".
class AddressFormScreen extends ConsumerStatefulWidget {
  final Address? existing;
  const AddressFormScreen({super.key, this.existing});

  @override
  ConsumerState<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends ConsumerState<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late final _fullName = TextEditingController(text: widget.existing?.fullName);
  late final _phone = TextEditingController(text: widget.existing?.phone);
  late final _house = TextEditingController(text: widget.existing?.house);
  late final _street = TextEditingController(text: widget.existing?.street);
  late final _area = TextEditingController(text: widget.existing?.area);
  late final _landmark = TextEditingController(text: widget.existing?.landmark);
  late final _city = TextEditingController(text: widget.existing?.city);
  late final _state = TextEditingController(text: widget.existing?.state);
  late final _pincode = TextEditingController(text: widget.existing?.pincode);
  final _pincodeFocus = FocusNode();

  late AddressType _addressType = widget.existing?.addressType ?? AddressType.home;
  late bool _isDefault = widget.existing?.isDefault ?? false;
  double? _latitude;
  double? _longitude;

  bool _isSaving = false;
  PincodeCheckResult? _pincodeResult;
  bool _isCheckingPincode = false;

  bool get _isEditing => widget.existing != null;

  @override
  void initState() {
    super.initState();
    _latitude = widget.existing?.latitude;
    _longitude = widget.existing?.longitude;
    _pincodeFocus.addListener(() {
      if (!_pincodeFocus.hasFocus) _checkPincode();
    });
  }

  @override
  void dispose() {
    _fullName.dispose();
    _phone.dispose();
    _house.dispose();
    _street.dispose();
    _area.dispose();
    _landmark.dispose();
    _city.dispose();
    _state.dispose();
    _pincode.dispose();
    _pincodeFocus.dispose();
    super.dispose();
  }

  Future<void> _checkPincode() async {
    final value = _pincode.text.trim();
    if (!RegExp(r'^[1-9][0-9]{5}$').hasMatch(value)) {
      setState(() => _pincodeResult = null);
      return;
    }
    setState(() => _isCheckingPincode = true);
    final result = await ref.read(addressRepositoryProvider).checkServiceability(value);
    if (!mounted) return;
    setState(() {
      _isCheckingPincode = false;
      _pincodeResult = result;
    });
  }

  void _applyDetectedLocation(DetectedLocation location) {
    setState(() {
      _latitude = location.latitude;
      _longitude = location.longitude;
      if (location.street.isNotEmpty) _street.text = location.street;
      if (location.area.isNotEmpty) _area.text = location.area;
      if (location.city.isNotEmpty) _city.text = location.city;
      if (location.state.isNotEmpty) _state.text = location.state;
      if (location.pincode.isNotEmpty) _pincode.text = location.pincode;
    });
    _checkPincode();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Location detected — please review the filled-in fields.', style: GoogleFonts.outfit()),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_pincodeResult != null && !_pincodeResult!.isServiceable) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("We don't deliver to this pincode yet.", style: GoogleFonts.outfit()),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    final now = DateTime.now();
    final draft = Address(
      id: widget.existing?.id ?? '',
      userId: widget.existing?.userId ?? '',
      fullName: _fullName.text.trim(),
      phone: _phone.text.trim(),
      house: _house.text.trim(),
      street: _street.text.trim(),
      area: _area.text.trim(),
      landmark: _landmark.text.trim().isEmpty ? null : _landmark.text.trim(),
      city: _city.text.trim(),
      state: _state.text.trim(),
      pincode: _pincode.text.trim(),
      latitude: _latitude,
      longitude: _longitude,
      addressType: _addressType,
      isDefault: _isDefault,
      createdAt: widget.existing?.createdAt ?? now,
      updatedAt: now,
    );

    final notifier = ref.read(addressListProvider.notifier);
    final success = _isEditing ? await notifier.updateAddress(draft) : await notifier.addAddress(draft);

    if (!mounted) return;
    setState(() => _isSaving = false);
    if (success) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Address' : 'Add Address', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
          children: [
            UseCurrentLocationButton(onDetected: _applyDetectedLocation),
            const SizedBox(height: 20),
            _label('Address Type'),
            const SizedBox(height: 8),
            AddressTypeSelector(selected: _addressType, onChanged: (t) => setState(() => _addressType = t)),
            const SizedBox(height: 20),
            _field(_fullName, 'Full Name', required: true),
            _field(_phone, 'Mobile Number', required: true, keyboardType: TextInputType.phone, validator: _phoneValidator),
            _field(_house, 'House / Flat No.', required: true),
            _field(_street, 'Street', required: true),
            _field(_area, 'Area / Locality', required: true),
            _field(_landmark, 'Landmark (Optional)', required: false),
            _field(_city, 'City', required: true),
            _field(_state, 'State', required: true),
            _pincodeField(),
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _isDefault,
              onChanged: (v) => setState(() => _isDefault = v),
              activeThumbColor: AppColors.primary,
              title: Text('Set as Default Address', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14)),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _isSaving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_isEditing ? 'Save Changes' : 'Save Address', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String? _phoneValidator(String? value) {
    final digits = (value ?? '').replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10) return 'Enter a valid 10-digit number';
    return null;
  }

  Widget _label(String text) => Text(text, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary));

  Widget _field(
    TextEditingController controller,
    String label, {
    required bool required,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    FocusNode? focusNode,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        focusNode: focusNode,
        keyboardType: keyboardType,
        style: GoogleFonts.outfit(fontSize: 14),
        validator: validator ?? (required ? (v) => (v == null || v.trim().isEmpty) ? '$label is required' : null : null),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary),
          filled: true,
          fillColor: AppColors.inputFill,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.inputBorder)),
        ),
      ),
    );
  }

  Widget _pincodeField() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _pincode,
            focusNode: _pincodeFocus,
            keyboardType: TextInputType.number,
            maxLength: 6,
            style: GoogleFonts.outfit(fontSize: 14),
            onChanged: (_) => setState(() => _pincodeResult = null),
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Pincode is required';
              if (!RegExp(r'^[1-9][0-9]{5}$').hasMatch(v.trim())) return 'Enter a valid 6-digit Indian pincode';
              return null;
            },
            decoration: InputDecoration(
              labelText: 'Pincode',
              counterText: '',
              labelStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary),
              filled: true,
              fillColor: AppColors.inputFill,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.inputBorder)),
              suffixIcon: _isCheckingPincode
                  ? const Padding(
                      padding: EdgeInsets.all(14),
                      child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  : null,
            ),
          ),
          if (_pincodeResult != null)
            Padding(
              padding: const EdgeInsets.only(top: 6, left: 4),
              child: Row(
                children: [
                  Icon(
                    _pincodeResult!.isServiceable ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    size: 14,
                    color: _pincodeResult!.isServiceable ? AppColors.success : AppColors.error,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _pincodeResult!.message,
                    style: GoogleFonts.outfit(fontSize: 11.5, color: _pincodeResult!.isServiceable ? AppColors.success : AppColors.error, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
