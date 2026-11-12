import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  ChevronRight,
  Shuffle,
  Disc,
  Flame,
  Heart,
  Search,
  Music,
  Zap,
  ChevronDown,
  ChevronUp,
  Disc3,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import type { Artist, Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { handleArtistImgError, handleTrackImgError } from '../utils/mediaFallback';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { playSong, currentSong, toggleLike, isLiked, isPlaying } = useAudio();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedSingerId, setSelectedSingerId] = useState<string>('all');
  const [spotlightArtistId, setSpotlightArtistId] = useState<
    'bieber' | 'arijit' | 'atif' | 'dhanda' | 'honey' | 'masoom'
  >('atif');
  const [showAllBieber, setShowAllBieber] = useState<boolean>(false);
  const [showAllArijit, setShowAllArijit] = useState<boolean>(false);
  const [showAllAtif, setShowAllAtif] = useState<boolean>(false);
  const [showAllDhanda, setShowAllDhanda] = useState<boolean>(false);
  const [showAllMasoom, setShowAllMasoom] = useState<boolean>(false);
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryFilter, setLibraryFilter] = useState<string>('all');
  const [activeFilterPill, setActiveFilterPill] = useState<string>('all');
  const [devotionalTab, setDevotionalTab] = useState<
    'all' | 'krishna' | 'mahadev' | 'hanuman' | 'ram'
  >('all');
  const [showAllDevotional, setShowAllDevotional] = useState<boolean>(false);

  const [recentPlayed, setRecentPlayed] = useState<Song[]>([]);
  const [mobileCategory, setMobileCategory] = useState<string>('all');
  const [mobileSearch, setMobileSearch] = useState<string>('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
    const songs =
      artist.songs && artist.songs.length > 0
        ? artist.songs
        : allSongs.filter(
          (s) =>
            s.artist.toLowerCase().includes(artist.name.toLowerCase()) ||
            artist.name.toLowerCase().includes(s.artist.toLowerCase())
        );
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
  const atifArtist = artists.find((a) => a.name.toLowerCase().includes('atif'));
  const dhandaArtist = artists.find((a) => a.name.toLowerCase().includes('dhanda'));
  const honeySingh = artists.find((a) => a.name.includes('Honey Singh'));
  const masoomArtist = artists.find((a) => a.name.toLowerCase().includes('masoom'));

  let activeSpotlight: Artist | undefined =
    atifArtist || bieberArtist || arijitArtist || artists[0];
  if (spotlightArtistId === 'bieber' && bieberArtist) {
    activeSpotlight = bieberArtist;
  } else if (spotlightArtistId === 'atif' && atifArtist) {
    activeSpotlight = atifArtist;
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
  const displayedSongs =
    selectedSingerId === 'all'
      ? allSongs
      : selectedSinger?.songs || allSongs.filter((s) => s.artist === selectedSinger?.name);

  // Filtered Library Songs
  const filteredLibrarySongs = allSongs.filter((s) => {
    const matchesSearch =
      !librarySearch.trim() ||
      s.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(librarySearch.toLowerCase()) ||
      (s.album && s.album.toLowerCase().includes(librarySearch.toLowerCase()));

    let matchesFilter = true;
    if (libraryFilter === 'haryanvi') {
      matchesFilter =
        (s.genre?.includes('Haryanvi') ?? false) ||
        s.artist.toLowerCase().includes('masoom') ||
        s.artist.toLowerCase().includes('dhanda') ||
        s.artist.toLowerCase().includes('renuka') ||
        s.title.toLowerCase().includes('52 gaj');
    } else if (libraryFilter === 'bieber') {
      matchesFilter = s.artist.includes('Bieber');
    } else if (libraryFilter === 'arijit') {
      matchesFilter = s.artist.includes('Arijit');
    } else if (libraryFilter === 'atif') {
      matchesFilter = s.artist.toLowerCase().includes('atif');
    } else if (libraryFilter === 'dhanda') {
      matchesFilter = s.artist.includes('Dhanda');
    } else if (libraryFilter === 'masoom') {
      matchesFilter = s.artist.toLowerCase().includes('masoom');
    } else if (libraryFilter === 'honey') {
      matchesFilter = s.artist.includes('Honey Singh');
    } else if (libraryFilter === 'punjabi') {
      matchesFilter =
        (s.genre?.includes('Punjabi') ?? false) && !s.artist.includes('Honey Singh');
    } else if (libraryFilter === 'bollywood') {
      matchesFilter =
        (s.genre?.includes('Bollywood') ?? false) ||
        (s.genre?.includes('Romantic') ?? false) ||
        (s.genre?.includes('Acoustic') ?? false);
    } else if (libraryFilter === 'bhajan' || libraryFilter === 'devotional') {
      matchesFilter =
        (s.genre?.includes('Devotional') ?? false) ||
        (s.genre?.includes('Bhajan') ?? false);
    } else if (libraryFilter === 'pop') {
      matchesFilter =
        !s.artist.includes('Bieber') &&
        (s.artist.includes('Weeknd') ||
          s.artist.includes('Taylor') ||
          s.artist.includes('Sheeran') ||
          s.artist.includes('Coldplay'));
    }

    return matchesSearch && matchesFilter;
  });

  const bieberSongs = allSongs.filter((s) => s.artist.includes('Bieber'));
  const bieberDisplayList = showAllBieber ? bieberSongs : bieberSongs.slice(0, 12);

  const arijitSongs = allSongs.filter((s) => s.artist.includes('Arijit'));
  const arijitDisplayList = showAllArijit ? arijitSongs : arijitSongs.slice(0, 12);

  const atifSongs = allSongs.filter((s) => s.artist.toLowerCase().includes('atif'));
  const atifDisplayList = showAllAtif ? atifSongs : atifSongs.slice(0, 12);

  const dhandaSongs = allSongs.filter(
    (s) => s.artist.includes('Dhanda') || s.genre?.includes('Haryanvi')
  );
  const dhandaDisplayList = showAllDhanda ? dhandaSongs : dhandaSongs.slice(0, 12);

  const masoomSongs = allSongs.filter((s) => s.artist.toLowerCase().includes('masoom'));
  const masoomDisplayList = showAllMasoom ? masoomSongs : masoomSongs.slice(0, 12);

  const renukaSong = allSongs.find(
    (s) =>
      s.artist.toLowerCase().includes('renuka') ||
      s.title.toLowerCase().includes('52 gaj')
  );
  const renukaArtist: Artist | undefined = renukaSong
    ? {
      id: 'renuka-panwar',
      name: 'Renuka Panwar',
      avatarUrl: renukaSong.coverUrl,
      genre: 'Haryanvi Folk Pop',
      bio: 'The sensational voice behind 52 Gaj Ka Daman',
      songCount: 1,
      songs: [renukaSong],
    }
    : undefined;

  const haryanviSongs = allSongs.filter(
    (s) =>
      (s.genre?.includes('Haryanvi') ?? false) ||
      s.artist.toLowerCase().includes('masoom') ||
      s.artist.toLowerCase().includes('dhanda') ||
      s.artist.toLowerCase().includes('renuka')
  );

  const devotionalSongs = allSongs.filter(
    (s) =>
      (s.genre?.includes('Devotional') ?? false) ||
      (s.genre?.includes('Bhajan') ?? false)
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

  const devotionalDisplayList = showAllDevotional
    ? activeDevotionalList
    : activeDevotionalList.slice(0, 12);

  const hariharanArtist = artists.find((a) => a.name.includes('Hariharan'));
  const hansrajArtist = artists.find((a) => a.name.includes('Hansraj'));
  const agamArtist = artists.find((a) => a.name.includes('Agam'));
  const shankarArtist = artists.find((a) => a.name.includes('Shankar Mahadevan'));
  const shreyaSong = allSongs.find(
    (s) =>
      s.artist.toLowerCase().includes('shreya') ||
      s.title.toLowerCase().includes('kalyani')
  );
  const foundShreya = artists.find((a) => a.name.includes('Shreya'));
  const shreyaArtist: Artist | undefined =
    foundShreya ||
    (shreyaSong
      ? {
        id: 'shreya-ghoshal',
        name: 'Shreya Ghoshal',
        avatarUrl: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg',
        genre: 'Indie Folk Fusion & Pop',
        bio: 'Queen of Melody & Legendary Master Playback Vocalist',
        songCount: 1,
        songs: [shreyaSong],
      }
      : undefined);

  useEffect(() => {
    if (allSongs.length > 0) {
      try {
        const saved = localStorage.getItem('vibe_recent_played');
        if (saved) {
          const ids: string[] = JSON.parse(saved);
          const found = ids
            .map((id) => allSongs.find((s) => s.id === id))
            .filter(Boolean) as Song[];
          if (found.length >= 4) {
            setRecentPlayed(found.slice(0, 4));
            return;
          }
        }
      } catch {
        // ignore
      }

      const bieber = allSongs.find((s) => s.artist.includes('Bieber'));
      const arijit = allSongs.find((s) => s.artist.includes('Arijit'));
      const dhanda = allSongs.find((s) => s.artist.includes('Dhanda'));
      const honey =
        allSongs.find((s) => s.artist.includes('Honey Singh')) || allSongs[0];

      const defaults = [bieber, arijit, dhanda, honey].filter(Boolean) as Song[];
      setRecentPlayed(defaults.slice(0, 4));
    }
  }, [allSongs]);

  useEffect(() => {
    if (currentSong && allSongs.length > 0) {
      setRecentPlayed((prev) => {
        const filtered = prev.filter((s) => s.id !== currentSong.id);
        const updated = [currentSong, ...filtered].slice(0, 4);
        try {
          localStorage.setItem(
            'vibe_recent_played',
            JSON.stringify(updated.map((s) => s.id))
          );
        } catch {
          // ignore
        }
        return updated;
      });
    }
  }, [currentSong, allSongs]);

  const mobilePlaylists = [
    {
      id: 'pl-bhajan',
      title: 'Sacred Bhajans',
      badge: 'DIVINE',
      cover:
        hanumanSongs[0]?.coverUrl ||
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80',
      songs:
        devotionalSongs.length > 0
          ? devotionalSongs
          : allSongs.filter((s) => s.genre?.includes('Devotional')),
    },
    {
      id: 'pl-atif',
      title: 'Atif Aslam Classics',
      badge: 'ATIF',
      cover:
        atifSongs[0]?.coverUrl ||
        'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg',
      songs:
        atifSongs.length > 0
          ? atifSongs
          : allSongs.filter((s) => s.artist.toLowerCase().includes('atif')),
    },
    {
      id: 'pl-52gaj',
      title: '52 Gaj Ka Daman',
      badge: 'HIT',
      cover:
        renukaSong?.coverUrl ||
        'https://c.saavncdn.com/407/52-Gaj-Ka-Daman-Haryanvi-2020-20210625170012-500x500.jpg',
      songs: renukaSong ? [renukaSong] : [],
    },
    {
      id: 'pl-masoom',
      title: 'Masoom Sharma Mix',
      badge: 'HARYANVI',
      cover:
        masoomSongs[0]?.coverUrl ||
        'https://c.saavncdn.com/978/Bahu-Kale-Ki-Haryanvi-2018-20230206124545-500x500.jpg',
      songs:
        masoomSongs.length > 0
          ? masoomSongs
          : allSongs.filter((s) => s.artist.toLowerCase().includes('masoom')),
    },
    {
      id: 'pl-romance',
      title: 'Arijit Singh Radio',
      badge: 'ROMANCE',
      cover:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
      songs:
        arijitSongs.length > 0
          ? arijitSongs
          : allSongs.filter((s) => s.genre?.includes('Romance')),
    },
    {
      id: 'pl-pop',
      title: 'Global Pop Mix',
      badge: 'POP',
      cover:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
      songs:
        bieberSongs.length > 0
          ? bieberSongs
          : allSongs.filter((s) => s.genre?.includes('Pop')),
    },
  ];

  const mobileCategorySongs = allSongs.filter((s) => {
    const matchesSearch =
      !mobileSearch.trim() ||
      s.title.toLowerCase().includes(mobileSearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(mobileSearch.toLowerCase()) ||
      (s.album && s.album.toLowerCase().includes(mobileSearch.toLowerCase()));

    let matchesCat = true;
    if (mobileCategory === 'bhajan') {
      matchesCat =
        (s.genre?.includes('Devotional') ?? false) ||
        (s.genre?.includes('Bhajan') ?? false);
    } else if (mobileCategory === 'atif') {
      matchesCat = s.artist.toLowerCase().includes('atif');
    } else if (mobileCategory === 'pop') {
      matchesCat =
        s.artist.includes('Bieber') ||
        (s.genre?.includes('Pop') ?? false) ||
        s.artist.includes('Weeknd') ||
        s.artist.includes('Taylor');
    } else if (mobileCategory === 'masoom') {
      matchesCat = s.artist.toLowerCase().includes('masoom');
    } else if (mobileCategory === 'romance') {
      matchesCat =
        s.artist.includes('Arijit') ||
        (s.genre?.includes('Romance') ?? false) ||
        (s.genre?.includes('Romantic') ?? false) ||
        (s.genre?.includes('Acoustic') ?? false);
    } else if (mobileCategory === 'drill') {
      matchesCat =
        s.artist.includes('Dhanda') ||
        (s.genre?.includes('Drill') ?? false) ||
        (s.genre?.includes('Haryanvi') ?? false) ||
        (s.genre?.includes('Punjabi') ?? false);
    }

    return matchesSearch && matchesCat;
  });

  const spotlightTracks =
    activeSpotlight?.songs && activeSpotlight.songs.length > 0
      ? activeSpotlight.songs
      : activeSpotlight?.name.includes('Bieber')
        ? bieberSongs
        : activeSpotlight?.name.includes('Arijit')
          ? arijitSongs
          : activeSpotlight?.name.toLowerCase().includes('atif')
            ? atifSongs
            : activeSpotlight?.name.toLowerCase().includes('masoom')
              ? masoomSongs
              : dhandaSongs;

  const renderTrackCardGrid = (list: Song[], fullQueue: Song[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {list.map((song, i) => {
        const isCurrent = currentSong?.id === song.id;
        return (
          <div
            key={song.id}
            onClick={() => playSong(song, undefined, fullQueue)}
            className={`flex items-center justify-between p-2.5 rounded-lg transition-all group cursor-pointer ${isCurrent
                ? 'bg-[#282828] ring-1 ring-[#1ed760]/60'
                : 'bg-[#181818] hover:bg-[#282828]'
              }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span
                className={`text-xs w-5 text-center font-semibold tabular-nums ${isCurrent ? 'text-[#1ed760]' : 'text-[#a7a7a7]'
                  }`}
              >
                {isCurrent && isPlaying ? '▶' : i + 1}
              </span>
              <div className="relative w-11 h-11 rounded overflow-hidden shrink-0 bg-[#282828]">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  onError={handleTrackImgError}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4
                  className={`text-sm font-semibold truncate leading-tight ${isCurrent ? 'text-[#1ed760]' : 'text-white'
                    }`}
                >
                  {song.title}
                </h4>
                <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                  {song.album || song.artist}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song.id);
                }}
                className={`p-1 transition-all ${isLiked(song.id)
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                  }`}
                title={isLiked(song.id) ? 'Remove from Liked Songs' : 'Like'}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${isLiked(song.id)
                      ? 'text-[#1ed760] fill-[#1ed760]'
                      : 'text-[#b3b3b3] hover:text-white'
                    }`}
                />
              </button>
              <span className="text-xs text-[#a7a7a7] tabular-nums">
                {Math.floor(song.durationSec / 60)}:
                {(song.durationSec % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-[#1a3a2a]/45 via-[#121212] to-[#121212] text-white pb-28 lg:pb-10 px-4 md:px-6 pt-4 md:pt-5 select-none">
      <div className="max-w-[1440px] mx-auto space-y-8 md:space-y-9">
        {/* ============================================================== */}
        {/* 📱 MOBILE STREAMING EXPERIENCE                                 */}
        {/* ============================================================== */}
        <div className="block md:hidden space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                {getGreeting()}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-[#1ed760]">
                {allSongs.length || 694} Songs
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'bhajan', label: `Bhajans (${devotionalSongs.length})` },
                { id: 'atif', label: `Atif Aslam (${atifSongs.length})` },
                { id: 'pop', label: 'Pop' },
                { id: 'masoom', label: 'Masoom Sharma' },
                { id: 'drill', label: 'Desi Drill' },
                { id: 'romance', label: 'Romance' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setMobileCategory(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${mobileCategory === pill.id
                      ? 'bg-[#1ed760] text-black'
                      : 'bg-white/10 text-white'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2x2 Quick Recently Played Grid */}
          <section className="grid grid-cols-2 gap-2">
            {recentPlayed.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, undefined, recentPlayed)}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 rounded-md overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
                >
                  <img
                    src={song.coverUrl}
                    alt=""
                    className="w-12 h-12 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <h4
                      className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'
                        }`}
                    >
                      {song.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Made For You Mobile Cards */}
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-white">Made for you</h2>
            <div className="grid grid-cols-2 gap-3">
              {mobilePlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handlePlaySongList(pl.songs, 0, false)}
                  className="bg-[#181818] hover:bg-[#282828] p-3 rounded-lg cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="relative aspect-square w-full rounded-md overflow-hidden mb-2.5 bg-[#282828] shadow-lg">
                    <img
                      src={pl.cover}
                      alt={pl.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-xl">
                      <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{pl.title}</h4>
                  <p className="text-[11px] text-[#b3b3b3] truncate mt-0.5">
                    {pl.songs.length} Tracks
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Mobile Browse & Search */}
          <section className="bg-[#181818] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                Browse Catalog ({mobileCategorySongs.length})
              </h3>
              <button
                onClick={() => handlePlaySongList(mobileCategorySongs, 0, true)}
                className="px-3 py-1 rounded-full bg-[#1ed760] text-black text-xs font-bold flex items-center gap-1"
              >
                <Shuffle className="w-3 h-3" />
                <span>Shuffle</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b3b3]" />
              <input
                type="text"
                placeholder={`Search ${allSongs.length || '694'} songs, artists...`}
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                className="w-full bg-[#242424] rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-[#b3b3b3] focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>

            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-0.5">
              {mobileCategorySongs.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#b3b3b3]">
                  No tracks found in this channel.
                </div>
              ) : (
                mobileCategorySongs.slice(0, 40).map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song, undefined, mobileCategorySongs)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={song.coverUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5
                            className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'
                              }`}
                          >
                            {song.title}
                          </h5>
                          <p className="text-[11px] text-[#b3b3b3] truncate">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.id);
                        }}
                        className="p-2"
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked(song.id)
                              ? 'text-[#1ed760] fill-[#1ed760]'
                              : 'text-[#b3b3b3]'
                            }`}
                        />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* ============================================================== */}
        {/* 💻 DESKTOP & TABLET VIEW: MODERN STREAMING FORMAT               */}
        {/* ============================================================== */}
        <div className="hidden md:block space-y-9">
          {/* 1. TOP FILTER PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'bhajan', label: `Bhajans (${devotionalSongs.length})` },
              { id: 'atif', label: `Atif Aslam (${atifSongs.length})` },
              { id: 'arijit', label: `Arijit Singh (${arijitSongs.length})` },
              { id: 'bieber', label: `Justin Bieber (${bieberSongs.length})` },
              { id: 'masoom', label: `Masoom Sharma (${masoomSongs.length})` },
              { id: 'dhanda', label: `Dhanda Nyoliwala (${dhandaSongs.length})` },
              { id: 'honey', label: 'Honey Singh' },
              { id: '52gaj', label: '52 Gaj Ka Daman' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setActiveFilterPill(pill.id);
                  if (pill.id === 'bhajan') {
                    setLibraryFilter('bhajan');
                  } else if (pill.id === 'atif') {
                    setSpotlightArtistId('atif');
                    setLibraryFilter('atif');
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
                  } else {
                    setLibraryFilter('all');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeFilterPill === pill.id
                    ? 'bg-white text-black'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* 2. GREETING & SIGNATURE QUICK-ACCESS GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {getGreeting()}
              </h1>
              <span className="text-xs font-medium text-[#b3b3b3] hidden sm:inline-block">
                {allSongs.length} tracks • High-Definition Audio
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Quick Card: Liked Songs */}
              <Link
                to="/liked-songs"
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#450af5] via-[#6b4df9] to-[#c4efd9] flex items-center justify-center shrink-0">
                    <Heart className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-sm text-white truncate block">
                      Liked Songs
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 shrink-0">
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </div>
              </Link>

              {/* Quick Card: Sacred Bhajans */}
              <div
                onClick={() => handlePlaySongList(devotionalSongs, 0, false)}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                  <img
                    src={
                      hanumanSongs[0]?.coverUrl ||
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80'
                    }
                    alt="Sacred Bhajans"
                    className="w-16 h-16 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-sm text-white truncate block">
                      Sacred Bhajans & Stutis
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySongList(devotionalSongs, 0, false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                  title="Play Sacred Bhajans"
                >
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </button>
              </div>

              {/* Quick Card: Atif Aslam Classics */}
              {atifSongs.length > 0 && (
                <div
                  onClick={() => handlePlaySongList(atifSongs, 0, false)}
                  className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                    <img
                      src={
                        atifSongs[0]?.coverUrl ||
                        'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg'
                      }
                      alt="Atif Aslam"
                      onError={handleTrackImgError}
                      className="w-16 h-16 object-cover shrink-0 bg-[#282828]"
                    />
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-bold text-sm text-white truncate block">
                        Atif Aslam Classics
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySongList(atifSongs, 0, false);
                    }}
                    className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                    title="Play Atif Aslam Classics"
                  >
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </button>
                </div>
              )}

              {/* Quick Card: Arijit Singh Melodies */}
              <div
                onClick={() => handlePlaySongList(arijitSongs, 0, false)}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                  <img
                    src={
                      arijitSongs[0]?.coverUrl ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80'
                    }
                    alt="Arijit Singh"
                    className="w-16 h-16 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-sm text-white truncate block">
                      Arijit Singh Melodies
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySongList(arijitSongs, 0, false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                  title="Play Arijit Singh Melodies"
                >
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </button>
              </div>

              {/* Quick Card: Justin Bieber Essentials */}
              <div
                onClick={() => handlePlaySongList(bieberSongs, 0, false)}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                  <img
                    src={
                      bieberSongs[0]?.coverUrl ||
                      'https://c.saavncdn.com/289/Justice-English-2021-20210319044234-500x500.jpg'
                    }
                    alt="Justin Bieber"
                    className="w-16 h-16 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-sm text-white truncate block">
                      Justin Bieber Essentials
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySongList(bieberSongs, 0, false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                  title="Play Justin Bieber Essentials"
                >
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </button>
              </div>

              {/* Quick Card: Masoom Sharma Anthems */}
              <div
                onClick={() => handlePlaySongList(masoomSongs, 0, false)}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                  <img
                    src={
                      masoomSongs[0]?.coverUrl ||
                      'https://c.saavncdn.com/978/Bahu-Kale-Ki-Haryanvi-2018-20230206124545-500x500.jpg'
                    }
                    alt="Masoom Sharma"
                    className="w-16 h-16 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-sm text-white truncate block">
                      Masoom Sharma Anthems
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySongList(masoomSongs, 0, false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                  title="Play Masoom Sharma Anthems"
                >
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </button>
              </div>

              {/* Quick Card: Dhanda Nyoliwala Drill */}
              <div
                onClick={() => handlePlaySongList(dhandaSongs, 0, false)}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                  <img
                    src={
                      dhandaSongs[0]?.coverUrl ||
                      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80'
                    }
                    alt="Dhanda Nyoliwala"
                    className="w-16 h-16 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-sm text-white truncate block">
                      Dhanda Nyoliwala Drill
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySongList(dhandaSongs, 0, false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                  title="Play Dhanda Nyoliwala Drill"
                >
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </button>
              </div>

              {/* Quick Card: 52 Gaj Ka Daman */}
              {renukaSong && (
                <div
                  onClick={() => playSong(renukaSong)}
                  className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer h-16"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 h-full">
                    <img
                      src={renukaSong.coverUrl}
                      alt="52 Gaj Ka Daman"
                      className="w-16 h-16 object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-bold text-sm text-white truncate block">
                        52 Gaj Ka Daman
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(renukaSong);
                    }}
                    className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center mr-3 shadow-xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
                    title="Play 52 Gaj Ka Daman"
                  >
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* 3. POPULAR ARTISTS (CIRCULAR CARDS WITH FLOATING GREEN PLAY) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight hover:underline">
                Popular artists
              </h2>
              <Link
                to="/artists"
                className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline flex items-center gap-1"
              >
                <span>Show all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                atifArtist,
                shreyaArtist,
                arijitArtist,
                bieberArtist,
                masoomArtist,
                dhandaArtist,
                honeySingh,
                hariharanArtist,
                hansrajArtist,
                agamArtist,
                shankarArtist,
                renukaArtist,
              ]
                .filter((a): a is Artist => Boolean(a))
                .map((artist) => {
                  const count = artist.name.toLowerCase().includes('atif')
                    ? atifSongs.length
                    : artist.name.includes('Shreya')
                      ? 1
                      : artist.name.includes('Bieber')
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
                                      : artist.songCount || 1;
                  return (
                    <div
                      key={artist.id}
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg transition-all duration-200 group cursor-pointer flex flex-col"
                    >
                      <div className="relative aspect-square w-full rounded-full overflow-hidden mb-3 bg-[#282828] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                        <img
                          src={artist.avatarUrl || artist.songs?.[0]?.coverUrl}
                          alt={artist.name}
                          onError={(e) => handleArtistImgError(e, artist.songs?.[0]?.coverUrl)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayArtist(artist);
                          }}
                          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                          title={`Play ${artist.name}`}
                        >
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-white truncate">
                        {artist.name}
                      </h4>
                      <p className="text-xs text-[#b3b3b3] mt-0.5">
                        Artist • {count} {count === 1 ? 'track' : 'tracks'}
                      </p>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* 4. MADE FOR YOU (SQUARE CARDS WITH FLOATING GREEN PLAY) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Made For You
              </h2>
              <Link
                to="/playlists"
                className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline"
              >
                Show all
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {[
                {
                  id: 'mix-bhajan',
                  title: 'Divine Sanctum',
                  desc: 'Hanuman Chalisa, Namami Shamishan & Krishna Bhajans',
                  cover:
                    hanumanSongs[0]?.coverUrl ||
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(devotionalSongs, 0, true),
                },
                {
                  id: 'mix-atif',
                  title: 'Atif Aslam Mix',
                  desc: 'Tu Jaane Na, Pehli Nazar Mein & 74 soulful tracks',
                  cover:
                    atifSongs[0]?.coverUrl ||
                    'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg',
                  action: () => handlePlaySongList(atifSongs, 0, true),
                },
                {
                  id: 'mix-arijit',
                  title: 'Arijit Singh Radio',
                  desc: 'Tum Hi Ho, Kesariya & late-night romantic ballads',
                  cover:
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(arijitSongs, 0, true),
                },
                {
                  id: 'mix-bieber',
                  title: 'Justin Bieber Hits',
                  desc: 'Peaches, STAY, Sorry, Love Yourself & global pop',
                  cover:
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(bieberSongs, 0, true),
                },
                {
                  id: 'mix-masoom',
                  title: 'Haryanvi Anthems',
                  desc: 'Masoom Sharma & 198 regional power hits',
                  cover:
                    masoomSongs[0]?.coverUrl ||
                    'https://c.saavncdn.com/978/Bahu-Kale-Ki-Haryanvi-2018-20230206124545-500x500.jpg',
                  action: () => handlePlaySongList(masoomSongs, 0, true),
                },
                {
                  id: 'mix-dhanda',
                  title: 'Desi Drill Heat',
                  desc: 'Dhanda Nyoliwala & heavy 808 anthems',
                  cover:
                    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80',
                  action: () => handlePlaySongList(dhandaSongs, 0, true),
                },
                {
                  id: 'mix-52gaj',
                  title: '52 Gaj Celebration',
                  desc: 'Renuka Panwar & record-breaking folk pop',
                  cover:
                    renukaSong?.coverUrl ||
                    'https://c.saavncdn.com/407/52-Gaj-Ka-Daman-Haryanvi-2020-20210625170012-500x500.jpg',
                  action: () => renukaSong && playSong(renukaSong),
                },
              ].map((card) => (
                <div
                  key={card.id}
                  onClick={card.action}
                  className="bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-md overflow-hidden mb-3 bg-[#282828] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                      <img
                        src={card.cover}
                        alt={card.title}
                        onError={handleTrackImgError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          card.action();
                        }}
                        className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        title={`Play ${card.title}`}
                      >
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-white truncate">
                      {card.title}
                    </h4>
                    <p className="text-xs text-[#b3b3b3] line-clamp-2 mt-1 leading-snug">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. ARTIST SPOTLIGHT HERO */}
          {activeSpotlight && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Artist Spotlight
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    atifArtist && { id: 'atif', label: 'Atif Aslam' },
                    bieberArtist && { id: 'bieber', label: 'Justin Bieber' },
                    arijitArtist && { id: 'arijit', label: 'Arijit Singh' },
                    dhandaArtist && { id: 'dhanda', label: 'Dhanda Nyoliwala' },
                    masoomArtist && { id: 'masoom', label: 'Masoom Sharma' },
                    honeySingh && { id: 'honey', label: 'Yo Yo Honey Singh' },
                  ]
                    .filter(Boolean)
                    .map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => setSpotlightArtistId(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${spotlightArtistId === item.id
                            ? 'bg-[#1ed760] text-black font-bold'
                            : 'bg-[#232323] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left 7 Cols: Verified Artist Hero Card */}
                <div className="lg:col-span-7 bg-gradient-to-br from-[#242424] via-[#181818] to-[#121212] p-6 rounded-xl border border-white/5 flex flex-col justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img
                      src={
                        activeSpotlight.avatarUrl ||
                        activeSpotlight.songs?.[0]?.coverUrl
                      }
                      alt={activeSpotlight.name}
                      onError={(e) => handleArtistImgError(e, activeSpotlight?.songs?.[0]?.coverUrl)}
                      className="w-40 h-40 rounded-lg object-cover shadow-2xl shrink-0 bg-[#282828]"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4cb3ff] mb-2">
                        <BadgeCheck className="w-4 h-4 fill-[#4cb3ff] text-black" />
                        <span>Verified Artist</span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {activeSpotlight.name}
                      </h3>
                      <p className="text-sm text-[#b3b3b3] mt-2 leading-relaxed line-clamp-3">
                        {activeSpotlight.bio ||
                          `${spotlightTracks.length} studio tracks streaming in high fidelity.`}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <button
                          onClick={() => handlePlayArtist(activeSpotlight)}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-black" />
                          <span>Play</span>
                        </button>
                        <button
                          onClick={() => handlePlayArtist(activeSpotlight, true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 hover:border-white text-white font-semibold text-sm transition-all cursor-pointer"
                        >
                          <Shuffle className="w-4 h-4" />
                          <span>Shuffle</span>
                        </button>
                        <Link
                          to={`/artist/${activeSpotlight.id}`}
                          className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline px-2"
                        >
                          Open artist page →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Top Tracks Quick List */}
                <div className="lg:col-span-5 bg-[#181818] p-5 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">Popular</h4>
                    <Link
                      to={`/artist/${activeSpotlight.id}`}
                      className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline"
                    >
                      See all ({spotlightTracks.length})
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {spotlightTracks.slice(0, 5).map((song, idx) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => playSong(song, undefined, spotlightTracks)}
                          className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`text-xs w-4 text-center tabular-nums ${isCurrent ? 'text-[#1ed760] font-bold' : 'text-[#b3b3b3]'
                                }`}
                            >
                              {idx + 1}
                            </span>
                            <img
                              src={song.coverUrl}
                              alt=""
                              onError={handleTrackImgError}
                              className="w-10 h-10 rounded object-cover shrink-0 bg-[#282828]"
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'
                                  }`}
                              >
                                {song.title}
                              </p>
                              <p className="text-xs text-[#b3b3b3] truncate">
                                {song.album || activeSpotlight.name}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-[#b3b3b3] tabular-nums ml-2">
                            {Math.floor(song.durationSec / 60)}:
                            {(song.durationSec % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 6. QUICK ARTIST FILTER PILL BAR */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Browse by Artist
              </h2>
              <Link
                to="/artists"
                className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline flex items-center gap-1"
              >
                <span>All artists</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedSingerId('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedSingerId === 'all'
                    ? 'bg-[#1ed760] text-black'
                    : 'bg-[#232323] hover:bg-[#2a2a2a] text-white'
                  }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span>All Artists ({allSongs.length})</span>
              </button>

              {artists.map((artist) => {
                const isSelected = selectedSingerId === artist.id;
                return (
                  <button
                    key={artist.id}
                    onClick={() => setSelectedSingerId(artist.id)}
                    className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isSelected
                        ? 'bg-[#1ed760] text-black font-bold'
                        : 'bg-[#232323] hover:bg-[#2a2a2a] text-white'
                      }`}
                  >
                    <img
                      src={artist.avatarUrl || artist.songs?.[0]?.coverUrl}
                      alt={artist.name}
                      onError={(e) => handleArtistImgError(e, artist.songs?.[0]?.coverUrl)}
                      className="w-6 h-6 rounded-full object-cover bg-[#121212]"
                    />
                    <span>{artist.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-black/40 text-[#b3b3b3]'
                        }`}
                    >
                      {artist.songCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* IF INDIVIDUAL ARTIST IS SELECTED */}
          {selectedSingerId !== 'all' && selectedSinger && (
            <section className="bg-[#181818] rounded-xl p-6 space-y-5 border border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      selectedSinger.avatarUrl ||
                      selectedSinger.songs?.[0]?.coverUrl
                    }
                    alt={selectedSinger.name}
                    onError={(e) => handleArtistImgError(e, selectedSinger.songs?.[0]?.coverUrl)}
                    className="w-16 h-16 rounded-full object-cover shadow-lg bg-[#282828]"
                  />
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">
                      {selectedSinger.name}
                    </h3>
                    <p className="text-xs text-[#b3b3b3]">
                      {selectedSinger.genre} • {displayedSongs.length} tracks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayArtist(selectedSinger)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Play All ({displayedSongs.length})</span>
                  </button>
                  <button
                    onClick={() => handlePlayArtist(selectedSinger, true)}
                    className="p-2.5 rounded-full bg-[#282828] hover:bg-[#333333] text-white transition-colors cursor-pointer"
                    title="Shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {renderTrackCardGrid(displayedSongs, displayedSongs)}
            </section>
          )}

          {/* 7. SACRED DEVOTIONAL BHAJANS & STUTIS */}
          {selectedSingerId === 'all' && devotionalSongs.length > 0 && (
            <section className="bg-gradient-to-br from-[#231d14] via-[#181818] to-[#181818] rounded-xl p-6 border border-white/5 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1ed760] mb-1">
                    🕉️ Sacred Collection • {activeDevotionalList.length} Tracks
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                    Sacred Bhajans, Stutis & Vedic Chants
                  </h3>
                  <p className="text-xs sm:text-sm text-[#b3b3b3] mt-1 max-w-2xl">
                    Shree Hanuman Chalisa, Namami Shamishan (Rudrashtakam), Shiv Tandav, Achyutam Keshavam, Radhe Radhe & devotional classics.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePlaySongList(activeDevotionalList, 0, false)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play All ({activeDevotionalList.length})</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongList(activeDevotionalList, 0, true)}
                    className="p-2 rounded-full bg-[#282828] hover:bg-[#333333] text-white transition-colors cursor-pointer"
                    title="Shuffle Bhajans"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAllDevotional(!showAllDevotional)}
                    className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>
                      {showAllDevotional
                        ? 'Show Less'
                        : `View All (${activeDevotionalList.length})`}
                    </span>
                    {showAllDevotional ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: `All (${devotionalSongs.length})` },
                  { id: 'krishna', label: `🦚 Shri Krishna (${krishnaSongs.length})` },
                  { id: 'mahadev', label: `🔱 Mahadev & Shiva (${mahadevSongs.length})` },
                  { id: 'hanuman', label: `🚩 Hanuman (${hanumanSongs.length})` },
                  { id: 'ram', label: `🌸 Ram & Vedic (${ramSongs.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDevotionalTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${devotionalTab === tab.id
                        ? 'bg-white text-black'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {renderTrackCardGrid(devotionalDisplayList, activeDevotionalList)}
            </section>
          )}

          {/* 8. ATIF ASLAM DISCOGRAPHY */}
          {selectedSingerId === 'all' && atifSongs.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Disc3 className="w-6 h-6 text-[#1ed760]" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                      <span>Atif Aslam</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#b3b3b3]">
                        {atifSongs.length} Tracks
                      </span>
                    </h3>
                    <p className="text-xs text-[#b3b3b3]">
                      Tu Jaane Na, Tera Hone Laga Hoon, Pehli Nazar Mein, Tere Sang Yaara, Jeena Jeena & more
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySongList(atifSongs, 0, false)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play All</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongList(atifSongs, 0, true)}
                    className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white cursor-pointer"
                    title="Shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAllAtif(!showAllAtif)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white text-xs font-semibold cursor-pointer"
                  >
                    <span>{showAllAtif ? 'Show Less' : `View All ${atifSongs.length}`}</span>
                    {showAllAtif ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {renderTrackCardGrid(atifDisplayList, atifSongs)}
            </section>
          )}

          {/* 9. ARIJIT SINGH DISCOGRAPHY */}
          {selectedSingerId === 'all' && arijitSongs.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-6 h-6 text-[#1ed760]" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                      <span>Arijit Singh</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#b3b3b3]">
                        {arijitSongs.length} Tracks
                      </span>
                    </h3>
                    <p className="text-xs text-[#b3b3b3]">
                      Tum Hi Ho, Channa Mereya, Kesariya, Apna Bana Le, Agar Tum Saath Ho & more
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySongList(arijitSongs, 0, false)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play All</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongList(arijitSongs, 0, true)}
                    className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white cursor-pointer"
                    title="Shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAllArijit(!showAllArijit)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white text-xs font-semibold cursor-pointer"
                  >
                    <span>
                      {showAllArijit ? 'Show Less' : `View All ${arijitSongs.length}`}
                    </span>
                    {showAllArijit ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {renderTrackCardGrid(arijitDisplayList, arijitSongs)}
            </section>
          )}

          {/* 10. JUSTIN BIEBER DISCOGRAPHY */}
          {selectedSingerId === 'all' && bieberSongs.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Disc3 className="w-6 h-6 text-[#1ed760]" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                      <span>Justin Bieber</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#b3b3b3]">
                        {bieberSongs.length} Tracks
                      </span>
                    </h3>
                    <p className="text-xs text-[#b3b3b3]">
                      Baby, Sorry, Love Yourself, Peaches, STAY, Ghost, Intentions & more
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySongList(bieberSongs, 0, false)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play All</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongList(bieberSongs, 0, true)}
                    className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white cursor-pointer"
                    title="Shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAllBieber(!showAllBieber)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white text-xs font-semibold cursor-pointer"
                  >
                    <span>
                      {showAllBieber ? 'Show Less' : `View All ${bieberSongs.length}`}
                    </span>
                    {showAllBieber ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {renderTrackCardGrid(bieberDisplayList, bieberSongs)}
            </section>
          )}

          {/* 11. DHANDA NYOLIWALA DISCOGRAPHY */}
          {selectedSingerId === 'all' && dhandaSongs.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-6 h-6 text-[#1ed760]" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                      <span>Dhanda Nyoliwala</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#b3b3b3]">
                        {dhandaSongs.length} Tracks
                      </span>
                    </h3>
                    <p className="text-xs text-[#b3b3b3]">
                      Russian Bandana, Up To U, Boom Shaka, Not Guilty, Maruti & more
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySongList(dhandaSongs, 0, false)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play All</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongList(dhandaSongs, 0, true)}
                    className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white cursor-pointer"
                    title="Shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAllDhanda(!showAllDhanda)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white text-xs font-semibold cursor-pointer"
                  >
                    <span>
                      {showAllDhanda ? 'Show Less' : `View All ${dhandaSongs.length}`}
                    </span>
                    {showAllDhanda ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {renderTrackCardGrid(dhandaDisplayList, dhandaSongs)}
            </section>
          )}

          {/* 12. MASOOM SHARMA DISCOGRAPHY */}
          {selectedSingerId === 'all' && masoomSongs.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Disc3 className="w-6 h-6 text-[#1ed760]" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                      <span>Masoom Sharma</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#b3b3b3]">
                        {masoomSongs.length} Tracks
                      </span>
                    </h3>
                    <p className="text-xs text-[#b3b3b3]">
                      Bahu Kale Ki, 2 Numbari, Kothe Chad Lalkaru, Bholenath, Gypsy & more
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySongList(masoomSongs, 0, false)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play All</span>
                  </button>
                  <button
                    onClick={() => handlePlaySongList(masoomSongs, 0, true)}
                    className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white cursor-pointer"
                    title="Shuffle"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAllMasoom(!showAllMasoom)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#232323] hover:bg-[#2a2a2a] text-white text-xs font-semibold cursor-pointer"
                  >
                    <span>
                      {showAllMasoom ? 'Show Less' : `View All ${masoomSongs.length}`}
                    </span>
                    {showAllMasoom ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {renderTrackCardGrid(masoomDisplayList, masoomSongs)}
            </section>
          )}

          {/* 13. 52 GAJ KA DAMAN FEATURED BANNER */}
          {selectedSingerId === 'all' && renukaSong && (
            <section className="bg-gradient-to-r from-[#1db954]/20 via-[#181818] to-[#181818] rounded-xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <img
                  src={renukaSong.coverUrl}
                  alt="52 Gaj Ka Daman"
                  className="w-24 h-24 rounded-lg object-cover shadow-2xl shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1ed760]">
                    Featured Anthem • 3B+ Streams
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                    {renukaSong.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#b3b3b3] mt-1 max-w-xl">
                    By <span className="font-semibold text-white">{renukaSong.artist}</span> • The record-shattering Haryanvi folk pop sensation.
                  </p>
                </div>
              </div>

              <button
                onClick={() => playSong(renukaSong)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Now</span>
              </button>
            </section>
          )}

          {/* 14. YO YO HONEY SINGH BLOCKBUSTERS */}
          {selectedSingerId === 'all' && honeySingh && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#1ed760]" />
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">
                    Yo Yo Honey Singh ({honeySingh.songCount} Tracks)
                  </h3>
                </div>
                <button
                  onClick={() => handlePlayArtist(honeySingh)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Play All</span>
                </button>
              </div>
              {renderTrackCardGrid(honeySingh.songs || [], honeySingh.songs || [])}
            </section>
          )}

          {/* 15. COMPLETE TRACKS TABLE */}
          {selectedSingerId === 'all' && (
            <section className="bg-[#181818] rounded-xl p-5 sm:p-6 border border-white/5 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                    <Music className="w-6 h-6 text-[#1ed760]" />
                    <span>Complete Songs Library</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-[#1ed760]">
                      {filteredLibrarySongs.length} of {allSongs.length}
                    </span>
                  </h3>
                  <p className="text-xs text-[#b3b3b3] mt-1">
                    Instant search and genre filters across all {allSongs.length} studio tracks.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative min-w-[270px]">
                    <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Filter ${allSongs.length} songs or albums...`}
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 rounded-full bg-[#242424] border border-white/10 focus:border-white/40 text-xs text-white placeholder:text-[#b3b3b3] outline-none transition-all"
                    />
                    {librarySearch && (
                      <button
                        onClick={() => setLibrarySearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handlePlaySongList(filteredLibrarySongs, 0, false)}
                    disabled={filteredLibrarySongs.length === 0}
                    className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play Filtered</span>
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: `All (${allSongs.length})` },
                  { id: 'bhajan', label: `Bhajans (${devotionalSongs.length})` },
                  { id: 'atif', label: `Atif Aslam (${atifSongs.length})` },
                  { id: 'arijit', label: `Arijit Singh (${arijitSongs.length})` },
                  { id: 'bieber', label: `Justin Bieber (${bieberSongs.length})` },
                  { id: 'masoom', label: `Masoom Sharma (${masoomSongs.length})` },
                  { id: 'dhanda', label: `Dhanda Nyoliwala (${dhandaSongs.length})` },
                  { id: 'haryanvi', label: `Haryanvi (${haryanviSongs.length})` },
                  { id: 'honey', label: `Honey Singh (${honeySingh?.songCount || 16})` },
                  { id: 'punjabi', label: 'Punjabi' },
                  { id: 'bollywood', label: 'Bollywood & Sufi' },
                  { id: 'pop', label: 'Global Pop' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setLibraryFilter(pill.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${libraryFilter === pill.id
                        ? 'bg-white text-black'
                        : 'bg-[#232323] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white'
                      }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {filteredLibrarySongs.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Music className="w-10 h-10 text-[#535353] mx-auto" />
                  <p className="text-sm text-[#b3b3b3]">
                    No tracks found matching "{librarySearch}"
                  </p>
                  <button
                    onClick={() => {
                      setLibrarySearch('');
                      setLibraryFilter('all');
                    }}
                    className="text-xs text-[#1ed760] hover:underline font-bold"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-6 sm:col-span-5">Title</div>
                    <div className="hidden sm:block sm:col-span-4">Album</div>
                    <div className="col-span-5 sm:col-span-2 flex items-center justify-end pr-3">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-0.5 mt-2 max-h-[680px] overflow-y-auto pr-1">
                    {filteredLibrarySongs.map((song, i) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => playSong(song, undefined, filteredLibrarySongs)}
                          className={`grid grid-cols-12 gap-4 px-3 sm:px-4 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors group items-center ${isCurrent ? 'bg-white/10' : ''
                            }`}
                        >
                          <div className="col-span-1 flex items-center justify-center text-sm text-[#b3b3b3] tabular-nums">
                            {isCurrent && isPlaying ? (
                              <span className="flex items-end gap-0.5 h-3.5">
                                <span className="w-0.5 bg-[#1ed760] animate-eq-1" />
                                <span className="w-0.5 bg-[#1ed760] animate-eq-2" />
                                <span className="w-0.5 bg-[#1ed760] animate-eq-3" />
                              </span>
                            ) : (
                              <>
                                <span
                                  className={`group-hover:hidden ${isCurrent ? 'text-[#1ed760] font-bold' : ''
                                    }`}
                                >
                                  {i + 1}
                                </span>
                                <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block ml-0.5" />
                              </>
                            )}
                          </div>

                          <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                            <img
                              src={song.coverUrl}
                              alt=""
                              onError={handleTrackImgError}
                              className="w-10 h-10 rounded object-cover shrink-0 shadow-sm bg-[#282828]"
                            />
                            <div className="min-w-0 flex-1">
                              <h4
                                className={`text-sm font-semibold truncate leading-tight ${isCurrent ? 'text-[#1ed760]' : 'text-white'
                                  }`}
                              >
                                {song.title}
                              </h4>
                              <p className="text-xs text-[#b3b3b3] truncate mt-0.5 group-hover:text-white">
                                {song.artist}
                              </p>
                            </div>
                          </div>

                          <div className="hidden sm:block sm:col-span-4 min-w-0">
                            <p className="text-xs text-[#b3b3b3] truncate group-hover:text-white">
                              {song.album || 'Single'}
                            </p>
                          </div>

                          <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3 pr-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(song.id);
                              }}
                              className={`p-1 rounded-full hover:scale-110 active:scale-90 transition-all ${isLiked(song.id)
                                  ? 'opacity-100'
                                  : 'opacity-0 group-hover:opacity-100'
                                }`}
                              title={
                                isLiked(song.id)
                                  ? 'Remove from Liked Songs'
                                  : 'Save to Liked Songs'
                              }
                            >
                              <Heart
                                className={`w-4 h-4 ${isLiked(song.id)
                                    ? 'text-[#1ed760] fill-[#1ed760]'
                                    : 'text-[#b3b3b3] hover:text-white'
                                  }`}
                              />
                            </button>
                            <span className="text-xs text-[#b3b3b3] tabular-nums">
                              {Math.floor(song.durationSec / 60)}:
                              {(song.durationSec % 60).toString().padStart(2, '0')}
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
