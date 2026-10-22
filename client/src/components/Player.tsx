import React, { useState, useEffect } from 'react';
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
  const [tubeActive, setTubeActive] = useState(true);

  // Simulated VU meter & Waveform levels when playing
  const [vuL, setVuL] = useState(65);
  const [vuR, setVuR] = useState(72);
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 24, 18, 32, 16, 28, 14]);

  useEffect(() => {
    if (!isPlaying) {
      setVuL(12);
      setVuR(12);
      setWaveHeights([8, 8, 8, 8, 8, 8, 8]);
      return;
    }
    const interval = setInterval(() => {
      setVuL(Math.floor(50 + Math.random() * 45));
      setVuR(Math.floor(48 + Math.random() * 47));
      setWaveHeights([
        Math.floor(10 + Math.random() * 22),
        Math.floor(16 + Math.random() * 26),
        Math.floor(12 + Math.random() * 24),
        Math.floor(20 + Math.random() * 28),
        Math.floor(14 + Math.random() * 25),
        Math.floor(18 + Math.random() * 26),
        Math.floor(10 + Math.random() * 20),
      ]);
    }, 180);
    return () => clearInterval(interval);
  }, [isPlaying]);

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

      {/* ============================================================== */}
      {/* 📱 MOBILE VIEW: FLOATING OPAQUE PLAYER (EXACT USER WIREFRAME) */}
      {/* ============================================================== */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#161311] border border-[#554339]/80 rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.92)] select-none">
        
        {/* Top Row: Circular Vinyl Cover, Audio Waveforms, Track Info, Controls */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Circular Vinyl Album Art (Drawn as a circle in sketch) */}
          <div
            onClick={togglePlay}
            className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#ecc15a]/60 shadow-lg bg-[#110e0c] cursor-pointer"
          >
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            />
            {/* Center vinyl spindle */}
            <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#110e0c] border border-[#ecc15a]/40 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#ffb68c]" />
            </div>
          </div>

          {/* Center: Track Details & Animated Audio Waveform (as sketched: waveform lines) */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-serif font-bold text-xs text-[#e9e1dd] truncate leading-tight">
              {currentSong.title}
            </h4>
            <p className="font-editorial text-[11px] text-[#a38c80] truncate mt-0.5">
              {currentSong.artist}
            </p>

            {/* Audio Waveform Visualizer (Exact element in user's sketch) */}
            <div className="flex items-center gap-1 h-4 mt-1">
              {waveHeights.map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full transition-all duration-200"
                  style={{
                    height: `${h}px`,
                    backgroundColor: isPlaying
                      ? i % 2 === 0 ? '#ecc15a' : '#d97736'
                      : '#554339',
                  }}
                />
              ))}
              <span className="font-mono-spec text-[8px] text-[#ecc15a] uppercase tracking-wider ml-1">
                {isPlaying ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Right: Playback Controls (Prev, Big Play/Pause, Next) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={prevSong}
              className="p-1 text-[#dbc1b4] hover:text-[#ffb68c] active:scale-95 transition-all"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Circular Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center font-bold shadow-[0_0_16px_rgba(217,119,54,0.4)] active:scale-95 transition-all"
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
              className="p-1 text-[#dbc1b4] hover:text-[#ffb68c] active:scale-95 transition-all"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Full-width Scrubber Slider Bar (as sketched with slider dot) */}
        <div className="mt-2.5 pt-2 border-t border-[#554339]/30 flex items-center gap-2 font-mono-spec text-[10px] text-[#a38c80]">
          <span className="w-9 text-right text-[9px]">{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-[#2d2927] rounded appearance-none cursor-pointer accent-[#d97736]"
            />
          </div>
          <span className="w-9 text-[9px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 💻 DESKTOP VIEW: FULL STITCH AUDIO SANCTUM TURNTABLE DECK       */}
      {/* ============================================================== */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-[#110e0c]/95 backdrop-blur-xl border-t border-[#554339]/50 px-6 py-2.5 shadow-2xl select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Spinning Vinyl Platter, Micro-Grooves & Track Monograph */}
          <div className="flex items-center gap-3.5 w-1/4 min-w-0">
            <div className="relative group flex-shrink-0 cursor-pointer" onClick={togglePlay}>
              <div className="w-13 h-13 rounded bg-[#1e1b19] border border-[#554339]/60 p-0.5 shadow-lg flex items-center justify-center overflow-hidden">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover rounded-sm transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
                />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-[#ffb68c]" />
                  ) : (
                    <Play className="w-5 h-5 text-[#ffb68c] fill-current ml-0.5" />
                  )}
                </div>
              </div>
              {isPlaying && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#110e0c] border border-[#ecc15a] flex items-center justify-center shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ecc15a] animate-pulse" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-serif font-bold text-sm text-[#e9e1dd] truncate hover:text-[#ffb68c] transition-colors leading-tight">
                {currentSong.title}
              </h4>
              <p className="font-editorial text-xs text-[#a38c80] truncate mt-0.5">
                {currentSong.artist} {currentSong.album ? `• ${currentSong.album}` : ''}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono-spec text-[9px] px-1.5 py-0.2 rounded bg-[#82977f]/20 border border-[#82977f]/40 text-[#b7cdb2] uppercase">
                  MONO 33⅓
                </span>
                <span className="font-mono-spec text-[9px] text-[#ecc15a] uppercase font-bold tracking-wider">
                  TUBE CUT
                </span>
                {activeVibe && (
                  <span className="font-mono-spec text-[9px] text-[#ffb68c] truncate max-w-[100px]">
                    📍 {activeVibe.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Controls & Precision Space Mono Timeline */}
          <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded transition-all ${
                  isShuffle ? 'text-[#ffb68c] bg-[#d97736]/20' : 'text-[#a38c80] hover:text-[#e9e1dd]'
                }`}
                title="Shuffle Vinyl Tracks"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={prevSong}
                className="text-[#dbc1b4] hover:text-[#ffb68c] transition-colors"
                title="Previous Cut"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Primary Play/Pause: Terracotta Button with Warm Filament Amber Glow */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#d97736] text-[#221f1d] flex items-center justify-center shadow-[0_0_20px_rgba(217,119,54,0.4)] hover:scale-105 active:scale-95 transition-all font-bold"
                title={isPlaying ? 'Pause Stylus' : 'Drop Needle'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="text-[#dbc1b4] hover:text-[#ffb68c] transition-colors"
                title="Next Cut"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded transition-all relative ${
                  isRepeat !== 'off' ? 'text-[#ffb68c] bg-[#d97736]/20' : 'text-[#a38c80] hover:text-[#e9e1dd]'
                }`}
                title={`Repeat (${isRepeat})`}
              >
                <Repeat className="w-3.5 h-3.5" />
                {isRepeat === 'one' && (
                  <span className="absolute -top-1 -right-1 font-mono-spec text-[8px] font-bold text-[#ecc15a]">1</span>
                )}
              </button>
            </div>

            {/* Precision Time Scrubber */}
            <div className="flex items-center gap-3 w-full font-mono-spec text-[11px] text-[#a38c80]">
              <span className="w-11 text-right">{formatTime(currentTime)}</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 bg-[#2d2927] rounded appearance-none cursor-pointer accent-[#d97736] hover:accent-[#ffb68c]"
                />
              </div>
              <span className="w-11">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Dual VU Meter Bars, Tube Saturation Toggle, Lyrics, Equalizer, Relive */}
          <div className="flex items-center justify-end gap-3 w-1/4">
            
            {/* Dual Stereo VU Meter Simulation (L/R) */}
            <div className="flex flex-col items-center pr-3 border-r border-[#554339]/40">
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 rounded-xs bg-[#ecc15a]/80" style={{ height: `${Math.max(6, vuL * 0.16)}px` }} />
                <div className="w-1 h-4 rounded-xs bg-[#ecc15a]" style={{ height: `${Math.max(8, vuL * 0.2)}px` }} />
                <div className="w-1 h-2 rounded-xs bg-[#d97736]" style={{ height: `${Math.max(4, vuR * 0.14)}px` }} />
                <div className="w-1 h-5 rounded-xs bg-[#d97736]" style={{ height: `${Math.max(10, vuR * 0.24)}px` }} />
                <div className="w-1 h-3 rounded-xs bg-[#ecc15a]/70" style={{ height: `${Math.max(6, vuR * 0.18)}px` }} />
              </div>
              <span className="font-mono-spec text-[8px] text-[#a38c80] uppercase mt-0.5">VU L/R</span>
            </div>

            {/* +3dB TUBE Button */}
            <button
              onClick={() => setTubeActive(!tubeActive)}
              className={`px-2 py-0.5 rounded border font-mono-spec text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all ${
                tubeActive
                  ? 'border-[#ecc15a]/60 bg-[#1e1b19] text-[#ecc15a] shadow-[0_0_8px_rgba(236,193,90,0.25)]'
                  : 'border-[#554339]/40 text-[#a38c80]'
              }`}
              title="Class-A Valve Output Stage"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tubeActive ? 'bg-[#ecc15a] animate-ping' : 'bg-[#554339]'}`} />
              <span>+3dB TUBE</span>
            </button>

            {/* Lyrics Button */}
            <button
              onClick={toggleLyrics}
              className="p-1.5 rounded text-[#a38c80] hover:text-[#ffb68c] transition-colors"
              title="Liner Notes & Lyrics"
            >
              <Mic2 className="w-3.5 h-3.5" />
            </button>

            {/* Equalizer Rotary Button */}
            <button
              onClick={toggleEqualizer}
              className="p-1.5 rounded text-[#a38c80] hover:text-[#ecc15a] transition-colors"
              title="Acoustic EQ & Tone"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Sleep Timer */}
            <button
              onClick={() => setIsSleepOpen(true)}
              className={`p-1.5 rounded transition-colors relative ${
                remainingSleepSeconds !== null ? 'text-[#ffb68c] bg-[#d97736]/20' : 'text-[#a38c80] hover:text-[#e9e1dd]'
              }`}
              title="Lights Out Sleep Timer"
            >
              <Moon className="w-3.5 h-3.5" />
              {remainingSleepSeconds !== null && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#ffb68c] animate-ping" />
              )}
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-1.5 rounded transition-colors ${
                isQueueOpen ? 'text-[#ecc15a] bg-[#1e1b19]' : 'text-[#a38c80] hover:text-[#e9e1dd]'
              }`}
              title="Vinyl Crate Queue"
            >
              <ListMusic className="w-3.5 h-3.5" />
            </button>

            {/* Relive Vibe Button */}
            <button
              onClick={() => openReliveModal(activeVibe || undefined)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e1b19] border border-[#ecc15a]/40 text-[#ecc15a] font-mono-spec text-[10px] font-bold hover:bg-[#282422] transition-all"
              title="Relive Sonic Memory"
            >
              <Sparkles className="w-3 h-3 text-[#ecc15a] animate-pulse" />
              <span>RELIVE</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#554339]/40">
              <button onClick={handleMute} className="text-[#a38c80] hover:text-[#ffb68c]">
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-[#ffb4ab]" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-14 h-1 bg-[#2d2927] rounded appearance-none cursor-pointer accent-[#ecc15a]"
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
