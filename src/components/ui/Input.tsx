'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[hsl(var(--text))] mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 bg-[hsl(var(--surface))] border rounded-lg text-[hsl(var(--text))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))] transition-all duration-200',
          error
            ? 'border-[hsl(var(--error))] focus:ring-[hsl(var(--error))]'
            : 'border-[hsl(var(--border))] focus:ring-[hsl(var(--primary))]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-[hsl(var(--error))]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-[hsl(var(--text-secondary))]">{helperText}</p>
      )}
    </div>
  );
}