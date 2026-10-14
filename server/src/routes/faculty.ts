import { Router, Response } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, authenticateJWT, requireRole } from '../middleware/auth.js';
import { VerificationReview } from '../types.js';

const router = Router();

// Protect all faculty routes: strictly requires 'faculty' or 'admin'
router.use(authenticateJWT);
router.use(requireRole('faculty', 'admin'));

// GET /api/faculty/dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const certs = data.certificates;

  const pending = certs.filter(c => c.status === 'pending');
  const approved = certs.filter(c => c.status === 'approved');
  const rejected = certs.filter(c => c.status === 'rejected');

  // Breakdown by category
  const categoryCounts: Record<string, number> = {};
  pending.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Recent reviews performed
  const recentReviews = [...data.verification_reviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(r => {
      const cert = certs.find(c => c.id === r.certificate_id);
      const student = cert ? data.users.find(u => u.id === cert.user_id) : null;
      return {
        ...r,
        certificate_title: cert?.title || 'Unknown Certificate',
        student_name: student?.full_name || 'Unknown Student',
        student_roll: student?.roll_number || 'N/A'
      };
    });

  return res.json({
    success: true,
    stats: {
      totalSubmissions: certs.length,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      myReviewsCount: data.verification_reviews.filter(r => r.reviewer_id === req.user!.id).length
    },
    categoryBreakdown: Object.keys(categoryCounts).map(cat => ({ name: cat, count: categoryCounts[cat] })),
    recentReviews
  });
});

// GET /api/faculty/submissions (with search, status filter, category filter)
router.get('/submissions', (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const { status, category, department, search } = req.query;

  let list = [...data.certificates];

  if (status && status !== 'all') {
    list = list.filter(c => c.status === status);
  }

  if (category && category !== 'all') {
    list = list.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
  }

  // Enrich with student details
  let enriched = list.map(cert => {
    const student = data.users.find(u => u.id === cert.user_id);
    const profile = data.student_profiles.find(p => p.user_id === cert.user_id);
    const reviewer = cert.verified_by ? data.users.find(u => u.id === cert.verified_by) : null;
    const reviewHistory = data.verification_reviews.filter(r => r.certificate_id === cert.id);

    return {
      ...cert,
      student_name: student?.full_name || 'Unknown Student',
      student_email: student?.email || '',
      student_roll: student?.roll_number || 'N/A',
      student_department: student?.department || 'N/A',
      student_cgpa: profile?.cgpa || 0,
      student_avatar: student?.avatar_url || '',
      reviewer_name: reviewer?.full_name || null,
      reviewHistory
    };
  });

  if (department && department !== 'all') {
    enriched = enriched.filter(c => c.student_department.toLowerCase() === String(department).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    enriched = enriched.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.issuing_org.toLowerCase().includes(q) ||
        c.student_name.toLowerCase().includes(q) ||
        c.student_roll.toLowerCase().includes(q)
    );
  }

  // Sort: Pending first, then by date descending
  enriched.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return res.json({ success: true, count: enriched.length, submissions: enriched });
});

// GET /api/faculty/submissions/:id
router.get('/submissions/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();

  const cert = data.certificates.find(c => c.id === id);
  if (!cert) {
    return res.status(404).json({ success: false, message: 'Certificate submission not found.' });
  }

  const student = data.users.find(u => u.id === cert.user_id);
  const profile = data.student_profiles.find(p => p.user_id === cert.user_id);
  const reviews = data.verification_reviews.filter(r => r.certificate_id === cert.id);

  return res.json({
    success: true,
    certificate: cert,
    student: student ? {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      roll_number: student.roll_number,
      department: student.department,
      graduation_year: student.graduation_year,
      avatar_url: student.avatar_url,
      cgpa: profile?.cgpa || 0,
      portfolio_slug: profile?.portfolio_slug
    } : null,
    reviews
  });
});

// POST /api/faculty/submissions/:id/review (Approve or Reject)
router.post('/submissions/:id/review', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { action, notes, reason } = req.body;
  const reviewer = req.user!;

  if (!action || !['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Valid action ("approved" or "rejected") is required.' });
  }

  if (action === 'rejected' && (!reason || reason.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'A rejection reason is strictly mandatory when rejecting a student certificate.'
    });
  }

  const data = db.getData();
  const cert = data.certificates.find(c => c.id === id);

  if (!cert) {
    return res.status(404).json({ success: false, message: 'Certificate submission not found.' });
  }

  // Update certificate record
  cert.status = action;
  cert.verified_by = reviewer.id;
  cert.verified_at = new Date().toISOString();
  cert.rejection_reason = action === 'rejected' ? reason.trim() : undefined;
  cert.updated_at = new Date().toISOString();

  // Record into verification_reviews table
  const reviewRecord: VerificationReview = {
    id: `vr-${Date.now()}`,
    certificate_id: cert.id,
    reviewer_id: reviewer.id,
    reviewer_name: reviewer.full_name,
    action,
    notes: notes?.trim() || undefined,
    reason: reason?.trim() || undefined,
    created_at: new Date().toISOString()
  };

  data.verification_reviews.push(reviewRecord);

  // Notify the student
  data.notifications.push({
    id: `notif-${Date.now()}`,
    user_id: cert.user_id,
    title: action === 'approved' ? `Certificate Approved: ${cert.title}` : `Certificate Update: ${cert.title}`,
    message: action === 'approved'
      ? `Your certificate "${cert.title}" has been verified by ${reviewer.full_name}. It is now featured with a verified badge on your portfolio.`
      : `Your certificate "${cert.title}" was rejected by ${reviewer.full_name}. Reason: ${reason}`,
    type: action === 'approved' ? 'success' : 'error',
    is_read: false,
    link: '/certificates',
    created_at: new Date().toISOString()
  });

  // Audit log
  data.audit_logs.push({
    id: `audit-${Date.now()}`,
    user_id: reviewer.id,
    user_name: reviewer.full_name,
    action: action === 'approved' ? 'CERTIFICATE_VERIFIED' : 'CERTIFICATE_REJECTED',
    entity_type: 'Certificate',
    entity_id: cert.id,
    details: {
      certificate_title: cert.title,
      student_id: cert.user_id,
      reason: action === 'rejected' ? reason : undefined,
      notes
    },
    ip_address: req.ip,
    created_at: new Date().toISOString()
  });

  db.save();

  return res.json({
    success: true,
    message: `Certificate has been successfully ${action}.`,
    certificate: cert,
    review: reviewRecord
  });
});

// GET /api/faculty/history (Verifications performed by faculty)
router.get('/history', (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const reviews = data.verification_reviews
    .filter(r => r.reviewer_id === req.user!.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const enriched = reviews.map(r => {
    const cert = data.certificates.find(c => c.id === r.certificate_id);
    const student = cert ? data.users.find(u => u.id === cert.user_id) : null;
    return {
      ...r,
      certificate_title: cert?.title || 'Unknown Certificate',
      certificate_category: cert?.category || 'General',
      student_name: student?.full_name || 'Unknown Student',
      student_roll: student?.roll_number || 'N/A'
    };
  });

  return res.json({ success: true, history: enriched });
});

export default router;
