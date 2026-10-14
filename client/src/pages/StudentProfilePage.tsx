import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  User,
  Save,
  CheckCircle,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/common/Icons';
import { Link } from 'react-router-dom';

export const StudentProfilePage: React.FC = () => {
  const { user, profile, refreshUser, updateProfileState } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    department: '',
    roll_number: '',
    graduation_year: 2025,
    bio: '',
    cgpa: 0.0,
    semester: 6,
    linkedin_url: '',
    github_url: '',
    portfolio_slug: '',
    is_public: true,
    contact_email: '',
    resume_url: '',
    skills: [] as string[]
  });

  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        department: user.department || 'Computer Science and Engineering',
        roll_number: user.roll_number || '',
        graduation_year: user.graduation_year || 2025,
        bio: profile?.bio || '',
        cgpa: profile?.cgpa || 0.0,
        semester: profile?.semester || 1,
        linkedin_url: profile?.linkedin_url || '',
        github_url: profile?.github_url || '',
        portfolio_slug: profile?.portfolio_slug || '',
        is_public: profile?.is_public ?? true,
        contact_email: profile?.contact_email || user.email,
        resume_url: profile?.resume_url || '',
        skills: profile?.skills || []
      });
    }
  }, [user, profile]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.updateStudentProfile(formData);
      if (res.success) {
        setSuccessMsg('Student profile and portfolio metadata updated successfully.');
        updateProfileState(res.profile);
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-brand-600" />
            Student Academic Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your institutional information, biographical overview, and verified skill competencies.
          </p>
        </div>

        {formData.portfolio_slug && (
          <Link
            to={`/portfolio/${formData.portfolio_slug}`}
            target="_blank"
            className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-brand-200/80 transition shadow-2xs self-start"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Public Portfolio
          </Link>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Institutional Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-navy-900 text-sm border-b border-slate-100 pb-2">
            Institutional Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Roll / University Registration Number *</label>
              <input
                type="text"
                required
                value={formData.roll_number}
                onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Department *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={e => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Current Semester</label>
                <select
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-navy-900 text-sm border-b border-slate-100 pb-2">
            Bio & Technical Competencies
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Professional Bio & Career Objective</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your technical interests, engineering focus, or research aspirations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
              />
            </div>

            {/* Skills tag input */}
            <div className="space-y-2">
              <label className="font-semibold text-navy-900 block">Skills & Frameworks</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                  placeholder="Type a skill (e.g. Docker, TypeScript) and press Enter"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200/60 px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-brand-900 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Links & Portfolio Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-navy-900 text-sm border-b border-slate-100 pb-2">
            Portfolio Links & Professional Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block flex items-center gap-1.5">
                <LinkedinIcon className="w-3.5 h-3.5 text-brand-600" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-navy-900" /> GitHub Profile URL
              </label>
              <input
                type="url"
                value={formData.github_url}
                onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Custom Portfolio Slug</label>
              <div className="flex items-center">
                <span className="bg-slate-100 text-slate-500 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 text-xs">
                  /portfolio/
                </span>
                <input
                  type="text"
                  required
                  value={formData.portfolio_slug}
                  onChange={e => setFormData({ ...formData, portfolio_slug: e.target.value })}
                  placeholder="arjun-mehta"
                  className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
            <div>
              <p className="font-semibold text-navy-900">Portfolio Public Visibility</p>
              <p className="text-[11px] text-slate-500">Allow placement officers and public recruiters to view your verified achievements.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
