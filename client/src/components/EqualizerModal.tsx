import React, { useState, useEffect, useRef } from 'react';
import { X, Sliders, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const PRESETS: Record<string, number[]> = {
  'Balanced Ambient': [0, 2, 0, 1, 0],
  'Bass Boost 🚀': [8, 6, 2, 0, 1],
  'Acoustic Clarity 🎸': [1, 3, 5, 4, 3],
  'Synth Glow ⚡': [6, 4, 1, 5, 7],
  'Vocal Warmth 🎙️': [-1, 2, 6, 4, 2],
  'Lo-Fi Vintage 📻': [4, 5, 0, -2, -4],
};

const BANDS = [
  { freq: '60 Hz', label: 'Sub Bass' },
  { freq: '230 Hz', label: 'Bass' },
  { freq: '910 Hz', label: 'Mids' },
  { freq: '3.6 kHz', label: 'Presence' },
  { freq: '14 kHz', label: 'Treble' },
];

export const EqualizerModal: React.FC = () => {
  const { isEqualizerOpen, toggleEqualizer, eqPreset, setEqPreset, isPlaying } = useAudio();
  const [bandValues, setBandValues] = useState<number[]>(PRESETS['Balanced Ambient']);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (PRESETS[eqPreset]) {
      setBandValues([...PRESETS[eqPreset]]);
    }
  }, [eqPreset]);

  // Live Canvas Audio Spectrum Animation
  useEffect(() => {
    if (!isEqualizerOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      const numBars = 32;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        const factor = Math.sin(phase + i * 0.2) * 0.5 + 0.5;
        const val = isPlaying ? factor * (height * 0.7) + 10 : 8;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#f43f5e');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + 2), height - val, barWidth, val);
      }

      phase += isPlaying ? 0.08 : 0.01;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEqualizerOpen, isPlaying]);

  if (!isEqualizerOpen) return null;

  const handleBandChange = (index: number, val: number) => {
    const updated = [...bandValues];
    updated[index] = val;
    setBandValues(updated);
    setEqPreset('Custom');
  };

  const handleSelectPreset = (pName: string) => {
    setEqPreset(pName);
    if (PRESETS[pName]) {
      setBandValues([...PRESETS[pName]]);
    }
  };

  const resetEQ = () => {
    handleSelectPreset('Balanced Ambient');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 bg-neutral-950/95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Audio Equalizer & Sound FX</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-neutral-400">Tailor sound frequencies & studio dynamics</p>
            </div>
          </div>

          <button
            onClick={toggleEqualizer}
            className="p-2 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Spectrum Visualizer Canvas */}
        <div className="relative mb-6 rounded-2xl p-3 bg-black/60 border border-white/10 overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] text-neutral-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium text-amber-300">
              <Volume2 className="w-3.5 h-3.5" /> Real-time Audio Spectrum
            </span>
            <span className="text-[10px] text-neutral-500">{isPlaying ? 'DSP Active' : 'Standby'}</span>
          </div>
          <canvas ref={canvasRef} width={480} height={70} className="w-full h-16 rounded" />
        </div>

        {/* Presets Pills */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300">Studio Presets</span>
            <button
              onClick={resetEQ}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((pName) => {
              const active = eqPreset === pName;
              return (
                <button
                  key={pName}
                  onClick={() => handleSelectPreset(pName)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                  }`}
                >
                  {pName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-5 gap-3 py-4 bg-white/5 rounded-2xl border border-white/10 px-4">
          {BANDS.map((band, idx) => (
            <div key={band.freq} className="flex flex-col items-center gap-3">
              <span className="text-xs font-mono text-amber-400 font-bold">
                {bandValues[idx] > 0 ? `+${bandValues[idx]}` : bandValues[idx]}dB
              </span>

              <div className="h-36 flex items-center justify-center">
                <input
                  type="range"
                  min={-10}
                  max={12}
                  step={1}
                  value={bandValues[idx]}
                  onChange={(e) => handleBandChange(idx, Number(e.target.value))}
                  className="h-32 appearance-none bg-neutral-800 rounded-lg cursor-pointer accent-amber-400 hover:accent-rose-400 [writing-mode:vertical-lr] [direction:rtl]"
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold text-neutral-200">{band.freq}</p>
                <p className="text-[9px] text-neutral-400">{band.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Info */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Active Mode: <strong className="text-amber-300">{eqPreset}</strong></span>
          <span>Web Audio DSP Engine</span>
        </div>

      </div>
    </div>
  );
};
