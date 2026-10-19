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
      <div className="min-h-screen bg-[#0b0a0e] flex items-center justify-center text-amber-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { stats, vibesTimeline } = profileData;

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 pb-32 px-4 lg:px-8 pt-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Profile Card Banner */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <img
                src={profileData.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={profileData.user.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-amber-400 shadow-2xl"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl md:text-4xl font-bold font-serif text-white">
                    {profileData.user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {profileData.user.favoriteMood || '😎 Chill'}
                  </span>
                </div>

                <p className="text-sm text-neutral-300 max-w-md italic">
                  “{profileData.user.bio || 'Creating soundtracks for my life moments ✨'}”
                </p>

                <p className="text-xs text-neutral-500 font-mono">
                  {profileData.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-full text-xs font-semibold glass-pill border border-white/15 hover:bg-white/10 text-neutral-200 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-white/10 text-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl font-extrabold font-serif text-amber-400">{stats.totalVibes}</span>
              <span className="text-xs text-neutral-400">Total Vibes</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-2xl font-extrabold font-serif text-rose-400">{stats.totalSongs}</span>
              <span className="text-xs text-neutral-400">Soundtrack Songs</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-lg font-bold text-indigo-300 truncate">{stats.favoriteMood}</span>
              <span className="text-xs text-neutral-400">Favorite Mood</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-lg font-bold text-amber-300 truncate">
                {stats.favoriteArtists[0]?.name || 'Luna Bay'}
              </span>
              <span className="text-xs text-neutral-400">Top Artist</span>
            </div>
          </div>

        </div>

        {/* Favorite Artists */}
        {stats.favoriteArtists.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-400" />
              <span>Favorite Memory Artists</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.favoriteArtists.map((art) => (
                <div
                  key={art.id}
                  className="px-4 py-2 rounded-2xl glass-card border border-white/10 flex items-center gap-2 text-xs font-semibold text-neutral-200"
                >
                  <Disc className="w-4 h-4 text-amber-400" />
                  <span>{art.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">({art.count} tracks)</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* User's Vibe Timeline */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Personal Timeline ({vibesTimeline.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vibesTimeline.map((vibe) => (
              <div
                key={vibe.id}
                onClick={() => navigate(`/vibe/${vibe.id}`)}
                className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:border-amber-500/30 transition-all"
              >
                <img src={vibe.coverUrl} alt="" className="w-16 h-16 rounded-xl object-cover shadow" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-white font-serif truncate">{vibe.title}</h4>
                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-400" /> {vibe.location} • {vibe.date}
                  </p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
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
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-lg text-white font-serif">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Bio / Story Tagline</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Favorite Mood</label>
                <input
                  type="text"
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold glass-pill text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-full text-xs font-bold bg-amber-500 text-neutral-950 shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
