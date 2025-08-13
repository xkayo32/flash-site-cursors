import { motion } from 'framer-motion';
import { Loader, Target } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  variant?: 'default' | 'tactical' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = ({ 
  message = "CARREGANDO...", 
  submessage = "Preparando operação...",
  variant = 'tactical',
  size = 'md'
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: { container: 'p-6', icon: 'w-6 h-6', text: 'text-sm', title: 'text-base' },
    md: { container: 'p-8', icon: 'w-8 h-8', text: 'text-base', title: 'text-lg' },
    lg: { container: 'p-12', icon: 'w-12 h-12', text: 'text-lg', title: 'text-xl' }
  };

  const classes = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader className="w-5 h-5 animate-spin text-accent-500 mr-2" />
        <span className="text-gray-600 dark:text-gray-400 text-sm">{message}</span>
      </div>
    );
  }

  if (variant === 'tactical') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex flex-col items-center justify-center ${classes.container} text-center`}
      >
        <div className="relative mb-6">
          {/* Círculo externo animado */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="w-16 h-16 border-4 border-accent-200 dark:border-accent-800 border-t-accent-500 rounded-full"></div>
          </motion.div>
          
          {/* Ícone central */}
          <div className="w-16 h-16 flex items-center justify-center">
            <Target className="w-8 h-8 text-accent-500" />
          </div>
        </div>

        <motion.h3 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`${classes.title} font-police-title font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider`}
        >
          {message}
        </motion.h3>
        
        <p className={`${classes.text} text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider`}>
          {submessage}
        </p>

        {/* Barra de progresso indeterminada */}
        <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
          <motion.div
            animate={{ x: [-128, 128] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-full bg-accent-500 rounded-full"
          />
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col items-center justify-center ${classes.container} text-center`}>
      <Loader className={`${classes.icon} animate-spin text-accent-500 mb-4`} />
      <h3 className={`${classes.title} font-semibold text-gray-900 dark:text-white mb-2`}>
        {message}
      </h3>
      {submessage && (
        <p className={`${classes.text} text-gray-600 dark:text-gray-400`}>
          {submessage}
        </p>
      )}
    </div>
  );
};