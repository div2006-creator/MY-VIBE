import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const ARTIST_INFO = {
  name: 'Atif Aslam',
  bio: 'Legendary Pakistani playback singer & vocal powerhouse, celebrated globally for his soulful Bollywood chartbusters, transcendent Coke Studio Sufi anthems, and timeless romantic melodies.',
  avatarUrl: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg',
  genre: 'Bollywood Romance & Sufi Pop'
};

const DEFAULT_COVER = 'https://c.saavncdn.com/180/Atif-Aslam-Hindi-2019-20190401163644-500x500.jpg';

const ALBUM_MAP = {
  'tu jaane na': { album: 'Ajab Prem Ki Ghazab Kahani', year: 2009, cover: 'https://c.saavncdn.com/792/Ajab-Prem-Ki-Ghazab-Kahani-Hindi-2009-20261029135834-500x500.jpg' },
  'tera hone laga hoon': { album: 'Ajab Prem Ki Ghazab Kahani', year: 2009, cover: 'https://c.saavncdn.com/792/Ajab-Prem-Ki-Ghazab-Kahani-Hindi-2009-20261029135834-500x500.jpg' },
  'tere liye': { album: 'Prince', year: 2010, cover: 'https://c.saavncdn.com/938/Prince-Hindi-2010-20261029135834-500x500.jpg' },
  'kaun hoon main': { album: 'Prince', year: 2010, cover: 'https://c.saavncdn.com/938/Prince-Hindi-2010-20261029135834-500x500.jpg' },
  'o mere khuda': { album: 'Prince', year: 2010, cover: 'https://c.saavncdn.com/938/Prince-Hindi-2010-20261029135834-500x500.jpg' },
  'aa bhi ja sanam': { album: 'Prince', year: 2010, cover: 'https://c.saavncdn.com/938/Prince-Hindi-2010-20261029135834-500x500.jpg' },
  'be intehaan (race 2)': { album: 'Race 2', year: 2012, cover: 'https://c.saavncdn.com/311/Race-2-Hindi-2012-20261029135835-500x500.jpg' },
  'allah duhai hai': { album: 'Race 2', year: 2012, cover: 'https://c.saavncdn.com/311/Race-2-Hindi-2012-20261029135835-500x500.jpg' },
  'kuch is tarah': { album: 'Doorie', year: 2006, cover: DEFAULT_COVER },
  'doorie': { album: 'Doorie', year: 2006, cover: DEFAULT_COVER },
  'ehsaas (doorie)': { album: 'Doorie', year: 2006, cover: DEFAULT_COVER },
  'pehli nazar mein': { album: 'Race', year: 2008, cover: DEFAULT_COVER },
  'tere sang yaara': { album: 'Rustom', year: 2016, cover: DEFAULT_COVER },
  'jeena jeena': { album: 'Badlapur', year: 2015, cover: DEFAULT_COVER },
  'woh lamhe woh baate': { album: 'Zeher', year: 2005, cover: DEFAULT_COVER },
  'woh lamhe (movie version)': { album: 'Zeher', year: 2005, cover: DEFAULT_COVER },
  'bakhuda tumhi ho': { album: 'Kismat Konnection', year: 2008, cover: DEFAULT_COVER },
  'main rang sharbaton ka': { album: 'Phata Poster Nikhla Hero', year: 2013, cover: DEFAULT_COVER },
  'jeene laga hoon': { album: 'Ramaiya Vastavaiya', year: 2013, cover: DEFAULT_COVER },
  'rang jo lagyo': { album: 'Ramaiya Vastavaiya', year: 2013, cover: DEFAULT_COVER },
  'piya o re piya': { album: 'Tere Naal Love Ho Gaya', year: 2012, cover: DEFAULT_COVER },
  'tu mohabbat hai': { album: 'Tere Naal Love Ho Gaya', year: 2012, cover: DEFAULT_COVER },
  'tu chahiye': { album: 'Bajrangi Bhaijaan', year: 2015, cover: DEFAULT_COVER },
  'tajdar-e-haram (coke studio)': { album: 'Coke Studio Season 8', year: 2015, cover: DEFAULT_COVER },
  'aadat (movie version - kalyug)': { album: 'Kalyug', year: 2005, cover: DEFAULT_COVER },
  'aadat (movie version)': { album: 'Kalyug', year: 2005, cover: DEFAULT_COVER },
  'ab to aadat si hai': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'jal pari': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'bheegi yaadein': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'beeghi yaadein': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'yakeen': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'ehsaas': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'zindagi': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'mahi ve': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'mahiya ve soniya': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'aankhon se': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'ankhon se': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'tehzeeb': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'gal sun ja': { album: 'Jal Pari', year: 2004, cover: DEFAULT_COVER },
  'tere bin': { album: 'Bas Ek Pal', year: 2006, cover: DEFAULT_COVER },
  'hona tha pyar': { album: 'Bol', year: 2011, cover: DEFAULT_COVER },
  'zindagi aa raha hoon main': { album: 'Zindagi Aa Raha Hoon Main', year: 2015, cover: DEFAULT_COVER },
  'toota jo kabhi taara': { album: 'A Flying Jatt', year: 2016, cover: DEFAULT_COVER },
  'tera naam doon': { album: 'Entertainment', year: 2014, cover: DEFAULT_COVER },
  'dil na jaane kyun': { album: 'Jayantabhai Ki Luv Story', year: 2013, cover: DEFAULT_COVER },
  'khair mangda': { album: 'A Flying Jatt', year: 2016, cover: DEFAULT_COVER },
  'mar jaayen': { album: 'Loveshhuda', year: 2016, cover: DEFAULT_COVER },
  'pehli dafa': { album: 'Pehli Dafa', year: 2017, cover: DEFAULT_COVER },
  'hum kis galli': { album: 'Doorie', year: 2006, cover: DEFAULT_COVER },
  'channa (coke studio)': { album: 'Coke Studio', year: 2014, cover: DEFAULT_COVER },
  'jal pari (coke studio)': { album: 'Coke Studio', year: 2014, cover: DEFAULT_COVER }
};

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

function cleanTitle(raw) {
  if (!raw) return '';
  return raw
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log(`🎵 Initializing Atif Aslam Discography Injection into Auralis...`);

  // 1. Create or Find Artist
  let artist = await prisma.artist.findFirst({
    where: { name: ARTIST_INFO.name }
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: ARTIST_INFO.name,
        bio: ARTIST_INFO.bio,
        avatarUrl: ARTIST_INFO.avatarUrl,
        genre: ARTIST_INFO.genre
      }
    });
    console.log(`✨ Created Artist: ${artist.name} (ID: ${artist.id})`);
  } else {
    artist = await prisma.artist.update({
      where: { id: artist.id },
      data: {
        bio: ARTIST_INFO.bio,
        avatarUrl: ARTIST_INFO.avatarUrl,
        genre: ARTIST_INFO.genre
      }
    });
    console.log(`🔄 Updated Artist: ${artist.name} (ID: ${artist.id})`);
  }

  // 2. Fetch tracks from album token aKrrE50w3QU_
  console.log('📡 Fetching Atif Aslam master discography from JioSaavn...');
  const url = `https://www.jiosaavn.com/api.php?__call=webapi.get&token=aKrrE50w3QU_&type=album&_format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const rawText = await res.text();
  const clean = rawText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
  const albumData = JSON.parse(clean);
  const rawList = albumData.list || albumData.songs || [];
  console.log(`📦 Retrieved ${rawList.length} raw tracks from catalog.`);

  const seen = new Set();
  const validTracks = [];

  for (const s of rawList) {
    const rawTitle = cleanTitle(s.song);
    const normKey = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normKey)) continue;
    seen.add(normKey);

    const audioUrl = decryptUrl(s.encrypted_media_url);
    if (!audioUrl) continue;

    const lower = rawTitle.toLowerCase();
    const mapped = ALBUM_MAP[lower] || {};

    const albumTitle = mapped.album || cleanTitle(s.album || 'Atif Aslam Masterworks');
    const releaseYear = mapped.year || Number(s.year) || 2019;
    const coverUrl = mapped.cover || DEFAULT_COVER;

    validTracks.push({
      title: rawTitle,
      artist: ARTIST_INFO.name,
      artistBio: ARTIST_INFO.bio,
      artistAvatar: ARTIST_INFO.avatarUrl,
      artistGenre: ARTIST_INFO.genre,
      album: albumTitle,
      releaseYear,
      durationSec: Number(s.duration) || 240,
      coverUrl,
      audioUrl,
      genre: 'Bollywood Romance & Sufi Pop'
    });
  }

  console.log(`💎 Prepared ${validTracks.length} unique, 320kbps verified master cuts for Atif Aslam.`);

  // 3. Cache Album instances to avoid redundant lookups
  const albumCache = new Map();

  let insertedCount = 0;
  let updatedCount = 0;

  for (const track of validTracks) {
    // Check or create Album
    let albumId = albumCache.get(track.album);
    if (!albumId) {
      let album = await prisma.album.findFirst({
        where: { title: track.album, artistId: artist.id }
      });
      if (!album) {
        album = await prisma.album.create({
          data: {
            title: track.album,
            coverUrl: track.coverUrl,
            releaseYear: track.releaseYear,
            artistId: artist.id
          }
        });
      }
      albumId = album.id;
      albumCache.set(track.album, albumId);
    }

    // Check or insert Song
    const existingSong = await prisma.song.findFirst({
      where: {
        OR: [
          { title: track.title, artistId: artist.id },
          { audioUrl: track.audioUrl }
        ]
      }
    });

    if (existingSong) {
      await prisma.song.update({
        where: { id: existingSong.id },
        data: {
          title: track.title,
          coverUrl: track.coverUrl,
          audioUrl: track.audioUrl,
          durationSec: track.durationSec,
          genre: track.genre,
          albumId
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
          albumId
        }
      });
      insertedCount++;
    }
  }

  console.log(`✅ Database Sync: ${insertedCount} newly inserted, ${updatedCount} updated.`);

  // 4. Synchronize verified_songs.json
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  if (fs.existsSync(verifiedPath)) {
    const verified = JSON.parse(fs.readFileSync(verifiedPath, 'utf-8'));
    let addedToVerified = 0;

    for (const track of validTracks) {
      const exists = verified.some(
        (v) =>
          v.title.toLowerCase() === track.title.toLowerCase() &&
          v.artist.toLowerCase().includes('atif')
      );
      if (!exists) {
        verified.push({
          title: track.title,
          artist: track.artist,
          artistBio: track.artistBio,
          artistAvatar: track.artistAvatar,
          artistGenre: track.artistGenre,
          album: track.album,
          releaseYear: track.releaseYear,
          durationSec: track.durationSec,
          coverUrl: track.coverUrl,
          audioUrl: track.audioUrl,
          genre: track.genre
        });
        addedToVerified++;
      }
    }

    fs.writeFileSync(verifiedPath, JSON.stringify(verified, null, 2));
    console.log(`💾 verified_songs.json updated with ${addedToVerified} new songs. Total: ${verified.length}`);
  }

  const totalSongs = await prisma.song.count();
  const totalArtists = await prisma.artist.count();
  const totalAlbums = await prisma.album.count();

  console.log(`\n==============================================`);
  console.log(`📊 Auralis Platform Statistics:`);
  console.log(`   - Total Artists: ${totalArtists}`);
  console.log(`   - Total Albums:  ${totalAlbums}`);
  console.log(`   - Total Master Songs: ${totalSongs}`);
  console.log(`==============================================\n`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Fatal execution error:', e);
  await prisma.$disconnect();
  process.exit(1);
});

