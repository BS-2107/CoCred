import { Router, Request, Response } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/public/portfolio/:identifier (identifier can be slug or user_id or roll_number)
router.get('/portfolio/:identifier', (req: Request, res: Response) => {
  const { identifier } = req.params;
  const data = db.getData();

  // Find profile by slug or by user_id
  let profile = data.student_profiles.find(
    p => p.portfolio_slug.toLowerCase() === identifier.toLowerCase() || p.user_id === identifier
  );

  let user = profile ? data.users.find(u => u.id === profile.user_id) : null;

  // Fallback check by roll number
  if (!user) {
    user = data.users.find(u => u.roll_number?.toLowerCase() === identifier.toLowerCase() && u.role === 'student') || null;
    if (user) {
      profile = data.student_profiles.find(p => p.user_id === user!.id);
    }
  }

  if (!user || !profile) {
    return res.status(404).json({
      success: false,
      message: 'Student portfolio not found or the student does not exist.'
    });
  }

  // Check if portfolio is public
  if (!profile.is_public) {
    return res.status(403).json({
      success: false,
      is_private: true,
      message: 'This student has chosen to keep their portfolio private.'
    });
  }

  // ONLY verified certificates are made publicly visible
  const verifiedCertificates = data.certificates
    .filter(c => c.user_id === user!.id && c.status === 'approved')
    .map(c => {
      const reviewer = c.verified_by ? data.users.find(u => u.id === c.verified_by) : null;
      return {
        id: c.id,
        title: c.title,
        issuing_org: c.issuing_org,
        issue_date: c.issue_date,
        expiry_date: c.expiry_date,
        credential_id: c.credential_id,
        credential_url: c.credential_url,
        file_url: c.file_url,
        category: c.category,
        description: c.description,
        verified_at: c.verified_at,
        reviewer_name: reviewer?.full_name || 'Authorized University Faculty',
        status: 'approved'
      };
    });

  // Approved achievements
  const verifiedAchievements = data.achievements
    .filter(a => a.user_id === user!.id && a.status === 'approved');

  // Projects & Internships
  const projects = data.projects.filter(p => p.user_id === user!.id);
  const internships = data.internships.filter(i => i.user_id === user!.id);

  // Academic highlights (GPA, Department, Semester)
  const academicHighlights = {
    cgpa: profile.cgpa,
    semester: profile.semester,
    department: user.department,
    graduation_year: user.graduation_year,
    roll_number: user.roll_number
  };

  return res.json({
    success: true,
    student: {
      id: user.id,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      department: user.department,
      graduation_year: user.graduation_year,
      roll_number: user.roll_number
    },
    profile: {
      bio: profile.bio,
      cgpa: profile.cgpa,
      semester: profile.semester,
      skills: profile.skills,
      portfolio_slug: profile.portfolio_slug,
      linkedin_url: profile.linkedin_url,
      github_url: profile.github_url,
      contact_email: profile.contact_email,
      resume_url: profile.resume_url
    },
    academic: academicHighlights,
    certificates: verifiedCertificates,
    achievements: verifiedAchievements,
    projects,
    internships
  });
});

export default router;
