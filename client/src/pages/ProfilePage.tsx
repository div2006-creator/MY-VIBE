import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Music, MapPin, Edit3, LogOut, Disc, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Vibe } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile } = useAuth();

  const [profileData, setProfileData] = useState<{
    user: any;
    stats: {
      totalVibes: number;
      totalSongs: number;
      favoriteMood: string;
      favoriteArtists: { id: string; name: string; count: number }[];
    };
    vibesTimeline: Vibe[];
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editMood, setEditMood] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = () => {
    const token = localStorage.getItem('vibe_token');
    fetch('/api/profile', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user && (!data.user.avatarUrl || data.user.avatarUrl.includes('1534528741775'))) {
          data.user.avatarUrl = '/minecraft-avatar.jpg';
        }
        setProfileData(data);
        if (data.user) {
          setEditName(data.user.name || '');
          setEditBio(data.user.bio || '');
          setEditMood(data.user.favoriteMood || '');
        }
      })
      .catch(console.error);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        name: editName,
        bio: editBio,
        favoriteMood: editMood,
      });
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-full bg-[#121212] flex items-center justify-center text-[#1ed760] py-24">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { stats, vibesTimeline } = profileData;
  const avatarSrc =
    profileData.user.avatarUrl && !profileData.user.avatarUrl.includes('1534528741775')
      ? profileData.user.avatarUrl
      : '/minecraft-avatar.jpg';

  return (
    <div className="min-h-full bg-gradient-to-b from-[#1f3b2c]/55 via-[#121212] to-[#121212] text-white pb-28 lg:pb-12 px-4 lg:px-8 pt-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Profile Header Card */}
        <div className="bg-[#181818]/90 p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <img
                src={avatarSrc}
                alt={profileData.user.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-[#1ed760]/70 shadow-2xl bg-[#282828]"
              />

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3] block">
                  Profile
                </span>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                    {profileData.user.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30">
                    {profileData.user.favoriteMood || 'Chill'}
                  </span>
                </div>

                <p className="text-sm text-[#b3b3b3] max-w-md">
                  “{profileData.user.bio || 'Creating soundtracks for my life moments'}”
                </p>

                <p className="text-xs text-[#727272] font-mono">
                  {profileData.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white/5 hover:bg-red-500/20 text-[#b3b3b3] hover:text-red-300 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-white/10 text-center">
            <div className="p-3.5 rounded-xl bg-[#232323]">
              <span className="block text-2xl font-extrabold text-[#1ed760]">
                {stats.totalVibes}
              </span>
              <span className="text-xs text-[#b3b3b3]">Total Vibes</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#232323]">
              <span className="block text-2xl font-extrabold text-white">
                {stats.totalSongs}
              </span>
              <span className="text-xs text-[#b3b3b3]">Soundtrack Songs</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#232323]">
              <span className="block text-lg font-bold text-[#1ed760] truncate">
                {stats.favoriteMood}
              </span>
              <span className="text-xs text-[#b3b3b3]">Favorite Mood</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#232323]">
              <span className="block text-lg font-bold text-white truncate">
                {stats.favoriteArtists[0]?.name || 'Atif Aslam'}
              </span>
              <span className="text-xs text-[#b3b3b3]">Top Artist</span>
            </div>
          </div>
        </div>

        {/* Favorite Artists */}
        {stats.favoriteArtists.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-[#1ed760]" />
              <span>Top Artists</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.favoriteArtists.map((art) => (
                <div
                  key={art.id}
                  onClick={() => navigate(`/artist/${art.id}`)}
                  className="px-4 py-2.5 rounded-full bg-[#181818] hover:bg-[#282828] border border-white/5 flex items-center gap-2 text-xs font-semibold text-white cursor-pointer transition-colors"
                >
                  <Disc className="w-4 h-4 text-[#1ed760]" />
                  <span>{art.name}</span>
                  <span className="text-[11px] text-[#b3b3b3]">({art.count})</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* User's Vibe Timeline */}
        <section className="space-y-4">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1ed760]" />
            <span>Your Vibes ({vibesTimeline.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vibesTimeline.map((vibe) => (
              <div
                key={vibe.id}
                onClick={() => navigate(`/vibe/${vibe.id}`)}
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl border border-white/5 flex items-center gap-4 cursor-pointer transition-all"
              >
                <img
                  src={vibe.coverUrl}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shadow"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-white truncate">
                    {vibe.title}
                  </h4>
                  <p className="text-xs text-[#b3b3b3] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#1ed760]" /> {vibe.location} •{' '}
                    {vibe.date}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-[#1ed760]/15 text-[#1ed760] font-semibold">
                    {vibe.mood}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#242424] w-full max-w-md rounded-2xl p-6 border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-lg text-white">Edit profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-[#b3b3b3] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#b3b3b3] block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#121212] border border-white/15 text-sm text-white outline-none focus:border-[#1ed760]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#b3b3b3] block mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#121212] border border-white/15 text-sm text-white outline-none focus:border-[#1ed760]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#b3b3b3] block mb-1">
                  Favorite Mood
                </label>
                <input
                  type="text"
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#121212] border border-white/15 text-sm text-white outline-none focus:border-[#1ed760]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#b3b3b3] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#1ed760] hover:bg-[#3be477] text-black shadow cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
