import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Achievement, Project, Internship } from '../types';
import {
  Trophy,
  Briefcase,
  Code2,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Building,
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';

export const AchievementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'projects' | 'internships'>('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [achModalOpen, setAchModalOpen] = useState(false);
  const [projModalOpen, setProjModalOpen] = useState(false);
  const [internModalOpen, setInternModalOpen] = useState(false);

  // Form States
  const [achForm, setAchForm] = useState({
    title: '',
    category: 'hackathon',
    organization: '',
    date: '',
    description: '',
    proof_url: ''
  });

  const [projForm, setProjForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    github_url: '',
    live_url: '',
    role: '',
    start_date: '',
    end_date: ''
  });

  const [internForm, setInternForm] = useState({
    company: '',
    role: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    certificate_url: '',
    stipend: '',
    status: 'Completed'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [achRes, projRes, internRes] = await Promise.all([
        api.getAchievements(),
        api.getProjects(),
        api.getInternships()
      ]);

      if (achRes.success) setAchievements(achRes.achievements);
      if (projRes.success) setProjects(projRes.projects);
      if (internRes.success) setInternships(internRes.internships);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAchievement(achForm);
      if (res.success) {
        setAchModalOpen(false);
        setAchForm({ title: '', category: 'hackathon', organization: '', date: '', description: '', proof_url: '' });
        fetchData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add achievement.');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addProject({
        ...projForm,
        tech_stack: projForm.tech_stack.split(',').map(s => s.trim()).filter(Boolean)
      });
      if (res.success) {
        setProjModalOpen(false);
        setProjForm({ title: '', description: '', tech_stack: '', github_url: '', live_url: '', role: '', start_date: '', end_date: '' });
        fetchData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add project.');
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addInternship(internForm);
      if (res.success) {
        setInternModalOpen(false);
        setInternForm({ company: '', role: '', location: '', start_date: '', end_date: '', description: '', certificate_url: '', stipend: '', status: 'Completed' });
        fetchData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to record internship.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-600" />
            Achievements, Projects & Experience
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Document hackathons, research papers, software engineering projects, and industrial internships.
          </p>
        </div>

        {/* Tab & Add Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'achievements' && (
            <button
              onClick={() => setAchModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Achievement
            </button>
          )}
          {activeTab === 'projects' && (
            <button
              onClick={() => setProjModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}
          {activeTab === 'internships' && (
            <button
              onClick={() => setInternModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Record Internship
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`pb-3 px-3 transition flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-slate-500 hover:text-navy-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Hackathons & Honors ({achievements.length})
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-3 transition flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-slate-500 hover:text-navy-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Technical Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`pb-3 px-3 transition flex items-center gap-2 ${
            activeTab === 'internships'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-slate-500 hover:text-navy-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Internships & Work ({internships.length})
        </button>
      </div>

      {/* Tab 1: Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {achievements.length === 0 ? (
            <p className="text-xs text-slate-400 p-8 col-span-2 text-center">No achievements added yet.</p>
          ) : (
            achievements.map(ach => (
              <div
                key={ach.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                      {ach.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ach.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-navy-900 text-sm leading-snug">{ach.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {ach.organization}
                  </p>

                  {ach.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {ach.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  {ach.proof_url ? (
                    <a
                      href={ach.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-600 hover:underline flex items-center gap-1"
                    >
                      Proof & Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : <span />}

                  <button
                    onClick={async () => {
                      if (window.confirm('Delete this achievement?')) {
                        await api.deleteAchievement(ach.id);
                        fetchData();
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Projects */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 p-8 col-span-2 text-center">No projects added yet.</p>
          ) : (
            projects.map(proj => (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-navy-900 text-sm">{proj.title}</h3>
                    {proj.role && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {proj.role}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.tech_stack.map((t, i) => (
                      <span key={i} className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <div className="flex items-center gap-3">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:text-navy-900 flex items-center gap-1">
                        <GithubIcon className="w-3.5 h-3.5" /> Code
                      </a>
                    )}
                    {proj.live_url && (
                      <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      if (window.confirm('Delete project?')) {
                        await api.deleteProject(proj.id);
                        fetchData();
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Internships */}
      {activeTab === 'internships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {internships.length === 0 ? (
            <p className="text-xs text-slate-400 p-8 col-span-2 text-center">No internships recorded yet.</p>
          ) : (
            internships.map(intern => (
              <div
                key={intern.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900 text-sm">{intern.company}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      {intern.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-brand-700">{intern.role}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{intern.start_date} → {intern.end_date || 'Present'}</span>
                    {intern.location && <span>• {intern.location}</span>}
                    {intern.stipend && <span>• {intern.stipend}</span>}
                  </div>

                  {intern.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {intern.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  {intern.certificate_url ? (
                    <a
                      href={intern.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-600 hover:underline flex items-center gap-1"
                    >
                      Completion Certificate <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : <span />}

                  <button
                    onClick={async () => {
                      if (window.confirm('Delete internship record?')) {
                        await api.deleteInternship(intern.id);
                        fetchData();
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Achievement Modal */}
      {achModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy-900 text-sm">Add Achievement / Honor</h3>
              <button onClick={() => setAchModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddAchievement} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Achievement Title *</label>
                <input
                  type="text"
                  required
                  value={achForm.title}
                  onChange={e => setAchForm({ ...achForm, title: e.target.value })}
                  placeholder="e.g. Smart India Hackathon Winner 1st Prize"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Category *</label>
                  <select
                    value={achForm.category}
                    onChange={e => setAchForm({ ...achForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="research">Research Publication</option>
                    <option value="award">Academic Award</option>
                    <option value="workshop">Workshop</option>
                    <option value="project">Competition</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={achForm.date}
                    onChange={e => setAchForm({ ...achForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Host Organization / Issuer *</label>
                <input
                  type="text"
                  required
                  value={achForm.organization}
                  onChange={e => setAchForm({ ...achForm, organization: e.target.value })}
                  placeholder="e.g. AICTE, IEEE, Google DSC"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Proof / Article / Verification URL</label>
                <input
                  type="url"
                  value={achForm.proof_url}
                  onChange={e => setAchForm({ ...achForm, proof_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Description & Impact</label>
                <textarea
                  rows={3}
                  value={achForm.description}
                  onChange={e => setAchForm({ ...achForm, description: e.target.value })}
                  placeholder="Briefly describe what you built or achieved..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAchModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {projModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy-900 text-sm">Add Technical Project</h3>
              <button onClick={() => setProjModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projForm.title}
                  onChange={e => setProjForm({ ...projForm, title: e.target.value })}
                  placeholder="e.g. CoCred Credential Platform"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Role</label>
                <input
                  type="text"
                  value={projForm.role}
                  onChange={e => setProjForm({ ...projForm, role: e.target.value })}
                  placeholder="e.g. Full-Stack Lead"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Technologies (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={projForm.tech_stack}
                  onChange={e => setProjForm({ ...projForm, tech_stack: e.target.value })}
                  placeholder="React, TypeScript, Node.js, PostgreSQL"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">GitHub URL</label>
                  <input
                    type="url"
                    value={projForm.github_url}
                    onChange={e => setProjForm({ ...projForm, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Live Demo URL</label>
                  <input
                    type="url"
                    value={projForm.live_url}
                    onChange={e => setProjForm({ ...projForm, live_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={projForm.description}
                  onChange={e => setProjForm({ ...projForm, description: e.target.value })}
                  placeholder="What problem does it solve and what was your technical contribution?"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProjModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Internship Modal */}
      {internModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy-900 text-sm">Record Internship Experience</h3>
              <button onClick={() => setInternModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddInternship} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={internForm.company}
                    onChange={e => setInternForm({ ...internForm, company: e.target.value })}
                    placeholder="e.g. Razorpay, Microsoft"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Job Role *</label>
                  <input
                    type="text"
                    required
                    value={internForm.role}
                    onChange={e => setInternForm({ ...internForm, role: e.target.value })}
                    placeholder="e.g. SDE Intern"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={internForm.start_date}
                    onChange={e => setInternForm({ ...internForm, start_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">End Date</label>
                  <input
                    type="date"
                    value={internForm.end_date}
                    onChange={e => setInternForm({ ...internForm, end_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Location</label>
                  <input
                    type="text"
                    value={internForm.location}
                    onChange={e => setInternForm({ ...internForm, location: e.target.value })}
                    placeholder="e.g. Bangalore (Hybrid)"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Stipend (Optional)</label>
                  <input
                    type="text"
                    value={internForm.stipend}
                    onChange={e => setInternForm({ ...internForm, stipend: e.target.value })}
                    placeholder="e.g. INR 45,000/mo"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Certificate / Letter Proof Link</label>
                <input
                  type="url"
                  value={internForm.certificate_url}
                  onChange={e => setInternForm({ ...internForm, certificate_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Work Description & Key Outcomes</label>
                <textarea
                  rows={3}
                  value={internForm.description}
                  onChange={e => setInternForm({ ...internForm, description: e.target.value })}
                  placeholder="Systems built, performance improvements, tools used..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInternModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold"
                >
                  Save Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
