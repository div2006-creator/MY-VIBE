import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Disc, Compass, Clock, Heart, Search, PlusCircle, LogIn, LogOut, Menu, X, Radio, BarChart3, ListMusic, Users, Mic2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/home', label: 'Mood Sanctuary', icon: Disc },
    { path: '/artists', label: 'Titans & Singers', icon: Mic2 },
    { path: '/explore', label: 'Crate Explorer', icon: Compass },
    { path: '/genres', label: 'Radio & Moods', icon: Radio },
    { path: '/playlists', label: 'Taste Vault', icon: ListMusic },
    { path: '/live', label: 'Listening Room', icon: Users },
    { path: '/analytics', label: 'Needle Hours', icon: BarChart3 },
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

        {/* Desktop Brand Logo & Chassis Indicator */}
        <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/vibe-logo.png"
                alt="VIBE Resonance"
                className="h-9 w-auto rounded-lg shadow-md border border-[#ecc15a]/30 group-hover:scale-105 transition-transform duration-300 object-contain bg-[#110e0c]"
              />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ecc15a] border-2 border-[#161311] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-extrabold text-xl tracking-wider text-[#ffb68c]">
                RESONANCE <span className="text-[#ecc15a] font-normal text-sm">/ VIBE</span>
              </span>
              <span className="font-mono-spec text-[9px] uppercase tracking-widest text-[#a38c80] -mt-0.5">
                Audio Sanctum • 33⅓ RPM • 386 Cuts
              </span>
            </div>
          </Link>

          {/* Analog Calibration Badge (Stitch Style) */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#1e1b19] border border-[#554339]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ecc15a] animate-ping" />
            <span className="font-mono-spec text-[10px] text-[#ecc15a] uppercase tracking-wider">
              OPTICAL CHASSIS ACTIVE
            </span>
            <span className="text-[#554339]">•</span>
            <span className="font-mono-spec text-[10px] text-[#a38c80]">EST. 1974</span>
          </div>
        </div>

        {/* Desktop Navigation Links (Warm Analog Editorial Tabs) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#1e1b19] px-2.5 py-1.5 rounded-lg border border-[#554339]/40 shadow-inner overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  active
                    ? 'bg-[#2d2927] text-[#ffb68c] font-semibold border border-[#ecc15a]/40 shadow-[inset_2px_0_0_0_#ffb68c]'
                    : 'text-[#dbc1b4] hover:text-[#e9e1dd] hover:bg-[#282422]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#ffb68c]' : 'text-[#a38c80]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Search, Create Vibe, User Auth */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded bg-[#1e1b19] text-[#a38c80] hover:text-[#ffb68c] border border-[#554339]/40 hover:border-[#ecc15a]/40 transition-colors"
            title="Search Vinyl, Singer & Memory Catalog..."
          >
            <Search className="w-4 h-4" />
          </button>

          <Link
            to="/create-vibe"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#d97736] text-[#221f1d] font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(217,119,54,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 fill-current" />
            <span>Drop Needle</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#554339]/40">
              <Link to="/profile" className="flex items-center gap-2 group">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-[#ecc15a]/50 object-cover group-hover:border-[#ffb68c] transition-colors"
                />
                <div className="flex flex-col text-left hidden xl:flex">
                  <span className="font-serif text-xs font-semibold text-[#e9e1dd] leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="font-mono-spec text-[9px] text-[#ecc15a] uppercase">Curator Tier</span>
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="p-1.5 rounded text-[#a38c80] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors"
                title="Log Out (Lock Dashboard)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#e9e1dd] bg-[#1e1b19] hover:bg-[#282422] border border-[#554339]/40 transition-all"
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
