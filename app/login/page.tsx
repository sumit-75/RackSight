'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminUser, loginAdmin } from '@/app/actions';
import { Activity, Lock, User, CheckCircle2, ShieldAlert, UserPlus, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import LineLoader from '@/components/LineLoader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      if (mode === 'signin') {
        await loginAdmin(formData);
        router.push('/dashboard');
        router.refresh();
      } else {
        await createAdminUser(formData);
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
        setMode('signin');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {isLoading && <LineLoader />}

      <div className="relative max-w-md w-full font-sans">
        {/* Subtle Ambient Background Radial Aura */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="relative overflow-hidden border border-[#2e2d27] bg-[#141310]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] rounded-3xl">
          {/* Glowing Top Emerald Line Accent */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

          <CardHeader className="text-center pt-8 pb-4 space-y-3">
            {/* Branding Logo Icon with Dual-Layer Radar Pulse */}
            <div className="relative mx-auto w-14 h-14 rounded-2xl bg-[#1b1915] border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.2)] group transition-transform">
              <Activity className="text-emerald-400" size={26} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              </span>
            </div>

            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-extrabold tracking-tight text-[#f5f5f4] font-sans">
                {mode === 'signin' ? 'Authenticate Session' : 'Register Administrator'}
              </CardTitle>
              <CardDescription className="text-xs text-[#a3a39e] max-w-xs mx-auto font-sans">
                {mode === 'signin'
                  ? 'Provide administrative credentials to access RackSight metrics.'
                  : 'Create a new administrative user to manage the RackSight platform.'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 sm:px-8">
            {/* Success Notification */}
            {successMsg && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 p-3.5 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-250 font-sans">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error Notification */}
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 p-3.5 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-250 font-sans">
                <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div className="space-y-4">
                {/* Username Input Field */}
                <div>
                  <label className="block text-[0.65rem] font-mono font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5 font-sans">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#73726c]">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      required
                      placeholder={mode === 'signin' ? 'admin' : 'new_admin'}
                      className="w-full bg-[#1b1915] border border-[#282620] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#f5f5f4] placeholder-[#63625c] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Password Input Field */}
                <div>
                  <label className="block text-[0.65rem] font-mono font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5 font-sans">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#73726c]">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={mode === 'signup' ? 6 : undefined}
                      placeholder="••••••••"
                      className="w-full bg-[#1b1915] border border-[#282620] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#f5f5f4] placeholder-[#63625c] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#73726c] hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Sign Up Mode) */}
                {mode === 'signup' && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[0.65rem] font-mono font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5 font-sans">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#73726c]">
                        <KeyRound size={15} />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        className="w-full bg-[#1b1915] border border-[#282620] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#f5f5f4] placeholder-[#63625c] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#73726c] hover:text-white transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-955 font-extrabold py-3 px-6 rounded-xl text-sm shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 font-sans"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-slate-955 border-t-transparent rounded-full animate-spin"></span>
                ) : mode === 'signin' ? (
                  <>
                    <Lock size={15} />
                    <span>Access Dashboard</span>
                    <ArrowRight size={15} className="ml-0.5" />
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Register Account</span>
                    <ArrowRight size={15} className="ml-0.5" />
                  </>
                )}
              </button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 px-6 sm:px-8 pb-7 pt-2 border-t border-[#24231f]">
            {/* Mode Switcher Link */}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-bold text-[#e5e5e0] hover:text-emerald-400 transition-colors cursor-pointer font-sans flex items-center gap-1.5 mx-auto"
            >
              <span>
                {mode === 'signin'
                  ? "Don't have an admin account? Register"
                  : 'Already have an admin account? Sign In'}
              </span>
            </button>

            {/* Encrypted Session Security Footnote */}
            <div className="flex items-center justify-center gap-1.5 text-[0.65rem] font-mono text-[#73726c] pt-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>256-Bit Encrypted Session</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

