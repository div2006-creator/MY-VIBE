import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const TRACK = {
  title: 'Kalyani',
  artist: 'Shreya Ghoshal',
  allArtists: 'Shreya Ghoshal, ARJN, KDS, FIFTY4',
  artistBio: 'Five-time National Film Award winner and iconic Indian playback queen celebrated globally for her expressive, celestial voice.',
  artistAvatar: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg',
  artistGenre: 'Bollywood, Indie Pop & Classical Fusion',
  album: 'KALYANI',
  durationSec: 269,
  coverUrl: 'https://c.saavncdn.com/475/KALYANI-Remix-Malayalam-2026-20260622131127-500x500.jpg',
  audioUrl: 'https://aac.saavncdn.com/475/5fc341ce2ad68492fce5ed0bf4655f8f_320.mp4',
  genre: 'Indie Folk Fusion & Pop',
  year: 2026
};

async function main() {
  console.log(`🎵 Adding "${TRACK.title}" by ${TRACK.artist}...`);

  // 1. Create or Find Artist: Shreya Ghoshal
  let artist = await prisma.artist.findFirst({
    where: { name: TRACK.artist }
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: TRACK.artist,
        bio: TRACK.artistBio,
        avatarUrl: TRACK.artistAvatar,
        genre: TRACK.artistGenre
      }
    });
    console.log(`✨ Created Artist: ${artist.name}`);
  } else {
    artist = await prisma.artist.update({
      where: { id: artist.id },
      data: {
        avatarUrl: TRACK.artistAvatar,
        bio: TRACK.artistBio
      }
    });
    console.log(`🔄 Updated Artist: ${artist.name}`);
  }

  // 2. Create or Find Album
  let album = await prisma.album.findFirst({
    where: { title: TRACK.album, artistId: artist.id }
  });

  if (!album) {
    album = await prisma.album.create({
      data: {
        title: TRACK.album,
        coverUrl: TRACK.coverUrl,
        releaseYear: TRACK.year,
        artistId: artist.id
      }
    });
    console.log(`✨ Created Album: ${album.title}`);
  }

  // 3. Create or Update Song
  const existingSong = await prisma.song.findFirst({
    where: {
      OR: [
        { title: TRACK.title, artistId: artist.id },
        { audioUrl: TRACK.audioUrl }
      ]
    }
  });

  if (existingSong) {
    await prisma.song.update({
      where: { id: existingSong.id },
      data: {
        title: TRACK.title,
        coverUrl: TRACK.coverUrl,
        audioUrl: TRACK.audioUrl,
        durationSec: TRACK.durationSec,
        genre: TRACK.genre,
        albumId: album.id
      }
    });
    console.log(`🔄 Updated Song: ${TRACK.title}`);
  } else {
    await prisma.song.create({
      data: {
        title: TRACK.title,
        durationSec: TRACK.durationSec,
        audioUrl: TRACK.audioUrl,
        coverUrl: TRACK.coverUrl,
        genre: TRACK.genre,
        artistId: artist.id,
        albumId: album.id
      }
    });
    console.log(`✅ Inserted Song: ${TRACK.title} (${Math.floor(TRACK.durationSec / 60)}m ${TRACK.durationSec % 60}s)`);
  }

  // 4. Update verified_songs.json
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  if (fs.existsSync(verifiedPath)) {
    const verified = JSON.parse(fs.readFileSync(verifiedPath, 'utf-8'));
    if (!verified.some(s => s.title.toLowerCase() === TRACK.title.toLowerCase() && s.artist.toLowerCase().includes('shreya'))) {
      verified.push({
        title: TRACK.title,
        artist: TRACK.artist,
        artistBio: TRACK.artistBio,
        artistAvatar: TRACK.artistAvatar,
        artistGenre: TRACK.artistGenre,
        album: TRACK.album,
        releaseYear: TRACK.year,
        durationSec: TRACK.durationSec,
        coverUrl: TRACK.coverUrl,
        audioUrl: TRACK.audioUrl,
        genre: TRACK.genre
      });
      fs.writeFileSync(verifiedPath, JSON.stringify(verified, null, 2));
      console.log(`💾 verified_songs.json updated. Total: ${verified.length}`);
    }
  }

  const totalSongs = await prisma.song.count();
  console.log(`\n📊 Total Platform Library Songs: ${totalSongs}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
