import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';

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

async function searchSong(query) {
  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const clean = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    const data = JSON.parse(clean);
    const songs = data.songs?.data || [];
    if (songs.length === 0) return null;
    
    const pid = songs[0].id;
    const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pid}`;
    const detailRes = await fetch(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const detailText = await detailRes.text();
    const cleanDetail = detailText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    const detailData = JSON.parse(cleanDetail);
    const song = detailData[pid];
    if (!song) return null;

    const fullAudioUrl = decryptUrl(song.encrypted_media_url);
    if (!fullAudioUrl) return null;

    return {
      title: song.song.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
      artist: 'Yo Yo Honey Singh',
      album: song.album ? song.album.replace(/&quot;/g, '"').replace(/&#039;/g, "'") : 'Single',
      durationSec: Number(song.duration) || 210,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: fullAudioUrl,
      year: Number(song.year) || 2013,
      genre: 'Desi Hip Hop / Punjabi Pop'
    };
  } catch (err) {
    console.error(`Error searching ${query}:`, err.message);
    return null;
  }
}

const HONEY_SINGH_HITS = [
  'Honey Singh Dope Shope',
  'Honey Singh Brown Rang',
  'Honey Singh Angreji Beat',
  'Honey Singh Blue Eyes',
  'Honey Singh Desi Kalakaar',
  'Honey Singh Love Dose',
  'Honey Singh Lungi Dance',
  'Honey Singh Chaar Botal Vodka',
  'Honey Singh Millionaire Glory',
  'Honey Singh Payal Glory',
  'Honey Singh High Heels',
  'Honey Singh Sunny Sunny',
  'Honey Singh Makhna',
  'Honey Singh Dheere Dheere',
  'Honey Singh Manali Trance',
  'Honey Singh Breakup Party'
];

async function main() {
  console.log('👑 Adding Yo Yo Honey Singh Complete Discography Collection...');

  // 1. Create or Find Artist: Yo Yo Honey Singh
  let artist = await prisma.artist.findFirst({
    where: { name: 'Yo Yo Honey Singh' }
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: 'Yo Yo Honey Singh',
        bio: 'Pioneer of Indian Hip-Hop and Desi Pop music revolution. Cultural phenomenon behind record-breaking albums like International Villager, Desi Kalakaar, and Glory.',
        avatarUrl: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_002_20240902103403_500x500.jpg',
        genre: 'Desi Hip Hop / Punjabi Pop'
      }
    });
    console.log('✅ Created Artist: Yo Yo Honey Singh');
  } else {
    await prisma.artist.update({
      where: { id: artist.id },
      data: {
        avatarUrl: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_002_20240902103403_500x500.jpg',
        bio: 'Pioneer of Indian Hip-Hop and Desi Pop music revolution. Cultural phenomenon behind record-breaking albums like International Villager, Desi Kalakaar, and Glory.'
      }
    });
  }

  let addedCount = 0;

  for (const query of HONEY_SINGH_HITS) {
    const track = await searchSong(query);
    if (!track) {
      console.log(`⚠️ Could not extract: ${query}`);
      continue;
    }

    // 2. Find or create Album
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
      console.log(`📁 Created Album: ${track.album}`);
    }

    // 3. Create Song
    const existing = await prisma.song.findFirst({
      where: {
        title: track.title,
        artistId: artist.id
      }
    });

    if (existing) {
      // Update with full 320kbps audioUrl if not present
      await prisma.song.update({
        where: { id: existing.id },
        data: {
          audioUrl: track.audioUrl,
          durationSec: track.durationSec,
          coverUrl: track.coverUrl
        }
      });
      console.log(`🔄 Updated: ${track.title} (${track.durationSec}s)`);
    } else {
      await prisma.song.create({
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
      console.log(`🔥 Added Full Song: ${track.title} (${track.durationSec}s)`);
      addedCount++;
    }
  }

  console.log(`\n🎉 Successfully processed Honey Singh collection (${addedCount} new songs added)!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
