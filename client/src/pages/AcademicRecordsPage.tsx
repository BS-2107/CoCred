import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AcademicRecord } from '../types';
import { GraduationCap, Plus, Trash2, BookOpen, Award, CheckCircle } from 'lucide-react';

export const AcademicRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    semester: 5,
    course_code: '',
    course_name: '',
    credits: 4.0,
    grade: 'A+',
    sgpa: '',
    academic_year: '2023-2024'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getAcademicRecords();
      if (res.success && res.records) {
        setRecords(res.records);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.addAcademicRecord(formData);
      if (res.success) {
        setModalOpen(false);
        setFormData({
          semester: 5,
          course_code: '',
          course_name: '',
          credits: 4.0,
          grade: 'A+',
          sgpa: '',
          academic_year: '2023-2024'
        });
        await fetchRecords();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add academic record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this academic grade record?')) return;
    try {
      await api.deleteAcademicRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert('Failed to delete record.');
    }
  };

  const totalCredits = records.reduce((sum, r) => sum + Number(r.credits), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-600" />
            Academic Records & Transcripts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official semester-wise grade records, subject credits, and cumulative performance.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Course Grade
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Courses Recorded</span>
          <p className="text-2xl font-bold text-navy-900">{records.length}</p>
          <p className="text-[11px] text-slate-400">Institutional credits earned</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Credits Earned</span>
          <p className="text-2xl font-bold text-brand-600">{totalCredits}</p>
          <p className="text-[11px] text-slate-400">Across enrolled semesters</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500">Verification Status</span>
          <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" /> Validated
          </p>
          <p className="text-[11px] text-slate-400">Office of Registrar</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy-900 text-sm">Course Grades Breakdown</h3>
          <span className="text-xs text-slate-500">Semester 1 to Semester 8</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading academic records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No course grades added yet.</td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-navy-900">
                      Sem {rec.semester}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-brand-700">
                      {rec.course_code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {rec.course_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {rec.credits}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-100">
                        {rec.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {rec.academic_year}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Grade Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy-900 text-sm">Add Semester Course Grade</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Course Code</label>
                  <input
                    type="text"
                    required
                    value={formData.course_code}
                    onChange={e => setFormData({ ...formData, course_code: e.target.value })}
                    placeholder="e.g. CS601"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Course Name</label>
                <input
                  type="text"
                  required
                  value={formData.course_name}
                  onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="e.g. Cloud Computing Architecture"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    required
                    value={formData.credits}
                    onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Letter Grade</label>
                  <select
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="O">O (Outstanding - 10)</option>
                    <option value="A+">A+ (Excellent - 9)</option>
                    <option value="A">A (Very Good - 8)</option>
                    <option value="B+">B+ (Good - 7)</option>
                    <option value="B">B (Above Average - 6)</option>
                    <option value="C">C (Pass - 5)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-navy-900 block">Academic Year</label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="2023-2024"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
