import React from 'react';
import { X, Moon, Clock, Check } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimerMinutes, remainingSleepSeconds, startSleepTimer, cancelSleepTimer } = useAudio();

  if (!isOpen) return null;

  const timerOptions = [
    { label: '15 Minutes', minutes: 15 },
    { label: '30 Minutes', minutes: 30 },
    { label: '45 Minutes', minutes: 45 },
    { label: '60 Minutes (1 Hour)', minutes: 60 },
  ];

  const formatRemaining = (seconds: number | null) => {
    if (seconds === null || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 bg-neutral-950/95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sleep Timer</h3>
              <p className="text-xs text-neutral-400">Audio will automatically pause when timer ends</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Indicator */}
        {sleepTimerMinutes !== null && remainingSleepSeconds !== null ? (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-400 animate-spin-slow" />
              <div>
                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Timer Running</span>
                <p className="text-2xl font-mono font-extrabold text-white">
                  {formatRemaining(remainingSleepSeconds)}
                </p>
              </div>
            </div>

            <button
              onClick={cancelSleepTimer}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
            >
              Turn Off
            </button>
          </div>
        ) : (
          <div className="mb-4 text-xs text-neutral-400 text-center">
            Select how long to keep playing music before sleep:
          </div>
        )}

        {/* Timer options list */}
        <div className="space-y-2.5">
          {timerOptions.map((opt) => {
            const isSelected = sleepTimerMinutes === opt.minutes;
            return (
              <button
                key={opt.minutes}
                onClick={() => {
                  startSleepTimer(opt.minutes);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-5 h-5 text-neutral-950" />}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-3 border-t border-white/10 text-center text-[11px] text-neutral-500">
          🌙 Drift to sleep with relaxing ambient beats & rain melodies
        </div>

      </div>
    </div>
  );
};
