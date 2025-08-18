import { useEffect, useState } from 'react';
import theme, { militaryTerms, applyTacticalTheme } from '@/styles/theme';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar preferência salva ou preferência do sistema
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Aplicar classe dark ao HTML
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Salvar preferência
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Helper functions para aplicar classes do tema
  const getCardClasses = (variant?: 'default' | 'tactical' | 'hover') => {
    const base = 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700';
    const hover = 'hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl';
    const transition = 'transition-all duration-300';
    
    switch (variant) {
      case 'tactical':
        return `${base} ${hover} ${transition} overflow-hidden group border-l-4 border-l-accent-500`;
      case 'hover':
        return `${base} ${hover} ${transition}`;
      default:
        return `${base} ${transition}`;
    }
  };

  const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' | 'tactical' | 'danger' = 'primary') => {
    const base = 'font-police-body font-semibold uppercase tracking-wider transition-all duration-300';
    
    switch (variant) {
      case 'primary':
        return `${base} bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black`;
      case 'secondary':
        return `${base} bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white`;
      case 'ghost':
        return `${base} hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-accent-500 dark:hover:text-accent-500 border border-transparent hover:border-accent-500/30`;
      case 'tactical':
        return `${base} bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white`;
      case 'danger':
        return `${base} bg-red-600 hover:bg-red-700 text-white`;
      default:
        return `${base} ${theme.components.button.primary}`;
    }
  };

  const getBadgeClasses = (variant: 'default' | 'tactical' | 'success' | 'warning' | 'danger' | 'info' = 'default') => {
    const base = 'font-police-body font-semibold uppercase tracking-wider text-xs px-2 py-1';
    
    switch (variant) {
      case 'tactical':
        return `${base} ${theme.components.badge.tactical}`;
      case 'success':
        return `${base} ${theme.components.badge.success}`;
      case 'warning':
        return `${base} ${theme.components.badge.warning}`;
      case 'danger':
        return `${base} ${theme.components.badge.danger}`;
      case 'info':
        return `${base} ${theme.components.badge.info}`;
      default:
        return `${base} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`;
    }
  };

  const getInputClasses = (error?: boolean) => {
    const base = 'w-full px-4 py-2 rounded-lg font-police-body transition-all duration-300';
    const normal = 'bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600';
    const focus = 'focus:ring-2 focus:ring-accent-500 focus:border-transparent';
    const errorStyle = error ? 'border-red-500 dark:border-red-400' : '';
    
    return `${base} ${normal} ${focus} ${errorStyle}`;
  };

  const getHeadingClasses = (level: 1 | 2 | 3 | 4 | 5 = 1) => {
    const base = 'font-police-title font-bold uppercase tracking-ultra-wide text-gray-900 dark:text-white';
    
    const sizes = {
      1: 'text-3xl md:text-4xl',
      2: 'text-2xl md:text-3xl',
      3: 'text-xl md:text-2xl',
      4: 'text-lg md:text-xl',
      5: 'text-base md:text-lg',
    };
    
    return `${base} ${sizes[level]}`;
  };

  const getTextClasses = (variant: 'body' | 'subtitle' | 'caption' = 'body') => {
    switch (variant) {
      case 'subtitle':
        return 'font-police-subtitle uppercase tracking-wider text-gray-600 dark:text-gray-400';
      case 'caption':
        return 'font-police-body text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500';
      default:
        return 'font-police-body text-gray-700 dark:text-gray-300';
    }
  };

  const getStatCardClasses = () => {
    return 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 hover:shadow-xl transition-all duration-300 overflow-hidden p-4 rounded-lg relative';
  };

  const getTacticalStripe = () => {
    return 'absolute left-0 top-0 bottom-0 w-1 bg-accent-500';
  };

  const getGradientClasses = (type: 'header' | 'tactical' | 'accent' | 'military' = 'tactical') => {
    return theme.gradients[type];
  };

  return {
    isDarkMode,
    toggleTheme,
    theme,
    militaryTerms,
    applyTacticalTheme,
    // Class helpers
    getCardClasses,
    getButtonClasses,
    getBadgeClasses,
    getInputClasses,
    getHeadingClasses,
    getTextClasses,
    getStatCardClasses,
    getTacticalStripe,
    getGradientClasses,
  };
};

export default useTheme;