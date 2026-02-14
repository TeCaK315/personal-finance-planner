'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[hsl(var(--text))] mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full px-4 py-2.5 bg-[hsl(var(--surface))] border rounded-lg text-[hsl(var(--text))] appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))] transition-all duration-200 cursor-pointer',
            error
              ? 'border-[hsl(var(--error))] focus:ring-[hsl(var(--error))]'
              : 'border-[hsl(var(--border))] focus:ring-[hsl(var(--primary))]',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--text-secondary))] pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-[hsl(var(--error))]">{error}</p>
      )}
    </div>
  );
}