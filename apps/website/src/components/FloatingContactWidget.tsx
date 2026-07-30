import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingContactWidgetProps {
  onNavigate: (path: string) => void;
}

// Persistent bottom-right WhatsApp + support chat bubble, visible on every
// page — matches the always-on contact widget pattern used by FreshToHome,
// Zappfresh, and most Indian D2C sites.
export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="fixed bottom-20 lg:bottom-5 right-4 sm:right-5 z-40 flex flex-col items-end gap-3">
      <button
        onClick={() => onNavigate('/support')}
        className="w-12 h-12 rounded-full bg-[#0F7B3A] hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-900/30 transition cursor-pointer relative"
        title="Chat with Support"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
      </button>

      <a
        href="https://wa.me/919840000000?text=Hi%20IGO%20Protein%20Cuts%2C%20I%20have%20a%20question%20about%20my%20order."
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#1FBE59] text-white flex items-center justify-center shadow-xl shadow-emerald-900/30 transition cursor-pointer"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.09.2-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.45.12.61-.07.17-.2.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.66.79 1.94.93.28.14.47.2.53.32.07.12.07.68-.17 1.36z" />
        </svg>
      </a>
    </div>
  );
};
