import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoSwitcher } from '../components/common/DemoSwitcher';
import { Lock, Mail, ArrowRight, ShieldCheck, GraduationCap, CheckCircle, Briefcase } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      // Determine destination or use AuthContext state
      const token = localStorage.getItem('cocred_token');
      if (token) {
        // Auth succeeds, navigate to default dashboard based on current role
        // For simplicity:
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    try {
      await quickDemoLogin(role);
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'faculty') navigate('/faculty/dashboard');
      else if (role === 'placement_officer') navigate('/placement/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DemoSwitcher />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                C
              </div>
              <span className="font-extrabold text-navy-900 tracking-tight text-2xl">CoCred</span>
            </Link>
            <h2 className="text-2xl font-bold text-navy-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500">Access your academic transcripts, credentials, and verification dashboard.</p>
          </div>

          {/* Quick Demo Login Box */}
          <div className="bg-white p-4 rounded-xl border border-brand-200/80 shadow-2xs space-y-2.5">
            <p className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              1-Click Demo Login (Hackathon Mode):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                disabled={submitting || loading}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 text-left transition flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <p className="font-semibold text-navy-900">Student</p>
                  <p className="text-[10px] text-slate-500">Arjun Mehta</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('faculty')}
                disabled={submitting || loading}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-left transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <p className="font-semibold text-navy-900">Faculty</p>
                  <p className="text-[10px] text-slate-500">Dr. Sharma</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('placement_officer')}
                disabled={submitting || loading}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 text-left transition flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-navy-900">Placement</p>
                  <p className="text-[10px] text-slate-500">Priya Nair</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={submitting || loading}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 text-left transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <p className="font-semibold text-navy-900">Admin</p>
                  <p className="text-[10px] text-slate-500">Prof. Malhotra</p>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy-900 block">University Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@cocred.edu"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-navy-900 block">Password</label>
                  <span className="text-[11px] text-brand-600 hover:text-brand-700 cursor-pointer">
                    Default demo password: password123
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Register as Student
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
