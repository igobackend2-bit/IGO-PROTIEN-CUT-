import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, AlertCircle, ArrowRight } from 'lucide-react';
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
 *
 * Visually restyled to match the customer-facing UserAuthModal (glass card
 * over a blurred, darkened brand photo) so /admin doesn't feel like a
 * different, bolted-on product — only the copy and the isActiveAdmin() gate
 * differ.
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

  const inputClasses =
    'w-full bg-white/10 border border-white/20 focus:border-emerald-400/70 rounded-xl px-4 py-3.5 text-base text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.14] font-medium backdrop-blur-sm transition-colors';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0A1F12]">
      {/* Ambient dark tech backdrop — distinct from the customer login's brand
          photo on purpose, so /admin reads as a separate, restricted console
          rather than another customer-facing page. Radial glow + grid, no
          external image dependency. */}
      <div className="fixed inset-0 bg-[#0A1F12]">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,178,123,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(15,178,123,0.18) 1px, transparent 1px)',
            backgroundSize: '42px 42px'
          }}
        />
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-teal-600/15 blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F12]/70 via-[#0A1F12]/60 to-[#0A1F12]/85" />
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2 backdrop-blur-2xl bg-white/[0.04]">
        {/* Left — dark console panel with the same grid/glow motif */}
        <div className="hidden lg:flex relative flex-col justify-between p-10 xl:p-14 border-r border-white/10 bg-[#0A1F12] overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(15,178,123,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(15,178,123,0.25) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
          />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12]/90 via-transparent to-[#0A1F12]/40" />

          <button onClick={onExit} className="relative z-10 flex items-center gap-2.5 cursor-pointer w-fit">
            <div className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/Images/protein-cuts-logo.jpg"
                alt="Protein Cuts"
                className="h-full w-full object-contain mix-blend-multiply scale-[1.7]"
              />
            </div>
            <span className="text-sm font-black text-white tracking-tight">PROTEIN CUTS</span>
          </button>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight drop-shadow-lg">
              Website
              <br />
              Content Admin.
            </h1>
            <p className="text-white/70 text-sm max-w-sm">
              Staff access only. Products, orders, inventory and customers are managed in the
              main admin dashboard — this console controls banners, content and SEO for the website.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-white/50 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            Access is restricted to active staff accounts only.
          </div>
        </div>

        {/* Right — glass form panel */}
        <div className="relative flex items-start lg:items-center justify-center px-6 py-14 sm:p-10 lg:p-12 backdrop-blur-2xl bg-[#0A1F12]/35">
          <button
            onClick={onExit}
            className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 text-white/50 hover:text-white cursor-pointer text-xs font-semibold transition z-10 lg:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to store
          </button>

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F7B3A] shadow-lg shadow-emerald-900/30">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Admin Sign In</span>
            </div>

            {deniedForCurrentUser && !error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-500/15 backdrop-blur-sm p-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p className="text-xs leading-relaxed text-amber-100">
                  You're signed in, but this account doesn't have admin access. Sign in with a staff
                  account below.
                </p>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-white/60 mb-7">Sign in with your staff account to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@igoproteincuts.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClasses} pr-11`}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-500/15 backdrop-blur-sm p-3.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  <p className="text-xs leading-relaxed text-red-50">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-60"
              >
                {busy ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <button
              onClick={onExit}
              className="hidden lg:flex mt-6 items-center gap-2 text-xs font-semibold text-white/50 hover:text-white cursor-pointer transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to store
            </button>

            <p className="mt-7 text-center text-xs leading-relaxed text-white/40">
              Access is granted from the main admin dashboard.
              <br />
              Contact a super admin if you need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
