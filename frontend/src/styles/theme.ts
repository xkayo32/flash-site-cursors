// Sistema de Design Militar/Tático - StudyPro
// Tema unificado para toda a aplicação

export const theme = {
  // Paleta de Cores Principal
  colors: {
    // Cores Base - Preto e Branco
    black: '#000000',
    white: '#FFFFFF',
    
    // Cor Principal - Military Blue-Gray
    primary: {
      50: '#e6e8ea',
      100: '#c2c7cc',
      200: '#9ba3ab',
      300: '#747f8a',
      400: '#566471',
      500: '#384958',
      600: '#14242f', // Cor principal do tema
      700: '#0f1b24',
      800: '#0b141a',
      900: '#070d11',
    },
    
    // Cor de Destaque - Tactical Yellow
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#facc15', // Yellow accent principal
      600: '#e5b91e', // Light theme hover
      650: '#d06e0f', // Dark theme hover
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Cores Semânticas
    success: {
      light: '#10b981',
      DEFAULT: '#059669',
      dark: '#047857',
    },
    warning: {
      light: '#fbbf24',
      DEFAULT: '#f59e0b',
      dark: '#d97706',
    },
    danger: {
      light: '#f87171',
      DEFAULT: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#60a5fa',
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
    },
    
    // Cores Táticas Especiais
    tactical: {
      green: '#22c55e',
      blue: '#3b82f6',
      purple: '#a855f7',
      orange: '#fb923c',
      red: '#ef4444',
      indigo: '#6366f1',
      yellow: '#facc15',
    },
    
    // Escala de Cinza
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },
  
  // Sistema de Tipografia
  typography: {
    fonts: {
      title: 'Orbitron, monospace',
      subtitle: 'Rajdhani, sans-serif',
      body: 'Rajdhani, sans-serif',
      numbers: 'Exo 2, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      'widest-plus': '0.15em',
      'ultra-wide': '0.2em',
    },
  },
  
  // Sistema de Espaçamento
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
    '3xl': '6rem',  // 96px
  },
  
  // Sistema de Bordas
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',   // 2px
      DEFAULT: '0.25rem', // 4px
      md: '0.375rem',   // 6px
      lg: '0.5rem',     // 8px
      xl: '0.75rem',    // 12px
      '2xl': '1rem',    // 16px
      full: '9999px',
    },
    width: {
      none: '0',
      thin: '1px',
      DEFAULT: '2px',
      thick: '4px',
    },
  },
  
  // Sistema de Sombras
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    tactical: '0 0 20px rgba(250, 204, 21, 0.1)',
  },
  
  // Sistema de Animações
  animations: {
    transitions: {
      fast: '150ms',
      DEFAULT: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Componentes Específicos
  components: {
    card: {
      background: {
        light: 'bg-white',
        dark: 'dark:bg-gray-800',
      },
      border: 'border-2 border-gray-200 dark:border-gray-700',
      hover: 'hover:border-accent-500 dark:hover:border-accent-500',
      shadow: 'hover:shadow-xl',
      tacticalStripe: 'border-l-4 border-l-accent-500',
    },
    button: {
      primary: 'bg-accent-500 hover:bg-accent-600 text-black',
      secondary: 'bg-gray-800 hover:bg-gray-700 text-white',
      ghost: 'hover:bg-white/10 text-white hover:text-accent-500',
      tactical: 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800',
    },
    badge: {
      tactical: 'bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/30',
      success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    },
    input: {
      base: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
      focus: 'focus:ring-2 focus:ring-accent-500 focus:border-transparent',
    },
  },
  
  // Gradientes Táticos
  gradients: {
    header: 'bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900',
    tactical: 'bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600',
    military: 'bg-gradient-to-br from-[#14242f] via-gray-900 to-black',
  },
  
  // Padrões Visuais
  patterns: {
    tacticalGrid: `backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(250,204,21,0.3) 1px, transparent 0)'`,
    diagonalStripes: `backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(250,204,21,0.1) 10px, rgba(250,204,21,0.1) 20px)'`,
  },
};

// Helper functions para uso consistente
export const getThemeColor = (path: string) => {
  const keys = path.split('.');
  let value: any = theme;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const applyTacticalTheme = (element: 'card' | 'button' | 'badge' | 'input', variant?: string) => {
  const component = theme.components[element];
  if (!component) return '';
  
  if (variant && component[variant]) {
    return component[variant];
  }
  
  return Object.values(component).join(' ');
};

// Terminologia Militar/Tática
export const militaryTerms = {
  dashboard: 'COMANDO TÁTICO',
  user: 'OPERADOR',
  student: 'RECRUTA',
  admin: 'COMANDANTE',
  instructor: 'INSTRUTOR TÁTICO',
  courses: 'OPERAÇÕES',
  lessons: 'MISSÕES',
  flashcards: 'ARSENAL INTEL',
  questions: 'ALVOS',
  exams: 'SIMULAÇÕES',
  statistics: 'RELATÓRIO TÁTICO',
  progress: 'STATUS OPERACIONAL',
  achievements: 'CONDECORAÇÕES',
  score: 'PONTUAÇÃO TÁTICA',
  accuracy: 'PRECISÃO',
  completed: 'MISSÃO COMPLETA',
  failed: 'MISSÃO FALHA',
  pending: 'EM ESPERA',
  active: 'EM OPERAÇÃO',
  inactive: 'INATIVO',
  locked: 'CLASSIFICADO',
  unlocked: 'LIBERADO',
  premium: 'CLEARANCE ALFA',
  basic: 'CLEARANCE BÁSICA',
};

export default theme;