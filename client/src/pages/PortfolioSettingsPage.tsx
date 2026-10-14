import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Globe,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Eye,
  EyeOff,
  Download,
  Share2,
  Lock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PortfolioSettingsPage: React.FC = () => {
  const { user, profile, updateProfileState, refreshUser } = useAuth();

  const [isPublic, setIsPublic] = useState(true);
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setIsPublic(profile.is_public);
      setSlug(profile.portfolio_slug || '');
    }
  }, [profile]);

  const publicUrl = slug
    ? `${window.location.origin}/portfolio/${slug}`
    : '';

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);

    try {
      const res = await api.updateStudentProfile({
        is_public: isPublic,
        portfolio_slug: slug
      });

      if (res.success) {
        updateProfileState(res.profile);
        await refreshUser();
        setSaveMsg('Portfolio and privacy settings saved successfully.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update portfolio settings.');
    } finally {
      setSaving(false);
    }
  };

  const downloadQrCode = () => {
    const svgElement = document.getElementById('portfolio-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `CoCred_Portfolio_QR_${slug || 'student'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
          <Globe className="w-6 h-6 text-brand-600" />
          Public Portfolio & QR Code Sharing
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure your shareable digital credentials portfolio, generate authentic resume QR codes, and control public visibility.
        </p>
      </div>

      {saveMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          {saveMsg}
        </div>
      )}

      {/* Main Grid: QR Code & Link Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: QR Code Display Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col items-center justify-between text-center space-y-4 md:col-span-1">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider flex items-center justify-center gap-1">
              <QrCode className="w-4 h-4" /> Live Verifiable QR
            </span>
            <p className="text-xs text-slate-500">Scan to inspect verified student credentials</p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center">
            {publicUrl ? (
              <QRCodeSVG
                id="portfolio-qr-svg"
                value={publicUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center text-xs text-slate-300">
                Generating QR...
              </div>
            )}
          </div>

          <div className="space-y-2 w-full pt-1">
            <button
              onClick={downloadQrCode}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download QR (for CV)
            </button>
            <p className="text-[10px] text-slate-400">Insert this SVG directly into your LaTeX or PDF resume</p>
          </div>
        </div>

        {/* Right Column: Settings & Link Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 md:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            {/* Visibility Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-bold text-navy-900 text-sm">
                    {isPublic ? 'Public Portfolio Active' : 'Private Mode Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPublic
                    ? 'Your portfolio is accessible via public URL and QR code. Only approved/verified achievements are shown.'
                    : 'Portfolio is hidden from external visitors. Only you and authorized faculty can view it.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            {/* Custom URL Slug */}
            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Personal Portfolio Handle / Slug *</label>
              <div className="flex items-center">
                <span className="bg-slate-100 text-slate-500 px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 font-mono text-xs">
                  {window.location.origin}/portfolio/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                  placeholder="your-name"
                  className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono text-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400">Letters, numbers, and hyphens only.</p>
            </div>

            {/* Live Link Copy Box */}
            <div className="space-y-1.5">
              <label className="font-semibold text-navy-900 block">Shareable Direct URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-mono text-xs select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Security Guarantee Banner */}
            <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100 space-y-1.5">
              <div className="flex items-center gap-1.5 text-brand-900 font-bold">
                <Shield className="w-4 h-4 text-brand-600" />
                Institutional Privacy Standard
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                CoCred never exposes private personal data (such as residential addresses, phone numbers, or pending/rejected documents) on public portfolio pages. Only credentials with explicit faculty verification stamps are shown to recruiters.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              {slug && (
                <Link
                  to={`/portfolio/${slug}`}
                  target="_blank"
                  className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  Open Live Portfolio <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
