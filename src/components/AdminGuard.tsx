import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'denied'>('checking');

  useEffect(() => {
    // Check localStorage for admin session (set by AdminLogin page)
    const session = localStorage.getItem('igo_admin_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const isValid = parsed.isAdmin === true &&
          (Date.now() - parsed.loginTime) < 24 * 60 * 60 * 1000; // 24h
        setStatus(isValid ? 'ok' : 'denied');
      } catch {
        setStatus('denied');
      }
    } else {
      setStatus('denied');
    }
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 text-igo-green animate-spin" />
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
