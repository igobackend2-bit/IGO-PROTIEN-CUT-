import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/delivery_partner.dart';
import '../delivery_providers.dart';
import '../partners_controller.dart';

Future<bool?> showPartnerFormDialog(BuildContext context, {DeliveryPartner? existing}) {
  return showDialog<bool>(
    context: context,
    builder: (context) => _PartnerFormDialog(existing: existing),
  );
}

class _PartnerFormDialog extends ConsumerStatefulWidget {
  final DeliveryPartner? existing;

  const _PartnerFormDialog({this.existing});

  @override
  ConsumerState<_PartnerFormDialog> createState() => _PartnerFormDialogState();
}

class _PartnerFormDialogState extends ConsumerState<_PartnerFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _vehicleNumber;
  late final TextEditingController _vehicleType;
  late final TextEditingController _photoUrl;
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final p = widget.existing;
    _name = TextEditingController(text: p?.name ?? '');
    _phone = TextEditingController(text: p?.phone ?? '');
    _vehicleNumber = TextEditingController(text: p?.vehicleNumber ?? '');
    _vehicleType = TextEditingController(text: p?.vehicleType ?? '');
    _photoUrl = TextEditingController(text: p?.photoUrl ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _vehicleNumber.dispose();
    _vehicleType.dispose();
    _photoUrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final repo = ref.read(deliveryRepositoryProvider);
      if (_isEdit) {
        await repo.updatePartner(
          widget.existing!.id,
          name: _name.text.trim(),
          phone: _phone.text.trim(),
          vehicleNumber: _vehicleNumber.text.trim(),
          vehicleType: _vehicleType.text.trim(),
          photoUrl: _photoUrl.text.trim(),
        );
      } else {
        await repo.createPartner(
          name: _name.text.trim(),
          phone: _phone.text.trim(),
          vehicleNumber: _vehicleNumber.text.trim().isEmpty ? null : _vehicleNumber.text.trim(),
          vehicleType: _vehicleType.text.trim().isEmpty ? null : _vehicleType.text.trim(),
          photoUrl: _photoUrl.text.trim().isEmpty ? null : _photoUrl.text.trim(),
        );
      }
      await ref.read(partnersControllerProvider.notifier).refresh();
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(_isEdit ? 'Edit delivery partner' : 'New delivery partner'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phone,
                decoration: const InputDecoration(labelText: 'Phone'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(controller: _vehicleNumber, decoration: const InputDecoration(labelText: 'Vehicle number')),
              const SizedBox(height: 12),
              TextFormField(controller: _vehicleType, decoration: const InputDecoration(labelText: 'Vehicle type')),
              const SizedBox(height: 12),
              TextFormField(controller: _photoUrl, decoration: const InputDecoration(labelText: 'Photo URL')),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: _saving ? null : () => Navigator.of(context).pop(false), child: const Text('Cancel')),
        FilledButton(
          onPressed: _saving ? null : _save,
          child: _saving
              ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Save'),
        ),
      ],
    );
  }
}
