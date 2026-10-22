import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Music, Sparkles, User, MapPin, Globe, Plus, Check, Play, Pause } from 'lucide-react';
import type { Song, Vibe, Artist } from '../types';
import { useAudio } from '../context/AudioContext';

interface ExternalTrack {
  id: string;
  externalId: number;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  releaseYear: number;
  isImported?: boolean;
  source: string;
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = useAudio();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'extractor' | 'songs' | 'artists' | 'vibes'>('all');
  
  // Local DB Search results
  const [results, setResults] = useState<{
    songs: Song[];
    vibes: Vibe[];
    artists: Artist[];
    albums: any[];
  }>({ songs: [], vibes: [], artists: [], albums: [] });

  // 3rd Party Extracted Results
  const [extractedTracks, setExtractedTracks] = useState<ExternalTrack[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedSet, setImportedSet] = useState<Set<string>>(new Set());

  // Quick preset pills
  const presets = [
    { label: '🔥 Dhanda Nyoliwala', q: 'Dhanda Nyoliwala' },
    { label: '🌾 Sidhu Moose Wala', q: 'Sidhu Moose Wala' },
    { label: '✨ Diljit Dosanjh', q: 'Diljit Dosanjh' },
    { label: '🔥 Karan Aujla', q: 'Karan Aujla' },
    { label: '❤️ Arijit Singh', q: 'Arijit Singh' },
    { label: '🌧️ Anuv Jain', q: 'Anuv Jain' },
    { label: '⚡ The Weeknd', q: 'The Weeknd' },
    { label: '🎀 Taylor Swift', q: 'Taylor Swift' },
    { label: '🎸 AP Dhillon', q: 'AP Dhillon' },
  ];

  // Local Search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], vibes: [], artists: [], albums: [] });
      setExtractedTracks([]);
      return;
    }

    const timer = setTimeout(() => {
      // 1. Fetch from local DB
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch(console.error);

      // 2. Fetch from 3rd Party Music Extractor (iTunes network)
      setIsExtracting(true);
      fetch(`/api/external/search?q=${encodeURIComponent(query)}&limit=15`)
        .then((res) => res.json())
        .then((data) => {
          setExtractedTracks(data.results || []);
        })
        .catch(console.error)
        .finally(() => setIsExtracting(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle importing extracted track into local SQLite DB
  const handleImportTrack = async (track: ExternalTrack) => {
    setImportingId(track.id);
    try {
      const res = await fetch('/api/external/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          artist: track.artist,
          album: track.album,
          durationSec: track.durationSec,
          coverUrl: track.coverUrl,
          audioUrl: track.audioUrl,
          genre: track.genre,
          releaseYear: track.releaseYear,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setImportedSet((prev) => new Set([...prev, track.id]));
        // Play song immediately
        playSong(data.song);
      }
    } catch (err) {
      console.error('Failed to import track:', err);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 pb-32 px-4 lg:px-8 pt-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Search Header Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold font-serif text-white flex items-center gap-2.5">
                <SearchIcon className="w-7 h-7 text-amber-400" />
                <span>Search & Extract Music</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Explore local library or extract famous Punjabi, Hindi & English tracks live from 3rd-party music networks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>3rd-Party Extractor Active</span>
              </span>
            </div>
          </div>

          <div className="relative">
            <SearchIcon className="w-6 h-6 text-amber-400 absolute left-4 top-4" />
            <input
              type="text"
              autoFocus
              placeholder="Search artists, songs (e.g. Sidhu Moose Wala, Lover, Kesariya, Blinding Lights)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/15 focus:border-amber-400 text-lg text-white placeholder-neutral-500 outline-none shadow-2xl transition-all"
            />
          </div>

          {/* Preset Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setQuery(p.q)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 pt-1 border-b border-white/10 pb-3">
            {[
              { id: 'all', label: 'All Results' },
              { id: 'extractor', label: `🌐 3rd-Party Extractor (${extractedTracks.length})` },
              { id: 'songs', label: `🎵 Local Songs (${results.songs.length})` },
              { id: 'artists', label: `🎤 Artists (${results.artists.length})` },
              { id: 'vibes', label: `✨ Vibes (${results.vibes.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-bold shadow-md'
                    : 'glass-pill text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        {!query.trim() ? (
          <div className="glass-card p-12 rounded-3xl text-center border border-white/10 text-neutral-400 space-y-3">
            <Globe className="w-12 h-12 text-amber-400/60 mx-auto" />
            <p className="text-base text-neutral-200 font-semibold">Search for any song, artist, or memory above.</p>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Our live extractor searches high-fidelity music networks for English, Hindi, and Punjabi hits, allowing you to stream or import tracks directly to your library.
            </p>
          </div>
        ) : (
          <div className="space-y-10">

            {/* SECTION: 3RD PARTY EXTRACTED MUSIC (LIVE EXTRACTION) */}
            {(activeTab === 'all' || activeTab === 'extractor') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span>3rd-Party Music Network Stream ({extractedTracks.length})</span>
                  </h3>
                  {isExtracting && (
                    <span className="text-xs text-amber-400 animate-pulse font-medium">
                      Extracting audio streams...
                    </span>
                  )}
                </div>

                {extractedTracks.length === 0 && !isExtracting ? (
                  <p className="text-xs text-neutral-500">No external tracks found for "{query}".</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {extractedTracks.map((track) => {
                      const isCurrent = currentSong?.audioUrl === track.audioUrl;
                      const isImported = track.isImported || importedSet.has(track.id);

                      return (
                        <div
                          key={track.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-emerald-500/20 bg-neutral-900/60 hover:border-emerald-400/40 transition-all group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                              <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => playSong({
                                  id: track.id,
                                  title: track.title,
                                  artist: track.artist,
                                  album: track.album,
                                  durationSec: track.durationSec,
                                  coverUrl: track.coverUrl,
                                  audioUrl: track.audioUrl,
                                  genre: track.genre,
                                })}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                              >
                                {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-amber-400' : 'text-neutral-100'}`}>
                                {track.title}
                              </h4>
                              <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold truncate">
                                  {track.genre}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                  {track.releaseYear} • High-Res Stream
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <button
                              onClick={() => playSong({
                                id: track.id,
                                title: track.title,
                                artist: track.artist,
                                album: track.album,
                                durationSec: track.durationSec,
                                coverUrl: track.coverUrl,
                                audioUrl: track.audioUrl,
                                genre: track.genre,
                              })}
                              className="p-2 rounded-full bg-white/10 text-neutral-200 hover:bg-white/20 transition-colors"
                              title="Play Track"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>

                            <button
                              disabled={isImported || importingId === track.id}
                              onClick={() => handleImportTrack(track)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                                isImported
                                  ? 'bg-neutral-800 text-neutral-400 cursor-default'
                                  : 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 hover:scale-105 shadow-md'
                              }`}
                              title={isImported ? 'Already in VIBE Library' : 'Import to SQLite Library'}
                            >
                              {isImported ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Saved</span>
                                </>
                              ) : importingId === track.id ? (
                                <span>Saving...</span>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Import</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* SECTION: LOCAL SONGS */}
            {(activeTab === 'all' || activeTab === 'songs') && results.songs.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-amber-400" />
                  <span>VIBE Library Songs ({results.songs.length})</span>
                </h3>
                <div className="space-y-2">
                  {results.songs.map((song) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-3 rounded-2xl glass-card border border-white/10 hover:border-amber-500/20"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={song.coverUrl} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isCurrent ? 'text-amber-400 font-bold' : 'text-white'}`}>
                              {song.title}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => playSong(song, undefined, results.songs)}
                          className="px-4 py-1.5 rounded-full bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 shadow-md flex items-center gap-1 shrink-0 ml-3"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>Play</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION: VIBES */}
            {(activeTab === 'all' || activeTab === 'vibes') && results.vibes.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                  <span>Vibes & Memories ({results.vibes.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {results.vibes.map((vibe) => (
                    <div
                      key={vibe.id}
                      onClick={() => navigate(`/vibe/${vibe.id}`)}
                      className="glass-card p-4 rounded-2xl border border-white/10 group cursor-pointer hover:border-amber-500/30 transition-all"
                    >
                      <div className="h-36 rounded-xl overflow-hidden mb-3 relative">
                        <img src={vibe.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] bg-black/60 text-amber-300 font-bold">
                          {vibe.mood}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-white font-serif group-hover:text-amber-300 truncate">
                        {vibe.title}
                      </h4>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-rose-400" /> {vibe.location} • {vibe.date}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION: ARTISTS */}
            {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <span>Artists ({results.artists.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {results.artists.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => navigate(`/artist/${art.id}`)}
                      className="glass-card p-4 rounded-2xl text-center border border-white/10 hover:border-amber-500/30 cursor-pointer transition-all"
                    >
                      <img
                        src={art.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
                        alt={art.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover mb-2 border border-white/20 shadow-md"
                      />
                      <h4 className="font-bold text-sm text-white truncate">{art.name}</h4>
                      <p className="text-xs text-neutral-400 truncate">{art.genre || 'Popular'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
