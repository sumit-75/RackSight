'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface DeleteConfirmButtonProps {
  action: () => void;
  title: string;
  message: string;
  confirmText?: string;
  tooltipText: string;
  className?: string;
  iconSize?: number;
}

export default function DeleteConfirmButton({
  action,
  title,
  message,
  confirmText = 'Delete',
  tooltipText,
  className,
  iconSize = 16,
}: DeleteConfirmButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsOpen(false);
    setIsPending(true);
    try {
      await action();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
        className={`${className} flex items-center justify-center cursor-pointer disabled:opacity-50`}
        aria-label={tooltipText}
      >
        {isPending ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <Trash2 size={iconSize} />
        )}
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        title={title}
        message={message}
        confirmText={confirmText}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
