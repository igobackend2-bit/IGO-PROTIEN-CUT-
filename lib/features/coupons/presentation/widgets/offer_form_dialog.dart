import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/offer.dart';
import '../coupons_providers.dart';
import '../offers_list_controller.dart';

Future<bool?> showOfferFormDialog(BuildContext context, {Offer? existing}) {
  return showDialog<bool>(context: context, builder: (context) => _OfferFormDialog(existing: existing));
}

class _OfferFormDialog extends ConsumerStatefulWidget {
  final Offer? existing;

  const _OfferFormDialog({this.existing});

  @override
  ConsumerState<_OfferFormDialog> createState() => _OfferFormDialogState();
}

class _OfferFormDialogState extends ConsumerState<_OfferFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _title;
  late final TextEditingController _description;
  late final TextEditingController _discountValue;
  late final TextEditingController _bannerImageUrl;
  late final TextEditingController _startDate;
  late final TextEditingController _endDate;
  late final TextEditingController _priority;
  String _type = 'banner';
  String _discountType = 'flat';
  bool _active = true;
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final o = widget.existing;
    _title = TextEditingController(text: o?.title ?? '');
    _description = TextEditingController(text: o?.description ?? '');
    _discountValue = TextEditingController(text: o?.discountValue?.toString() ?? '');
    _bannerImageUrl = TextEditingController(text: o?.bannerImageUrl ?? '');
    _startDate = TextEditingController(text: o?.startDate?.toIso8601String().split('T').first ?? '');
    _endDate = TextEditingController(text: o?.endDate?.toIso8601String().split('T').first ?? '');
    _priority = TextEditingController(text: (o?.priority ?? 0).toString());
    _type = o?.type ?? 'banner';
    _discountType = o?.discountType ?? 'flat';
    _active = o?.active ?? true;
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _discountValue.dispose();
    _bannerImageUrl.dispose();
    _startDate.dispose();
    _endDate.dispose();
    _priority.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    final draft = Offer(
      id: widget.existing?.id ?? '',
      type: _type,
      title: _title.text.trim(),
      description: _description.text.trim().isEmpty ? null : _description.text.trim(),
      discountType: _discountType,
      discountValue: num.tryParse(_discountValue.text.trim()),
      startDate: DateTime.tryParse(_startDate.text.trim()),
      endDate: DateTime.tryParse(_endDate.text.trim()),
      priority: int.tryParse(_priority.text.trim()) ?? 0,
      active: _active,
      bannerImageUrl: _bannerImageUrl.text.trim().isEmpty ? null : _bannerImageUrl.text.trim(),
    );
    try {
      final repo = ref.read(couponsRepositoryProvider);
      if (_isEdit) {
        await repo.updateOffer(widget.existing!.id, draft);
      } else {
        await repo.createOffer(draft);
      }
      await ref.read(offersListControllerProvider.notifier).refresh();
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
                Text(_isEdit ? 'Edit offer' : 'New offer', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          controller: _title,
                          decoration: const InputDecoration(labelText: 'Title'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          initialValue: _type,
                          decoration: const InputDecoration(labelText: 'Type'),
                          items: const [
                            DropdownMenuItem(value: 'banner', child: Text('Banner')),
                            DropdownMenuItem(value: 'flash_sale', child: Text('Flash sale')),
                            DropdownMenuItem(value: 'seasonal', child: Text('Seasonal')),
                          ],
                          onChanged: (v) => setState(() => _type = v ?? 'banner'),
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
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _startDate,
                                decoration: const InputDecoration(labelText: 'Start (YYYY-MM-DD)'),
                                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _endDate,
                                decoration: const InputDecoration(labelText: 'End (YYYY-MM-DD)'),
                                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _priority,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Priority'),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _bannerImageUrl,
                          decoration: const InputDecoration(labelText: 'Banner image URL'),
                        ),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Active'),
                          value: _active,
                          onChanged: (v) => setState(() => _active = v),
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
