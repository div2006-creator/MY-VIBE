import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, getUserId } from '../middleware/auth.js';
const router = Router();
const prisma = new PrismaClient();
// GET /api/songs - List all songs
router.get('/', async (_req, res) => {
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
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
// GET /api/songs/recently-played
router.get('/recently-played', authenticate, async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.json([]);
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
        const seen = new Set();
        const result = [];
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
        if (result.length === 0) {
            const defaultSongs = await prisma.song.findMany({
                take: 4,
                include: { artist: { select: { name: true } } },
            });
            return res.json(defaultSongs.map((s) => ({
                id: s.id,
                title: s.title,
                artist: s.artist.name,
                durationSec: s.durationSec,
                coverUrl: s.coverUrl,
                audioUrl: s.audioUrl,
            })));
        }
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
// POST /api/songs/listen - Record listening history
router.post('/listen', authenticate, async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.status(400).json({ message: 'User required' });
        const { songId, vibeId } = req.body;
        if (!songId)
            return res.status(400).json({ message: 'songId required' });
        const record = await prisma.listeningHistory.create({
            data: {
                userId,
                songId,
                vibeId: vibeId || null,
            },
        });
        return res.json(record);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
// GET /api/songs/liked - Get user liked songs (guaranteed persistent)
router.get('/liked', authenticate, async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.json([]);
        const liked = await prisma.likedSong.findMany({
            where: { userId },
            include: {
                song: {
                    include: { artist: { select: { id: true, name: true } }, album: true },
                },
            },
            orderBy: { likedAt: 'desc' },
        });
        const formatted = liked
            .filter((l) => Boolean(l.song))
            .map((l) => ({
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
    }
    catch (err) {
        console.error('Fetch liked songs error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
// POST /api/songs/liked/sync - Reconcile and bulk-save liked songs
router.post('/liked/sync', authenticate, async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.status(401).json({ message: 'User resolution failed' });
        const { songIds } = req.body;
        if (Array.isArray(songIds) && songIds.length > 0) {
            for (const songId of songIds) {
                if (!songId || typeof songId !== 'string')
                    continue;
                const existing = await prisma.likedSong.findUnique({
                    where: { userId_songId: { userId, songId } },
                });
                if (!existing) {
                    const songExists = await prisma.song.findUnique({ where: { id: songId } });
                    if (songExists) {
                        await prisma.likedSong.create({ data: { userId, songId } }).catch(() => { });
                    }
                }
            }
        }
        const allLiked = await prisma.likedSong.findMany({
            where: { userId },
            include: {
                song: {
                    include: { artist: { select: { id: true, name: true } }, album: true },
                },
            },
            orderBy: { likedAt: 'desc' },
        });
        const formatted = allLiked
            .filter((l) => Boolean(l.song))
            .map((l) => ({
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
        return res.json({
            likedSongIds: formatted.map((s) => s.id),
            likedSongs: formatted,
        });
    }
    catch (err) {
        console.error('Sync liked songs error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
// POST /api/songs/:id/like - Toggle like on song
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.status(401).json({ message: 'User resolution failed' });
        const songId = req.params.id;
        const song = await prisma.song.findUnique({ where: { id: songId } });
        if (!song)
            return res.status(404).json({ message: 'Song not found' });
        const existing = await prisma.likedSong.findUnique({
            where: { userId_songId: { userId, songId } },
        });
        if (existing) {
            await prisma.likedSong.delete({
                where: { userId_songId: { userId, songId } },
            });
            return res.json({ liked: false, songId });
        }
        else {
            await prisma.likedSong.create({
                data: { userId, songId },
            });
            return res.json({ liked: true, songId });
        }
    }
    catch (err) {
        console.error('Toggle like error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
export default router;
