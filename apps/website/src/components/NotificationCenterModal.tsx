import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Sparkles, Tag, ShoppingBag, Truck, Gift, MessageSquare } from 'lucide-react';
import { SupabaseService } from '../lib/supabaseClient';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      setNotifications(SupabaseService.getNotifications());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const updated = SupabaseService.markAllNotificationsRead();
    setNotifications(updated);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    SupabaseService.markNotificationRead(notif.id);
    setNotifications(SupabaseService.getNotifications());
    if (notif.deepLink) {
      onNavigate(notif.deepLink);
      onClose();
    }
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

  const filtered = activeFilter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md h-[90vh] flex flex-col text-[#08120B] shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#08120B]">Notifications Center</h3>
              <p className="text-[11px] text-neutral-500">Live order updates & flash protein drops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-[#08120B] hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full font-bold transition ${
                activeFilter === 'all'
                  ? 'bg-[#0F7B3A] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-full font-bold transition ${
                activeFilter === 'unread'
                  ? 'bg-[#0F7B3A] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:text-[#08120B]'
              }`}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-emerald-700 hover:text-emerald-600 font-semibold flex items-center gap-1 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-16 space-y-2 text-neutral-500">
              <Bell className="w-10 h-10 mx-auto text-emerald-200" />
              <div className="text-sm font-bold text-[#08120B]">No notifications found</div>
              <p className="text-xs">You're all caught up on your fresh protein alerts!</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 relative ${
                  !notif.isRead
                    ? 'bg-emerald-50 border-emerald-300 hover:border-emerald-400'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <div className="p-2 rounded-lg bg-white border border-neutral-200 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 pr-3">
                  <div className="text-xs font-bold text-[#08120B] flex items-center gap-2">
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
