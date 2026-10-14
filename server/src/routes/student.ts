import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateJWT, requireRole } from '../middleware/auth.js';
import { uploadCertificate } from '../middleware/upload.js';
import { uploadCertificateFile } from '../supabase.js';
import {
  Certificate,
  AcademicRecord,
  AttendanceRecord,
  Achievement,
  Project,
  Internship
} from '../types.js';

const router = Router();

// Protect all student routes
router.use(authenticateJWT);
router.use(requireRole('student'));

// Helper to compute profile completeness
function calculateProfileCompleteness(user: any, profile: any, certs: any[], achs: any[], projs: any[]): number {
  let score = 0;
  if (user?.full_name) score += 10;
  if (user?.roll_number) score += 10;
  if (user?.department) score += 10;
  if (profile?.bio && profile.bio.length > 20) score += 15;
  if (profile?.skills && profile.skills.length > 0) score += 15;
  if (profile?.github_url || profile?.linkedin_url) score += 10;
  if (certs && certs.length > 0) score += 15;
  if (achs && achs.length > 0) score += 15;
  if (projs && projs.length > 0) score += 10;
  return Math.min(100, score);
}

// GET /api/student/dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();

  const user = data.users.find(u => u.id === userId);
  const profile = data.student_profiles.find(p => p.user_id === userId);
  const certs = data.certificates.filter(c => c.user_id === userId);
  const achs = data.achievements.filter(a => a.user_id === userId);
  const projs = data.projects.filter(p => p.user_id === userId);
  const interns = data.internships.filter(i => i.user_id === userId);
  const academic = data.academic_records.filter(a => a.user_id === userId);
  const attendance = data.attendance_records.filter(a => a.user_id === userId);

  const totalCertificates = certs.length;
  const verifiedCertificates = certs.filter(c => c.status === 'approved').length;
  const pendingRequests = certs.filter(c => c.status === 'pending').length;
  const rejectedRequests = certs.filter(c => c.status === 'rejected').length;
  const totalAchievements = achs.length + projs.length + interns.length;
  const completeness = calculateProfileCompleteness(user, profile, certs, achs, projs);

  // Category breakdown for charts
  const categoryCounts: Record<string, number> = {};
  certs.forEach(c => {
    const cat = c.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).map(name => ({
    name,
    count: categoryCounts[name]
  }));

  // Activity breakdown by type
  const typeData = [
    { name: 'Certificates', value: certs.length },
    { name: 'Hackathons & Awards', value: achs.length },
    { name: 'Projects', value: projs.length },
    { name: 'Internships', value: interns.length },
  ];

  // Recent activity
  const recentActivities: any[] = [];
  certs.forEach(c => {
    recentActivities.push({
      id: `act-${c.id}`,
      type: 'certificate',
      title: c.title,
      subtitle: `${c.issuing_org} • ${c.status.toUpperCase()}`,
      status: c.status,
      date: c.created_at
    });
  });

  achs.forEach(a => {
    recentActivities.push({
      id: `act-${a.id}`,
      type: 'achievement',
      title: a.title,
      subtitle: `${a.organization} • ${a.category}`,
      status: a.status,
      date: a.created_at
    });
  });

  recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Attendance summary
  let avgAttendance = 0;
  if (attendance.length > 0) {
    const totalPercentage = attendance.reduce((acc, curr) => acc + Number(curr.percentage), 0);
    avgAttendance = Number((totalPercentage / attendance.length).toFixed(2));
  }

  return res.json({
    success: true,
    stats: {
      totalCertificates,
      verifiedCertificates,
      pendingRequests,
      rejectedRequests,
      totalAchievements,
      profileCompleteness: completeness,
      cgpa: profile?.cgpa || 0.0,
      avgAttendance
    },
    charts: {
      categoryData,
      typeData
    },
    recentActivities: recentActivities.slice(0, 6),
    profile: profile || null,
    publicUrl: profile ? `/portfolio/${profile.portfolio_slug}` : null
  });
});

// GET & PUT /api/student/profile
router.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const user = data.users.find(u => u.id === userId);
  const profile = data.student_profiles.find(p => p.user_id === userId);

  const { password_hash: _, ...safeUser } = user!;
  return res.json({
    success: true,
    user: safeUser,
    profile: profile || null
  });
});

router.put('/profile', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const user = data.users.find(u => u.id === userId);
  let profile = data.student_profiles.find(p => p.user_id === userId);

  const {
    full_name,
    phone,
    department,
    roll_number,
    graduation_year,
    bio,
    cgpa,
    semester,
    linkedin_url,
    github_url,
    portfolio_slug,
    is_public,
    skills,
    contact_email,
    resume_url
  } = req.body;

  if (user) {
    if (full_name) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (department) user.department = department;
    if (roll_number) user.roll_number = roll_number;
    if (graduation_year) user.graduation_year = Number(graduation_year);
    user.updated_at = new Date().toISOString();
  }

  if (profile) {
    if (bio !== undefined) profile.bio = bio;
    if (cgpa !== undefined) profile.cgpa = Number(cgpa);
    if (semester !== undefined) profile.semester = Number(semester);
    if (linkedin_url !== undefined) profile.linkedin_url = linkedin_url;
    if (github_url !== undefined) profile.github_url = github_url;
    if (is_public !== undefined) profile.is_public = Boolean(is_public);
    if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim());
    if (contact_email !== undefined) profile.contact_email = contact_email;
    if (resume_url !== undefined) profile.resume_url = resume_url;

    if (portfolio_slug && portfolio_slug !== profile.portfolio_slug) {
      const cleanSlug = portfolio_slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const conflict = data.student_profiles.find(p => p.portfolio_slug === cleanSlug && p.user_id !== userId);
      if (conflict) {
        return res.status(409).json({ success: false, message: 'This portfolio link slug is already taken.' });
      }
      profile.portfolio_slug = cleanSlug;
    }
    profile.updated_at = new Date().toISOString();
  } else {
    profile = {
      user_id: userId,
      bio: bio || '',
      cgpa: Number(cgpa) || 0.0,
      semester: Number(semester) || 1,
      portfolio_slug: portfolio_slug || `student-${userId.slice(-6)}`,
      is_public: is_public !== undefined ? Boolean(is_public) : true,
      skills: Array.isArray(skills) ? skills : [],
      contact_email: contact_email || user?.email,
      github_url,
      linkedin_url,
      resume_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.student_profiles.push(profile);
  }

  db.save();

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: user ? { ...user, password_hash: undefined } : null,
    profile
  });
});

// CERTIFICATES CRUD
router.get('/certificates', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const certs = data.certificates
    .filter(c => c.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Attach reviewer info and review notes if available
  const enriched = certs.map(c => {
    const review = data.verification_reviews.find(r => r.certificate_id === c.id);
    return {
      ...c,
      review: review || null
    };
  });

  return res.json({ success: true, certificates: enriched });
});

router.post('/certificates', uploadCertificate.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      issuing_org,
      issue_date,
      expiry_date,
      credential_id,
      credential_url,
      category,
      description
    } = req.body;

    if (!title || !issuing_org || !issue_date) {
      return res.status(400).json({ success: false, message: 'Title, issuing organization, and issue date are required.' });
    }

    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;

      // Upload to Supabase if configured, or use local served path
      const uploadResult = await uploadCertificateFile(req.file.filename, req.file.buffer || Buffer.from(''), req.file.mimetype);
      fileUrl = uploadResult.url;
    } else if (req.body.file_url) {
      fileUrl = req.body.file_url;
      fileName = title;
    } else {
      return res.status(400).json({ success: false, message: 'Please upload a certificate document (PDF or Image).' });
    }

    const data = db.getData();
    const newCert: Certificate = {
      id: `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      title: title.trim(),
      issuing_org: issuing_org.trim(),
      issue_date,
      expiry_date: expiry_date || undefined,
      credential_id: credential_id?.trim() || undefined,
      credential_url: credential_url?.trim() || undefined,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      category: category || 'Academic',
      description: description?.trim() || undefined,
      status: 'pending', // Freshly submitted certificates are pending verification
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.certificates.unshift(newCert);

    // Audit log
    data.audit_logs.push({
      id: `audit-${Date.now()}`,
      user_id: userId,
      user_name: req.user!.full_name,
      action: 'CERTIFICATE_SUBMITTED',
      entity_type: 'Certificate',
      entity_id: newCert.id,
      details: { title: newCert.title, issuing_org: newCert.issuing_org },
      ip_address: req.ip,
      created_at: new Date().toISOString()
    });

    db.save();

    return res.status(201).json({
      success: true,
      message: 'Certificate uploaded and submitted for faculty verification.',
      certificate: newCert
    });
  } catch (err: any) {
    console.error('Certificate upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Error processing certificate upload.' });
  }
});

router.delete('/certificates/:id', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = db.getData();

  const index = data.certificates.findIndex(c => c.id === id && c.user_id === userId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Certificate not found or unauthorized.' });
  }

  // Remove certificate and any related reviews
  const removed = data.certificates.splice(index, 1)[0];
  data.verification_reviews = data.verification_reviews.filter(r => r.certificate_id !== id);

  db.save();

  return res.json({ success: true, message: `Certificate "${removed.title}" deleted successfully.` });
});

// ACADEMIC RECORDS
router.get('/academic-records', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const records = data.academic_records
    .filter(a => a.user_id === userId)
    .sort((a, b) => b.semester - a.semester);

  return res.json({ success: true, records });
});

router.post('/academic-records', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { semester, course_code, course_name, credits, grade, sgpa, academic_year } = req.body;

  if (!semester || !course_code || !course_name || !credits || !grade) {
    return res.status(400).json({ success: false, message: 'Semester, course code, course name, credits, and grade are required.' });
  }

  const data = db.getData();
  const newRecord: AcademicRecord = {
    id: `ar-${Date.now()}`,
    user_id: userId,
    semester: Number(semester),
    course_code: course_code.toUpperCase().trim(),
    course_name: course_name.trim(),
    credits: Number(credits),
    grade: grade.toUpperCase().trim(),
    sgpa: sgpa ? Number(sgpa) : undefined,
    academic_year: academic_year || '2023-2024',
    created_at: new Date().toISOString()
  };

  data.academic_records.unshift(newRecord);
  db.save();

  return res.status(201).json({ success: true, message: 'Academic record added.', record: newRecord });
});

router.delete('/academic-records/:id', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = db.getData();

  const idx = data.academic_records.findIndex(a => a.id === id && a.user_id === userId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Record not found.' });
  }

  data.academic_records.splice(idx, 1);
  db.save();

  return res.json({ success: true, message: 'Academic record removed.' });
});

// ATTENDANCE RECORDS
router.get('/attendance', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const records = data.attendance_records.filter(a => a.user_id === userId);

  return res.json({ success: true, records });
});

router.post('/attendance', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { semester, course_code, course_name, total_classes, attended_classes } = req.body;

  if (!course_code || !course_name || total_classes === undefined || attended_classes === undefined) {
    return res.status(400).json({ success: false, message: 'Course code, name, total classes, and attended classes are required.' });
  }

  const total = Number(total_classes);
  const attended = Number(attended_classes);
  const pct = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

  const data = db.getData();
  const record: AttendanceRecord = {
    id: `att-${Date.now()}`,
    user_id: userId,
    semester: Number(semester) || 1,
    course_code: course_code.toUpperCase().trim(),
    course_name: course_name.trim(),
    total_classes: total,
    attended_classes: attended,
    percentage: pct,
    updated_at: new Date().toISOString()
  };

  data.attendance_records.push(record);
  db.save();

  return res.status(201).json({ success: true, message: 'Attendance record saved.', record });
});

router.delete('/attendance/:id', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = db.getData();

  const idx = data.attendance_records.findIndex(a => a.id === id && a.user_id === userId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Attendance record not found.' });
  }

  data.attendance_records.splice(idx, 1);
  db.save();

  return res.json({ success: true, message: 'Attendance record removed.' });
});

// ACHIEVEMENTS CRUD
router.get('/achievements', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const achievements = data.achievements.filter(a => a.user_id === userId);

  return res.json({ success: true, achievements });
});

router.post('/achievements', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, category, organization, date, description, proof_url } = req.body;

  if (!title || !category || !organization || !date) {
    return res.status(400).json({ success: false, message: 'Title, category, organization, and date are required.' });
  }

  const data = db.getData();
  const ach: Achievement = {
    id: `ach-${Date.now()}`,
    user_id: userId,
    title: title.trim(),
    category,
    organization: organization.trim(),
    date,
    description: description?.trim(),
    proof_url: proof_url?.trim(),
    status: 'approved',
    created_at: new Date().toISOString()
  };

  data.achievements.unshift(ach);
  db.save();

  return res.status(201).json({ success: true, message: 'Achievement added successfully.', achievement: ach });
});

router.delete('/achievements/:id', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = db.getData();

  const idx = data.achievements.findIndex(a => a.id === id && a.user_id === userId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Achievement not found.' });
  }

  data.achievements.splice(idx, 1);
  db.save();

  return res.json({ success: true, message: 'Achievement deleted.' });
});

// PROJECTS CRUD
router.get('/projects', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const projects = data.projects.filter(p => p.user_id === userId);

  return res.json({ success: true, projects });
});

router.post('/projects', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, description, tech_stack, github_url, live_url, role, start_date, end_date } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  const stack = Array.isArray(tech_stack)
    ? tech_stack
    : typeof tech_stack === 'string'
      ? tech_stack.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  const data = db.getData();
  const proj: Project = {
    id: `proj-${Date.now()}`,
    user_id: userId,
    title: title.trim(),
    description: description.trim(),
    tech_stack: stack,
    github_url: github_url?.trim(),
    live_url: live_url?.trim(),
    role: role?.trim(),
    start_date,
    end_date,
    created_at: new Date().toISOString()
  };

  data.projects.unshift(proj);
  db.save();

  return res.status(201).json({ success: true, message: 'Project added successfully.', project: proj });
});

router.delete('/projects/:id', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = db.getData();

  const idx = data.projects.findIndex(p => p.id === id && p.user_id === userId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  data.projects.splice(idx, 1);
  db.save();

  return res.json({ success: true, message: 'Project removed.' });
});

// INTERNSHIPS CRUD
router.get('/internships', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const internships = data.internships.filter(i => i.user_id === userId);

  return res.json({ success: true, internships });
});

router.post('/internships', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { company, role, location, start_date, end_date, description, certificate_url, stipend, status } = req.body;

  if (!company || !role || !start_date) {
    return res.status(400).json({ success: false, message: 'Company, role, and start date are required.' });
  }

  const data = db.getData();
  const intern: Internship = {
    id: `intern-${Date.now()}`,
    user_id: userId,
    company: company.trim(),
    role: role.trim(),
    location: location?.trim(),
    start_date,
    end_date,
    description: description?.trim(),
    certificate_url: certificate_url?.trim(),
    stipend: stipend?.trim(),
    status: status || 'Completed',
    created_at: new Date().toISOString()
  };

  data.internships.unshift(intern);
  db.save();

  return res.status(201).json({ success: true, message: 'Internship recorded.', internship: intern });
});

router.delete('/internships/:id', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = db.getData();

  const idx = data.internships.findIndex(i => i.id === id && i.user_id === userId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Internship not found.' });
  }

  data.internships.splice(idx, 1);
  db.save();

  return res.json({ success: true, message: 'Internship removed.' });
});

// NOTIFICATIONS
router.get('/notifications', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getData();
  const notifications = data.notifications
    .filter(n => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json({ success: true, notifications });
});

router.put('/notifications/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const data = db.getData();

  const notif = data.notifications.find(n => n.id === id && n.user_id === userId);
  if (notif) {
    notif.is_read = true;
    db.save();
  }

  return res.json({ success: true, message: 'Notification marked as read.' });
});

export default router;
