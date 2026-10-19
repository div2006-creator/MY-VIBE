import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import vibeRoutes from './routes/vibes.js';
import songRoutes from './routes/songs.js';
import searchRoutes from './routes/search.js';
import profileRoutes from './routes/profile.js';
import artistRoutes from './routes/artists.js';
import albumRoutes from './routes/albums.js';
import analyticsRoutes from './routes/analytics.js';
import externalRoutes from './routes/external.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite dev server & local frontend
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

app.listen(PORT, () => {
  console.log(`✨ VIBE API Server running on http://localhost:${PORT}`);
});

