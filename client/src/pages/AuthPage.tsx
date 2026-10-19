import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name) throw new Error('Please enter your name');
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login('alex@vibe.com', 'password123');
      navigate('/home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 flex items-center justify-center p-4">
      
      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/vibe-logo.png"
            alt="VIBE Logo"
            className="h-16 w-auto mx-auto rounded-2xl shadow-2xl border border-amber-500/30 object-contain"
          />
          
          <h1 className="text-3xl font-extrabold font-serif text-white tracking-wider">
            VIBE
          </h1>
          <p className="text-xs text-neutral-400">
            {isRegister ? 'Create your personal memory soundtrack account' : 'Sign in to access your Vibe journal'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Quick Demo Sign In Button */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-2 shadow transition-all"
        >
          <Zap className="w-4 h-4 fill-current text-amber-400" />
          <span>⚡ Instant Demo Login (Alex Rivera)</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>or fill details</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300">Name</label>
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                required={isRegister}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300">Email Address</label>
            <input
              type="email"
              placeholder="alex@vibe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-neutral-400 pt-2">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsRegister(false)} className="text-amber-400 font-bold hover:underline">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsRegister(true)} className="text-amber-400 font-bold hover:underline">
                Register
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
