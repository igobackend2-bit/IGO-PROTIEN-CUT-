import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/support_ticket.dart';
import '../faqs_controller.dart';
import '../support_providers.dart';

Future<bool?> showFaqFormDialog(BuildContext context, {Faq? existing}) {
  return showDialog<bool>(context: context, builder: (context) => _FaqFormDialog(existing: existing));
}

class _FaqFormDialog extends ConsumerStatefulWidget {
  final Faq? existing;

  const _FaqFormDialog({this.existing});

  @override
  ConsumerState<_FaqFormDialog> createState() => _FaqFormDialogState();
}

class _FaqFormDialogState extends ConsumerState<_FaqFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _category;
  late final TextEditingController _question;
  late final TextEditingController _answer;
  late final TextEditingController _priority;
  bool _saving = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final f = widget.existing;
    _category = TextEditingController(text: f?.category ?? '');
    _question = TextEditingController(text: f?.question ?? '');
    _answer = TextEditingController(text: f?.answer ?? '');
    _priority = TextEditingController(text: (f?.priority ?? 0).toString());
  }

  @override
  void dispose() {
    _category.dispose();
    _question.dispose();
    _answer.dispose();
    _priority.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final repo = ref.read(supportRepositoryProvider);
      if (_isEdit) {
        await repo.updateFaq(
          widget.existing!.id,
          category: _category.text.trim(),
          question: _question.text.trim(),
          answer: _answer.text.trim(),
          priority: int.tryParse(_priority.text.trim()),
        );
      } else {
        await repo.createFaq(
          category: _category.text.trim(),
          question: _question.text.trim(),
          answer: _answer.text.trim(),
          priority: int.tryParse(_priority.text.trim()),
        );
      }
      await ref.read(faqsControllerProvider.notifier).refresh();
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
      title: Text(_isEdit ? 'Edit FAQ' : 'New FAQ'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 420,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _category,
                decoration: const InputDecoration(labelText: 'Category'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _question,
                decoration: const InputDecoration(labelText: 'Question'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _answer,
                decoration: const InputDecoration(labelText: 'Answer'),
                maxLines: 3,
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _priority,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Priority'),
              ),
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
