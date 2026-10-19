import React, { useState, useEffect, useRef } from 'react';
import { Radio, Send, Music, Users, MessageSquare } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

const SAMPLE_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'Maya K.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', text: 'This lo-fi beat hitting so deep tonight 🔥', time: '21:51' },
  { id: '2', user: 'Rohan S.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', text: 'Anyone else listening while coding at 2 AM? ☕', time: '21:52' },
  { id: '3', user: 'Elena P.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', text: 'Loved the rain piano melody! So cozy ✨', time: '21:53' },
];

export const LiveLoungePage: React.FC = () => {
  const { currentSong, isPlaying, togglePlay } = useAudio();
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');
  const [listenerCount, setListenerCount] = useState(148);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; symbol: string; left: number }[]>([]);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Periodically scroll chat
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Simulated live listener fluctuation
    const interval = setInterval(() => {
      setListenerCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const triggerEmojiReaction = (symbol: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 80) + 10;
    setFloatingEmojis((prev) => [...prev, { id, symbol, left }]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">
      
      {/* Page Title & Room Stats Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-600/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-950" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <span>Vibe Lounge • Live Listening Room</span>
            </h1>
            <p className="text-xs text-neutral-300">
              Synced audio session with music lovers across the world
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{listenerCount} Vibers Online Now</span>
          </div>
        </div>
      </div>

      {/* Main Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Screen & Audio Stage */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visualizer Stage */}
          <div className="relative glass-panel rounded-3xl p-8 border border-white/10 bg-neutral-950/80 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden min-h-[420px]">
            
            {/* Floating Emojis Overlay */}
            {floatingEmojis.map((e) => (
              <div
                key={e.id}
                style={{ left: `${e.left}%` }}
                className="absolute bottom-10 text-3xl animate-bounce pointer-events-none transition-all duration-1000 opacity-90"
              >
                {e.symbol}
              </div>
            ))}

            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-indigo-600/10 rounded-3xl pointer-events-none" />

            {currentSong ? (
              <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="relative mb-6 group">
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className={`w-44 h-44 rounded-3xl object-cover shadow-2xl border-2 border-amber-500/40 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl flex items-center justify-center transition-opacity">
                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                  LIVE STREAMING • {currentSong.genre || 'Ambient Chill'}
                </span>

                <h2 className="text-2xl font-black text-white">{currentSong.title}</h2>
                <p className="text-sm text-neutral-400 font-medium mt-1">{currentSong.artist}</p>

                {/* Sound wave bars */}
                <div className="flex items-center gap-1.5 mt-6">
                  {[40, 75, 50, 90, 30, 85, 60, 95, 45, 70, 35].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: isPlaying ? `${h}%` : '8px' }}
                      className="w-1.5 max-h-12 bg-gradient-to-t from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative z-10 text-center">
                <Music className="w-12 h-12 text-amber-400 animate-spin-slow mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">Join the Live Stream</h3>
                <p className="text-xs text-neutral-400 mt-1">Start music in the player to sync with the room</p>
              </div>
            )}

            {/* Quick Emoji Reaction Buttons Bar */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 w-full flex items-center justify-center gap-3">
              <span className="text-xs text-neutral-400 font-semibold mr-2">React Live:</span>
              {['🔥', '🎧', '💜', '✨', '🎵', '☕'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerEmojiReaction(emoji)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-lg flex items-center justify-center hover:scale-125 transition-all shadow-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Right Col: Live Chat Panel */}
        <div className="glass-panel rounded-3xl border border-white/10 bg-neutral-950/90 flex flex-col h-[560px] overflow-hidden">
          
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Live Lounge Chat</span>
            </h3>
            <span className="text-[10px] text-neutral-400">Public Room</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <img src={msg.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-amber-500/30 flex-shrink-0" />
                <div className="flex-1 min-w-0 bg-white/5 p-2.5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-300 truncate">{msg.user}</span>
                    <span className="text-[9px] text-neutral-500">{msg.time}</span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-normal">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Share a thought with the room..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-bold hover:scale-105 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
