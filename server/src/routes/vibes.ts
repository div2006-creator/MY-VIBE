import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to get active user ID or fallback demo user ID
async function getUserId(req: AuthRequest) {
  if (req.user?.id) return req.user.id;
  const firstUser = await prisma.user.findFirst();
  return firstUser ? firstUser.id : null;
}

// GET /api/vibes - Get vibes timeline
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await getUserId(req);
    const vibes = await prisma.vibe.findMany({
      where: userId ? { userId } : {},
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        vibeSongs: {
          include: {
            song: {
              include: { artist: { select: { id: true, name: true } } },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = vibes.map((v) => ({
      id: v.id,
      title: v.title,
      location: v.location,
      date: v.date,
      mood: v.mood,
      story: v.story,
      coverUrl: v.coverUrl,
      songCount: v.vibeSongs.length,
      createdAt: v.createdAt,
      user: v.user,
      songs: v.vibeSongs.map((vs) => ({
        id: vs.song.id,
        title: vs.song.title,
        artist: vs.song.artist.name,
        durationSec: vs.song.durationSec,
        coverUrl: vs.song.coverUrl,
        audioUrl: vs.song.audioUrl,
      })),
    }));

    return res.json(formatted);
  } catch (err: any) {
    console.error('Fetch vibes error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/vibes/explore - Categorized Vibes
router.get('/explore', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allVibes = await prisma.vibe.findMany({
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        vibeSongs: {
          include: {
            song: { include: { artist: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedVibes = allVibes.map((v) => ({
      id: v.id,
      title: v.title,
      location: v.location,
      date: v.date,
      mood: v.mood,
      story: v.story,
      coverUrl: v.coverUrl,
      songCount: v.vibeSongs.length,
      user: v.user,
      songs: v.vibeSongs.map((vs) => ({
        id: vs.song.id,
        title: vs.song.title,
        artist: vs.song.artist.name,
        durationSec: vs.song.durationSec,
        coverUrl: vs.song.coverUrl,
        audioUrl: vs.song.audioUrl,
      })),
    }));

    const categories = [
      { id: 'trending', name: '🔥 Trending Vibes', vibes: formattedVibes.slice(0, 4) },
      { id: 'late-night', name: '🌙 Late Night Coding & Chill', vibes: formattedVibes.filter(v => v.mood.includes('Chill') || v.title.includes('Coding')) },
      { id: 'road-trips', name: '🚗 Road Trips & Drives', vibes: formattedVibes.filter(v => v.title.includes('Trip') || v.title.includes('Drive')) },
      { id: 'college', name: '🎓 College & Memories', vibes: formattedVibes.filter(v => v.title.includes('College') || v.title.includes('First Day')) },
      { id: 'rainy', name: '🌧️ Rainy Days', vibes: formattedVibes.filter(v => v.mood.includes('Rainy') || v.title.includes('Monsoon')) },
      { id: 'summer', name: '☀️ Summer & Beach', vibes: formattedVibes.filter(v => v.mood.includes('Warm') || v.title.includes('Beach')) },
    ];

    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/vibes/:id - Single vibe detail
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vibe = await prisma.vibe.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, bio: true } },
        vibeSongs: {
          include: {
            song: {
              include: { artist: { select: { id: true, name: true } }, album: true },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!vibe) return res.status(404).json({ message: 'Vibe not found' });

    return res.json({
      id: vibe.id,
      title: vibe.title,
      location: vibe.location,
      date: vibe.date,
      mood: vibe.mood,
      story: vibe.story,
      coverUrl: vibe.coverUrl,
      createdAt: vibe.createdAt,
      user: vibe.user,
      songs: vibe.vibeSongs.map((vs) => ({
        id: vs.song.id,
        title: vs.song.title,
        artist: vs.song.artist.name,
        artistId: vs.song.artist.id,
        album: vs.song.album?.title,
        durationSec: vs.song.durationSec,
        coverUrl: vs.song.coverUrl,
        audioUrl: vs.song.audioUrl,
        addedAt: vs.addedAt,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/vibes - Create new Vibe
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const { title, date, location, mood, story, coverUrl, songIds } = req.body;

    if (!title || !date || !location || !mood) {
      return res.status(400).json({ message: 'Title, Date, Location, and Mood are required' });
    }

    const defaultCover = coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';

    const vibe = await prisma.vibe.create({
      data: {
        title,
        date,
        location,
        mood,
        story: story || '',
        coverUrl: defaultCover,
        userId,
      },
    });

    if (Array.isArray(songIds) && songIds.length > 0) {
      for (let i = 0; i < songIds.length; i++) {
        await prisma.vibeSong.create({
          data: {
            vibeId: vibe.id,
            songId: songIds[i],
            orderIndex: i,
          },
        });
      }
    }

    return res.status(201).json(vibe);
  } catch (err: any) {
    console.error('Create vibe error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/vibes/:id/songs - Add song to Vibe
router.post('/:id/songs', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ message: 'Song ID is required' });

    const existingCount = await prisma.vibeSong.count({ where: { vibeId: id } });

    const vibeSong = await prisma.vibeSong.upsert({
      where: { vibeId_songId: { vibeId: id, songId } },
      update: {},
      create: {
        vibeId: id,
        songId,
        orderIndex: existingCount,
      },
    });

    return res.json(vibeSong);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// DELETE /api/vibes/:id/songs/:songId - Remove song from Vibe
router.delete('/:id/songs/:songId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id, songId } = req.params;
    await prisma.vibeSong.delete({
      where: { vibeId_songId: { vibeId: id, songId } },
    });
    return res.json({ message: 'Song removed from vibe' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// DELETE /api/vibes/:id - Delete vibe
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.vibe.delete({ where: { id } });
    return res.json({ message: 'Vibe deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;
