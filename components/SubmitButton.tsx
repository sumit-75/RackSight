'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import LineLoader from './LineLoader';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function SubmitButton({ children, className, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending && <LineLoader />}
      <button
        type="submit"
        disabled={disabled || pending}
        className={`${className} flex items-center justify-center gap-1.5 disabled:opacity-60`}
        {...props}
      >
        {pending ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : (
          children
        )}
      </button>
    </>
  );
}
