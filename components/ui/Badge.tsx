'use client';

import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider font-sans transition-colors';

  const variants = {
    default: 'bg-[#201e19] text-[#e5e5e0] border border-[#2e2d27]',
    secondary: 'bg-[#1b1915] text-[#a3a39e] border border-[#24231f]',
    outline: 'border border-[#383630] text-[#e5e5e0]',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.15)]',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />
  );
}
