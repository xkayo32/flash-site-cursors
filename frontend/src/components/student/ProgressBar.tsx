import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'tactical' | 'minimal';
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar = ({
  value,
  max = 100,
  label,
  color = 'accent',
  size = 'md',
  variant = 'tactical',
  showPercentage = true,
  animated = true
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    accent: 'bg-accent-500'
  };

  const sizeClasses = {
    sm: { height: 'h-1', text: 'text-xs' },
    md: { height: 'h-2', text: 'text-sm' },
    lg: { height: 'h-3', text: 'text-base' }
  };

  const classes = sizeClasses[size];
  const colorClass = colorClasses[color];

  if (variant === 'minimal') {
    return (
      <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", classes.height)}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: "easeOut" }}
          className={cn("h-full rounded-full transition-all duration-300", colorClass)}
        />
      </div>
    );
  }

  if (variant === 'tactical') {
    return (
      <div className="space-y-2">
        {(label || showPercentage) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className={cn(classes.text, "font-police-body uppercase tracking-wider text-gray-700 dark:text-gray-300")}>
                {label}
              </span>
            )}
            {showPercentage && (
              <span className={cn(classes.text, "font-police-numbers font-bold text-gray-900 dark:text-white")}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", classes.height)}>
          <motion.div
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: animated ? 1.2 : 0, ease: "easeOut" }}
            className={cn("h-full rounded-full relative", colorClass)}
          >
            {/* Brilho animado */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1 
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Indicadores de marco */}
        {size === 'lg' && (
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-1">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className={cn(classes.text, "text-gray-700 dark:text-gray-300")}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={cn(classes.text, "font-medium text-gray-900 dark:text-white")}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", classes.height)}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.8 : 0, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </div>
  );
};