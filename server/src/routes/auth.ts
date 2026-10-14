import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { User, StudentProfile } from '../types.js';
import { JWT_SECRET, authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register (Student Registration)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, roll_number, department, graduation_year, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
    }

    const data = db.getData();
    const existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newUserId = `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newUser: User = {
      id: newUserId,
      email: email.toLowerCase().trim(),
      password_hash,
      full_name: full_name.trim(),
      role: 'student', // Public registration is strictly student role only!
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}`,
      phone: phone || '',
      department: department || 'Computer Science and Engineering',
      roll_number: roll_number || `REG-${Date.now().toString().slice(-6)}`,
      graduation_year: graduation_year ? parseInt(graduation_year) : 2026,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Auto-generate portfolio slug
    const baseSlug = full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (data.student_profiles.some(p => p.portfolio_slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newProfile: StudentProfile = {
      user_id: newUserId,
      bio: 'Enthusiastic university student building verified credentials on CoCred.',
      cgpa: 0.0,
      semester: 1,
      portfolio_slug: slug,
      is_public: true,
      skills: ['Problem Solving', 'Communication'],
      contact_email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.users.push(newUser);
    data.student_profiles.push(newProfile);

    // Add welcoming notification
    data.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: newUserId,
      title: 'Welcome to CoCred!',
      message: 'Start by uploading your academic certificates, achievements, and completing your public portfolio.',
      type: 'info',
      is_read: false,
      link: '/certificates',
      created_at: new Date().toISOString()
    });

    // Audit log
    data.audit_logs.push({
      id: `audit-${Date.now()}`,
      user_id: newUserId,
      user_name: newUser.full_name,
      action: 'USER_REGISTERED',
      entity_type: 'User',
      entity_id: newUserId,
      details: { email: newUser.email, role: 'student' },
      ip_address: req.ip,
      created_at: new Date().toISOString()
    });

    db.save();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser,
      profile: newProfile
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const data = db.getData();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const profile = data.student_profiles.find(p => p.user_id === user.id);
    const { password_hash: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
      profile: profile || null
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const data = db.getData();
  const profile = data.student_profiles.find(p => p.user_id === req.user!.id);
  const { password_hash: _, ...safeUser } = req.user;

  return res.json({
    success: true,
    user: safeUser,
    profile: profile || null
  });
});

export default router;
