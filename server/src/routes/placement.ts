import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect placement officer routes: strictly requires 'placement_officer' or 'admin'
router.use(authenticateJWT);
router.use(requireRole('placement_officer', 'admin'));

// GET /api/placement/students
router.get('/students', (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const { department, graduation_year, skill, min_cgpa, min_verified_certs, search } = req.query;

  const students = data.users.filter(u => u.role === 'student');

  let results = students.map(student => {
    const profile = data.student_profiles.find(p => p.user_id === student.id);
    const certs = data.certificates.filter(c => c.user_id === student.id);
    const verifiedCerts = certs.filter(c => c.status === 'approved');
    const achs = data.achievements.filter(a => a.user_id === student.id);
    const projs = data.projects.filter(p => p.user_id === student.id);
    const interns = data.internships.filter(i => i.user_id === student.id);

    return {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      roll_number: student.roll_number,
      department: student.department,
      graduation_year: student.graduation_year,
      avatar_url: student.avatar_url,
      profile: profile || null,
      cgpa: profile?.cgpa || 0.0,
      skills: profile?.skills || [],
      is_public: profile ? profile.is_public : true,
      portfolio_slug: profile?.portfolio_slug || '',
      verified_certificates_count: verifiedCerts.length,
      total_certificates_count: certs.length,
      achievements_count: achs.length,
      projects_count: projs.length,
      internships_count: interns.length,
      top_skills: (profile?.skills || []).slice(0, 5)
    };
  });

  // Filters
  if (department && department !== 'all') {
    results = results.filter(s => s.department?.toLowerCase() === String(department).toLowerCase());
  }

  if (graduation_year && graduation_year !== 'all') {
    results = results.filter(s => s.graduation_year === Number(graduation_year));
  }

  if (min_cgpa) {
    const minG = Number(min_cgpa);
    results = results.filter(s => s.cgpa >= minG);
  }

  if (min_verified_certs) {
    const minV = Number(min_verified_certs);
    results = results.filter(s => s.verified_certificates_count >= minV);
  }

  if (skill) {
    const targetSkill = String(skill).toLowerCase();
    results = results.filter(s => s.skills.some((sk: string) => sk.toLowerCase().includes(targetSkill)));
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      s =>
        s.full_name.toLowerCase().includes(q) ||
        s.roll_number?.toLowerCase().includes(q) ||
        s.skills.some((sk: string) => sk.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: results.length, students: results });
});

// GET /api/placement/students/:id/portfolio
router.get('/students/:id/portfolio', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();

  const student = data.users.find(u => u.id === id && u.role === 'student');
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const profile = data.student_profiles.find(p => p.user_id === id);
  const certs = data.certificates.filter(c => c.user_id === id && c.status === 'approved');
  const achs = data.achievements.filter(a => a.user_id === id && a.status === 'approved');
  const projs = data.projects.filter(p => p.user_id === id);
  const interns = data.internships.filter(i => i.user_id === id);
  const academic = data.academic_records.filter(a => a.user_id === id);

  return res.json({
    success: true,
    student: {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      roll_number: student.roll_number,
      department: student.department,
      graduation_year: student.graduation_year,
      avatar_url: student.avatar_url
    },
    profile,
    certificates: certs,
    achievements: achs,
    projects: projs,
    internships: interns,
    academic
  });
});

// GET /api/placement/analytics
router.get('/analytics', (_req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const students = data.users.filter(u => u.role === 'student');

  // Department counts
  const deptMap: Record<string, number> = {};
  students.forEach(s => {
    const d = s.department || 'Other';
    deptMap[d] = (deptMap[d] || 0) + 1;
  });

  // Skills aggregation
  const skillMap: Record<string, number> = {};
  data.student_profiles.forEach(p => {
    (p.skills || []).forEach(sk => {
      skillMap[sk] = (skillMap[sk] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalVerifiedCerts = data.certificates.filter(c => c.status === 'approved').length;

  return res.json({
    success: true,
    analytics: {
      totalStudents: students.length,
      totalVerifiedCerts,
      totalProjects: data.projects.length,
      totalInternships: data.internships.length,
      departmentDistribution: Object.entries(deptMap).map(([name, count]) => ({ name, count })),
      topSkills
    }
  });
});

export default router;
