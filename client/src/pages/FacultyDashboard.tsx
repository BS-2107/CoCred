import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Certificate, VerificationReview } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CertificateModal } from '../components/common/CertificateModal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck,
  Search,
  Filter,
  Building,
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  History,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Certificate[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Review Modals
  const [inspectCert, setInspectCert] = useState<Certificate | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    loadFacultyData();
  }, [statusFilter, categoryFilter]);

  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const [dashRes, subsRes, histRes] = await Promise.all([
        api.getFacultyDashboard(),
        api.getFacultySubmissions({ status: statusFilter, category: categoryFilter }),
        api.getFacultyHistory()
      ]);

      if (dashRes.success) setStats(dashRes.stats);
      if (subsRes.success) setSubmissions(subsRes.submissions);
      if (histRes.success) setHistory(histRes.history);
    } catch (e) {
      console.error('Error loading faculty data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (cert: Certificate, action: 'approved' | 'rejected') => {
    setInspectCert(cert);
    setReviewAction(action);
    setNotes('');
    setReason('');
    setReviewError(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectCert || !reviewAction) return;

    if (reviewAction === 'rejected' && (!reason || reason.trim().length === 0)) {
      setReviewError('A detailed rejection reason is required to inform the student.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await api.reviewCertificate(inspectCert.id, {
        action: reviewAction,
        notes,
        reason: reviewAction === 'rejected' ? reason : undefined
      });

      if (res.success) {
        setInspectCert(null);
        setReviewAction(null);
        await loadFacultyData();
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.issuing_org.toLowerCase().includes(q) ||
        (s.student_name && s.student_name.toLowerCase().includes(q)) ||
        (s.student_roll && s.student_roll.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-600" />
            Faculty Credential Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted student credentials, inspect documents, and enforce academic accreditation standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'queue'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Verification Queue ({stats?.pendingCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Review History ({stats?.myReviewsCount || 0})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats?.pendingCount || 0}</p>
          <p className="text-[11px] text-slate-400">Awaiting faculty approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats?.approvedCount || 0}</p>
          <p className="text-[11px] text-slate-400">Authenticated on public profile</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Rejected Submissions</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{stats?.rejectedCount || 0}</p>
          <p className="text-[11px] text-slate-400">With feedback reason logged</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>My Reviews</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats?.myReviewsCount || 0}</p>
          <p className="text-[11px] text-slate-400">Decisions logged by your account</p>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-semibold text-navy-900 flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Status:
              </span>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  statusFilter === 'pending'
                    ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pending Queue
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  statusFilter === 'approved'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  statusFilter === 'rejected'
                    ? 'bg-rose-50 text-rose-800 font-semibold border border-rose-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-slate-100 text-navy-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student, roll, or certificate..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Submissions List */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading submissions...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-navy-900 text-sm">No submissions in queue</h3>
              <p className="text-xs text-slate-500">All student certificate submissions for this filter are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map(cert => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Student & Certificate Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={cert.student_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${cert.student_name}`}
                      alt={cert.student_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 mt-1"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-navy-900 text-sm">{cert.student_name}</span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {cert.student_roll}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {cert.student_department} • CGPA: {cert.student_cgpa || 'N/A'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-brand-700 text-base flex items-center gap-1.5">
                        {cert.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {cert.issuing_org}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Issued {new Date(cert.issue_date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                          {cert.category}
                        </span>
                      </div>

                      {cert.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 pt-1 max-w-2xl">
                          {cert.description}
                        </p>
                      )}

                      {cert.status === 'rejected' && cert.rejection_reason && (
                        <p className="text-xs text-rose-600 font-medium pt-1">
                          Rejection Reason: {cert.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <button
                      onClick={() => setInspectCert(cert)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Document
                    </button>

                    {cert.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleOpenReview(cert, 'approved')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>

                        <button
                          onClick={() => handleOpenReview(cert, 'rejected')}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className="px-3 py-1">
                        <StatusBadge status={cert.status} size="md" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-navy-900 text-sm">Faculty Verification Audit History</h3>
              <p className="text-xs text-slate-500">Chronological ledger of approvals and rejection notices</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No verification reviews logged yet.</div>
            ) : (
              history.map(item => (
                <div key={item.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900">{item.certificate_title}</span>
                      <StatusBadge status={item.action} size="sm" />
                    </div>
                    <p className="text-slate-500">
                      Student: <span className="font-medium text-slate-800">{item.student_name}</span> ({item.student_roll}) • {item.certificate_category}
                    </p>
                    {item.notes && <p className="text-slate-600 italic">Notes: "{item.notes}"</p>}
                    {item.reason && <p className="text-rose-600 font-medium">Rejection Reason: "{item.reason}"</p>}
                  </div>

                  <span className="text-slate-400 text-[11px] shrink-0">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Decision Dialog (Approve or Reject with mandatory reason) */}
      {reviewAction && inspectCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {reviewAction === 'approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="font-bold text-navy-900 text-sm">
                  {reviewAction === 'approved' ? 'Approve & Verify Credential' : 'Reject Credential Submission'}
                </h3>
              </div>
              <button onClick={() => setReviewAction(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <p className="font-semibold text-navy-900">{inspectCert.title}</p>
              <p className="text-slate-500">Student: {inspectCert.student_name} ({inspectCert.student_roll})</p>
              <p className="text-slate-500">Issuer: {inspectCert.issuing_org}</p>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {reviewAction === 'rejected' ? (
                <div className="space-y-1.5">
                  <label className="font-semibold text-rose-900 block">
                    Mandatory Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Provide specific feedback (e.g. Unproctored coursework, illegible certificate scan, missing verification code)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  <p className="text-[11px] text-slate-400">This feedback will be notified directly to the student on their dashboard.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-semibold text-navy-900 block">
                    Optional Faculty Validation Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Verified via external verification portal; authentic accreditation."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-5 py-2 rounded-xl text-white font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                    reviewAction === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {submittingReview ? 'Logging Decision...' : reviewAction === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Certificate Document Modal */}
      {inspectCert && !reviewAction && (
        <CertificateModal
          certificate={inspectCert}
          onClose={() => setInspectCert(null)}
        />
      )}
    </div>
  );
};
