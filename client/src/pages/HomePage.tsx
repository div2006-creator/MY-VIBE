import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Mic2, ChevronRight, Shuffle, Disc, Flame, Heart } from 'lucide-react';
import type { Artist, Song } from '../types';
import { useAudio } from '../context/AudioContext';

export const HomePage: React.FC = () => {
  const { playSong, currentSong, isPlaying } = useAudio();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedSingerId, setSelectedSingerId] = useState<string>('all');

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

  // Groupings by Singer / Genre
  const honeySingh = artists.find((a) => a.name.includes('Honey Singh')) || artists[0];

  const selectedSinger = artists.find((a) => a.id === selectedSingerId);
  const displayedSongs = selectedSingerId === 'all'
    ? allSongs
    : selectedSinger?.songs || allSongs.filter((s) => s.artist === selectedSinger?.name);

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-[#e7e0ec] pb-36 px-4 md:px-8 pt-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Ambient Glows */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-80 right-10 w-[450px] h-[450px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
        </div>

        {/* HERO SECTION: ASSEMBLED BY SINGER SPOTLIGHT */}
        {honeySingh && (
          <section className="relative rounded-3xl overflow-hidden glass-card border border-amber-500/30 p-6 md:p-10 bg-gradient-to-r from-amber-950/40 via-red-950/30 to-black shadow-2xl">
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
              
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative group shrink-0">
                  <img
                    src={honeySingh.avatarUrl || honeySingh.songs?.[0]?.coverUrl}
                    alt={honeySingh.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        honeySingh.songs?.[0]?.coverUrl ||
                        'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/af/73/ba/af73bac8-db8b-cd4f-8775-d7c797edd278/8902633349964.jpg/600x600bb.jpg';
                    }}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.45)] group-hover:scale-105 transition-transform bg-neutral-900"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-extrabold uppercase tracking-wider shadow-lg whitespace-nowrap">
                    👑 King of Hits
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/10">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>ARTIST DISCOGRAPHY SPOTLIGHT</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
                    {honeySingh.name}
                  </h1>

                  <p className="text-neutral-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Explore all 16 blockbuster songs assembled from <span className="text-amber-400 font-semibold">International Villager</span>, <span className="text-amber-400 font-semibold">Desi Kalakaar</span>, and <span className="text-amber-400 font-semibold">GLORY</span>.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-neutral-300">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      {honeySingh.songCount} Full Songs
                    </span>
                    <span>•</span>
                    <span className="text-neutral-400">{honeySingh.genre}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handlePlayArtist(honeySingh)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-bold text-sm shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play All Songs ({honeySingh.songCount})</span>
                </button>

                <button
                  onClick={() => handlePlayArtist(honeySingh, true)}
                  className="p-3.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/15"
                  title="Shuffle Discography"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Honey Singh Top Hits Strip */}
            {honeySingh.songs && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                    Honey Singh Chartbusters:
                  </span>
                  <Link to={`/artist/${honeySingh.id}`} className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                    <span>View All {honeySingh.songCount} Songs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {honeySingh.songs.slice(0, 6).map((song) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, undefined, honeySingh.songs)}
                        className="p-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex items-center gap-2.5 group"
                      >
                        <img src={song.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
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
          </section>
        )}

        {/* SINGERS HORIZONTAL SELECTION CAROUSEL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Mic2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold font-serif">Select Singer</h2>
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

        {/* IF SINGER FILTER IS SELECTED: DISPLAY SINGER'S SONGS */}
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

        {/* SECTION 1: 👑 YO YO HONEY SINGH COMPLETE HITS (IF NOT ALREADY FILTERED) */}
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

        {/* SECTION 2: 🌾 PUNJABI LEGENDS (SIDHU, DILJIT, AUJLA, AP DHILLON, SHUBH) */}
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

        {/* SECTION 3: 🎬 BOLLYWOOD & SUFI MELODIES (ARIJIT, ATIF ASLAM, KK, ANUV JAIN) */}
        {selectedSingerId === 'all' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
                  Bollywood Soul & Melodies (Arijit Singh, Atif Aslam, KK, Anuv Jain)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allSongs
                .filter((s) => s.genre?.includes('Bollywood') || s.genre?.includes('Romantic') || s.genre?.includes('Acoustic'))
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

        {/* SECTION 4: 🌎 JUSTIN BIEBER & GLOBAL POP (JUSTIN BIEBER, THE WEEKND, TAYLOR SWIFT, COLDPLAY) */}
        {selectedSingerId === 'all' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Disc className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
                  Justin Bieber & Global Icons (The Weeknd, Taylor Swift, Ed Sheeran, Coldplay)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allSongs
                .filter(
                  (s) =>
                    s.artist.includes('Bieber') ||
                    s.artist.includes('Weeknd') ||
                    s.artist.includes('Taylor') ||
                    s.artist.includes('Sheeran') ||
                    s.artist.includes('Dua') ||
                    s.artist.includes('Malone') ||
                    s.artist.includes('Coldplay')
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

      </div>
    </div>
  );
};
