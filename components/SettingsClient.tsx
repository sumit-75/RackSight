'use client';

import React, { useState } from 'react';
import { changeAdminPassword } from '@/app/actions';
import { User, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsClientProps {
  currentUsername: string;
}

export default function SettingsClient({ currentUsername }: SettingsClientProps) {
  // States for change credentials form
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const handleChangeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);
    setIsChanging(true);

    const formData = new FormData(e.currentTarget);
    try {
      await changeAdminPassword(formData);
      setChangeSuccess('Credentials updated successfully!');
      // Clear form inputs except username
      const form = e.currentTarget;
      form.currentPassword.value = '';
      form.newPassword.value = '';
      form.confirmNewPassword.value = '';
    } catch (err: any) {
      setChangeError(err.message || 'Failed to update credentials.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Admin Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Update your administrative username and password credentials.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Change Credentials Form Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <KeyRound className="text-cyan-600 font-bold" size={20} />
            <h2 className="font-bold text-lg text-slate-900">Change Credentials</h2>
          </div>

          {changeError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 p-4 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{changeError}</span>
            </div>
          )}

          {changeSuccess && (
            <div className="rounded-xl border border-emerald-250 bg-emerald-50 text-emerald-800 p-4 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{changeSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  placeholder="Verify your identity"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-955 focus:outline-none focus:border-cyan-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                New Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  name="newUsername"
                  required
                  defaultValue={currentUsername}
                  placeholder="Enter new username"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-955 focus:outline-none focus:border-cyan-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-955 focus:outline-none focus:border-cyan-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  name="confirmNewPassword"
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-955 focus:outline-none focus:border-cyan-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChanging}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-slate-955 font-bold py-2 px-4 rounded-lg text-xs shadow-lg hover:shadow-cyan-950/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isChanging ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Update Credentials'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
