import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import FormValidator from '@/components/FormValidator';
import HeaderAuth from '@/components/HeaderAuth';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RackSight Dashboard",
  description: "Simplified Data Center Infrastructure Management",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const session = token ? await verifyJWT(token) : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col bg-background text-slate-900 font-sans">
        <FormValidator />
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className={`text-xl font-black tracking-wider ${orbitron.className} bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent`}>
                  RACK<span className="text-cyan-400 font-extrabold ml-0.5">SIGHT</span>
                </span>
                <span className="text-[0.65rem] uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                  v1.0
                </span>
              </Link>
              {session && (
                <nav className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <Link href="/" className="hover:text-slate-950 transition-colors">
                    Overview
                  </Link>
                  <Link href="/rooms" className="hover:text-slate-950 transition-colors">
                    Rooms
                  </Link>
                  <Link href="/settings" className="hover:text-slate-950 transition-colors">
                    Settings
                  </Link>
                </nav>
              )}
            </div>
            
            <div className="flex items-center gap-4" id="nav-auth-section">
              <HeaderAuth session={session ? { user: session.user as string } : null} />
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
