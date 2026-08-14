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
      <div className="flex items-center gap-3 font-sans">
        <span className="text-xs text-[#a3a39e] hidden sm:flex items-center gap-1.5 bg-[#1b1915] border border-[#2e2d27] px-3 py-1.5 rounded-full font-bold">
          <User size={12} className="text-emerald-400" />
          <span className="font-extrabold text-[#f5f5f4]">{session.user}</span>
        </span>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-[#2e2d27] bg-[#161512] text-[#e5e5e0] hover:text-white hover:border-[#383630] hover:bg-[#201e19] transition-all flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  // If already on login page, don't show duplicate Get Started button in navbar
  if (pathname === '/login') {
    return null;
  }

  return (
    <div className="flex items-center font-sans">
      <Link
        href="/login"
        className="rounded-full bg-white text-black font-extrabold text-xs sm:text-sm px-4 py-2 hover:bg-[#e5e5e0] transition-all shadow-md active:scale-95 font-sans flex items-center gap-1 cursor-pointer"
      >
        Get Started
      </Link>
    </div>
  );
}
