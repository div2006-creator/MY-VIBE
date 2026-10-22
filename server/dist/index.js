import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import vibeRoutes from './routes/vibes.js';
import songRoutes from './routes/songs.js';
import searchRoutes from './routes/search.js';
import profileRoutes from './routes/profile.js';
import artistRoutes from './routes/artists.js';
import albumRoutes from './routes/albums.js';
import analyticsRoutes from './routes/analytics.js';
import externalRoutes from './routes/external.js';
import './supabase.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
// Enable CORS for API
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'VIBE API', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vibes', vibeRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/external', externalRoutes);
// Serve frontend static build in production
const staticSearchPaths = [
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, '../../client/dist'),
    path.resolve(__dirname, '../client/dist'),
    process.cwd(),
];
// Serve assets directory specifically
app.use('/assets', express.static(path.resolve(process.cwd(), 'assets')));
app.use('/assets', express.static(path.resolve(process.cwd(), 'client/dist/assets')));
app.use('/assets', express.static(path.resolve(__dirname, '../../client/dist/assets')));
// Register static handlers for existing candidate directories
for (const dir of staticSearchPaths) {
    if (fs.existsSync(dir)) {
        app.use(express.static(dir));
    }
}
// SPA fallback for client-side routing
app.get('*', (req, res, next) => {
    // Never serve HTML for API or static assets
    if (req.path.startsWith('/api') ||
        req.path.startsWith('/assets') ||
        req.path.match(/\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|json)$/i)) {
        return next();
    }
    const indexCandidates = [
        path.resolve(process.cwd(), 'client/dist/index.html'),
        path.resolve(process.cwd(), 'index.html'),
        path.resolve(__dirname, '../../client/dist/index.html'),
    ];
    const foundIndex = indexCandidates.find((p) => fs.existsSync(p));
    if (foundIndex) {
        res.sendFile(foundIndex);
    }
    else {
        next();
    }
});
app.listen(PORT, () => {
    console.log(`✨ VIBE API Server running on port ${PORT}`);
});
