import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
const router = Router();
const prisma = new PrismaClient();
async function getUserId(req) {
    if (req.user?.id)
        return req.user.id;
    const firstUser = await prisma.user.findFirst();
    return firstUser ? firstUser.id : null;
}
// GET /api/profile
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.status(404).json({ message: 'User not found' });
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                vibes: {
                    include: {
                        vibeSongs: {
                            include: {
                                song: {
                                    include: { artist: { select: { id: true, name: true } } },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Calculate stats
        const totalVibes = user.vibes.length;
        let totalSongs = 0;
        const artistCounts = {};
        user.vibes.forEach((v) => {
            totalSongs += v.vibeSongs.length;
            v.vibeSongs.forEach((vs) => {
                const art = vs.song.artist;
                if (!artistCounts[art.name]) {
                    artistCounts[art.name] = { id: art.id, name: art.name, count: 0 };
                }
                artistCounts[art.name].count += 1;
            });
        });
        const favoriteArtists = Object.values(artistCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const formattedVibes = user.vibes.map((v) => ({
            id: v.id,
            title: v.title,
            location: v.location,
            date: v.date,
            mood: v.mood,
            story: v.story,
            coverUrl: v.coverUrl,
            songCount: v.vibeSongs.length,
            createdAt: v.createdAt,
            songs: v.vibeSongs.map((vs) => ({
                id: vs.song.id,
                title: vs.song.title,
                artist: vs.song.artist.name,
                durationSec: vs.song.durationSec,
                coverUrl: vs.song.coverUrl,
                audioUrl: vs.song.audioUrl,
            })),
        }));
        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                favoriteMood: user.favoriteMood || '😎 Nostalgic & Free',
            },
            stats: {
                totalVibes,
                totalSongs,
                favoriteMood: user.favoriteMood || '😎 Nostalgic & Free',
                favoriteArtists,
            },
            vibesTimeline: formattedVibes,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
// PUT /api/profile - Update profile details
router.put('/', authenticate, async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.status(401).json({ message: 'Auth required' });
        const { name, bio, avatarUrl, favoriteMood } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(bio !== undefined && { bio }),
                ...(avatarUrl && { avatarUrl }),
                ...(favoriteMood && { favoriteMood }),
            },
        });
        return res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatarUrl,
            bio: updatedUser.bio,
            favoriteMood: updatedUser.favoriteMood,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
export default router;
