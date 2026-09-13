import React from 'react';

interface StatusBadgeProps {
  status: 'SHORTAGE' | 'WASTE' | 'NORMAL' | 'CRITICAL' | 'LOW' | 'SURPLUS' | 'ACTIVE' | 'RESOLVED' | 'PENDING' | 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';

  switch (status) {
    case 'SHORTAGE':
    case 'CRITICAL':
    case 'REJECTED':
      badgeStyle = 'bg-red-50 text-[#D32F2F] border-red-200 ring-1 ring-red-200';
      break;
    case 'WASTE':
    case 'LOW':
      badgeStyle = 'bg-amber-50 text-[#F57F17] border-amber-200 ring-1 ring-amber-200';
      break;
    case 'NORMAL':
    case 'ACCEPTED':
    case 'RESOLVED':
      badgeStyle = 'bg-emerald-50 text-[#2E7D32] border-emerald-200 ring-1 ring-emerald-200';
      break;
    case 'SURPLUS':
    case 'OVERRIDDEN':
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200';
      break;
    case 'ACTIVE':
    case 'PENDING':
      badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${badgeStyle} ${className}`}
    >
      {status}
    </span>
  );
};
