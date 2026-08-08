import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  HelpCircle,
  RotateCcw,
  PhoneCall,
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { FAQItem, SupportTicket, Order } from '../types';
import { SupabaseService } from '../lib/supabaseClient';
import { StoreService } from '../lib/storage';

interface SupportPageProps {
  onNavigate: (path: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'tickets' | 'return'>('faqs');
  const [faqs, setFaqs] = useState<FAQItem[]>(() => SupabaseService.getFAQs());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => SupabaseService.getTickets());
  const [orders] = useState<Order[]>(() => StoreService.getOrders());

  // FAQ state
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Ticket detail / Chat state
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  // New ticket form
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<SupportTicket['category']>('Quality Concern');
  const [newTicketOrderId, setNewTicketOrderId] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  // Return request form
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('Quality issue / Temperature deviation');
  const [returnComments, setReturnComments] = useState('');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(SupabaseService.getTickets());
    };
    window.addEventListener('protein_cuts_tickets_updated', handleUpdate);
    return () => window.removeEventListener('protein_cuts_tickets_updated', handleUpdate);
  }, []);

  const handleVoteFAQ = (id: string, isHelpful: boolean) => {
    const updated = SupabaseService.voteFAQ(id, isHelpful);
    setFaqs(updated);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMessage) return;

    const created = SupabaseService.createTicket(
      {
        subject: newTicketSubject,
        category: newTicketCategory,
        orderId: newTicketOrderId || undefined,
        priority: 'High'
      },
      newTicketMessage
    );

    setTickets(SupabaseService.getTickets());
    setActiveTicket(created);
    setShowCreateTicketModal(false);
    setNewTicketSubject('');
    setNewTicketMessage('');
    setActiveTab('tickets');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !chatMessageInput.trim()) return;

    SupabaseService.addMessageToTicket(activeTicket.id, 'Customer', chatMessageInput, 'user');
    setChatMessageInput('');

    // Reload active ticket
    const updatedTickets = SupabaseService.getTickets();
    setTickets(updatedTickets);
    const found = updatedTickets.find((t) => t.id === activeTicket.id);
    if (found) setActiveTicket(found);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId) return;

    SupabaseService.submitReturnRequest({
      orderId: returnOrderId,
      reason: returnReason,
      itemNames: ['Fresh Chicken Cut', 'Cold Chain Sealed Pack'],
      comments: returnComments,
      refundAmount: 399
    });

    setReturnSuccessMsg('Your return request has been lodged! Our quality manager will inspect the batch records and process immediate store credit or bank refund.');
    setTimeout(() => {
      setReturnSuccessMsg(null);
      setReturnOrderId('');
      setReturnComments('');
    }, 4000);
  };

  const filteredFaqs = faqs.filter((f) => {
    if (faqCategory !== 'All' && f.category !== faqCategory) return false;
    if (faqSearch.trim()) {
      const q = faqSearch.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-[#0A1F12] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 24/7 FRESH QUALITY HELPDESK
          </div>
          <h1 className="text-3xl font-black tracking-tight">How Can We Help You Today?</h1>
          <p className="text-xs text-neutral-300">
            Dedicated resolution for temperature logs, order delays, refund claims, and preparation tips.
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0">
          <div className="p-3 rounded-xl bg-[#0F7B3A] text-white">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 uppercase font-bold">Toll-Free Helpline</div>
            <div className="text-lg font-black text-white">1800-446-446</div>
            <div className="text-[10px] text-neutral-300">Mon-Sun 06:00 AM - 11:00 PM</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'faqs' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> FAQs & Knowledge Base
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'tickets' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Live Support Chat & Tickets ({tickets.length})
        </button>

        <button
          onClick={() => setActiveTab('return')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'return' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Freshness Guarantee & Returns
        </button>
      </div>

      {/* TAB 1: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* FAQ Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs e.g., cold chain temperature, antibiotic testing, refund timeline..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-2xl px-12 py-3.5 text-xs text-[#0A1F12] focus:outline-none shadow-sm"
            />
            <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-4" />
          </div>

          {/* FAQ Categories */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 text-xs">
            {['All', 'Quality & Sourcing', 'Delivery', 'Subscriptions', 'Refunds & Returns', 'Payment & Orders'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                className={`px-4 py-2 rounded-xl border transition cursor-pointer whitespace-nowrap font-bold ${
                  faqCategory === cat
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden transition shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-[#0A1F12] hover:text-emerald-600 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      {faq.question}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 border-t border-neutral-100 leading-relaxed space-y-3">
                      <p>{faq.answer}</p>
                      <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                        <span>Was this answer helpful?</span>
                        <button
                          onClick={() => handleVoteFAQ(faq.id, true)}
                          className="flex items-center gap-1 hover:text-emerald-600 font-bold"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Yes ({faq.helpfulVotes})
                        </button>
                        <button
                          onClick={() => handleVoteFAQ(faq.id, false)}
                          className="flex items-center gap-1 hover:text-[#0A1F12] font-bold"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> No ({faq.unhelpfulVotes})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TICKETS & LIVE CHAT */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Tickets List */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="font-bold text-[#0A1F12] text-sm">Your Support Tickets</h3>
              <button
                onClick={() => setShowCreateTicketModal(true)}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Create Ticket
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition ${
                    activeTicket?.id === t.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-md'
                      : 'bg-neutral-50 border-neutral-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-700">{t.ticketNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#0A1F12] text-white border border-black'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-[#0A1F12] truncate">{t.subject}</div>
                  <div className="text-[10px] text-neutral-500 mt-1">{t.category} • {t.priority} Priority</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Ticket Live Chat Window */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 h-[600px] flex flex-col justify-between shadow-sm">
            {activeTicket ? (
              <>
                {/* Chat Header */}
                <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-700">{activeTicket.ticketNumber}</div>
                    <h3 className="text-base font-bold text-[#0A1F12]">{activeTicket.subject}</h3>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">{activeTicket.priority} Priority</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar pr-2">
                  {activeTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs ${
                          m.sender === 'user'
                            ? 'bg-[#0F7B3A] text-white rounded-br-none'
                            : 'bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-bl-none'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-emerald-100 mb-1">{m.senderName}</div>
                        <p>{m.message}</p>
                        <div className="text-[9px] opacity-60 text-right mt-1 font-mono">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message to our support executive..."
                    value={chatMessageInput}
                    onChange={(e) => setChatMessageInput(e.target.value)}
                    className="flex-1 bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-[#0A1F12] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-2">
                <MessageSquare className="w-12 h-12 text-emerald-200" />
                <div className="text-sm font-bold text-[#0A1F12]">Select a Ticket to View Chat History</div>
                <p className="text-xs max-w-xs">Click any ticket on the left or create a new inquiry ticket.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RETURN REQUEST FORM */}
      {activeTab === 'return' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#0A1F12]">100% Quality & Freshness Guarantee Refund Claim</h3>
            <p className="text-xs text-neutral-500">
              If your meat or seafood arrives outside the 0-4°C safety range or fails cut quality, request an immediate replacement or store credit refund.
            </p>
          </div>

          {returnSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{returnSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 mb-1">Select Order Number</label>
              <select
                value={returnOrderId}
                onChange={(e) => setReturnOrderId(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">-- Choose Recent Order --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.orderNumber}>
                    {o.orderNumber} ({o.status} - ₹{o.totalAmount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">Reason for Claim</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
              >
                <option>Temperature deviation (Above 4°C)</option>
                <option>Pack seal damaged in transit</option>
                <option>Cut precision issue (Not matching boneless/pieces)</option>
                <option>Weight discrepancy</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">Additional Details</label>
              <textarea
                placeholder="Explain the condition upon delivery..."
                value={returnComments}
                onChange={(e) => setReturnComments(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs"
            >
              Lodge Instant Return Request
            </button>
          </form>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 text-[#0A1F12] space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">Lodge Support Ticket</h3>
            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Delivery slot delay or product inquiry"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Category</label>
                <select
                  value={newTicketCategory}
                  onChange={(e: any) => setNewTicketCategory(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                >
                  <option value="Quality Concern">Quality Concern</option>
                  <option value="Delivery Delay">Delivery Delay</option>
                  <option value="Billing & Refund">Billing & Refund</option>
                  <option value="Subscription Modification">Subscription Modification</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Message Detail</label>
                <textarea
                  placeholder="Describe your issue..."
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:text-[#0A1F12]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl uppercase"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
