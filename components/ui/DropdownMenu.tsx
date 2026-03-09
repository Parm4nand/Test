'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string;
  divider?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
}

export default function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-gray-200 bg-white shadow-lg">
          {items.map((item, idx) => (
            <div key={idx}>
              {item.divider && idx > 0 && <div className="border-t border-gray-100 my-1" />}
              <button
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  item.className ?? 'text-gray-700'
                }`}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
