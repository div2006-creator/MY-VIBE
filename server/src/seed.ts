import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('✨ Seeding VIBE Database with Extracted Punjabi, Hindi & English Music...');

  // 1. Read verified songs extracted from 3rd-party music network
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  let songsData: any[] = [];
  
  if (fs.existsSync(verifiedPath)) {
    songsData = JSON.parse(fs.readFileSync(verifiedPath, 'utf-8'));
  }

  if (songsData.length === 0) {
    console.error('No verified songs found in verified_songs.json');
    return;
  }

  // 2. Clean existing database tables
  await prisma.listeningHistory.deleteMany();
  await prisma.likedSong.deleteMany();
  await prisma.vibeSong.deleteMany();
  await prisma.vibe.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();

  // 3. Create Demo User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'alex@vibe.com',
      password: hashedPassword,
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'VIBE Curator • Blending Punjabi anthems, soulful Bollywood melodies & midnight synthwave 🎶',
      favoriteMood: '⚡ Electric & Soulful',
    },
  });

  // 4. Create Artists & Albums
  const artistMap = new Map<string, any>();
  const albumMap = new Map<string, any>();

  for (const track of songsData) {
    if (!artistMap.has(track.artist)) {
      const artist = await prisma.artist.create({
        data: {
          name: track.artist,
          bio: track.artistBio || `${track.artist} is an internationally acclaimed recording artist.`,
          avatarUrl: track.artistAvatar || track.coverUrl,
          genre: track.artistGenre || track.genre,
        },
      });
      artistMap.set(track.artist, artist);
    }

    const artist = artistMap.get(track.artist);
    const albumKey = `${track.artist}-${track.album}`;
    if (!albumMap.has(albumKey)) {
      const album = await prisma.album.create({
        data: {
          title: track.album,
          coverUrl: track.coverUrl,
          releaseYear: track.releaseYear || 2022,
          artistId: artist.id,
        },
      });
      albumMap.set(albumKey, album);
    }
  }

  // 5. Create Songs
  const createdSongs: any[] = [];
  for (const track of songsData) {
    const artist = artistMap.get(track.artist);
    const album = albumMap.get(`${track.artist}-${track.album}`);

    const song = await prisma.song.create({
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
    createdSongs.push(song);
  }

  console.log(`✅ Inserted ${createdSongs.length} real Punjabi, Hindi & English tracks!`);

  // 6. Create Curated Real Vibes
  const sampleVibes = [
    {
      title: 'Chandigarh Gedi Route & Bass Anthems',
      location: 'Sector 8 & 9 Gedi Route, Chandigarh',
      date: '18 October 2026',
      mood: '🔥 Punjabi Heat & Swagger',
      story: 'Windows rolled down, sunroof open, rolling down Sector 9 with Sidhu Moose Wala 295 and Diljit Lover rattling the door panels. High-energy Punjabi beats reverberating under the night lights.',
      coverUrl: createdSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      songIndices: [0, 2, 5, 7, 9], // 295, Lover, Tauba Tauba, Brown Munde, Baller
    },
    {
      title: 'Monsoon Rain & Arijit Ballads in Shimla',
      location: 'The Ridge, Shimla',
      date: '12 August 2026',
      mood: '🌧️ Soulful & Romantic',
      story: 'Sipping steaming kulhad chai on a wooden balcony overlooking misty Himalayan pine hills while Kesariya and Tum Hi Ho played softly. Pure monsoon emotion.',
      coverUrl: createdSongs[11]?.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
      songIndices: [11, 12, 15, 17, 19], // Kesariya, Tum Hi Ho, Jeene Laga Hoon, Zara Sa, Husn
    },
    {
      title: 'Midnight Coding & Neon City Drives',
      location: 'Bandra-Worli Sea Link, Mumbai',
      date: '05 September 2026',
      mood: '⚡ Nocturnal & Electric',
      story: 'Cruising past the glowing skyline at 2 AM with The Weeknd Blinding Lights and Taylor Swift Cruel Summer ringing in the air. Clean ocean air and infinite focus.',
      coverUrl: createdSongs[21]?.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
      songIndices: [21, 23, 25, 27, 28], // Blinding Lights, Cruel Summer, Shape of You, Sunflower, Yellow
    },
  ];

  for (const vData of sampleVibes) {
    const vibe = await prisma.vibe.create({
      data: {
        title: vData.title,
        location: vData.location,
        date: vData.date,
        mood: vData.mood,
        story: vData.story,
        coverUrl: vData.coverUrl,
        userId: user.id,
      },
    });

    for (let i = 0; i < vData.songIndices.length; i++) {
      const song = createdSongs[vData.songIndices[i]];
      if (song) {
        await prisma.vibeSong.create({
          data: {
            vibeId: vibe.id,
            songId: song.id,
            orderIndex: i,
          },
        });
      }
    }
  }

  // 7. Liked Songs for Demo User
  if (createdSongs[0]) await prisma.likedSong.create({ data: { userId: user.id, songId: createdSongs[0].id } });
  if (createdSongs[2]) await prisma.likedSong.create({ data: { userId: user.id, songId: createdSongs[2].id } });
  if (createdSongs[11]) await prisma.likedSong.create({ data: { userId: user.id, songId: createdSongs[11].id } });
  if (createdSongs[21]) await prisma.likedSong.create({ data: { userId: user.id, songId: createdSongs[21].id } });

  console.log('🎉 Seeding successfully completed with real Punjabi, Hindi & English tracks!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
