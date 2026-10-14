import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Briefcase,
  Search,
  Filter,
  GraduationCap,
  Award,
  BookOpen,
  ExternalLink,
  Code2,
  Building,
  CheckCircle2,
  Users,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlacementDashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [gradYear, setGradYear] = useState('all');
  const [minCgpa, setMinCgpa] = useState('');
  const [minCerts, setMinCerts] = useState('');

  // Portfolio Inspector Modal
  const [selectedStudentPortfolio, setSelectedStudentPortfolio] = useState<any | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  const departments = [
    'Computer Science and Engineering',
    'Electronics & Communication',
    'Information Technology',
    'Data Science & AI',
    'Electrical & Electronics'
  ];

  useEffect(() => {
    fetchCandidates();
  }, [department, gradYear, minCgpa, minCerts]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const [studentsRes, analyticsRes] = await Promise.all([
        api.getPlacementStudents({
          department,
          graduation_year: gradYear,
          min_cgpa: minCgpa || undefined,
          min_verified_certs: minCerts || undefined,
          search
        }),
        api.getPlacementAnalytics()
      ]);

      if (studentsRes.success) setStudents(studentsRes.students);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } catch (e) {
      console.error('Failed to load placement data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const inspectStudent = async (studentId: string) => {
    try {
      setLoadingPortfolio(true);
      const res = await api.getPlacementStudentPortfolio(studentId);
      if (res.success) {
        setSelectedStudentPortfolio(res);
      }
    } catch (e) {
      alert('Failed to load student portfolio.');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-brand-600" />
          Campus Placement & Recruiter Talent Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Discover vetted student candidates, verified credentials, and institutional co-curricular accomplishments.
        </p>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Total Student Profiles</span>
            <p className="text-2xl font-bold text-navy-900">{analytics.totalStudents}</p>
            <p className="text-[11px] text-slate-400">Enrolled in placement pool</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Verified Credentials</span>
            <p className="text-2xl font-bold text-emerald-600">{analytics.totalVerifiedCerts}</p>
            <p className="text-[11px] text-slate-400">Authenticated by university faculty</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Verified Projects</span>
            <p className="text-2xl font-bold text-brand-600">{analytics.totalProjects}</p>
            <p className="text-[11px] text-slate-400">With live links & source code</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Completed Internships</span>
            <p className="text-2xl font-bold text-purple-600">{analytics.totalInternships}</p>
            <p className="text-[11px] text-slate-400">Industry experience documented</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name, roll number, or specific skill (e.g. React, Python, AWS)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
          >
            Filter Talent
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Graduation Year</label>
            <select
              value={gradYear}
              onChange={e => setGradYear(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Batches</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Minimum CGPA</label>
            <select
              value={minCgpa}
              onChange={e => setMinCgpa(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">Any CGPA</option>
              <option value="7.0">7.0+ CGPA</option>
              <option value="8.0">8.0+ CGPA</option>
              <option value="8.5">8.5+ CGPA</option>
              <option value="9.0">9.0+ CGPA</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Verified Credentials</label>
            <select
              value={minCerts}
              onChange={e => setMinCerts(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="">Any Status</option>
              <option value="1">At least 1 Verified</option>
              <option value="2">At least 2 Verified</option>
              <option value="3">3+ Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading student candidate pool...</div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-navy-900 text-sm">No students match the criteria</h3>
          <p className="text-xs text-slate-500">Try broadening your CGPA, skill, or department filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header with Avatar & Department */}
                <div className="flex items-start gap-3">
                  <img
                    src={student.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${student.full_name}`}
                    alt={student.full_name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm">{student.full_name}</h3>
                    <p className="text-[11px] font-mono text-slate-500">{student.roll_number}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{student.department}</p>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">CGPA</span>
                    <span className="font-bold text-navy-900">{student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Verified</span>
                    <span className="font-bold text-emerald-600">{student.verified_certificates_count} Certs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Batch</span>
                    <span className="font-bold text-navy-900">{student.graduation_year || '2025'}</span>
                  </div>
                </div>

                {/* Skills tags */}
                {student.skills && student.skills.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Key Verified Competencies</span>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 4).map((sk: string, i: number) => (
                        <span key={i} className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-medium">
                          {sk}
                        </span>
                      ))}
                      {student.skills.length > 4 && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                          +{student.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => inspectStudent(student.id)}
                  className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Inspect Portfolio
                </button>

                {student.portfolio_slug && (
                  <Link
                    to={`/portfolio/${student.portfolio_slug}`}
                    target="_blank"
                    className="text-slate-500 hover:text-navy-900 p-1 transition"
                    title="Open public portfolio"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recruiter Full Portfolio Inspector Modal */}
      {selectedStudentPortfolio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentPortfolio.student?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Student'}
                  alt={selectedStudentPortfolio.student?.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-navy-900 text-lg leading-tight">
                    {selectedStudentPortfolio.student?.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudentPortfolio.student?.roll_number} • {selectedStudentPortfolio.student?.department}
                  </p>
                  <p className="text-xs text-brand-600 font-semibold mt-0.5">
                    CGPA: {selectedStudentPortfolio.profile?.cgpa || 'N/A'} • Graduating {selectedStudentPortfolio.student?.graduation_year}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentPortfolio(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio */}
            {selectedStudentPortfolio.profile?.bio && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Introduction</span>
                <p className="text-slate-700 leading-relaxed">{selectedStudentPortfolio.profile.bio}</p>
              </div>
            )}

            {/* Verified Certificates */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-600" />
                Verified Certificates ({selectedStudentPortfolio.certificates?.length || 0})
              </h4>

              <div className="space-y-2">
                {selectedStudentPortfolio.certificates?.length === 0 ? (
                  <p className="text-xs text-slate-400">No verified certificates on file.</p>
                ) : (
                  selectedStudentPortfolio.certificates?.map((c: any) => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-navy-900">{c.title}</p>
                        <p className="text-slate-500">{c.issuing_org} • Issued {new Date(c.issue_date).toLocaleDateString()}</p>
                      </div>
                      <a
                        href={c.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Proof
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-600" />
                Featured Projects ({selectedStudentPortfolio.projects?.length || 0})
              </h4>

              <div className="space-y-2">
                {selectedStudentPortfolio.projects?.length === 0 ? (
                  <p className="text-xs text-slate-400">No projects added yet.</p>
                ) : (
                  selectedStudentPortfolio.projects?.map((p: any) => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-navy-900">{p.title}</p>
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                            GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-slate-600">{p.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.tech_stack?.map((t: string, i: number) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Authorized Placement Cell Review</span>
              <button
                onClick={() => setSelectedStudentPortfolio(null)}
                className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
