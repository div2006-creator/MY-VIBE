import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const TRACKS_TO_ADD = [
  {
    title: 'Radhe Radhe Barsane Wali Radhe',
    artist: 'Anuradha Paudwal & Anup Jalota',
    artistBio: 'Padma Shri Anuradha Paudwal and Bhajan Samrat Anup Jalota in the immortal devotional classic.',
    artistAvatar: 'https://c.saavncdn.com/artists/Anuradha_Paudwal_500x500.jpg',
    album: 'Radhe Radhe Barsane Wali',
    durationSec: 627,
    coverUrl: 'https://c.saavncdn.com/854/Radhe-Radhe-Barsane-Wali-Hindi-2021-20220614192058-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/854/cd2ddfa44b17e06bb657ea80fbce423d_320.mp4',
    genre: 'Devotional - Krishna',
    year: 2021
  },
  {
    title: 'Radhe Radhe Barsane Wali Radhe (Maha Kirtan)',
    artist: 'Bihari Ji',
    artistBio: 'Traditional Braj Ras kirtan and devotional singing from Barsana and Vrindavan.',
    artistAvatar: 'https://c.saavncdn.com/035/Radhe-Radhe-Barsane-Wali-Radhe-Hindi-2022-20220913102408-500x500.jpg',
    album: 'Radhe Radhe Barsane Wali Radhe',
    durationSec: 2693,
    coverUrl: 'https://c.saavncdn.com/035/Radhe-Radhe-Barsane-Wali-Radhe-Hindi-2022-20220913102408-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/035/bdb27be7eb4049222928f61a5ece2b10_320.mp4',
    genre: 'Devotional - Krishna',
    year: 2022
  }
];

async function main() {
  console.log('🕉️ Adding Radhe Radhe Barsane Wali Radhe...');

  for (const t of TRACKS_TO_ADD) {
    let artist = await prisma.artist.findFirst({
      where: { name: t.artist }
    });

    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          name: t.artist,
          bio: t.artistBio,
          avatarUrl: t.artistAvatar,
          genre: t.genre
        }
      });
      console.log(`✨ Created Artist: ${artist.name}`);
    }

    let album = await prisma.album.findFirst({
      where: { title: t.album, artistId: artist.id }
    });

    if (!album) {
      album = await prisma.album.create({
        data: {
          title: t.album,
          coverUrl: t.coverUrl,
          releaseYear: t.year,
          artistId: artist.id
        }
      });
      console.log(`✨ Created Album: ${album.title}`);
    }

    const existing = await prisma.song.findFirst({
      where: {
        OR: [
          { title: t.title, artistId: artist.id },
          { audioUrl: t.audioUrl }
        ]
      }
    });

    if (existing) {
      await prisma.song.update({
        where: { id: existing.id },
        data: {
          title: t.title,
          coverUrl: t.coverUrl,
          audioUrl: t.audioUrl,
          durationSec: t.durationSec,
          genre: t.genre,
          albumId: album.id
        }
      });
      console.log(`🔄 Updated Song: ${t.title}`);
    } else {
      await prisma.song.create({
        data: {
          title: t.title,
          durationSec: t.durationSec,
          audioUrl: t.audioUrl,
          coverUrl: t.coverUrl,
          genre: t.genre,
          artistId: artist.id,
          albumId: album.id
        }
      });
      console.log(`✅ Inserted Song: ${t.title} (${Math.floor(t.durationSec/60)}m ${t.durationSec%60}s)`);
    }
  }

  // Sync verified_songs.json
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  if (fs.existsSync(verifiedPath)) {
    const verified = JSON.parse(fs.readFileSync(verifiedPath, 'utf-8'));
    for (const t of TRACKS_TO_ADD) {
      if (!verified.some(s => s.title.toLowerCase() === t.title.toLowerCase())) {
        verified.push({
          title: t.title,
          artist: t.artist,
          artistBio: t.artistBio,
          artistAvatar: t.artistAvatar,
          artistGenre: t.genre,
          album: t.album,
          releaseYear: t.year,
          durationSec: t.durationSec,
          coverUrl: t.coverUrl,
          audioUrl: t.audioUrl,
          genre: t.genre
        });
      }
    }
    fs.writeFileSync(verifiedPath, JSON.stringify(verified, null, 2));
    console.log(`💾 verified_songs.json synced. Total: ${verified.length}`);
  }

  const totalSongs = await prisma.song.count();
  const totalDevotional = await prisma.song.count({
    where: { genre: { contains: 'Devotional' } }
  });
  console.log(`\n📊 Total Devotional Songs: ${totalDevotional}`);
  console.log(`📊 Total Platform Library Songs: ${totalSongs}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
