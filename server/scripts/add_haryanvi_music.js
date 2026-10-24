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
    .replace(/&apos;/g, "'")
    .trim();
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

async function collectSongIds() {
  const songIdSet = new Set();

  // 1. Playlists
  const playlists = [
    { name: 'India Superhits Top 50', id: '1134770917' },
    { name: 'Haryanvi Viral Hits', id: '171187849' },
    { name: 'Most Searched Songs - Haryanvi', id: '945460735' },
    { name: 'Haryanvi Mashups', id: '1038997384' },
    { name: 'Gulzaar Chhaniwala Best', id: '481593595' },
    { name: 'Khasa Aala Chahar Best', id: '854677876' },
    { name: 'Renuka Panwar Love Songs', id: '903209787' },
    { name: 'Renuka Panwar Heartbeat', id: '1301499414' },
  ];

  for (const pl of playlists) {
    console.log(`📻 Fetching playlist: ${pl.name} (${pl.id})...`);
    const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&_marker=0&listid=${pl.id}`;
    const data = await fetchJson(url);
    if (data?.songs && Array.isArray(data.songs)) {
      for (const s of data.songs) {
        if (s.id) songIdSet.add(s.id);
      }
      console.log(`   + Added songs from ${pl.name}. Total candidate IDs: ${songIdSet.size}`);
    }
  }

  // 2. Search queries
  const queries = [
    'Gulzaar Chhaniwala',
    'Khasa Aala Chahar',
    'Renuka Panwar',
    'Raju Punjabi',
    'Sapna Choudhary',
    'Sumit Goswami',
    'Amit Saini Rohtakiya',
    'KD Desi Rockstar',
    'Bintu Pabra',
    'Haryanvi Superhits',
    'Haryanvi Dance Songs',
    '52 Gaj Ka Daman',
    'Desi Desi Na Bolya Kar',
    'Gajban',
    'Solid Body',
    'Chetak Sapna',
    'Filter Shot Gulzaar',
    'Middle Class Gulzaar',
    'Father Saab Khasa Aala',
    'Chatak Matak Renuka',
    'Feelings Sumit Goswami',
  ];

  for (const q of queries) {
    console.log(`🔍 Searching: "${q}"...`);
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(q)}&_format=json&_marker=0&p=1&n=50`;
    const data = await fetchJson(url);
    if (data?.results && Array.isArray(data.results)) {
      for (const s of data.results) {
        if (s.id) songIdSet.add(s.id);
      }
      console.log(`   + "${q}" found ${data.results.length} tracks. Total IDs: ${songIdSet.size}`);
    }
  }

  return Array.from(songIdSet);
}

async function getSongDetailsBatch(pids) {
  if (!pids || pids.length === 0) return [];
  const url = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pids.join(',')}`;
  const data = await fetchJson(url);
  if (!data) return [];

  const results = [];
  for (const pid of pids) {
    const song = data[pid];
    if (!song) continue;
    const fullAudio = decryptUrl(song.encrypted_media_url);
    if (!fullAudio) continue;

    // Pick a primary artist name
    let primaryArtist = cleanHtml(song.primary_artists || song.singers || 'Haryanvi Hits');
    if (primaryArtist.includes(',')) {
      primaryArtist = primaryArtist.split(',')[0].trim();
    }

    results.push({
      jioId: song.id,
      title: cleanHtml(song.song),
      artist: primaryArtist,
      allArtists: cleanHtml(song.primary_artists || song.singers || primaryArtist),
      album: cleanHtml(song.album || 'Single'),
      durationSec: Number(song.duration) || 200,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: fullAudio,
      year: Number(song.year) || 2024,
      genre: 'Haryanvi Folk & Desi Pop',
    });
  }
  return results;
}

async function main() {
  console.log('🚀 Starting Haryanvi Music Ingestion...');

  const allCandidateIds = await collectSongIds();
  console.log(`\n📦 Total unique candidate song IDs gathered: ${allCandidateIds.length}`);

  // Fetch in batches of 30
  const allSongDetails = [];
  const batchSize = 30;
  for (let i = 0; i < allCandidateIds.length; i += batchSize) {
    const batch = allCandidateIds.slice(i, i + batchSize);
    console.log(`🔄 Fetching batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allCandidateIds.length / batchSize)}...`);
    const details = await getSongDetailsBatch(batch);
    allSongDetails.push(...details);
  }

  console.log(`\n🎵 Successfully retrieved & decrypted ${allSongDetails.length} songs.`);

  // Filter out any songs already in database
  const existingSongs = await prisma.song.findMany({
    select: { title: true, audioUrl: true, artist: { select: { name: true } } }
  });
  const existingTitles = new Set(existingSongs.map(s => `${s.title.toLowerCase()}:::${s.artist.name.toLowerCase()}`));
  const existingAudioUrls = new Set(existingSongs.map(s => s.audioUrl));

  console.log(`📊 Current songs in DB: ${existingSongs.length}`);

  // Deduplicate and filter candidates
  const seenTracks = new Set();
  const toInsert = [];

  for (const s of allSongDetails) {
    const normKey = `${s.title.toLowerCase()}:::${s.artist.toLowerCase()}`;
    if (seenTracks.has(normKey)) continue;
    seenTracks.add(normKey);

    if (existingTitles.has(normKey) || existingAudioUrls.has(s.audioUrl)) {
      continue;
    }

    toInsert.push(s);
  }

  console.log(`✨ New unique Haryanvi tracks ready to ingest: ${toInsert.length}`);

  // Helper to upsert artist
  async function getOrCreateArtist(name, avatarUrl) {
    let artist = await prisma.artist.findFirst({ where: { name } });
    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          name,
          bio: `${name} — Celebrated Haryanvi music powerhouse with monumental desi anthems and high-energy folk rhythms.`,
          avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
          genre: 'Haryanvi Folk & Desi Pop',
        },
      });
      console.log(`   + Created new Artist: "${name}"`);
    }
    return artist;
  }

  // Helper to upsert album
  async function getOrCreateAlbum(title, artistId, coverUrl) {
    let album = await prisma.album.findFirst({ where: { title, artistId } });
    if (!album) {
      album = await prisma.album.create({
        data: {
          title,
          artistId,
          releaseYear: 2024,
          coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        },
      });
    }
    return album;
  }

  let insertedCount = 0;
  const verifiedSongsToAdd = [];

  for (const track of toInsert) {
    try {
      const artist = await getOrCreateArtist(track.artist, track.coverUrl);
      const album = await getOrCreateAlbum(track.album, artist.id, track.coverUrl);

      const created = await prisma.song.create({
        data: {
          title: track.title,
          durationSec: track.durationSec,
          audioUrl: track.audioUrl,
          coverUrl: track.coverUrl,
          genre: 'Haryanvi Folk & Desi Pop',
          artistId: artist.id,
          albumId: album.id,
        },
      });

      verifiedSongsToAdd.push({
        id: created.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.durationSec,
        audio_url: track.audioUrl,
        cover_url: track.coverUrl,
        genre: 'Haryanvi Folk & Desi Pop',
        verified: true,
      });

      insertedCount++;
      if (insertedCount % 25 === 0) {
        console.log(`   Ingested ${insertedCount}/${toInsert.length} tracks...`);
      }
    } catch (err) {
      console.error(`Failed to insert track "${track.title}":`, err.message);
    }
  }

  console.log(`\n🎉 Ingested ${insertedCount} new Haryanvi tracks into database!`);

  // Update verified_songs.json
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  try {
    const raw = fs.readFileSync(verifiedPath, 'utf8');
    const list = JSON.parse(raw);
    list.push(...verifiedSongsToAdd);
    fs.writeFileSync(verifiedPath, JSON.stringify(list, null, 2), 'utf8');
    console.log(`💾 Updated verified_songs.json with ${verifiedSongsToAdd.length} records. Total: ${list.length}`);
  } catch (err) {
    console.error('Failed to update verified_songs.json:', err);
  }

  // Create signature Vibe: "Haryanvi Superhits & Desi Anthems"
  const adminUser = await prisma.user.findFirst();
  if (adminUser) {
    const allHaryanvi = await prisma.song.findMany({
      where: {
        OR: [
          { genre: { contains: 'Haryanvi' } },
          { artist: { name: { contains: 'Masoom' } } },
          { artist: { name: { contains: 'Dhanda' } } },
          { artist: { name: { contains: 'Gulzaar' } } },
          { artist: { name: { contains: 'Khasa' } } },
          { artist: { name: { contains: 'Renuka' } } },
          { artist: { name: { contains: 'Sapna' } } },
          { artist: { name: { contains: 'Raju' } } },
          { artist: { name: { contains: 'Sumit' } } },
        ]
      },
      take: 40,
    });

    if (allHaryanvi.length > 0) {
      const vibe = await prisma.vibe.create({
        data: {
          title: 'Haryanvi Superhits & Desi Anthems',
          date: '2026-10-24',
          location: 'Haryana, India',
          mood: 'Energetic & Desi Swagger',
          story: 'The monumental collection of blockbuster Haryanvi anthems, desi drill, and folk swagger featuring Gulzaar Chhaniwala, Masoom Sharma, Dhanda Nyoliwala, Khasa Aala Chahar, Renuka Panwar, Raju Punjabi, Sapna Choudhary & more.',
          coverUrl: allHaryanvi[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
          userId: adminUser.id,
          isPublic: true,
          vibeSongs: {
            create: allHaryanvi.map((s, idx) => ({
              songId: s.id,
              orderIndex: idx,
            })),
          },
        },
      });
      console.log(`🔥 Created Signature Vibe: "${vibe.title}" with ${allHaryanvi.length} tracks!`);
    }
  }

  const finalCount = await prisma.song.count();
  console.log(`\n🏆 Finished! Total tracks in VIBE catalog is now: ${finalCount}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error in script:', err);
  process.exit(1);
});
