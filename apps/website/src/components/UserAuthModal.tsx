import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, ShieldCheck, Star, Eye, EyeOff, KeyRound } from 'lucide-react';
import { StoreService } from '../lib/storage';
import { signIn, signUp, resetPassword, fetchProfile } from '../lib/api/auth';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

type AuthView = 'login' | 'signup' | 'forgot' | 'reset' | 'success';

// Full-screen split login page — real brand photography + bold headline on
// the left, a proper email + password sign-in form on the right (with
// Remember Me, Forgot Password, and a Login/Create Account switch), backed
// by a real email+password auth API on the server (server.ts:
// /api/auth/signup, /login, /forgot-password, /reset-password — salted with
// Node's crypto.scrypt, persisted to Supabase's igo_customers table when
// configured, or an in-memory store otherwise so the flow stays testable).
// Styled as a glassmorphic frosted-glass card floating over a blurred,
// darkened brand photo — translucent panels, backdrop-blur, soft borders.
export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [view, setView] = useState<AuthView>('login');
  const [successAction, setSuccessAction] = useState<'login' | 'signup'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const switchView = (next: AuthView) => {
    setView(next);
    setErrorMsg(null);
    setInfoMsg(null);
    setDevHint(null);
  };

  /**
   * Mirrors the freshly-authenticated Supabase user into the local UserProfile
   * cache so the header, account page and checkout render instantly without
   * waiting on a round trip. Supabase Auth remains the source of truth for
   * *identity*; this is only a display cache.
   */
  const completeLogin = async (
    userId: string,
    profileEmail: string,
    fallbackName: string,
    action: 'login' | 'signup'
  ) => {
    const currentProfile = StoreService.getUserProfile();

    // Pull the canonical `profiles` row — the same row the mobile app and the
    // admin's Customers screen read. A customer who signed up in the app sees
    // their real name, phone and wallet balance here.
    const remote = await fetchProfile(userId);

    StoreService.saveUserProfile({
      ...currentProfile,
      id: userId,
      email: profileEmail,
      name: remote?.fullName || fallbackName || currentProfile.name,
      phone: remote?.phoneNumber || currentProfile.phone,
      walletBalance: remote?.walletBalance ?? currentProfile.walletBalance
    });

    StoreService.setLoggedIn(true, action === 'login' ? rememberMe : true);
    setSuccessAction(action);
    setView('success');

    setTimeout(() => {
      onClose();
      onNavigate('/account');
    }, 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setErrorMsg(null);
    setIsSending(true);

    // Supabase Auth — the same identity provider the mobile app and the admin
    // dashboard use, so one account works across all three.
    const result = await signIn(email.trim(), password);
    setIsSending(false);

    if (!result.ok || !result.user) {
      setErrorMsg(result.error || 'Could not sign in. Please check your details and try again.');
      return;
    }

    await completeLogin(result.user.id, result.user.email ?? email.trim(), '', 'login');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;

    setErrorMsg(null);
    setIsSending(true);

    const result = await signUp(email.trim(), password, name.trim());
    setIsSending(false);

    if (!result.ok || !result.user) {
      setErrorMsg(result.error || 'Could not create your account. Please try again.');
      return;
    }

    // With "Confirm email" enabled in Supabase, signUp returns a user but no
    // session until the link is clicked. Say so plainly rather than dropping
    // the customer into a half-signed-in state.
    if (!result.user.email_confirmed_at && !result.user.confirmed_at) {
      setInfoMsg('Account created. Check your inbox to confirm your email, then sign in.');
      setView('login');
      setPassword('');
      return;
    }

    await completeLogin(result.user.id, result.user.email ?? email.trim(), name.trim(), 'signup');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg(null);
    setDevHint(null);
    setIsSending(true);

    // Supabase emails a secure recovery link. There is no manually-entered
    // token any more — the link carries it, and clicking it returns the
    // customer here with a live recovery session.
    const result = await resetPassword(email.trim());
    setIsSending(false);

    if (!result.ok) {
      setErrorMsg(result.error || 'Could not send the reset email. Please try again.');
      return;
    }

    // Deliberately worded so it doesn't confirm whether the address exists —
    // that would let anyone enumerate your customer list.
    setInfoMsg(
      'If an account exists for that email, a password reset link is on its way. ' +
        'Open it to choose a new password.'
    );
    setView('login');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || newPassword.length < 6) return;

    setErrorMsg(null);
    setIsSending(true);

    // Reached only when the customer arrives from a Supabase recovery link,
    // which puts a recovery session in place. updateUser() then sets the new
    // password against that session — no token is typed by hand.
    const { supabase } = await import('../lib/supabase');
    if (!supabase) {
      setErrorMsg('Backend not configured.');
      setIsSending(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSending(false);

    if (error) {
      setErrorMsg(
        error.message ||
          'Could not reset your password. Open the reset link from your email again and retry.'
      );
      return;
    }

    setPassword('');
    setInfoMsg('Password updated. Sign in with your new password below.');
    setView('login');
  };

  const inputClasses =
    'w-full bg-white/10 border border-white/20 focus:border-emerald-400/70 rounded-xl px-4 py-3.5 text-base text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.14] font-medium backdrop-blur-sm transition-colors';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050b07]">
      {/* Ambient blurred brand photo behind the whole glass card */}
      <div className="fixed inset-0">
        <img
          src="https://igo-protien-cut.vercel.app/images/narrative/facility.webp"
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#08120B]/55 via-[#0F2A18]/40 to-[#08120B]/60" />
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2 backdrop-blur-2xl bg-white/[0.06]">
          {/* Left — glass panel over brand photography */}
          <div className="hidden lg:flex relative flex-col justify-between p-10 xl:p-14 border-r border-white/10 bg-white/[0.03] overflow-hidden">
            <img
              src="https://igo-protien-cut.vercel.app/images/narrative/facility.webp"
              alt="IGO Protein Cuts cold-chain facility"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08120B]/85 via-[#08120B]/30 to-[#08120B]/40" />

            <button onClick={() => onNavigate('/')} className="relative z-10 flex items-center gap-2.5 cursor-pointer w-fit">
              <div className="w-10 h-10 rounded-xl bg-[#0F7B3A]/90 backdrop-blur-sm border border-white/20 flex items-center justify-center font-black text-white text-sm shrink-0">
                PC
              </div>
              <span className="text-sm font-black text-white tracking-tight">PROTEIN CUTS</span>
            </button>

            <div className="relative z-10 space-y-6">
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight drop-shadow-lg">
                Farm Fresh.
                <br />
                30-Min Express.
                <br />
                Every Order.
              </h1>
              <p className="text-white/70 text-sm max-w-sm">
                100% antibiotic-free chicken, mutton, seafood and eggs — hand-trimmed, cold-chain
                tracked at 0-4°C, and delivered straight to your kitchen.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <span className="text-white text-xs font-bold">4.9</span>
                <span className="text-white/50 text-xs">from 12,000+ verified reviews</span>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-white/50 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              FSSAI Certified &middot; ISO 22000 &middot; 100% Antibiotic-Free
            </div>
          </div>

          {/* Right — glass form panel */}
          <div className="relative flex items-start lg:items-center justify-center px-6 py-14 sm:p-10 lg:p-12 backdrop-blur-2xl bg-[#08120B]/35">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 sm:top-8 sm:right-8 text-white/50 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/10 transition z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10 w-full max-w-md">
              {/* Wordmark */}
              <div className="flex items-center gap-1 mb-8">
                <span className="text-3xl font-black text-white tracking-tight">Sign</span>
                <span className="text-3xl font-black text-white tracking-tight">i</span>
                <span className="text-3xl font-black text-white bg-[#0F7B3A] w-8 h-8 rounded-lg flex items-center justify-center leading-none shadow-lg shadow-emerald-900/30">n</span>
              </div>

              {(view === 'login' || view === 'signup') && (
                <div className="grid grid-cols-2 gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-1.5 mb-8">
                  <button
                    onClick={() => switchView('login')}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      view === 'login' ? 'bg-white text-[#08120B] shadow-sm' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Existing Customer
                  </button>
                  <button
                    onClick={() => switchView('signup')}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      view === 'signup' ? 'bg-white text-[#08120B] shadow-sm' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    New Customer
                  </button>
                </div>
              )}

              {infoMsg && view === 'login' && (
                <div className="text-xs text-emerald-50 bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-sm rounded-xl p-3.5 mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {infoMsg}
                </div>
              )}

              {/* LOGIN */}
              {view === 'login' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">Welcome Back</h2>
                  <p className="text-sm text-white/60 mb-7">Login with your email to continue.</p>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${inputClasses} pr-11`}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-white/30 text-[#0F7B3A] focus:ring-emerald-500 bg-white/10 cursor-pointer"
                        />
                        <span className="text-xs text-white/70 font-medium">Remember Me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => switchView('forgot')}
                        className="text-xs font-bold text-emerald-300 hover:text-emerald-200 cursor-pointer underline underline-offset-2"
                      >
                        Lost your password?
                      </button>
                    </div>

                    {errorMsg && (
                      <div className="text-xs text-red-50 bg-red-500/15 border border-red-400/30 backdrop-blur-sm rounded-xl p-3.5">{errorMsg}</div>
                    )}

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full bg-[#E0632B] hover:bg-[#c9541f] text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Sign In Now <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </form>

                  <p className="mt-7 text-center text-sm text-white/60">
                    Not a member yet?{' '}
                    <button onClick={() => switchView('signup')} className="font-bold text-[#F0895A] hover:text-[#f5a37c] cursor-pointer">
                      Join Now!
                    </button>
                  </p>
                </div>
              )}

              {/* SIGN UP */}
              {view === 'signup' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">Create Your Account</h2>
                  <p className="text-sm text-white/60 mb-7">Join in seconds — just your name, email, and a password.</p>

                  <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClasses}
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${inputClasses} pr-11`}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="text-xs text-red-50 bg-red-500/15 border border-red-400/30 backdrop-blur-sm rounded-xl p-3.5">{errorMsg}</div>
                    )}

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Create Account <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </form>

                  <p className="mt-7 text-center text-sm text-white/60">
                    Already have an account?{' '}
                    <button onClick={() => switchView('login')} className="font-bold text-emerald-300 hover:text-emerald-200 cursor-pointer">
                      Sign In
                    </button>
                  </p>

                  <div className="mt-4 text-center text-xs text-white/40">
                    By continuing, you agree to IGO Protein Cuts Privacy Policy &amp; Terms of Use.
                  </div>
                </div>
              )}

              {/* FORGOT PASSWORD */}
              {view === 'forgot' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">Reset Your Password</h2>
                  <p className="text-sm text-white/60 mb-7">Enter your account email and we'll send you a reset code.</p>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        autoComplete="email"
                      />
                    </div>

                    {errorMsg && (
                      <div className="text-xs text-red-50 bg-red-500/15 border border-red-400/30 backdrop-blur-sm rounded-xl p-3.5">{errorMsg}</div>
                    )}

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Send Reset Code <KeyRound className="w-4 h-4" /></>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="w-full text-center text-sm font-bold text-white/50 hover:text-white cursor-pointer transition"
                    >
                      Back to Sign In
                    </button>
                  </form>
                </div>
              )}

              {/* RESET PASSWORD */}
              {view === 'reset' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight">Enter Reset Code</h2>
                  <p className="text-sm text-white/60 mb-2">
                    We sent a reset code for <strong className="text-white">{email}</strong>.
                  </p>
                  {devHint && (
                    <p className="text-xs text-white/90 bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3.5 mb-4 mt-4">
                      No email provider configured yet — demo code for testing: <strong className="tracking-widest">{devHint}</strong>
                    </p>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-5 mt-6">
                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">Reset Code</label>
                      <input
                        type="text"
                        placeholder="e.g. A1B2C3D4"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        className={`${inputClasses} text-center text-lg font-black tracking-widest uppercase`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputClasses}
                        autoComplete="new-password"
                      />
                    </div>

                    {errorMsg && (
                      <div className="text-xs text-red-50 bg-red-500/15 border border-red-400/30 backdrop-blur-sm rounded-xl p-3.5">{errorMsg}</div>
                    )}

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/30"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* SUCCESS */}
              {view === 'success' && (
                <div className="py-14 text-center space-y-3">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <h2 className="text-2xl font-black text-white">
                    {successAction === 'login' ? 'Welcome Back!' : 'Account Created!'}
                  </h2>
                  <p className="text-sm text-white/60">Redirecting to your IGO Profile...</p>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
