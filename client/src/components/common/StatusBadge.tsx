import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldAlert } from 'lucide-react';
import { VerificationStatus } from '../../types';

interface StatusBadgeProps {
  status: VerificationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const norm = (status || '').toLowerCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium'
  }[size];

  if (norm === 'approved' || norm === 'verified') {
    return (
      <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}>
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        Verified
      </span>
    );
  }

  if (norm === 'rejected') {
    return (
      <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}>
        {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
        Rejected
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
      {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
      Pending Verification
    </span>
  );
};
