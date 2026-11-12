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
      setSuccessMsg('Welcome to Auralis.');
      setTimeout(() => {
        navigate('/home');
      }, 350);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid ID or Password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1f1f] via-[#121212] to-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-[#121212] p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img
              src="/vibe-logo.png"
              alt="Auralis"
              className="h-16 w-16 mx-auto rounded-full shadow-2xl ring-2 ring-[#1ed760]/60 object-cover bg-black"
            />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Log in to Auralis
            </h1>
            <p className="text-xs text-[#b3b3b3] mt-1">
              Sign in to access your music library and memory vibes.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-[#1ed760]/15 border border-[#1ed760]/40 text-[#1ed760] text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1ed760]" />
              <span>User ID</span>
            </label>
            <input
              type="text"
              placeholder="Enter your ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-white/15 text-sm text-white placeholder-[#727272] outline-none focus:border-white transition-all"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#1ed760]" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3 rounded-lg bg-[#181818] border border-white/15 text-sm text-white placeholder-[#727272] outline-none focus:border-white transition-all"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[#b3b3b3] hover:text-white cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-bold text-sm bg-[#1ed760] hover:bg-[#3be477] text-black shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Log In'}</span>
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 text-center text-[11px] text-[#727272]">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1ed760]" />
            <span>Private Auralis Streaming Access</span>
          </p>
        </div>
      </div>
    </div>
  );
};
