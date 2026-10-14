import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateJWT, requireRole } from '../middleware/auth.js';
import { User, UserRole } from '../types.js';

const router = Router();

// Protect all admin routes: strictly requires 'admin' role
router.use(authenticateJWT);
router.use(requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', (_req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();

  const totalUsers = data.users.length;
  const studentsCount = data.users.filter(u => u.role === 'student').length;
  const facultyCount = data.users.filter(u => u.role === 'faculty').length;
  const placementCount = data.users.filter(u => u.role === 'placement_officer').length;

  const totalCertificates = data.certificates.length;
  const pendingCertificates = data.certificates.filter(c => c.status === 'pending').length;
  const verifiedCertificates = data.certificates.filter(c => c.status === 'approved').length;
  const rejectedCertificates = data.certificates.filter(c => c.status === 'rejected').length;

  return res.json({
    success: true,
    stats: {
      totalUsers,
      studentsCount,
      facultyCount,
      placementCount,
      totalCertificates,
      pendingCertificates,
      verifiedCertificates,
      rejectedCertificates,
      totalAuditLogs: data.audit_logs.length,
      totalProjects: data.projects.length,
      departmentsCount: data.departments.length
    }
  });
});

// GET /api/admin/users
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const { role, department, search } = req.query;
  const data = db.getData();

  let users = data.users.map(({ password_hash, ...u }) => u);

  if (role && role !== 'all') {
    users = users.filter(u => u.role === role);
  }

  if (department && department !== 'all') {
    users = users.filter(u => u.department?.toLowerCase() === String(department).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter(
      u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roll_number?.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, count: users.length, users });
});

// POST /api/admin/faculty (Provision new authorized faculty account)
router.post('/faculty', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, full_name, department, phone } = req.body;

    if (!email || !password || !full_name || !department) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, full name, and department are required to provision faculty.'
      });
    }

    const data = db.getData();
    if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newFaculty: User = {
      id: `fac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: email.toLowerCase().trim(),
      password_hash,
      full_name: full_name.trim(),
      role: 'faculty',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}`,
      department: department.trim(),
      phone: phone || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.users.push(newFaculty);

    // Audit log
    data.audit_logs.push({
      id: `audit-${Date.now()}`,
      user_id: req.user!.id,
      user_name: req.user!.full_name,
      action: 'PROVISION_FACULTY',
      entity_type: 'User',
      entity_id: newFaculty.id,
      details: { email: newFaculty.email, department: newFaculty.department },
      ip_address: req.ip,
      created_at: new Date().toISOString()
    });

    db.save();

    const { password_hash: _, ...safeUser } = newFaculty;
    return res.status(201).json({
      success: true,
      message: 'Faculty account provisioned successfully.',
      faculty: safeUser
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error provisioning faculty account.' });
  }
});

// PUT /api/admin/users/:id/role (Change user role)
router.put('/users/:id/role', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['student', 'faculty', 'placement_officer', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Valid role is required.' });
  }

  const data = db.getData();
  const user = data.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Prevent admin from removing their own admin status accidentally
  if (user.id === req.user!.id && role !== 'admin') {
    return res.status(400).json({ success: false, message: 'You cannot downgrade your own administrator role.' });
  }

  const oldRole = user.role;
  user.role = role as UserRole;
  user.updated_at = new Date().toISOString();

  // Audit log
  data.audit_logs.push({
    id: `audit-${Date.now()}`,
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action: 'USER_ROLE_CHANGED',
    entity_type: 'User',
    entity_id: user.id,
    details: { user_email: user.email, from: oldRole, to: role },
    ip_address: req.ip,
    created_at: new Date().toISOString()
  });

  db.save();

  return res.json({ success: true, message: `User role updated to ${role}.` });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }

  const data = db.getData();
  const idx = data.users.findIndex(u => u.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const deletedUser = data.users.splice(idx, 1)[0];
  // Cascade clean-ups
  data.student_profiles = data.student_profiles.filter(p => p.user_id !== id);
  data.certificates = data.certificates.filter(c => c.user_id !== id);
  data.academic_records = data.academic_records.filter(a => a.user_id !== id);
  data.attendance_records = data.attendance_records.filter(a => a.user_id !== id);
  data.achievements = data.achievements.filter(a => a.user_id !== id);
  data.projects = data.projects.filter(p => p.user_id !== id);
  data.internships = data.internships.filter(i => i.user_id !== id);

  data.audit_logs.push({
    id: `audit-${Date.now()}`,
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action: 'USER_DELETED',
    entity_type: 'User',
    entity_id: id,
    details: { email: deletedUser.email, role: deletedUser.role },
    ip_address: req.ip,
    created_at: new Date().toISOString()
  });

  db.save();

  return res.json({ success: true, message: `User ${deletedUser.full_name} deleted.` });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (_req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const logs = [...data.audit_logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return res.json({ success: true, logs: logs.slice(0, 100) });
});

// DEPARTMENTS
router.get('/departments', (_req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  return res.json({ success: true, departments: data.departments });
});

router.post('/departments', (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, message: 'Department name is required.' });
  }

  const data = db.getData();
  if (data.departments.includes(name.trim())) {
    return res.status(409).json({ success: false, message: 'Department already exists.' });
  }

  data.departments.push(name.trim());
  db.save();

  return res.status(201).json({ success: true, message: 'Department added.', departments: data.departments });
});

export default router;
