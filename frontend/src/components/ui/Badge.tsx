import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const badgeVariants = {
  default: 'bg-primary-900 text-white hover:bg-primary-800 dark:bg-primary-700 dark:hover:bg-primary-600',
  secondary: 'bg-primary-100 text-primary-900 hover:bg-primary-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  outline: 'border border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
  destructive: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}