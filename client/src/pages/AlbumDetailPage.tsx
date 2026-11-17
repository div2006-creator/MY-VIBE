import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Disc, Clock, Music, ArrowLeft } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import type { Song } from '../types';

interface AlbumDetailData {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear: number;
  artist: string;
  artistId: string;
  artistAvatar: string;
  songCount: number;
  totalDurationSec: number;
  songs: Song[];
}

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSong, isPlaying, playSong, togglePlay, isLiked, toggleLike } = useAudio();
  const [album, setAlbum] = useState<AlbumDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAlbum(data);
      }
    } catch (err) {
      console.error('Failed to fetch album:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Disc className="w-10 h-10 text-[#1ed760] animate-spin" />
        <p className="text-sm font-medium text-[#b3b3b3]">Loading Album...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Album Not Found</h2>
        <p className="text-[#b3b3b3] text-sm mb-6">The album you requested could not be located.</p>
        <Link to="/home" className="px-6 py-2.5 rounded-full bg-[#1ed760] text-black font-bold text-sm">
          Back to Home
        </Link>
      </div>
    );
  }

  const isAlbumPlaying = currentSong && album.songs.some((s) => s.id === currentSong.id) && isPlaying;
  const formatTotalTime = (totalSec: number) => `${Math.floor(totalSec / 60)} min`;

  const handlePlayAlbum = () => {
    if (album.songs.length === 0) return;
    if (isAlbumPlaying) togglePlay();
    else playSong(album.songs[0], undefined, album.songs);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#282828]/70 via-[#121212] to-[#121212] text-white pb-28 lg:pb-12 px-4 md:px-8 pt-6 space-y-6">
      <Link to="/home" className="inline-flex items-center gap-2 text-xs font-semibold text-[#b3b3b3] hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-4">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-44 h-44 md:w-52 md:h-52 rounded-lg object-cover shadow-2xl shrink-0"
        />

        <div className="flex-1 text-center md:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            Album • {album.releaseYear}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{album.title}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[#b3b3b3]">
            <Link to={`/artist/${album.artistId}`} className="flex items-center gap-2 hover:underline text-white font-bold">
              <img src={album.artistAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              <span>{album.artist}</span>
            </Link>
            <span>•</span>
            <span>{album.songCount} songs, {formatTotalTime(album.totalDurationSec)}</span>
          </div>
          <div className="pt-3 flex items-center justify-center md:justify-start">
            <button
              onClick={handlePlayAlbum}
              className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              {isAlbumPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <section className="bg-[#181818]/80 p-4 md:p-6 rounded-xl border border-white/5">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-8">Title</div>
          <div className="col-span-3 flex items-center justify-end pr-2">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-0.5 mt-2">
          {album.songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;
            const liked = isLiked(song.id);

            return (
              <div
                key={song.id}
                onClick={() => {
                  if (isCurrent) togglePlay();
                  else playSong(song, undefined, album.songs);
                }}
                className={`group grid grid-cols-12 gap-4 items-center px-4 py-2.5 rounded-md cursor-pointer transition-colors ${
                  isCurrent ? 'bg-white/10' : 'hover:bg-white/10'
                }`}
              >
                <div className="col-span-1 flex items-center justify-center text-sm text-[#b3b3b3] tabular-nums">
                  {isSongPlaying ? (
                    <Music className="w-4 h-4 text-[#1ed760] animate-bounce" />
                  ) : (
                    <>
                      <span className={`group-hover:hidden ${isCurrent ? 'text-[#1ed760] font-bold' : ''}`}>
                        {index + 1}
                      </span>
                      <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block ml-0.5" />
                    </>
                  )}
                </div>

                <div className="col-span-8 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                    {song.title}
                  </h4>
                  <p className="text-xs text-[#b3b3b3] truncate">{album.artist}</p>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-3 pr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song.id);
                    }}
                    className={`p-1 rounded-full ${liked ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-[#1ed760]' : ''}`} />
                  </button>
                  <span className="text-xs text-[#b3b3b3] tabular-nums">
                    {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
