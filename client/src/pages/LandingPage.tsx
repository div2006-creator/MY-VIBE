import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Disc, Heart, Play, Music, MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { Vibe } from '../types';
import { useAudio } from '../context/AudioContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { playVibe } = useAudio();
  const [featuredVibes, setFeaturedVibes] = useState<Vibe[]>([]);

  useEffect(() => {
    fetch('/api/vibes')
      .then((res) => res.json())
      .then((data) => setFeaturedVibes(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch((err) => console.error('Fetch landing vibes error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 selection:bg-amber-500 selection:text-black">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        
        {/* Background Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-8 shadow-xl animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Save the moments. Keep the Vibe.</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight font-serif mb-6 leading-tight">
            Your memories have a <br />
            <span className="text-gradient-amber">soundtrack.</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-300 font-light leading-relaxed mb-10">
            Save the songs, places and stories that made your moments unforgettable.
            Connect music with your journeys, dates, photos, and moods.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/create-vibe"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-neutral-950 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Create Your First Vibe</span>
            </Link>

            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base glass-pill hover:bg-white/10 text-neutral-200 border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Explore Vibes</span>
            </Link>
          </div>

          {/* Cinematic Interactive Soundtrack Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            {featuredVibes.map((vibe, idx) => (
              <div
                key={vibe.id || idx}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/10 relative"
                onClick={() => vibe.songs && vibe.songs.length > 0 && playVibe(vibe)}
              >
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={vibe.coverUrl}
                    alt={vibe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md border border-white/20 text-amber-300">
                    {vibe.mood}
                  </span>

                  <button className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-amber-300/80 mb-2 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{vibe.location}</span>
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{vibe.date}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 font-serif group-hover:text-amber-300 transition-colors">
                    {vibe.title}
                  </h3>

                  <p className="text-xs text-neutral-300 line-clamp-2 italic mb-4">
                    “{vibe.story}”
                  </p>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-white/10">
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      {vibe.songCount || vibe.songs?.length || 0} Songs
                    </span>
                    <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Relive <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Philosophy Section: Music + Memories + Vibes */}
      <section className="py-20 px-4 border-t border-white/10 bg-neutral-950/60">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold font-serif mb-6 text-gradient-amber">
            Every song has a story.
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-300 text-base md:text-lg font-light leading-relaxed mb-12">
            Auralis is not just a streaming app. It is your personal time capsule. Revisit college trips, late night coding sessions, rainy monsoon mornings, and late night beach bonfires with the exact songs that defined them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl text-left border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Disc className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Memory Timeline</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Organize your life into chronological musical chapters grouped by date, place, and emotion.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-left border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Relive Mode</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Press one button to play your memory's soundtrack with an immersive visual journal backdrop.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-left border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Personal & Intimate</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Keep your memories intimate. No noise, no algorithms, just your authentic experiences and music.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto glass-card p-12 rounded-3xl border border-amber-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-extrabold font-serif text-white mb-4">
            Ready to turn your memories into soundtracks?
          </h2>
          <p className="text-neutral-300 text-sm md:text-base mb-8">
            Create your first Vibe today and keep your moments alive forever.
          </p>
          <button
            onClick={() => navigate('/create-vibe')}
            className="px-8 py-4 rounded-full font-bold text-base bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>Create Your Vibe Now</span>
          </button>
        </div>
      </section>

    </div>
  );
};
