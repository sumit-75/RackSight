'use client';

import { useEffect } from 'react';

export default function ScrollToHash() {
  useEffect(() => {
    const handleHashScroll = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (!hash) return;

        const timer = setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            const navHeight = 130;
            const targetPosition = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth',
            });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  return null;
}
