import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/coupon.dart';
import '../coupons_list_controller.dart';
import '../coupons_providers.dart';

Future<bool?> showCouponFormDialog(BuildContext context, {Coupon? existing}) {
  return showDialog<bool>(context: context, builder: (context) => _CouponFormDialog(existing: existing));
}

class _CouponFormDialog extends ConsumerStatefulWidget {
  final Coupon? existing;

  const _CouponFormDialog({this.existing});

  @override
  ConsumerState<_CouponFormDialog> createState() => _CouponFormDialogState();
}

class _CouponFormDialogState extends ConsumerState<_CouponFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _code;
  late final TextEditingController _description;
  late final TextEditingController _discountValue;
  late final TextEditingController _minOrderValue;
  late final TextEditingController _usageLimit;
  late final TextEditingController _expiresAt;
  String _discountType = 'flat';
  bool _isActive = true;
  bool _oneTimeUse = false;
  bool _firstOrderOnly = false;
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final c = widget.existing;
    _code = TextEditingController(text: c?.code ?? '');
    _description = TextEditingController(text: c?.description ?? '');
    _discountValue = TextEditingController(text: c == null ? '' : c.discountValue.toString());
    _minOrderValue = TextEditingController(text: c?.minOrderValue?.toString() ?? '');
    _usageLimit = TextEditingController(text: c?.usageLimit?.toString() ?? '');
    _expiresAt = TextEditingController(text: c?.expiresAt?.toIso8601String().split('T').first ?? '');
    _discountType = c?.discountType ?? 'flat';
    _isActive = c?.isActive ?? true;
    _oneTimeUse = c?.oneTimeUse ?? false;
    _firstOrderOnly = c?.firstOrderOnly ?? false;
  }

  @override
  void dispose() {
    _code.dispose();
    _description.dispose();
    _discountValue.dispose();
    _minOrderValue.dispose();
    _usageLimit.dispose();
    _expiresAt.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    final draft = Coupon(
      id: widget.existing?.id ?? '',
      code: _code.text.trim().toUpperCase(),
      description: _description.text.trim().isEmpty ? null : _description.text.trim(),
      discountType: _discountType,
      discountValue: num.tryParse(_discountValue.text.trim()) ?? 0,
      minOrderValue: num.tryParse(_minOrderValue.text.trim()),
      isActive: _isActive,
      expiresAt: DateTime.tryParse(_expiresAt.text.trim()),
      usageLimit: int.tryParse(_usageLimit.text.trim()),
      oneTimeUse: _oneTimeUse,
      firstOrderOnly: _firstOrderOnly,
    );
    try {
      final repo = ref.read(couponsRepositoryProvider);
      if (_isEdit) {
        await repo.updateCoupon(widget.existing!.id, draft);
      } else {
        await repo.createCoupon(draft.code, draft);
      }
      await ref.read(couponsListControllerProvider.notifier).refresh();
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
    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 620),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_isEdit ? 'Edit coupon' : 'New coupon', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          controller: _code,
                          decoration: const InputDecoration(labelText: 'Code'),
                          textCapitalization: TextCapitalization.characters,
                          enabled: !_isEdit,
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _description,
                          decoration: const InputDecoration(labelText: 'Description'),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: _discountType,
                                decoration: const InputDecoration(labelText: 'Discount type'),
                                items: const [
                                  DropdownMenuItem(value: 'flat', child: Text('Flat')),
                                  DropdownMenuItem(value: 'percentage', child: Text('Percentage')),
                                ],
                                onChanged: (v) => setState(() => _discountType = v ?? 'flat'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _discountValue,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Discount value'),
                                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _minOrderValue,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Min order value'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _usageLimit,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Usage limit'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _expiresAt,
                          decoration: const InputDecoration(labelText: 'Expires at (YYYY-MM-DD)'),
                        ),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Active'),
                          value: _isActive,
                          onChanged: (v) => setState(() => _isActive = v),
                        ),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('One-time use per customer'),
                          value: _oneTimeUse,
                          onChanged: (v) => setState(() => _oneTimeUse = v),
                        ),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('First order only'),
                          value: _firstOrderOnly,
                          onChanged: (v) => setState(() => _firstOrderOnly = v),
                        ),
                        if (_error != null) ...[
                          const SizedBox(height: 8),
                          Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: _saving ? null : () => Navigator.of(context).pop(false),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 8),
                    FilledButton(
                      onPressed: _saving ? null : _save,
                      child: _saving
                          ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Save'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
