import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Mic2, ChevronRight, Shuffle, Disc, Flame, Heart, Search, Music, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { Artist, Song } from '../types';
import { useAudio } from '../context/AudioContext';

export const HomePage: React.FC = () => {
  const { playSong, currentSong, isPlaying } = useAudio();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedSingerId, setSelectedSingerId] = useState<string>('all');
  const [spotlightArtistId, setSpotlightArtistId] = useState<'bieber' | 'arijit' | 'dhanda' | 'honey'>('bieber');
  const [showAllBieber, setShowAllBieber] = useState<boolean>(false);
  const [showAllArijit, setShowAllArijit] = useState<boolean>(false);
  const [showAllDhanda, setShowAllDhanda] = useState<boolean>(false);
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryFilter, setLibraryFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/artists').then((r) => r.json()),
      fetch('/api/songs').then((r) => r.json()),
    ])
      .then(([artistsData, songsData]) => {
        setArtists(Array.isArray(artistsData) ? artistsData : []);
        setAllSongs(Array.isArray(songsData) ? songsData : []);
      })
      .catch(console.error);
  }, []);

  const handlePlayArtist = (artist: Artist, shuffle = false) => {
    const songs = artist.songs || allSongs.filter((s) => s.artist === artist.name);
    if (songs.length === 0) return;

    let playlist = [...songs];
    if (shuffle) {
      playlist = playlist.sort(() => Math.random() - 0.5);
    }
    playSong(playlist[0], undefined, playlist);
  };

  const handlePlaySongList = (songs: Song[], startIndex = 0, shuffle = false) => {
    if (!songs || songs.length === 0) return;
    let list = [...songs];
    if (shuffle) {
      list = list.sort(() => Math.random() - 0.5);
      playSong(list[0], undefined, list);
    } else {
      playSong(list[startIndex], undefined, list);
    }
  };

  // Major Discography Artists
  const bieberArtist = artists.find((a) => a.name.includes('Bieber'));
  const arijitArtist = artists.find((a) => a.name.includes('Arijit'));
  const dhandaArtist = artists.find((a) => a.name.toLowerCase().includes('dhanda'));
  const honeySingh = artists.find((a) => a.name.includes('Honey Singh'));

  let activeSpotlight: Artist | undefined = bieberArtist || arijitArtist || artists[0];
  if (spotlightArtistId === 'bieber' && bieberArtist) {
    activeSpotlight = bieberArtist;
  } else if (spotlightArtistId === 'dhanda' && dhandaArtist) {
    activeSpotlight = dhandaArtist;
  } else if (spotlightArtistId === 'honey' && honeySingh) {
    activeSpotlight = honeySingh;
  } else if (spotlightArtistId === 'arijit' && arijitArtist) {
    activeSpotlight = arijitArtist;
  }

  const selectedSinger = artists.find((a) => a.id === selectedSingerId);
  const displayedSongs = selectedSingerId === 'all'
    ? allSongs
    : selectedSinger?.songs || allSongs.filter((s) => s.artist === selectedSinger?.name);

  // Filtered Library Songs
  const filteredLibrarySongs = allSongs.filter((s) => {
    const matchesSearch = !librarySearch.trim() ||
      s.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(librarySearch.toLowerCase()) ||
      (s.album && s.album.toLowerCase().includes(librarySearch.toLowerCase()));

    let matchesFilter = true;
    if (libraryFilter === 'bieber') {
      matchesFilter = s.artist.includes('Bieber');
    } else if (libraryFilter === 'arijit') {
      matchesFilter = s.artist.includes('Arijit');
    } else if (libraryFilter === 'dhanda') {
      matchesFilter = s.artist.includes('Dhanda');
    } else if (libraryFilter === 'honey') {
      matchesFilter = s.artist.includes('Honey Singh');
    } else if (libraryFilter === 'punjabi') {
      matchesFilter = (s.genre?.includes('Punjabi') ?? false) && !s.artist.includes('Honey Singh');
    } else if (libraryFilter === 'bollywood') {
      matchesFilter = (s.genre?.includes('Bollywood') ?? false) || (s.genre?.includes('Romantic') ?? false) || (s.genre?.includes('Acoustic') ?? false);
    } else if (libraryFilter === 'pop') {
      matchesFilter = s.artist.includes('Bieber') || s.artist.includes('Weeknd') || s.artist.includes('Taylor') || s.artist.includes('Sheeran') || s.artist.includes('Coldplay');
    }

    return matchesSearch && matchesFilter;
  });

  const bieberSongs = allSongs.filter((s) => s.artist.includes('Bieber'));
  const bieberDisplayList = showAllBieber ? bieberSongs : bieberSongs.slice(0, 12);

  const arijitSongs = allSongs.filter((s) => s.artist.includes('Arijit'));
  const arijitDisplayList = showAllArijit ? arijitSongs : arijitSongs.slice(0, 12);

  const dhandaSongs = allSongs.filter((s) => s.artist.includes('Dhanda') || s.genre?.includes('Haryanvi'));
  const dhandaDisplayList = showAllDhanda ? dhandaSongs : dhandaSongs.slice(0, 12);

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-[#e7e0ec] pb-36 px-4 md:px-8 pt-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Ambient Glows */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-80 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        </div>

        {/* HERO SECTION: TITAN ARTIST SPOTLIGHT (JUSTIN BIEBER, ARIJIT SINGH, DHANDA NYOLIWALA, HONEY SINGH) */}
        {activeSpotlight && (
          <section className="relative rounded-3xl overflow-hidden glass-card border border-rose-500/30 p-6 md:p-10 bg-gradient-to-r from-red-950/40 via-purple-950/30 to-black shadow-2xl">
            {/* Spotlight Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs uppercase tracking-widest font-bold text-neutral-400 mr-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Featured Titans:
              </span>
              {bieberArtist && (
                <button
                  onClick={() => setSpotlightArtistId('bieber')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    spotlightArtistId === 'bieber'
                      ? 'bg-emerald-500 text-neutral-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  <span>🌎 Justin Bieber</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-emerald-200">
                    {bieberArtist.songCount || bieberSongs.length} Tracks
                  </span>
                </button>
              )}
              {arijitArtist && (
                <button
                  onClick={() => setSpotlightArtistId('arijit')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    spotlightArtistId === 'arijit'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  <span>❤️ Arijit Singh</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-rose-200">
                    {arijitArtist.songCount || arijitSongs.length} Tracks
                  </span>
                </button>
              )}
              {dhandaArtist && (
                <button
                  onClick={() => setSpotlightArtistId('dhanda')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    spotlightArtistId === 'dhanda'
                      ? 'bg-amber-500 text-neutral-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  <span>🔥 Dhanda Nyoliwala</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                    {dhandaArtist.songCount || dhandaSongs.length} Tracks
                  </span>
                </button>
              )}
              {honeySingh && (
                <button
                  onClick={() => setSpotlightArtistId('honey')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    spotlightArtistId === 'honey'
                      ? 'bg-amber-500 text-neutral-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  <span>👑 Yo Yo Honey Singh</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                    {honeySingh.songCount} Tracks
                  </span>
                </button>
              )}
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative group shrink-0">
                  <img
                    src={activeSpotlight.avatarUrl || activeSpotlight.songs?.[0]?.coverUrl}
                    alt={activeSpotlight.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        activeSpotlight.songs?.[0]?.coverUrl ||
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.45)] group-hover:scale-105 transition-transform bg-neutral-900"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg whitespace-nowrap">
                    {activeSpotlight.name.includes('Bieber') ? '🌎 Global Pop Icon' : activeSpotlight.name.includes('Arijit') ? '❤️ King of Soul' : activeSpotlight.name.includes('Dhanda') ? '🔥 Drill Sensation' : '👑 King of Hits'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-bold border border-white/10">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>COMPLETE DISCOGRAPHY SPOTLIGHT</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
                    {activeSpotlight.name}
                  </h1>

                  <p className="text-neutral-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                    {activeSpotlight.bio || (activeSpotlight.name.includes('Bieber')
                      ? 'Grammy-winning global pop superstar with over 150 million records sold. Stream all 151 monumental anthems across Baby, Sorry, Love Yourself, Peaches, STAY, Ghost, Intentions, Beauty And A Beat, and more.'
                      : activeSpotlight.name.includes('Arijit')
                      ? 'The undisputed voice of Indian romance. Stream 120 heartfelt anthems including Tum Hi Ho, Channa Mereya, Kesariya, Agar Tum Saath Ho, Apna Bana Le, Gerua, and Kalank.'
                      : activeSpotlight.name.includes('Dhanda')
                      ? 'The powerhouse behind Desi Drill & Haryanvi Hip Hop. Stream all 66 anthems including Russian Bandana, Up To U, Boom Shaka, Not Guilty, and Maruti.'
                      : 'Explore blockbuster hits assembled from International Villager, Desi Kalakaar, and GLORY.')}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-neutral-300">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      {activeSpotlight.songCount || (activeSpotlight.name.includes('Bieber') ? bieberSongs.length : activeSpotlight.name.includes('Arijit') ? arijitSongs.length : activeSpotlight.songs?.length)} Full Songs
                    </span>
                    <span>•</span>
                    <span className="text-neutral-400">{activeSpotlight.genre}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handlePlayArtist(activeSpotlight)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-neutral-950 font-bold text-sm shadow-[0_0_24px_rgba(244,63,94,0.4)] hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Discography ({activeSpotlight.songCount || activeSpotlight.songs?.length})</span>
                </button>

                <button
                  onClick={() => handlePlayArtist(activeSpotlight, true)}
                  className="p-3.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/15"
                  title="Shuffle Discography"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Spotlight Top Hits Strip */}
            {activeSpotlight.songs && activeSpotlight.songs.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                    {activeSpotlight.name} Blockbusters:
                  </span>
                  <Link to={`/artist/${activeSpotlight.id}`} className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
                    <span>View All {activeSpotlight.songCount || activeSpotlight.songs.length} Songs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {activeSpotlight.songs.slice(0, 6).map((song) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, undefined, activeSpotlight.songs)}
                        className="p-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-rose-500/40 cursor-pointer transition-all flex items-center gap-2.5 group"
                      >
                        <img src={song.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-rose-400' : 'text-neutral-100 group-hover:text-rose-300'}`}>
                            {song.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">{song.album || 'Single'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* SINGERS HORIZONTAL SELECTION CAROUSEL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Mic2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold font-serif">Select Singer Discography</h2>
            </div>
            <Link to="/artists" className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>View All Singers</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none">
            {/* "All Singers" button */}
            <button
              onClick={() => setSelectedSingerId('all')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedSingerId === 'all'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'glass-pill text-neutral-300 hover:text-white'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span>All Singers ({allSongs.length} Songs)</span>
            </button>

            {/* Individual Singer Buttons with Avatars */}
            {artists.map((artist) => {
              const isSelected = selectedSingerId === artist.id;
              return (
                <button
                  key={artist.id}
                  onClick={() => setSelectedSingerId(artist.id)}
                  className={`flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-md'
                      : 'glass-pill text-neutral-300 hover:text-white border-white/10 hover:border-amber-500/30'
                  }`}
                >
                  <img
                    src={artist.avatarUrl || artist.songs?.[0]?.coverUrl}
                    alt={artist.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        artist.songs?.[0]?.coverUrl ||
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-7 h-7 rounded-full object-cover border border-white/20 bg-neutral-900"
                  />
                  <span>{artist.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-neutral-900/30 text-neutral-950' : 'bg-white/10 text-neutral-400'}`}>
                    {artist.songCount}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* IF INDIVIDUAL SINGER FILTER IS SELECTED: DISPLAY SINGER'S SONGS */}
        {selectedSingerId !== 'all' && selectedSinger && (
          <section className="glass-card rounded-3xl p-6 md:p-8 border border-amber-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedSinger.avatarUrl || selectedSinger.songs?.[0]?.coverUrl}
                  alt={selectedSinger.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      selectedSinger.songs?.[0]?.coverUrl ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-lg bg-neutral-900"
                />
                <div>
                  <h3 className="text-2xl font-bold font-serif text-white">{selectedSinger.name}</h3>
                  <p className="text-xs text-neutral-400">{selectedSinger.genre} • {displayedSongs.length} Songs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayArtist(selectedSinger)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs shadow-md hover:bg-amber-400"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play All ({displayedSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlayArtist(selectedSinger, true)}
                  className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/15"
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedSongs.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => playSong(song, undefined, displayedSongs)}
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
                      onClick={() => playSong(song, undefined, displayedSongs)}
                      className="p-2 rounded-full bg-white/5 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 transition-colors ml-2 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 1: 🌎 JUSTIN BIEBER COMPLETE GLOBAL DISCOGRAPHY (151 TRACKS) */}
        {selectedSingerId === 'all' && bieberSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Disc className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
                    <span>Justin Bieber — Global Pop Sensation & Complete Discography</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {bieberSongs.length} Tracks
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Baby, Sorry, Love Yourself, Peaches, STAY, Ghost, Intentions, Beauty And A Beat, What Do You Mean? & 140+ More
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySongList(bieberSongs, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 font-bold text-xs hover:scale-105 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({bieberSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(bieberSongs, 0, true)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
                  title="Shuffle Bieber Tracks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllBieber(!showAllBieber)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
                >
                  <span>{showAllBieber ? 'Show Less' : `View All ${bieberSongs.length}`}</span>
                  {showAllBieber ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bieberDisplayList.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => playSong(song, undefined, bieberSongs)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        >
                          {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-emerald-400' : 'text-neutral-100 group-hover:text-emerald-300'}`}>
                          {song.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">{song.album || 'Single'}</p>
                        <span className="text-[10px] text-neutral-500">
                          {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => playSong(song, undefined, bieberSongs)}
                      className="p-2 rounded-full bg-white/5 hover:bg-emerald-500 text-neutral-300 hover:text-neutral-950 transition-colors ml-2 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {!showAllBieber && bieberSongs.length > 12 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllBieber(true)}
                  className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>Show All {bieberSongs.length} Songs by Justin Bieber</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: ❤️ ARIJIT SINGH COMPLETE ROMANCE & SOUL DISCOGRAPHY (120 TRACKS) */}
        {selectedSingerId === 'all' && arijitSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
                    <span>Arijit Singh — King of Romance & Soulful Melodies</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {arijitSongs.length} Tracks
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Tum Hi Ho, Channa Mereya, Kesariya, Apna Bana Le, Agar Tum Saath Ho, Gerua, Shayad, Satranga & More
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySongList(arijitSongs, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-neutral-950 font-bold text-xs hover:scale-105 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({arijitSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(arijitSongs, 0, true)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
                  title="Shuffle Arijit Tracks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllArijit(!showAllArijit)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
                >
                  <span>{showAllArijit ? 'Show Less' : `View All ${arijitSongs.length}`}</span>
                  {showAllArijit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {arijitDisplayList.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => playSong(song, undefined, arijitSongs)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        >
                          {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-rose-400' : 'text-neutral-100 group-hover:text-rose-300'}`}>
                          {song.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">{song.album || 'Single'}</p>
                        <span className="text-[10px] text-neutral-500">
                          {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => playSong(song, undefined, arijitSongs)}
                      className="p-2 rounded-full bg-white/5 hover:bg-rose-500 text-neutral-300 hover:text-white transition-colors ml-2 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {!showAllArijit && arijitSongs.length > 12 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllArijit(true)}
                  className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>Show All {arijitSongs.length} Songs by Arijit Singh</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: 🔥 DHANDA NYOLIWALA COMPLETE DISCOGRAPHY (66 TRACKS) */}
        {selectedSingerId === 'all' && dhandaSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Zap className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
                    <span>Dhanda Nyoliwala — Desi Drill & Haryanvi Hip Hop</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dhandaSongs.length} Tracks
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Russian Bandana, Up To U, Boom Shaka, Not Guilty, Maruti, Death Row, Vaaroon & More
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySongList(dhandaSongs, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-bold text-xs hover:scale-105 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({dhandaSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(dhandaSongs, 0, true)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
                  title="Shuffle Dhanda Tracks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllDhanda(!showAllDhanda)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
                >
                  <span>{showAllDhanda ? 'Show Less' : `View All ${dhandaSongs.length}`}</span>
                  {showAllDhanda ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dhandaDisplayList.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => playSong(song, undefined, dhandaSongs)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        >
                          {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-amber-400' : 'text-neutral-100 group-hover:text-amber-300'}`}>
                          {song.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">{song.album || 'Single'}</p>
                        <span className="text-[10px] text-neutral-500">
                          {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => playSong(song, undefined, dhandaSongs)}
                      className="p-2 rounded-full bg-white/5 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 transition-colors ml-2 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {!showAllDhanda && dhandaSongs.length > 12 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllDhanda(true)}
                  className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>Show All {dhandaSongs.length} Songs by Dhanda Nyoliwala</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: 👑 YO YO HONEY SINGH COMPLETE HITS */}
        {selectedSingerId === 'all' && honeySingh && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
                  Yo Yo Honey Singh Hits ({honeySingh.songCount} Songs)
                </h3>
              </div>
              <button
                onClick={() => handlePlayArtist(honeySingh)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-neutral-950 text-xs font-bold transition-all border border-amber-500/30"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Discography</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(honeySingh.songs || []).map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                        <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => playSong(song, undefined, honeySingh.songs)}
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
                      onClick={() => playSong(song, undefined, honeySingh.songs)}
                      className="p-2 rounded-full bg-white/5 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 transition-colors ml-2 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 4: 🌾 PUNJABI LEGENDS (SIDHU, DILJIT, AUJLA, AP DHILLON, SHUBH) */}
        {selectedSingerId === 'all' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-rose-400" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
                  Punjabi Kings (Sidhu Moose Wala, Diljit, Aujla, AP Dhillon, Shubh)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allSongs
                .filter((s) => s.genre?.includes('Punjabi') && !s.artist.includes('Honey Singh'))
                .map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 hover:border-rose-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                          <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => playSong(song, undefined, allSongs)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                          >
                            {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-amber-400' : 'text-neutral-100'}`}>
                            {song.title}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                          <span className="text-[10px] text-neutral-500">
                            {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => playSong(song, undefined, allSongs)}
                        className="p-2 rounded-full bg-white/5 hover:bg-rose-500 text-neutral-300 hover:text-neutral-950 transition-colors ml-2 shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* SECTION 5: 🎬 BOLLYWOOD & SUFI MELODIES */}
        {selectedSingerId === 'all' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
                  Bollywood Soul & Melodies (Atif Aslam, KK, Anuv Jain, Pritam)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allSongs
                .filter((s) => !s.artist.includes('Arijit') && ((s.genre?.includes('Bollywood') ?? false) || (s.genre?.includes('Romantic') ?? false) || (s.genre?.includes('Acoustic') ?? false)))
                .map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                          <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => playSong(song, undefined, allSongs)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                          >
                            {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-amber-400' : 'text-neutral-100'}`}>
                            {song.title}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                          <span className="text-[10px] text-neutral-500">
                            {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => playSong(song, undefined, allSongs)}
                        className="p-2 rounded-full bg-white/5 hover:bg-indigo-500 text-neutral-300 hover:text-white transition-colors ml-2 shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* SECTION 6: ⚡ GLOBAL POP ICONS */}
        {selectedSingerId === 'all' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Disc className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
                  Global Pop Icons (The Weeknd, Taylor Swift, Ed Sheeran, Coldplay)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allSongs
                .filter(
                  (s) =>
                    !s.artist.includes('Bieber') &&
                    (s.artist.includes('Weeknd') ||
                      s.artist.includes('Taylor') ||
                      s.artist.includes('Sheeran') ||
                      s.artist.includes('Dua') ||
                      s.artist.includes('Malone') ||
                      s.artist.includes('Coldplay'))
                )
                .map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                          <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => playSong(song, undefined, allSongs)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                          >
                            {isCurrent && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-amber-400' : 'text-neutral-100'}`}>
                            {song.title}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                          <span className="text-[10px] text-neutral-500">
                            {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => playSong(song, undefined, allSongs)}
                        className="p-2 rounded-full bg-white/5 hover:bg-emerald-500 text-neutral-300 hover:text-neutral-950 transition-colors ml-2 shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* SECTION 7: 🎵 COMPLETE SONGS LIBRARY (ALL 386 SONGS WITH LIVE FILTER & INSTANT SEARCH) */}
        {selectedSingerId === 'all' && (
          <section className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2 text-rose-400 text-xs uppercase font-bold tracking-widest mb-1">
                  <Music className="w-4 h-4" />
                  <span>Master Track Database</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold font-serif text-white flex items-center gap-2">
                  <span>Complete Songs Library</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-sans font-bold">
                    {filteredLibrarySongs.length} of {allSongs.length} Tracks
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Instant search and filter across all {allSongs.length} high-fidelity studio songs.
                </p>
              </div>

              {/* Instant Filter & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 text-rose-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder={`Search all ${allSongs.length} songs...`}
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/15 focus:border-rose-400 text-xs text-white placeholder-neutral-500 outline-none transition-all"
                  />
                  {librarySearch && (
                    <button
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handlePlaySongList(filteredLibrarySongs, 0, false)}
                  disabled={filteredLibrarySongs.length === 0}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md hover:bg-rose-400 transition-all disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Filtered</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: `All Tracks (${allSongs.length})` },
                { id: 'bieber', label: `🌎 Justin Bieber (${bieberSongs.length})` },
                { id: 'arijit', label: `❤️ Arijit Singh (${arijitSongs.length})` },
                { id: 'dhanda', label: `🔥 Dhanda Nyoliwala (${dhandaSongs.length})` },
                { id: 'honey', label: `👑 Honey Singh (${honeySingh?.songCount || 16})` },
                { id: 'punjabi', label: '🌾 Punjabi Kings' },
                { id: 'bollywood', label: '🎬 Bollywood & Sufi' },
                { id: 'pop', label: '⚡ Other Global Pop' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setLibraryFilter(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    libraryFilter === pill.id
                      ? 'bg-rose-500 text-white font-bold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Grid of Songs */}
            {filteredLibrarySongs.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Music className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-neutral-400 text-sm">No songs found matching "{librarySearch}"</p>
                <button
                  onClick={() => { setLibrarySearch(''); setLibraryFilter('all'); }}
                  className="text-xs text-rose-400 hover:underline font-bold"
                >
                  Reset search & filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin">
                {filteredLibrarySongs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-rose-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md">
                          <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => playSong(song, undefined, filteredLibrarySongs)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                          >
                            {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`font-bold text-xs truncate ${isCurrent ? 'text-rose-400' : 'text-neutral-100 group-hover:text-rose-300'}`}>
                            {song.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 truncate">{song.artist}</p>
                          <span className="text-[10px] text-neutral-500">
                            {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => playSong(song, undefined, filteredLibrarySongs)}
                        className="p-1.5 rounded-full bg-white/5 hover:bg-rose-500 text-neutral-300 hover:text-white transition-colors ml-2 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
