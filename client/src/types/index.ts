export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  favoriteMood?: string;
  isGuest?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  genre?: string;
  songCount?: number;
  albumCount?: number;
  monthlyListeners?: number;
  songs?: Song[];
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear?: number;
  artist: string;
  artistId?: string;
  artistAvatar?: string;
  songCount?: number;
  totalDurationSec?: number;
  songs?: Song[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  durationSec: number;
  coverUrl: string;
  audioUrl: string;
  genre?: string;
  vibeName?: string;
  likedAt?: string;
  trackNumber?: number;
  lyrics?: string[];
}

export interface Vibe {
  id: string;
  title: string;
  date: string;
  location: string;
  mood: string;
  story: string;
  coverUrl: string;
  songCount?: number;
  createdAt?: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
  };
  songs?: Song[];
}

export interface ExploreCategory {
  id: string;
  name: string;
  vibes: Vibe[];
}

export interface RadioStation {
  id: string;
  name: string;
  mood: string;
  description: string;
  coverUrl: string;
  gradient: string;
  tag: string;
  songs: Song[];
}

export interface AnalyticsData {
  user: {
    name: string;
    avatarUrl?: string;
    favoriteMood: string;
  };
  stats: {
    totalMinutesPlayed: number;
    totalSongsPlayed: number;
    likedCount: number;
    totalVibesCount: number;
    topVibeMood: string;
    topGenre: string;
    vibeStreakDays: number;
  };
  topSongs: (Song & { playCount: number })[];
  topArtists: { artistName: string; count: number }[];
  moodDistribution: Record<string, number>;
  weeklyListeningHours: { day: string; hours: number }[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  isPublic: boolean;
  songCount: number;
  songs: Song[];
  createdAt: string;
}
