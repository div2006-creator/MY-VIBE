import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Disc, Clock, Music, ArrowLeft } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import type { Song } from '../types';

interface AlbumDetailData {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear: number;
  artist: string;
  artistId: string;
  artistAvatar: string;
  songCount: number;
  totalDurationSec: number;
  songs: Song[];
}

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [album, setAlbum] = useState<AlbumDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAlbum();
    fetchLikedSongs();
  }, [id]);

  const fetchAlbum = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAlbum(data);
      }
    } catch (err) {
      console.error('Failed to fetch album:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedSongs = async () => {
    const token = localStorage.getItem('vibe_token');
    if (!token) return;
    try {
      const res = await fetch('/api/songs/liked', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLikedSongIds(new Set(data.map((s: Song) => s.id)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (songId: string) => {
    const token = localStorage.getItem('vibe_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLikedSongIds((prev) => {
          const updated = new Set(prev);
          if (data.liked) updated.add(songId);
          else updated.delete(songId);
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Disc className="w-10 h-10 text-rose-400 animate-spin-slow" />
        <p className="text-sm font-medium text-neutral-400">Loading Album Tracklist...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Album Not Found</h2>
        <p className="text-neutral-400 text-sm mb-6">The album you requested could not be located.</p>
        <Link to="/explore" className="px-6 py-2.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-sm">
          Return to Explore
        </Link>
      </div>
    );
  }

  const isAlbumPlaying = currentSong && album.songs.some((s) => s.id === currentSong.id) && isPlaying;
  const formatTotalTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    return `${mins} min`;
  };

  const handlePlayAlbum = () => {
    if (album.songs.length === 0) return;
    if (isAlbumPlaying) {
      togglePlay();
    } else {
      playSong(album.songs[0], undefined, album.songs);
    }
  };

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">
      
      {/* Back Button */}
      <Link to="/explore" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      {/* Album Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-600/10 shadow-2xl">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover border-2 border-white/20 shadow-2xl flex-shrink-0"
        />

        <div className="flex-1 text-center md:text-left space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Album • {album.releaseYear}
          </span>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{album.title}</h1>

          <div className="flex items-center justify-center md:justify-start gap-2.5 text-sm font-medium text-neutral-300">
            <Link to={`/artist/${album.artistId}`} className="flex items-center gap-2 hover:text-amber-300 transition-colors">
              <img src={album.artistAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-amber-400" />
              <span className="font-bold text-white">{album.artist}</span>
            </Link>
            <span>•</span>
            <span className="text-neutral-400">{album.songCount} Tracks</span>
            <span>•</span>
            <span className="text-neutral-400 font-mono">{formatTotalTime(album.totalDurationSec)}</span>
          </div>

          <div className="pt-3 flex items-center justify-center md:justify-start gap-4">
            <button
              onClick={handlePlayAlbum}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-lg hover:scale-105 transition-all"
            >
              {isAlbumPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Album</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>Play Entire Album</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <section className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Track Title</span>
          </div>
          <div className="flex items-center gap-8">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          {album.songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;
            const isLiked = likedSongIds.has(song.id);

            return (
              <div
                key={song.id}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="w-6 text-center text-xs font-mono font-bold text-neutral-500">
                    {isSongPlaying ? (
                      <Music className="w-4 h-4 text-amber-400 animate-bounce mx-auto" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <button
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(song, undefined, album.songs);
                    }}
                    className="p-2 rounded-full text-neutral-300 hover:text-white bg-white/5 hover:bg-amber-500 hover:text-neutral-950 transition-all"
                  >
                    {isSongPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                      {song.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate">{album.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(song.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <span className="text-xs font-mono text-neutral-400 w-12 text-right">
                    {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
