import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();
// GET /api/search?q=query
router.get('/', async (req, res) => {
    try {
        const q = (req.query.q || '').trim().toLowerCase();
        if (!q) {
            return res.json({ songs: [], vibes: [], artists: [], albums: [] });
        }
        const [songs, vibes, artists, albums] = await Promise.all([
            prisma.song.findMany({
                where: {
                    OR: [
                        { title: { contains: q } },
                        { genre: { contains: q } },
                        { artist: { name: { contains: q } } },
                    ],
                },
                include: { artist: { select: { name: true } }, album: { select: { title: true } } },
                take: 10,
            }),
            prisma.vibe.findMany({
                where: {
                    OR: [
                        { title: { contains: q } },
                        { location: { contains: q } },
                        { mood: { contains: q } },
                        { story: { contains: q } },
                    ],
                },
                include: {
                    user: { select: { name: true } },
                    vibeSongs: { include: { song: true } },
                },
                take: 10,
            }),
            prisma.artist.findMany({
                where: {
                    OR: [
                        { name: { contains: q } },
                        { genre: { contains: q } },
                    ],
                },
                take: 5,
            }),
            prisma.album.findMany({
                where: {
                    title: { contains: q },
                },
                include: { artist: { select: { name: true } } },
                take: 5,
            }),
        ]);
        return res.json({
            songs: songs.map((s) => ({
                id: s.id,
                title: s.title,
                artist: s.artist.name,
                album: s.album?.title,
                durationSec: s.durationSec,
                coverUrl: s.coverUrl,
                audioUrl: s.audioUrl,
            })),
            vibes: vibes.map((v) => ({
                id: v.id,
                title: v.title,
                location: v.location,
                date: v.date,
                mood: v.mood,
                story: v.story,
                coverUrl: v.coverUrl,
                songCount: v.vibeSongs.length,
                userName: v.user.name,
            })),
            artists: artists.map((a) => ({
                id: a.id,
                name: a.name,
                avatarUrl: a.avatarUrl,
                genre: a.genre,
            })),
            albums: albums.map((al) => ({
                id: al.id,
                title: al.title,
                coverUrl: al.coverUrl,
                artist: al.artist.name,
            })),
        });
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
export default router;
