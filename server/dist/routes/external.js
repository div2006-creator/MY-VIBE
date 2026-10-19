import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import CryptoJS from 'crypto-js';
const router = Router();
const prisma = new PrismaClient();
// Helper to decrypt JioSaavn 320kbps full song audio stream
function decryptJioSaavnUrl(enc) {
    if (!enc)
        return null;
    try {
        const key = CryptoJS.enc.Utf8.parse('38346591');
        const decrypted = CryptoJS.DES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(enc) }, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        const url = decrypted.toString(CryptoJS.enc.Utf8);
        if (!url)
            return null;
        return url.replace('_96.mp4', '_320.mp4');
    }
    catch (err) {
        return null;
    }
}
// Helper to sanitize artwork to high resolution
function sanitizeCover(url) {
    if (!url)
        return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
    return url.replace('150x150', '500x500').replace('50x50', '500x500');
}
// GET /api/external/search?q=query&limit=25
router.get('/search', async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) {
            return res.json({ results: [] });
        }
        // 1. Search JioSaavn for full 3-5 minute 320kbps songs
        const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(q)}`;
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const searchText = await searchRes.text();
        const cleanSearch = searchText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
        const searchData = JSON.parse(cleanSearch);
        const rawSongs = searchData.songs?.data || [];
        // Check which songs are already in our local database
        const existingSongs = await prisma.song.findMany({
            select: { id: true, audioUrl: true },
        });
        const existingMap = new Map(existingSongs.map((s) => [s.audioUrl, s.id]));
        if (rawSongs.length > 0) {
            const pids = rawSongs.slice(0, 12).map((s) => s.id).join(',');
            const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pids}`;
            const detailRes = await fetch(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const detailText = await detailRes.text();
            const cleanDetail = detailText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
            const detailData = JSON.parse(cleanDetail);
            const fullResults = [];
            for (const raw of rawSongs.slice(0, 12)) {
                const item = detailData[raw.id];
                if (item && item.encrypted_media_url) {
                    const fullAudioUrl = decryptJioSaavnUrl(item.encrypted_media_url);
                    if (fullAudioUrl) {
                        const isImported = existingMap.has(fullAudioUrl);
                        fullResults.push({
                            id: existingMap.get(fullAudioUrl) || `ext-${item.id}`,
                            externalId: item.id,
                            title: item.song.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
                            artist: item.primary_artists.split(',')[0].trim(),
                            album: item.album ? item.album.replace(/&quot;/g, '"').replace(/&#039;/g, "'") : 'Single',
                            durationSec: Number(item.duration) || 210,
                            coverUrl: sanitizeCover(item.image),
                            audioUrl: fullAudioUrl,
                            genre: item.language || 'Popular',
                            releaseYear: Number(item.year) || 2023,
                            isImported,
                            isFullSong: true,
                            quality: '320kbps Full Track',
                            source: 'JioSaavn Network',
                        });
                    }
                }
            }
            if (fullResults.length > 0) {
                return res.json({ results: fullResults });
            }
        }
        // 2. Fallback to iTunes if JioSaavn yields no match
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=10&country=IN`;
        const itunesRes = await fetch(itunesUrl);
        const itunesData = await itunesRes.json();
        const itunesItems = (itunesData.results || []).filter((item) => item.previewUrl);
        const formatted = itunesItems.map((item) => {
            const isImported = existingMap.has(item.previewUrl);
            return {
                id: existingMap.get(item.previewUrl) || `ext-${item.trackId}`,
                externalId: item.trackId,
                title: item.trackName,
                artist: item.artistName,
                album: item.collectionName || 'Single',
                durationSec: Math.round((item.trackTimeMillis || 30000) / 1000),
                coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '',
                audioUrl: item.previewUrl,
                genre: item.primaryGenreName || 'Pop',
                releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2024,
                isImported,
                isFullSong: false,
                quality: 'High Fidelity',
                source: 'iTunes Network',
            };
        });
        return res.json({ results: formatted });
    }
    catch (err) {
        console.error('External search error:', err);
        return res.status(500).json({ message: err.message || 'Failed to search external music' });
    }
});
// POST /api/external/import - Import a full song into SQLite database
router.post('/import', async (req, res) => {
    try {
        const { title, artist, album, durationSec, coverUrl, audioUrl, genre, releaseYear } = req.body;
        if (!title || !artist || !audioUrl) {
            return res.status(400).json({ message: 'Title, artist, and audioUrl are required' });
        }
        // 1. Check if song already exists with this audioUrl
        const existing = await prisma.song.findFirst({
            where: { audioUrl },
            include: { artist: true, album: true },
        });
        if (existing) {
            return res.json({
                message: 'Song already in library',
                song: {
                    id: existing.id,
                    title: existing.title,
                    artist: existing.artist.name,
                    artistId: existing.artist.id,
                    album: existing.album?.title,
                    durationSec: existing.durationSec,
                    coverUrl: existing.coverUrl,
                    audioUrl: existing.audioUrl,
                    genre: existing.genre,
                },
            });
        }
        // 2. Find or create Artist
        let artistRecord = await prisma.artist.findFirst({
            where: { name: artist },
        });
        if (!artistRecord) {
            artistRecord = await prisma.artist.create({
                data: {
                    name: artist,
                    bio: `${artist} is an internationally acclaimed recording artist.`,
                    avatarUrl: coverUrl,
                    genre: genre || 'Popular',
                },
            });
        }
        // 3. Find or create Album
        const albumTitle = album || `${title} - Single`;
        let albumRecord = await prisma.album.findFirst({
            where: { title: albumTitle, artistId: artistRecord.id },
        });
        if (!albumRecord) {
            albumRecord = await prisma.album.create({
                data: {
                    title: albumTitle,
                    coverUrl: coverUrl,
                    releaseYear: releaseYear || new Date().getFullYear(),
                    artistId: artistRecord.id,
                },
            });
        }
        // 4. Create Song
        const newSong = await prisma.song.create({
            data: {
                title,
                durationSec: Number(durationSec) || 210,
                audioUrl,
                coverUrl,
                genre: genre || 'Popular',
                artistId: artistRecord.id,
                albumId: albumRecord.id,
            },
            include: {
                artist: { select: { id: true, name: true } },
                album: { select: { id: true, title: true } },
            },
        });
        return res.status(201).json({
            message: 'Full Song successfully imported into VIBE library!',
            song: {
                id: newSong.id,
                title: newSong.title,
                artist: newSong.artist.name,
                artistId: newSong.artist.id,
                album: newSong.album?.title,
                durationSec: newSong.durationSec,
                coverUrl: newSong.coverUrl,
                audioUrl: newSong.audioUrl,
                genre: newSong.genre,
            },
        });
    }
    catch (err) {
        console.error('Import error:', err);
        return res.status(500).json({ message: err.message || 'Failed to import song' });
    }
});
export default router;
