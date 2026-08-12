import 'dart:js_interop';

import 'package:web/web.dart' as web;

/// Triggers a browser file-save for CSV text returned by
/// `admin-reports generate(format:'csv')`. This project targets Flutter Web
/// only, so a direct `package:web` dependency (no conditional import) is
/// intentional — the modern, properly-typed replacement for `dart:html`.
void downloadCsv(String csv, String fileName) {
  final blob = web.Blob(
    [csv.toJS].toJS,
    web.BlobPropertyBag(type: 'text/csv;charset=utf-8'),
  );
  final url = web.URL.createObjectURL(blob);
  final anchor = web.document.createElement('a') as web.HTMLAnchorElement
    ..href = url
    ..download = fileName;
  anchor.click();
  web.URL.revokeObjectURL(url);
}
