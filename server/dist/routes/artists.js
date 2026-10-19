import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();
// GET /api/artists - List all artists
router.get('/', async (req, res) => {
    try {
        const artists = await prisma.artist.findMany({
            include: {
                _count: {
                    select: { songs: true, albums: true },
                },
                songs: {
                    include: {
                        album: { select: { id: true, title: true } },
                    },
                },
            },
        });
        // Sort by song count descending so top artists with rich libraries appear first
        artists.sort((a, b) => b._count.songs - a._count.songs);
        const formatted = artists.map((a) => ({
            id: a.id,
            name: a.name,
            avatarUrl: a.avatarUrl || a.songs[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
            bio: a.bio,
            genre: a.genre || 'Popular',
            songCount: a._count.songs,
            albumCount: a._count.albums,
            songs: a.songs.map((s) => ({
                id: s.id,
                title: s.title,
                artist: a.name,
                artistId: a.id,
                album: s.album?.title,
                durationSec: s.durationSec,
                coverUrl: s.coverUrl,
                audioUrl: s.audioUrl,
                genre: s.genre,
            })),
        }));
        return res.json(formatted);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
// GET /api/artists/:id - Artist detail
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await prisma.artist.findUnique({
            where: { id },
            include: {
                songs: {
                    include: {
                        album: { select: { id: true, title: true } },
                    },
                },
                albums: {
                    include: {
                        _count: { select: { songs: true } },
                    },
                },
            },
        });
        if (!artist) {
            return res.status(404).json({ message: 'Artist not found' });
        }
        // Find other artists as related
        const relatedArtists = await prisma.artist.findMany({
            where: { id: { not: id } },
            take: 4,
            select: { id: true, name: true, avatarUrl: true, genre: true },
        });
        const formattedArtist = {
            id: artist.id,
            name: artist.name,
            avatarUrl: artist.avatarUrl || artist.songs[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
            bio: artist.bio || `${artist.name} is an independent artist delivering soulful atmospheres and unforgettable soundscapes.`,
            genre: artist.genre || 'Indie & Ambient',
            monthlyListeners: Math.floor(Math.random() * 400000) + 150000,
            songs: artist.songs.map((s) => ({
                id: s.id,
                title: s.title,
                artist: artist.name,
                artistId: artist.id,
                album: s.album?.title,
                albumId: s.album?.id,
                durationSec: s.durationSec,
                coverUrl: s.coverUrl,
                audioUrl: s.audioUrl,
                genre: s.genre,
            })),
            albums: artist.albums.map((al) => ({
                id: al.id,
                title: al.title,
                coverUrl: al.coverUrl,
                releaseYear: al.releaseYear || 2025,
                songCount: al._count.songs,
                artistName: artist.name,
            })),
            relatedArtists: relatedArtists.map((r) => ({
                id: r.id,
                name: r.name,
                avatarUrl: r.avatarUrl,
                genre: r.genre,
            })),
        };
        return res.json(formattedArtist);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});
export default router;
