import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Plus,
  LogIn,
  LogOut,
  Menu,
  X,
  Mic2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Clock,
  Compass,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const mobileNavLinks = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/artists', label: 'Artists', icon: Mic2 },
    { path: '/liked-songs', label: 'Liked Songs', icon: Heart },
    { path: '/my-vibes', label: 'My Vibes', icon: Clock },
    { path: '/genres', label: 'Genres & Radio', icon: Radio },
    { path: '/explore', label: 'Explore Vibes', icon: Compass },
  ];

  const isActive = (path: string) => {
    if (path === '/home' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const avatarSrc =
    user?.avatarUrl && !user.avatarUrl.includes('1534528741775')
      ? user.avatarUrl
      : '/minecraft-avatar.jpg';

  return (
    <header className="sticky top-0 z-40 bg-black px-3 lg:px-4 py-2.5 select-none shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile View Left: Minecraft Profile Avatar + Auralis Brand */}
        <div className="flex lg:hidden items-center gap-2.5">
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full overflow-hidden bg-[#282828] ring-2 ring-[#1db954]/60 flex items-center justify-center active:scale-95 transition-transform"
            title="Profile"
          >
            <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
          </Link>
          <Link to="/home" className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">
              Auralis
            </span>
          </Link>
        </div>

        {/* Desktop Left: Brand Logo + History Arrows */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link to="/home" className="flex items-center gap-2.5 group pr-1">
            <img
              src="/vibe-logo.png"
              alt="Auralis"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/15 group-hover:scale-105 transition-transform bg-[#121212]"
            />
            <span className="font-extrabold text-lg tracking-tight text-white">
              Auralis
            </span>
          </Link>

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => window.history.back()}
              className="w-8 h-8 rounded-full bg-[#121212] hover:bg-[#1f1f1f] flex items-center justify-center text-[#b3b3b3] hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="w-8 h-8 rounded-full bg-[#121212] hover:bg-[#1f1f1f] flex items-center justify-center text-[#b3b3b3] hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Go forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Center: Home Circular Button + Wide Streaming Search Bar */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-[540px] mx-auto">
          <Link
            to="/home"
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 ${
              isActive('/home')
                ? 'bg-[#282828] text-white'
                : 'bg-[#1f1f1f] text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a]'
            }`}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex items-center bg-[#1f1f1f] hover:bg-[#2a2a2a] focus-within:bg-[#242424] focus-within:ring-2 focus-within:ring-white rounded-full px-3.5 h-11 transition-all group"
          >
            <Search className="w-5 h-5 text-[#b3b3b3] group-focus-within:text-white shrink-0 mr-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => {
                if (location.pathname !== '/search' && !searchInput) {
                  // Allow typing seamlessly before submit or clicking Search
                }
              }}
              placeholder="What do you want to play?"
              className="w-full bg-transparent text-sm text-white placeholder-[#b3b3b3] outline-none"
            />
            <div className="h-5 w-px bg-white/15 mx-2.5 shrink-0" />
            <Link
              to="/genres"
              className="text-[#b3b3b3] hover:text-white transition-colors shrink-0"
              title="Browse Genres & Radio"
            >
              <Compass className="w-5 h-5" />
            </Link>
          </form>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <Link
            to="/artists"
            className={`hidden xl:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isActive('/artists')
                ? 'bg-white text-black'
                : 'text-[#b3b3b3] hover:text-white hover:scale-105'
            }`}
          >
            Artists
          </Link>

          <Link
            to="/create-vibe"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Vibe</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-all group"
                title={user.name}
              >
                <img
                  src={avatarSrc}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1db954]/70 group-hover:ring-[#1ed760] transition-all"
                />
                <span className="hidden xl:inline text-xs font-bold text-white truncate max-w-[90px]">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="w-9 h-9 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-black bg-[#1ed760] hover:bg-[#3be477] transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Log in</span>
            </Link>
          )}
        </div>

        {/* Mobile Right Actions: Search + Menu */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/search"
            className="w-9 h-9 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden mt-3 pt-3 pb-3 border-t border-white/10 bg-[#121212] rounded-xl p-3 flex flex-col gap-1.5 shadow-2xl">
          {mobileNavLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  active
                    ? 'bg-[#282828] text-[#1ed760]'
                    : 'text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 mt-1 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/create-vibe"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs bg-[#1ed760] text-black"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vibe Memory</span>
            </Link>
            {user && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                  navigate('/auth');
                }}
                className="flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold text-[#b3b3b3] bg-[#1f1f1f]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
