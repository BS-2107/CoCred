import React from 'react';
import { Certificate } from '../../types';
import { StatusBadge } from './StatusBadge';
import { X, ExternalLink, Calendar, Building, Award, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const isPdf = certificate.file_name.toLowerCase().endsWith('.pdf') || certificate.file_url.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900 text-lg leading-tight">{certificate.title}</h3>
              <p className="text-xs text-slate-500">{certificate.issuing_org} • {certificate.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status & Review Alert */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Status:</span>
              <StatusBadge status={certificate.status} size="md" />
            </div>

            {certificate.status === 'approved' && certificate.verified_at && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified on {new Date(certificate.verified_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Rejection Notice Banner */}
          {certificate.status === 'rejected' && certificate.rejection_reason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex gap-3 text-sm text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Faculty Rejection Reason:</p>
                <p className="mt-1 text-rose-700">{certificate.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Document Preview Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-white flex flex-col items-center justify-center min-h-[300px]">
            {isPdf ? (
              <div className="w-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <FileText className="w-16 h-16 text-brand-400" />
                <div>
                  <p className="font-medium text-slate-200">{certificate.file_name}</p>
                  <p className="text-xs text-slate-400 mt-1">Official PDF Credential Document</p>
                </div>
                <a
                  href={certificate.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Document in New Tab
                </a>
              </div>
            ) : (
              <div className="w-full max-h-[420px] overflow-hidden flex items-center justify-center bg-black/40">
                <img
                  src={certificate.file_url}
                  alt={certificate.title}
                  className="w-full h-auto max-h-[420px] object-contain"
                />
              </div>
            )}
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Issuing Organization
              </span>
              <p className="font-medium text-navy-900">{certificate.issuing_org}</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Issue Date
              </span>
              <p className="font-medium text-navy-900">
                {new Date(certificate.issue_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {certificate.expiry_date && ` (Valid until ${new Date(certificate.expiry_date).toLocaleDateString()})`}
              </p>
            </div>

            {certificate.credential_id && (
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-xs text-slate-500">Credential ID</span>
                <p className="font-mono text-xs font-medium text-navy-900">{certificate.credential_id}</p>
              </div>
            )}

            {certificate.credential_url && (
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-xs text-slate-500">Verification Link</span>
                <a
                  href={certificate.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {certificate.credential_url}
                </a>
              </div>
            )}
          </div>

          {certificate.description && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description & Competencies</p>
              <p className="text-slate-700 leading-relaxed">{certificate.description}</p>
            </div>
          )}

          {/* Review History */}
          {certificate.review && (
            <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100 text-sm space-y-2">
              <p className="text-xs font-semibold text-brand-900 uppercase tracking-wider">Faculty Review Notes</p>
              <p className="text-slate-700">{certificate.review.notes || certificate.review.reason || 'Verified as authentic institutional credential.'}</p>
              {certificate.review.reviewer_name && (
                <p className="text-xs text-brand-700 font-medium pt-1">
                  Reviewed by: {certificate.review.reviewer_name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Submitted on {new Date(certificate.created_at).toLocaleDateString()}</span>
          <div className="flex items-center gap-2">
            <a
              href={certificate.file_url}
              download={certificate.file_name}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition"
            >
              Download Original
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
