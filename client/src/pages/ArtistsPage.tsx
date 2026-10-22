import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, Play, Pause, Search, ChevronRight, Shuffle } from 'lucide-react';
import type { Artist } from '../types';
import { useAudio } from '../context/AudioContext';

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

  const genres = ['all', 'Haryanvi', 'Drill', 'Punjabi', 'Bollywood', 'Pop', 'Hip Hop', 'Indie'];

  const filteredArtists = artists.filter((art) => {
    const matchesSearch = art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || 
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

  const featuredArtist = artists[0]; // Top artist by song count (Dhanda Nyoliwala with 66 songs)

  return (
    <div className="min-h-screen bg-[#161311] text-[#e9e1dd] pb-36 px-4 lg:px-8 pt-8 font-editorial select-none">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#554339]/40 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#ecc15a] font-mono-spec text-xs uppercase font-bold tracking-widest mb-1">
              <Mic2 className="w-4 h-4" />
              <span>SINGERS & ARCHIVAL DISCOGRAPHIES</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-[#ffb68c]">
              Titans & Singers
            </h1>
            <p className="font-editorial text-[#dbc1b4] text-sm mt-1 max-w-xl">
              Catalog assembled strictly by master singers. Explore complete discographies of Justin Bieber (151), Arijit Singh (120), Dhanda Nyoliwala (66), Yo Yo Honey Singh, Diljit, and more.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#a38c80] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter by singer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#110e0c] border border-[#554339]/60 focus:border-[#ecc15a]/80 font-editorial text-sm text-[#e9e1dd] placeholder:text-[#a38c80]/60 outline-none transition-all shadow-md"
            />
          </div>
        </div>

        {/* Featured Singer Spotlight */}
        {featuredArtist && !searchQuery && selectedGenre === 'all' && (
          <div className="relative rounded-xl overflow-hidden bg-[#1e1b19] border border-[#554339]/40 p-6 md:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d97736]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative group shrink-0">
                  <img
                    src={featuredArtist.avatarUrl || featuredArtist.songs?.[0]?.coverUrl}
                    alt={featuredArtist.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        featuredArtist.songs?.[0]?.coverUrl ||
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover border-2 border-[#ecc15a]/60 shadow-[0_0_30px_rgba(236,193,90,0.25)] group-hover:scale-105 transition-transform bg-[#110e0c]"
                  />
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-[10px] uppercase font-bold shadow-lg">
                    👑 Top Titan
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-mono-spec text-xs uppercase tracking-widest text-[#ecc15a] font-bold">
                    Featured Titan Collection
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold font-serif text-[#ffb68c]">
                    {featuredArtist.name}
                  </h2>
                  <p className="text-neutral-300 text-xs md:text-sm max-w-xl leading-relaxed">
                    {featuredArtist.bio}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-neutral-300">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/10">
                      {featuredArtist.songCount} Full Songs Assembled
                    </span>
                    <span>•</span>
                    <span className="text-neutral-400">{featuredArtist.genre}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handlePlayArtist(featuredArtist)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-bold text-sm shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play All Songs ({featuredArtist.songCount})</span>
                </button>

                <button
                  onClick={() => handlePlayArtist(featuredArtist, true)}
                  className="p-3.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/15"
                  title="Shuffle Discography"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Song Preview Strip */}
            {featuredArtist.songs && featuredArtist.songs.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block mb-3">
                  Popular Anthems from this Singer:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {featuredArtist.songs.slice(0, 6).map((song) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, undefined, featuredArtist.songs)}
                        className="p-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex items-center gap-2.5 group"
                      >
                        <img src={song.coverUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-amber-400' : 'text-neutral-100 group-hover:text-amber-300'}`}>
                            {song.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">{song.album}</p>
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
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                  : 'glass-pill text-neutral-300 hover:text-white'
              }`}
            >
              {g === 'all' ? 'All Singers' : `${g} Singers`}
            </button>
          ))}
        </div>

        {/* Singers Discography Grid */}
        <div className="space-y-12">
          {loading ? (
            <div className="text-center py-20 text-neutral-400 animate-pulse">
              <Mic2 className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <span>Loading singer discographies...</span>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl text-neutral-400">
              <p>No singers match "{searchQuery}".</p>
            </div>
          ) : (
            filteredArtists.map((artist) => (
              <section key={artist.id} className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
                
                {/* Singer Header Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <img
                      src={artist.avatarUrl || artist.songs?.[0]?.coverUrl}
                      alt={artist.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          artist.songs?.[0]?.coverUrl ||
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                      }}
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-amber-500/40 shadow-lg cursor-pointer hover:scale-105 transition-transform shrink-0 bg-neutral-900"
                    />
                    <div>
                      <h3
                        onClick={() => navigate(`/artist/${artist.id}`)}
                        className="text-2xl md:text-3xl font-extrabold font-serif text-white hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        {artist.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                          {artist.genre || 'Singer'}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">
                          {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'} in library
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this Singer */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handlePlayArtist(artist)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                      <span>Play Discography</span>
                    </button>
                    <button
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="px-4 py-2.5 rounded-full glass-pill text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 transition-all"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Assembled Songs for this Singer */}
                {artist.songs && artist.songs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {artist.songs.map((song) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                              <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => playSong(song, undefined, artist.songs)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                              >
                                {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-amber-400' : 'text-neutral-100'}`}>
                                {song.title}
                              </h4>
                              <p className="text-xs text-neutral-400 truncate">{song.album || 'Single'}</p>
                              <span className="text-[10px] text-neutral-500">
                                {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => playSong(song, undefined, artist.songs)}
                            className="p-2.5 rounded-full bg-white/5 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 transition-colors ml-2 shrink-0"
                            title="Play Track"
                          >
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">No songs loaded for this singer.</p>
                )}
              </section>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
