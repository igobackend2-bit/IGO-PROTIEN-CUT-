import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Sparkles, Tag, ShoppingBag, Truck, Gift, MessageSquare, Inbox } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api/notifications';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

// Real notifications — reads/updates the canonical `notifications` table
// (see src/lib/api/notifications.ts) instead of the old fake local
// SupabaseService store. Fires 'protein_cuts_notifications_updated' after
// any mark-read action so the navbar bell badge refetches immediately.
//
// Only ever shows UNREAD notifications here, and reading one (by clicking it,
// or "Mark all read") removes it from this dropdown immediately rather than
// just flagging it read and leaving it in an "All" list forever — this popup
// is meant to surface what's new, not be the permanent archive. The full
// read+unread history lives in the account page's Inbox tab
// (UserAccountPage.tsx), which reads the exact same `notifications` table.
export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications().then((rows) => setNotifications(rows.filter((n) => !n.isRead)));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications([]);
    window.dispatchEvent(new Event('protein_cuts_notifications_updated'));
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    await markNotificationRead(notif.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    window.dispatchEvent(new Event('protein_cuts_notifications_updated'));
    if (notif.deepLink) {
      onNavigate(notif.deepLink);
      onClose();
    }
  };

  const goToInbox = () => {
    onNavigate('/account?tab=inbox');
    onClose();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'delivery': return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'flash_sale': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'coupon': return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'referral': return <Gift className="w-4 h-4 text-emerald-600" />;
      case 'support': return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      default: return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md h-[90vh] flex flex-col text-[#0A1F12] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0A1F12]">Notifications Center</h3>
              <p className="text-[11px] text-neutral-500">Live order updates & flash protein drops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-[#0A1F12] hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-500 px-1">
            {notifications.length} new
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={goToInbox}
              className="text-neutral-500 hover:text-[#0A1F12] font-semibold flex items-center gap-1 transition"
            >
              <Inbox className="w-3.5 h-3.5" /> View Inbox
            </button>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-emerald-700 hover:text-emerald-600 font-semibold flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notification List — unread only; a read one disappears from here
            immediately (it's still saved, just now only in the Inbox tab). */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-neutral-500">
              <Bell className="w-10 h-10 mx-auto text-emerald-200" />
              <div className="text-sm font-bold text-[#0A1F12]">You're all caught up!</div>
              <p className="text-xs max-w-[220px] mx-auto">
                No new updates right now. Everything you've already seen is saved in your Inbox.
              </p>
              <button
                onClick={goToInbox}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-600 transition"
              >
                <Inbox className="w-3.5 h-3.5" /> Go to Inbox
              </button>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-300 hover:border-emerald-400 transition cursor-pointer flex items-start gap-3 relative"
              >
                <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="p-2 rounded-lg bg-white border border-neutral-200 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 pr-3">
                  <div className="text-xs font-bold text-[#0A1F12] flex items-center gap-2">
                    {notif.title}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="text-[10px] text-neutral-500 mt-2 font-mono">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
