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
import { useLang } from '../lib/language';

interface SupportPageProps {
  onNavigate: (path: string) => void;
}

const FAQ_CATEGORIES_TA: Record<string, string> = {
  All: 'அனைத்தும்',
  'Quality & Sourcing': 'தரம் & மூலம்',
  Delivery: 'டெலிவரி',
  Subscriptions: 'சந்தாக்கள்',
  'Refunds & Returns': 'பணத்திரும்பம் & திரும்பப் பெறுதல்',
  'Payment & Orders': 'கட்டணம் & ஆர்டர்கள்'
};

const RETURN_REASONS_TA: Record<string, string> = {
  'Temperature deviation (Above 4°C)': 'வெப்பநிலை மாறுபாடு (4°C க்கு மேல்)',
  'Pack seal damaged in transit': 'போக்குவரத்தில் பேக் சீல் சேதமடைந்தது',
  'Cut precision issue (Not matching boneless/pieces)': 'வெட்டு துல்லிய பிரச்சனை (எலும்பில்லா/துண்டுகள் பொருந்தவில்லை)',
  'Weight discrepancy': 'எடை முரண்பாடு',
  Other: 'மற்றவை'
};

const TICKET_CATEGORIES_TA: Record<string, string> = {
  'Quality Concern': 'தர கவலை',
  'Delivery Delay': 'டெலிவரி தாமதம்',
  'Billing & Refund': 'பில்லிங் & பணத்திரும்பம்',
  'Subscription Modification': 'சந்தா மாற்றம்',
  'General Inquiry': 'பொது விசாரணை'
};

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const { lang } = useLang();
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

    setReturnSuccessMsg(
      lang === 'ta'
        ? 'உங்கள் திரும்பப் பெறும் கோரிக்கை பதிவு செய்யப்பட்டது! எங்கள் தர மேலாளர் பேட்ச் பதிவுகளை ஆய்வு செய்து உடனடி ஸ்டோர் கிரெடிட் அல்லது வங்கி பணத்திரும்பத்தை செயல்படுத்துவார்.'
        : 'Your return request has been lodged! Our quality manager will inspect the batch records and process immediate store credit or bank refund.'
    );
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
            <Sparkles className="w-3.5 h-3.5" /> {lang === 'ta' ? '24/7 புதிய தர உதவி மையம்' : '24/7 FRESH QUALITY HELPDESK'}
          </div>
          <h1 className="text-3xl font-black tracking-tight">{lang === 'ta' ? 'இன்று உங்களுக்கு எப்படி உதவ முடியும்?' : 'How Can We Help You Today?'}</h1>
          <p className="text-xs text-neutral-300">
            {lang === 'ta'
              ? 'வெப்பநிலை பதிவுகள், ஆர்டர் தாமதங்கள், பணத்திரும்ப கோரிக்கைகள் மற்றும் தயாரிப்பு குறிப்புகளுக்கான அர்ப்பணிக்கப்பட்ட தீர்வு.'
              : 'Dedicated resolution for temperature logs, order delays, refund claims, and preparation tips.'}
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0">
          <div className="p-3 rounded-xl bg-[#0F7B3A] text-white">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 uppercase font-bold">{lang === 'ta' ? 'கட்டணமில்லா உதவி எண்' : 'Toll-Free Helpline'}</div>
            <div className="text-lg font-black text-white">1800-446-446</div>
            <div className="text-[10px] text-neutral-300">{lang === 'ta' ? 'திங்கள்-ஞாயிறு காலை 06:00 - இரவு 11:00' : 'Mon-Sun 06:00 AM - 11:00 PM'}</div>
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
          <HelpCircle className="w-4 h-4" /> {lang === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் & அறிவுத் தளம்' : 'FAQs & Knowledge Base'}
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'tickets' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> {lang === 'ta' ? `நேரடி ஆதரவு அரட்டை & டிக்கெட்டுகள் (${tickets.length})` : `Live Support Chat & Tickets (${tickets.length})`}
        </button>

        <button
          onClick={() => setActiveTab('return')}
          className={`px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'return' ? 'bg-[#0F7B3A] text-white shadow-lg' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> {lang === 'ta' ? 'புத்துணர்ச்சி உத்தரவாதம் & திரும்பப் பெறுதல்' : 'Freshness Guarantee & Returns'}
        </button>
      </div>

      {/* TAB 1: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* FAQ Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={lang === 'ta' ? 'FAQ களைத் தேடுங்கள் — உதா. குளிர்சாதன வெப்பநிலை, ஆன்டிபயாடிக் சோதனை, பணத்திரும்ப காலவரிசை...' : 'Search FAQs e.g., cold chain temperature, antibiotic testing, refund timeline...'}
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
                {lang === 'ta' ? FAQ_CATEGORIES_TA[cat] ?? cat : cat}
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
                        <span>{lang === 'ta' ? 'இந்த பதில் உதவியாக இருந்ததா?' : 'Was this answer helpful?'}</span>
                        <button
                          onClick={() => handleVoteFAQ(faq.id, true)}
                          className="flex items-center gap-1 hover:text-emerald-600 font-bold"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> {lang === 'ta' ? `ஆம் (${faq.helpfulVotes})` : `Yes (${faq.helpfulVotes})`}
                        </button>
                        <button
                          onClick={() => handleVoteFAQ(faq.id, false)}
                          className="flex items-center gap-1 hover:text-[#0A1F12] font-bold"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> {lang === 'ta' ? `இல்லை (${faq.unhelpfulVotes})` : `No (${faq.unhelpfulVotes})`}
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
              <h3 className="font-bold text-[#0A1F12] text-sm">{lang === 'ta' ? 'உங்கள் ஆதரவு டிக்கெட்டுகள்' : 'Your Support Tickets'}</h3>
              <button
                onClick={() => setShowCreateTicketModal(true)}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> {lang === 'ta' ? 'டிக்கெட் உருவாக்கு' : 'Create Ticket'}
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
                  <div className="text-[10px] text-neutral-500 mt-1">{t.category} • {t.priority} {lang === 'ta' ? 'முன்னுரிமை' : 'Priority'}</div>
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
                  <span className="text-xs text-neutral-500 font-mono">{activeTicket.priority} {lang === 'ta' ? 'முன்னுரிமை' : 'Priority'}</span>
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
                    placeholder={lang === 'ta' ? 'எங்கள் ஆதரவு நிர்வாகிக்கு உங்கள் செய்தியை தட்டச்சு செய்யவும்...' : 'Type your message to our support executive...'}
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
                <div className="text-sm font-bold text-[#0A1F12]">{lang === 'ta' ? 'அரட்டை வரலாற்றைப் பார்க்க ஒரு டிக்கெட்டைத் தேர்ந்தெடுக்கவும்' : 'Select a Ticket to View Chat History'}</div>
                <p className="text-xs max-w-xs">{lang === 'ta' ? 'இடதுபுறத்தில் உள்ள ஏதேனும் டிக்கெட்டைக் கிளிக் செய்யவும் அல்லது புதிய விசாரணை டிக்கெட்டை உருவாக்கவும்.' : 'Click any ticket on the left or create a new inquiry ticket.'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RETURN REQUEST FORM */}
      {activeTab === 'return' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#0A1F12]">{lang === 'ta' ? '100% தரம் & புத்துணர்ச்சி உத்தரவாத பணத்திரும்ப கோரிக்கை' : '100% Quality & Freshness Guarantee Refund Claim'}</h3>
            <p className="text-xs text-neutral-500">
              {lang === 'ta'
                ? 'உங்கள் இறைச்சி அல்லது கடல் உணவு 0-4°C பாதுகாப்பு வரம்பிற்கு வெளியே வந்தால் அல்லது வெட்டு தரம் தோல்வியடைந்தால், உடனடி மாற்று அல்லது ஸ்டோர் கிரெடிட் பணத்திரும்பத்தை கோரவும்.'
                : 'If your meat or seafood arrives outside the 0-4°C safety range or fails cut quality, request an immediate replacement or store credit refund.'}
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
              <label className="block font-bold text-neutral-600 mb-1">{lang === 'ta' ? 'ஆர்டர் எண்ணைத் தேர்ந்தெடுக்கவும்' : 'Select Order Number'}</label>
              <select
                value={returnOrderId}
                onChange={(e) => setReturnOrderId(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="">{lang === 'ta' ? '-- சமீபத்திய ஆர்டரைத் தேர்ந்தெடுக்கவும் --' : '-- Choose Recent Order --'}</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.orderNumber}>
                    {o.orderNumber} ({o.status} - ₹{o.totalAmount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">{lang === 'ta' ? 'கோரிக்கைக்கான காரணம்' : 'Reason for Claim'}</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
              >
                {Object.keys(RETURN_REASONS_TA).map((reason) => (
                  <option key={reason} value={reason}>
                    {lang === 'ta' ? RETURN_REASONS_TA[reason] : reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">{lang === 'ta' ? 'கூடுதல் விவரங்கள்' : 'Additional Details'}</label>
              <textarea
                placeholder={lang === 'ta' ? 'டெலிவரியின் போது நிலைமையை விளக்கவும்...' : 'Explain the condition upon delivery...'}
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
              {lang === 'ta' ? 'உடனடி திரும்பப் பெறும் கோரிக்கையை பதிவு செய்யவும்' : 'Lodge Instant Return Request'}
            </button>
          </form>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 text-[#0A1F12] space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">{lang === 'ta' ? 'ஆதரவு டிக்கெட்டைப் பதிவு செய்யவும்' : 'Lodge Support Ticket'}</h3>
            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">{lang === 'ta' ? 'பொருள்' : 'Subject'}</label>
                <input
                  type="text"
                  placeholder={lang === 'ta' ? 'உதா. டெலிவரி நேர தாமதம் அல்லது தயாரிப்பு விசாரணை' : 'e.g. Delivery slot delay or product inquiry'}
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">{lang === 'ta' ? 'வகை' : 'Category'}</label>
                <select
                  value={newTicketCategory}
                  onChange={(e: any) => setNewTicketCategory(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-[#0A1F12] focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(TICKET_CATEGORIES_TA).map((cat) => (
                    <option key={cat} value={cat}>
                      {lang === 'ta' ? TICKET_CATEGORIES_TA[cat] : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">{lang === 'ta' ? 'செய்தி விவரம்' : 'Message Detail'}</label>
                <textarea
                  placeholder={lang === 'ta' ? 'உங்கள் பிரச்சனையை விவரிக்கவும்...' : 'Describe your issue...'}
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
                  {lang === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl uppercase"
                >
                  {lang === 'ta' ? 'டிக்கெட்டைச் சமர்ப்பிக்கவும்' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
