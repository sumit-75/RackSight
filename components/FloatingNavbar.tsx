'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderAuth from '@/components/HeaderAuth';
import NavSandboxLink from '@/components/NavSandboxLink';
import { Menu, X } from 'lucide-react';

interface FloatingNavbarProps {
  session: { user: string } | null;
}

export default function FloatingNavbar({ session }: FloatingNavbarProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-3 sm:top-4 z-50 mx-auto px-3 sm:px-6 w-full font-sans transition-all duration-300 ${
        isLoginPage ? 'max-w-xl' : 'max-w-5xl'
      }`}
    >
      <div className="rounded-full border border-[#2e2d27] bg-[#141310]/85 backdrop-blur-xl px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between shadow-2xl shadow-black/80">
        {/* Left Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileMenuOpen(false)}>
          <span className="text-lg sm:text-2xl font-black tracking-tight font-sans bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            RackSight
          </span>
          <span className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-wider bg-[#1b1915] text-[#a3a39e] border border-[#282620] px-1.5 py-0.5 rounded-md font-sans font-bold">
            v1.0
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden sm:flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-extrabold text-[#a3a39e] font-sans ml-auto">
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

        {/* Desktop Right Action Section */}
        {!isLoginPage && (
          <div className="hidden sm:flex items-center gap-4 ml-4 sm:ml-6" id="nav-auth-section">
            <HeaderAuth session={session} />
          </div>
        )}

        {/* Mobile Menu Toggle Button */}
        {!isLoginPage && (
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden p-1.5 text-[#a3a39e] hover:text-white rounded-lg border border-[#282620] bg-[#1b1915] cursor-pointer transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && !isLoginPage && (
        <div className="sm:hidden mt-2 rounded-2xl border border-[#2e2d27] bg-[#141310]/95 backdrop-blur-xl p-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2 text-sm font-extrabold text-[#a3a39e]">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/rooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Rooms
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/#interactive-demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Live Sandbox
                </Link>
                <Link
                  href="/#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  FAQ
                </Link>
              </>
            )}
          </nav>

          <div className="pt-2 border-t border-[#282620] flex items-center justify-between">
            <HeaderAuth session={session} />
          </div>
        </div>
      )}
    </header>
  );
}
