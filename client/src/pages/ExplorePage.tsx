import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, MapPin, Calendar, Music, Play, Flame, Moon, Car, CloudRain, Sun, GraduationCap } from 'lucide-react';
import type { ExploreCategory } from '../types';
import { useAudio } from '../context/AudioContext';

const CATEGORY_ICONS: Record<string, any> = {
  'trending': Flame,
  'late-night': Moon,
  'road-trips': Car,
  'college': GraduationCap,
  'rainy': CloudRain,
  'summer': Sun,
};

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { playVibe } = useAudio();
  const [categories, setCategories] = useState<ExploreCategory[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    fetch('/api/vibes/explore')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const tags = [
    { id: 'all', name: 'All Experiences' },
    { id: 'trending', name: '🔥 Trending' },
    { id: 'late-night', name: '🌙 Late Night' },
    { id: 'road-trips', name: '🚗 Road Trips' },
    { id: 'college', name: '🎓 College' },
    { id: 'rainy', name: '🌧️ Rainy Days' },
    { id: 'summer', name: '☀️ Summer' },
  ];

  const displayedCategories = selectedTag === 'all'
    ? categories
    : categories.filter((c) => c.id === selectedTag);

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 pb-32 px-4 lg:px-8 pt-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-widest">
            <Compass className="w-4 h-4" />
            <span>Discover Experience Collections</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-white">
            Explore Vibes
          </h1>
          <p className="text-neutral-400 text-sm max-w-lg">
            Discover memory soundtracks created around journeys, moods, late nights, and adventures.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag.id
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-md font-bold'
                  : 'glass-pill text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="space-y-12">
          {displayedCategories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Sparkles;
            return (
              <section key={cat.id} className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
                  <Icon className="w-5 h-5 text-amber-400" />
                  <span>{cat.name}</span>
                </h2>

                {cat.vibes.length === 0 ? (
                  <p className="text-xs text-neutral-500">No Vibes in this category yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cat.vibes.map((vibe) => (
                      <div
                        key={vibe.id}
                        onClick={() => navigate(`/vibe/${vibe.id}`)}
                        className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-amber-500/30 transition-all relative flex flex-col"
                      >
                        <div className="h-44 relative overflow-hidden">
                          <img
                            src={vibe.coverUrl}
                            alt={vibe.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-white/20">
                            {vibe.mood}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (vibe.songs && vibe.songs.length > 0) {
                                playVibe(vibe);
                              } else {
                                navigate(`/vibe/${vibe.id}`);
                              }
                            }}
                            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                          >
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </button>
                        </div>

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                              <MapPin className="w-3 h-3 text-rose-400" />
                              <span>{vibe.location}</span>
                              <span>•</span>
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              <span>{vibe.date}</span>
                            </div>

                            <h3 className="font-bold text-lg text-white font-serif group-hover:text-amber-300 transition-colors">
                              {vibe.title}
                            </h3>

                            <p className="text-xs text-neutral-300 italic line-clamp-2 mt-1">
                              “{vibe.story}”
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                            <span className="flex items-center gap-1 text-amber-400">
                              <Music className="w-3 h-3" />
                              {vibe.songCount || vibe.songs?.length || 0} Songs
                            </span>
                            {vibe.user && <span>by {vibe.user.name.split(' ')[0]}</span>}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

      </div>
    </div>
  );
};
