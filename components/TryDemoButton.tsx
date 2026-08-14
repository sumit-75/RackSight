'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function TryDemoButton() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById('interactive-demo');
    if (target) {
      const navHeight = 130;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  return (
    <a href="#interactive-demo" onClick={handleClick}>
      <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
        Try Live Demo
      </Button>
    </a>
  );
}
