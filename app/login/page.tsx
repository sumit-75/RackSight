'use client';

import React, { useState } from 'react';
import { loginAdmin, createAdminUser } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Activity, ShieldAlert, Lock, ArrowRight, CheckCircle2, UserPlus, Eye, EyeOff } from 'lucide-react';
import LineLoader from '@/components/LineLoader';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      if (mode === 'signin') {
        await loginAdmin(formData);
        router.push('/');
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
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {isLoading && <LineLoader />}
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200 p-8 sm:p-10 rounded-2xl shadow-lg animate-in fade-in duration-300">
        {/* Branding & Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-sm">
            <Activity className="text-slate-950" size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {mode === 'signin' ? 'Authenticate Session' : 'Register Administrator'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'signin'
              ? 'Provide administrative credentials to access RackSight metrics.'
              : 'Create a new administrative user to manage the RackSight platform.'}
          </p>
        </div>

        {/* Success notification */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-250 bg-emerald-50 text-emerald-850 p-4 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-250">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-850 p-4 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-250">
            <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder={mode === 'signin' ? 'admin' : 'new_admin'}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={mode === 'signup' ? 6 : undefined}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655 cursor-pointer"
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
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-955 font-bold py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
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
              className="text-xs font-semibold text-cyan-650 hover:text-cyan-700 transition-colors cursor-pointer"
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
