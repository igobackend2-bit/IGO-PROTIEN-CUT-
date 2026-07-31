import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { signIn, isActiveAdmin, signOut } from '../../lib/api/auth';

/**
 * ADMIN LOGIN — the standalone gate on /admin.
 *
 * Deliberately separate from the customer sign-in modal:
 *  • no site navbar, footer or marketing chrome
 *  • signing in here checks `admin_users` membership, not just credentials
 *  • a valid customer account that isn't an admin is signed straight back out,
 *    so a normal shopper can't end up in a half-authenticated state on /admin
 *
 * Authentication is Supabase Auth — the same identity the mobile app and the
 * Flutter admin dashboard use, so one account works everywhere.
 */

interface AdminLoginProps {
  /** Called once the signed-in user is confirmed as an active admin. */
  onAuthenticated: () => void;
  onExit: () => void;
  /** True when a session exists but the account has no admin_users row. */
  deniedForCurrentUser?: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onAuthenticated,
  onExit,
  deniedForCurrentUser = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setBusy(true);

    const result = await signIn(email.trim(), password);
    if (!result.ok) {
      setBusy(false);
      setError(result.error ?? 'Could not sign in. Check your details and try again.');
      return;
    }

    // Credentials were valid — now check this account is actually staff.
    const allowed = await isActiveAdmin();
    setBusy(false);

    if (!allowed) {
      // Don't leave a customer signed in on the admin route.
      await signOut();
      setError('That account does not have admin access.');
      return;
    }

    onAuthenticated();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08120B] px-4 py-12">
      <div className="w-full max-w-sm">
        <button
          onClick={onExit}
          className="mb-8 flex items-center gap-2 text-xs font-semibold text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to store
        </button>

        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F7B3A]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Website Content Admin</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Staff access only. Products, orders, inventory and customers are managed in the main
            admin dashboard.
          </p>
        </div>

        {deniedForCurrentUser && !error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-200">
              You're signed in, but this account doesn't have admin access. Sign in with a staff
              account below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400/60 focus:bg-white/10 focus:outline-none"
              placeholder="you@igoproteincuts.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:border-emerald-400/60 focus:bg-white/10 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white/70"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-xs leading-relaxed text-red-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[#0F7B3A] py-3.5 text-sm font-bold text-white transition hover:bg-[#0c6630] disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-white/30">
          Access is granted from the main admin dashboard.
          <br />
          Contact a super admin if you need it.
        </p>
      </div>
    </div>
  );
};
