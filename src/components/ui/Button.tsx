'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'gradient-primary text-white hover:opacity-90 focus:ring-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/25',
    secondary: 'bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary))]/90 focus:ring-[hsl(var(--secondary))]',
    outline: 'border-2 border-[hsl(var(--border))] text-[hsl(var(--text))] hover:bg-[hsl(var(--surface))] focus:ring-[hsl(var(--primary))]',
    ghost: 'text-[hsl(var(--text))] hover:bg-[hsl(var(--surface))] focus:ring-[hsl(var(--primary))]',
    danger: 'bg-[hsl(var(--error))] text-white hover:bg-[hsl(var(--error))]/90 focus:ring-[hsl(var(--error))]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}