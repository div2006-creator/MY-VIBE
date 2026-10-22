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
  // Remove (From "Film Name"), (From Film), (Lyrical), (Audio), [From ...], etc.
  t = t.replace(/\s*\((From|from|Lyrical|Audio|Video|Official|Remix|Reprise|Unplugged|Duet|Film Version|Full Song)[^)]*\)/gi, '');
  t = t.replace(/\s*\[(From|from|Lyrical|Audio|Video|Official|Remix|Reprise|Unplugged)[^\]]*\]/gi, '');
  // Clean double spaces
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
      artist: 'Arijit Singh',
      allArtists: cleanHtml(song.primary_artists || 'Arijit Singh'),
      album: cleanHtml(song.album || 'Bollywood Hits'),
      durationSec: Number(song.duration) || 240,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: fullAudio,
      year: Number(song.year) || 2023,
      genre: 'Bollywood Romance & Sufi'
    });
  }
  return results;
}

async function collectAllArijitSongIds() {
  const songIdSet = new Set();

  console.log('📡 Step 1: Querying Arijit Singh official artist page (artistId: 459320)...');
  const artistUrl = 'https://www.jiosaavn.com/api.php?__call=artist.getArtistPageDetails&_format=json&_marker=0&cc=in&artistId=459320&n_song=100&n_album=50';
  const artistData = await fetchJson(artistUrl);
  if (artistData && artistData.topSongs && artistData.topSongs.songs) {
    for (const s of artistData.topSongs.songs) {
      if (s.id) songIdSet.add(s.id);
    }
    console.log(`   Found ${artistData.topSongs.songs.length} tracks on artist page.`);
  }

  console.log('📡 Step 2: Querying general search results for Arijit Singh (Pages 1 to 5)...');
  for (let p = 1; p <= 5; p++) {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&q=Arijit+Singh&p=${p}&n=50`;
    const searchData = await fetchJson(searchUrl);
    if (searchData && searchData.results) {
      for (const s of searchData.results) {
        if (s.id) songIdSet.add(s.id);
      }
      console.log(`   Search Page ${p}: Added ${searchData.results.length} tracks.`);
    }
  }

  console.log('📡 Step 3: Searching specific timeless Arijit Singh anthems...');
  const timelessAnthems = [
    'Tum Hi Ho',
    'Channa Mereya',
    'Kesariya',
    'Apna Bana Le',
    'Agar Tum Saath Ho',
    'Gerua',
    'Zaalima',
    'Kabira',
    'Ilahi',
    'Hawayein',
    'Ae Dil Hai Mushkil',
    'Raabta',
    'Shayad',
    'Phir Bhi Tumko Chaahunga',
    'Enna Sona',
    'Pal',
    'O Maahi',
    'Satranga',
    'Chaleya',
    'Jhoome Jo Pathaan',
    'Heeriye',
    'Kalank Title Track',
    'Mast Magan',
    'Muskurane Ki Wajah',
    'Suno Na Sangemarmar',
    'Khairiyat',
    'Tujhe Kitna Chahne Lage',
    'Tera Yaar Hoon Main',
    'Soch Na Sake',
    'Naina Dangal',
    'Nashe Si Chadh Gayi',
    'Galti Se Mistake',
    'Hamari Adhuri Kahani',
    'Phir Le Aya Dil',
    'Samjhawan',
    'Main Rang Sharbaton Ka',
    'Laal Ishq',
    'Manwa Laage',
    'Sooraj Dooba Hain',
    'Janam Janam',
    'Binte Dil',
    'Roke Na Ruke Naina',
    'Tere Hawaale',
    'Lutt Putt Gaya',
    'Ve Kamleya',
    'Tum Kya Mile',
    'What Jhumka',
    'Soulmate',
    'Tera Hoke Rahoon',
    'Dekh Lena',
    'Darkhaast',
    'Bulleya',
    'Tu Har Lamha',
    'Baatein Ye Kabhi Na',
    'Khamoshiyan',
    'Aaj Se Teri',
    'Pachtaoge',
    'Aabaad Barbaad',
    'Hardum Humdum',
    'Qaafirana',
    'Jaan Nisaar',
    'Sweetheart',
    'Thodi Jagah',
    'Ghungroo',
    'Duaa Shanghai',
    'Milne Hai Mujhse Aayi',
    'Chahun Main Ya Naa',
    'Humdard',
    'Ashq Na Ho',
    'Dilliwaali Girlfriend',
    'Saware Phantom',
    'Aayat Bajirao Mastani',
    'Itni Si Baat Hain Azhar',
    'Lambiyaan Si Judaiyaan',
    'Ik Vaari Aa',
    'Ruan Ruan',
    'Bandeya Re Bandeya',
    'Deva Deva',
    'Rasiya Brahmastra',
    'Fitoor Shamshera',
    'O Bedardeya',
    'Pyaar Hota Kayi Baar Hai',
    'Tere Pyaar Mein'
  ];

  for (const hit of timelessAnthems) {
    const autoUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent('Arijit Singh ' + hit)}`;
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
  console.log('❤️ Adding All Arijit Singh Songs to VIBE...\n');

  // 1. Create or Update Artist: Arijit Singh
  let artist = await prisma.artist.findFirst({
    where: { name: 'Arijit Singh' }
  });

  const avatarUrl = 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg';
  const bio = 'The undisputed king of soulful Bollywood romance and emotive melodies. Delivering legendary anthems like Tum Hi Ho, Channa Mereya, Kesariya, Agar Tum Saath Ho, Apna Bana Le, and Kalank.';

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: 'Arijit Singh',
        bio,
        avatarUrl,
        genre: 'Bollywood Romance & Sufi'
      }
    });
    console.log('✅ Created Artist Profile: Arijit Singh (ID: ' + artist.id + ')');
  } else {
    artist = await prisma.artist.update({
      where: { id: artist.id },
      data: { bio, avatarUrl, genre: 'Bollywood Romance & Sufi' }
    });
    console.log('🔄 Updated Artist Profile: Arijit Singh (ID: ' + artist.id + ')');
  }

  // 2. Collect all song IDs
  const allSongIds = await collectAllArijitSongIds();

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

  console.log(`\n🎵 Processed ${processedSongs.length} distinct high-quality Arijit Singh songs!`);

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

    // B. Check if song exists by title (for this artist or existing Bollywood track) or audioUrl
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
            artist: 'Arijit Singh',
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

  // 6. Check total songs count for Arijit Singh
  const totalArijit = await prisma.song.count({
    where: { artistId: artist.id }
  });
  const totalAll = await prisma.song.count();

  console.log(`📊 Arijit Singh Songs in VIBE: ${totalArijit}`);
  console.log(`📊 Total Platform Songs: ${totalAll}\n`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error adding Arijit Singh songs:', e);
  await prisma.$disconnect();
  process.exit(1);
});
