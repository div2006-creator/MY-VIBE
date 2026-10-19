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
const possibleClientDistPaths = [
    path.resolve(__dirname, '../../client/dist'),
    path.resolve(__dirname, '../client/dist'),
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), 'dist')
];
const clientDist = possibleClientDistPaths.find((p) => fs.existsSync(p));
if (clientDist) {
    console.log(`📦 Serving frontend static build from: ${clientDist}`);
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        const indexPath = path.join(clientDist, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        }
        else {
            next();
        }
    });
}
app.listen(PORT, () => {
    console.log(`✨ VIBE API Server running on port ${PORT}`);
});
