import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../../../../utils/app_colors.dart';
import '../providers/product_discovery_providers.dart';

/// Rich search input: type-ahead suggestions, trending searches, recent
/// searches, and an improved voice search (live partial transcript shown
/// inline, distinct error/permission-denied messaging, auto-saves to
/// recent searches on a final result).
class DiscoverySearchField extends ConsumerStatefulWidget {
  final String initialQuery;
  final ValueChanged<String> onSubmit;

  const DiscoverySearchField({super.key, required this.initialQuery, required this.onSubmit});

  @override
  ConsumerState<DiscoverySearchField> createState() => _DiscoverySearchFieldState();
}

class _DiscoverySearchFieldState extends ConsumerState<DiscoverySearchField> {
  late final TextEditingController _controller;
  final FocusNode _focusNode = FocusNode();
  final stt.SpeechToText _speech = stt.SpeechToText();

  bool _panelOpen = false;
  bool _isListening = false;
  String? _voiceError;

  // Suggestions are debounced off the raw controller text so typing
  // quickly doesn't fire a suggestions lookup on every keystroke.
  late String _debouncedQuery;
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialQuery);
    _debouncedQuery = widget.initialQuery.trim();
    _focusNode.addListener(() {
      setState(() => _panelOpen = _focusNode.hasFocus);
    });
    _controller.addListener(_onTextChanged);
  }

  void _onTextChanged() {
    setState(() {}); // immediate UI feedback (clear button, hint state)
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      setState(() => _debouncedQuery = _controller.text.trim());
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _controller.removeListener(_onTextChanged);
    _controller.dispose();
    _focusNode.dispose();
    if (_speech.isListening) _speech.stop();
    super.dispose();
  }

  void _submit(String value) {
    _focusNode.unfocus();
    setState(() => _panelOpen = false);
    widget.onSubmit(value.trim());
  }

  Future<void> _toggleVoice() async {
    if (_isListening) {
      await _speech.stop();
      setState(() => _isListening = false);
      return;
    }

    setState(() => _voiceError = null);
    final available = await _speech.initialize(
      onError: (err) {
        if (!mounted) return;
        setState(() {
          _isListening = false;
          _voiceError = err.errorMsg.contains('permission')
              ? 'Microphone permission denied. Enable it in device settings.'
              : "Didn't catch that — try again.";
        });
      },
      onStatus: (status) {
        if (!mounted) return;
        if (status == 'done' || status == 'notListening') {
          setState(() => _isListening = false);
        }
      },
    );

    if (!available) {
      setState(() => _voiceError = 'Voice search is not available on this device.');
      return;
    }

    setState(() {
      _isListening = true;
      _panelOpen = true;
    });

    _speech.listen(
      onResult: (result) {
        if (!mounted) return;
        _controller.text = result.recognizedWords;
        _controller.selection = TextSelection.collapsed(offset: _controller.text.length);
        setState(() {});
        if (result.finalResult && result.recognizedWords.trim().isNotEmpty) {
          setState(() => _isListening = false);
          _submit(result.recognizedWords);
        }
      },
      listenFor: const Duration(seconds: 10),
      pauseFor: const Duration(seconds: 3),
      localeId: 'en_IN',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: AppColors.surfaceLight,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _panelOpen ? AppColors.primary : AppColors.inputBorder),
          ),
          child: Row(
            children: [
              const Icon(Icons.search_rounded, color: AppColors.textHint, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  textInputAction: TextInputAction.search,
                  onSubmitted: _submit,
                  style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    hintText: _isListening ? 'Listening...' : 'Search chicken, mutton, salmon...',
                    hintStyle: GoogleFonts.outfit(
                      color: _isListening ? const Color(0xFFE67E22) : AppColors.textHint,
                      fontWeight: _isListening ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ),
              if (_controller.text.isNotEmpty)
                GestureDetector(
                  onTap: () {
                    _controller.clear();
                    setState(() {});
                  },
                  child: const Icon(Icons.close_rounded, color: AppColors.textHint, size: 18),
                ),
              const SizedBox(width: 4),
              GestureDetector(
                onTap: _toggleVoice,
                child: Icon(
                  _isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                  color: _isListening ? const Color(0xFFE67E22) : AppColors.textHint,
                  size: 21,
                ),
              ),
            ],
          ),
        ),
        if (_voiceError != null)
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 4),
            child: Text(_voiceError!, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.error)),
          ),
        if (_panelOpen) _buildSuggestionsPanel(),
      ],
    );
  }

  Widget _buildSuggestionsPanel() {
    final query = _debouncedQuery;

    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.inputBorder),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: query.isEmpty ? _recentAndTrending() : _liveSuggestions(query),
    );
  }

  Widget _liveSuggestions(String query) {
    final suggestionsAsync = ref.watch(searchSuggestionsProvider(query));
    return suggestionsAsync.when(
      data: (suggestions) {
        if (suggestions.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Text('No matches yet — press search to look anyway', style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint)),
          );
        }
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: suggestions.map((s) => _suggestionTile(s, Icons.north_west_rounded)).toList(),
        );
      },
      loading: () => const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Center(child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))),
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _recentAndTrending() {
    final recentAsync = ref.watch(recentSearchesProvider);
    final trendingAsync = ref.watch(trendingSearchesProvider);

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        recentAsync.when(
          data: (recent) {
            if (recent.isEmpty) return const SizedBox.shrink();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recent Searches', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textHint)),
                      GestureDetector(
                        onTap: () async {
                          await ref.read(productDiscoveryRepositoryProvider).clearRecentSearches();
                          ref.invalidate(recentSearchesProvider);
                        },
                        child: Text('Clear', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.error, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),
                ...recent.map((term) => _suggestionTile(term, Icons.history_rounded)),
              ],
            );
          },
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
        ),
        trendingAsync.when(
          data: (trending) {
            if (trending.isEmpty) return const SizedBox.shrink();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
                  child: Text('Trending Searches', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textHint)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: trending.map((term) {
                      return GestureDetector(
                        onTap: () {
                          _controller.text = term;
                          _submit(term);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceLight,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.inputBorder),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.local_fire_department_rounded, size: 13, color: Color(0xFFE67E22)),
                              const SizedBox(width: 4),
                              Text(term, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            );
          },
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
        ),
      ],
    );
  }

  Widget _suggestionTile(String term, IconData icon) {
    return ListTile(
      dense: true,
      leading: Icon(icon, size: 18, color: AppColors.textHint),
      title: Text(term, style: GoogleFonts.outfit(fontSize: 13.5, color: AppColors.textPrimary)),
      onTap: () {
        _controller.text = term;
        _submit(term);
      },
    );
  }
}
