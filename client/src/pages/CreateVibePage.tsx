import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Music, Check, Plus, Image as ImageIcon, Search } from 'lucide-react';
import type { Song } from '../types';

const PRESET_MOODS = [
  '😎 Excited & Adventurous',
  '🌙 Late Night Chill',
  '🎓 Nostalgic & Pure',
  '🌧️ Rainy & Cozy',
  '☀️ Warm & Sunset',
  '🎉 Wild Party',
  '📚 Deep Focus & Coding',
  '❤️ Romantic',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
];

export const CreateVibePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('14 August 2026');
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState(PRESET_MOODS[0]);
  const [story, setStory] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [searchSongQuery, setSearchSongQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableSongs(data);
          // Select first 3 songs by default for a seamless kickstart
          setSelectedSongIds(data.slice(0, 3).map((s) => s.id));
        }
      })
      .catch(console.error);
  }, []);

  const toggleSongSelection = (id: string) => {
    if (selectedSongIds.includes(id)) {
      setSelectedSongIds(selectedSongIds.filter((sId) => sId !== id));
    } else {
      setSelectedSongIds([...selectedSongIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !date) {
      setErrorMsg('Please fill in Title, Location, and Date for your Vibe.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const finalCover = customCoverUrl.trim() || coverUrl;
      const token = localStorage.getItem('vibe_token');

      const res = await fetch('/api/vibes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          date,
          location,
          mood,
          story,
          coverUrl: finalCover,
          songIds: selectedSongIds,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create vibe');
      }

      const createdVibe = await res.json();
      navigate(`/vibe/${createdVibe.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating vibe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSongs = availableSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchSongQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchSongQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 pb-32 px-4 lg:px-8 pt-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>New Memory Journal</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif text-white">
            Create Your Vibe
          </h1>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto">
            Connect songs with your memories, places, dates, and story.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Card 1: Memory Essentials */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-xl font-bold font-serif text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>1. Memory Essentials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Vibe Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Vibe Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. College Trip, Birthday Bash, Late Night Coding"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-amber-400 text-white placeholder-neutral-500 outline-none transition-colors"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Location *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi, Goa, Campus Lawn, Meerut"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-amber-400 text-white placeholder-neutral-500 outline-none transition-colors"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Date *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 August 2026"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-amber-400 text-white placeholder-neutral-500 outline-none transition-colors"
                  required
                />
              </div>

              {/* Mood Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Select Mood *
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/15 focus:border-amber-400 text-white outline-none transition-colors"
                >
                  {PRESET_MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Story Journal Entry */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Memory Story & Personal Notes
              </label>
              <textarea
                rows={4}
                placeholder="Write your story... What happened? Who were you with? What made this moment unforgettable?"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-amber-400 text-white placeholder-neutral-500 outline-none transition-colors text-sm leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Card 2: Cover Visual */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-xl font-bold font-serif text-amber-300 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-rose-400" />
              <span>2. Memory Cover Art</span>
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-neutral-400">Choose a preset cover image or paste a custom image URL:</p>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {PRESET_COVERS.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCoverUrl(url);
                      setCustomCoverUrl('');
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      coverUrl === url && !customCoverUrl ? 'border-amber-400 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {coverUrl === url && !customCoverUrl && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-amber-300 drop-shadow" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <input
                type="url"
                placeholder="Or paste custom image URL (https://...)"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 outline-none"
              />
            </div>
          </div>

          {/* Card 3: Select Soundtrack Songs */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xl font-bold font-serif text-amber-300 flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-400" />
                <span>3. Memory Soundtrack ({selectedSongIds.length} Songs Selected)</span>
              </h3>

              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter songs..."
                  value={searchSongQuery}
                  onChange={(e) => setSearchSongQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-full text-xs bg-white/5 border border-white/15 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {filteredSongs.map((song) => {
                const isSelected = selectedSongIds.includes(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => toggleSongSelection(song.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img src={song.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="truncate text-xs">
                        <p className="font-semibold text-white truncate">{song.title}</p>
                        <p className="text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isSelected ? 'bg-amber-500 text-neutral-950 font-bold' : 'border border-white/30 text-neutral-500'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-4 rounded-full font-bold text-base bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-neutral-950 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>{isSubmitting ? 'Creating Vibe...' : 'SAVE & RELIVE VIBE'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
