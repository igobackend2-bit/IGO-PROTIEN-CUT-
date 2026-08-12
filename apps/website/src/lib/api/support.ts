import { supabase, isSupabaseConfigured } from '../supabase';
import { FAQItem, SupportTicket, TicketMessage } from '../../types';

/**
 * SUPPORT — reads/writes the CANONICAL `faq_items` (public read) and
 * `support_tickets` / `ticket_messages` (own-row read/write) tables, using
 * the signed-in customer's own session. Mirrors the Flutter app's Phase 16
 * support module (same table/column names, same category/status enums).
 *
 * Before this file existed, the whole Support page (FAQs, tickets, live
 * chat, return requests) ran on the legacy 100%-localStorage
 * `SupabaseService` — FAQ votes, tickets and chat messages never left the
 * browser, so nobody at IGO ever actually saw a customer's support ticket.
 *
 * Real-schema notes (there is no per-user vote table, no ticket_number/
 * priority column, and no separate return_requests table):
 *  - FAQ helpful/unhelpful votes are one shared aggregate counter per FAQ
 *    (via the `increment_faq_feedback` RPC), not a per-user toggle.
 *  - "Ticket number" and "priority" shown in the UI are cosmetic — derived
 *    from the row id / always High, same as `orderNumber` is derived from
 *    the order's id elsewhere in this codebase.
 *  - A "return request" is simply a support ticket with category 'return'.
 */

const UI_CATEGORY_LABELS: Record<string, SupportTicket['category']> = {
  missing_item: 'Damaged/Missing Item',
  wrong_item: 'Damaged/Missing Item',
  damaged_item: 'Damaged/Missing Item',
  delivery_issue: 'Delivery Delay',
  payment_issue: 'Payment/Refund Issue',
  return: 'Other',
  other: 'Other'
};

/** Real DB category options for the "Create Ticket" form (no fake categories that don't exist in the schema). */
export const TICKET_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'missing_item', label: 'Missing Item' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'damaged_item', label: 'Damaged / Quality Issue' },
  { value: 'delivery_issue', label: 'Delivery Delay / Issue' },
  { value: 'payment_issue', label: 'Payment / Refund Issue' },
  { value: 'other', label: 'General Inquiry' }
];

function senderName(sender: string): string {
  if (sender === 'agent') return 'IGO Support Agent';
  if (sender === 'system') return 'System';
  return 'You';
}

function mapMessage(row: Record<string, any>): TicketMessage {
  return {
    id: String(row.id),
    sender: row.sender === 'customer' ? 'user' : (row.sender as 'agent' | 'system'),
    senderName: senderName(row.sender),
    message: row.message,
    createdAt: row.created_at,
    attachmentUrl: row.attachment ?? undefined
  };
}

function mapTicket(row: Record<string, any>): SupportTicket {
  return {
    id: String(row.id),
    ticketNumber: `TKT-${String(row.id).slice(0, 6).toUpperCase()}`,
    subject: row.subject,
    category: UI_CATEGORY_LABELS[row.category as string] ?? 'Other',
    status: (row.status as SupportTicket['status']) ?? 'Open',
    priority: 'High',
    orderId: row.order_id ? String(row.order_id) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: Array.isArray(row.ticket_messages) ? row.ticket_messages.map(mapMessage) : []
  };
}

const CATEGORY_LABEL_TO_DB: Record<SupportTicket['category'], string> = {
  'Damaged/Missing Item': 'damaged_item',
  'Delivery Delay': 'delivery_issue',
  'Payment/Refund Issue': 'payment_issue',
  'Quality Issue': 'damaged_item',
  'Subscription Query': 'other',
  Other: 'other'
};

/** Publicly readable — no auth required. */
export async function fetchFAQs(): Promise<FAQItem[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, category, question, answer, helpful_count, not_helpful_count')
    .order('priority', { ascending: false });

  if (error) {
    console.error('[support] fetchFAQs failed:', error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: String(row.id),
    question: row.question,
    answer: row.answer,
    category: (row.category as FAQItem['category']) ?? 'Delivery',
    helpfulVotes: Number(row.helpful_count ?? 0),
    unhelpfulVotes: Number(row.not_helpful_count ?? 0)
  }));
}

export async function voteFAQ(id: string, isHelpful: boolean): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.rpc('increment_faq_feedback', { p_faq_id: id, p_helpful: isHelpful });
  if (error) console.error('[support] voteFAQ failed:', error.message);
  return !error;
}

/** The signed-in customer's own tickets with their messages, newest first. */
export async function fetchTickets(): Promise<SupportTicket[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, order_id, category, subject, description, status, created_at, updated_at, ticket_messages(id, sender, message, attachment, created_at)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .order('created_at', { foreignTable: 'ticket_messages', ascending: true });

  if (error) {
    console.error('[support] fetchTickets failed:', error.message);
    return [];
  }
  return (data ?? []).map(mapTicket);
}

export interface CreateTicketInput {
  subject: string;
  category: SupportTicket['category'];
  orderId?: string;
  message: string;
}

/** Creates a ticket plus its first customer message. */
export async function createTicket(input: CreateTicketInput): Promise<{ ok: boolean; ticket?: SupportTicket; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: 'Please sign in to create a support ticket.' };

  const { data: row, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      order_id: input.orderId || null,
      category: CATEGORY_LABEL_TO_DB[input.category] ?? 'other',
      subject: input.subject,
      description: input.message
    })
    .select('id, order_id, category, subject, description, status, created_at, updated_at')
    .single();

  if (error || !row) return { ok: false, error: error?.message ?? 'Could not create the ticket.' };

  await supabase.from('ticket_messages').insert({ ticket_id: row.id, sender: 'customer', message: input.message });

  const { data: full } = await supabase
    .from('support_tickets')
    .select('id, order_id, category, subject, description, status, created_at, updated_at, ticket_messages(id, sender, message, attachment, created_at)')
    .eq('id', row.id)
    .single();

  return { ok: true, ticket: mapTicket(full ?? row) };
}

export async function sendTicketMessage(ticketId: string, message: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('ticket_messages').insert({ ticket_id: ticketId, sender: 'customer', message });
  if (error) console.error('[support] sendTicketMessage failed:', error.message);
  return !error;
}

export interface SubmitReturnInput {
  orderId: string;
  orderLabel: string;
  reason: string;
  comments: string;
}

/** A "return request" is a support ticket with category 'return' — there is no separate return_requests table. */
export async function submitReturnRequest(input: SubmitReturnInput): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: 'Please sign in to submit a return request.' };

  const description = `Reason: ${input.reason}${input.comments ? `\n\n${input.comments}` : ''}`;

  const { data: row, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      order_id: input.orderId || null,
      category: 'return',
      subject: `Return Request — ${input.orderLabel}`,
      description
    })
    .select('id')
    .single();

  if (error || !row) return { ok: false, error: error?.message ?? 'Could not submit the return request.' };

  await supabase.from('ticket_messages').insert({ ticket_id: row.id, sender: 'customer', message: description });
  return { ok: true };
}
