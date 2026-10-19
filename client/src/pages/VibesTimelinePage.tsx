import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Music, Plus, Clock } from 'lucide-react';
import type { Vibe } from '../types';
import { useAudio } from '../context/AudioContext';

export const VibesTimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { playVibe } = useAudio();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vibes')
      .then((res) => res.json())
      .then((data) => setVibes(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group Vibes by Year and Month from date string or createdAt
  const groupedVibes = vibes.reduce((acc: Record<string, Record<string, Vibe[]>>, vibe) => {
    let year = '2026';
    let month = 'AUGUST';

    if (vibe.date) {
      const parts = vibe.date.split(' ');
      if (parts.length >= 3) {
        year = parts[parts.length - 1];
        month = parts[parts.length - 2].toUpperCase();
      } else if (parts.length === 2) {
        month = parts[0].toUpperCase();
        year = parts[1];
      }
    }

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(vibe);
    return acc;
  }, {});

  const years = Object.keys(groupedVibes).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 pb-32 px-4 lg:px-8 pt-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-widest mb-1">
              <Clock className="w-4 h-4" />
              <span>Personal Timeline</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-white">
              My Vibes & Memories
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Scroll through your life's soundtracks chronologically.
            </p>
          </div>

          <button
            onClick={() => navigate('/create-vibe')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-lg hover:scale-105 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Vibe</span>
          </button>
        </div>

        {/* Timeline Visual Feed */}
        {years.length === 0 && !loading ? (
          <div className="glass-card p-12 rounded-3xl text-center border border-white/10 my-8">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold font-serif text-white mb-2">No Vibes created yet</h3>
            <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">
              Start building your personal soundtrack memory journal. Record your trips, special days, and everyday moments.
            </p>
            <button
              onClick={() => navigate('/create-vibe')}
              className="px-6 py-3 rounded-full font-bold bg-amber-500 text-neutral-950 shadow-md hover:scale-105 transition-all"
            >
              Create Your First Vibe
            </button>
          </div>
        ) : (
          <div className="relative space-y-16">
            
            {/* Timeline Vertical Line */}
            <div className="absolute top-4 bottom-4 left-4 md:left-32 w-0.5 bg-gradient-to-b from-amber-500 via-rose-500 to-indigo-600 opacity-30 pointer-events-none" />

            {years.map((year) => (
              <div key={year} className="space-y-10 relative">
                
                {/* Year Header Marker */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-xl relative z-10">
                    <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center font-extrabold text-xs md:text-lg text-amber-300">
                      {year}
                    </div>
                  </div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                </div>

                {/* Months */}
                {Object.keys(groupedVibes[year]).map((month) => (
                  <div key={month} className="space-y-6 relative pl-10 md:pl-36">
                    
                    {/* Month Label */}
                    <div className="text-xs uppercase tracking-widest font-extrabold text-amber-400/90 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{month}</span>
                    </div>

                    {/* Vibe Cards in Month */}
                    <div className="space-y-6">
                      {groupedVibes[year][month].map((vibe) => (
                        <div
                          key={vibe.id}
                          onClick={() => navigate(`/vibe/${vibe.id}`)}
                          className="glass-card rounded-2xl p-5 md:p-6 border border-white/10 group cursor-pointer hover:border-amber-500/40 transition-all relative overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                              <img
                                src={vibe.coverUrl}
                                alt={vibe.title}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover shadow-xl border border-white/10 group-hover:scale-105 transition-transform"
                              />

                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                                    {vibe.mood}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                    {vibe.location}
                                  </span>
                                </div>

                                <h3 className="text-xl md:text-2xl font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                                  🎵 {vibe.title}
                                </h3>

                                <p className="text-xs md:text-sm text-neutral-300 italic line-clamp-2 max-w-xl">
                                  “{vibe.story}”
                                </p>

                                <div className="flex items-center gap-3 text-xs text-neutral-400 pt-1">
                                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                                    <Music className="w-3.5 h-3.5" />
                                    {vibe.songCount || vibe.songs?.length || 0} Songs
                                  </span>
                                  <span>•</span>
                                  <span>📅 {vibe.date}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (vibe.songs && vibe.songs.length > 0) {
                                  playVibe(vibe);
                                } else {
                                  navigate(`/vibe/${vibe.id}`);
                                }
                              }}
                              className="px-5 py-3 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all self-start md:self-auto"
                            >
                              <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
                              <span>RELIVE VIBE</span>
                            </button>

                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};
