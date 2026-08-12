import 'dart:async';

/// Delays invoking [run] until [duration] has passed without a new call —
/// used to avoid firing a network search on every keystroke.
class Debouncer {
  final Duration duration;
  Timer? _timer;

  Debouncer({this.duration = const Duration(milliseconds: 400)});

  void run(void Function() action) {
    _timer?.cancel();
    _timer = Timer(duration, action);
  }

  void dispose() => _timer?.cancel();
}
