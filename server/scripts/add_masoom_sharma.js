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
      artist: 'Masoom Sharma',
      allArtists: cleanHtml(song.primary_artists || song.singers || 'Masoom Sharma'),
      album: cleanHtml(song.album || 'Single'),
      durationSec: Number(song.duration) || 200,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: fullAudio,
      year: Number(song.year) || 2024,
      genre: 'Haryanvi Hip Hop / Desi Folk',
      hasMasoom:
        (song.primary_artists && song.primary_artists.includes('Masoom')) ||
        (song.singers && song.singers.includes('Masoom')) ||
        (song.artistMap && song.artistMap['Masoom Sharma']),
    });
  }
  return results;
}

async function collectAllSongIds() {
  const songIdSet = new Set();

  console.log('📡 Step 1: Querying Masoom Sharma artist page top songs & albums...');
  const artistUrl = 'https://www.jiosaavn.com/api.php?__call=artist.getArtistPageDetails&_format=json&_marker=0&cc=in&artistId=497099&n_song=100&n_album=50';
  const artistData = await fetchJson(artistUrl);

  if (artistData?.topSongs?.songs) {
    for (const s of artistData.topSongs.songs) {
      if (s.id) songIdSet.add(s.id);
    }
    console.log(`   Found ${artistData.topSongs.songs.length} tracks on artist top songs.`);
  }

  // Fetch songs from top 40 albums
  if (artistData?.topAlbums?.albums) {
    const albums = artistData.topAlbums.albums.slice(0, 40);
    console.log(`📡 Step 2: Querying ${albums.length} albums for tracklists...`);
    for (const alb of albums) {
      if (!alb.albumid) continue;
      const albUrl = `https://www.jiosaavn.com/api.php?__call=content.getAlbumDetails&_format=json&_marker=0&cc=in&albumid=${alb.albumid}`;
      const albData = await fetchJson(albUrl);
      if (albData?.list) {
        for (const s of albData.list) {
          if (s.id) songIdSet.add(s.id);
        }
      }
    }
    console.log(`   Accumulated ${songIdSet.size} unique candidate song IDs so far.`);
  }

  // Step 3: Search queries
  console.log('📡 Step 3: Querying JioSaavn search results for Masoom Sharma catalogs...');
  const searchQueries = [
    'Masoom Sharma',
    'Masoom Sharma Haryanvi',
    'Masoom Sharma Hits',
    'Masoom Sharma New Song',
    'Masoom Sharma Ruchika Jangid',
  ];

  for (const q of searchQueries) {
    for (const p of [1, 2, 3]) {
      const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&q=${encodeURIComponent(q)}&p=${p}&n=50`;
      const searchData = await fetchJson(searchUrl);
      if (searchData?.results) {
        for (const s of searchData.results) {
          if (s.id) songIdSet.add(s.id);
        }
      }
    }
  }

  console.log(`✅ Total candidate IDs collected: ${songIdSet.size}`);
  return Array.from(songIdSet);
}

async function main() {
  console.log('====================================================');
  console.log('🎙️  MASOOM SHARMA COMPLETE CATALOG INGESTION SCRIPT');
  console.log('====================================================\n');

  // 1. Gather all IDs
  const allIds = await collectAllSongIds();

  // 2. Batch fetch song details (chunks of 25)
  console.log(`\n📦 Step 4: Fetching full 320kbps details in batches...`);
  const chunkSize = 25;
  const allSongDetails = [];

  for (let i = 0; i < allIds.length; i += chunkSize) {
    const chunk = allIds.slice(i, i + chunkSize);
    process.stdout.write(`   Fetching batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(allIds.length / chunkSize)}... `);
    const details = await getSongDetailsBatch(chunk);
    allSongDetails.push(...details);
    console.log(`Got ${details.length} playable cuts.`);
    await new Promise((res) => setTimeout(res, 200));
  }

  // 3. Deduplicate by title & filter for Masoom Sharma tracks
  const processedSongs = [];
  const seenTitles = new Set();

  for (const song of allSongDetails) {
    const normTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normTitle) continue;
    if (seenTitles.has(normTitle)) continue;

    // Verify Masoom Sharma is involved
    if (song.hasMasoom || song.allArtists.toLowerCase().includes('masoom')) {
      seenTitles.add(normTitle);
      processedSongs.push(song);
    }
  }

  console.log(`\n🎯 Verified & Deduplicated: ${processedSongs.length} unique Masoom Sharma studio tracks ready!`);

  if (processedSongs.length === 0) {
    console.log('❌ No songs found. Exiting.');
    return;
  }

  // 4. Ensure Artist Record exists
  console.log('\n💾 Step 5: Upserting Artist and Songs into Database...');
  let artist = await prisma.artist.findFirst({
    where: { name: 'Masoom Sharma' },
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: 'Masoom Sharma',
        bio: 'Legendary Haryanvi powerhouse vocalist, composer, and folk-drill pioneer famous for high-octane rural anthems and raw desi swagger.',
        avatarUrl: 'https://c.saavncdn.com/artists/Masoom_Sharma_003_20250619064935_500x500.jpg',
        genre: 'Haryanvi Folk & Desi Drill',
      },
    });
  } else {
    artist = await prisma.artist.update({
      where: { id: artist.id },
      data: {
        bio: 'Legendary Haryanvi powerhouse vocalist, composer, and folk-drill pioneer famous for high-octane rural anthems and raw desi swagger.',
        avatarUrl: 'https://c.saavncdn.com/artists/Masoom_Sharma_003_20250619064935_500x500.jpg',
        genre: 'Haryanvi Folk & Desi Drill',
      },
    });
  }
  console.log(`   Artist ID: ${artist.id} (${artist.name})`);

  // Default Album
  let album = await prisma.album.findFirst({
    where: {
      title: 'Masoom Sharma Essentials',
      artistId: artist.id,
    },
  });

  if (!album) {
    album = await prisma.album.create({
      data: {
        title: 'Masoom Sharma Essentials',
        releaseYear: 2024,
        coverUrl: processedSongs[0]?.coverUrl || 'https://c.saavncdn.com/artists/Masoom_Sharma_003_20250619064935_500x500.jpg',
        artistId: artist.id,
      },
    });
  } else {
    album = await prisma.album.update({
      where: { id: album.id },
      data: {
        coverUrl: processedSongs[0]?.coverUrl || 'https://c.saavncdn.com/artists/Masoom_Sharma_003_20250619064935_500x500.jpg',
      },
    });
  }

  // Insert Songs
  let addedCount = 0;
  let updatedCount = 0;
  const dbSongList = [];

  for (const track of processedSongs) {
    const existing = await prisma.song.findFirst({
      where: {
        title: track.title,
        artistId: artist.id,
      },
    });

    if (existing) {
      const updated = await prisma.song.update({
        where: { id: existing.id },
        data: {
          audioUrl: track.audioUrl,
          coverUrl: track.coverUrl,
          durationSec: track.durationSec,
          genre: track.genre,
        },
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
          albumId: album.id,
        },
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
      const existingTitles = new Set(existingVerified.map((s) => s.title.toLowerCase()));

      let newlyAddedToVerified = 0;
      for (const track of processedSongs) {
        if (!existingTitles.has(track.title.toLowerCase())) {
          existingVerified.push({
            title: track.title,
            artist: 'Masoom Sharma',
            album: track.album,
            durationSec: track.durationSec,
            coverUrl: track.coverUrl,
            audioUrl: track.audioUrl,
            genre: track.genre,
            year: track.year,
          });
          existingTitles.add(track.title.toLowerCase());
          newlyAddedToVerified++;
        }
      }
      fs.writeFileSync(verifiedPath, JSON.stringify(existingVerified, null, 2), 'utf-8');
      console.log(`📁 Updated verified_songs.json with ${newlyAddedToVerified} Masoom Sharma tracks.`);
    } catch (e) {
      console.error('Error updating verified_songs.json:', e.message);
    }
  }

  // 6. Create Signature Vibe for Masoom Sharma
  const demoUser = await prisma.user.findFirst();
  if (demoUser && dbSongList.length > 0) {
    let vibe = await prisma.vibe.findFirst({
      where: { title: 'Masoom Sharma Haryanvi Anthems' },
    });

    if (!vibe) {
      vibe = await prisma.vibe.create({
        data: {
          title: 'Masoom Sharma Haryanvi Anthems',
          location: 'Haryana • Rural Desi Beats',
          date: '2026',
          mood: '🔥 Desi Folk & Raw Swagger',
          story: 'High-octane Haryanvi village folklore, raw acoustic swagger, and street anthems by Masoom Sharma.',
          coverUrl: 'https://c.saavncdn.com/artists/Masoom_Sharma_003_20250619064935_500x500.jpg',
          userId: demoUser.id,
        },
      });
      console.log('🌟 Created signature Vibe: "Masoom Sharma Haryanvi Anthems"');
    }

    const topTracks = dbSongList.slice(0, 16);
    for (let i = 0; i < topTracks.length; i++) {
      await prisma.vibeSong.upsert({
        where: {
          vibeId_songId: { vibeId: vibe.id, songId: topTracks[i].id },
        },
        update: { orderIndex: i },
        create: {
          vibeId: vibe.id,
          songId: topTracks[i].id,
          orderIndex: i,
        },
      });
    }
    console.log(`🎶 Attached ${topTracks.length} tracks to "Masoom Sharma Haryanvi Anthems" Vibe!`);
  }

  console.log(`\n🎉 ALL DONE! Masoom Sharma collection (${dbSongList.length} cuts) is now LIVE in VIBE!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
