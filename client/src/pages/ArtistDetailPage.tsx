import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, UserPlus, Check, Disc, Music, BadgeCheck, Clock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import type { Song, Album, Artist } from '../types';
import { getArtistAvatar, handleArtistImgError, handleTrackImgError } from '../utils/mediaFallback';

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
  const { currentSong, isPlaying, playSong, togglePlay, isLiked, toggleLike } = useAudio();
  const [artist, setArtist] = useState<ArtistDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchArtist();
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Disc className="w-10 h-10 text-[#1ed760] animate-spin" />
        <p className="text-sm font-medium text-[#b3b3b3]">Loading Artist...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Artist Not Found</h2>
        <p className="text-[#b3b3b3] text-sm mb-6">This artist could not be found.</p>
        <Link to="/artists" className="px-6 py-2.5 rounded-full bg-[#1ed760] text-black font-bold text-sm">
          Browse Artists
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
    <div className="min-h-full bg-[#121212] text-white pb-28 lg:pb-12">
      {/* Hero Banner Header */}
      <div className="relative w-full h-[340px] md:h-[380px] overflow-hidden bg-[#181818]">
        <img
          src={getArtistAvatar(artist.name, artist.avatarUrl, artist.songs[0]?.coverUrl)}
          alt={artist.name}
          onError={(e) => handleArtistImgError(e, artist.songs[0]?.coverUrl)}
          className="w-full h-full object-cover filter brightness-[0.42] scale-105 text-transparent"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/45 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={getArtistAvatar(artist.name, artist.avatarUrl, artist.songs[0]?.coverUrl)}
              alt={artist.name}
              onError={(e) => handleArtistImgError(e, artist.songs[0]?.coverUrl)}
              className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover shadow-2xl bg-[#282828] text-transparent"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-xs font-bold text-[#4cb3ff]">
                  <BadgeCheck className="w-4 h-4 fill-[#4cb3ff] text-black" /> Verified Artist
                </span>
                <span className="text-xs text-[#b3b3b3]">• {artist.genre}</span>
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight">
                {artist.name}
              </h1>
              <p className="text-xs md:text-sm text-[#b3b3b3] font-medium mt-1.5">
                {artist.monthlyListeners.toLocaleString()} monthly listeners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayArtist}
              className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all cursor-pointer"
              title={isArtistPlaying ? 'Pause' : 'Play'}
            >
              {isArtistPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isFollowing
                  ? 'border-[#1ed760] text-[#1ed760]'
                  : 'border-white/30 hover:border-white text-white'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-white">Popular</h2>
            <span className="text-xs text-[#b3b3b3]">{artist.songs.length} tracks</span>
          </div>

          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-8 sm:col-span-6">Title</div>
            <div className="hidden sm:block sm:col-span-3">Album</div>
            <div className="col-span-3 sm:col-span-2 flex items-center justify-end pr-3">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-0.5 mt-2">
            {artist.songs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;
              const liked = isLiked(song.id);

              return (
                <div
                  key={song.id}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, undefined, artist.songs);
                  }}
                  className={`group grid grid-cols-12 gap-4 items-center px-3 sm:px-4 py-2 rounded-md cursor-pointer transition-colors ${
                    isCurrent ? 'bg-white/10' : 'hover:bg-white/10'
                  }`}
                >
                  <div className="col-span-1 flex items-center justify-center text-sm text-[#b3b3b3] tabular-nums">
                    {isSongPlaying ? (
                      <Music className="w-4 h-4 text-[#1ed760] animate-bounce" />
                    ) : (
                      <>
                        <span className={`group-hover:hidden ${isCurrent ? 'text-[#1ed760] font-bold' : ''}`}>
                          {index + 1}
                        </span>
                        <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block ml-0.5" />
                      </>
                    )}
                  </div>

                  <div className="col-span-8 sm:col-span-6 flex items-center gap-3 min-w-0">
                    <img src={song.coverUrl} alt={song.title} onError={handleTrackImgError} className="w-10 h-10 rounded object-cover shrink-0 bg-[#282828]" />
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-xs text-[#b3b3b3] truncate">{artist.name}</p>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-3 min-w-0">
                    <p className="text-xs text-[#b3b3b3] truncate">{song.album || 'Single'}</p>
                  </div>

                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-3 pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song.id);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        liked ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-[#1ed760]' : ''}`} />
                    </button>

                    <span className="text-xs text-[#b3b3b3] tabular-nums">
                      {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {artist.albums.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-white mb-4">Discography</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {artist.albums.map((album) => (
                <Link
                  key={album.id}
                  to={`/album/${album.id}`}
                  className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg transition-all flex flex-col"
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-3">
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-white truncate">{album.title}</h3>
                  <p className="text-xs text-[#b3b3b3] mt-0.5">
                    {album.releaseYear} • {album.songCount || 0} tracks
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-[#181818] p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-extrabold text-white mb-2">About</h3>
          <p className="text-sm text-[#b3b3b3] leading-relaxed">{artist.bio}</p>
        </section>
      </div>
    </div>
  );
};
