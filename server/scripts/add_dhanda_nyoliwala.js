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

    results.push({
      id: song.id,
      title: cleanHtml(song.song),
      artist: 'Dhanda Nyoliwala',
      allArtists: cleanHtml(song.primary_artists || 'Dhanda Nyoliwala'),
      album: cleanHtml(song.album || 'Single'),
      durationSec: Number(song.duration) || 200,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: fullAudio,
      year: Number(song.year) || 2024,
      genre: 'Haryanvi Hip Hop / Desi Drill'
    });
  }
  return results;
}

async function collectAllSongIds() {
  const songIdSet = new Set();
  const seenTitles = new Set();

  console.log('📡 Step 1: Querying Dhanda Nyoliwala artist page songs...');
  const artistUrl = 'https://www.jiosaavn.com/api.php?__call=artist.getArtistPageDetails&_format=json&_marker=0&cc=in&artistId=8812560&n_song=100&n_album=50';
  const artistData = await fetchJson(artistUrl);
  if (artistData && artistData.topSongs && artistData.topSongs.songs) {
    for (const s of artistData.topSongs.songs) {
      if (s.id) songIdSet.add(s.id);
    }
    console.log(`   Found ${artistData.topSongs.songs.length} tracks on artist page.`);
  }

  console.log('📡 Step 2: Querying search results for Dhanda Nyoliwala (Page 1 & 2)...');
  for (const page of [1, 2]) {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&q=Dhanda+Nyoliwala&p=${page}&n=50`;
    const searchData = await fetchJson(searchUrl);
    if (searchData && searchData.results) {
      for (const s of searchData.results) {
        if (s.id) songIdSet.add(s.id);
      }
      console.log(`   Page ${page}: ${searchData.results.length} results added.`);
    }
  }

  console.log('📡 Step 3: Searching specific iconic Dhanda Nyoliwala tracks...');
  const specificHits = [
    'Russian Bandana',
    'Up To U',
    'Up To Date',
    'Death Row',
    'No Mercy',
    '4 Days',
    'Block',
    'Boom Shaka',
    'Not Guilty',
    'Maruti',
    'Kath Lagda',
    'Knife Brows',
    'BLACK RIDE',
    'Tension',
    'Zigane',
    'Big Plans',
    'Dil De Baithi',
    'Ishq Bawla',
    'La La La',
    'Panamera',
    'Chora Baba Ka',
    'KING',
    'Do Numbari',
    'Guilty',
    'Badnaam',
    'Jail',
    'Case',
    'Daku',
    'Listen To Me',
    'Bipolar',
    'Kohram',
    'DNW Vol 1',
    'I am at the club'
  ];

  for (const hit of specificHits) {
    const autoUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent('Dhanda Nyoliwala ' + hit)}`;
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
  console.log('🔥 Adding All Dhanda Nyoliwala Songs to VIBE...\n');

  // 1. Create or Update Artist: Dhanda Nyoliwala
  let artist = await prisma.artist.findFirst({
    where: { name: 'Dhanda Nyoliwala' }
  });

  const avatarUrl = 'https://c.saavncdn.com/artists/Dhanda_Nyoliwala_000_20240820133551_500x500.jpg';
  const bio = 'Powerhouse of Haryanvi Hip-Hop and Desi Drill. Defining the new age sound with raw, hard-hitting bangers like Russian Bandana, Up To U, Death Row, Not Guilty, and Boom Shaka.';

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: 'Dhanda Nyoliwala',
        bio,
        avatarUrl,
        genre: 'Haryanvi Hip Hop / Desi Drill'
      }
    });
    console.log('✅ Created Artist: Dhanda Nyoliwala');
  } else {
    artist = await prisma.artist.update({
      where: { id: artist.id },
      data: { bio, avatarUrl, genre: 'Haryanvi Hip Hop / Desi Drill' }
    });
    console.log('🔄 Updated Artist Profile: Dhanda Nyoliwala');
  }

  // 2. Collect all song IDs
  const allSongIds = await collectAllSongIds();

  // 3. Fetch in chunks of 15
  const chunkSize = 15;
  const processedSongs = [];
  const seenCleanTitles = new Set();

  for (let i = 0; i < allSongIds.length; i += chunkSize) {
    const chunk = allSongIds.slice(i, i + chunkSize);
    const tracks = await getSongDetailsBatch(chunk);
    for (const t of tracks) {
      // Normalize title (lowercase without brackets) for deduplicating repeated releases
      const normTitle = t.title.toLowerCase().replace(/\s*\(.*\)/g, '').trim();
      if (!seenCleanTitles.has(normTitle)) {
        seenCleanTitles.add(normTitle);
        processedSongs.push(t);
      }
    }
  }

  console.log(`\n🎵 Extracted ${processedSongs.length} unique songs with valid 320kbps audio!`);

  // 4. Insert into Database (Albums & Songs)
  let addedCount = 0;
  let updatedCount = 0;
  const dbSongList = [];

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

    // B. Find or create Song
    const existing = await prisma.song.findFirst({
      where: {
        title: track.title,
        artistId: artist.id
      }
    });

    if (existing) {
      const updated = await prisma.song.update({
        where: { id: existing.id },
        data: {
          audioUrl: track.audioUrl,
          durationSec: track.durationSec,
          coverUrl: track.coverUrl,
          albumId: album.id,
          genre: track.genre
        }
      });
      dbSongList.push(updated);
      updatedCount++;
    } else {
      const created = await prisma.song.create({
        data: {
          title: track.title,
          durationSec: track.durationSec,
          audioUrl: track.audioUrl,
          coverUrl: track.coverUrl,
          genre: track.genre,
          artistId: artist.id,
          albumId: album.id
        }
      });
      dbSongList.push(created);
      addedCount++;
    }
  }

  console.log(`✨ Database Update Complete: ${addedCount} new songs added, ${updatedCount} songs refreshed.`);

  // 5. Update verified_songs.json
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  if (fs.existsSync(verifiedPath)) {
    try {
      const existingVerified = JSON.parse(fs.readFileSync(verifiedPath, 'utf-8'));
      const existingTitles = new Set(existingVerified.map(s => s.title.toLowerCase()));

      let newlyAddedToVerified = 0;
      for (const track of processedSongs) {
        if (!existingTitles.has(track.title.toLowerCase())) {
          existingVerified.push({
            title: track.title,
            artist: 'Dhanda Nyoliwala',
            album: track.album,
            durationSec: track.durationSec,
            coverUrl: track.coverUrl,
            audioUrl: track.audioUrl,
            genre: track.genre,
            year: track.year
          });
          existingTitles.add(track.title.toLowerCase());
          newlyAddedToVerified++;
        }
      }
      fs.writeFileSync(verifiedPath, JSON.stringify(existingVerified, null, 2), 'utf-8');
      console.log(`📁 Updated verified_songs.json with ${newlyAddedToVerified} Dhanda Nyoliwala tracks.`);
    } catch (e) {
      console.error('Error updating verified_songs.json:', e.message);
    }
  }

  // 6. Create or Link to a Signature Vibe for Dhanda Nyoliwala
  const demoUser = await prisma.user.findFirst();
  if (demoUser && dbSongList.length > 0) {
    let vibe = await prisma.vibe.findFirst({
      where: { title: 'Dhanda Nyoliwala Drill Anthems' }
    });

    if (!vibe) {
      vibe = await prisma.vibe.create({
        data: {
          title: 'Dhanda Nyoliwala Drill Anthems',
          location: 'Haryana • Late Night Drives',
          date: '2026',
          mood: '⚡ High Energy & Raw Drill',
          story: 'Bass-boosted Haryanvi drill and desi hip-hop on open highways with Dhanda Nyoliwala bangers.',
          coverUrl: 'https://c.saavncdn.com/artists/Dhanda_Nyoliwala_000_20240820133551_500x500.jpg',
          userId: demoUser.id
        }
      });
      console.log('🌟 Created signature Vibe: "Dhanda Nyoliwala Drill Anthems"');
    }

    // Attach first 12 tracks to this vibe
    const topTracks = dbSongList.slice(0, 12);
    for (let i = 0; i < topTracks.length; i++) {
      await prisma.vibeSong.upsert({
        where: {
          vibeId_songId: { vibeId: vibe.id, songId: topTracks[i].id }
        },
        update: { orderIndex: i },
        create: {
          vibeId: vibe.id,
          songId: topTracks[i].id,
          orderIndex: i
        }
      });
    }
    console.log(`🎶 Attached ${topTracks.length} tracks to "Dhanda Nyoliwala Drill Anthems" Vibe!`);
  }

  console.log('\n🎉 ALL DONE! Dhanda Nyoliwala collection is now live in VIBE!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
