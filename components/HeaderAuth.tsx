'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { logoutAdmin } from '@/app/actions';

interface HeaderAuthProps {
  session: { user: string } | null;
}

export default function HeaderAuth({ session }: HeaderAuthProps) {
  const pathname = usePathname();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
          <User size={12} className="text-emerald-500" />
          <span className="font-semibold text-slate-700 font-mono">{session.user}</span>
        </span>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  // Hide the Sign In button if we are already on the login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <Link
      href="/login"
      className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all"
    >
      Sign In
    </Link>
  );
}
