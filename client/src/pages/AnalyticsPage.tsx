import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, Sparkles, Heart, Flame, Disc, Music, Trophy, Share2, Calendar } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import type { AnalyticsData } from '../types';

export const AnalyticsPage: React.FC = () => {
  const { playSong } = useAudio();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const token = localStorage.getItem('vibe_token');
    try {
      const res = await fetch('/api/analytics', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <BarChart3 className="w-10 h-10 text-amber-400 animate-bounce" />
        <p className="text-sm font-medium text-neutral-400">Analyzing Your Vibe Insights...</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">
      
      {/* Page Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-600/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">Your Audio Memory Insights</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">VIBE Analytics & Wrapped</h1>
          <p className="text-xs md:text-sm text-neutral-300 mt-1">
            Deep dive into your musical moods, top tracks, and listening habits.
          </p>
        </div>

        <button
          onClick={() => alert('Vibe Summary saved! Share with your friends on Instagram or Twitter ✨')}
          className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-lg hover:scale-105 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Vibe Wrapped</span>
        </button>
      </div>

      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 bg-white/5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Minutes Listened</p>
            <h3 className="text-2xl font-extrabold text-white font-mono">{analytics.stats.totalMinutesPlayed} m</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 bg-white/5">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Top Vibe Mood</p>
            <h3 className="text-base font-bold text-amber-300 truncate max-w-[140px]">{analytics.stats.topVibeMood}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 bg-white/5">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Vibe Streak</p>
            <h3 className="text-2xl font-extrabold text-white font-mono">{analytics.stats.vibeStreakDays} Days</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 bg-white/5">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium">Liked Songs</p>
            <h3 className="text-2xl font-extrabold text-white font-mono">{analytics.stats.likedCount}</h3>
          </div>
        </div>

      </div>

      {/* Main Analytics Content: Top Songs & Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 5 Songs List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" />
            <span>Most Played Songs</span>
          </h3>

          <div className="space-y-3">
            {analytics.topSongs.map((song, i) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-mono font-bold text-neutral-500">#{i + 1}</span>
                  <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {song.playCount} plays
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists & Weekly Listening chart */}
        <div className="space-y-6">
          
          {/* Top Artists Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Disc className="w-4 h-4 text-rose-400" />
              <span>Favorite Artists</span>
            </h3>

            <div className="space-y-3">
              {analytics.topArtists.map((art, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-400">#{idx + 1}</span>
                    <span className="text-xs font-bold text-white">{art.artistName}</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">{art.count} streams</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Hours Graph */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Weekly Activity (Hours)</span>
            </h3>

            <div className="flex items-end justify-between h-36 pt-4 px-2">
              {analytics.weeklyListeningHours.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    style={{ height: `${(item.hours / 6) * 100}%` }}
                    className="w-full max-w-[20px] bg-gradient-to-t from-amber-500 to-rose-500 rounded-t-md hover:scale-105 transition-transform"
                    title={`${item.hours} hrs on ${item.day}`}
                  />
                  <span className="text-[10px] font-mono text-neutral-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
