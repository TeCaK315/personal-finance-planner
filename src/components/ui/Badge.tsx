'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[hsl(var(--surface))] text-[hsl(var(--text))]',
    success: 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]',
    warning: 'bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]',
    error: 'bg-[hsl(var(--error))]/20 text-[hsl(var(--error))]',
    info: 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}