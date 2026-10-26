import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Disc, Clock, Heart, Search, PlusCircle, LogIn, LogOut, Menu, X, Mic2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/home', label: 'Mood Sanctuary', icon: Disc },
    { path: '/artists', label: 'Titans & Singers', icon: Mic2 },
    { path: '/my-vibes', label: 'My Vibes', icon: Clock },
    { path: '/liked-songs', label: 'Liked Pressings', icon: Heart },
  ];

  const isActive = (path: string) => {
    if (path === '/home' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#161311]/95 backdrop-blur-xl border-b border-[#554339]/40 px-4 lg:px-8 py-3 transition-all select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Mobile View Left: Profile (Circular 'M' / Avatar as drawn in sketch) */}
        <div className="flex lg:hidden items-center gap-2.5">
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full border border-[#ecc15a]/70 overflow-hidden bg-[#221f1d] flex items-center justify-center shadow-md active:scale-95 transition-transform"
            title="Profile"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif font-bold text-xs text-[#ffb68c]">M</span>
            )}
          </Link>
          <Link to="/" className="flex flex-col">
            <span className="font-serif font-bold text-base tracking-wider text-[#ffb68c]">
              RESONANCE
            </span>
          </Link>
        </div>

        {/* Desktop Brand Logo & Spotify History Arrows */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {/* Spotify-style History Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.history.back()}
              className="w-8 h-8 rounded-full bg-[#1e1b19] hover:bg-[#282422] border border-[#554339]/50 flex items-center justify-center text-[#dbc1b4] hover:text-[#ffb68c] active:scale-95 transition-all shadow-sm"
              title="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="w-8 h-8 rounded-full bg-[#1e1b19] hover:bg-[#282422] border border-[#554339]/50 flex items-center justify-center text-[#dbc1b4] hover:text-[#ffb68c] active:scale-95 transition-all shadow-sm"
              title="Go forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/vibe-logo.png"
                alt="VIBE Resonance"
                className="h-8 w-auto rounded-lg shadow-md border border-[#ecc15a]/30 group-hover:scale-105 transition-transform duration-300 object-contain bg-[#110e0c]"
              />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ecc15a] border-2 border-[#161311] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-extrabold text-lg tracking-wider text-[#ffb68c]">
                RESONANCE <span className="text-[#ecc15a] font-normal text-xs">/ VIBE</span>
              </span>
              <span className="font-mono-spec text-[8.5px] uppercase tracking-widest text-[#a38c80] -mt-0.5">
                Spotify Format • 33⅓ RPM • 617 Master Cuts
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links (Spotify-style Pill Format) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#1e1b19]/90 px-3 py-1.5 rounded-full border border-[#554339]/40 shadow-inner overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  active
                    ? 'bg-[#d97736] text-[#221f1d] font-bold shadow-[0_2px_10px_rgba(217,119,54,0.3)]'
                    : 'text-[#dbc1b4] hover:text-[#e9e1dd] hover:bg-[#282422]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#221f1d]' : 'text-[#a38c80]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Spotify-style Search Pill, Create Vibe, User Auth */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1b19] text-[#a38c80] hover:text-[#ffb68c] border border-[#554339]/40 hover:border-[#ecc15a]/40 transition-colors shadow-sm text-xs font-editorial"
            title="Search Vinyl, Singer & Memory Catalog..."
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Search Catalog...</span>
          </button>

          <Link
            to="/create-vibe"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#d97736] text-[#221f1d] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(217,119,54,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 fill-current" />
            <span>Drop Needle</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#554339]/40">
              <Link to="/profile" className="flex items-center gap-2 py-1 px-2 rounded-full bg-[#1e1b19] hover:bg-[#282422] border border-[#554339]/40 group transition-all">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-[#ecc15a]/50 object-cover group-hover:border-[#ffb68c] transition-colors"
                />
                <div className="flex flex-col text-left hidden xl:flex pr-1">
                  <span className="font-serif text-xs font-semibold text-[#e9e1dd] leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="p-1.5 rounded-full text-[#a38c80] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors"
                title="Log Out (Lock Dashboard)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#e9e1dd] bg-[#1e1b19] hover:bg-[#282422] border border-[#554339]/40 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg text-[#dbc1b4] hover:bg-[#221f1d]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden pt-4 pb-3 border-t border-[#554339]/40 mt-3 flex flex-col gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-[#2d2927] text-[#ffb68c] border border-[#ecc15a]/40 font-semibold'
                    : 'text-[#dbc1b4] hover:bg-[#1e1b19]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#ecc15a]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#554339]/40 flex flex-col gap-2">
            <Link
              to="/create-vibe"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs bg-[#d97736] text-[#221f1d] uppercase tracking-wider"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Drop Needle / Create Vibe</span>
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-[#dbc1b4] bg-[#1e1b19] border border-[#554339]/40"
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
