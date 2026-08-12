import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/support_repository_impl.dart';
import '../../domain/entities/faq_item.dart';
import '../../domain/entities/support_ticket.dart';
import '../../domain/entities/ticket_category.dart';
import '../../domain/entities/ticket_message.dart';
import '../../domain/repositories/support_repository.dart';

final supportRepositoryProvider = Provider<SupportRepository>((ref) => SupportRepositoryImpl());

// ─── Ticket list ("My Support Tickets") ─────────────────────────────────────

class TicketListState {
  final List<SupportTicket> tickets;
  final bool isLoading;
  final Object? error;

  const TicketListState({this.tickets = const [], this.isLoading = true, this.error});

  int get openCount => tickets.where((t) => !t.status.isClosed).length;

  TicketListState copyWith({List<SupportTicket>? tickets, bool? isLoading, Object? error, bool clearError = false}) {
    return TicketListState(
      tickets: tickets ?? this.tickets,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final ticketListProvider = StateNotifierProvider.autoDispose<TicketListNotifier, TicketListState>((ref) {
  return TicketListNotifier(ref.read(supportRepositoryProvider));
});

class TicketListNotifier extends StateNotifier<TicketListState> {
  final SupportRepository _repository;

  TicketListNotifier(this._repository) : super(const TicketListState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final tickets = await _repository.fetchTickets();
      state = state.copyWith(tickets: tickets, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();
}

// ─── FAQs ────────────────────────────────────────────────────────────────────

class FaqState {
  final List<FaqItem> faqs;
  final bool isLoading;
  final Object? error;

  const FaqState({this.faqs = const [], this.isLoading = true, this.error});

  FaqState copyWith({List<FaqItem>? faqs, bool? isLoading, Object? error, bool clearError = false}) {
    return FaqState(
      faqs: faqs ?? this.faqs,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final faqProvider = StateNotifierProvider.autoDispose<FaqNotifier, FaqState>((ref) {
  return FaqNotifier(ref.read(supportRepositoryProvider));
});

class FaqNotifier extends StateNotifier<FaqState> {
  final SupportRepository _repository;

  FaqNotifier(this._repository) : super(const FaqState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final faqs = await _repository.fetchFaqs();
      state = state.copyWith(faqs: faqs, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> retry() => load();

  /// Updates the local count immediately (optimistic), then fires the real
  /// increment — the count never needs a full reload for one tap.
  Future<void> submitFeedback(String faqId, {required bool helpful}) async {
    state = state.copyWith(
      faqs: state.faqs
          .map((f) => f.id != faqId
              ? f
              : FaqItem(
                  id: f.id,
                  category: f.category,
                  question: f.question,
                  answer: f.answer,
                  priority: f.priority,
                  helpfulCount: f.helpfulCount + (helpful ? 1 : 0),
                  notHelpfulCount: f.notHelpfulCount + (helpful ? 0 : 1),
                ))
          .toList(),
    );
    try {
      await _repository.submitFaqFeedback(faqId, helpful: helpful);
    } catch (_) {
      // Best-effort — the local count already reflects the tap either way.
    }
  }
}

// ─── Ticket detail / live chat ──────────────────────────────────────────────

final ticketStreamProvider = StreamProvider.autoDispose.family<SupportTicket?, String>((ref, ticketId) {
  return ref.watch(supportRepositoryProvider).watchTicket(ticketId);
});

final ticketMessagesStreamProvider = StreamProvider.autoDispose.family<List<TicketMessage>, String>((ref, ticketId) {
  return ref.watch(supportRepositoryProvider).watchMessages(ticketId);
});

class TicketComposerState {
  final bool isSending;
  final Object? sendError;

  /// Locally-echoed messages shown the instant "Send" is tapped, before
  /// Supabase Realtime confirms the insert — removed once the send call
  /// settles (the confirmed row will already be in the stream by then in
  /// the overwhelming majority of cases, since Realtime latency is
  /// sub-second).
  final List<TicketMessage> optimistic;

  const TicketComposerState({this.isSending = false, this.sendError, this.optimistic = const []});

  TicketComposerState copyWith({bool? isSending, Object? sendError, bool clearError = false, List<TicketMessage>? optimistic}) {
    return TicketComposerState(
      isSending: isSending ?? this.isSending,
      sendError: clearError ? null : (sendError ?? this.sendError),
      optimistic: optimistic ?? this.optimistic,
    );
  }
}

final ticketComposerProvider =
    StateNotifierProvider.autoDispose.family<TicketComposerNotifier, TicketComposerState, String>((ref, ticketId) {
  return TicketComposerNotifier(ref.read(supportRepositoryProvider), ticketId);
});

class TicketComposerNotifier extends StateNotifier<TicketComposerState> {
  final SupportRepository _repository;
  final String ticketId;
  int _nonce = 0;

  TicketComposerNotifier(this._repository, this.ticketId) : super(const TicketComposerState());

  Future<void> send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;

    final localId = 'pending-${_nonce++}';
    final optimisticMessage = TicketMessage(
      id: localId,
      ticketId: ticketId,
      sender: MessageSender.customer,
      message: trimmed,
      isRead: true,
      createdAt: DateTime.now(),
    );
    state = state.copyWith(optimistic: [...state.optimistic, optimisticMessage], isSending: true, clearError: true);

    try {
      await _repository.sendMessage(ticketId, trimmed);
    } catch (e) {
      state = state.copyWith(sendError: e);
    } finally {
      state = state.copyWith(
        isSending: false,
        optimistic: state.optimistic.where((m) => m.id != localId).toList(),
      );
    }
  }

  Future<bool> close() async {
    try {
      await _repository.closeTicket(ticketId);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> markRead() async {
    try {
      await _repository.markMessagesRead(ticketId);
    } catch (_) {
      // Read status is a courtesy signal — never worth surfacing an error for.
    }
  }
}

// ─── Create ticket ───────────────────────────────────────────────────────────

final createTicketProvider = StateNotifierProvider.autoDispose<CreateTicketNotifier, AsyncValue<void>>((ref) {
  return CreateTicketNotifier(ref.read(supportRepositoryProvider));
});

class CreateTicketNotifier extends StateNotifier<AsyncValue<void>> {
  final SupportRepository _repository;

  CreateTicketNotifier(this._repository) : super(const AsyncValue.data(null));

  Future<SupportTicket?> submit({
    required TicketCategory category,
    required String subject,
    required String description,
    String? orderId,
    String? attachmentUrl,
  }) async {
    state = const AsyncValue.loading();
    try {
      final ticket = await _repository.createTicket(
        category: category,
        subject: subject,
        description: description,
        orderId: orderId,
        attachmentUrl: attachmentUrl,
      );
      state = const AsyncValue.data(null);
      return ticket;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return null;
    }
  }
}
