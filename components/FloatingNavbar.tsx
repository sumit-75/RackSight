'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderAuth from '@/components/HeaderAuth';
import NavSandboxLink from '@/components/NavSandboxLink';

interface FloatingNavbarProps {
  session: { user: string } | null;
}

export default function FloatingNavbar({ session }: FloatingNavbarProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <header
      className={`sticky top-4 z-50 mx-auto px-4 sm:px-6 w-full font-sans transition-all duration-300 ${
        isLoginPage ? 'max-w-xl' : 'max-w-5xl'
      }`}
    >
      <div className="rounded-full border border-[#2e2d27] bg-[#141310]/80 backdrop-blur-xl px-4 sm:px-5 py-2.5 flex items-center justify-between shadow-2xl shadow-black/80">
        {/* Left Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-xl sm:text-2xl font-black tracking-tight font-sans bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            RackSight
          </span>
          <span className="text-[0.6rem] uppercase tracking-wider bg-[#1b1915] text-[#a3a39e] border border-[#282620] px-1.5 py-0.5 rounded-md font-sans font-bold">
            v1.0
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-extrabold text-[#a3a39e] font-sans ml-auto">
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/rooms" className="hover:text-white transition-colors">
                Rooms
              </Link>
              <Link href="/settings" className="hover:text-white transition-colors">
                Settings
              </Link>
            </>
          ) : (
            <>
              <NavSandboxLink />
              <Link href="/#features" className="hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Section (Hidden on Login Page) */}
        {!isLoginPage && (
          <div className="flex items-center gap-4 ml-4 sm:ml-6" id="nav-auth-section">
            <HeaderAuth session={session} />
          </div>
        )}
      </div>
    </header>
  );
}
