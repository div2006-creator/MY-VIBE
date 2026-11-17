import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, Play, Pause, Search, ChevronRight, Shuffle, BadgeCheck } from 'lucide-react';
import type { Artist } from '../types';
import { useAudio } from '../context/AudioContext';
import { getArtistAvatar, handleArtistImgError, handleTrackImgError } from '../utils/mediaFallback';

export const ArtistsPage: React.FC = () => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = useAudio();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  useEffect(() => {
    fetch('/api/artists')
      .then((res) => res.json())
      .then((data) => {
        setArtists(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const genres = ['all', 'Haryanvi', 'Drill', 'Punjabi', 'Bollywood', 'Pop', 'Devotional', 'Hip Hop', 'Indie'];

  const filteredArtists = artists.filter((art) => {
    const matchesSearch =
      art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === 'all' ||
      (art.genre && art.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    return matchesSearch && matchesGenre;
  });

  const handlePlayArtist = (artist: Artist, shuffle = false) => {
    const songs = artist.songs || [];
    if (songs.length === 0) return;

    let playlist = [...songs];
    if (shuffle) {
      playlist = playlist.sort(() => Math.random() - 0.5);
    }
    playSong(playlist[0], undefined, playlist);
  };

  const featuredArtist = artists[0];

  return (
    <div className="min-h-full bg-gradient-to-b from-[#1f2937]/40 via-[#121212] to-[#121212] text-white pb-28 lg:pb-12 px-4 lg:px-8 pt-6 select-none">
      <div className="max-w-7xl mx-auto space-y-9">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#1ed760] text-xs uppercase font-bold tracking-widest mb-1">
              <Mic2 className="w-4 h-4" />
              <span>Verified Discographies</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Artists
            </h1>
            <p className="text-[#b3b3b3] text-sm mt-1 max-w-xl">
              Explore full artist catalogs including Atif Aslam, Justin Bieber, Arijit Singh, Masoom Sharma, Dhanda Nyoliwala, Shreya Ghoshal & more.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#242424] border border-white/10 focus:border-white text-sm text-white placeholder:text-[#b3b3b3] outline-none transition-all"
            />
          </div>
        </div>

        {/* Featured Artist Spotlight */}
        {featuredArtist && !searchQuery && selectedGenre === 'all' && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#282828] via-[#181818] to-[#121212] border border-white/10 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <img
                  src={getArtistAvatar(featuredArtist.name, featuredArtist.avatarUrl, featuredArtist.songs?.[0]?.coverUrl)}
                  alt={featuredArtist.name}
                  onError={(e) => handleArtistImgError(e, featuredArtist.songs?.[0]?.coverUrl)}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl bg-[#282828] shrink-0 text-transparent"
                />

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4cb3ff]">
                    <BadgeCheck className="w-4 h-4 fill-[#4cb3ff] text-black" />
                    <span>Featured Artist</span>
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                    {featuredArtist.name}
                  </h2>
                  <p className="text-[#b3b3b3] text-xs md:text-sm max-w-xl leading-relaxed">
                    {featuredArtist.bio}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs font-semibold">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-[#1ed760]">
                      {featuredArtist.songCount} Tracks
                    </span>
                    <span className="text-[#b3b3b3]">{featuredArtist.genre}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handlePlayArtist(featuredArtist)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black font-bold text-sm hover:scale-105 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-black" />
                  <span>Play All ({featuredArtist.songCount})</span>
                </button>

                <button
                  onClick={() => handlePlayArtist(featuredArtist, true)}
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                  title="Shuffle"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {featuredArtist.songs && featuredArtist.songs.length > 0 && (
              <div className="mt-7 pt-5 border-t border-white/10">
                <span className="text-xs uppercase tracking-wider text-[#b3b3b3] font-bold block mb-3">
                  Popular Tracks
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {featuredArtist.songs.slice(0, 6).map((song) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, undefined, featuredArtist.songs)}
                        className="p-2.5 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] cursor-pointer transition-all flex items-center gap-2.5 group"
                      >
                        <img src={song.coverUrl} alt="" onError={handleTrackImgError} className="w-9 h-9 rounded object-cover shrink-0 bg-[#282828]" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                            {song.title}
                          </p>
                          <p className="text-[11px] text-[#b3b3b3] truncate">{song.album}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre === g
                  ? 'bg-white text-black'
                  : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {g === 'all' ? 'All' : g}
            </button>
          ))}
        </div>

        {/* Artists Discography List */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-20 text-[#b3b3b3]">
              <Mic2 className="w-10 h-10 text-[#1ed760] mx-auto mb-2 animate-pulse" />
              <span>Loading artists...</span>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-20 bg-[#181818] rounded-xl text-[#b3b3b3]">
              <p>No artists match "{searchQuery}".</p>
            </div>
          ) : (
            filteredArtists.map((artist) => (
              <section key={artist.id} className="bg-[#181818] rounded-xl p-6 border border-white/5 space-y-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <img
                      src={getArtistAvatar(artist.name, artist.avatarUrl, artist.songs?.[0]?.coverUrl)}
                      alt={artist.name}
                      onError={(e) => handleArtistImgError(e, artist.songs?.[0]?.coverUrl)}
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg cursor-pointer hover:scale-105 transition-transform shrink-0 bg-[#282828] text-transparent"
                    />
                    <div>
                      <h3
                        onClick={() => navigate(`/artist/${artist.id}`)}
                        className="text-2xl font-extrabold text-white hover:underline cursor-pointer"
                      >
                        {artist.name}
                      </h3>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-[#1ed760] font-semibold">
                          {artist.genre || 'Artist'}
                        </span>
                        <span className="text-xs text-[#b3b3b3]">
                          {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handlePlayArtist(artist)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                      <span>Play</span>
                    </button>
                    <button
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {artist.songs && artist.songs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {artist.songs.slice(0, 12).map((song) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => playSong(song, undefined, artist.songs)}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative w-11 h-11 rounded overflow-hidden shrink-0">
                              <img src={song.coverUrl} alt="" onError={handleTrackImgError} className="w-full h-full object-cover bg-[#282828]" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className={`font-semibold text-sm truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                                {song.title}
                              </h4>
                              <p className="text-xs text-[#b3b3b3] truncate">{song.album || 'Single'}</p>
                            </div>
                          </div>

                          <span className="text-xs text-[#b3b3b3] tabular-nums ml-2">
                            {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#b3b3b3]">No songs loaded.</p>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
