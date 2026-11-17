import type React from 'react';

export const ARTIST_PLACEHOLDER_SVG = '/artist-placeholder.svg';
export const TRACK_PLACEHOLDER_SVG = '/track-placeholder.svg';

export const KNOWN_ARTIST_AVATARS: Record<string, string> = {
  hansraj: '/artists/hansraj-raghuwanshi.jpg',
  atif: '/artists/atif-aslam.jpg',
  shreya: '/artists/shreya-ghoshal.jpg',
  arijit: '/artists/arijit-singh.jpg',
  bieber: '/artists/justin-bieber.jpg',
  masoom: '/artists/masoom-sharma.jpg',
  dhanda: '/artists/dhanda-nyoliwala.jpg',
  honey: '/artists/honey-singh.jpg',
  hariharan: '/artists/hariharan.jpg',
  shankar: '/artists/shankar-mahadevan.jpg',
  renuka: '/artists/renuka-panwar.jpg',
  agam: '/artists/agam.jpg',
};

export function getArtistAvatar(
  name?: string,
  avatarUrl?: string | null,
  fallbackCover?: string | null
): string {
  if (name) {
    const lower = name.toLowerCase();
    for (const [key, path] of Object.entries(KNOWN_ARTIST_AVATARS)) {
      if (lower.includes(key)) {
        return path;
      }
    }
  }
  if (avatarUrl && !avatarUrl.includes('placeholder')) return avatarUrl;
  if (fallbackCover) return fallbackCover;
  return ARTIST_PLACEHOLDER_SVG;
}

export function handleArtistImgError(
  e: React.SyntheticEvent<HTMLImageElement>,
  secondaryUrl?: string | null
) {
  const img = e.currentTarget;
  if (!img.dataset.fallbackStep) {
    if (secondaryUrl && img.src !== secondaryUrl && !img.src.includes(secondaryUrl)) {
      img.dataset.fallbackStep = 'secondary';
      img.src = secondaryUrl;
      return;
    }
  }
  if (img.dataset.fallbackStep !== 'placeholder') {
    img.dataset.fallbackStep = 'placeholder';
    img.src = ARTIST_PLACEHOLDER_SVG;
  }
}

export function handleTrackImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallbackStep !== 'placeholder') {
    img.dataset.fallbackStep = 'placeholder';
    img.src = TRACK_PLACEHOLDER_SVG;
  }
}
