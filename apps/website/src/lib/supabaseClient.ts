import { StoreService } from './storage';
import {
  AppNotification,
  SupportTicket,
  TicketMessage,
  FAQItem,
  ReturnRequest,
  UserSubscription,
  ComboPack,
  RewardTransaction,
  WalletTransaction,
  DeliveryPartner,
  AdminUser,
  AuditLog
} from '../types';
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_TICKETS,
  INITIAL_FAQS,
  INITIAL_COMBO_PACKS,
  INITIAL_REWARDS_HISTORY,
  INITIAL_WALLET_HISTORY,
  INITIAL_DELIVERY_PARTNERS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

const NOTIFICATIONS_KEY = 'protein_cuts_notifications_v1';
const TICKETS_KEY = 'protein_cuts_tickets_v1';
const FAQS_KEY = 'protein_cuts_faqs_v1';
const RETURNS_KEY = 'protein_cuts_returns_v1';
const SUBSCRIPTIONS_KEY = 'protein_cuts_subscriptions_v1';
const REWARDS_KEY = 'protein_cuts_rewards_v1';
const WALLET_KEY = 'protein_cuts_wallet_v1';
const DELIVERY_PARTNERS_KEY = 'protein_cuts_delivery_partners_v1';
const AUDIT_LOGS_KEY = 'protein_cuts_audit_logs_v1';
const AUTH_KEY = 'protein_cuts_auth_session_v1';

export class SupabaseService {
  // --- AUTH SYSTEM ---
  //
  // REMOVED: `loginWithEmail()` used to mint a session client-side with NO
  // password verification, and granted the 'Super Admin' role to any address
  // containing the string "admin". Anyone could become an administrator by
  // typing admin@anything.com.
  //
  // Real authentication now lives in `src/lib/api/auth.ts` (Supabase Auth —
  // the same identity provider the Flutter app and admin dashboard use). The
  // shims below are kept only so legacy call sites keep compiling while they
  // are migrated one by one; they no longer grant anything.

  /** @deprecated Use `getCurrentUser()` from `src/lib/api/auth.ts`. */
  static getSessionUser() {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  }

  /** @deprecated Use `signOut()` from `src/lib/api/auth.ts`. */
  static logout() {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event('protein_cuts_auth_updated'));
  }

  // --- NOTIFICATIONS ---
  static getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS as AppNotification[];
  }

  static markNotificationRead(id: string): AppNotification[] {
    const notifs = this.getNotifications();
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx >= 0) {
      notifs[idx].isRead = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
      window.dispatchEvent(new Event('protein_cuts_notifications_updated'));
    }
    return notifs;
  }

  static markAllNotificationsRead(): AppNotification[] {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event('protein_cuts_notifications_updated'));
    return notifs;
  }

  static pushNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event('protein_cuts_notifications_updated'));
  }

  // --- SUPPORT TICKETS & CHAT ---
  static getTickets(): SupportTicket[] {
    try {
      const data = localStorage.getItem(TICKETS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    localStorage.setItem(TICKETS_KEY, JSON.stringify(INITIAL_TICKETS));
    return INITIAL_TICKETS as SupportTicket[];
  }

  static createTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessage: string): SupportTicket {
    const tickets = this.getTickets();
    const ticketNum = `TCK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketNumber: ticketNum,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'user',
          senderName: 'Customer',
          message: initialMessage,
          createdAt: new Date().toISOString()
        }
      ]
    };
    tickets.unshift(newTicket);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('protein_cuts_tickets_updated'));

    // Simulated Auto-Response from AI Agent
    setTimeout(() => {
      this.addMessageToTicket(newTicket.id, 'IGO Support AI Agent', 'Thank you for reaching out! Our quality desk has received your request and assigned it to a live specialist.', 'agent');
    }, 1500);

    return newTicket;
  }

  static addMessageToTicket(ticketId: string, senderName: string, messageText: string, sender: 'user' | 'agent' | 'system' = 'user'): SupportTicket[] {
    const tickets = this.getTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx >= 0) {
      const newMessage: TicketMessage = {
        id: `m-${Date.now()}`,
        sender,
        senderName,
        message: messageText,
        createdAt: new Date().toISOString()
      };
      tickets[idx].messages.push(newMessage);
      tickets[idx].updatedAt = new Date().toISOString();
      if (sender === 'agent' && tickets[idx].status === 'Open') {
        tickets[idx].status = 'In Progress';
      }
      localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
      window.dispatchEvent(new Event('protein_cuts_tickets_updated'));
    }
    return tickets;
  }

  // --- FAQS ---
  static getFAQs(): FAQItem[] {
    try {
      const data = localStorage.getItem(FAQS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    localStorage.setItem(FAQS_KEY, JSON.stringify(INITIAL_FAQS));
    return INITIAL_FAQS as FAQItem[];
  }

  static voteFAQ(faqId: string, isHelpful: boolean): FAQItem[] {
    const faqs = this.getFAQs();
    const idx = faqs.findIndex((f) => f.id === faqId);
    if (idx >= 0) {
      if (isHelpful) faqs[idx].helpfulVotes += 1;
      else faqs[idx].unhelpfulVotes += 1;
      localStorage.setItem(FAQS_KEY, JSON.stringify(faqs));
    }
    return faqs;
  }

  // --- RETURN REQUESTS ---
  static getReturnRequests(): ReturnRequest[] {
    try {
      const data = localStorage.getItem(RETURNS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  }

  static submitReturnRequest(req: Omit<ReturnRequest, 'id' | 'status' | 'createdAt'>): ReturnRequest {
    const returns = this.getReturnRequests();
    const newReq: ReturnRequest = {
      ...req,
      id: `ret-${Date.now()}`,
      status: 'Requested',
      createdAt: new Date().toISOString()
    };
    returns.unshift(newReq);
    localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
    return newReq;
  }

  // --- USER SUBSCRIPTIONS ---
  static getSubscriptions(): UserSubscription[] {
    try {
      const data = localStorage.getItem(SUBSCRIPTIONS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const defaultSub: UserSubscription[] = [
      {
        id: 'sub-101',
        planId: 'gym-pro',
        planTitle: 'Daily Gym Bro Lean Chicken Box',
        frequency: 'Daily',
        nextDeliveryDate: 'Tomorrow, 07:00 AM',
        itemsSummary: '500g Chicken Breast Boneless + 6 Organic Brown Eggs',
        pricePerDelivery: 299,
        status: 'Active',
        deliverySlot: '07:00 AM - 09:00 AM',
        addressId: 'addr-1',
        deliveriesCompleted: 14,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ];
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(defaultSub));
    return defaultSub;
  }

  static updateSubscriptionStatus(subId: string, status: 'Active' | 'Paused' | 'Cancelled'): UserSubscription[] {
    const subs = this.getSubscriptions();
    const idx = subs.findIndex((s) => s.id === subId);
    if (idx >= 0) {
      subs[idx].status = status;
      localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));
      window.dispatchEvent(new Event('protein_cuts_subs_updated'));
    }
    return subs;
  }

  // --- COMBOS & OFFERS ---
  static getComboPacks(): ComboPack[] {
    return INITIAL_COMBO_PACKS as ComboPack[];
  }

  // --- WALLET & REWARDS ---
  static getRewardHistory(): RewardTransaction[] {
    try {
      const data = localStorage.getItem(REWARDS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_REWARDS_HISTORY as RewardTransaction[];
  }

  static getWalletHistory(): WalletTransaction[] {
    try {
      const data = localStorage.getItem(WALLET_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_WALLET_HISTORY as WalletTransaction[];
  }

  static addWalletTransaction(tx: Omit<WalletTransaction, 'id' | 'date'>): WalletTransaction[] {
    const history = this.getWalletHistory();
    const newTx: WalletTransaction = {
      ...tx,
      id: `wtx-${Date.now()}`,
      date: new Date().toLocaleString()
    };
    const updated = [newTx, ...history];
    localStorage.setItem(WALLET_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('protein_cuts_wallet_updated'));
    return updated;
  }

  // --- DELIVERY PARTNERS ---
  static getDeliveryPartners(): DeliveryPartner[] {
    try {
      const data = localStorage.getItem(DELIVERY_PARTNERS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_DELIVERY_PARTNERS as DeliveryPartner[];
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_LOGS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_LOGS as AuditLog[];
  }

  static addAuditLog(performedBy: string, role: string, action: string, entity: string, entityId: string, details: string) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      performedBy,
      role,
      action,
      entity,
      entityId,
      timestamp: new Date().toLocaleString(),
      details
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
  }
}
