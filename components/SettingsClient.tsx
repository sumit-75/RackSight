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
    <div className="space-y-8 animate-in fade-in duration-300 font-sans max-w-xl mx-auto pt-6 sm:pt-8 pb-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f4] tracking-tight">
          Admin Settings
        </h1>
        <p className="text-[#a3a39e] text-xs sm:text-sm mt-1">
          Update your administrative username and password credentials.
        </p>
      </div>

      <div>
        {/* Change Credentials Form Card */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#24231f]">
            <KeyRound className="text-emerald-400 font-bold" size={20} />
            <h2 className="font-extrabold text-lg text-[#f5f5f4]">Change Credentials</h2>
          </div>

          {changeError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 p-4 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{changeError}</span>
            </div>
          )}

          {changeSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 p-4 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{changeSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#73726c]">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  placeholder="Verify your identity"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl pl-10 pr-3.5 py-2.5 text-sm placeholder-[#73726c] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5">
                New Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#73726c]">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  name="newUsername"
                  required
                  defaultValue={currentUsername}
                  placeholder="Enter new username"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl pl-10 pr-3.5 py-2.5 text-sm placeholder-[#73726c] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#73726c]">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl pl-10 pr-3.5 py-2.5 text-sm placeholder-[#73726c] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#73726c]">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  name="confirmNewPassword"
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl pl-10 pr-3.5 py-2.5 text-sm placeholder-[#73726c] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChanging}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
