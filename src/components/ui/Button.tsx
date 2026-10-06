'use client';

import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 dark:focus:ring-stone-100 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-900 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-100',
    outline: 'border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100',
    ghost: 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300',
    glass: 'bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-sm text-stone-900 dark:bg-stone-900/80 dark:border-stone-800 dark:text-stone-100',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
