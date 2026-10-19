import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, UserPlus, Check, Sparkles, Disc, Music, ShieldCheck } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import type { Song, Album, Artist } from '../types';

interface ArtistDetailData {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  genre: string;
  monthlyListeners: number;
  songs: Song[];
  albums: Album[];
  relatedArtists: Artist[];
}

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [artist, setArtist] = useState<ArtistDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchArtist();
    fetchLikedSongs();
  }, [id]);

  const fetchArtist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/artists/${id}`);
      if (res.ok) {
        const data = await res.json();
        setArtist(data);
      }
    } catch (err) {
      console.error('Failed to load artist:', err);
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
        <Disc className="w-10 h-10 text-amber-400 animate-spin-slow" />
        <p className="text-sm font-medium text-neutral-400">Loading Artist Profile...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Artist Not Found</h2>
        <p className="text-neutral-400 text-sm mb-6">The artist you are looking for does not exist or has been removed.</p>
        <Link to="/explore" className="px-6 py-2.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-sm">
          Explore Music
        </Link>
      </div>
    );
  }

  const isArtistPlaying = currentSong && artist.songs.some((s) => s.id === currentSong.id) && isPlaying;

  const handlePlayArtist = () => {
    if (artist.songs.length === 0) return;
    if (isArtistPlaying) {
      togglePlay();
    } else {
      playSong(artist.songs[0], undefined, artist.songs);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      
      {/* Hero Banner Header */}
      <div className="relative w-full h-[400px] overflow-hidden bg-neutral-900">
        <img
          src={artist.avatarUrl || artist.songs[0]?.coverUrl}
          alt={artist.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              artist.songs[0]?.coverUrl ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
          }}
          className="w-full h-full object-cover filter brightness-[0.4] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a0e] via-[#0b0a0e]/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <img
              src={artist.avatarUrl || artist.songs[0]?.coverUrl}
              alt={artist.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  artist.songs[0]?.coverUrl ||
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
              }}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-amber-500/40 shadow-2xl bg-neutral-900"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Verified Artist
                </span>
                <span className="text-xs text-neutral-400">{artist.genre}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {artist.name}
              </h1>
              <p className="text-xs md:text-sm text-neutral-300 font-medium mt-1">
                🎧 {artist.monthlyListeners.toLocaleString()} Monthly Listeners
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayArtist}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-base bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-xl hover:scale-105 transition-all"
            >
              {isArtistPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Tracks</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>Play Top Tracks</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold border transition-all ${
                isFollowing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow Artist</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-12">
        
        {/* Popular Songs Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Popular Tracks</span>
            </h2>
            <span className="text-xs text-neutral-400">{artist.songs.length} Tracks available</span>
          </div>

          <div className="space-y-2.5">
            {artist.songs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;
              const isLiked = likedSongIds.has(song.id);

              return (
                <div
                  key={song.id}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
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

                    <div className="relative group/play flex-shrink-0">
                      <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <button
                        onClick={() => {
                          if (isCurrent) togglePlay();
                          else playSong(song, undefined, artist.songs);
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/play:opacity-100 flex items-center justify-center rounded-xl transition-opacity"
                      >
                        {isSongPlaying ? (
                          <Pause className="w-5 h-5 text-white fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate">
                        {song.album ? `Album: ${song.album}` : artist.name}
                      </p>
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

        {/* Albums & Discography Section */}
        {artist.albums.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Disc className="w-5 h-5 text-rose-400" />
              <span>Albums & Releases</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {artist.albums.map((album) => (
                <Link
                  key={album.id}
                  to={`/album/${album.id}`}
                  className="group glass-panel p-4 rounded-2xl border border-white/10 hover:border-amber-500/40 hover:scale-[1.02] transition-all flex flex-col"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {album.releaseYear} • {album.songCount || 0} Tracks
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Artist Biography & Story */}
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">About {artist.name}</h3>
          <p className="text-sm text-neutral-300 leading-relaxed font-normal">{artist.bio}</p>
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-xs text-amber-300 font-semibold">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Genre: {artist.genre}</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Vibe Rating: ★ 4.9</span>
          </div>
        </section>

      </div>
    </div>
  );
};
