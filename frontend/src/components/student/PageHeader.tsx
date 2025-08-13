import { motion } from 'framer-motion';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  variant?: 'default' | 'tactical';
  size?: 'sm' | 'md' | 'lg';
}

export const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs = [],
  actions,
  variant = 'tactical',
  size = 'md'
}: PageHeaderProps) => {
  const sizeClasses = {
    sm: { 
      title: 'text-2xl', 
      subtitle: 'text-sm', 
      container: 'mb-4',
      icon: 'w-6 h-6'
    },
    md: { 
      title: 'text-3xl', 
      subtitle: 'text-base', 
      container: 'mb-6',
      icon: 'w-8 h-8'
    },
    lg: { 
      title: 'text-4xl', 
      subtitle: 'text-lg', 
      container: 'mb-8',
      icon: 'w-10 h-10'
    }
  };

  const classes = sizeClasses[size];

  if (variant === 'tactical') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={classes.container}
      >
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 font-police-body uppercase tracking-wider transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-police-body uppercase tracking-wider font-medium">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header principal */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="flex-shrink-0 p-3 bg-accent-100 dark:bg-accent-900/20 rounded-lg">
                <Icon className={cn(classes.icon, "text-accent-600")} />
              </div>
            )}
            
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  classes.title,
                  "font-police-title font-bold text-gray-900 dark:text-white uppercase tracking-wider"
                )}
              >
                {title}
              </motion.h1>
              
              {subtitle && (
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    classes.subtitle,
                    "text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider mt-2"
                  )}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {actions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-shrink-0"
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Linha decorativa */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-transparent rounded-full"
        />
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={classes.container}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header principal */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <Icon className={cn(classes.icon, "text-gray-600 dark:text-gray-400 mt-1")} />
          )}
          
          <div>
            <h1 className={cn(classes.title, "font-bold text-gray-900 dark:text-white")}>
              {title}
            </h1>
            
            {subtitle && (
              <p className={cn(classes.subtitle, "text-gray-600 dark:text-gray-400 mt-1")}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};