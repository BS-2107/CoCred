import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { CertificateModal } from '../components/common/CertificateModal';
import { DemoSwitcher } from '../components/common/DemoSwitcher';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Trophy,
  Briefcase,
  Code2,
  GraduationCap,
  Globe,
  Mail,
  Printer,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Building,
  Calendar,
  Sparkles
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/common/Icons';

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // Modal for viewing certificates
  const [previewCert, setPreviewCert] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPortfolio(slug);
    }
  }, [slug]);

  const fetchPortfolio = async (identifier: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsPrivate(false);

      const res = await api.getPublicPortfolio(identifier);
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('private')) {
        setIsPrivate(true);
      } else {
        setError(err.message || 'Student portfolio not found.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying and loading credentials...</p>
        </div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DemoSwitcher />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">Private Portfolio</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This student has chosen to keep their academic and co-curricular portfolio private. Please contact the student directly or request access through the University Placement Cell.
            </p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DemoSwitcher />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">Portfolio Not Found</h2>
            <p className="text-xs text-slate-500">
              {error || 'The requested student credential profile could not be located.'}
            </p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { student, profile, academic, certificates, achievements, projects, internships } = data;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="no-print">
        <DemoSwitcher />
      </div>

      {/* Top Banner Navigation (Hidden in print) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              C
            </div>
            <span className="font-bold text-navy-900 tracking-tight text-sm">CoCred</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Record
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <img
                src={student.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${student.full_name}`}
                alt={student.full_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                    {student.full_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    University Verified
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {student.department} • Class of {student.graduation_year || '2025'}
                </p>

                <p className="text-xs text-slate-400 font-mono">
                  Roll: {student.roll_number}
                </p>
              </div>
            </div>

            {/* Scannable Dynamic QR Code */}
            <div className="shrink-0 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center self-center sm:self-auto">
              <QRCodeSVG
                value={window.location.href}
                size={88}
                level="M"
              />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                Scan to Verify
              </span>
            </div>
          </div>

          {/* Academic Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-y border-slate-100 py-3.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">CGPA</span>
              <span className="font-extrabold text-navy-900 text-lg">{academic.cgpa ? Number(academic.cgpa).toFixed(2) : 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Semester</span>
              <span className="font-bold text-navy-900 text-base">Semester {academic.semester}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Verified Certs</span>
              <span className="font-bold text-emerald-600 text-base">{certificates.length} Approved</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Achievements</span>
              <span className="font-bold text-brand-600 text-base">{achievements.length} Honors</span>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              {profile.bio}
            </div>
          )}

          {/* Skills Badges */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Verified Skill Set & Tooling
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-semibold rounded-lg transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-4 pt-2 text-xs">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-700 hover:text-navy-900 font-semibold transition"
              >
                <GithubIcon className="w-4 h-4" /> GitHub
              </a>
            )}

            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold transition"
              >
                <LinkedinIcon className="w-4 h-4" /> LinkedIn
              </a>
            )}

            {profile.contact_email && (
              <a
                href={`mailto:${profile.contact_email}`}
                className="flex items-center gap-1.5 text-slate-600 hover:text-navy-900 transition"
              >
                <Mail className="w-4 h-4" /> {profile.contact_email}
              </a>
            )}
          </div>
        </div>

        {/* Section: Verified Certificates */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-600" />
                Verified Certificates ({certificates.length})
              </h2>
              <p className="text-xs text-slate-500">Formally validated by authorized university department faculty</p>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No verified certificates currently published.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                        {cert.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/80">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    </div>

                    <h3 className="font-bold text-navy-900 text-sm leading-snug">{cert.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {cert.issuing_org}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Issued {new Date(cert.issue_date).toLocaleDateString()}</span>
                      {cert.credential_id && (
                        <span className="font-mono text-slate-400">• ID: {cert.credential_id}</span>
                      )}
                    </div>

                    {cert.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 pt-1">{cert.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Verified by {cert.reviewer_name}
                    </span>

                    <button
                      onClick={() => setPreviewCert(cert)}
                      className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition"
                    >
                      Inspect Credential <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Achievements & Hackathons */}
        {achievements && achievements.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              Hackathons, Research & Co-Curricular Honors ({achievements.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach: any) => (
                <div
                  key={ach.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        {ach.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{new Date(ach.date).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-navy-900 text-sm">{ach.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{ach.organization}</p>

                    {ach.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{ach.description}</p>
                    )}
                  </div>

                  {ach.proof_url && (
                    <div className="pt-2 border-t border-slate-50">
                      <a
                        href={ach.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        Verification Proof <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Engineering Projects */}
        {projects && projects.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-600" />
              Featured Technical Projects ({projects.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj: any) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-navy-900 text-sm">{proj.title}</h3>
                      {proj.role && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {proj.role}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tech_stack?.map((t: string, i: number) => (
                        <span key={i} className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-50 text-xs">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:text-navy-900 flex items-center gap-1">
                        <GithubIcon className="w-3.5 h-3.5" /> Code Repository
                      </a>
                    )}
                    {proj.live_url && (
                      <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Internships */}
        {internships && internships.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              Work & Internship Experience ({internships.length})
            </h2>

            <div className="space-y-3">
              {internships.map((intern: any) => (
                <div
                  key={intern.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-navy-900 text-sm">{intern.role}</h3>
                      <p className="text-xs font-semibold text-brand-700">{intern.company} • {intern.location || 'India'}</p>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {intern.start_date} → {intern.end_date || 'Present'}
                    </span>
                  </div>

                  {intern.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{intern.description}</p>
                  )}

                  {intern.certificate_url && (
                    <div className="pt-2">
                      <a
                        href={intern.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        Verification Letter / Certificate <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Audit Notice */}
        <div className="text-center pt-8 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Authenticated Academic & Co-Curricular Portfolio
          </p>
          <p>
            This public credential page was cryptographically verified and rendered by CoCred 2.0 University Platform.
          </p>
        </div>
      </div>

      {/* Certificate Document Modal */}
      {previewCert && (
        <CertificateModal
          certificate={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}
    </div>
  );
};
