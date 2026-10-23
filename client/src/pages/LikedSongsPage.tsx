import React, { useEffect, useState } from 'react';
import { Heart, Play, Pause, Disc, Shuffle, ArrowLeft } from 'lucide-react';
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
    } catch (e) {
      // ignore
    }

    // Match likedSongIds against all songs catalog
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
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#161311] text-[#e9e1dd] pb-36 px-4 md:px-8 pt-6 select-none font-editorial">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            to="/home"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1b19] border border-[#554339]/50 text-xs font-mono-spec text-[#a38c80] hover:text-[#ffb68c] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO SANCTUARY</span>
          </Link>
        </div>

        {/* Top Atmospheric Header: Warm Analog Editorial Gatefold */}
        <section className="relative w-full py-8 px-6 sm:px-10 rounded-2xl bg-[#1e1b19] border border-[#554339]/50 overflow-hidden shadow-2xl">
          {/* Radial Groove Background Watermark */}
          <div className="absolute -right-20 -top-20 w-80 h-80 opacity-20 pointer-events-none select-none">
            <svg className="w-full h-full stroke-[#ffb68c]" fill="none" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="70" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" />
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-[#d97736] via-[#ecc15a] to-rose-600 p-0.5 shadow-2xl flex-shrink-0">
                <div className="w-full h-full bg-[#110e0c] rounded-[14px] flex items-center justify-center">
                  <Heart className="w-10 h-10 text-rose-500 fill-current" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono-spec text-[10px] text-[#ecc15a] uppercase tracking-widest font-bold">
                  <span>PERSONAL ARCHIVE</span>
                  <span className="text-[#554339]">•</span>
                  <span>SANCTUARY FREQUENCY</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#ffb68c] tracking-tight">
                  Liked Pressings
                </h1>
                <p className="font-editorial text-xs sm:text-sm text-[#dbc1b4]">
                  {likedSongs.length} timeless cuts saved to your analog memory collection.
                </p>
              </div>
            </div>

            {likedSongs.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => playSong(likedSongs[0], undefined, likedSongs)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d97736] text-[#221f1d] font-mono-spec text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play All Cuts</span>
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
                    playSong(shuffled[0], undefined, shuffled);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#221f1d] border border-[#554339]/60 text-[#dbc1b4] font-mono-spec text-xs font-bold uppercase tracking-wider hover:text-[#ffb68c] hover:border-[#ecc15a]/50 transition-all active:scale-95"
                  title="Shuffle Liked Pressings"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Songs List */}
        {likedSongs.length === 0 && !loading ? (
          <div className="bg-[#1e1b19] p-12 rounded-2xl text-center border border-[#554339]/40 space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#110e0c] border border-[#554339]/60 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <Heart className="w-8 h-8 fill-current opacity-70" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#e9e1dd]">Your Crate is Quiet</h3>
              <p className="font-editorial text-sm text-[#a38c80] max-w-md mx-auto mt-1 leading-relaxed">
                Click the heart icon on any music cut across the sanctuary or in the playback bar to archive it into your personal memory collection.
              </p>
            </div>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d97736] text-[#221f1d] font-mono-spec text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 transition-all"
            >
              <Disc className="w-4 h-4" />
              <span>Explore 386 Studio Cuts</span>
            </Link>
          </div>
        ) : (
          <div className="bg-[#1e1b19] rounded-2xl p-4 sm:p-6 border border-[#554339]/40 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#554339]/40 pb-3 font-mono-spec text-[10px] text-[#a38c80] uppercase tracking-wider">
              <span>TRACK & ARTIST</span>
              <div className="flex items-center gap-8 mr-2">
                <span>DURATION</span>
                <span>STATUS</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {likedSongs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(song, undefined, likedSongs);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-[#282422] border-[#ecc15a]/60 shadow-md'
                        : 'bg-[#221f1d] hover:bg-[#282422] border-[#554339]/30 hover:border-[#ecc15a]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="font-mono-spec text-xs text-[#a38c80] w-6 text-right">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-[#554339]/60 shadow-inner bg-[#110e0c]">
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {isCurrent && isPlaying ? (
                            <Pause className="w-4 h-4 text-[#ffb68c] fill-current" />
                          ) : (
                            <Play className="w-4 h-4 text-[#ffb68c] fill-current ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-sm font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-xs text-[#a38c80] truncate mt-0.5">
                          {song.artist} {song.album ? `• ${song.album}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 ml-4">
                      <span className="font-mono-spec text-xs text-[#a38c80]">
                        {formatTime(song.durationSec)}
                      </span>

                      {/* Heart Like Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.id);
                        }}
                        className="p-2 text-rose-500 hover:text-rose-400 active:scale-90 transition-all rounded-full hover:bg-[#383431]"
                        title={isLiked(song.id) ? "Remove from Liked Songs" : "Like Song"}
                      >
                        <Heart className={`w-4 h-4 transition-all ${isLiked(song.id) ? 'fill-current scale-110' : 'text-[#a38c80]'}`} />
                      </button>
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

