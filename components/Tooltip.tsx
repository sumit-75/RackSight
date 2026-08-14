'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function Tooltip({ content, children, delay = 0, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const show = () => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => setVisible(true), delay));
  };

  const hide = () => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  };

  return (
    <div
      className={className || "relative inline-block"}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div className="absolute z-[9999] bottom-full left-1/2 mb-2 w-max max-w-xs px-2.5 py-1.5 text-[0.7rem] font-semibold text-slate-950 bg-[#161512] border border-[#24231f] rounded-lg shadow-xl animate-tooltip origin-bottom select-none pointer-events-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#161512]" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#24231f] -z-10" />
        </div>
      )}
    </div>
  );
}
