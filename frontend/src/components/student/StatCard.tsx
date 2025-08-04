import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'accent';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  variant?: 'default' | 'tactical';
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'accent',
  trend,
  onClick,
  variant = 'tactical',
  size = 'md'
}: StatCardProps) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    red: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
    accent: 'text-accent-600 bg-accent-100 dark:bg-accent-900/20'
  };

  const sizeClasses = {
    sm: { 
      container: 'p-3', 
      icon: 'w-6 h-6', 
      value: 'text-lg', 
      title: 'text-xs',
      subtitle: 'text-xs'
    },
    md: { 
      container: 'p-4', 
      icon: 'w-8 h-8', 
      value: 'text-2xl', 
      title: 'text-sm',
      subtitle: 'text-sm'
    },
    lg: { 
      container: 'p-6', 
      icon: 'w-10 h-10', 
      value: 'text-3xl', 
      title: 'text-base',
      subtitle: 'text-base'
    }
  };

  const classes = sizeClasses[size];
  const colorClass = colorClasses[color];

  if (variant === 'tactical') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.02 }}
        className={cn(
          "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg",
          onClick && "cursor-pointer",
          classes.container
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`${classes.title} text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider mb-1`}>
              {title}
            </p>
            
            <div className="flex items-baseline gap-2">
              <p className={`${classes.value} font-police-numbers font-bold text-gray-900 dark:text-white`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              
              {trend && (
                <span className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>

            {subtitle && (
              <p className={`${classes.subtitle} text-gray-500 dark:text-gray-400 mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={cn("rounded-full p-2", colorClass)}>
            <Icon className={`${classes.icon}`} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md",
      onClick && "cursor-pointer",
      classes.container
    )}
    onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${classes.title} text-gray-600 dark:text-gray-400`}>
            {title}
          </p>
          <p className={`${classes.value} font-bold text-gray-900 dark:text-white`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`${classes.subtitle} text-gray-500 dark:text-gray-400`}>
              {subtitle}
            </p>
          )}
        </div>
        <Icon className={`${classes.icon} ${colorClass.split(' ')[0]}`} />
      </div>
    </div>
  );
};