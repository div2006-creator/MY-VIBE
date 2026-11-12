import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  ListMusic,
  Sparkles,
  Mic2,
  Sliders,
  Moon,
  Heart,
} from 'lucide-react';
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
    toggleLike,
    isLiked,
  } = useAudio();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(0.8);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSleepOpen, setIsSleepOpen] = useState(false);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMute = () => {
    if (isMuted) {
      setVolume(prevVol || 0.8);
      setIsMuted(false);
    } else {
      setPrevVol(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const volPct = Math.min(100, Math.max(0, volume * 100));
  const liked = isLiked(currentSong.id);

  return (
    <>
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      <LyricsModal />
      <EqualizerModal />
      <SleepTimerModal isOpen={isSleepOpen} onClose={() => setIsSleepOpen(false)} />

      {/* ============================================================== */}
      {/* 📱 MOBILE VIEW: SLEEK FLOATING MINI-PLAYER                     */}
      {/* ============================================================== */}
      <div className="md:hidden fixed bottom-2.5 left-2.5 right-2.5 z-50 bg-[#181818]/95 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] select-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-11 h-11 rounded-md object-cover shrink-0 shadow-md"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-white truncate leading-tight">
                {currentSong.title}
              </h4>
              <p className="text-[11px] text-[#b3b3b3] truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggleLike(currentSong.id)}
              className="p-2 active:scale-90 transition-transform"
              title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  liked ? 'text-[#1ed760] fill-[#1ed760]' : 'text-[#b3b3b3]'
                }`}
              />
            </button>
            <button
              onClick={prevSong}
              className="p-1.5 text-[#b3b3b3] hover:text-white active:scale-95"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={nextSong}
              className="p-1.5 text-[#b3b3b3] hover:text-white active:scale-95"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Thin Mobile Progress Bar */}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-[#a7a7a7] tabular-nums">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1ed760] rounded-full"
              style={{ width: `${progressPct}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 💻 DESKTOP VIEW: STREAMING PLAYBACK BAR                        */}
      {/* ============================================================== */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 h-[84px] bg-black border-t border-white/[0.06] px-4 items-center justify-between gap-4 select-none">
        {/* Left: Track Artwork, Metadata & Like Button */}
        <div className="flex items-center gap-3.5 w-[30%] min-w-0">
          <div className="relative group shrink-0 cursor-pointer" onClick={togglePlay}>
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-14 h-14 rounded-md object-cover shadow-lg bg-[#282828]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-white truncate hover:underline leading-snug">
              {currentSong.title}
            </h4>
            <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
              {currentSong.artist}
              {activeVibe ? ` • 📍 ${activeVibe.title}` : ''}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentSong.id)}
            className="p-2 rounded-full hover:scale-110 active:scale-90 transition-all shrink-0 cursor-pointer"
            title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked
                  ? 'text-[#1ed760] fill-[#1ed760]'
                  : 'text-[#b3b3b3] hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center justify-center gap-1.5 w-[40%] max-w-[620px]">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`relative p-1 transition-colors cursor-pointer ${
                isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Enable shuffle"
            >
              <Shuffle className="w-4 h-4" />
              {isShuffle && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1ed760]" />
              )}
            </button>

            <button
              onClick={prevSong}
              className="text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextSong}
              className="text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`relative p-1 transition-colors cursor-pointer ${
                isRepeat !== 'off' ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={`Repeat (${isRepeat})`}
            >
              <Repeat className="w-4 h-4" />
              {isRepeat !== 'off' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1ed760]" />
              )}
              {isRepeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold text-[#1ed760]">
                  1
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full text-[11px] text-[#a7a7a7] tabular-nums">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1 bg-white/20 rounded-full group cursor-pointer flex items-center">
              <div
                className="h-full bg-white group-hover:bg-[#1ed760] rounded-full transition-colors relative"
                style={{ width: `${progressPct}%` }}
              >
                <span className="w-3 h-3 rounded-full bg-white shadow-md absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-3 -top-1 opacity-0 cursor-pointer"
              />
            </div>
            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Lyrics, EQ, Sleep, Queue, Relive & Volume */}
        <div className="flex items-center justify-end gap-2.5 w-[30%]">
          <button
            onClick={() => openReliveModal(activeVibe || undefined)}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#1ed760] text-[11px] font-semibold transition-all cursor-pointer"
            title="Relive Memory"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Relive</span>
          </button>

          <button
            onClick={toggleLyrics}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
            title="Lyrics"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          <button
            onClick={toggleEqualizer}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
            title="Audio Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSleepOpen(true)}
            className={`relative p-1.5 transition-colors cursor-pointer ${
              remainingSleepSeconds !== null
                ? 'text-[#1ed760]'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Sleep Timer"
          >
            <Moon className="w-4 h-4" />
            {remainingSleepSeconds !== null && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#1ed760]" />
            )}
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 transition-colors cursor-pointer ${
              isQueueOpen ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 pl-1">
            <button
              onClick={handleMute}
              className="text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
              title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-[#b3b3b3]" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="relative w-24 h-1 bg-white/20 rounded-full group cursor-pointer flex items-center">
              <div
                className="h-full bg-white group-hover:bg-[#1ed760] rounded-full transition-colors relative"
                style={{ width: `${volPct}%` }}
              >
                <span className="w-3 h-3 rounded-full bg-white shadow-md absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (val > 0 && isMuted) setIsMuted(false);
                }}
                className="absolute inset-0 w-full h-3 -top-1 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
