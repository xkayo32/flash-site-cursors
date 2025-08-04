import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  variant?: 'default' | 'tactical';
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = 'tactical',
  size = 'md'
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: { 
      container: 'py-8', 
      icon: 'w-12 h-12', 
      title: 'text-lg', 
      description: 'text-sm',
      maxWidth: 'max-w-sm'
    },
    md: { 
      container: 'py-12', 
      icon: 'w-16 h-16', 
      title: 'text-xl', 
      description: 'text-base',
      maxWidth: 'max-w-md'
    },
    lg: { 
      container: 'py-16', 
      icon: 'w-20 h-20', 
      title: 'text-2xl', 
      description: 'text-lg',
      maxWidth: 'max-w-lg'
    }
  };

  const classes = sizeClasses[size];

  if (variant === 'tactical') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center ${classes.container}`}
      >
        <div className="relative inline-block mb-6">
          {/* Círculo de fundo */}
          <div className="absolute inset-0 bg-accent-100 dark:bg-accent-900/20 rounded-full transform scale-110"></div>
          
          {/* Ícone */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative p-4"
          >
            <Icon className={`${classes.icon} text-accent-500 mx-auto`} />
          </motion.div>
        </div>

        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`${classes.title} font-police-title font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider`}
        >
          {title}
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`${classes.description} text-gray-600 dark:text-gray-400 mb-6 ${classes.maxWidth} mx-auto font-police-body tracking-wide`}
        >
          {description}
        </motion.p>

        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="lg"
              className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
            >
              {action.label}
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={`text-center ${classes.container}`}>
      <Icon className={`${classes.icon} text-gray-400 mx-auto mb-4`} />
      <h3 className={`${classes.title} font-semibold text-gray-900 dark:text-white mb-2`}>
        {title}
      </h3>
      <p className={`${classes.description} text-gray-600 dark:text-gray-400 mb-6 ${classes.maxWidth} mx-auto`}>
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};