import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!loginId.trim() || !password) {
        throw new Error('Please enter both ID and password');
      }

      await login(loginId.trim(), password);
      setSuccessMsg('Authentication successful! Welcome to Auralis.');
      setTimeout(() => {
        navigate('/home');
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid ID or Password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img
              src="/vibe-logo.png"
              alt="Auralis Logo"
              className="h-16 w-auto mx-auto rounded-2xl shadow-2xl border border-amber-500/40 object-contain"
            />
            <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-500 text-neutral-950 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          
          <div>
            <h1 className="text-3xl font-extrabold font-serif text-white tracking-wider">
              Auralis Access
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Sign in to unlock your music timeline and memory journal.
            </p>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>User ID</span>
            </label>
            <input
              type="text"
              placeholder="Enter your ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-400 focus:bg-white/10 transition-all"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-neutral-500 outline-none focus:border-rose-400 focus:bg-white/10 transition-all"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-neutral-400 hover:text-white"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4 fill-current" />
            <span>{loading ? 'Verifying...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 text-center text-[11px] text-neutral-400 space-y-1">
          <p className="flex items-center justify-center gap-1 text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Restricted platform access</span>
          </p>
        </div>

      </div>
    </div>
  );
};
