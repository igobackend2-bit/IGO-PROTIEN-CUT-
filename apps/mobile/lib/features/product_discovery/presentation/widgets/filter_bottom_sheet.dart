import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/product_filter_options.dart';
import '../../domain/entities/product_filter_state.dart';
import '../../domain/entities/weight_bucket.dart';

/// Opens the advanced-filter sheet and resolves with the new filter state,
/// or null if the user dismissed it without applying.
Future<ProductFilterState?> showFilterBottomSheet(
  BuildContext context, {
  required ProductFilterState current,
  required ProductFilterOptions options,
}) {
  return showModalBottomSheet<ProductFilterState>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (context) => _FilterSheetContent(current: current, options: options),
  );
}

class _FilterSheetContent extends StatefulWidget {
  final ProductFilterState current;
  final ProductFilterOptions options;
  const _FilterSheetContent({required this.current, required this.options});

  @override
  State<_FilterSheetContent> createState() => _FilterSheetContentState();
}

class _FilterSheetContentState extends State<_FilterSheetContent> {
  late Set<String> _proteinTypes;
  late Set<WeightBucket> _weightBuckets;
  late Set<String> _brands;
  late RangeValues _priceRange;
  late bool _onlyAvailable;
  double? _minRating;

  @override
  void initState() {
    super.initState();
    _proteinTypes = {...widget.current.proteinTypes};
    _weightBuckets = {...widget.current.weightBuckets};
    _brands = {...widget.current.brands};
    _priceRange = widget.current.priceRange ??
        RangeValues(widget.options.minPrice, widget.options.maxPrice);
    _onlyAvailable = widget.current.onlyAvailable;
    _minRating = widget.current.minRating;
  }

  int get _activeCount =>
      _proteinTypes.length +
      _weightBuckets.length +
      _brands.length +
      (_onlyAvailable ? 1 : 0) +
      (_minRating != null ? 1 : 0) +
      ((_priceRange.start != widget.options.minPrice || _priceRange.end != widget.options.maxPrice) ? 1 : 0);

  void _reset() {
    setState(() {
      _proteinTypes = {};
      _weightBuckets = {};
      _brands = {};
      _priceRange = RangeValues(widget.options.minPrice, widget.options.maxPrice);
      _onlyAvailable = false;
      _minRating = null;
    });
  }

  void _apply() {
    final samePriceAsBounds =
        _priceRange.start == widget.options.minPrice && _priceRange.end == widget.options.maxPrice;
    Navigator.pop(
      context,
      widget.current.copyWith(
        proteinTypes: _proteinTypes,
        weightBuckets: _weightBuckets,
        brands: _brands,
        onlyAvailable: _onlyAvailable,
        priceRange: samePriceAsBounds ? null : _priceRange,
        clearPriceRange: samePriceAsBounds,
        minRating: _minRating,
        clearMinRating: _minRating == null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final options = widget.options;

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Filters', style: GoogleFonts.outfit(fontSize: 19, fontWeight: FontWeight.w800)),
                  TextButton(
                    onPressed: _reset,
                    child: Text('Reset', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
                children: [
                  if (options.proteinTypes.isNotEmpty) ...[
                    _sectionTitle('Protein Type'),
                    _chipsWrap(
                      options: options.proteinTypes,
                      selected: _proteinTypes,
                      onToggle: (v) => setState(() => _toggle(_proteinTypes, v)),
                    ),
                    const SizedBox(height: 20),
                  ],
                  if (options.availableWeightBuckets.isNotEmpty) ...[
                    _sectionTitle('Weight'),
                    _chipsWrap(
                      options: options.availableWeightBuckets.map((b) => b.label).toList(),
                      selected: _weightBuckets.map((b) => b.label).toSet(),
                      onToggle: (label) {
                        final bucket = options.availableWeightBuckets.firstWhere((b) => b.label == label);
                        setState(() => _toggle(_weightBuckets, bucket));
                      },
                    ),
                    const SizedBox(height: 20),
                  ],
                  if (options.maxPrice > options.minPrice) ...[
                    _sectionTitle('Price Range'),
                    Row(
                      children: [
                        Text('₹${_priceRange.start.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 12)),
                        Expanded(
                          child: RangeSlider(
                            values: _priceRange,
                            min: options.minPrice,
                            max: options.maxPrice,
                            divisions: 20,
                            activeColor: AppColors.primary,
                            inactiveColor: AppColors.inputBorder,
                            labels: RangeLabels(
                              '₹${_priceRange.start.toStringAsFixed(0)}',
                              '₹${_priceRange.end.toStringAsFixed(0)}',
                            ),
                            onChanged: (v) => setState(() => _priceRange = v),
                          ),
                        ),
                        Text('₹${_priceRange.end.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (options.hasRatingData) ...[
                    _sectionTitle('Rating'),
                    _chipsWrap(
                      options: const ['4★ & up', '3★ & up', '2★ & up'],
                      selected: _minRating == null
                          ? {}
                          : {
                              _minRating == 4
                                  ? '4★ & up'
                                  : _minRating == 3
                                      ? '3★ & up'
                                      : '2★ & up'
                            },
                      onToggle: (label) {
                        final value = label.startsWith('4') ? 4.0 : (label.startsWith('3') ? 3.0 : 2.0);
                        setState(() => _minRating = _minRating == value ? null : value);
                      },
                    ),
                    const SizedBox(height: 20),
                  ],
                  if (options.brands.isNotEmpty) ...[
                    _sectionTitle('Brand'),
                    _chipsWrap(
                      options: options.brands,
                      selected: _brands,
                      onToggle: (v) => setState(() => _toggle(_brands, v)),
                    ),
                    const SizedBox(height: 20),
                  ],
                  if (options.hasAvailabilityData)
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      value: _onlyAvailable,
                      onChanged: (v) => setState(() => _onlyAvailable = v),
                      activeThumbColor: AppColors.primary,
                      title: Text('In Stock Only', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14)),
                    ),
                ],
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                child: SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _apply,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(
                      _activeCount > 0 ? 'Apply Filters ($_activeCount)' : 'Apply Filters',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _toggle<T>(Set<T> set, T value) {
    if (set.contains(value)) {
      set.remove(value);
    } else {
      set.add(value);
    }
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
    );
  }

  Widget _chipsWrap({
    required List<String> options,
    required Set<String> selected,
    required ValueChanged<String> onToggle,
  }) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.map((option) {
        final isSelected = selected.contains(option);
        return GestureDetector(
          onTap: () => onToggle(option),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isSelected ? AppColors.primary : AppColors.inputBorder),
            ),
            child: Text(
              option,
              style: GoogleFonts.outfit(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
