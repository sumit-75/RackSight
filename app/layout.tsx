import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import FormValidator from '@/components/FormValidator';
import FloatingNavbar from '@/components/FloatingNavbar';
import SmoothScroll from '@/components/SmoothScroll';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col bg-background text-[#e5e5e0] font-sans">
        <SmoothScroll />
        <FormValidator />
        
        {/* Floating Glassmorphic Pill Navbar */}
        <FloatingNavbar session={session ? { user: session.user as string } : null} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-4">
          {children}
        </main>
      </body>
    </html>
  );
}
