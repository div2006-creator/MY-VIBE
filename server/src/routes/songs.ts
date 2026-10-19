import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

async function getUserId(req: AuthRequest) {
  if (req.user?.id) return req.user.id;
  const firstUser = await prisma.user.findFirst();
  return firstUser ? firstUser.id : null;
}

// GET /api/songs - List all songs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true } },
      },
    });

    const formatted = songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist.name,
      artistId: s.artist.id,
      album: s.album?.title,
      durationSec: s.durationSec,
      coverUrl: s.coverUrl,
      audioUrl: s.audioUrl,
      genre: s.genre,
    }));

    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/songs/recently-played
router.get('/recently-played', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.json([]);

    const history = await prisma.listeningHistory.findMany({
      where: { userId },
      take: 10,
      orderBy: { playedAt: 'desc' },
      include: {
        song: {
          include: { artist: { select: { id: true, name: true } } },
        },
        vibe: { select: { id: true, title: true } },
      },
    });

    // Deduplicate songs by ID while retaining recent played timestamp
    const seen = new Set();
    const result: any[] = [];
    for (const h of history) {
      if (!seen.has(h.song.id)) {
        seen.add(h.song.id);
        result.push({
          id: h.song.id,
          title: h.song.title,
          artist: h.song.artist.name,
          durationSec: h.song.durationSec,
          coverUrl: h.song.coverUrl,
          audioUrl: h.song.audioUrl,
          vibeName: h.vibe?.title,
          playedAt: h.playedAt,
        });
      }
    }

    // If history is empty, return top default tracks as recently played
    if (result.length === 0) {
      const defaultSongs = await prisma.song.findMany({
        take: 4,
        include: { artist: { select: { name: true } } },
      });
      return res.json(
        defaultSongs.map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist.name,
          durationSec: s.durationSec,
          coverUrl: s.coverUrl,
          audioUrl: s.audioUrl,
        }))
      );
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/songs/listen - Record listening history
router.post('/listen', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(400).json({ message: 'User required' });

    const { songId, vibeId } = req.body;
    if (!songId) return res.status(400).json({ message: 'songId required' });

    const record = await prisma.listeningHistory.create({
      data: {
        userId,
        songId,
        vibeId: vibeId || null,
      },
    });

    return res.json(record);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/songs/liked - Get user liked songs
router.get('/liked', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.json([]);

    const liked = await prisma.likedSong.findMany({
      where: { userId },
      include: {
        song: {
          include: { artist: { select: { id: true, name: true } }, album: true },
        },
      },
      orderBy: { likedAt: 'desc' },
    });

    const formatted = liked.map((l) => ({
      id: l.song.id,
      title: l.song.title,
      artist: l.song.artist.name,
      artistId: l.song.artist.id,
      album: l.song.album?.title,
      durationSec: l.song.durationSec,
      coverUrl: l.song.coverUrl,
      audioUrl: l.song.audioUrl,
      likedAt: l.likedAt,
    }));

    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/songs/:id/like - Toggle like on song
router.post('/:id/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Auth required' });

    const songId = req.params.id;
    const existing = await prisma.likedSong.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (existing) {
      await prisma.likedSong.delete({
        where: { userId_songId: { userId, songId } },
      });
      return res.json({ liked: false });
    } else {
      await prisma.likedSong.create({
        data: { userId, songId },
      });
      return res.json({ liked: true });
    }
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;
