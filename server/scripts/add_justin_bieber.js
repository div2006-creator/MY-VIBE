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

    return {
      title: song.song.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
      artist: song.primary_artists.split(',')[0].trim(),
      album: song.album.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
      durationSec: Number(song.duration) || 210,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: decryptUrl(song.encrypted_media_url),
      year: Number(song.year) || 2020
    };
  } catch (err) {
    console.error('Error searching:', err);
    return null;
  }
}

async function main() {
  console.log('🔍 Searching and extracting Justin Bieber tracks...');
  const targetQueries = ['Justin Bieber Confident', 'Justin Bieber Intentions'];

  // 1. Find or create Artist: Justin Bieber
  let artist = await prisma.artist.findFirst({
    where: { name: 'Justin Bieber' }
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: 'Justin Bieber',
        bio: 'Global pop superstar and multi-platinum icon with countless chart-topping hits across R&B and dance-pop.',
        avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        genre: 'Pop / R&B'
      }
    });
    console.log('✅ Created Artist: Justin Bieber');
  }

  for (const q of targetQueries) {
    const trackData = await searchSong(q);
    if (!trackData || !trackData.audioUrl) {
      console.log(`❌ Failed to extract ${q}`);
      continue;
    }

    // 2. Find or create Album
    let album = await prisma.album.findFirst({
      where: { title: trackData.album, artistId: artist.id }
    });

    if (!album) {
      album = await prisma.album.create({
        data: {
          title: trackData.album,
          coverUrl: trackData.coverUrl,
          releaseYear: trackData.year,
          artistId: artist.id
        }
      });
      console.log(`✅ Created Album: ${trackData.album}`);
    }

    // 3. Create Song
    const existing = await prisma.song.findFirst({
      where: {
        title: trackData.title,
        artistId: artist.id
      }
    });

    if (existing) {
      console.log(`ℹ️ Song already exists: ${trackData.title}`);
    } else {
      const song = await prisma.song.create({
        data: {
          title: trackData.title,
          durationSec: trackData.durationSec,
          audioUrl: trackData.audioUrl,
          coverUrl: trackData.coverUrl,
          genre: 'Pop / R&B',
          artistId: artist.id,
          albumId: album.id
        }
      });
      console.log(`🎉 Successfully added: ${song.title} (${song.durationSec}s)`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
