'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AccordionItem({ title, children, isOpen = false, onToggle }: AccordionItemProps) {
  return (
    <div className="border border-[#24231f] rounded-2xl bg-[#161512] font-sans overflow-hidden transition-all duration-200 hover:border-[#383630]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-bold text-[#f5f5f4] hover:text-white transition-colors cursor-pointer group"
      >
        <span className="text-base sm:text-lg tracking-tight group-hover:text-white transition-colors">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-[#a3a39e] group-hover:text-white shrink-0 transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#a3a39e] border-t border-[#24231f] pt-4 leading-relaxed font-sans">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ items }: { items: { id: string; title: string; content: React.ReactNode }[] }) {
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id || null);

  return (
    <div className="space-y-3 font-sans">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          isOpen={openId === item.id}
          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
