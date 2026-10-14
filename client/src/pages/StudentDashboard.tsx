import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Award,
  CheckCircle2,
  Clock,
  Trophy,
  Share2,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  CalendarCheck,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const portfolioUrl = profile?.portfolio_slug
    ? `${window.location.origin}/portfolio/${profile.portfolio_slug}`
    : '';

  const handleCopy = () => {
    if (portfolioUrl) {
      navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading university dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalCertificates: 0,
    verifiedCertificates: 0,
    pendingRequests: 0,
    totalAchievements: 0,
    profileCompleteness: 0,
    cgpa: 0,
    avgAttendance: 0
  };

  const categoryData = data?.charts?.categoryData || [];
  const typeData = data?.charts?.typeData || [];
  const recentActivities = data?.recentActivities || [];

  const PIE_COLORS = ['#0252a1', '#0e85eb', '#38a4f8', '#7cc5fb'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            Academic Session 2024–2025 • {user?.department || 'Computer Science'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Keep your academic records up to date. Verified certificates and approved achievements are automatically featured on your public portfolio.
          </p>
        </div>

        {/* Share Portfolio Action */}
        <div className="flex items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Public Portfolio
          </button>
          {profile?.portfolio_slug && (
            <Link
              to={`/portfolio/${profile.portfolio_slug}`}
              target="_blank"
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="Open public portfolio in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-navy-900">{stats.totalCertificates}</span>
            <span className="text-[11px] text-slate-400">Recorded</span>
          </div>
        </div>

        {/* Verified Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified by Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{stats.verifiedCertificates}</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.totalCertificates > 0
                ? `${Math.round((stats.verifiedCertificates / stats.totalCertificates) * 100)}% Verified`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{stats.pendingRequests}</span>
            <span className="text-[11px] text-slate-400">In Verification Queue</span>
          </div>
        </div>

        {/* Total Achievements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Achievements</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-navy-900">{stats.totalAchievements}</span>
            <span className="text-[11px] text-slate-400">Hackathons & Projects</span>
          </div>
        </div>
      </div>

      {/* Completeness Bar & Academic Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Completeness Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 md:col-span-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy-900">Portfolio Completeness</span>
              <span className="text-xs font-bold text-brand-600">{stats.profileCompleteness}%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Add your bio, skills, resume, and verified projects to maximize recruiter visibility.
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.profileCompleteness}%` }}
            />
          </div>

          <Link
            to="/student/profile"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-between pt-1"
          >
            <span>Complete Profile Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Academic CGPA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 md:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cumulative GPA (CGPA)</span>
            <BookOpen className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-900">{stats.cgpa ? Number(stats.cgpa).toFixed(2) : '0.00'}</span>
            <span className="text-xs text-slate-400 font-medium">/ 10.00 Scale</span>
          </div>
          <Link
            to="/student/academic-records"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-between"
          >
            <span>View Transcripts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Average Attendance Tracker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 md:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Attendance</span>
            <CalendarCheck className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${stats.avgAttendance < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {stats.avgAttendance}%
            </span>
            {stats.avgAttendance < 75 && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Under 75% Target
              </span>
            )}
          </div>
          <Link
            to="/student/attendance"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-between"
          >
            <span>Subject-wise Breakdown</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Analytics Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Categories Breakdown (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-navy-900 text-sm">Certificate Category Distribution</h3>
              <p className="text-xs text-slate-500">Aggregated from verified and uploaded credentials</p>
            </div>
            <Link to="/student/certificates" className="text-xs text-brand-600 font-semibold hover:underline">
              Manage All
            </Link>
          </div>

          <div className="h-64 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No certificate data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Bar dataKey="count" fill="#0252a1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Credentials Breakdown by Type (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div>
            <h3 className="font-semibold text-navy-900 text-sm">Portfolio Portfolio Composition</h3>
            <p className="text-xs text-slate-500">Total activities recorded</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {typeData.every((t: any) => t.value === 0) ? (
              <p className="text-xs text-slate-400">No activities added yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {typeData.map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-slate-600 truncate">{t.name}:</span>
                <span className="font-semibold text-navy-900">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-navy-900 text-sm">Recent Activity & Submissions</h3>
            <p className="text-xs text-slate-500">Real-time status updates from the faculty verification pipeline</p>
          </div>
          <Link to="/student/certificates" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View All
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent activity recorded. Upload your first certificate to get started!
            </div>
          ) : (
            recentActivities.map((act: any) => (
              <div key={act.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {act.type === 'certificate' ? <Award className="w-4 h-4 text-brand-600" /> : <Trophy className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-navy-900">{act.title}</h4>
                    <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={act.status} size="sm" />
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {new Date(act.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Share Portfolio Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-sm">Share Public Portfolio</h3>
                  <p className="text-xs text-slate-500">Recruiter & Placement Link</p>
                </div>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anyone with this link can view your verified certificates, approved hackathons, education highlights, and projects with institutional authenticity stamps.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Your Public Portfolio Link</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={portfolioUrl}
                  className="w-full bg-white px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 text-slate-700 select-all"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shrink-0 transition"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to={`/portfolio/${profile?.portfolio_slug}`}
                target="_blank"
                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
              >
                Open Portfolio Page <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
