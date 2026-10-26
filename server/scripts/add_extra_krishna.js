import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function decryptUrl(enc) {
  if (!enc) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(enc) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url) return null;
    return url.replace('_96.mp4', '_320.mp4');
  } catch (e) {
    return null;
  }
}

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function normalizeTitle(rawTitle) {
  if (!rawTitle) return '';
  let t = cleanHtml(rawTitle);
  t = t.replace(/\s*\((From|from|Lyrical|Audio|Video|Official|Remix|Reprise|Unplugged|Duet|Film Version|Full Song)[^)]*\)/gi, '');
  t = t.replace(/\s*\[(From|from|Lyrical|Audio|Video|Official|Remix|Reprise|Unplugged)[^\]]*\]/gi, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const clean = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    return JSON.parse(clean);
  } catch (err) {
    return null;
  }
}

async function searchSongs(q) {
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&q=${encodeURIComponent(q)}&p=1&n=5`;
  const data = await fetchJson(url);
  if (!data || !data.results) return [];
  const pids = data.results.map((r) => r.id);
  const detUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pids.join(',')}`;
  const detData = await fetchJson(detUrl);
  if (!detData) return [];

  const found = [];
  for (const id of pids) {
    const s = detData[id];
    if (!s) continue;
    const audio = decryptUrl(s.encrypted_media_url);
    if (!audio) continue;

    found.push({
      id: s.id,
      title: normalizeTitle(s.song),
      singers: cleanHtml(s.primary_artists || 'Traditional'),
      album: cleanHtml(s.album || 'Sacred Bhajans'),
      durationSec: Number(s.duration) || 240,
      coverUrl: (s.image || '').replace('150x150', '500x500'),
      audioUrl: audio,
      year: Number(s.year) || 2022,
    });
  }
  return found;
}

const EXTRA_TRACKS = [
  {
    query: 'Yashomati Maiya Se Bole Nandlala Lata Mangeshkar',
    matchTitle: 'Yashomati Maiya Se Bole Nandlala',
    artist: 'Lata Mangeshkar',
    album: 'Satyam Shivam Sundaram',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Shri Krishna Govind Hare Murari Ravindra Jain',
    matchTitle: 'Shri Krishna Govind Hare Murari',
    artist: 'Ravindra Jain',
    album: 'Shri Krishna Bhajan Amrit',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Bhaja Govindam M S Subbulakshmi',
    matchTitle: 'Bhaja Govindam',
    artist: 'M. S. Subbulakshmi',
    album: 'Bhaja Govindam & Vishnu Sahasranamam',
    genre: 'Devotional - Krishna',
    artistBio: 'Bharat Ratna recipient and Carnatic music legend who presented Indian classical and devotional music at the United Nations.',
    artistAvatar: 'https://c.saavncdn.com/artists/M_S_Subbulakshmi_500x500.jpg',
  },
  {
    query: 'Govind Bolo Hari Gopal Bolo Kumar Vishu',
    matchTitle: 'Govind Bolo Hari Gopal Bolo',
    artist: 'Kumar Vishu',
    album: 'Gopal Bhajans',
    genre: 'Devotional - Krishna',
    artistBio: 'Prominent devotional singer renowned for soul-stirring Krishna and Ram Bhajans.',
    artistAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  },
];

async function addExtra() {
  for (const t of EXTRA_TRACKS) {
    console.log(`Searching for: ${t.query}`);
    const results = await searchSongs(t.query);
    const match = results.find((r) => r.title.toLowerCase().includes(t.matchTitle.toLowerCase())) || results[0];

    if (!match) {
      console.log(`Not found for ${t.query}`);
      continue;
    }

    let artist = await prisma.artist.findFirst({ where: { name: t.artist } });
    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          name: t.artist,
          genre: t.genre,
          bio: t.artistBio || 'Eminent classical and devotional maestro.',
          avatarUrl: t.artistAvatar || match.coverUrl,
        },
      });
    }

    let album = await prisma.album.findFirst({ where: { title: t.album, artistId: artist.id } });
    if (!album) {
      album = await prisma.album.create({
        data: {
          title: t.album,
          coverUrl: match.coverUrl,
          releaseYear: match.year,
          artistId: artist.id,
        },
      });
    }

    const existing = await prisma.song.findFirst({
      where: {
        OR: [{ title: match.title, artistId: artist.id }, { audioUrl: match.audioUrl }],
      },
    });

    if (existing) {
      await prisma.song.update({
        where: { id: existing.id },
        data: {
          title: match.title,
          coverUrl: match.coverUrl,
          audioUrl: match.audioUrl,
          durationSec: match.durationSec,
          genre: t.genre,
          albumId: album.id,
        },
      });
    } else {
      await prisma.song.create({
        data: {
          title: match.title,
          durationSec: match.durationSec,
          audioUrl: match.audioUrl,
          coverUrl: match.coverUrl,
          genre: t.genre,
          artistId: artist.id,
          albumId: album.id,
        },
      });
    }

    console.log(`✅ Saved: "${match.title}" by ${artist.name}`);
  }

  const count = await prisma.song.count({ where: { genre: { contains: 'Devotional' } } });
  console.log(`Total devotional songs now: ${count}`);
  await prisma.$disconnect();
}

addExtra();
