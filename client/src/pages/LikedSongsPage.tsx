import React, { useEffect, useState } from 'react';
import { Heart, Play, Pause, Disc, Shuffle, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Song } from '../types';
import { useAudio } from '../context/AudioContext';

export const LikedSongsPage: React.FC = () => {
  const { playSong, currentSong, isPlaying, togglePlay, likedSongIds, toggleLike, isLiked } = useAudio();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedSongs();
  }, [likedSongIds]);

  const fetchLikedSongs = async () => {
    const token = localStorage.getItem('vibe_token');
    try {
      const res = await fetch('/api/songs/liked', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLikedSongs(data);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    try {
      const allRes = await fetch('/api/songs');
      const all: Song[] = await allRes.json();
      if (Array.isArray(all)) {
        const matched = all.filter((s) => likedSongIds.includes(s.id));
        setLikedSongs(matched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#5038a0]/70 via-[#121212] to-[#121212] text-white pb-28 lg:pb-12 select-none">
      {/* Playlist Header */}
      <div className="px-4 md:px-8 pt-6 pb-8 space-y-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 text-xs font-semibold text-[#b3b3b3] hover:text-white transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="w-36 h-36 md:w-52 md:h-52 rounded-lg bg-gradient-to-br from-[#450af5] via-[#6b4df9] to-[#c4efd9] shadow-2xl flex items-center justify-center shrink-0">
            <Heart className="w-16 h-16 md:w-24 md:h-24 text-white fill-white" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">
              Playlist
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Liked Songs
            </h1>
            <p className="text-sm text-[#b3b3b3]">
              {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'} in your collection
            </p>
          </div>
        </div>
      </div>

      {/* Action Controls + Table */}
      <div className="bg-black/25 px-4 md:px-8 py-6 space-y-6 min-h-[400px]">
        {likedSongs.length > 0 && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => playSong(likedSongs[0], undefined, likedSongs)}
              className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Play Liked Songs"
            >
              <Play className="w-6 h-6 fill-black ml-0.5" />
            </button>
            <button
              onClick={() => {
                const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
                playSong(shuffled[0], undefined, shuffled);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        )}

        {likedSongs.length === 0 && !loading ? (
          <div className="bg-[#181818] p-12 rounded-xl text-center border border-white/5 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mx-auto text-[#1ed760]">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Songs you like will appear here</h3>
              <p className="text-sm text-[#b3b3b3] max-w-md mx-auto mt-1">
                Save songs by tapping the heart icon anywhere in Auralis.
              </p>
            </div>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-transform"
            >
              <Disc className="w-4 h-4" />
              <span>Find songs</span>
            </Link>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 sm:col-span-5">Title</div>
              <div className="hidden sm:block sm:col-span-4">Album</div>
              <div className="col-span-5 sm:col-span-2 flex items-center justify-end pr-3">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-0.5 mt-2">
              {likedSongs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(song, undefined, likedSongs);
                    }}
                    className={`grid grid-cols-12 gap-4 px-3 sm:px-4 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors group items-center ${
                      isCurrent ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="col-span-1 flex items-center justify-center text-sm text-[#b3b3b3] tabular-nums">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 text-[#1ed760] fill-current" />
                      ) : (
                        <>
                          <span className={`group-hover:hidden ${isCurrent ? 'text-[#1ed760] font-bold' : ''}`}>
                            {idx + 1}
                          </span>
                          <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block ml-0.5" />
                        </>
                      )}
                    </div>

                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                      <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                          {song.title}
                        </h4>
                        <p className="text-xs text-[#b3b3b3] truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div className="hidden sm:block sm:col-span-4 min-w-0">
                      <p className="text-xs text-[#b3b3b3] truncate">{song.album || 'Single'}</p>
                    </div>

                    <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3 pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.id);
                        }}
                        className="p-1 text-[#1ed760] hover:scale-110 transition-transform"
                        title={isLiked(song.id) ? 'Remove from Liked Songs' : 'Like Song'}
                      >
                        <Heart className={`w-4 h-4 ${isLiked(song.id) ? 'fill-[#1ed760]' : 'text-[#b3b3b3]'}`} />
                      </button>
                      <span className="text-xs text-[#b3b3b3] tabular-nums">{formatTime(song.durationSec)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
