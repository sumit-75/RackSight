'use client';

import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'gradient' | 'danger' | 'cyan';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-sans font-extrabold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]';

    const variants = {
      default: 'bg-[#1b1915] text-[#e5e5e0] hover:bg-[#24231f] hover:text-white border border-[#2e2d27] shadow-sm',
      gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md',
      cyan: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md',
      outline: 'border border-[#2e2d27] bg-[#161512] text-[#e5e5e0] hover:bg-[#201e19] hover:border-[#383630] hover:text-white',
      secondary: 'bg-[#201e19] text-[#e5e5e0] hover:bg-[#2e2d27] hover:text-white border border-[#2e2d27]',
      ghost: 'text-[#a3a39e] hover:text-white hover:bg-[#1b1915]',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white hover:text-white shadow-md',
    };

    const sizes = {
      default: 'h-10 px-5 py-2 text-sm rounded-xl',
      sm: 'h-8 px-3.5 text-xs rounded-lg',
      lg: 'h-12 px-7 py-3 text-base rounded-2xl',
      icon: 'h-10 w-10 p-2 rounded-xl flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"></span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
