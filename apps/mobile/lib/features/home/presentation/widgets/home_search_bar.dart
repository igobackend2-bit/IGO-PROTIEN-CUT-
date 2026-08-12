import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

/// Search bar with a built-in voice-search mic. Self-contained to the Home
/// module: it navigates to the existing `/products` route with a search
/// term, it doesn't reach into other screens.
class HomeSearchBar extends ConsumerStatefulWidget {
  const HomeSearchBar({super.key});

  @override
  ConsumerState<HomeSearchBar> createState() => _HomeSearchBarState();
}

class _HomeSearchBarState extends ConsumerState<HomeSearchBar> {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  String _hint = "Search 'Chicken Breast', 'Salmon'...";
  bool _navigated = false;

  @override
  void dispose() {
    if (_speech.isListening) _speech.stop();
    super.dispose();
  }

  Future<void> _toggleVoiceSearch() async {
    if (_isListening) {
      await _speech.stop();
      setState(() => _isListening = false);
      return;
    }

    _navigated = false;
    final available = await _speech.initialize(
      onError: (_) {
        if (!mounted) return;
        setState(() {
          _isListening = false;
          _hint = 'Voice search failed. Try again.';
        });
      },
      onStatus: (status) {
        if (!mounted) return;
        if (status == 'done' || status == 'notListening') {
          setState(() => _isListening = false);
          _navigateIfNeeded();
        }
      },
    );

    if (!available) {
      if (!mounted) return;
      setState(() => _hint = 'Voice search not available on this device.');
      return;
    }

    setState(() {
      _isListening = true;
      _hint = 'Listening...';
    });

    _speech.listen(
      onResult: (result) {
        if (!mounted) return;
        final words = result.recognizedWords;
        setState(() {
          _hint = words.isNotEmpty ? words : "Search 'Chicken Breast', 'Salmon'...";
        });
        if ((result.finalResult || !_speech.isListening) && words.isNotEmpty) {
          setState(() => _isListening = false);
          _navigateIfNeeded();
        }
      },
      listenFor: const Duration(seconds: 10),
      pauseFor: const Duration(seconds: 3),
      localeId: 'en_IN',
    );
  }

  void _navigateIfNeeded() {
    if (_navigated) return;
    final words = _hint.trim();
    final isPlaceholder = words.isEmpty ||
        words == 'Listening...' ||
        words == 'Voice search failed. Try again.' ||
        words == "Search 'Chicken Breast', 'Salmon'...";
    if (isPlaceholder) return;
    _navigated = true;
    Navigator.pushNamed(context, '/products', arguments: words).then((_) {
      if (mounted) setState(() => _hint = "Search 'Chicken Breast', 'Salmon'...");
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.10),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.search_rounded, color: Colors.grey, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => Navigator.pushNamed(context, '/products'),
              child: Text(
                _hint,
                style: GoogleFonts.outfit(
                  color: _isListening ? const Color(0xFFE67E22) : Colors.grey[600],
                  fontSize: 14,
                  fontWeight: _isListening ? FontWeight.w600 : FontWeight.w400,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          Container(height: 22, width: 1, color: Colors.grey[300]),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: _toggleVoiceSearch,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isListening ? const Color(0xFFE67E22).withOpacity(0.15) : Colors.transparent,
              ),
              child: Icon(
                _isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                color: _isListening ? const Color(0xFFE67E22) : Colors.grey[500],
                size: 22,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
