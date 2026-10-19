import React, { useEffect, useState } from 'react';
import { Heart, Play, Pause } from 'lucide-react';
import type { Song } from '../types';
import { useAudio } from '../context/AudioContext';

export const LikedSongsPage: React.FC = () => {
  const { playSong, currentSong, isPlaying, togglePlay } = useAudio();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const fetchLikedSongs = () => {
    const token = localStorage.getItem('vibe_token');
    fetch('/api/songs/liked', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((res) => res.json())
      .then((data) => setLikedSongs(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleToggleLike = async (songId: string) => {
    const token = localStorage.getItem('vibe_token');
    try {
      await fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      fetchLikedSongs();
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

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 pb-32 px-4 lg:px-8 pt-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-6 glass-card p-6 md:p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-black">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 p-0.5 shadow-2xl flex-shrink-0">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Heart className="w-10 h-10 text-rose-500 fill-current" />
            </div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold">Personal Library</span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-white mt-1">
              Liked Songs
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              {likedSongs.length} Tracks saved to your memory collection
            </p>
          </div>
        </div>

        {/* List */}
        {likedSongs.length === 0 && !loading ? (
          <div className="glass-card p-12 rounded-3xl text-center border border-white/10">
            <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-serif text-white mb-2">No Liked Songs yet</h3>
            <p className="text-neutral-400 text-sm">
              Click the heart icon on any track to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {likedSongs.map((song, idx) => {
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
                          if (isCurrent) togglePlay();
                          else playSong(song, undefined, likedSongs);
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

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(song.id)}
                      className="p-2 text-rose-500 hover:text-rose-400 transition-colors"
                      title="Remove from Liked Songs"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                    <span className="text-xs font-mono text-neutral-400">
                      {formatTime(song.durationSec)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
