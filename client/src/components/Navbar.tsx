import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Disc, Compass, Clock, Heart, Search, PlusCircle, LogIn, Menu, X, Radio, BarChart3, ListMusic, Users, Mic2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/home', label: 'Home', icon: Disc },
    { path: '/artists', label: 'Singers / Artists', icon: Mic2 },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/genres', label: 'Radio & Moods', icon: Radio },
    { path: '/playlists', label: 'Playlists', icon: ListMusic },
    { path: '/live', label: 'Live Lounge', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/my-vibes', label: 'My Vibes', icon: Clock },
    { path: '/liked-songs', label: 'Liked', icon: Heart },
  ];

  const isActive = (path: string) => {
    if (path === '/home' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <img
            src="/vibe-logo.png"
            alt="VIBE Logo"
            className="h-10 w-auto rounded-xl shadow-lg border border-amber-500/30 group-hover:scale-105 transition-transform duration-300 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-wider text-gradient-amber">VIBE</span>
            <span className="text-[9px] uppercase tracking-widest text-amber-300/70 font-semibold -mt-1">
              Soundtrack to Memories
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 glass-pill px-3 py-1.5 rounded-full border border-white/10 shadow-inner overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : ''}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Create Vibe CTA, Search, User Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => navigate('/search')}
            className="p-2.5 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Search songs, artists, vibes..."
          >
            <Search className="w-4 h-4" />
          </button>

          <Link
            to="/create-vibe"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 shadow-md hover:shadow-amber-500/20 hover:scale-[1.02] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Vibe</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <Link to="/profile" className="flex items-center gap-2 group">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-amber-500/40 object-cover group-hover:border-amber-400 transition-colors"
                />
                <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors hidden xl:inline">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-neutral-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg text-neutral-300 hover:bg-white/10"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden pt-4 pb-3 border-t border-white/10 mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/create-vibe"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Vibe</span>
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-white/5 border border-white/10"
            >
              <Search className="w-4 h-4" />
              <span>Search Music & Memories</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
