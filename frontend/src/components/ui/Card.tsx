import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
  noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', noPadding = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-900 border border-primary-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/20',
      glass: 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-600/20',
      gradient: 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-primary-400/10 dark:to-accent-400/10 border border-primary-200 dark:border-gray-700',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all',
          variants[variant],
          !noPadding && 'p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-semibold text-primary-900 dark:text-white', className)} {...props} />
  )
);

CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-primary-700 dark:text-gray-100', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';