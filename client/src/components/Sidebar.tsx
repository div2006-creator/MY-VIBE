import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Library, Plus, Heart, Clock, Compass, Radio, BarChart3, Users, Disc3, Play } from 'lucide-react';
import type { Artist } from '../types';
import { useAudio } from '../context/AudioContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playSong } = useAudio();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'artists' | 'spaces'>('all');

  useEffect(() => {
    fetch('/api/artists')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtists(data.slice(0, 24));
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const quickSpaces = [
    {
      path: '/liked-songs',
      title: 'Liked Songs',
      subtitle: 'Playlist • Saved Cuts',
      icon: Heart,
      gradient: 'from-[#450af5] via-[#6b4df9] to-[#c4efd9]',
      iconClass: 'text-white fill-white',
    },
    {
      path: '/my-vibes',
      title: 'My Vibes Journal',
      subtitle: 'Memories • Timeline',
      icon: Clock,
      gradient: 'from-[#1db954] to-[#0f5b29]',
      iconClass: 'text-black',
    },
    {
      path: '/playlists',
      title: 'Curated Playlists',
      subtitle: 'Mood Mixes & Collections',
      icon: Disc3,
      gradient: 'from-[#e13300] to-[#f59b23]',
      iconClass: 'text-white',
    },
    {
      path: '/genres',
      title: 'Genres & Radio',
      subtitle: 'Stations • Infinite Stream',
      icon: Radio,
      gradient: 'from-[#1e3264] to-[#509bf5]',
      iconClass: 'text-white',
    },
    {
      path: '/live',
      title: 'Live Lounge',
      subtitle: 'Sync Room • Online Now',
      icon: Users,
      gradient: 'from-[#8d67ab] to-[#e8115b]',
      iconClass: 'text-white',
    },
    {
      path: '/explore',
      title: 'Community Vibes',
      subtitle: 'Discover Listeners',
      icon: Compass,
      gradient: 'from-[#006450] to-[#1ed760]',
      iconClass: 'text-white',
    },
    {
      path: '/analytics',
      title: 'Listening Stats',
      subtitle: 'Top Artists & Minutes',
      icon: BarChart3,
      gradient: 'from-[#282828] to-[#535353]',
      iconClass: 'text-[#1ed760]',
    },
  ];

  const handlePlayArtistQuick = (e: React.MouseEvent, artist: Artist) => {
    e.preventDefault();
    e.stopPropagation();
    if (artist.songs && artist.songs.length > 0) {
      playSong(artist.songs[0], undefined, artist.songs);
    } else {
      navigate(`/artist/${artist.id}`);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-[268px] xl:w-[290px] bg-[#121212] rounded-lg overflow-hidden shrink-0 select-none h-full border border-white/[0.04]">
      {/* Library Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <Link
          to="/playlists"
          className="flex items-center gap-3 text-[#b3b3b3] hover:text-white transition-colors group"
        >
          <Library className="w-6 h-6 group-hover:scale-105 transition-transform" />
          <span className="font-bold text-[15px] tracking-tight">Your Library</span>
        </Link>

        <Link
          to="/create-vibe"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-all"
          title="Create a new Vibe memory"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Filter Pills */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'spaces', label: 'Collections' },
          { id: 'artists', label: 'Artists' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterTab === tab.id
                ? 'bg-white text-black'
                : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Library Items */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {(filterTab === 'all' || filterTab === 'spaces') && (
          <div className="space-y-0.5">
            {quickSpaces.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors group ${
                    active ? 'bg-[#232323]' : 'hover:bg-[#1f1f1f]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-md bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    <Icon className={`w-5 h-5 ${item.iconClass}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        active ? 'text-[#1ed760]' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-[#b3b3b3] truncate">{item.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {(filterTab === 'all' || filterTab === 'artists') && artists.length > 0 && (
          <div className="pt-2">
            {filterTab === 'all' && (
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7]">
                  Artists
                </span>
                <Link
                  to="/artists"
                  className="text-[11px] font-semibold text-[#b3b3b3] hover:text-white hover:underline"
                >
                  Show all
                </Link>
              </div>
            )}

            <div className="space-y-0.5">
              {artists.map((artist) => {
                const active = isActive(`/artist/${artist.id}`);
                return (
                  <Link
                    key={artist.id}
                    to={`/artist/${artist.id}`}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors group ${
                      active ? 'bg-[#232323]' : 'hover:bg-[#1f1f1f]'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#282828]">
                      <img
                        src={artist.avatarUrl || artist.songs?.[0]?.coverUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => handlePlayArtistQuick(e, artist)}
                        className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        title={`Play ${artist.name}`}
                      >
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          active ? 'text-[#1ed760]' : 'text-white'
                        }`}
                      >
                        {artist.name}
                      </p>
                      <p className="text-xs text-[#b3b3b3] truncate">
                        Artist • {artist.songCount || artist.songs?.length || 1} songs
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

