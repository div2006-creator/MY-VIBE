import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon,
  Music,
  Sparkles,
  User,
  MapPin,
  Globe,
  Plus,
  Check,
  Play,
  Pause,
} from 'lucide-react';
import type { Song, Vibe, Artist } from '../types';
import { useAudio } from '../context/AudioContext';
import { handleArtistImgError, handleTrackImgError } from '../utils/mediaFallback';

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
  const [searchParams] = useSearchParams();
  const { playSong, currentSong, isPlaying } = useAudio();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<
    'all' | 'extractor' | 'songs' | 'artists' | 'vibes'
  >('all');

  const [results, setResults] = useState<{
    songs: Song[];
    vibes: Vibe[];
    artists: Artist[];
    albums: any[];
  }>({ songs: [], vibes: [], artists: [], albums: [] });

  const [extractedTracks, setExtractedTracks] = useState<ExternalTrack[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedSet, setImportedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== query) {
      setQuery(qParam);
    }
  }, [searchParams]);

  const presets = [
    { label: 'Atif Aslam', q: 'Atif Aslam', color: 'from-emerald-700 to-emerald-950' },
    { label: 'Arijit Singh', q: 'Arijit Singh', color: 'from-rose-700 to-rose-950' },
    { label: 'Justin Bieber', q: 'Justin Bieber', color: 'from-indigo-600 to-indigo-950' },
    { label: 'Bhajans & Stutis', q: 'Hanuman', color: 'from-amber-700 to-amber-950' },
    { label: 'Shreya Ghoshal', q: 'Shreya Ghoshal', color: 'from-purple-700 to-purple-950' },
    { label: 'Masoom Sharma', q: 'Masoom Sharma', color: 'from-teal-700 to-teal-950' },
    { label: 'Dhanda Nyoliwala', q: 'Dhanda Nyoliwala', color: 'from-orange-700 to-orange-950' },
    { label: 'Sidhu Moose Wala', q: 'Sidhu Moose Wala', color: 'from-zinc-700 to-zinc-900' },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], vibes: [], artists: [], albums: [] });
      setExtractedTracks([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch(console.error);

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
        playSong(data.song);
      }
    } catch (err) {
      console.error('Failed to import track:', err);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="min-h-full bg-[#121212] text-white pb-28 lg:pb-12 px-4 lg:px-8 pt-6 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Search
              </h1>
              <p className="text-xs text-[#b3b3b3] mt-0.5">
                Search local catalog tracks, artists, vibes, or stream live releases.
              </p>
            </div>

            <span className="self-start md:self-auto px-3 py-1 rounded-full bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 text-xs font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Live Search Active</span>
            </span>
          </div>

          <div className="relative">
            <SearchIcon className="w-5 h-5 text-[#b3b3b3] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="What do you want to listen to?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] border border-transparent focus:border-white text-sm text-white placeholder:text-[#b3b3b3] outline-none shadow-lg transition-all"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'songs', label: `Songs (${results.songs.length})` },
              { id: 'artists', label: `Artists (${results.artists.length})` },
              { id: 'extractor', label: `Live Network (${extractedTracks.length})` },
              { id: 'vibes', label: `Vibes (${results.vibes.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {!query.trim() ? (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setQuery(p.q)}
                  className={`h-28 rounded-xl p-4 bg-gradient-to-br ${p.color} text-left flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg cursor-pointer`}
                >
                  <span className="font-extrabold text-base sm:text-lg text-white">
                    {p.label}
                  </span>
                  <span className="text-[11px] text-white/75 font-medium">
                    Tap to search →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {(activeTab === 'all' || activeTab === 'songs') &&
              results.songs.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-[#1ed760]" />
                    <span>Songs ({results.songs.length})</span>
                  </h3>
                  <div className="space-y-1">
                    {results.songs.map((song) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => playSong(song, undefined, results.songs)}
                          className="flex items-center justify-between p-2.5 rounded-md hover:bg-white/10 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={song.coverUrl}
                              alt=""
                              onError={handleTrackImgError}
                              className="w-11 h-11 rounded object-cover shrink-0 bg-[#282828]"
                            />
                            <div className="min-w-0">
                              <p
                                className={`font-semibold text-sm truncate ${
                                  isCurrent ? 'text-[#1ed760]' : 'text-white'
                                }`}
                              >
                                {song.title}
                              </p>
                              <p className="text-xs text-[#b3b3b3] truncate">
                                {song.artist}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playSong(song, undefined, results.songs);
                            }}
                            className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3 cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

            {(activeTab === 'all' || activeTab === 'artists') &&
              results.artists.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-[#1ed760]" />
                    <span>Artists ({results.artists.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {results.artists.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => navigate(`/artist/${art.id}`)}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg text-center cursor-pointer transition-all"
                      >
                        <img
                          src={art.avatarUrl || art.songs?.[0]?.coverUrl}
                          alt={art.name}
                          onError={(e) => handleArtistImgError(e, art.songs?.[0]?.coverUrl)}
                          className="w-24 h-24 rounded-full mx-auto object-cover mb-3 shadow-lg bg-[#282828]"
                        />
                        <h4 className="font-bold text-sm text-white truncate">
                          {art.name}
                        </h4>
                        <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                          Artist
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {(activeTab === 'all' || activeTab === 'extractor') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#1ed760]" />
                    <span>Live Network Releases ({extractedTracks.length})</span>
                  </h3>
                  {isExtracting && (
                    <span className="text-xs text-[#1ed760] animate-pulse font-medium">
                      Searching live catalog...
                    </span>
                  )}
                </div>

                {extractedTracks.length === 0 && !isExtracting ? (
                  <p className="text-xs text-[#b3b3b3]">
                    No external tracks found for "{query}".
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {extractedTracks.map((track) => {
                      const isCurrent = currentSong?.audioUrl === track.audioUrl;
                      const isImported =
                        track.isImported || importedSet.has(track.id);

                      return (
                        <div
                          key={track.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#181818] hover:bg-[#282828] transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                              <img
                                src={track.coverUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() =>
                                  playSong({
                                    id: track.id,
                                    title: track.title,
                                    artist: track.artist,
                                    album: track.album,
                                    durationSec: track.durationSec,
                                    coverUrl: track.coverUrl,
                                    audioUrl: track.audioUrl,
                                    genre: track.genre,
                                  })
                                }
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                              >
                                {isCurrent && isPlaying ? (
                                  <Pause className="w-5 h-5" />
                                ) : (
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                )}
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4
                                className={`font-bold text-sm truncate ${
                                  isCurrent ? 'text-[#1ed760]' : 'text-white'
                                }`}
                              >
                                {track.title}
                              </h4>
                              <p className="text-xs text-[#b3b3b3] truncate">
                                {track.artist}
                              </p>
                              <span className="text-[11px] text-[#727272]">
                                {track.genre} • {track.releaseYear}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <button
                              disabled={isImported || importingId === track.id}
                              onClick={() => handleImportTrack(track)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isImported
                                  ? 'bg-[#282828] text-[#1ed760] cursor-default'
                                  : 'bg-[#1ed760] hover:bg-[#3be477] text-black'
                              }`}
                            >
                              {isImported ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Saved</span>
                                </>
                              ) : importingId === track.id ? (
                                <span>Saving...</span>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Save</span>
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

            {(activeTab === 'all' || activeTab === 'vibes') &&
              results.vibes.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#1ed760]" />
                    <span>Vibes ({results.vibes.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {results.vibes.map((vibe) => (
                      <div
                        key={vibe.id}
                        onClick={() => navigate(`/vibe/${vibe.id}`)}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg group cursor-pointer transition-all"
                      >
                        <div className="h-36 rounded-md overflow-hidden mb-3 relative">
                          <img
                            src={vibe.coverUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] bg-black/70 text-[#1ed760] font-bold">
                            {vibe.mood}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-white truncate">
                          {vibe.title}
                        </h4>
                        <p className="text-xs text-[#b3b3b3] flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#1ed760]" />{' '}
                          {vibe.location} • {vibe.date}
                        </p>
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
