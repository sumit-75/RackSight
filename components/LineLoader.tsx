'use client';

import React, { useEffect, useState } from 'react';

export default function LineLoader() {
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    // Simulate progress growth
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          // Creep forward slowly when nearing 90%
          return oldProgress + Math.random() * 0.5;
        }
        const step = Math.random() * 12 + 4; // increment between 4% and 16%
        return Math.min(oldProgress + step, 90);
      });
    }, 150);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(16,185,129,0.8),0_0_4px_rgba(6,182,212,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
