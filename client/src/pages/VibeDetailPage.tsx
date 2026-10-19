import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Play, Pause, Plus, Trash2, Music, ArrowLeft, X, Search, Check } from 'lucide-react';
import type { Vibe, Song } from '../types';
import { useAudio } from '../context/AudioContext';

export const VibeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playVibe, playSong, currentSong, isPlaying, togglePlay } = useAudio();

  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [searchSongQuery, setSearchSongQuery] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchVibeDetail();
    fetchAllSongs();
  }, [id]);

  const fetchVibeDetail = () => {
    fetch(`/api/vibes/${id}`)
      .then((res) => res.json())
      .then((data) => setVibe(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchAllSongs = () => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data) => setAllSongs(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const handleAddSongToVibe = async (songId: string) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('vibe_token');
      await fetch(`/api/vibes/${id}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ songId }),
      });
      fetchVibeDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSongFromVibe = async (songId: string) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('vibe_token');
      await fetch(`/api/vibes/${id}/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      fetchVibeDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0a0e] flex items-center justify-center text-amber-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!vibe) {
    return (
      <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 p-8 text-center">
        <h2 className="text-2xl font-bold font-serif mb-4">Vibe Not Found</h2>
        <button onClick={() => navigate('/my-vibes')} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-full">
          Back to My Vibes
        </button>
      </div>
    );
  }

  const vibeSongs = vibe.songs || [];

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 pb-32 px-4 lg:px-8 pt-6">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Hero Header Stage */}
        <div className="glass-card rounded-3xl p-6 md:p-10 border border-white/10 relative overflow-hidden shadow-2xl">
          
          {/* Ambient Blurred Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
            <img
              src={vibe.coverUrl}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a0e] via-black/50 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Cover Image */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 flex-shrink-0 group relative">
              <img
                src={vibe.coverUrl}
                alt={vibe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  onClick={() => playVibe(vibe)}
                  className="w-16 h-16 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
              </div>
            </div>

            {/* Vibe Details */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              
              {/* Mood & Location Meta */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm">
                  {vibe.mood}
                </span>
                <span className="flex items-center gap-1 text-neutral-300">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  {vibe.location}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="flex items-center gap-1 text-neutral-300">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {vibe.date}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-extrabold font-serif text-white tracking-tight">
                {vibe.title}
              </h1>

              {/* Memory Story Quote */}
              {vibe.story && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-neutral-200 text-sm md:text-base italic leading-relaxed max-w-2xl">
                  “{vibe.story}”
                </div>
              )}

              {/* RELIVE VIBE Hero Button */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => playVibe(vibe)}
                  className="px-8 py-4 rounded-full font-bold text-base bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-neutral-950 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>▶ RELIVE VIBE</span>
                </button>

                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="px-6 py-4 rounded-full font-semibold text-sm bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Add Songs</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Soundtrack Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-400" />
              <span>YOUR SOUNDTRACK</span>
              <span className="text-xs text-neutral-400 font-sans font-normal ml-2">
                ({vibeSongs.length} Tracks)
              </span>
            </h2>

            <button
              onClick={() => setShowAddSongModal(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Song</span>
            </button>
          </div>

          {vibeSongs.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center border border-white/10">
              <p className="text-neutral-400 text-sm mb-4">No songs in this Vibe soundtrack yet.</p>
              <button
                onClick={() => setShowAddSongModal(true)}
                className="px-4 py-2 rounded-full bg-amber-500 text-black font-bold text-xs"
              >
                Add First Song
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vibeSongs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl glass-card border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'border-white/10 hover:border-amber-500/20'
                    }`}
                  >
                    {/* Track Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono font-bold text-neutral-500 w-6 text-center">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>

                      <div className="relative group flex-shrink-0">
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-12 h-12 rounded-xl object-cover shadow-md"
                        />
                        <button
                          onClick={() => {
                            if (isCurrent) {
                              togglePlay();
                            } else {
                              playSong(song, vibe, vibeSongs);
                            }
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity text-white"
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <h4 className={`font-semibold text-sm truncate ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                          {song.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    {/* Actions & Duration */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-neutral-400">
                        {formatTime(song.durationSec)}
                      </span>

                      <button
                        onClick={() => handleRemoveSongFromVibe(song.id)}
                        className="p-2 text-neutral-500 hover:text-rose-400 transition-colors"
                        title="Remove from Vibe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* Add Songs Modal Drawer */}
      {showAddSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-lg text-white font-serif">Add Songs to "{vibe.title}"</h3>
              <button onClick={() => setShowAddSongModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search song title or artist..."
                value={searchSongQuery}
                onChange={(e) => setSearchSongQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {allSongs
                .filter(
                  (s) =>
                    s.title.toLowerCase().includes(searchSongQuery.toLowerCase()) ||
                    s.artist.toLowerCase().includes(searchSongQuery.toLowerCase())
                )
                .map((song) => {
                  const isAlreadyInVibe = vibeSongs.some((vs) => vs.id === song.id);
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <img src={song.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{song.title}</p>
                          <p className="text-neutral-400 truncate">{song.artist}</p>
                        </div>
                      </div>

                      {isAlreadyInVibe ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddSongToVibe(song.id)}
                          className="px-3 py-1 rounded-full bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
