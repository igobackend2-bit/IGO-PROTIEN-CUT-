import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

import { generateOTP, sendEmailOTP } from '../services/authService';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: ''
  });
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [showMockHint, setShowMockHint] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    const newOTP = generateOTP();
    setGeneratedOTP(newOTP);
    
    // Attempt real delivery
    await sendEmailOTP(formData.email, newOTP, formData.name);
    
    setStep('otp');
    setResendTimer(30);
    setShowMockHint(true);
    // Hide hint after 10s
    setTimeout(() => setShowMockHint(false), 10000);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow the generated OTP or 1234 for testing
    if (formData.otp === generatedOTP || formData.otp === '1234') {
      setStep('success');
      // Persist session
      localStorage.setItem('igo_user', JSON.stringify({
        name: formData.name,
        email: formData.email,
        isAuthenticated: true
      }));
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-dark/80 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[90vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl z-[110] flex flex-col"
          >
            {/* Header image / brand */}
            <div className="relative h-32 bg-neutral-dark overflow-hidden flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607116176195-b81b1f41f536?w=600')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark to-transparent" />
              
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/20 overflow-hidden shadow-lg">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-110" />
                </div>
                <h2 className="text-white font-display font-bold tracking-widest text-xs uppercase opacity-80">Protein Cuts</h2>
              </div>

              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-neutral-dark flex items-center justify-center hover:bg-neutral-100 transition-all z-20 shadow-lg border border-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 'details' && (
                  <motion.form 
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSendOTP}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <h3 className="font-display font-bold text-2xl text-neutral-dark mb-2">Welcome to Freshness</h3>
                      <p className="text-sm text-neutral-500">Sign in with your email to track orders and earn IGO rewards.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Name */}
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Full Name"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-igo-green focus:bg-white transition-colors"
                        />
                      </div>

                      {/* Email Only */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter Email Address"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-igo-green focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-igo-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98] mt-6"
                    >
                      Send OTP
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <p className="text-[10px] text-center text-neutral-400 mt-4">
                      By proceeding, you agree to our Terms of Service & Privacy Policy.
                    </p>
                  </motion.form>
                )}

                {step === 'otp' && (
                  <motion.form 
                    key="otp"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleVerifyOTP}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h3 className="font-display font-bold text-2xl text-neutral-dark mb-2">Verify it's you</h3>
                      <p className="text-sm text-neutral-500">
                        Enter the 4-digit OTP sent to <br/>
                        <span className="font-bold text-neutral-700">
                          {formData.email}
                        </span>
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <input 
                          key={i}
                          type="text"
                          maxLength={1}
                          required
                          className="w-12 h-14 text-center font-display font-bold text-2xl bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-igo-green focus:bg-white transition-colors"
                          onChange={(e) => {
                            if (e.target.value.length === 1 && i < 4) {
                              const next = e.target.parentElement?.children[i] as HTMLInputElement;
                              if (next) next.focus();
                            }
                            setFormData({...formData, otp: formData.otp + e.target.value});
                          }}
                        />
                      ))}
                    </div>

                    {showMockHint && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-igo-green/10 rounded-full flex items-center justify-center text-igo-green">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-tight">
                          Verification code sent<br/>
                          <span className="text-neutral-900 normal-case">Use <span className="text-igo-green font-mono text-sm">{generatedOTP}</span> for instant access</span>
                        </p>
                      </motion.div>
                    )}

                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-xs font-bold text-neutral-400">
                          Resend OTP in 00:{resendTimer.toString().padStart(2, '0')}
                        </p>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setResendTimer(30)}
                          className="text-xs font-bold text-igo-green hover:underline"
                        >
                          Resend OTP Now
                        </button>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-igo-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98]"
                    >
                      Verify & Login
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setStep('details')}
                      className="w-full text-center text-sm font-bold text-neutral-400 hover:text-neutral-600 mt-2"
                    >
                      Change Email Address
                    </button>
                  </motion.form>
                )}

                {step === 'success' && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-8 space-y-4"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-igo-green" />
                    </motion.div>
                    <h3 className="font-display font-bold text-2xl text-neutral-dark">Welcome back, {formData.name.split(' ')[0]}!</h3>
                    <p className="text-sm text-neutral-500">You're securely logged in.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
