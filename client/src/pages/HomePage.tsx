import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Shuffle, Disc, Flame, Heart, Search, Music, Zap, ChevronDown, ChevronUp, Disc3, Clock } from 'lucide-react';
import type { Artist, Song } from '../types';
import { useAudio } from '../context/AudioContext';

export const HomePage: React.FC = () => {
  const { playSong, currentSong, toggleLike, isLiked, isPlaying } = useAudio();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedSingerId, setSelectedSingerId] = useState<string>('all');
  const [spotlightArtistId, setSpotlightArtistId] = useState<'bieber' | 'arijit' | 'dhanda' | 'honey' | 'masoom'>('bieber');
  const [showAllBieber, setShowAllBieber] = useState<boolean>(false);
  const [showAllArijit, setShowAllArijit] = useState<boolean>(false);
  const [showAllDhanda, setShowAllDhanda] = useState<boolean>(false);
  const [showAllMasoom, setShowAllMasoom] = useState<boolean>(false);
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryFilter, setLibraryFilter] = useState<string>('all');
  const [spotifyFilterPill, setSpotifyFilterPill] = useState<string>('all');
  const [devotionalTab, setDevotionalTab] = useState<'all' | 'krishna' | 'mahadev' | 'hanuman' | 'ram'>('all');
  const [showAllDevotional, setShowAllDevotional] = useState<boolean>(false);

  // Dynamic Spotify-style Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Mobile Wireframe State (Category, Recent Played 4 items, Playlists, Catalog search)
  const [recentPlayed, setRecentPlayed] = useState<Song[]>([]);
  const [mobileCategory, setMobileCategory] = useState<string>('pop');
  const [mobileSearch, setMobileSearch] = useState<string>('');

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
  const masoomArtist = artists.find((a) => a.name.toLowerCase().includes('masoom'));

  let activeSpotlight: Artist | undefined = bieberArtist || arijitArtist || artists[0];
  if (spotlightArtistId === 'bieber' && bieberArtist) {
    activeSpotlight = bieberArtist;
  } else if (spotlightArtistId === 'dhanda' && dhandaArtist) {
    activeSpotlight = dhandaArtist;
  } else if (spotlightArtistId === 'masoom' && masoomArtist) {
    activeSpotlight = masoomArtist;
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
    if (libraryFilter === 'haryanvi') {
      matchesFilter = (s.genre?.includes('Haryanvi') ?? false) ||
        s.artist.toLowerCase().includes('masoom') ||
        s.artist.toLowerCase().includes('dhanda') ||
        s.artist.toLowerCase().includes('renuka') ||
        s.title.toLowerCase().includes('52 gaj');
    } else if (libraryFilter === 'bieber') {
      matchesFilter = s.artist.includes('Bieber');
    } else if (libraryFilter === 'arijit') {
      matchesFilter = s.artist.includes('Arijit');
    } else if (libraryFilter === 'dhanda') {
      matchesFilter = s.artist.includes('Dhanda');
    } else if (libraryFilter === 'masoom') {
      matchesFilter = s.artist.toLowerCase().includes('masoom');
    } else if (libraryFilter === 'honey') {
      matchesFilter = s.artist.includes('Honey Singh');
    } else if (libraryFilter === 'punjabi') {
      matchesFilter = (s.genre?.includes('Punjabi') ?? false) && !s.artist.includes('Honey Singh');
    } else if (libraryFilter === 'bollywood') {
      matchesFilter = (s.genre?.includes('Bollywood') ?? false) || (s.genre?.includes('Romantic') ?? false) || (s.genre?.includes('Acoustic') ?? false);
    } else if (libraryFilter === 'bhajan' || libraryFilter === 'devotional') {
      matchesFilter = (s.genre?.includes('Devotional') ?? false) || (s.genre?.includes('Bhajan') ?? false);
    } else if (libraryFilter === 'pop') {
      matchesFilter = !s.artist.includes('Bieber') && (s.artist.includes('Weeknd') || s.artist.includes('Taylor') || s.artist.includes('Sheeran') || s.artist.includes('Coldplay'));
    }

    return matchesSearch && matchesFilter;
  });

  const bieberSongs = allSongs.filter((s) => s.artist.includes('Bieber'));
  const bieberDisplayList = showAllBieber ? bieberSongs : bieberSongs.slice(0, 12);

  const arijitSongs = allSongs.filter((s) => s.artist.includes('Arijit'));
  const arijitDisplayList = showAllArijit ? arijitSongs : arijitSongs.slice(0, 12);

  const dhandaSongs = allSongs.filter((s) => s.artist.includes('Dhanda') || s.genre?.includes('Haryanvi'));
  const dhandaDisplayList = showAllDhanda ? dhandaSongs : dhandaSongs.slice(0, 12);

  const masoomSongs = allSongs.filter((s) => s.artist.toLowerCase().includes('masoom'));
  const masoomDisplayList = showAllMasoom ? masoomSongs : masoomSongs.slice(0, 12);

  const renukaSong = allSongs.find((s) => s.artist.toLowerCase().includes('renuka') || s.title.toLowerCase().includes('52 gaj'));
  const renukaArtist: Artist | undefined = renukaSong ? {
    id: 'renuka-panwar',
    name: 'Renuka Panwar',
    avatarUrl: renukaSong.coverUrl,
    genre: 'Haryanvi Folk Pop',
    bio: 'The sensational voice behind 52 Gaj Ka Daman',
    songCount: 1,
    songs: [renukaSong]
  } : undefined;

  const haryanviSongs = allSongs.filter((s) =>
    (s.genre?.includes('Haryanvi') ?? false) ||
    s.artist.toLowerCase().includes('masoom') ||
    s.artist.toLowerCase().includes('dhanda') ||
    s.artist.toLowerCase().includes('renuka')
  );

  const devotionalSongs = allSongs.filter(
    (s) => (s.genre?.includes('Devotional') ?? false) || (s.genre?.includes('Bhajan') ?? false)
  );

  const krishnaSongs = devotionalSongs.filter(
    (s) =>
      (s.genre?.includes('Krishna') ?? false) ||
      s.title.toLowerCase().includes('krishna') ||
      s.title.toLowerCase().includes('radhe') ||
      s.title.toLowerCase().includes('achyutam') ||
      s.title.toLowerCase().includes('gopal') ||
      s.title.toLowerCase().includes('kisna') ||
      s.title.toLowerCase().includes('yashomati') ||
      s.title.toLowerCase().includes('govind') ||
      s.title.toLowerCase().includes('kunj bihari')
  );

  const mahadevSongs = devotionalSongs.filter(
    (s) =>
      (s.genre?.includes('Mahadev') ?? false) ||
      s.title.toLowerCase().includes('shiv') ||
      s.title.toLowerCase().includes('shamishan') ||
      s.title.toLowerCase().includes('bhola') ||
      s.title.toLowerCase().includes('shambhu') ||
      s.title.toLowerCase().includes('bhairav') ||
      s.title.toLowerCase().includes('tandav') ||
      s.title.toLowerCase().includes('karpur') ||
      s.title.toLowerCase().includes('mrityunjaya')
  );

  const hanumanSongs = devotionalSongs.filter(
    (s) =>
      (s.genre?.includes('Hanuman') ?? false) ||
      s.title.toLowerCase().includes('hanuman') ||
      s.title.toLowerCase().includes('bajrang') ||
      s.title.toLowerCase().includes('sankatmochan') ||
      s.title.toLowerCase().includes('gusai')
  );

  const ramSongs = devotionalSongs.filter(
    (s) =>
      (s.genre?.includes('Ram') ?? false) ||
      (s.genre?.includes('Vedic') ?? false) ||
      (s.genre?.includes('Ganesh') ?? false) ||
      s.title.toLowerCase().includes('ram') ||
      s.title.toLowerCase().includes('mangal') ||
      s.title.toLowerCase().includes('gayatri') ||
      s.title.toLowerCase().includes('ganesh')
  );

  const activeDevotionalList =
    devotionalTab === 'krishna'
      ? krishnaSongs
      : devotionalTab === 'mahadev'
      ? mahadevSongs
      : devotionalTab === 'hanuman'
      ? hanumanSongs
      : devotionalTab === 'ram'
      ? ramSongs
      : devotionalSongs;

  const devotionalDisplayList = showAllDevotional ? activeDevotionalList : activeDevotionalList.slice(0, 12);

  const hariharanArtist = artists.find((a) => a.name.includes('Hariharan'));
  const hansrajArtist = artists.find((a) => a.name.includes('Hansraj'));
  const agamArtist = artists.find((a) => a.name.includes('Agam'));
  const shankarArtist = artists.find((a) => a.name.includes('Shankar Mahadevan'));

  // Sync Recent Played (4 items matching wireframe layout)
  useEffect(() => {
    if (allSongs.length > 0) {
      try {
        const saved = localStorage.getItem('vibe_recent_played');
        if (saved) {
          const ids: string[] = JSON.parse(saved);
          const found = ids.map((id) => allSongs.find((s) => s.id === id)).filter(Boolean) as Song[];
          if (found.length >= 4) {
            setRecentPlayed(found.slice(0, 4));
            return;
          }
        }
      } catch {
        // ignore
      }

      // Default 4 tracks for initial display (Bieber, Arijit, Dhanda, Honey Singh)
      const bieber = allSongs.find((s) => s.artist.includes('Bieber'));
      const arijit = allSongs.find((s) => s.artist.includes('Arijit'));
      const dhanda = allSongs.find((s) => s.artist.includes('Dhanda'));
      const honey = allSongs.find((s) => s.artist.includes('Honey Singh')) || allSongs[0];

      const defaults = [bieber, arijit, dhanda, honey].filter(Boolean) as Song[];
      setRecentPlayed(defaults.slice(0, 4));
    }
  }, [allSongs]);

  // Keep recentPlayed updated when currentSong changes
  useEffect(() => {
    if (currentSong && allSongs.length > 0) {
      setRecentPlayed((prev) => {
        const filtered = prev.filter((s) => s.id !== currentSong.id);
        const updated = [currentSong, ...filtered].slice(0, 4);
        try {
          localStorage.setItem('vibe_recent_played', JSON.stringify(updated.map((s) => s.id)));
        } catch {
          // ignore
        }
        return updated;
      });
    }
  }, [currentSong, allSongs]);

  // Mobile Wireframe Playlists (Elevated Square Cards with Underneath Depth Shadows)
  const mobilePlaylists = [
    {
      id: 'pl-bhajan',
      title: 'Sacred Bhajans',
      badge: 'DIVINE',
      cover: hanumanSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80',
      songs: devotionalSongs.length > 0 ? devotionalSongs : allSongs.filter((s) => s.genre?.includes('Devotional')),
    },
    {
      id: 'pl-52gaj',
      title: '52 Gaj Ka Daman',
      badge: 'RENUKA',
      cover: renukaSong?.coverUrl || 'https://c.saavncdn.com/407/52-Gaj-Ka-Daman-Haryanvi-2020-20210625170012-500x500.jpg',
      songs: renukaSong ? [renukaSong] : [],
    },
    {
      id: 'pl-masoom',
      title: 'Masoom Sharma Anthems',
      badge: 'MASOOM',
      cover: masoomSongs[0]?.coverUrl || 'https://c.saavncdn.com/978/Bahu-Kale-Ki-Haryanvi-2018-20230206124545-500x500.jpg',
      songs: masoomSongs.length > 0 ? masoomSongs : allSongs.filter((s) => s.artist.toLowerCase().includes('masoom')),
    },
    {
      id: 'pl-romance',
      title: 'Late Night Dusk',
      badge: 'ROMANCE',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
      songs: arijitSongs.length > 0 ? arijitSongs : allSongs.filter((s) => s.genre?.includes('Romance')),
    },
    {
      id: 'pl-pop',
      title: 'Global Pop Fever',
      badge: 'POP-UP',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
      songs: bieberSongs.length > 0 ? bieberSongs : allSongs.filter((s) => s.genre?.includes('Pop')),
    },
    {
      id: 'pl-drill',
      title: 'Desi Drill Heat',
      badge: 'DRILL',
      cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80',
      songs: dhandaSongs.length > 0 ? dhandaSongs : allSongs.filter((s) => s.genre?.includes('Drill')),
    },
    {
      id: 'pl-rock',
      title: 'Heavy Metal & Rock',
      badge: 'ROCK/METAL',
      cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=500&q=80',
      songs: allSongs.filter((s) => (s.genre?.includes('Rock') ?? false) || (s.genre?.includes('Alternative') ?? false) || (s.genre?.includes('Electronic') ?? false) || s.title.toLowerCase().includes('rock')),
    },
  ];

  // Mobile Wireframe Category Cards (Pop-up, Rock, metal, etc. as labeled in notebook sketch)
  const mobileCategories = [
    { id: 'bhajan', label: 'Bhajans', sub: `${devotionalSongs.length} Divine` },
    { id: 'pop', label: 'Pop-up', sub: 'Global Hits' },
    { id: 'masoom', label: 'Masoom', sub: `${masoomSongs.length} Cuts` },
    { id: 'drill', label: 'Desi Drill', sub: 'Dhanda & Bass' },
    { id: 'romance', label: 'Romance', sub: 'Arijit & Soul' },
    { id: 'all', label: 'All Cuts', sub: `${allSongs.length} Tracks` },
  ];

  // Filtered mobile songs based on category and search
  const mobileCategorySongs = allSongs.filter((s) => {
    const matchesSearch = !mobileSearch.trim() ||
      s.title.toLowerCase().includes(mobileSearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(mobileSearch.toLowerCase()) ||
      (s.album && s.album.toLowerCase().includes(mobileSearch.toLowerCase()));

    let matchesCat = true;
    if (mobileCategory === 'bhajan') {
      matchesCat = (s.genre?.includes('Devotional') ?? false) || (s.genre?.includes('Bhajan') ?? false);
    } else if (mobileCategory === 'pop') {
      matchesCat = s.artist.includes('Bieber') || (s.genre?.includes('Pop') ?? false) || s.artist.includes('Weeknd') || s.artist.includes('Taylor');
    } else if (mobileCategory === 'masoom') {
      matchesCat = s.artist.toLowerCase().includes('masoom');
    } else if (mobileCategory === 'rock') {
      matchesCat = (s.genre?.includes('Rock') ?? false) || (s.genre?.includes('Alternative') ?? false) || s.artist.includes('Coldplay');
    } else if (mobileCategory === 'metal') {
      matchesCat = (s.genre?.includes('Metal') ?? false) || (s.genre?.includes('Electronic') ?? false) || (s.genre?.includes('Rock') ?? false) || (s.genre?.includes('Drill') ?? false);
    } else if (mobileCategory === 'romance') {
      matchesCat = s.artist.includes('Arijit') || (s.genre?.includes('Romance') ?? false) || (s.genre?.includes('Romantic') ?? false) || (s.genre?.includes('Acoustic') ?? false);
    } else if (mobileCategory === 'drill') {
      matchesCat = s.artist.includes('Dhanda') || (s.genre?.includes('Drill') ?? false) || (s.genre?.includes('Haryanvi') ?? false) || (s.genre?.includes('Punjabi') ?? false);
    }

    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#161311] text-[#e9e1dd] pb-36 px-4 md:px-8 pt-4 md:pt-6 select-none font-editorial">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* ============================================================== */}
        {/* 📱 MOBILE VIEW: PRECISE WIREFRAME FROM NOTEBOOK SKETCH        */}
        {/* ============================================================== */}
        <div className="block md:hidden space-y-6">

          {/* Spotify Mobile Header: Greeting & Top Filter Pills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-serif text-xl font-bold text-[#e9e1dd]">
                {getGreeting()}
              </h1>
              <span className="font-mono-spec text-[9px] px-2 py-0.5 rounded-full bg-[#1e1b19] border border-[#554339]/40 text-[#ecc15a]">
                {allSongs.length || 617} Archival Cuts
              </span>
            </div>

            {/* Mobile Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono-spec text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'bhajan', label: `🙏 Bhajans (${devotionalSongs.length})` },
                { id: 'pop', label: 'Global Pop' },
                { id: 'masoom', label: 'Masoom Sharma' },
                { id: 'drill', label: 'Desi Drill' },
                { id: 'romance', label: 'Romance' },
                { id: 'rock', label: 'Rock' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setMobileCategory(pill.id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border ${
                    mobileCategory === pill.id
                      ? 'bg-[#d97736] text-[#221f1d] font-bold border-[#ffb68c]'
                      : 'bg-[#1e1b19] text-[#dbc1b4] border-[#554339]/40'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. CATEGORY CARD CONTAINER (Labeled 'category' with rounded cards: Pop-up, Rock, metal, etc.) */}
          <section className="bg-[#1e1b19] rounded-2xl p-4 border border-[#554339]/50 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#554339]/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ecc15a]" />
                <h2 className="font-serif text-sm font-bold tracking-wider text-[#ffb68c] uppercase">
                  category
                </h2>
              </div>
              <span className="font-mono-spec text-[9px] text-[#a38c80] uppercase tracking-widest">
                WARM ANALOG SELECTOR
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {mobileCategories.map((cat) => {
                const isSelected = mobileCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setMobileCategory(cat.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl text-center transition-all border ${
                      isSelected
                        ? 'bg-[#d97736] text-[#221f1d] font-bold border-[#ffb68c] shadow-md scale-[1.02]'
                        : 'bg-[#221f1d] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                    }`}
                  >
                    <span className="font-serif text-xs font-bold leading-tight">
                      {cat.label}
                    </span>
                    <span className={`font-mono-spec text-[8px] mt-0.5 leading-tight ${isSelected ? 'text-[#221f1d]/80' : 'text-[#a38c80]'}`}>
                      {cat.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. RECENT PLAYED (4 items in 2x2 grid: Circle Artwork + Rectangle Pill) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffb68c]" />
                <h2 className="font-serif text-sm font-bold tracking-wider text-[#e9e1dd] uppercase">
                  Recent played
                </h2>
              </div>
              <span className="font-mono-spec text-[9px] text-[#ecc15a] uppercase tracking-wider">
                NEEDLE LOG (4)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {recentPlayed.map((song) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, recentPlayed)}
                    className="flex items-center gap-2 p-1.5 bg-[#1e1b19] hover:bg-[#282422] rounded-full border border-[#554339]/50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer active:scale-95 transition-all group"
                  >
                    {/* Circular Vinyl / Album Cover (Drawn as a circle in sketch) */}
                    <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-[#ecc15a]/50 bg-[#110e0c] shadow-inner">
                      <img
                        src={song.coverUrl}
                        alt=""
                        className={`w-full h-full object-cover ${isCurrent ? 'animate-spin' : ''}`}
                        style={{ animationDuration: '6s' }}
                      />
                      <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#110e0c] border border-[#ecc15a]/40" />
                    </div>

                    {/* Rounded Rectangle Pill for Track Details */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className={`font-serif text-[11px] font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                        {song.title}
                      </h4>
                      <p className="font-editorial text-[9px] text-[#a38c80] truncate">
                        {song.artist}
                      </p>
                    </div>

                    {/* Mini Play / Active Indicator */}
                    <div className="pr-1.5 text-[#ecc15a] flex-shrink-0">
                      {isCurrent ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ffb68c] animate-ping" />
                      ) : (
                        <Play className="w-3 h-3 fill-current opacity-70 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. PLAYLIST (Row of 4 Elevated Square Cards with Underneath Depth Shadows) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#554339]/30 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ecc15a]" />
                <h2 className="font-serif text-sm font-bold tracking-wider text-[#e9e1dd] uppercase">
                  Playlist
                </h2>
              </div>
              <span className="font-mono-spec text-[9px] text-[#a38c80] uppercase tracking-wider">
                ELEVATED REELS (4)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mobilePlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handlePlaySongList(pl.songs, 0, false)}
                  className="group relative flex flex-col cursor-pointer active:scale-95 transition-all"
                >
                  {/* Main Elevated Square Card */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#221f1d] border border-[#554339]/60 shadow-[0_8px_18px_rgba(0,0,0,0.8)]">
                    <img
                      src={pl.cover}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#110e0c] via-transparent to-transparent opacity-90" />
                    
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#110e0c]/85 text-[#ecc15a] font-mono-spec text-[8px] font-bold border border-[#ecc15a]/30">
                      {pl.badge}
                    </span>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-xs font-bold text-[#e9e1dd] truncate group-hover:text-[#ffb68c]">
                          {pl.title}
                        </h4>
                        <p className="font-mono-spec text-[8px] text-[#a38c80] truncate">
                          {pl.songs.length} Tracks
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center shadow-md flex-shrink-0 ml-1">
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* 3D Drop Shadow Base (Exact hatch line styling as in wireframe sketch) */}
                  <div className="h-1.5 mx-2 rounded-b-md bg-[#0a0807] border-x border-b border-[#3a2820]/80 opacity-90 -mt-0.5 shadow-md" />
                </div>
              ))}
            </div>
          </section>

          {/* 4. MASTER CATALOG BROWSE & SEARCH (Mobile Access to All 386 Cuts) */}
          <section className="bg-[#1e1b19] rounded-2xl p-4 border border-[#554339]/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#e9e1dd]">
                  Master Cuts ({mobileCategorySongs.length})
                </h3>
                <p className="font-editorial text-[10px] text-[#a38c80]">
                  {mobileCategory.toUpperCase()} CHANNEL • TAP TO PLAY
                </p>
              </div>
              <button
                onClick={() => handlePlaySongList(mobileCategorySongs, 0, true)}
                className="px-2.5 py-1 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Shuffle</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a38c80]" />
              <input
                type="text"
                placeholder={`Search all ${allSongs.length || '580+'} songs, artists, albums...`}
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                className="w-full bg-[#110e0c] border border-[#554339]/60 rounded-xl pl-9 pr-3 py-2 text-xs text-[#e9e1dd] placeholder-[#a38c80]/70 focus:outline-none focus:border-[#ecc15a]"
              />
            </div>

            {/* Scrollable Song List */}
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5 scrollbar-thin">
              {mobileCategorySongs.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#a38c80]">
                  No cuts found in this channel.
                </div>
              ) : (
                mobileCategorySongs.slice(0, 40).map((song, i) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song, undefined, mobileCategorySongs)}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#221f1d] hover:bg-[#282422] border border-[#554339]/30 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono-spec text-[9px] text-[#a38c80] w-4 text-right">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <img src={song.coverUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h5 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd]'}`}>
                            {song.title}
                          </h5>
                          <p className="font-editorial text-[10px] text-[#a38c80] truncate">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(song.id);
                          }}
                          className="p-1 rounded-full hover:bg-[#383431] active:scale-90 transition-all"
                          title={isLiked(song.id) ? "Remove from Liked" : "Save to Liked"}
                        >
                          <Heart className={`w-3.5 h-3.5 transition-all ${isLiked(song.id) ? 'text-rose-500 fill-rose-500 scale-110' : 'text-[#a38c80] hover:text-rose-400'}`} />
                        </button>
                        <span className="font-mono-spec text-[9px] text-[#a38c80]">
                          {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                        </span>
                        <button className="w-6 h-6 rounded-full bg-[#110e0c] text-[#ffb68c] flex items-center justify-center">
                          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>

        {/* ============================================================== */}
        {/* 💻 DESKTOP & TABLET VIEW: SPOTIFY FORMATTED ARCHITECTURE       */}
        {/* ============================================================== */}
        <div className="hidden md:block space-y-10">

          {/* 1. SPOTIFY TOP OPTION FILTER PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-editorial">
            {[
              { id: 'all', label: 'All' },
              { id: 'bhajan', label: `🙏 Bhajans (${devotionalSongs.length})` },
              { id: 'music', label: 'Music' },
              { id: 'artists', label: 'Popular Artists' },
              { id: '52gaj', label: '👑 52 Gaj Ka Daman' },
              { id: 'masoom', label: `🌾 Masoom Sharma (${masoomSongs.length})` },
              { id: 'bieber', label: `🌎 Justin Bieber (${bieberSongs.length})` },
              { id: 'arijit', label: `❤️ Arijit Singh (${arijitSongs.length})` },
              { id: 'dhanda', label: `🔥 Dhanda Nyoliwala (${dhandaSongs.length})` },
              { id: 'honey', label: `👑 Honey Singh` },
              { id: 'playlists', label: 'Taste Playlists' },
              { id: 'liked', label: '💖 Liked Pressings' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setSpotifyFilterPill(pill.id);
                  if (pill.id === 'bhajan') {
                    setLibraryFilter('bhajan');
                  } else if (pill.id === 'masoom') {
                    setSpotlightArtistId('masoom');
                    setLibraryFilter('masoom');
                  } else if (pill.id === 'bieber') {
                    setSpotlightArtistId('bieber');
                    setLibraryFilter('bieber');
                  } else if (pill.id === 'arijit') {
                    setSpotlightArtistId('arijit');
                    setLibraryFilter('arijit');
                  } else if (pill.id === 'dhanda') {
                    setSpotlightArtistId('dhanda');
                    setLibraryFilter('dhanda');
                  } else if (pill.id === 'honey') {
                    setSpotlightArtistId('honey');
                    setLibraryFilter('honey');
                  } else if (pill.id === '52gaj') {
                    setLibraryFilter('haryanvi');
                  } else if (pill.id === 'all') {
                    setLibraryFilter('all');
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  spotifyFilterPill === pill.id
                    ? 'bg-[#d97736] text-[#221f1d] font-bold border-[#ffb68c] shadow-[0_2px_12px_rgba(217,119,54,0.3)]'
                    : 'bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* 2. SPOTIFY GREETING & SIGNATURE QUICK-ACCESS CARDS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-serif text-3xl font-extrabold text-[#e9e1dd] tracking-tight">
                {getGreeting()}
              </h1>
              <span className="font-mono-spec text-[10px] text-[#ecc15a] uppercase tracking-wider hidden sm:inline-block">
                AUDIO SANCTUM • 33⅓ RPM • {allSongs.length} MASTER CUTS
              </span>
            </div>

            {/* Quick-Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* Quick Card 1: Sacred Bhajans & Stutis */}
              <div
                onClick={() => handlePlaySongList(devotionalSongs, 0, false)}
                className="flex items-center justify-between bg-[#1e1b19] hover:bg-[#282422] rounded-md overflow-hidden transition-all duration-200 group cursor-pointer shadow-md border border-[#ecc15a]/40 hover:border-[#ecc15a]/80"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={hanumanSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80'}
                    alt="Sacred Bhajans"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#ecc15a] group-hover:text-[#ffb68c] transition-colors truncate block">
                      🙏 Sacred Bhajans & Stutis
                    </span>
                    <span className="text-xs text-[#a38c80] truncate block">
                      Krishna, Mahadev, Hanuman Chalisa ({devotionalSongs.length} Cuts)
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlaySongList(devotionalSongs, 0, false); }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                  title="Play Sacred Bhajans"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Quick Card 2: 52 Gaj Ka Daman */}
              {renukaSong && (
                <div
                  onClick={() => playSong(renukaSong)}
                  className="flex items-center justify-between bg-[#1e1b19] hover:bg-[#282422] rounded-md overflow-hidden transition-all duration-200 group cursor-pointer shadow-md border border-[#554339]/30 hover:border-[#ecc15a]/40"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={renukaSong.coverUrl} alt="52 Gaj Ka Daman" className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-serif font-bold text-sm sm:text-base text-[#e9e1dd] group-hover:text-[#ffb68c] transition-colors truncate block">
                        52 Gaj Ka Daman
                      </span>
                      <span className="text-xs text-[#a38c80] truncate block">
                        Renuka Panwar • Historic Anthem
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); playSong(renukaSong); }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                    title="Play 52 Gaj Ka Daman"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                  </button>
                </div>
              )}

              {/* Quick Card 2: Masoom Sharma Anthems */}
              <div
                onClick={() => handlePlaySongList(masoomSongs, 0, false)}
                className="flex items-center justify-between bg-[#1e1b19] hover:bg-[#282422] rounded-md overflow-hidden transition-all duration-200 group cursor-pointer shadow-md border border-[#554339]/30 hover:border-[#ecc15a]/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={masoomSongs[0]?.coverUrl || 'https://c.saavncdn.com/978/Bahu-Kale-Ki-Haryanvi-2018-20230206124545-500x500.jpg'}
                    alt="Masoom Sharma"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#e9e1dd] group-hover:text-[#ffb68c] transition-colors truncate block">
                      Masoom Sharma Anthems
                    </span>
                    <span className="text-xs text-[#a38c80] truncate block">
                      {masoomSongs.length} Complete Studio Cuts
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlaySongList(masoomSongs, 0, false); }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                  title="Play Masoom Sharma Anthems"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Quick Card 3: Justin Bieber Essentials */}
              <div
                onClick={() => handlePlaySongList(bieberSongs, 0, false)}
                className="flex items-center justify-between bg-[#1e1b19] hover:bg-[#282422] rounded-md overflow-hidden transition-all duration-200 group cursor-pointer shadow-md border border-[#554339]/30 hover:border-[#ecc15a]/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={bieberSongs[0]?.coverUrl || 'https://c.saavncdn.com/289/Justice-English-2021-20210319044234-500x500.jpg'}
                    alt="Justin Bieber"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#e9e1dd] group-hover:text-[#ffb68c] transition-colors truncate block">
                      Justin Bieber Essentials
                    </span>
                    <span className="text-xs text-[#a38c80] truncate block">
                      {bieberSongs.length} Global Pop Anthems
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlaySongList(bieberSongs, 0, false); }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                  title="Play Justin Bieber Essentials"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Quick Card 4: Arijit Singh Melodies */}
              <div
                onClick={() => handlePlaySongList(arijitSongs, 0, false)}
                className="flex items-center justify-between bg-[#1e1b19] hover:bg-[#282422] rounded-md overflow-hidden transition-all duration-200 group cursor-pointer shadow-md border border-[#554339]/30 hover:border-[#ecc15a]/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={arijitSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80'}
                    alt="Arijit Singh"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#e9e1dd] group-hover:text-[#ffb68c] transition-colors truncate block">
                      Arijit Singh Melodies
                    </span>
                    <span className="text-xs text-[#a38c80] truncate block">
                      {arijitSongs.length} Soulful Nocturne Cuts
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlaySongList(arijitSongs, 0, false); }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                  title="Play Arijit Singh Melodies"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Quick Card 5: Dhanda Nyoliwala Drill */}
              <div
                onClick={() => handlePlaySongList(dhandaSongs, 0, false)}
                className="flex items-center justify-between bg-[#1e1b19] hover:bg-[#282422] rounded-md overflow-hidden transition-all duration-200 group cursor-pointer shadow-md border border-[#554339]/30 hover:border-[#ecc15a]/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={dhandaSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80'}
                    alt="Dhanda Nyoliwala"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#e9e1dd] group-hover:text-[#ffb68c] transition-colors truncate block">
                      Dhanda Nyoliwala Drill
                    </span>
                    <span className="text-xs text-[#a38c80] truncate block">
                      {dhandaSongs.length} Desi Drill Anthems
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlaySongList(dhandaSongs, 0, false); }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                  title="Play Dhanda Nyoliwala Drill"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Quick Card 6: Liked Songs Pressings */}
              <Link
                to="/liked-songs"
                className="flex items-center justify-between bg-[#1e1b19] hover:bg-[#282422] rounded-md overflow-hidden transition-all duration-200 group cursor-pointer shadow-md border border-[#554339]/30 hover:border-[#ecc15a]/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#d97736] to-[#554339] flex items-center justify-center flex-shrink-0 shadow-md">
                    <Heart className="w-8 h-8 text-[#221f1d] fill-current" />
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#e9e1dd] group-hover:text-[#ffb68c] transition-colors truncate block">
                      Liked Pressings
                    </span>
                    <span className="text-xs text-[#a38c80] truncate block">
                      Your Saved Vinyl Collection
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                </div>
              </Link>

            </div>
          </section>

          {/* 3. SPOTIFY SECTION: POPULAR ARTISTS (CIRCULAR CARDS WITH HOVER FLOATING PLAY) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#e9e1dd] hover:underline cursor-pointer">
                  Popular Artists
                </h2>
                <p className="font-editorial text-xs text-[#a38c80] mt-0.5">
                  Titans & Master Vocalists in the Sanctum
                </p>
              </div>
              <Link to="/artists" className="font-mono-spec text-xs text-[#ecc15a] hover:underline flex items-center gap-1 font-bold">
                <span>Show all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4">
              {[
                hariharanArtist,
                hansrajArtist,
                agamArtist,
                shankarArtist,
                bieberArtist,
                arijitArtist,
                masoomArtist,
                dhandaArtist,
                honeySingh,
                renukaArtist,
              ].filter((a): a is Artist => Boolean(a)).map((artist) => {
                const count = artist.name.includes('Bieber')
                  ? bieberSongs.length
                  : artist.name.includes('Arijit')
                  ? arijitSongs.length
                  : artist.name.toLowerCase().includes('masoom')
                  ? masoomSongs.length
                  : artist.name.includes('Dhanda')
                  ? dhandaSongs.length
                  : artist.name.includes('Hariharan')
                  ? hanumanSongs.length + 1
                  : artist.name.includes('Hansraj')
                  ? 3
                  : artist.name.includes('Agam')
                  ? 3
                  : artist.name.includes('Shankar')
                  ? 1
                  : (artist.songCount || 1);
                return (
                  <div
                    key={artist.id}
                    onClick={() => handlePlayArtist(artist)}
                    className="bg-[#1e1b19] hover:bg-[#282422] p-4 rounded-xl transition-all duration-300 group cursor-pointer relative shadow-lg border border-[#554339]/20 hover:border-[#ecc15a]/30 flex flex-col"
                  >
                    <div className="relative aspect-square w-full rounded-full overflow-hidden mb-3.5 bg-[#110e0c] shadow-lg border-2 border-[#554339]/40 group-hover:border-[#ecc15a]/60">
                      <img
                        src={artist.avatarUrl || artist.songs?.[0]?.coverUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePlayArtist(artist); }}
                        className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95"
                        title={`Play ${artist.name}`}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#e9e1dd] truncate group-hover:text-[#ffb68c]">
                      {artist.name}
                    </h4>
                    <p className="font-editorial text-xs text-[#a38c80] mt-1">
                      Artist • {count} Cuts
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. SPOTIFY SECTION: MADE FOR YOU (SQUARE CARDS WITH HOVER FLOATING PLAY) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#e9e1dd] hover:underline cursor-pointer">
                  Made For You
                </h2>
                <p className="font-editorial text-xs text-[#a38c80] mt-0.5">
                  Archival Vinyl Sanctuaries & Mood Chambers
                </p>
              </div>
              <span className="font-mono-spec text-[10px] text-[#ecc15a] uppercase tracking-wider">
                RIAA 1954 EQUALIZATION
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  id: 'mix-bhajan',
                  title: 'Divine Sanctum',
                  desc: 'Shree Hanuman Chalisa, Namami Shamishan & Krishna Bhajans',
                  cover: hanumanSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(devotionalSongs, 0, true),
                },
                {
                  id: 'mix-arijit',
                  title: 'Nostalgic Dusk',
                  desc: 'Arijit Singh & Soulful Nocturne Cuts',
                  cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(arijitSongs, 0, true),
                },
                {
                  id: 'mix-bieber',
                  title: 'Golden Reverie',
                  desc: 'Justin Bieber & Global Multi-Platinum Pop',
                  cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(bieberSongs, 0, true),
                },
                {
                  id: 'mix-masoom',
                  title: 'Desi Anthems',
                  desc: 'Masoom Sharma & 198 Haryanvi Folk Masters',
                  cover: masoomSongs[0]?.coverUrl || 'https://c.saavncdn.com/978/Bahu-Kale-Ki-Haryanvi-2018-20230206124545-500x500.jpg',
                  action: () => handlePlaySongList(masoomSongs, 0, true),
                },
                {
                  id: 'mix-dhanda',
                  title: 'Midnight Solitude',
                  desc: 'Dhanda Nyoliwala & Heavy 808 Desi Drill',
                  cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(dhandaSongs, 0, true),
                },
                {
                  id: 'mix-52gaj',
                  title: '52 Gaj Celebration',
                  desc: 'Renuka Panwar & Historic 3B+ Record',
                  cover: renukaSong?.coverUrl || 'https://c.saavncdn.com/407/52-Gaj-Ka-Daman-Haryanvi-2020-20210625170012-500x500.jpg',
                  action: () => renukaSong && playSong(renukaSong),
                },
              ].map((card) => (
                <div
                  key={card.id}
                  onClick={card.action}
                  className="bg-[#1e1b19] hover:bg-[#282422] p-4 rounded-xl transition-all duration-300 group cursor-pointer relative shadow-lg border border-[#554339]/20 hover:border-[#ecc15a]/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#110e0c] shadow-md">
                      <img src={card.cover} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button
                        onClick={(e) => { e.stopPropagation(); card.action(); }}
                        className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95"
                        title={`Play ${card.title}`}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#e9e1dd] truncate group-hover:text-[#ffb68c]">
                      {card.title}
                    </h4>
                    <p className="font-editorial text-xs text-[#a38c80] line-clamp-2 mt-1 leading-snug">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        {/* CHAMBER 02: FEATURED PHYSICAL CURATOR SLIPCASE (TITAN SPOTLIGHT - 7-COL + 5-COL ASYMMETRIC STITCH GATEFOLD) */}
        {activeSpotlight && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#554339]/40 pb-3">
              <div className="flex items-center gap-2 font-mono-spec text-xs text-[#a38c80] uppercase tracking-widest">
                <span>02</span>
                <span className="text-[#554339]">/</span>
                <span>CURATOR CRATE FOCUS</span>
              </div>
              <span className="font-mono-spec text-xs text-[#ecc15a] uppercase">
                ARCHIVAL PRESSING #{activeSpotlight.name.includes('Bieber') ? '151' : activeSpotlight.name.includes('Arijit') ? '120' : '066'}
              </span>
            </div>

            {/* Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-spec text-xs uppercase tracking-wider text-[#a38c80] mr-2">
                SELECT TITAN:
              </span>
              {bieberArtist && (
                <button
                  onClick={() => setSpotlightArtistId('bieber')}
                  className={`px-3 py-1.5 rounded font-mono-spec text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    spotlightArtistId === 'bieber'
                      ? 'bg-[#d97736] text-[#221f1d] border-[#ffb68c] shadow-[0_0_12px_rgba(217,119,54,0.4)]'
                      : 'bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                  }`}
                >
                  <span>🌎 Justin Bieber</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                    {bieberSongs.length} Cuts
                  </span>
                </button>
              )}
              {arijitArtist && (
                <button
                  onClick={() => setSpotlightArtistId('arijit')}
                  className={`px-3 py-1.5 rounded font-mono-spec text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    spotlightArtistId === 'arijit'
                      ? 'bg-[#d97736] text-[#221f1d] border-[#ffb68c] shadow-[0_0_12px_rgba(217,119,54,0.4)]'
                      : 'bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                  }`}
                >
                  <span>❤️ Arijit Singh</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                    {arijitSongs.length} Cuts
                  </span>
                </button>
              )}
              {dhandaArtist && (
                <button
                  onClick={() => setSpotlightArtistId('dhanda')}
                  className={`px-3 py-1.5 rounded font-mono-spec text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    spotlightArtistId === 'dhanda'
                      ? 'bg-[#d97736] text-[#221f1d] border-[#ffb68c] shadow-[0_0_12px_rgba(217,119,54,0.4)]'
                      : 'bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                  }`}
                >
                  <span>🔥 Dhanda Nyoliwala</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                    {dhandaSongs.length} Cuts
                  </span>
                </button>
              )}
              {masoomArtist && (
                <button
                  onClick={() => setSpotlightArtistId('masoom')}
                  className={`px-3 py-1.5 rounded font-mono-spec text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    spotlightArtistId === 'masoom'
                      ? 'bg-[#d97736] text-[#221f1d] border-[#ffb68c] shadow-[0_0_12px_rgba(217,119,54,0.4)]'
                      : 'bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                  }`}
                >
                  <span>🌾 Masoom Sharma</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                    {masoomSongs.length} Cuts
                  </span>
                </button>
              )}
              {honeySingh && (
                <button
                  onClick={() => setSpotlightArtistId('honey')}
                  className={`px-3 py-1.5 rounded font-mono-spec text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    spotlightArtistId === 'honey'
                      ? 'bg-[#d97736] text-[#221f1d] border-[#ffb68c] shadow-[0_0_12px_rgba(217,119,54,0.4)]'
                      : 'bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                  }`}
                >
                  <span>👑 Yo Yo Honey Singh</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                    {honeySingh.songCount} Cuts
                  </span>
                </button>
              )}
            </div>

            {/* Asymmetrical 7-Col + 5-Col Gatefold Slipcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (7 Cols): Physical Slipcase Jacket with Sliding Vinyl Disc */}
              <div className="lg:col-span-7 bg-[#1e1b19] p-6 sm:p-8 rounded-xl border border-[#554339]/40 shadow-2xl flex flex-col md:flex-row gap-7 overflow-hidden relative group">
                {/* The Vinyl Sleeve Jacket */}
                <div className="relative w-full md:w-56 aspect-square flex-shrink-0">
                  <div className="relative z-20 w-full h-full rounded-lg bg-[#110e0c] overflow-hidden shadow-2xl border border-[#554339]/40">
                    <img
                      src={activeSpotlight.avatarUrl || activeSpotlight.songs?.[0]?.coverUrl}
                      alt={activeSpotlight.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          activeSpotlight.songs?.[0]?.coverUrl ||
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#110e0c]/90 text-[#ecc15a] font-mono-spec text-[9px] uppercase font-bold">
                      OBI STRIP #{activeSpotlight.name.includes('Bieber') ? '01' : '02'}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono-spec text-[9px] text-[#ffb68c]">
                      <span>180 GRAM GATEFOLD</span>
                      <span>33⅓ RPM</span>
                    </div>
                  </div>

                  {/* Physical Grooved Vinyl Disc Sliding Out from the Sleeve */}
                  <div className="absolute top-2 -right-8 w-full h-[95%] rounded-full bg-[#0a0807] border border-[#2d2927] shadow-2xl flex items-center justify-center transform group-hover:translate-x-7 transition-transform duration-500 z-10 pointer-events-none">
                    <div className="w-[88%] h-[88%] rounded-full border border-[#221f1d] flex items-center justify-center">
                      <div className="w-[74%] h-[74%] rounded-full border border-[#2d2927] flex items-center justify-center">
                        <div className="w-[56%] h-[56%] rounded-full border border-[#383431] flex items-center justify-center">
                          {/* Record Center Paper Label */}
                          <div className="w-[36%] h-[36%] rounded-full bg-[#8c6b01] flex items-center justify-center text-center p-1 shadow-inner">
                            <span className="font-mono-spec text-[6px] text-[#fff3df] uppercase tracking-tighter">
                              RESONANCE
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liner Notes & Monograph */}
                <div className="flex flex-col justify-between flex-1 z-20">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#82977f]/20 text-[#b7cdb2] font-mono-spec text-[9px] uppercase font-bold">
                        {activeSpotlight.name.includes('Bieber') ? '🌎 Global Pop Icon' : activeSpotlight.name.includes('Arijit') ? '❤️ King of Soul' : activeSpotlight.name.includes('Dhanda') ? '🔥 Drill Sensation' : activeSpotlight.name.toLowerCase().includes('masoom') ? '🌾 King of Haryanvi' : '👑 King of Hits'}
                      </span>
                      <span className="font-mono-spec text-[10px] text-[#a38c80]">
                        • {activeSpotlight.songCount || (activeSpotlight.name.includes('Bieber') ? bieberSongs.length : activeSpotlight.name.includes('Arijit') ? arijitSongs.length : activeSpotlight.name.toLowerCase().includes('masoom') ? masoomSongs.length : dhandaSongs.length)} Master Tracks
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#e9e1dd] leading-tight mt-1">
                      {activeSpotlight.name}
                    </h3>

                    <p className="font-editorial text-sm text-[#dbc1b4] mt-1 leading-relaxed">
                      {activeSpotlight.bio || (activeSpotlight.name.includes('Bieber')
                        ? 'Grammy-winning global pop superstar with over 150 million records sold. Stream all 151 monumental anthems across Baby, Sorry, Love Yourself, Peaches, STAY, Ghost, Intentions, Beauty And A Beat, and more.'
                        : activeSpotlight.name.includes('Arijit')
                        ? 'The undisputed voice of Indian romance. Stream 120 heartfelt anthems including Tum Hi Ho, Channa Mereya, Kesariya, Agar Tum Saath Ho, Apna Bana Le, Gerua, and Kalank.'
                        : activeSpotlight.name.includes('Dhanda')
                        ? 'The powerhouse behind Desi Drill & Haryanvi Hip Hop. Stream all 66 anthems including Russian Bandana, Up To U, Boom Shaka, Not Guilty, and Maruti.'
                        : activeSpotlight.name.toLowerCase().includes('masoom')
                        ? 'The undisputed voice of Haryana and rural Indian heartlands. Stream all 198 monumental anthems including Bahu Kale Ki, 2 Numbari, Kothe Chad Lalkaru, Bholenath, Badmashi, Kala Dhaaga, Gypsy, and more.'
                        : 'Explore blockbuster hits assembled from International Villager, Desi Kalakaar, and GLORY.')}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 bg-[#110e0c] px-4 py-3 rounded-lg border border-[#554339]/30">
                    <div className="flex flex-col">
                      <span className="font-mono-spec text-[9px] text-[#a38c80] uppercase">
                        AUDIO MASTER
                      </span>
                      <span className="font-editorial text-xs text-[#ecc15a] font-medium">
                        320kbps High-Fidelity Studio Stream
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayArtist(activeSpotlight)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-[11px] font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(217,119,54,0.35)]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Drop Needle</span>
                      </button>
                      <button
                        onClick={() => handlePlayArtist(activeSpotlight, true)}
                        className="p-2 rounded bg-[#282422] text-[#e9e1dd] hover:text-[#ffb68c] border border-[#554339]/40 transition-all"
                        title="Shuffle Discography"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 Cols): Top Hits Strip & Personnel Matrix */}
              <div className="lg:col-span-5 bg-[#1e1b19] p-6 rounded-xl border border-[#554339]/40 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#554339]/30 pb-2">
                  <span className="font-mono-spec text-xs text-[#ecc15a] uppercase tracking-wider font-bold">
                    SELECT PRESSINGS ({activeSpotlight.name})
                  </span>
                  <Link to={`/artist/${activeSpotlight.id}`} className="font-mono-spec text-[10px] text-[#ffb68c] hover:underline flex items-center gap-1">
                    <span>Full Crate ({activeSpotlight.songCount || activeSpotlight.songs?.length})</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {((activeSpotlight.songs && activeSpotlight.songs.length > 0)
                    ? activeSpotlight.songs
                    : activeSpotlight.name.includes('Bieber')
                    ? bieberSongs
                    : activeSpotlight.name.includes('Arijit')
                    ? arijitSongs
                    : activeSpotlight.name.toLowerCase().includes('masoom')
                    ? masoomSongs
                    : dhandaSongs).slice(0, 5).map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    const songsList = (activeSpotlight.songs && activeSpotlight.songs.length > 0)
                      ? activeSpotlight.songs
                      : activeSpotlight.name.includes('Bieber')
                      ? bieberSongs
                      : activeSpotlight.name.includes('Arijit')
                      ? arijitSongs
                      : activeSpotlight.name.toLowerCase().includes('masoom')
                      ? masoomSongs
                      : dhandaSongs;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, undefined, songsList)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#221f1d] hover:bg-[#282422] border border-[#554339]/30 hover:border-[#ecc15a]/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="font-mono-spec text-xs text-[#a38c80] w-5 text-right font-bold">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <img src={song.coverUrl} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                              {song.title}
                            </p>
                            <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">{song.album || 'Single Master'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono-spec text-[10px] text-[#a38c80]">
                            {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                          <button className="p-1.5 rounded-full bg-[#110e0c] text-[#ffb68c] group-hover:bg-[#d97736] group-hover:text-[#221f1d] transition-all">
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* CHAMBER 03: SINGER DISCOGRAPHIES CAROUSEL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#554339]/40 pb-3">
            <div className="flex items-center gap-2 font-mono-spec text-xs text-[#a38c80] uppercase tracking-widest">
              <span>03</span>
              <span className="text-[#554339]">/</span>
              <span>TACTILE SINGER CRATES</span>
            </div>
            <Link to="/artists" className="font-mono-spec text-xs text-[#ecc15a] hover:underline flex items-center gap-1">
              <span>View All Singers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSingerId('all')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg font-mono-spec text-xs font-bold whitespace-nowrap transition-all border ${
                selectedSingerId === 'all'
                  ? 'bg-[#d97736] text-[#221f1d] border-[#ffb68c] shadow-md'
                  : 'bg-[#1e1b19] text-[#dbc1b4] border-[#554339]/40 hover:border-[#ecc15a]/40'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>All Singers ({allSongs.length} Cuts)</span>
            </button>

            {artists.map((artist) => {
              const isSelected = selectedSingerId === artist.id;
              return (
                <button
                  key={artist.id}
                  onClick={() => setSelectedSingerId(artist.id)}
                  className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg font-mono-spec text-xs whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#d97736] text-[#221f1d] font-bold border-[#ffb68c] shadow-md'
                      : 'bg-[#1e1b19] text-[#dbc1b4] border-[#554339]/40 hover:border-[#ecc15a]/40'
                  }`}
                >
                  <img
                    src={artist.avatarUrl || artist.songs?.[0]?.coverUrl}
                    alt={artist.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#554339] bg-[#110e0c]"
                  />
                  <span>{artist.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-black/30 text-[#fff3df]' : 'bg-[#110e0c] text-[#a38c80]'}`}>
                    {artist.songCount}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* IF INDIVIDUAL SINGER IS SELECTED */}
        {selectedSingerId !== 'all' && selectedSinger && (
          <section className="bg-[#1e1b19] rounded-xl p-6 sm:p-8 border border-[#554339]/40 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#554339]/40 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedSinger.avatarUrl || selectedSinger.songs?.[0]?.coverUrl}
                  alt={selectedSinger.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-[#ecc15a] shadow-lg bg-[#110e0c]"
                />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#e9e1dd]">{selectedSinger.name}</h3>
                  <p className="font-mono-spec text-xs text-[#a38c80]">{selectedSinger.genre} • {displayedSongs.length} Master Cuts</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayArtist(selectedSinger)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Drop Needle ({displayedSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlayArtist(selectedSinger, true)}
                  className="p-2.5 rounded bg-[#282422] text-[#e9e1dd] hover:text-[#ffb68c] border border-[#554339]/40"
                  title="Shuffle Discography"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {displayedSongs.map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, displayedSongs)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#221f1d] hover:bg-[#282422] border border-[#554339]/30 hover:border-[#ecc15a]/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono-spec text-[10px] text-[#a38c80] w-4 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">{song.album || 'Single'}</p>
                      </div>
                    </div>
                    <span className="font-mono-spec text-[10px] text-[#a38c80] ml-2">
                      {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 🪔 SECTION: 🙏 SACRED DEVOTIONAL SANCTUM (KRISHNA, MAHADEV, HANUMAN CHALISA, NAMAMI SHAMISHAN) */}
        {/* ============================================================== */}
        {selectedSingerId === 'all' && devotionalSongs.length > 0 && (
          <section className="bg-[#1e1b19] rounded-2xl p-6 sm:p-8 border border-[#ecc15a]/40 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Subtle Divine Amber/Gold Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ecc15a]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#554339]/50 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ecc15a]/20 text-[#ecc15a] font-mono-spec text-[10px] uppercase font-bold tracking-wider border border-[#ecc15a]/40 flex items-center gap-1.5">
                    <span>🕉️</span>
                    <span>SACRED AUDIO SANCTUM</span>
                  </span>
                  <span className="font-mono-spec text-[10px] text-[#ffb68c]">
                    320kbps CD Masters • {activeDevotionalList.length} Tracks
                  </span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-[#e9e1dd] flex items-center gap-2">
                  <span>Sacred Bhajans, Stutis & Vedic Chants</span>
                </h3>
                <p className="font-editorial text-xs sm:text-sm text-[#dbc1b4] mt-1 max-w-2xl">
                  Shree Hanuman Chalisa, Namami Shamishan (Rudrashtakam), Shiv Tandav, Achyutam Keshavam, Radhe Radhe & timeless spiritual anthems by Hariharan, Shankar Mahadevan, Agam Aggarwal, Hansraj Raghuwanshi & Lata Mangeshkar.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePlaySongList(activeDevotionalList, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d97736] text-[#221f1d] font-mono-spec text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(217,119,54,0.35)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({activeDevotionalList.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(activeDevotionalList, 0, true)}
                  className="p-2 rounded-lg bg-[#282422] text-[#e9e1dd] hover:text-[#ffb68c] border border-[#554339]/50 transition-all"
                  title="Shuffle Sacred Bhajans"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllDevotional(!showAllDevotional)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#282422] hover:bg-[#322c2a] text-[#dbc1b4] font-mono-spec text-xs border border-[#554339]/50 transition-colors"
                >
                  <span>{showAllDevotional ? 'Show Less' : `View All (${activeDevotionalList.length})`}</span>
                  {showAllDevotional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Deity Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono-spec text-xs">
              {[
                { id: 'all', label: `All Sacred Bhajans (${devotionalSongs.length})` },
                { id: 'krishna', label: `🦚 Shri Krishna (${krishnaSongs.length})` },
                { id: 'mahadev', label: `🔱 Mahadev & Shiva (${mahadevSongs.length})` },
                { id: 'hanuman', label: `🚩 Hanuman Chalisa & Stuti (${hanumanSongs.length})` },
                { id: 'ram', label: `🌸 Ram & Sacred Chants (${ramSongs.length})` },
              ].map((tab) => {
                const isSelected = devotionalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDevotionalTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-[#ecc15a] text-[#221f1d] font-bold border-[#fff3df] shadow-md'
                        : 'bg-[#221f1d] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Track Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {devotionalDisplayList.map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, activeDevotionalList)}
                    className={`flex items-center justify-between p-3 rounded-xl bg-[#221f1d] hover:bg-[#282422] border transition-all group cursor-pointer shadow-md ${
                      isCurrent
                        ? 'border-[#ecc15a] bg-[#282422] shadow-[0_0_15px_rgba(236,193,90,0.15)]'
                        : 'border-[#554339]/40 hover:border-[#ecc15a]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono-spec text-[10px] text-[#a38c80] w-4 text-right font-bold">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-[#554339]/50 bg-[#110e0c]">
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ecc15a]' : 'text-[#e9e1dd] group-hover:text-[#ecc15a]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2 flex-shrink-0">
                      <span className="font-mono-spec text-[10px] text-[#a38c80]">
                        {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                      </span>
                      {isCurrent && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ecc15a] animate-ping mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 1: 🌎 JUSTIN BIEBER COMPLETE GLOBAL DISCOGRAPHY (151 TRACKS) */}
        {selectedSingerId === 'all' && bieberSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#554339]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Disc3 className="w-6 h-6 text-[#ecc15a]" />
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-[#e9e1dd] flex items-center gap-2">
                    <span>Justin Bieber — Global Pop Sensation & Complete Discography</span>
                    <span className="px-2 py-0.5 rounded font-mono-spec text-[10px] bg-[#d97736]/20 text-[#ffb68c] border border-[#d97736]/40">
                      {bieberSongs.length} Tracks
                    </span>
                  </h3>
                  <p className="font-editorial text-xs text-[#a38c80] mt-0.5">
                    Baby, Sorry, Love Yourself, Peaches, STAY, Ghost, Intentions, Beauty And A Beat, What Do You Mean? & 140+ More
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySongList(bieberSongs, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({bieberSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(bieberSongs, 0, true)}
                  className="p-1.5 rounded bg-[#1e1b19] text-[#e9e1dd] hover:text-[#ffb68c] border border-[#554339]/40"
                  title="Shuffle Bieber Tracks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllBieber(!showAllBieber)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] font-mono-spec text-xs border border-[#554339]/40 transition-colors"
                >
                  <span>{showAllBieber ? 'Show Less' : `View All ${bieberSongs.length}`}</span>
                  {showAllBieber ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {bieberDisplayList.map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, bieberSongs)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1e1b19] hover:bg-[#221f1d] border border-[#554339]/40 hover:border-[#ecc15a]/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono-spec text-[10px] text-[#a38c80] w-4 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">{song.album || 'Single'}</p>
                      </div>
                    </div>
                    <span className="font-mono-spec text-[10px] text-[#a38c80] ml-2">
                      {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {!showAllBieber && bieberSongs.length > 12 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllBieber(true)}
                  className="px-5 py-2 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#ffb68c] border border-[#554339]/50 font-mono-spec text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>Show All {bieberSongs.length} Songs by Justin Bieber</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: ❤️ ARIJIT SINGH COMPLETE ROMANCE & SOUL DISCOGRAPHY (120 TRACKS) */}
        {selectedSingerId === 'all' && arijitSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#554339]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Heart className="w-6 h-6 text-[#ffb68c]" />
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-[#e9e1dd] flex items-center gap-2">
                    <span>Arijit Singh — King of Romance & Soulful Melodies</span>
                    <span className="px-2 py-0.5 rounded font-mono-spec text-[10px] bg-[#d97736]/20 text-[#ffb68c] border border-[#d97736]/40">
                      {arijitSongs.length} Tracks
                    </span>
                  </h3>
                  <p className="font-editorial text-xs text-[#a38c80] mt-0.5">
                    Tum Hi Ho, Channa Mereya, Kesariya, Apna Bana Le, Agar Tum Saath Ho, Gerua, Shayad, Satranga & More
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySongList(arijitSongs, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({arijitSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(arijitSongs, 0, true)}
                  className="p-1.5 rounded bg-[#1e1b19] text-[#e9e1dd] hover:text-[#ffb68c] border border-[#554339]/40"
                  title="Shuffle Arijit Tracks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllArijit(!showAllArijit)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] font-mono-spec text-xs border border-[#554339]/40 transition-colors"
                >
                  <span>{showAllArijit ? 'Show Less' : `View All ${arijitSongs.length}`}</span>
                  {showAllArijit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {arijitDisplayList.map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, arijitSongs)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1e1b19] hover:bg-[#221f1d] border border-[#554339]/40 hover:border-[#ecc15a]/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono-spec text-[10px] text-[#a38c80] w-4 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">{song.album || 'Single'}</p>
                      </div>
                    </div>
                    <span className="font-mono-spec text-[10px] text-[#a38c80] ml-2">
                      {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {!showAllArijit && arijitSongs.length > 12 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllArijit(true)}
                  className="px-5 py-2 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#ffb68c] border border-[#554339]/50 font-mono-spec text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>Show All {arijitSongs.length} Songs by Arijit Singh</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: 🔥 DHANDA NYOLIWALA COMPLETE DISCOGRAPHY (66 TRACKS) */}
        {selectedSingerId === 'all' && dhandaSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#554339]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Zap className="w-6 h-6 text-[#ecc15a]" />
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-[#e9e1dd] flex items-center gap-2">
                    <span>Dhanda Nyoliwala — Desi Drill & Haryanvi Hip Hop</span>
                    <span className="px-2 py-0.5 rounded font-mono-spec text-[10px] bg-[#d97736]/20 text-[#ffb68c] border border-[#d97736]/40">
                      {dhandaSongs.length} Tracks
                    </span>
                  </h3>
                  <p className="font-editorial text-xs text-[#a38c80] mt-0.5">
                    Russian Bandana, Up To U, Boom Shaka, Not Guilty, Maruti, Death Row, Vaaroon & More
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySongList(dhandaSongs, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({dhandaSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(dhandaSongs, 0, true)}
                  className="p-1.5 rounded bg-[#1e1b19] text-[#e9e1dd] hover:text-[#ffb68c] border border-[#554339]/40"
                  title="Shuffle Dhanda Tracks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllDhanda(!showAllDhanda)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] font-mono-spec text-xs border border-[#554339]/40 transition-colors"
                >
                  <span>{showAllDhanda ? 'Show Less' : `View All ${dhandaSongs.length}`}</span>
                  {showAllDhanda ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {dhandaDisplayList.map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, dhandaSongs)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1e1b19] hover:bg-[#221f1d] border border-[#554339]/40 hover:border-[#ecc15a]/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono-spec text-[10px] text-[#a38c80] w-4 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">{song.album || 'Single'}</p>
                      </div>
                    </div>
                    <span className="font-mono-spec text-[10px] text-[#a38c80] ml-2">
                      {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {!showAllDhanda && dhandaSongs.length > 12 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllDhanda(true)}
                  className="px-5 py-2 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#ffb68c] border border-[#554339]/50 font-mono-spec text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>Show All {dhandaSongs.length} Songs by Dhanda Nyoliwala</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 4: 🌾 MASOOM SHARMA COMPLETE HARYANVI DISCOGRAPHY (198 TRACKS) */}
        {selectedSingerId === 'all' && masoomSongs.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#554339]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Disc3 className="w-6 h-6 text-[#ecc15a]" />
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-[#e9e1dd] flex items-center gap-2">
                    <span>Masoom Sharma — Haryanvi Superstar & Complete Discography</span>
                    <span className="px-2 py-0.5 rounded font-mono-spec text-[10px] bg-[#d97736]/20 text-[#ffb68c] border border-[#d97736]/40">
                      {masoomSongs.length} Tracks
                    </span>
                  </h3>
                  <p className="font-editorial text-xs text-[#a38c80] mt-0.5">
                    Bahu Kale Ki, 2 Numbari, Kothe Chad Lalkaru, Bholenath, Badmashi, Kala Dhaaga, Gypsy & 190+ More
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySongList(masoomSongs, 0, false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({masoomSongs.length})</span>
                </button>
                <button
                  onClick={() => handlePlaySongList(masoomSongs, 0, true)}
                  className="p-1.5 rounded bg-[#1e1b19] text-[#e9e1dd] hover:text-[#ffb68c] border border-[#554339]/40"
                  title="Shuffle Masoom Tracks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAllMasoom(!showAllMasoom)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#dbc1b4] font-mono-spec text-xs border border-[#554339]/40 transition-colors"
                >
                  <span>{showAllMasoom ? 'Show Less' : `View All ${masoomSongs.length}`}</span>
                  {showAllMasoom ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {masoomDisplayList.map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, masoomSongs)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1e1b19] hover:bg-[#221f1d] border border-[#554339]/40 hover:border-[#ecc15a]/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono-spec text-[10px] text-[#a38c80] w-4 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">{song.album || 'Single'}</p>
                      </div>
                    </div>
                    <span className="font-mono-spec text-[10px] text-[#a38c80] ml-2">
                      {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {!showAllMasoom && masoomSongs.length > 12 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllMasoom(true)}
                  className="px-5 py-2 rounded bg-[#1e1b19] hover:bg-[#282422] text-[#ffb68c] border border-[#554339]/50 font-mono-spec text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <span>Show All {masoomSongs.length} Songs by Masoom Sharma</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION 5: 👑 RENUKA PANWAR — 52 GAJ KA DAMAN (ALL-TIME HARYANVI RECORD) */}
        {selectedSingerId === 'all' && renukaSong && (
          <section className="bg-gradient-to-r from-[#2a1708] via-[#1e1b19] to-[#161311] rounded-2xl p-6 sm:p-7 border border-[#ecc15a]/40 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ecc15a]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-[#ecc15a]/60 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={renukaSong.coverUrl}
                    alt="52 Gaj Ka Daman"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ecc15a]/20 text-[#ecc15a] font-mono-spec text-[10px] uppercase font-bold tracking-wider border border-[#ecc15a]/40">
                      🏆 All-Time Haryanvi Anthem
                    </span>
                    <span className="font-mono-spec text-[10px] text-[#a38c80]">
                      3+ Billion Streams
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#e9e1dd] group-hover:text-[#ffb68c] transition-colors">
                    {renukaSong.title}
                  </h3>
                  <p className="font-editorial text-xs sm:text-sm text-[#dbc1b4] mt-1 max-w-xl">
                    By <span className="font-bold text-[#ecc15a]">{renukaSong.artist}</span> • The historic record-shattering anthem of Indian music that took Haryanvi folk pop to global charts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => playSong(renukaSong)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d97736] text-[#221f1d] font-mono-spec text-xs font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(217,119,54,0.4)] hover:brightness-110 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play 52 Gaj Ka Daman</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 6: 👑 YO YO HONEY SINGH HITS */}
        {selectedSingerId === 'all' && honeySingh && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#554339]/40 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#ecc15a]" />
                <h3 className="font-serif text-xl md:text-2xl font-bold text-[#e9e1dd]">
                  Yo Yo Honey Singh Blockbusters ({honeySingh.songCount} Cuts)
                </h3>
              </div>
              <button
                onClick={() => handlePlayArtist(honeySingh)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e1b19] border border-[#ecc15a]/40 text-[#ecc15a] font-mono-spec text-xs font-bold hover:bg-[#282422] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Drop Needle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {(honeySingh.songs || []).map((song, i) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, undefined, honeySingh.songs)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#1e1b19] hover:bg-[#221f1d] border border-[#554339]/40 hover:border-[#ecc15a]/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono-spec text-[10px] text-[#a38c80] w-4 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-serif text-xs font-bold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                          {song.title}
                        </h4>
                        <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">{song.album || 'Single'}</p>
                      </div>
                    </div>
                    <span className="font-mono-spec text-[10px] text-[#a38c80] ml-2">
                      {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 7: 🎵 COMPLETE SONGS LIBRARY (ALL CUTS WITH STITCH EDITORIAL TRACK INDEX) */}
        {selectedSingerId === 'all' && (
          <section className="bg-[#1e1b19] rounded-xl p-6 sm:p-8 border border-[#554339]/40 space-y-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#554339]/40 pb-5">
              <div>
                <div className="flex items-center gap-2 text-[#ffb68c] font-mono-spec text-xs uppercase font-bold tracking-widest mb-1">
                  <Music className="w-4 h-4 text-[#ecc15a]" />
                  <span>MASTER VINYL TRACK DATABASE</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-[#e9e1dd] flex items-center gap-2">
                  <span>Complete Songs Library</span>
                  <span className="font-mono-spec text-xs px-2.5 py-0.5 rounded bg-[#d97736]/20 text-[#ffb68c] font-bold border border-[#d97736]/40">
                    {filteredLibrarySongs.length} of {allSongs.length} Cuts
                  </span>
                </h3>
                <p className="font-editorial text-xs text-[#a38c80] mt-1">
                  Precision search and catalog filters across all {allSongs.length} high-fidelity studio pressings.
                </p>
              </div>

              {/* Instant Filter & Search (Recessed Metal Faceplate Style) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative min-w-[280px]">
                  <Search className="w-4 h-4 text-[#a38c80] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={`Search all ${allSongs.length} songs or albums...`}
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded bg-[#110e0c] border border-[#554339]/60 focus:border-[#ecc15a]/80 font-editorial text-xs text-[#e9e1dd] placeholder:text-[#a38c80]/60 outline-none transition-all"
                  />
                  {librarySearch && (
                    <button
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-3 top-2 text-[#a38c80] hover:text-[#e9e1dd] text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handlePlaySongList(filteredLibrarySongs, 0, false)}
                  disabled={filteredLibrarySongs.length === 0}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#d97736] text-[#221f1d] font-mono-spec text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 transition-all disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Filtered</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills (Stitch Soft Badges) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono-spec text-xs">
              {[
                { id: 'all', label: `All Cuts (${allSongs.length})` },
                { id: 'bhajan', label: `🙏 Sacred Bhajans (${devotionalSongs.length})` },
                { id: 'haryanvi', label: `🌾 52 Gaj & Haryanvi (${haryanviSongs.length})` },
                { id: 'masoom', label: `🌾 Masoom Sharma (${masoomSongs.length})` },
                { id: 'dhanda', label: `🔥 Dhanda Nyoliwala (${dhandaSongs.length})` },
                { id: 'bieber', label: `🌎 Justin Bieber (${bieberSongs.length})` },
                { id: 'arijit', label: `❤️ Arijit Singh (${arijitSongs.length})` },
                { id: 'honey', label: `👑 Honey Singh (${honeySingh?.songCount || 16})` },
                { id: 'punjabi', label: '🌾 Punjabi Kings' },
                { id: 'bollywood', label: '🎬 Bollywood & Sufi' },
                { id: 'pop', label: '⚡ Other Global Pop' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setLibraryFilter(pill.id)}
                  className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-all border ${
                    libraryFilter === pill.id
                      ? 'bg-[#d97736] text-[#221f1d] font-bold border-[#ffb68c] shadow-sm'
                      : 'bg-[#221f1d] hover:bg-[#282422] text-[#dbc1b4] border-[#554339]/40'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Spotify Tracklist Table Format */}
            {filteredLibrarySongs.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Music className="w-10 h-10 text-[#554339] mx-auto" />
                <p className="font-editorial text-sm text-[#a38c80]">No cuts found matching "{librarySearch}"</p>
                <button
                  onClick={() => { setLibrarySearch(''); setLibraryFilter('all'); }}
                  className="font-mono-spec text-xs text-[#ffb68c] hover:underline font-bold"
                >
                  Reset catalog search
                </button>
              </div>
            ) : (
              <div className="w-full">
                {/* Spotify Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-[#554339]/40 font-mono-spec text-[11px] text-[#a38c80] uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-6 sm:col-span-5">Title</div>
                  <div className="hidden sm:block sm:col-span-4">Album</div>
                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end pr-3 gap-3">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Spotify Track Rows */}
                <div className="divide-y divide-transparent space-y-1 mt-2 max-h-[720px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredLibrarySongs.map((song, i) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song, undefined, filteredLibrarySongs)}
                        className={`grid grid-cols-12 gap-4 px-3 sm:px-4 py-2.5 rounded-md hover:bg-[#282422]/70 cursor-pointer transition-colors group items-center ${
                          isCurrent ? 'bg-[#221f1d] border-l-2 border-[#d97736]' : ''
                        }`}
                      >
                        {/* Col 1: Index or Play icon / Animated Equalizer */}
                        <div className="col-span-1 flex items-center justify-center font-mono-spec text-xs text-[#a38c80]">
                          {isCurrent && isPlaying ? (
                            <span className="flex items-end gap-0.5 h-3.5">
                              <span className="w-0.5 bg-[#d97736] animate-pulse h-full" />
                              <span className="w-0.5 bg-[#ecc15a] animate-pulse h-2" />
                              <span className="w-0.5 bg-[#d97736] animate-pulse h-3" />
                            </span>
                          ) : (
                            <>
                              <span className="group-hover:hidden">{i + 1}</span>
                              <Play className="w-3.5 h-3.5 fill-current text-[#ffb68c] hidden group-hover:block ml-0.5" />
                            </>
                          )}
                        </div>

                        {/* Col 2: Title with Thumbnail */}
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                          <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0 shadow-sm" />
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-serif text-sm font-semibold truncate leading-tight ${isCurrent ? 'text-[#ffb68c]' : 'text-[#e9e1dd] group-hover:text-[#ffb68c]'}`}>
                              {song.title}
                            </h4>
                            <p className="font-editorial text-xs text-[#a38c80] truncate mt-0.5 group-hover:text-[#dbc1b4]">
                              {song.artist}
                            </p>
                          </div>
                        </div>

                        {/* Col 3: Album */}
                        <div className="hidden sm:block sm:col-span-4 min-w-0">
                          <p className="font-editorial text-xs text-[#a38c80] truncate group-hover:text-[#e9e1dd]">
                            {song.album || 'Single'}
                          </p>
                        </div>

                        {/* Col 4: Like Heart & Duration */}
                        <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3 pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(song.id);
                            }}
                            className="p-1 rounded-full hover:scale-110 active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                            style={{ opacity: isLiked(song.id) ? 1 : undefined }}
                            title={isLiked(song.id) ? "Remove from Liked" : "Save to Liked"}
                          >
                            <Heart className={`w-4 h-4 transition-all ${isLiked(song.id) ? 'text-rose-500 fill-rose-500' : 'text-[#a38c80] hover:text-[#e9e1dd]'}`} />
                          </button>
                          <span className="font-mono-spec text-xs text-[#a38c80]">
                            {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        </div>
      </div>
    </div>
  );
};

