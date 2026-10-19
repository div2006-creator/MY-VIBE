import React, { useEffect, useState } from 'react';
import { ListMusic, Plus, Play, Pause, Trash2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import type { Playlist, Song } from '../types';

export const PlaylistsPage: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data: Song[]) => {
        setAllSongs(data);
        // Build initial custom playlists
        setPlaylists([
          {
            id: 'p1',
            title: 'Late Night Coding Beats',
            description: 'Ambient lo-fi & synth wave beats to stay focused through late night bug fixing sessions.',
            coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
            isPublic: true,
            songCount: data.length,
            songs: data,
            createdAt: '2026-08-10',
          },
          {
            id: 'p2',
            title: 'Monsoon Chai & Rain Melodies',
            description: 'Soft rain, acoustic guitars, and gentle piano tunes for cozy rainy mornings.',
            coverUrl: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80',
            isPublic: true,
            songCount: Math.min(4, data.length),
            songs: data.slice(0, 4),
            createdAt: '2026-08-15',
          },
          {
            id: 'p3',
            title: 'Highway Sunset Drive',
            description: 'Upbeat indie pop and retro synthwave for coastal weekend drives.',
            coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
            isPublic: true,
            songCount: Math.min(5, data.length),
            songs: data.slice(1, 6),
            createdAt: '2026-08-20',
          },
        ]);
      })
      .catch(console.error);
  }, []);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newP: Playlist = {
      id: `p-${Date.now()}`,
      title: newTitle,
      description: newDesc || 'User curated vibe playlist.',
      coverUrl: allSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      isPublic: true,
      songCount: allSongs.length,
      songs: allSongs,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setPlaylists([newP, ...playlists]);
    setNewTitle('');
    setNewDesc('');
    setIsCreateOpen(false);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">
      
      {/* Page Title */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-600/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListMusic className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">Curated Sound Mixes</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Your Playlists & Mixes</h1>
          <p className="text-xs md:text-sm text-neutral-300 mt-1">
            Build custom playlists or listen to curated vibe mixes.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Create Playlist Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-white/10 bg-neutral-950/95">
            <h3 className="text-lg font-bold text-white mb-4">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Playlist Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midnight Study Energy"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description (Optional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is the story or mood of this mix?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400"
                >
                  Save Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => {
          const isPlaylistPlaying = currentSong && playlist.songs.some((s) => s.id === currentSong.id) && isPlaying;

          return (
            <div
              key={playlist.id}
              className="group glass-panel rounded-3xl p-5 border border-white/10 hover:border-amber-500/40 hover:scale-[1.02] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={() => {
                        if (isPlaylistPlaying) togglePlay();
                        else if (playlist.songs.length > 0) playSong(playlist.songs[0], undefined, playlist.songs);
                      }}
                      className="w-14 h-14 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xl hover:scale-110 transition-transform font-bold"
                    >
                      {isPlaylistPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {playlist.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{playlist.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <span>{playlist.songCount} Tracks</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deletePlaylist(playlist.id)}
                    className="p-1.5 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
