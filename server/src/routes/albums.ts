import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/albums - List all albums
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const albums = await prisma.album.findMany({
      include: {
        artist: { select: { id: true, name: true } },
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = albums.map((al) => ({
      id: al.id,
      title: al.title,
      coverUrl: al.coverUrl,
      releaseYear: al.releaseYear || 2025,
      artist: al.artist.name,
      artistId: al.artist.id,
      songCount: al._count.songs,
    }));

    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/albums/:id - Album details with tracklist
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        songs: {
          include: {
            artist: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const totalDurationSec = album.songs.reduce((acc, s) => acc + s.durationSec, 0);

    const formatted = {
      id: album.id,
      title: album.title,
      coverUrl: album.coverUrl,
      releaseYear: album.releaseYear || 2025,
      artist: album.artist.name,
      artistId: album.artist.id,
      artistAvatar: album.artist.avatarUrl || album.coverUrl,
      songCount: album.songs.length,
      totalDurationSec,
      songs: album.songs.map((s, index) => ({
        trackNumber: index + 1,
        id: s.id,
        title: s.title,
        artist: album.artist.name,
        artistId: album.artist.id,
        album: album.title,
        durationSec: s.durationSec,
        coverUrl: s.coverUrl,
        audioUrl: s.audioUrl,
        genre: s.genre,
      })),
    };

    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;
