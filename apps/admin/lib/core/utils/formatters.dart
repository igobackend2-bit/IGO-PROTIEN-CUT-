import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final _currency = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);
  static final _date = DateFormat('dd MMM yyyy');
  static final _dateTime = DateFormat('dd MMM yyyy, hh:mm a');
  static final _compactNumber = NumberFormat.compact();

  static String currency(num? value) => _currency.format(value ?? 0);

  static String date(DateTime? value) => value == null ? '—' : _date.format(value.toLocal());

  static String dateTime(DateTime? value) => value == null ? '—' : _dateTime.format(value.toLocal());

  static String compactNumber(num? value) => _compactNumber.format(value ?? 0);

  static DateTime? parseDate(String? value) => value == null ? null : DateTime.tryParse(value);
}
