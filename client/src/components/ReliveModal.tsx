import React from 'react';
import { X, Play, Pause, SkipBack, SkipForward, MapPin, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';

export const ReliveModal: React.FC = () => {
  const {
    isReliveModalOpen,
    closeReliveModal,
    activeVibe,
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    currentTime,
    duration,
    seek,
  } = useAudio();

  if (!isReliveModalOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#f43f5e', '#a855f7', '#3b82f6', '#fbbf24']
    });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      
      {/* Dynamic Ambient Background Cover Glow */}
      <div className="absolute inset-0 overflow-hidden opacity-35 pointer-events-none">
        <img
          src={activeVibe?.coverUrl || currentSong?.coverUrl}
          alt=""
          className="w-full h-full object-cover blur-3xl scale-125 animate-pulse-glow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Close & Header Actions */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={triggerConfetti}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Celebrate Vibe</span>
        </button>

        <button
          onClick={closeReliveModal}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white backdrop-blur-md transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Relive Stage Content */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center text-center">
        
        {/* Vibe Memory Badge */}
        {activeVibe && (
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-amber-200 backdrop-blur-md mb-6 shadow-lg">
            <span className="text-base">{activeVibe.mood}</span>
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {activeVibe.location}
            </span>
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {activeVibe.date}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif text-white mb-4 drop-shadow-md">
          {activeVibe ? activeVibe.title : 'Reliving Soundtrack'}
        </h1>

        {/* Story Quote Card */}
        {activeVibe?.story && (
          <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl glass-card text-amber-100/90 text-sm md:text-base leading-relaxed italic border border-white/15 shadow-2xl relative">
            <span className="text-3xl text-amber-500/50 absolute top-2 left-4 font-serif">“</span>
            <p className="px-4">{activeVibe.story}</p>
            <span className="text-3xl text-amber-500/50 absolute bottom-1 right-4 font-serif">”</span>
          </div>
        )}

        {/* Center Vinyl & Cover Art Visualizer */}
        <div className="relative my-6 flex items-center justify-center group">
          {/* Vinyl Disc Backdrop */}
          <div
            className={`w-64 h-64 md:w-80 md:h-80 rounded-full bg-neutral-900 border-4 border-neutral-800 shadow-2xl flex items-center justify-center transition-transform duration-700 ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
            style={{ animationDuration: '12s' }}
          >
            <div className="w-24 h-24 rounded-full border-8 border-neutral-950 bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-black" />
            </div>
          </div>

          {/* Album Cover Overlap */}
          <img
            src={currentSong?.coverUrl || activeVibe?.coverUrl}
            alt={currentSong?.title}
            className="absolute w-44 h-44 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-all duration-300"
          />
        </div>

        {/* Active Song Meta */}
        <div className="mt-4 mb-6">
          <h3 className="text-2xl font-bold text-white tracking-wide">{currentSong?.title}</h3>
          <p className="text-sm font-medium text-amber-300/90 mt-1">{currentSong?.artist}</p>
        </div>

        {/* Scrubber Bar */}
        <div className="w-full max-w-lg mb-8">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-rose-400"
          />
          <div className="flex justify-between text-xs font-mono text-neutral-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Big Control Player Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={prevSong}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="p-6 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-neutral-950 font-bold shadow-xl shadow-amber-500/30 hover:scale-110 transition-all"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>

          <button
            onClick={nextSong}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

      </div>
    </div>
  );
};
