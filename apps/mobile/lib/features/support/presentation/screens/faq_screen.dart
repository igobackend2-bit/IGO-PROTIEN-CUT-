import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/faq_item.dart';
import '../providers/support_providers.dart';
import '../widgets/support_states.dart';

class FaqScreen extends ConsumerStatefulWidget {
  const FaqScreen({super.key});

  @override
  ConsumerState<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends ConsumerState<FaqScreen> {
  final _searchController = TextEditingController();
  String _query = '';
  String? _selectedCategory;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(faqProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('FAQs', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Builder(
        builder: (context) {
          if (state.isLoading) return const SupportSkeleton();
          if (state.error != null) return SupportErrorState(onRetry: () => ref.read(faqProvider.notifier).retry());
          if (state.faqs.isEmpty) {
            return const SupportEmptyState(icon: Icons.help_outline_rounded, title: 'No FAQs yet', message: 'Check back soon, or contact support directly.');
          }

          final categories = ['All', ...{for (final f in state.faqs) f.category}];
          final filtered = state.faqs.where((f) {
            final matchesCategory = _selectedCategory == null || _selectedCategory == 'All' || f.category == _selectedCategory;
            final q = _query.trim().toLowerCase();
            final matchesQuery = q.isEmpty || f.question.toLowerCase().contains(q) || f.answer.toLowerCase().contains(q);
            return matchesCategory && matchesQuery;
          }).toList();

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                child: TextField(
                  controller: _searchController,
                  onChanged: (v) => setState(() => _query = v),
                  style: GoogleFonts.outfit(fontSize: 13.5),
                  decoration: InputDecoration(
                    hintText: 'Search FAQs…',
                    hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint),
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textHint, size: 20),
                    suffixIcon: _query.isEmpty
                        ? null
                        : IconButton(
                            icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.textHint),
                            onPressed: () => setState(() {
                              _searchController.clear();
                              _query = '';
                            }),
                          ),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 4),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.divider)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.divider)),
                  ),
                ),
              ),
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final category = categories[index];
                    final selected = (category == 'All' && _selectedCategory == null) || category == _selectedCategory;
                    return ChoiceChip(
                      label: Text(category, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: selected ? Colors.white : AppColors.textPrimary)),
                      selected: selected,
                      onSelected: (_) => setState(() => _selectedCategory = category == 'All' ? null : category),
                      selectedColor: AppColors.primary,
                      backgroundColor: Colors.white,
                      side: BorderSide(color: selected ? AppColors.primary : AppColors.divider),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: filtered.isEmpty
                    ? Center(child: Text('No matching FAQs.', style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint)))
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) => _FaqTile(item: filtered[index]),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _FaqTile extends ConsumerStatefulWidget {
  final FaqItem item;
  const _FaqTile({required this.item});

  @override
  ConsumerState<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends ConsumerState<_FaqTile> {
  bool? _voted; // true = helpful, false = not helpful, null = not yet voted

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.divider)),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          title: Text(widget.item.question, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
          expandedCrossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.item.answer, style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary, height: 1.45)),
            const SizedBox(height: 12),
            Row(
              children: [
                Text('Was this helpful?', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textHint)),
                const SizedBox(width: 10),
                _feedbackButton(icon: Icons.thumb_up_alt_rounded, active: _voted == true, onTap: () => _vote(true)),
                const SizedBox(width: 8),
                _feedbackButton(icon: Icons.thumb_down_alt_rounded, active: _voted == false, onTap: () => _vote(false)),
                if (_voted != null) ...[
                  const SizedBox(width: 8),
                  Text('Thanks for the feedback!', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600)),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _vote(bool helpful) {
    if (_voted != null) return;
    setState(() => _voted = helpful);
    ref.read(faqProvider.notifier).submitFeedback(widget.item.id, helpful: helpful);
  }

  Widget _feedbackButton({required IconData icon, required bool active, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: active ? AppColors.primary.withOpacity(0.12) : AppColors.surfaceLight, borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, size: 15, color: active ? AppColors.primary : AppColors.textHint),
      ),
    );
  }
}
