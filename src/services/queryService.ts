import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface InboxMessage {
  id: string;
  customer_email: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface CustomerQuery {
  id: string;
  customer_email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  admin_reply?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Inbox Service
 */
export const getInboxMessages = async (email: string): Promise<InboxMessage[]> => {
  if (!isSupabaseConfigured || !email) return [];
  try {
    const { data, error } = await supabase
      .from('inbox_messages')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Fetch Inbox Error:', err);
    return [];
  }
};

export const markMessageAsRead = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('inbox_messages').update({ is_read: true }).eq('id', id);
  } catch (err) {
    console.error('Mark as Read Error:', err);
  }
};

export const createInboxMessage = async (email: string, title: string, message: string, type = 'order_update') => {
  if (!isSupabaseConfigured || !email) return;
  try {
    await supabase.from('inbox_messages').insert([{
      customer_email: email,
      title,
      message,
      type
    }]);
  } catch (err) {
    console.error('Create Inbox Message Error:', err);
  }
};


/**
 * Query Service
 */
export const getCustomerQueries = async (email?: string): Promise<CustomerQuery[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase.from('customer_queries').select('*').order('created_at', { ascending: false });
    if (email) {
      query = query.eq('customer_email', email);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Fetch Queries Error:', err);
    return [];
  }
};

export const createQuery = async (email: string, subject: string, message: string) => {
  if (!isSupabaseConfigured || !email) return { success: false, error: 'Database not connected or email missing' };
  try {
    const { data, error } = await supabase.from('customer_queries').insert([{
      customer_email: email,
      subject,
      message
    }]).select().single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Create Query Error:', err);
    return { success: false, error: err };
  }
};

export const replyToQuery = async (queryId: string, email: string, originalSubject: string, replyMessage: string, customerName?: string) => {
  if (!isSupabaseConfigured) return { success: false };
  try {
    // 1. Update the query status and reply text
    const { error } = await supabase.from('customer_queries').update({
      status: 'resolved',
      admin_reply: replyMessage
    }).eq('id', queryId);

    if (error) throw error;

    // 2. Add an inbox message for the customer
    await createInboxMessage(
      email,
      `Support Reply: ${originalSubject}`,
      replyMessage,
      'query_reply'
    );

    // 3. Send an email notification to the customer
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        userName: customerName || 'Valued Customer',
        type: 'ORDER_PLACED', // Fallback type to use the generic template
        subject: `Re: ${originalSubject}`,
        data: {
          orderId: 'SUPPORT',
          amount: 0,
          status: 'Resolved',
          message: `**Response to your query:**\n\n${replyMessage}\n\n*Original Query: ${originalSubject}*`,
          statusImage: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80&w=800',
          logoUrl: 'https://i.imgur.com/Z4v6vXN.png',
        }
      })
    }).catch(err => console.error('Failed to send reply email:', err));

    return { success: true };
  } catch (err) {
    console.error('Reply Query Error:', err);
    return { success: false, error: err };
  }
};
