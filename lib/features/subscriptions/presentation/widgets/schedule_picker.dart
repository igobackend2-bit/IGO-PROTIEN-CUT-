import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../models/subscription_schedule.dart';
import '../../../../utils/app_colors.dart';

class ScheduleConfig {
  final ScheduleType scheduleType;
  final int interval;
  final List<int> weekdays;
  final DateTime startDate;

  const ScheduleConfig({required this.scheduleType, required this.interval, required this.weekdays, required this.startDate});
}

/// Schedule type + weekday + start-date configuration — the "Calendar
/// Scheduler" deliverable. Self-contained state, reports the full config up
/// via [onChanged] whenever anything changes.
class SchedulePicker extends StatefulWidget {
  final ScheduleConfig initial;
  final ValueChanged<ScheduleConfig> onChanged;

  const SchedulePicker({super.key, required this.initial, required this.onChanged});

  @override
  State<SchedulePicker> createState() => _SchedulePickerState();
}

class _SchedulePickerState extends State<SchedulePicker> {
  late ScheduleType _scheduleType = widget.initial.scheduleType;
  late int _interval = widget.initial.interval;
  late List<int> _weekdays = List.of(widget.initial.weekdays);
  late DateTime _startDate = widget.initial.startDate;

  void _emit() {
    widget.onChanged(ScheduleConfig(scheduleType: _scheduleType, interval: _interval, weekdays: _weekdays, startDate: _startDate));
  }

  Future<void> _pickStartDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _startDate = picked);
      _emit();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label('Frequency'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ScheduleType.values.map((type) {
            final isSelected = type == _scheduleType;
            return ChoiceChip(
              label: Text(type.label, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w600)),
              selected: isSelected,
              onSelected: (_) {
                setState(() {
                  _scheduleType = type;
                  if (type == ScheduleType.custom && _weekdays.isEmpty) _weekdays = [DateTime.now().weekday];
                });
                _emit();
              },
              selectedColor: AppColors.primary,
              backgroundColor: AppColors.surfaceLight,
              labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? AppColors.primary : AppColors.inputBorder)),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),
        if (_scheduleType == ScheduleType.custom) ...[
          _label('Delivery Days'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: List.generate(7, (i) {
              final day = i + 1; // Mon=1 .. Sun=7
              final isSelected = _weekdays.contains(day);
              return GestureDetector(
                onTap: () {
                  setState(() {
                    if (isSelected) {
                      _weekdays.remove(day);
                    } else {
                      _weekdays.add(day);
                    }
                  });
                  _emit();
                },
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : AppColors.surfaceLight,
                    shape: BoxShape.circle,
                    border: Border.all(color: isSelected ? AppColors.primary : AppColors.inputBorder),
                  ),
                  child: Text(weekdayLabels[i], style: GoogleFonts.outfit(fontSize: 10.5, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : AppColors.textSecondary)),
                ),
              );
            }),
          ),
        ] else ...[
          _label('Repeat Every'),
          Row(
            children: [
              SizedBox(
                width: 90,
                child: TextFormField(
                  initialValue: '$_interval',
                  keyboardType: TextInputType.number,
                  style: GoogleFonts.outfit(fontSize: 14),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: AppColors.inputFill,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  onChanged: (value) {
                    final parsed = int.tryParse(value);
                    if (parsed != null && parsed > 0) {
                      _interval = parsed;
                      _emit();
                    }
                  },
                ),
              ),
              const SizedBox(width: 10),
              Text(
                _scheduleType == ScheduleType.daily ? (_interval == 1 ? 'day' : 'days') : (_interval == 1 ? (_scheduleType == ScheduleType.weekly ? 'week' : 'month') : (_scheduleType == ScheduleType.weekly ? 'weeks' : 'months')),
                style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary),
              ),
            ],
          ),
        ],
        const SizedBox(height: 16),
        _label('Start Date'),
        GestureDetector(
          onTap: _pickStartDate,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(color: AppColors.inputFill, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.inputBorder)),
            child: Row(
              children: [
                const Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.primary),
                const SizedBox(width: 10),
                Text(DateFormat('dd MMM yyyy').format(_startDate), style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
      );
}
