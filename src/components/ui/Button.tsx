'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading = false, disabled, children, className = '', ...props }, ref) => {
    const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
    
    const variantStyles = {
      primary: 'gradient-primary text-white hover:shadow-lg hover:scale-105',
      secondary: 'bg-secondary text-white hover:bg-opacity-90 hover:shadow-lg',
      accent: 'bg-accent text-background hover:bg-opacity-90 hover:shadow-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';