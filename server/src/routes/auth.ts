import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest, JWT_SECRET, authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Dedicated Single-User Platform Credentials
export const MASTER_ID = 'Hacker@#qwert77889';
export const MASTER_PASSWORD = 'ASDFGBNM@%5566';

// Constant-time string comparison to prevent timing attacks
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// In-Memory Brute-Force & Rate-Limiting Protection
interface LoginAttempt {
  failures: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_FAILURES = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

function getClientKey(req: AuthRequest, id: string): string {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown-ip';
  return `${ip}::${id.toLowerCase().trim()}`;
}

function checkRateLimit(key: string): { isLocked: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return { isLocked: false };

  // If locked, check if lockout has expired
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return { isLocked: true, remainingMinutes };
    }
    // Lockout expired, reset
    loginAttempts.delete(key);
    return { isLocked: false };
  }

  // If window expired, reset failures
  if (now - record.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(key);
    return { isLocked: false };
  }

  return { isLocked: false };
}

function recordFailedAttempt(key: string): { locked: boolean; remainingAttempts: number; remainingMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key) || { failures: 0, firstAttemptAt: now };

  if (now - record.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    record.failures = 1;
    record.firstAttemptAt = now;
    delete record.lockedUntil;
  } else {
    record.failures += 1;
  }

  if (record.failures >= MAX_FAILURES) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(key, record);
    return {
      locked: true,
      remainingAttempts: 0,
      remainingMinutes: Math.ceil(LOCKOUT_DURATION_MS / 60000),
    };
  }

  loginAttempts.set(key, record);
  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_FAILURES - record.failures),
  };
}

function recordSuccess(key: string) {
  loginAttempts.delete(key);
}

// Cleanup stale login attempt records periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (record.lockedUntil && now > record.lockedUntil) {
      loginAttempts.delete(key);
    } else if (!record.lockedUntil && now - record.firstAttemptAt > ATTEMPT_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

// POST /api/auth/register (Permanently disabled for single-user system)
router.post('/register', async (_req: AuthRequest, res: Response) => {
  return res.status(403).json({
    message: 'Registration is permanently disabled. Private single-operator system.',
  });
});

// POST /api/auth/login - Strictly validates against single master ID and Password
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.body.id || req.body.email || '';
    const rawPassword = req.body.password || '';

    // Input bounds validation
    if (typeof rawId !== 'string' || typeof rawPassword !== 'string') {
      return res.status(400).json({ message: 'Invalid request payload format' });
    }

    const id = rawId.trim();
    const password = rawPassword;

    if (!id || !password) {
      return res.status(400).json({ message: 'Both ID and password are required' });
    }

    if (id.length > 100 || password.length > 128) {
      return res.status(400).json({ message: 'Input exceeds maximum allowed length' });
    }

    // Rate Limiting & Brute-Force Check
    const rateLimitKey = getClientKey(req, id);
    const rateCheck = checkRateLimit(rateLimitKey);
    if (rateCheck.isLocked) {
      return res.status(429).json({
        message: `Security lockout: Too many failed login attempts. Please wait ${rateCheck.remainingMinutes} minute(s) before trying again.`,
      });
    }

    // Constant-time verification against master credentials
    const isIdValid = secureCompare(id.toLowerCase(), MASTER_ID.toLowerCase());
    const isPasswordValid = secureCompare(password, MASTER_PASSWORD);

    if (!isIdValid || !isPasswordValid) {
      const failInfo = recordFailedAttempt(rateLimitKey);
      if (failInfo.locked) {
        return res.status(429).json({
          message: `Account locked: Too many failed attempts. Access blocked for ${failInfo.remainingMinutes} minutes.`,
        });
      }
      return res.status(401).json({
        message: `Invalid ID or Password. ${failInfo.remainingAttempts} attempt(s) remaining before temporary lockout.`,
      });
    }

    // Reset failed attempts upon successful login
    recordSuccess(rateLimitKey);

    // Find or sync the master user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: MASTER_ID },
          { name: MASTER_ID },
        ],
      },
    });

    const hashedMasterPassword = await bcrypt.hash(MASTER_PASSWORD, 12);

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: MASTER_ID,
          email: MASTER_ID,
          password: hashedMasterPassword,
          avatarUrl: '/minecraft-avatar.jpg',
          bio: 'Official Auralis Account ✨',
          favoriteMood: '🔥 High Energy & Romance',
        },
      });
      console.log(`✅ Created master user record for ${MASTER_ID}`);
    } else {
      // Keep avatar and credentials in sync
      const updates: any = {};
      if (user.email !== MASTER_ID) updates.email = MASTER_ID;
      if (user.name !== MASTER_ID) updates.name = MASTER_ID;
      if (!user.avatarUrl || user.avatarUrl.includes('1534528741775')) {
        updates.avatarUrl = '/minecraft-avatar.jpg';
      }
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '/minecraft-avatar.jpg',
        bio: user.bio,
        favoriteMood: user.favoriteMood,
        isMaster: true,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal authentication error' });
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
        avatarUrl:
          !user.avatarUrl || user.avatarUrl.includes('1534528741775')
            ? '/minecraft-avatar.jpg'
            : user.avatarUrl,
        bio: user.bio,
        favoriteMood: user.favoriteMood,
        isMaster: user.email === MASTER_ID || user.name === MASTER_ID,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
