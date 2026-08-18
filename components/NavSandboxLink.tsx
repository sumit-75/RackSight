'use client';

import React from 'react';
import Link from 'next/link';

export default function NavSandboxLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      const target = document.getElementById('interactive-demo');
      if (target) {
        const navHeight = 90;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <Link
      href="/#interactive-demo"
      onClick={handleClick}
      className="hover:text-white transition-colors cursor-pointer"
    >
      Live Sandbox
    </Link>
  );
}
