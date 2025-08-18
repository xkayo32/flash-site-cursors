import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import useTheme from '@/hooks/useTheme';

// Card Tático
interface TacticalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'tactical' | 'hover';
  animate?: boolean;
}

export const TacticalCard: React.FC<TacticalCardProps> = ({ 
  children, 
  className, 
  variant = 'tactical',
  animate = true 
}) => {
  const { getCardClasses, getTacticalStripe } = useTheme();
  
  const CardComponent = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};
  
  return (
    <CardComponent 
      className={cn(getCardClasses(variant), className)}
      {...animationProps}
    >
      {variant === 'tactical' && <div className={getTacticalStripe()} />}
      {children}
    </CardComponent>
  );
};

// Botão Tático
interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'tactical' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className,
  disabled,
  ...props
}) => {
  const { getButtonClasses } = useTheme();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };
  
  return (
    <button
      className={cn(
        getButtonClasses(variant),
        sizeClasses[size],
        'inline-flex items-center justify-center rounded-lg',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : icon}
      {children}
    </button>
  );
};

// Badge Tático
interface TacticalBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'tactical' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const TacticalBadge: React.FC<TacticalBadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  className
}) => {
  const { getBadgeClasses } = useTheme();
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };
  
  return (
    <span className={cn(
      getBadgeClasses(variant),
      sizeClasses[size],
      'inline-flex items-center gap-1 rounded-full',
      className
    )}>
      {icon}
      {children}
    </span>
  );
};

// Input Tático
interface TacticalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const TacticalInput: React.FC<TacticalInputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  const { getInputClasses } = useTheme();
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            getInputClasses(!!error),
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 font-police-body">
          {error}
        </p>
      )}
    </div>
  );
};

// Título Tático
interface TacticalHeadingProps {
  level?: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const TacticalHeading: React.FC<TacticalHeadingProps> = ({
  level = 1,
  children,
  className,
  icon
}) => {
  const { getHeadingClasses } = useTheme();
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={cn(getHeadingClasses(level), 'flex items-center gap-3', className)}>
      {icon}
      {children}
    </Tag>
  );
};

// Stat Card Tático
interface TacticalStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const TacticalStat: React.FC<TacticalStatProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  className
}) => {
  const { getStatCardClasses, getTacticalStripe } = useTheme();
  
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(getStatCardClasses(), className)}
    >
      <div className={getTacticalStripe()} />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && trendValue && (
            <p className={cn('text-xs font-police-numbers', trendColors[trend])}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-accent-500">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Divider Tático
export const TacticalDivider: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white dark:bg-gray-900 px-2">
          <div className="w-2 h-2 bg-accent-500 rounded-full" />
        </span>
      </div>
    </div>
  );
};

// Progress Bar Tático
interface TacticalProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const TacticalProgress: React.FC<TacticalProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  className
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-police-numbers font-semibold text-gray-900 dark:text-white">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full"
        />
      </div>
    </div>
  );
};

export default {
  TacticalCard,
  TacticalButton,
  TacticalBadge,
  TacticalInput,
  TacticalHeading,
  TacticalStat,
  TacticalDivider,
  TacticalProgress,
};