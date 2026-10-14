import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Certificate } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CertificateModal } from '../components/common/CertificateModal';
import {
  Award,
  Upload,
  Search,
  Plus,
  Trash2,
  Eye,
  FileText,
  Building,
  Calendar,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Form state
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    issuing_org: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
    category: 'Industry Certification',
    description: ''
  });

  const categories = [
    'Industry Certification',
    'Technical Course',
    'Academic Honors',
    'Online Course',
    'Workshop & Training',
    'Participation & Co-Curricular'
  ];

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.getCertificates();
      if (res.success && res.certificates) {
        setCertificates(res.certificates);
      }
    } catch (e) {
      console.error('Failed to load certificates:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!file) {
      setFormError('Please select a certificate document (PDF or Image).');
      return;
    }

    setUploading(true);

    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('title', formData.title);
      payload.append('issuing_org', formData.issuing_org);
      payload.append('issue_date', formData.issue_date);
      if (formData.expiry_date) payload.append('expiry_date', formData.expiry_date);
      if (formData.credential_id) payload.append('credential_id', formData.credential_id);
      if (formData.credential_url) payload.append('credential_url', formData.credential_url);
      payload.append('category', formData.category);
      if (formData.description) payload.append('description', formData.description);

      const res = await api.uploadCertificate(payload);
      if (res.success) {
        setUploadModalOpen(false);
        setFile(null);
        setFormData({
          title: '',
          issuing_org: '',
          issue_date: '',
          expiry_date: '',
          credential_id: '',
          credential_url: '',
          category: 'Industry Certification',
          description: ''
        });
        await fetchCertificates();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to upload certificate.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.deleteCertificate(id);
      setCertificates(prev => prev.filter(c => c.id !== id));
      if (selectedCert?.id === id) setSelectedCert(null);
    } catch (e) {
      alert('Failed to delete certificate.');
    }
  };

  // Filter list
  const filtered = certificates.filter(c => {
    if (activeTab !== 'all' && c.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.issuing_org.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-brand-600" />
            Certificates & Verifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload institutional credentials and submit for faculty verification.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Certificate
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-white text-navy-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            All ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'pending'
                ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Pending ({certificates.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'approved'
                ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Verified ({certificates.filter(c => c.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'rejected'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Rejected ({certificates.filter(c => c.status === 'rejected').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or issuer..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Certificates Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading certificate records...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-navy-900 text-sm">No certificates found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || activeTab !== 'all'
              ? 'Try modifying your search or filter criteria.'
              : 'Start by uploading your first professional certificate or technical credential.'}
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Upload Certificate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(cert => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                {/* Status & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100/60">
                    {cert.category}
                  </span>
                  <StatusBadge status={cert.status} size="sm" />
                </div>

                {/* Title & Organization */}
                <div>
                  <h3 className="font-bold text-navy-900 text-sm group-hover:text-brand-600 transition line-clamp-1">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cert.issuing_org}</span>
                  </p>
                </div>

                {/* Metadata */}
                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Issue Date:
                    </span>
                    <span className="font-medium text-slate-700">{new Date(cert.issue_date).toLocaleDateString()}</span>
                  </div>
                  {cert.credential_id && (
                    <div className="flex items-center justify-between font-mono">
                      <span>ID:</span>
                      <span className="truncate max-w-[140px]">{cert.credential_id}</span>
                    </div>
                  )}
                </div>

                {/* Rejection Alert Box */}
                {cert.status === 'rejected' && cert.rejection_reason && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-[11px] text-rose-700 space-y-0.5">
                    <p className="font-semibold text-rose-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Rejection Feedback:
                    </p>
                    <p className="line-clamp-2 text-rose-600">{cert.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View & Verify
                </button>

                <button
                  onClick={() => handleDelete(cert.id, cert.title)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                  title="Delete Certificate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Certificate Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy-900 text-lg">Upload Certificate for Verification</h3>
                <p className="text-xs text-slate-500">Document will be routed to departmental faculty for review.</p>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Document File Drag & Drop / Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Certificate Document (PDF or Image) *</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl p-5 text-center transition bg-slate-50/50">
                  <input
                    type="file"
                    required
                    id="certificate-file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="certificate-file" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-brand-600 mx-auto" />
                    <p className="font-semibold text-navy-900">
                      {file ? file.name : 'Click to select or drag and drop certificate'}
                    </p>
                    <p className="text-[11px] text-slate-400">PDF, PNG, JPG, or WebP up to 10MB</p>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Certificate Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Organization & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-navy-900 block">Issuing Organization *</label>
                  <input
                    type="text"
                    required
                    value={formData.issuing_org}
                    onChange={e => setFormData({ ...formData, issuing_org: e.target.value })}
                    placeholder="e.g. Amazon Web Services, NPTEL, Coursera"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-navy-900 block">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-navy-900 block">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.issue_date}
                    onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-navy-900 block">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Credential ID & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-navy-900 block">Credential ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.credential_id}
                    onChange={e => setFormData({ ...formData, credential_id: e.target.value })}
                    placeholder="e.g. AWS-SAA-83921"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-navy-900 block">Verification URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.credential_url}
                    onChange={e => setFormData({ ...formData, credential_url: e.target.value })}
                    placeholder="https://verify.example.org/id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-navy-900 block">Description & Covered Skills</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key topics learned, technologies covered, or exam score..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? 'Uploading & Submitting...' : 'Submit for Faculty Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <CertificateModal
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
};
