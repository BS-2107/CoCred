import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AttendanceRecord } from '../types';
import { CalendarCheck, AlertTriangle, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    semester: 6,
    course_code: '',
    course_name: '',
    total_classes: 40,
    attended_classes: 35
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.getAttendance();
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
      const res = await api.addAttendance(formData);
      if (res.success) {
        setModalOpen(false);
        setFormData({
          semester: 6,
          course_code: '',
          course_name: '',
          total_classes: 40,
          attended_classes: 35
        });
        await fetchAttendance();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add attendance record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this course attendance entry?')) return;
    try {
      await api.deleteAttendance(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert('Failed to delete attendance record.');
    }
  };

  const lowAttendanceCourses = records.filter(r => Number(r.percentage) < 75);
  const avgAttendance = records.length > 0
    ? Number((records.reduce((acc, curr) => acc + Number(curr.percentage), 0) / records.length).toFixed(1))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-brand-600" />
            Attendance Monitoring & Thresholds
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time course attendance tracking with institutional 75% examination eligibility alerts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Course Attendance
        </button>
      </div>

      {/* Warning Banner if below 75% */}
      {lowAttendanceCourses.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-950">
              Low Attendance Warning ({lowAttendanceCourses.length} course{lowAttendanceCourses.length > 1 ? 's' : ''} under 75% rule)
            </p>
            <p className="text-amber-800 leading-relaxed">
              University regulations require a minimum 75% attendance for semester examination eligibility. Please attend upcoming lectures to avoid condonation penalties.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Overall Attendance Average</span>
          <p className={`text-3xl font-extrabold ${avgAttendance < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {avgAttendance}%
          </p>
          <p className="text-[11px] text-slate-400">Target minimum: 75.0%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Eligible Courses</span>
          <p className="text-3xl font-extrabold text-navy-900">
            {records.length - lowAttendanceCourses.length} / {records.length}
          </p>
          <p className="text-[11px] text-slate-400">Meeting attendance criteria</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500">Total Lectures Tracked</span>
          <p className="text-3xl font-extrabold text-brand-600">
            {records.reduce((acc, r) => acc + r.attended_classes, 0)} / {records.reduce((acc, r) => acc + r.total_classes, 0)}
          </p>
          <p className="text-[11px] text-slate-400">Classes attended this term</p>
        </div>
      </div>

      {/* Course Attendance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {records.map(rec => {
          const isWarning = Number(rec.percentage) < 75;
          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition ${
                isWarning ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {rec.course_code}
                  </span>
                  <h3 className="font-bold text-navy-900 text-sm mt-1">{rec.course_name}</h3>
                  <p className="text-[11px] text-slate-500">Semester {rec.semester}</p>
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-black ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {Number(rec.percentage).toFixed(1)}%
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {rec.attended_classes} of {rec.total_classes} classes
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Number(rec.percentage))}%` }}
                  />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                <span className={`font-semibold flex items-center gap-1 ${
                  isWarning ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {isWarning ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Attendance Shortage
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Attendance Safe
                    </>
                  )}
                </span>

                <button
                  onClick={() => handleDelete(rec.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                  title="Remove Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Attendance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy-900 text-sm">Add Course Attendance Record</h3>
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
                    placeholder="e.g. CS605"
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
                  placeholder="e.g. Distributed Systems Lab"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Total Classes Conducted</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.total_classes}
                    onChange={e => setFormData({ ...formData, total_classes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-navy-900 block">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.total_classes}
                    required
                    value={formData.attended_classes}
                    onChange={e => setFormData({ ...formData, attended_classes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
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
                  {submitting ? 'Saving...' : 'Add Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
