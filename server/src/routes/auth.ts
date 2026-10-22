import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWT_SECRET, authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Dedicated Single-User Platform Credentials
export const MASTER_ID = 'Vibe2006';
export const MASTER_PASSWORD = 'Vibe@#77889';

// POST /api/auth/register (Disabled for single-user system)
router.post('/register', async (_req: AuthRequest, res: Response) => {
  return res.status(403).json({
    message: 'Public registration is disabled. Please log in with the authorized master account credentials (ID: Vibe2006).',
  });
});

// POST /api/auth/login - Strictly validates against single master ID and Password
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.body.id || req.body.email || '';
    const rawPassword = req.body.password || '';

    const id = String(rawId).trim();
    const password = String(rawPassword).trim();

    if (!id || !password) {
      return res.status(400).json({ message: 'Both ID and password are required' });
    }

    // Strict single master credentials check
    const isIdValid = id.toLowerCase() === MASTER_ID.toLowerCase();
    const isPasswordValid = password === MASTER_PASSWORD;

    if (!isIdValid || !isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid ID or Password. Only the authorized platform credentials (ID: Vibe2006) are permitted.',
      });
    }

    // Find or create the master user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: MASTER_ID },
          { email: 'Vibe2006' },
          { email: 'vibe2006@vibe.com' },
          { name: 'Vibe2006' },
        ],
      },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(MASTER_PASSWORD, 10);
      user = await prisma.user.create({
        data: {
          name: 'Vibe2006',
          email: 'Vibe2006',
          password: hashedPassword,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: 'Official VIBE Account ✨',
          favoriteMood: '🔥 High Energy & Romance',
        },
      });
      console.log('✅ Created master user record for Vibe2006');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        favoriteMood: user.favoriteMood,
        isMaster: true,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        favoriteMood: user.favoriteMood,
        isMaster: user.email === MASTER_ID || user.name === MASTER_ID,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;
