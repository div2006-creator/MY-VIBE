import React from 'react';
import { X, ListMusic, Trash2, Play, Disc } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const { queue, currentIndex, currentSong, playSong, removeFromQueue, clearQueue, isPlaying } = useAudio();

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-950/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col animate-slide-left">
      
      {/* Drawer Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Playback Queue</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {queue.length} Tracks
              </span>
            </h3>
            <p className="text-xs text-neutral-400">Up next in your music stream</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Now Playing Section */}
        {currentSong && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Disc className="w-4 h-4 animate-spin-slow" />
              <span>Now Playing</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-600/20 border border-amber-500/30 flex items-center gap-3.5 shadow-lg">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className={`w-14 h-14 rounded-xl object-cover border border-amber-400/40 shadow-md ${isPlaying ? 'animate-pulse' : ''}`}
              />
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-sm text-white truncate">{currentSong.title}</h5>
                <p className="text-xs text-neutral-300 truncate">{currentSong.artist}</p>
                <p className="text-[10px] text-amber-300 font-mono mt-0.5">{currentSong.genre || 'Vibe Single'}</p>
              </div>
              <span className="text-xs font-mono text-neutral-400">{formatTime(currentSong.durationSec)}</span>
            </div>
          </div>
        )}

        {/* Next Up Section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Up Next ({Math.max(0, queue.length - (currentIndex + 1))})
          </h4>

          {queue.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-neutral-400 text-xs">
              Your queue is currently empty. Explore songs or playlists to add tracks!
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((song, idx) => {
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200'
                    }`}
                  >
                    <div
                      onClick={() => playSong(song, undefined, queue)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={song.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-amber-300 font-bold' : ''}`}>
                          {song.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-neutral-400">{formatTime(song.durationSec)}</span>
                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-all"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-white/10 bg-black/40 text-center text-[11px] text-neutral-500">
        ✨ Autoplay next tracks seamlessly with crossfade
      </div>
    </div>
  );
};
