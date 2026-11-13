import type React from 'react';

export const ARTIST_PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#282828"/><circle cx="100" cy="78" r="34" fill="#535353"/><path d="M44 176c0-30 25-52 56-52s56 22 56 52" fill="#535353"/></svg>`
)}`;

export const TRACK_PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#282828"/><path d="M132 48v82a22 22 0 1 1-12-19.6V69l-44 11.5v62.5a22 22 0 1 1-12-19.6V64l68-16z" fill="#6a6a6a"/></svg>`
)}`;

export function handleArtistImgError(
  e: React.SyntheticEvent<HTMLImageElement>,
  secondaryUrl?: string | null
) {
  const img = e.currentTarget;
  if (!img.dataset.fallbackStep) {
    if (secondaryUrl && img.src !== secondaryUrl) {
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

