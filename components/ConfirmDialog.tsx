'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div
        className="w-full max-w-md bg-[#161512] border border-[#2e2d27] rounded-2xl shadow-2xl p-6 space-y-4 animate-dialog origin-center font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-extrabold text-base text-[#f5f5f4]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#a3a39e] hover:text-white p-1.5 rounded-lg hover:bg-[#201e19] transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-[#a3a39e] leading-relaxed font-sans font-medium">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#2e2d27] bg-[#1b1915] text-xs font-bold rounded-xl text-[#e5e5e0] hover:text-white hover:bg-[#24231f] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-xl text-white transition-colors cursor-pointer shadow-md shadow-rose-950/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
