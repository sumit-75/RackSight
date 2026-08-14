'use client';

import { useEffect } from 'react';

export default function FormValidator() {
  useEffect(() => {
    // Render and animate our custom Shadcn validation tooltip
    const showCustomTooltip = (target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      // Shift focus to the invalid field
      target.focus();

      // Clear any existing tooltips on the same control
      const existingId = target.getAttribute('data-validation-tooltip');
      if (existingId) {
        const existing = document.getElementById(existingId);
        if (existing) existing.remove();
      }

      // Generate unique identifier
      const tooltipId = `val-tooltip-${Math.random().toString(36).substr(2, 9)}`;
      target.setAttribute('data-validation-tooltip', tooltipId);

      const rect = target.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      const tooltip = document.createElement('div');
      tooltip.id = tooltipId;
      
      // Styling matches our Shadcn-style Tooltip component exactly (bright white text, dark background)
      tooltip.className = "absolute z-[9999] px-2.5 py-1.5 text-[0.7rem] font-semibold text-slate-950 bg-[#161512] border border-[#24231f] rounded-lg shadow-xl animate-tooltip select-none pointer-events-none";
      tooltip.style.top = `${rect.top + scrollY - 36}px`;
      tooltip.style.left = `${rect.left + scrollX + rect.width / 2}px`;
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.innerText = target.validationMessage;

      // Tooltip Arrow styling
      const arrow = document.createElement('div');
      arrow.className = "absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#161512]";
      tooltip.appendChild(arrow);

      const arrowBorder = document.createElement('div');
      arrowBorder.className = "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#24231f] -z-10";
      tooltip.appendChild(arrowBorder);

      document.body.appendChild(tooltip);

      // Dismiss tooltip when user types, clicks anywhere, scrolls, or resizes
      const removeTooltip = () => {
        tooltip.remove();
        target.removeAttribute('data-validation-tooltip');
        target.removeEventListener('input', removeTooltip);
        document.removeEventListener('mousedown', removeTooltip);
        document.removeEventListener('keydown', removeTooltip);
        window.removeEventListener('scroll', removeTooltip);
        window.removeEventListener('resize', removeTooltip);
      };

      // Add event listeners for auto-dismissal (avoiding focus/blur race conditions)
      target.addEventListener('input', removeTooltip);
      
      // Wait a tiny bit before registering click-to-dismiss to avoid dismissing on the same click that triggered it
      setTimeout(() => {
        document.addEventListener('mousedown', removeTooltip);
        document.addEventListener('keydown', removeTooltip);
      }, 50);

      window.addEventListener('scroll', removeTooltip, { passive: true });
      window.addEventListener('resize', removeTooltip, { passive: true });
    };

    // Intercept invalid events in the capturing phase (for all forms)
    const handleInvalid = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (!target) return;

      // Prevent native browser validation tooltip bubble
      e.preventDefault();
      
      // Stop propagation so multiple bubbles don't attempt to show
      e.stopPropagation();

      // Show custom tooltip on the first invalid element of the form only
      const form = target.form;
      if (form) {
        const firstInvalid = form.querySelector(':invalid') as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (firstInvalid && firstInvalid === target) {
          showCustomTooltip(firstInvalid);
        }
      } else {
        showCustomTooltip(target);
      }
    };

    window.addEventListener('invalid', handleInvalid, true);

    return () => {
      window.removeEventListener('invalid', handleInvalid, true);
    };
  }, []);

  return null;
}
