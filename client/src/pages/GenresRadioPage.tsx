import React, { useEffect, useState } from 'react';
import { Radio, Play, Pause, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import type { Song, RadioStation } from '../types';

export const GenresRadioPage: React.FC = () => {
  const { isPlaying, playSong, togglePlay } = useAudio();
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data) => setAllSongs(data))
      .catch(console.error);
  }, []);

  const radioStations: RadioStation[] = [
    {
      id: 'haryanvi-hits',
      name: 'Haryanvi Drill & Desi Folk Radio',
      mood: '🌾 Raw Desi Beats, High-Octane Swagger & Folk Anthems',
      description: 'Blockbuster rural rhythms, infectious folk melodies, and heavy desi basslines featuring Renuka Panwar (52 Gaj Ka Daman), Masoom Sharma, and Dhanda Nyoliwala.',
      coverUrl: allSongs.find((s) => s.title.toLowerCase().includes('52 gaj') || s.artist.toLowerCase().includes('renuka'))?.coverUrl || allSongs.find((s) => s.artist.toLowerCase().includes('masoom'))?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-amber-600/40 via-red-600/30 to-black',
      tag: 'Haryanvi Anthems',
      songs: allSongs.filter((s) => (s.genre?.includes('Haryanvi') ?? false) || (s.genre?.includes('Drill') ?? false) || s.artist.toLowerCase().includes('dhanda') || s.artist.toLowerCase().includes('masoom') || s.artist.toLowerCase().includes('renuka') || s.title.toLowerCase().includes('52 gaj')),
    },
    {
      id: 'punjabi-heat',
      name: 'Punjabi Beats & Swagger Radio',
      mood: '🔥 Heavy Bass & Desi Swagger',
      description: 'Hard-hitting 808s, raw Punjabi folk rhythms, and chart-topping anthems from Sidhu, Diljit, and Karan Aujla.',
      coverUrl: allSongs.find((s) => s.genre?.includes('Punjabi'))?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-amber-600/40 via-red-600/30 to-yellow-950/40',
      tag: 'Punjabi',
      songs: allSongs.filter((s) => s.genre?.includes('Punjabi') || s.artist.includes('Moose') || s.artist.includes('Diljit') || s.artist.includes('Aujla')),
    },
    {
      id: 'bollywood-romance',
      name: 'Bollywood Romance & Sufi Melodies',
      mood: '🌧️ Soulful Ghazals & Monsoon Yearning',
      description: 'Lyrical acoustic guitars, emotive violins, and heart-melting playback ballads by Arijit Singh & Atif Aslam.',
      coverUrl: allSongs.find((s) => s.genre?.includes('Bollywood') || s.artist.includes('Arijit'))?.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-rose-600/40 via-purple-600/30 to-slate-950/40',
      tag: 'Bollywood',
      songs: allSongs.filter((s) => s.genre?.includes('Bollywood') || s.genre?.includes('Romantic') || s.artist.includes('Arijit') || s.artist.includes('Atif') || s.artist.includes('KK')),
    },
    {
      id: 'global-pop',
      name: 'Global Chartbusters & Pop Wave',
      mood: '⚡ Neon Energy & Stadium Anthems',
      description: 'Infectious 80s synth hooks, driving pop rhythms, and soaring melodies by The Weeknd, Taylor Swift, and Ed Sheeran.',
      coverUrl: allSongs.find((s) => s.artist.includes('Weeknd') || s.artist.includes('Taylor'))?.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-fuchsia-600/40 via-indigo-600/30 to-neutral-950/40',
      tag: 'Global Pop',
      songs: allSongs.filter((s) => s.genre?.includes('Pop') || s.genre?.includes('Synthwave') || s.artist.includes('Weeknd') || s.artist.includes('Taylor') || s.artist.includes('Sheeran')),
    },
    {
      id: 'lofi-study',
      name: 'Lo-Fi Chill & Study Radio',
      mood: '🌙 Deep Concentration & Relax',
      description: 'Lofi hip hop beats, soft electric piano, and warm analog vinyl crackles for study and work.',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-amber-500/30 via-orange-600/30 to-purple-900/30',
      tag: 'Lo-Fi',
      songs: allSongs.filter((s) => s.genre?.includes('Lo-Fi') || s.genre?.includes('Chill')),
    },
    {
      id: 'synthwave',
      name: '80s Synthwave & Neon Radio',
      mood: '⚡ Retro Energy & Late Night Drives',
      description: 'Pulsing analog synthesizers, retro drum machines, and driving nocturnal basslines.',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-fuchsia-600/30 via-purple-600/30 to-indigo-950/30',
      tag: 'Synthwave',
      songs: allSongs.filter((s) => s.genre?.includes('Synthwave') || s.title.toLowerCase().includes('neon') || s.genre?.includes('Wave')),
    },
    {
      id: 'rain-ambient',
      name: 'Raindrops & Soft Piano Radio',
      mood: '🌧️ Calming Monsoon Solitude',
      description: 'Gently streaming rain sounds layered over tender acoustic piano melodies.',
      coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-blue-600/30 via-cyan-700/30 to-slate-900/30',
      tag: 'Ambient',
      songs: allSongs.filter((s) => s.genre?.includes('Ambient') || s.genre?.includes('Piano') || s.artist.includes('Anuv')),
    },
  ];

  const handleStartStation = (station: RadioStation) => {
    setActiveStationId(station.id);
    const stationSongs = station.songs.length > 0 ? station.songs : allSongs;
    if (stationSongs.length > 0) {
      playSong(stationSongs[0], undefined, stationSongs);
    }
  };

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-600/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">24/7 Live Vibe Streams</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Mood & Genre Radio Stations</h1>
          <p className="text-xs md:text-sm text-neutral-300 mt-1">
            Endless automated sound streams tailored to your current mood & vibe state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-neutral-200 border border-white/10 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Mood Selector Active</span>
          </span>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {radioStations.map((station) => {
          const isActiveStation = activeStationId === station.id;
          const isStationPlaying = isActiveStation && isPlaying;

          return (
            <div
              key={station.id}
              className={`group glass-panel rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isActiveStation
                  ? 'border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                  : 'border-white/10 hover:border-amber-500/40 hover:scale-[1.02]'
              }`}
            >
              {/* Background gradient blur */}
              <div className={`absolute inset-0 bg-gradient-to-br ${station.gradient} opacity-40 pointer-events-none`} />

              <div className="relative z-10">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={station.coverUrl}
                    alt={station.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    {station.tag}
                  </span>

                  <button
                    onClick={() => {
                      if (isActiveStation) togglePlay();
                      else handleStartStation(station);
                    }}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                  >
                    {isStationPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-1 text-xs text-amber-400 font-semibold">
                  <span>{station.mood}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{station.name}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-normal">{station.description}</p>
              </div>

              <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-mono">
                  {station.songs.length || allSongs.length} Tracks in Queue
                </span>

                <button
                  onClick={() => handleStartStation(station)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 transition-all"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Launch Radio</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
