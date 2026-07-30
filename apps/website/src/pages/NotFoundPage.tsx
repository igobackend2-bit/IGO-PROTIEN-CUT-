import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

// Shown for genuinely unmatched URLs (old bookmarks, typos, dead links) —
// previously these silently fell through to the homepage with no
// explanation, which is confusing rather than helpful.
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="text-7xl font-black text-emerald-100">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-[#08120B]">Page Not Found</h1>
        <p className="text-sm text-neutral-500">
          The page you're looking for doesn't exist or may have moved. Let's get you back on track.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={() => onNavigate('/')}
          className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Back to Home
        </button>
        <button
          onClick={() => onNavigate('/search')}
          className="bg-white hover:bg-neutral-50 text-[#08120B] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border border-neutral-200"
        >
          <Search className="w-4 h-4" /> Browse Products
        </button>
      </div>
      <button
        onClick={() => window.history.back()}
        className="text-xs text-neutral-400 hover:text-emerald-600 transition cursor-pointer flex items-center gap-1 mx-auto"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Go back
      </button>
    </div>
  );
};
