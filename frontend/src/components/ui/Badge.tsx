import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const badgeVariants = {
  default: 'bg-primary-900 text-white hover:bg-primary-800',
  secondary: 'bg-primary-100 text-primary-900 hover:bg-primary-200',
  outline: 'border border-primary-200 text-primary-700 hover:bg-primary-50',
  destructive: 'bg-red-500 text-white hover:bg-red-600'
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