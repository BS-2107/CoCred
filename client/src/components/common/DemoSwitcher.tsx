import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Sparkles, GraduationCap, CheckCircle, Briefcase, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoSwitcher: React.FC = () => {
  const { user, quickDemoLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = async (role: UserRole) => {
    try {
      await quickDemoLogin(role);
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'faculty') navigate('/faculty/dashboard');
      else if (role === 'placement_officer') navigate('/placement/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (e) {
      console.error('Demo switch error:', e);
    }
  };

  return (
    <div className="bg-navy-900 text-slate-200 border-b border-navy-800 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Hackathon / Live Demo Role Switcher:
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Switch between authenticated platform roles:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleRoleSelect('student')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              user?.role === 'student'
                ? 'bg-brand-600 text-white shadow-sm ring-1 ring-white/20'
                : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student (Arjun)
          </button>

          <button
            onClick={() => handleRoleSelect('faculty')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              user?.role === 'faculty'
                ? 'bg-brand-600 text-white shadow-sm ring-1 ring-white/20'
                : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Faculty (Dr. Sharma)
          </button>

          <button
            onClick={() => handleRoleSelect('placement_officer')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              user?.role === 'placement_officer'
                ? 'bg-brand-600 text-white shadow-sm ring-1 ring-white/20'
                : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Placement (Priya)
          </button>

          <button
            onClick={() => handleRoleSelect('admin')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
              user?.role === 'admin'
                ? 'bg-brand-600 text-white shadow-sm ring-1 ring-white/20'
                : 'bg-navy-800 hover:bg-navy-700 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin (Malhotra)
          </button>
        </div>
      </div>
    </div>
  );
};
