import React from 'react';
import { Link } from 'react-router-dom';
import { DemoSwitcher } from '../components/common/DemoSwitcher';
import {
  ShieldCheck,
  Award,
  QrCode,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  GraduationCap,
  FileCheck,
  Building2,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Student Uploads Credential',
      desc: 'Students upload certificates, hackathon honors, research publications, or internship records with verifiable metadata.'
    },
    {
      step: '02',
      title: 'Faculty Peer Verification',
      desc: 'Authorized university faculty review documents against accredited standards, approving or providing structured feedback.'
    },
    {
      step: '03',
      title: 'Cryptographic Audit Trail',
      desc: 'Every approval is securely recorded with reviewer credentials, timestamps, and permanent tamper-proof history.'
    },
    {
      step: '04',
      title: 'Public Portfolio & QR Sharing',
      desc: 'Students generate a shareable verified public profile and dynamic QR code for placement officers and employers.'
    }
  ];

  const features = [
    {
      icon: Award,
      title: 'Centralized Credential Hub',
      desc: 'Store all university transcripts, certificates, hackathons, and co-curricular achievements in one unified repository.'
    },
    {
      icon: CheckCircle2,
      title: 'Faculty Verification Pipeline',
      desc: 'Legitimize achievements through formal faculty approval workflows with audit logs and transparent rejection reasons.'
    },
    {
      icon: QrCode,
      title: 'Dynamic QR Code Portfolios',
      desc: 'Instantly share a clean, verified portfolio link on resumes or LinkedIn with live authenticity verification.'
    },
    {
      icon: Search,
      title: 'Placement Officer Discovery',
      desc: 'Recruiters can filter candidates by verified technical skills, CGPA, department, and authenticated project evidence.'
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Role Permissions',
      desc: 'Role-based access control (Student, Faculty, Placement Officer, Admin) ensures data privacy and document integrity.'
    },
    {
      icon: Layers,
      title: 'Attendance & Academic Insights',
      desc: 'Track semester-wise SGPA, grade distribution, and course attendance percentages with low-attendance warnings.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DemoSwitcher />

      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-navy-900 tracking-tight text-lg">CoCred</span>
                <span className="text-[10px] bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.2 rounded font-semibold">2.0</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-navy-900 transition">Features</a>
            <a href="#workflow" className="hover:text-navy-900 transition">Verification Workflow</a>
            <a href="#roles" className="hover:text-navy-900 transition">Stakeholders</a>
            <Link to="/portfolio/arjun-mehta" className="text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Sample Portfolio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-navy-900 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition shadow-xs"
            >
              Student Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              University-Grade Academic & Co-Curricular Credential Management
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
              Verify Every Achievement. <br />
              <span className="text-brand-600">Empower Every Graduate.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CoCred centralizes student academic transcripts, extracurricular certificates, hackathon triumphs, and internships with formal faculty verification and recruiter-ready QR code portfolios.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                Create Student Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/student/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                Explore Live Demo Platform
              </Link>
            </div>

            {/* University Stats Strip */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-slate-100 max-w-4xl mx-auto">
              <div className="p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">100%</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Verified Credentials</p>
              </div>
              <div className="p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-brand-600">4 Roles</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Student, Faculty, Recruiter, Admin</p>
              </div>
              <div className="p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-navy-900">Instant</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">QR Code Verification</p>
              </div>
              <div className="p-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">Zero</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Unverified Resume Claims</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">Designed for Academia</h2>
            <h3 className="text-3xl font-bold text-navy-900">A Complete Solution for University Credentials</h3>
            <p className="text-slate-600 text-sm mt-3">From internal semester grading to public recruiter validation, CoCred streamlines the entire university achievement lifecycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-navy-900 text-base mb-2">{f.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4-Step Verification Workflow */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">Integrity First</h2>
            <h3 className="text-3xl font-bold text-navy-900">The 4-Step Certificate Verification Workflow</h3>
            <p className="text-slate-600 text-sm mt-3">How university faculty validate student credentials before they are published to public portfolios.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="relative bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-3xl font-black text-brand-200 block mb-3">{s.step}</span>
                  <h4 className="font-bold text-navy-900 text-sm mb-2">{s.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{s.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Benefits */}
      <section id="roles" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">Stakeholder Alignment</h2>
            <h3 className="text-3xl font-bold text-navy-900">Built for Every Member of Campus</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* Student */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy-900 text-sm">Students</h4>
              <ul className="space-y-2 text-slate-600">
                <li>• Real-time profile completeness score</li>
                <li>• Instant verified QR code portfolio</li>
                <li>• Track approved vs. pending certificates</li>
                <li>• Attendance tracking with 75% alerts</li>
              </ul>
            </div>

            {/* Faculty */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy-900 text-sm">Faculty Members</h4>
              <ul className="space-y-2 text-slate-600">
                <li>• Centralized pending verification queue</li>
                <li>• In-browser document & PDF inspector</li>
                <li>• Mandatory rejection reason requirement</li>
                <li>• Permanent reviewer audit history</li>
              </ul>
            </div>

            {/* Placement */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy-900 text-sm">Placement Officers</h4>
              <ul className="space-y-2 text-slate-600">
                <li>• Filter students by skills & minimum CGPA</li>
                <li>• Search by verified achievement count</li>
                <li>• One-click student portfolio inspection</li>
                <li>• Export candidate shortlists</li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-navy-900 text-sm">Administrators</h4>
              <ul className="space-y-2 text-slate-600">
                <li>• Provision authorized faculty accounts</li>
                <li>• Enforce backend role-based access</li>
                <li>• Monitor platform-wide audit logs</li>
                <li>• Manage institutional departments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-navy-950 text-slate-400 py-12 border-t border-navy-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <span className="font-semibold text-slate-200">CoCred Platform</span>
            <span>— University Academic & Co-Curricular Credential Management</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/portfolio/arjun-mehta" className="hover:text-white transition">Sample Portfolio</Link>
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
