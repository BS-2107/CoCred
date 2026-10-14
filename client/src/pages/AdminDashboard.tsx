import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, AuditLog } from '../types';
import {
  Shield,
  Users,
  UserPlus,
  Building2,
  FileCheck,
  Search,
  Trash2,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle,
  Plus
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'provision' | 'logs' | 'departments'>('users');

  // Filters for user table
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Provision Faculty form state
  const [facData, setFacData] = useState({
    full_name: '',
    email: '',
    password: '',
    department: 'Computer Science and Engineering',
    phone: ''
  });
  const [provisioning, setProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState<string | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // New Department state
  const [newDeptName, setNewDeptName] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [userRoleFilter]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, logsRes, deptsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers({ role: userRoleFilter }),
        api.getAdminAuditLogs(),
        api.getAdminDepartments()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (logsRes.success) setAuditLogs(logsRes.logs);
      if (deptsRes.success) setDepartments(deptsRes.departments);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      // Refresh audit logs
      const logsRes = await api.getAdminAuditLogs();
      if (logsRes.success) setAuditLogs(logsRes.logs);
    } catch (e: any) {
      alert(e.message || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${name}"?`)) return;

    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to delete user.');
    }
  };

  const handleProvisionFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError(null);
    setProvisionSuccess(null);
    setProvisioning(true);

    try {
      const res = await api.provisionFaculty(facData);
      if (res.success) {
        setProvisionSuccess(`Faculty account provisioned successfully for ${facData.full_name}.`);
        setFacData({
          full_name: '',
          email: '',
          password: '',
          department: departments[0] || 'Computer Science and Engineering',
          phone: ''
        });
        loadAdminData();
      }
    } catch (e: any) {
      setProvisionError(e.message || 'Failed to provision faculty account.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      const res = await api.addAdminDepartment(newDeptName.trim());
      if (res.success) {
        setDepartments(res.departments);
        setNewDeptName('');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to add department.');
    }
  };

  const filteredUsers = users.filter(u => {
    if (userSearch) {
      const q = userSearch.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.roll_number && u.roll_number.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-600" />
            Institutional Administration Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage user roles, provision verified faculty credentials, configure departments, and inspect security audit trails.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === 'users' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('provision')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'provision' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Provision Faculty
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'departments' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Departments
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Total Accounts</span>
            <p className="text-2xl font-bold text-navy-900">{stats.totalUsers}</p>
            <p className="text-[11px] text-slate-400">{stats.studentsCount} Students • {stats.facultyCount} Faculty</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Total Certificates</span>
            <p className="text-2xl font-bold text-brand-600">{stats.totalCertificates}</p>
            <p className="text-[11px] text-slate-400">{stats.verifiedCertificates} Verified • {stats.pendingCertificates} Pending</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Active Departments</span>
            <p className="text-2xl font-bold text-navy-900">{stats.departmentsCount}</p>
            <p className="text-[11px] text-slate-400">Institutional faculties</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Audit Events Recorded</span>
            <p className="text-2xl font-bold text-rose-600">{stats.totalAuditLogs}</p>
            <p className="text-[11px] text-slate-400">Tamper-evident trail</p>
          </div>
        </div>
      )}

      {/* Tab: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-semibold text-navy-900">Filter Role:</span>
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  userRoleFilter === 'all' ? 'bg-navy-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setUserRoleFilter('student')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  userRoleFilter === 'student' ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setUserRoleFilter('faculty')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  userRoleFilter === 'faculty' ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Faculty
              </button>
              <button
                onClick={() => setUserRoleFilter('placement_officer')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  userRoleFilter === 'placement_officer' ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Placement
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  userRoleFilter === 'admin' ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Admins
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user by name, email..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Roll / ID</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.full_name}`}
                          alt={u.full_name}
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-navy-900">{u.full_name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="placement_officer">Placement Officer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{u.department || 'N/A'}</td>

                    <td className="py-3 px-4 font-mono text-slate-500">{u.roll_number || '—'}</td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Provision Faculty */}
      {activeTab === 'provision' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-bold text-navy-900 text-lg">Provision Faculty Reviewer Account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Creates an authorized faculty member account with permissions to review, approve, and verify student credentials.
            </p>
          </div>

          {provisionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {provisionSuccess}
            </div>
          )}

          {provisionError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {provisionError}
            </div>
          )}

          <form onSubmit={handleProvisionFaculty} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Faculty Full Name *</label>
              <input
                type="text"
                required
                value={facData.full_name}
                onChange={e => setFacData({ ...facData, full_name: e.target.value })}
                placeholder="e.g. Dr. Ramesh Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={facData.email}
                  onChange={e => setFacData({ ...facData, email: e.target.value })}
                  placeholder="r.sharma@faculty.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={facData.password}
                  onChange={e => setFacData({ ...facData, password: e.target.value })}
                  placeholder="Secure password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Assigned Academic Department *</label>
                <select
                  value={facData.department}
                  onChange={e => setFacData({ ...facData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  value={facData.phone}
                  onChange={e => setFacData({ ...facData, phone: e.target.value })}
                  placeholder="+91 94440 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={provisioning}
              className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
            >
              {provisioning ? 'Provisioning Account...' : 'Provision Authorized Faculty'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: System Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-navy-900 text-sm">Security & Verification Audit Log</h3>
              <p className="text-xs text-slate-500">Every sensitive action, certificate approval, and role modification</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 sm:px-6 flex items-start justify-between gap-4 text-xs hover:bg-slate-50/60 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-700">{log.user_name || 'System'}</span>
                    <span className="text-slate-400">• Entity: {log.entity_type}</span>
                  </div>

                  {log.details && (
                    <p className="text-slate-600 font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <p>{new Date(log.created_at).toLocaleString()}</p>
                  {log.ip_address && <p className="font-mono">IP: {log.ip_address}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="font-bold text-navy-900 text-lg">Institutional Departments</h3>
            <p className="text-xs text-slate-500">Departments determine certificate verification routing and faculty assignments.</p>
          </div>

          <form onSubmit={handleAddDepartment} className="flex gap-2">
            <input
              type="text"
              required
              value={newDeptName}
              onChange={e => setNewDeptName(e.target.value)}
              placeholder="e.g. Biomedical Engineering"
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </form>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {departments.map((dept, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between text-xs font-medium text-navy-900 hover:bg-slate-50">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {dept}
                </span>
                <span className="text-[11px] text-slate-400">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
