import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Song, Vibe } from '../types';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: 'off' | 'all' | 'one';
  activeVibe: Vibe | null;
  isReliveModalOpen: boolean;
  isLyricsOpen: boolean;
  isEqualizerOpen: boolean;
  eqPreset: string;
  sleepTimerMinutes: number | null;
  remainingSleepSeconds: number | null;
  playSong: (song: Song, vibe?: Vibe, playlist?: Song[]) => void;
  playVibe: (vibe: Vibe, startSongIndex?: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  openReliveModal: (vibe?: Vibe) => void;
  closeReliveModal: () => void;
  toggleLyrics: () => void;
  toggleEqualizer: () => void;
  setEqPreset: (preset: string) => void;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [activeVibe, setActiveVibe] = useState<Vibe | null>(null);
  const [isReliveModalOpen, setIsReliveModalOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [eqPreset, setEqPresetState] = useState('Balanced Ambient');

  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [remainingSleepSeconds, setRemainingSleepSeconds] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration || 0);
    });

    audio.addEventListener('ended', () => {
      handleSongEnded();
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSongEnded = () => {
    if (isRepeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextSong();
    }
  };

  const playSong = (song: Song, vibe?: Vibe, playlist?: Song[]) => {
    if (vibe) setActiveVibe(vibe);
    if (playlist && playlist.length > 0) {
      setQueue(playlist);
      const idx = playlist.findIndex((s) => s.id === song.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else if (!queue.some((s) => s.id === song.id)) {
      setQueue((prev) => [song, ...prev]);
      setCurrentIndex(0);
    }

    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        logListenHistory(song.id, vibe?.id);
      }).catch((err) => {
        console.warn('Audio play error:', err);
        setIsPlaying(false);
      });
    }
  };

  const playVibe = (vibe: Vibe, startSongIndex: number = 0) => {
    if (!vibe.songs || vibe.songs.length === 0) return;
    setActiveVibe(vibe);
    setQueue(vibe.songs);
    setCurrentIndex(startSongIndex);
    const targetSong = vibe.songs[startSongIndex];
    setCurrentSong(targetSong);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#f43f5e', '#a855f7', '#fbbf24']
    });

    setIsReliveModalOpen(true);

    if (audioRef.current) {
      audioRef.current.src = targetSong.audioUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        logListenHistory(targetSong.id, vibe.id);
      }).catch(err => console.warn('Audio play failed:', err));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.warn);
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (isRepeat === 'off') {
        setIsPlaying(false);
        return;
      }
      nextIdx = 0; // repeat all
    }
    setCurrentIndex(nextIdx);
    const nextS = queue[nextIdx];
    if (nextS) {
      setCurrentSong(nextS);
      if (audioRef.current) {
        audioRef.current.src = nextS.audioUrl;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          logListenHistory(nextS.id, activeVibe?.id);
        }).catch(console.warn);
      }
    }
  };

  const prevSong = () => {
    if (queue.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;
    setCurrentIndex(prevIdx);
    const prevS = queue[prevIdx];
    if (prevS) {
      setCurrentSong(prevS);
      if (audioRef.current) {
        audioRef.current.src = prevS.audioUrl;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          logListenHistory(prevS.id, activeVibe?.id);
        }).catch(console.warn);
      }
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);
  
  const toggleRepeat = () => {
    setIsRepeat((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const openReliveModal = (vibe?: Vibe) => {
    if (vibe) setActiveVibe(vibe);
    setIsReliveModalOpen(true);
  };

  const closeReliveModal = () => setIsReliveModalOpen(false);
  const toggleLyrics = () => setIsLyricsOpen((prev) => !prev);
  const toggleEqualizer = () => setIsEqualizerOpen((prev) => !prev);
  const setEqPreset = (preset: string) => setEqPresetState(preset);

  const startSleepTimer = (minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSleepTimerMinutes(minutes);
    let totalSecs = minutes * 60;
    setRemainingSleepSeconds(totalSecs);

    timerRef.current = setInterval(() => {
      totalSecs -= 1;
      setRemainingSleepSeconds(totalSecs);

      if (totalSecs <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
        setSleepTimerMinutes(null);
        setRemainingSleepSeconds(null);
      }
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSleepTimerMinutes(null);
    setRemainingSleepSeconds(null);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
  };

  const logListenHistory = (songId: string, vibeId?: string) => {
    const token = localStorage.getItem('vibe_token');
    fetch('/api/songs/listen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ songId, vibeId }),
    })
      .then(() => {
        window.dispatchEvent(new CustomEvent('vibe_song_played', { detail: { songId } }));
      })
      .catch(() => {});
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        currentTime,
        duration,
        volume,
        isShuffle,
        isRepeat,
        activeVibe,
        isReliveModalOpen,
        isLyricsOpen,
        isEqualizerOpen,
        eqPreset,
        sleepTimerMinutes,
        remainingSleepSeconds,
        playSong,
        playVibe,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        openReliveModal,
        closeReliveModal,
        toggleLyrics,
        toggleEqualizer,
        setEqPreset,
        startSleepTimer,
        cancelSleepTimer,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
