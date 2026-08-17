'use client';

import React, { useEffect, useRef, useState } from 'react';

export type RevealVariant = 'fade-up' | 'scale-up' | 'slide-left' | 'slide-right' | 'fade-in';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds
  threshold?: number; // 0.0 to 1.0
  rootMargin?: string;
  once?: boolean;
  style?: React.CSSProperties;
}

export default function ScrollReveal({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  duration = 850,
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  once = true,
  style = {},
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect reduced motion settings
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once]);

  // CSS class mapping for variants
  const getVariantClass = () => {
    switch (variant) {
      case 'scale-up':
        return 'scroll-reveal-scale-up';
      case 'slide-left':
        return 'scroll-reveal-slide-left';
      case 'slide-right':
        return 'scroll-reveal-slide-right';
      case 'fade-in':
        return '';
      case 'fade-up':
      default:
        return 'scroll-reveal-fade-up';
    }
  };

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${getVariantClass()} ${
        isVisible ? 'scroll-reveal-visible' : ''
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
