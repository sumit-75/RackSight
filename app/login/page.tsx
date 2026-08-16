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

      <div className="relative max-w-lg w-full font-sans">
        {/* Subtle Ambient Background Radial Aura */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-emerald-500/15 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <Card className="relative overflow-hidden border border-[#2e2d27] bg-[#141310]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] rounded-3xl">
          {/* Vibrant Top Emerald to Cyan Line Accent */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          <CardHeader className="text-center pt-9 pb-5 space-y-4">
            {/* Branding Logo Icon with Dual-Layer Radar Pulse & Vibrant Dual-Tone Glow */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-[#1b1915] to-cyan-500/15 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <Activity className="text-emerald-400" size={30} />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]" />
              </span>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight text-[#f5f5f4] font-sans">
                {mode === 'signin' ? (
                  <>
                    Authenticate <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Session</span>
                  </>
                ) : (
                  <>
                    Register <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Administrator</span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-[#c4c4be] max-w-sm mx-auto font-medium leading-relaxed font-sans">
                {mode === 'signin'
                  ? 'Provide administrative credentials to access RackSight metrics.'
                  : 'Create a new administrative user to manage the RackSight platform.'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 sm:px-10">
            {/* Success Notification */}
            {successMsg && (
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-300 p-4 text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-250 font-sans shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error Notification */}
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-300 p-4 text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-250 font-sans shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                <ShieldAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              <div className="space-y-5">
                {/* Username Input Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-mono font-extrabold text-[#c4c4be] uppercase tracking-wider mb-2 font-sans">
                    Username
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#73726c] group-focus-within:text-emerald-400 transition-colors">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      required
                      placeholder={mode === 'signin' ? 'admin' : 'new_admin'}
                      className="w-full bg-[#181713] border border-[#2e2d27] rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-base text-[#f5f5f4] placeholder-[#63625c] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Password Input Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-mono font-extrabold text-[#c4c4be] uppercase tracking-wider mb-2 font-sans">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#73726c] group-focus-within:text-emerald-400 transition-colors">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={mode === 'signup' ? 6 : undefined}
                      placeholder="••••••••"
                      className="w-full bg-[#181713] border border-[#2e2d27] rounded-xl pl-11 pr-11 py-3 sm:py-3.5 text-base text-[#f5f5f4] placeholder-[#63625c] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#73726c] hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Sign Up Mode) */}
                {mode === 'signup' && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs sm:text-sm font-mono font-extrabold text-[#c4c4be] uppercase tracking-wider mb-2 font-sans">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#73726c] group-focus-within:text-emerald-400 transition-colors">
                        <KeyRound size={18} />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        className="w-full bg-[#181713] border border-[#2e2d27] rounded-xl pl-11 pr-11 py-3 sm:py-3.5 text-base text-[#f5f5f4] placeholder-[#63625c] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#73726c] hover:text-white transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black py-4 px-6 rounded-xl text-base tracking-wide shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 font-sans"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : mode === 'signin' ? (
                  <>
                    <Lock size={18} />
                    <span>Access Dashboard</span>
                    <ArrowRight size={18} className="ml-0.5" />
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Register Account</span>
                    <ArrowRight size={18} className="ml-0.5" />
                  </>
                )}
              </button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 px-6 sm:px-10 pb-8 pt-4 border-t border-[#24231f]">
            {/* Mode Switcher Link */}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-sm sm:text-base font-extrabold text-[#e5e5e0] hover:text-emerald-400 transition-colors cursor-pointer font-sans flex items-center gap-2 mx-auto"
            >
              <span>
                {mode === 'signin'
                  ? "Don't have an admin account? Register"
                  : 'Already have an admin account? Sign In'}
              </span>
            </button>

            {/* Encrypted Session Security Footnote */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold text-[#c4c4be] pt-1">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>256-Bit Encrypted Session</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

