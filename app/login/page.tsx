'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminUser, loginAdmin } from '@/app/actions';
import { Activity, Lock, CheckCircle2, ShieldAlert, UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react';
import LineLoader from '@/components/LineLoader';

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
    <div className="flex-1 min-h-[calc(100vh-140px)] flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {isLoading && <LineLoader />}
      <div className="max-w-md w-full space-y-8 bg-[#161512] border border-[#2e2d27] p-8 sm:p-10 rounded-2xl shadow-2xl font-sans">
        {/* Branding & Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-0.5 flex items-center justify-center shadow-md">
            <Activity className="text-slate-950" size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#f5f5f4] font-sans">
            {mode === 'signin' ? 'Authenticate Session' : 'Register Administrator'}
          </h2>
          <p className="text-xs text-[#a3a39e] font-sans">
            {mode === 'signin'
              ? 'Provide administrative credentials to access RackSight metrics.'
              : 'Create a new administrative user to manage the RackSight platform.'}
          </p>
        </div>

        {/* Success notification */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 p-4 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-250 font-sans">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 p-4 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-250 font-sans">
            <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#a3a39e] uppercase tracking-wider mb-1.5 font-sans">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder={mode === 'signin' ? 'admin' : 'new_admin'}
                className="w-full bg-[#1b1915] border border-[#282620] rounded-xl px-3.5 py-2.5 text-sm text-[#f5f5f4] placeholder-[#73726c] focus:outline-none focus:border-[#383630] transition-colors font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#a3a39e] uppercase tracking-wider mb-1.5 font-sans">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={mode === 'signup' ? 6 : undefined}
                  placeholder="••••••••"
                  className="w-full bg-[#1b1915] border border-[#282620] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#f5f5f4] placeholder-[#73726c] focus:outline-none focus:border-[#383630] transition-colors font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#73726c] hover:text-white cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold text-[#a3a39e] uppercase tracking-wider mb-1.5 font-sans">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#1b1915] border border-[#282620] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#f5f5f4] placeholder-[#73726c] focus:outline-none focus:border-[#383630] transition-colors font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#73726c] hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-955 font-extrabold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 font-sans"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-slate-955 border-t-transparent rounded-full animate-spin"></span>
            ) : mode === 'signin' ? (
              <>
                <Lock size={14} />
                Access Dashboard
                <ArrowRight size={14} className="ml-1" />
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Register Account
                <ArrowRight size={14} className="ml-1" />
              </>
            )}
          </button>

          {/* Mode Switcher */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-bold text-[#e5e5e0] hover:text-white transition-colors cursor-pointer font-sans"
            >
              {mode === 'signin'
                ? "Don't have an admin account? Register"
                : 'Already have an admin account? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
