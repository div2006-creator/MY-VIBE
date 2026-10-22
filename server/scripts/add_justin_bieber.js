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
  // Remove noise like (Radio Version), (Album Version), (Audio), (Official Video), [feat. ...], etc.
  t = t.replace(/\s*\((Radio Version|Album Version|Single Version|Audio|Video|Official|Remix|Reprise|Unplugged|Duet|Film Version|Full Song)[^)]*\)/gi, '');
  t = t.replace(/\s*\[(Radio Version|Album Version|Audio|Video|Official|Remix|Reprise|Unplugged)[^\]]*\]/gi, '');
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

    const norm = normalizeTitle(song.song);
    if (!norm) continue;

    results.push({
      id: song.id,
      title: norm,
      rawTitle: cleanHtml(song.song),
      artist: 'Justin Bieber',
      allArtists: cleanHtml(song.primary_artists || 'Justin Bieber'),
      album: cleanHtml(song.album || 'Purpose'),
      durationSec: Number(song.duration) || 210,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: fullAudio,
      year: Number(song.year) || 2021,
      genre: 'Global Pop & R&B'
    });
  }
  return results;
}

async function collectAllBieberSongIds() {
  const songIdSet = new Set();

  console.log('📡 Step 1: Querying Justin Bieber official artist page (artistId: 568565)...');
  const artistUrl = 'https://www.jiosaavn.com/api.php?__call=artist.getArtistPageDetails&_format=json&_marker=0&cc=in&artistId=568565&n_song=100&n_album=50';
  const artistData = await fetchJson(artistUrl);
  if (artistData && artistData.topSongs && artistData.topSongs.songs) {
    for (const s of artistData.topSongs.songs) {
      if (s.id) songIdSet.add(s.id);
    }
    console.log(`   Found ${artistData.topSongs.songs.length} tracks on artist page.`);
  }

  console.log('📡 Step 2: Querying general search results for Justin Bieber (Pages 1 to 5)...');
  for (let p = 1; p <= 5; p++) {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&q=Justin+Bieber&p=${p}&n=50`;
    const searchData = await fetchJson(searchUrl);
    if (searchData && searchData.results) {
      for (const s of searchData.results) {
        if (s.id) songIdSet.add(s.id);
      }
      console.log(`   Search Page ${p}: Added ${searchData.results.length} tracks.`);
    }
  }

  console.log('📡 Step 3: Searching specific timeless Justin Bieber hits & collabs...');
  const timelessHits = [
    'Baby',
    'Sorry',
    'Love Yourself',
    'What Do You Mean',
    'Peaches',
    'STAY',
    'Ghost',
    'Intentions',
    'Yummy',
    'As Long As You Love Me',
    'Beauty And A Beat',
    'Boyfriend',
    'Never Say Never',
    'Company',
    'Cold Water',
    'I Dont Care',
    '10,000 Hours',
    'Holy',
    'Lonely',
    'Hold On',
    'Anyone',
    'Somebody To Love',
    'One Time',
    'One Less Lonely Girl',
    'Down to Earth',
    'All Around The World',
    'Confident',
    'All That Matters',
    'Heartbreaker',
    'Hold Tight',
    'Recovery',
    'Bad Day',
    'PYD',
    'Roller Coaster',
    'Change Me',
    'Mistletoe',
    'Friends',
    'Where Are U Now',
    'Im the One',
    'No Brainer',
    '2U',
    'Monster',
    'Stuck with U',
    'Let Me Love You',
    'Loved By You',
    'Off My Face',
    'Die For You',
    'Unstable',
    'Deserve You',
    '2 Much',
    'Lifetime',
    'Honest',
    'Attention',
    'Love You Different',
    'There She Go',
    'Despacito Remix'
  ];

  for (const hit of timelessHits) {
    const autoUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent('Justin Bieber ' + hit)}`;
    const autoData = await fetchJson(autoUrl);
    const first = autoData?.songs?.data?.[0];
    if (first && first.id) {
      songIdSet.add(first.id);
    }
  }

  console.log(`\n✅ Total unique song IDs collected: ${songIdSet.size}`);
  return Array.from(songIdSet);
}

async function main() {
  console.log('👑 Adding All Justin Bieber Songs to VIBE...\n');

  // 1. Create or Update Artist: Justin Bieber
  let artist = await prisma.artist.findFirst({
    where: { name: 'Justin Bieber' }
  });

  const avatarUrl = 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_500x500.jpg';
  const bio = 'Global pop superstar and Grammy-winning icon. Delivering record-breaking generational anthems from Baby, Sorry, Love Yourself, and What Do You Mean? to STAY, Peaches, Ghost, and Intentions.';

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: 'Justin Bieber',
        bio,
        avatarUrl,
        genre: 'Global Pop & R&B'
      }
    });
    console.log('✅ Created Artist Profile: Justin Bieber (ID: ' + artist.id + ')');
  } else {
    artist = await prisma.artist.update({
      where: { id: artist.id },
      data: { bio, avatarUrl, genre: 'Global Pop & R&B' }
    });
    console.log('🔄 Updated Artist Profile: Justin Bieber (ID: ' + artist.id + ')');
  }

  // 2. Collect all song IDs
  const allSongIds = await collectAllBieberSongIds();

  // 3. Fetch song details in batches of 15
  const chunkSize = 15;
  const processedSongs = [];
  const seenNormTitles = new Set();

  for (let i = 0; i < allSongIds.length; i += chunkSize) {
    const chunk = allSongIds.slice(i, i + chunkSize);
    const tracks = await getSongDetailsBatch(chunk);
    for (const t of tracks) {
      const lower = t.title.toLowerCase();
      if (!seenNormTitles.has(lower)) {
        seenNormTitles.add(lower);
        processedSongs.push(t);
      }
    }
  }

  console.log(`\n🎵 Processed ${processedSongs.length} distinct high-quality Justin Bieber songs!`);

  // 4. Insert or update Albums & Songs in Prisma Database
  let addedCount = 0;
  let updatedCount = 0;

  for (const track of processedSongs) {
    // A. Find or create Album
    let album = await prisma.album.findFirst({
      where: { title: track.album, artistId: artist.id }
    });

    if (!album) {
      album = await prisma.album.create({
        data: {
          title: track.album,
          coverUrl: track.coverUrl,
          releaseYear: track.year,
          artistId: artist.id
        }
      });
    }

    // B. Check if song exists by title or audioUrl
    const existing = await prisma.song.findFirst({
      where: {
        OR: [
          { title: track.title, artistId: artist.id },
          { audioUrl: track.audioUrl }
        ]
      }
    });

    if (existing) {
      await prisma.song.update({
        where: { id: existing.id },
        data: {
          artistId: artist.id,
          albumId: album.id,
          coverUrl: track.coverUrl,
          audioUrl: track.audioUrl,
          durationSec: track.durationSec,
          genre: track.genre,
        }
      });
      updatedCount++;
    } else {
      await prisma.song.create({
        data: {
          title: track.title,
          durationSec: track.durationSec,
          audioUrl: track.audioUrl,
          coverUrl: track.coverUrl,
          genre: track.genre,
          artistId: artist.id,
          albumId: album.id,
        }
      });
      addedCount++;
    }
  }

  console.log(`\n🎉 SUCCESS! Added ${addedCount} new songs and updated ${updatedCount} existing tracks.`);

  // 5. Update verified_songs.json
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  if (fs.existsSync(verifiedPath)) {
    try {
      const existingVerified = JSON.parse(fs.readFileSync(verifiedPath, 'utf-8'));
      const existingTitles = new Set(existingVerified.map((s) => s.title.toLowerCase()));

      let newlyAddedToVerified = 0;
      for (const track of processedSongs) {
        if (!existingTitles.has(track.title.toLowerCase())) {
          existingVerified.push({
            title: track.title,
            artist: 'Justin Bieber',
            album: track.album,
            coverUrl: track.coverUrl,
            audioUrl: track.audioUrl,
            durationSec: track.durationSec,
            genre: track.genre,
          });
          newlyAddedToVerified++;
        }
      }
      fs.writeFileSync(verifiedPath, JSON.stringify(existingVerified, null, 2));
      console.log(`💾 verified_songs.json updated: Added ${newlyAddedToVerified} songs.`);
    } catch (err) {
      console.warn('⚠️ Could not update verified_songs.json:', err.message);
    }
  }

  // 6. Check total songs count for Justin Bieber
  const totalBieber = await prisma.song.count({
    where: { artistId: artist.id }
  });
  const totalAll = await prisma.song.count();

  console.log(`📊 Justin Bieber Songs in VIBE: ${totalBieber}`);
  console.log(`📊 Total Platform Songs: ${totalAll}\n`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error adding Justin Bieber songs:', e);
  await prisma.$disconnect();
  process.exit(1);
});
