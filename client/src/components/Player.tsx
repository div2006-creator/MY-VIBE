import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, ListMusic, Sparkles, Mic2, Sliders, Moon } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { QueueDrawer } from './QueueDrawer';
import { LyricsModal } from './LyricsModal';
import { EqualizerModal } from './EqualizerModal';
import { SleepTimerModal } from './SleepTimerModal';

export const Player: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    isRepeat,
    activeVibe,
    remainingSleepSeconds,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    openReliveModal,
    toggleLyrics,
    toggleEqualizer,
  } = useAudio();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(0.8);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSleepOpen, setIsSleepOpen] = useState(false);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMute = () => {
    if (isMuted) {
      setVolume(prevVol);
      setIsMuted(false);
    } else {
      setPrevVol(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Drawers and Modals */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      <LyricsModal />
      <EqualizerModal />
      <SleepTimerModal isOpen={isSleepOpen} onClose={() => setIsSleepOpen(false)} />

      {/* Main Persistent Bottom Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-4 py-3 bg-neutral-950/90 backdrop-blur-xl shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Artwork, Track Title, Artist, Vibe Pill */}
          <div className="flex items-center gap-3.5 w-full md:w-1/4 min-w-0">
            <div className="relative group flex-shrink-0">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className={`w-12 h-12 rounded-xl object-cover shadow-lg border border-white/10 ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                <button onClick={togglePlay} className="text-white">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-neutral-100 truncate hover:text-amber-300 transition-colors">
                {currentSong.title}
              </h4>
              <p className="text-xs text-neutral-400 truncate">{currentSong.artist}</p>
              {activeVibe && (
                <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate">
                  📍 {activeVibe.title}
                </span>
              )}
            </div>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-full transition-colors ${
                  isShuffle ? 'text-amber-400 bg-amber-500/15' : 'text-neutral-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevSong}
                className="text-neutral-300 hover:text-white transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center text-neutral-950 font-bold hover:scale-105 shadow-md shadow-amber-500/20 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={nextSong}
                className="text-neutral-300 hover:text-white transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-full transition-colors relative ${
                  isRepeat !== 'off' ? 'text-amber-400 bg-amber-500/15' : 'text-neutral-400 hover:text-white'
                }`}
                title={`Repeat (${isRepeat})`}
              >
                <Repeat className="w-4 h-4" />
                {isRepeat === 'one' && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold text-amber-400">1</span>
                )}
              </button>
            </div>

            {/* Time Scrubber */}
            <div className="flex items-center gap-3 w-full text-xs font-mono text-neutral-400">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-rose-500"
              />
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Sound FX, Lyrics, Sleep, Relive, Volume */}
          <div className="hidden md:flex items-center justify-end gap-2.5 w-1/4">
            
            {/* Lyrics Button */}
            <button
              onClick={toggleLyrics}
              className="p-2 rounded-full text-neutral-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
              title="Lyrics & Karaoke"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            {/* Equalizer Button */}
            <button
              onClick={toggleEqualizer}
              className="p-2 rounded-full text-neutral-400 hover:text-rose-300 hover:bg-white/10 transition-colors"
              title="Audio Equalizer"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Sleep Timer Button */}
            <button
              onClick={() => setIsSleepOpen(true)}
              className={`p-2 rounded-full transition-colors relative ${
                remainingSleepSeconds !== null ? 'text-indigo-400 bg-indigo-500/20' : 'text-neutral-400 hover:text-white'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
              {remainingSleepSeconds !== null && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              )}
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-full transition-colors ${
                isQueueOpen ? 'text-amber-400 bg-white/10' : 'text-neutral-400 hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Relive Vibe Button */}
            <button
              onClick={() => openReliveModal(activeVibe || undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>RELIVE</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
              <button onClick={handleMute} className="text-neutral-400 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
