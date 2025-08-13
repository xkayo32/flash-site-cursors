import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  className?: string;
  animated?: boolean;
}

export function Logo({ 
  size = 'md', 
  variant = 'icon', 
  className = '',
  animated = true 
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Gerar IDs únicos para evitar conflitos de SVG
  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  const sizes = {
    sm: { icon: 32, full: { width: 120, height: 32 } },
    md: { icon: 48, full: { width: 200, height: 48 } },
    lg: { icon: 64, full: { width: 240, height: 64 } },
    xl: { icon: 80, full: { width: 280, height: 80 } }
  };

  const currentSize = sizes[size];

  const LogoIcon = () => (
    <svg 
      width={currentSize.icon} 
      height={currentSize.icon} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`gradient1-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ 
            stopColor: isDark ? '#3b82f6' : '#14242f', 
            stopOpacity: 1 
          }} />
          <stop offset="100%" style={{ 
            stopColor: isDark ? '#1d4ed8' : '#1e3a4c', 
            stopOpacity: 1 
          }} />
        </linearGradient>
        <linearGradient id={`gradient2-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ 
            stopColor: isDark ? '#fbbf24' : '#fbbf24', 
            stopOpacity: 1 
          }} />
          <stop offset="100%" style={{ 
            stopColor: isDark ? '#f59e0b' : '#f59e0b', 
            stopOpacity: 1 
          }} />
        </linearGradient>
        <filter id={`shadow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feFlood floodColor={isDark ? "#ffffff" : "#000000"} floodOpacity={isDark ? "0.3" : "0.2"}/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <circle cx="24" cy="24" r="22" fill={`url(#gradient1-${uniqueId})`} filter={`url(#shadow-${uniqueId})`}/>
      
      <path d="M12 16 L12 32 Q12 34 14 34 L22 34 Q24 34 24 32 L24 16 Q24 14 22 14 L14 14 Q12 14 12 16 Z" 
            fill="#ffffff" opacity={isDark ? "0.95" : "0.9"}/>
      
      <path d="M14 18 L22 18 M14 21 L22 21 M14 24 L22 24 M14 27 L20 27" 
            stroke={isDark ? "#1d4ed8" : "#14242f"} strokeWidth="1.5" strokeLinecap="round"/>
      
      <motion.path 
        d="M26 14 L20 24 L24 24 L22 34 L36 20 L28 20 L32 14 Z" 
        fill={`url(#gradient2-${uniqueId})`} 
        filter={`url(#shadow-${uniqueId})`}
        animate={animated ? {
          opacity: [0.8, 1, 0.8],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <path d="M36 12 L37.5 15 L40.5 15.5 L38.25 17.75 L38.75 20.75 L36 19.25 L33.25 20.75 L33.75 17.75 L31.5 15.5 L34.5 15 Z" 
            fill="#ffffff" opacity={isDark ? "0.9" : "0.8"}/>
      
      <circle cx="16" cy="38" r="1" fill="#ffffff" opacity={isDark ? "0.7" : "0.5"}/>
      <circle cx="24" cy="38" r="1" fill="#ffffff" opacity={isDark ? "0.7" : "0.5"}/>
      <circle cx="32" cy="38" r="1" fill="#ffffff" opacity={isDark ? "0.7" : "0.5"}/>
    </svg>
  );

  const LogoFull = () => (
    <svg 
      width={currentSize.full.width} 
      height={currentSize.full.height} 
      viewBox="0 0 200 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`logoGradient1-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ 
            stopColor: isDark ? '#3b82f6' : '#14242f', 
            stopOpacity: 1 
          }} />
          <stop offset="100%" style={{ 
            stopColor: isDark ? '#1d4ed8' : '#1e3a4c', 
            stopOpacity: 1 
          }} />
        </linearGradient>
        <linearGradient id={`logoGradient2-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ 
            stopColor: isDark ? '#fbbf24' : '#fbbf24', 
            stopOpacity: 1 
          }} />
          <stop offset="100%" style={{ 
            stopColor: isDark ? '#f59e0b' : '#f59e0b', 
            stopOpacity: 1 
          }} />
        </linearGradient>
        <linearGradient id={`textGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ 
            stopColor: isDark ? '#e5e7eb' : '#14242f', 
            stopOpacity: 1 
          }} />
          <stop offset="100%" style={{ 
            stopColor: isDark ? '#f3f4f6' : '#1e3a4c', 
            stopOpacity: 1 
          }} />
        </linearGradient>
        <filter id={`logoShadow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feFlood floodColor={isDark ? "#ffffff" : "#000000"} floodOpacity={isDark ? "0.3" : "0.2"}/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g>
        <circle cx="24" cy="24" r="22" fill={`url(#logoGradient1-${uniqueId})`} filter={`url(#logoShadow-${uniqueId})`}/>
        
        <path d="M12 16 L12 32 Q12 34 14 34 L22 34 Q24 34 24 32 L24 16 Q24 14 22 14 L14 14 Q12 14 12 16 Z" 
              fill="#ffffff" opacity={isDark ? "0.95" : "0.9"}/>
        
        <path d="M14 18 L22 18 M14 21 L22 21 M14 24 L22 24 M14 27 L20 27" 
              stroke={isDark ? "#1d4ed8" : "#14242f"} strokeWidth="1.5" strokeLinecap="round"/>
        
        <motion.path 
          d="M26 14 L20 24 L24 24 L22 34 L36 20 L28 20 L32 14 Z" 
          fill={`url(#logoGradient2-${uniqueId})`} 
          filter={`url(#logoShadow-${uniqueId})`}
          animate={animated ? {
            opacity: [0.8, 1, 0.8],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <path d="M36 12 L37.5 15 L40.5 15.5 L38.25 17.75 L38.75 20.75 L36 19.25 L33.25 20.75 L33.75 17.75 L31.5 15.5 L34.5 15 Z" 
              fill="#ffffff" opacity={isDark ? "0.9" : "0.8"}/>
        
        <circle cx="16" cy="38" r="1" fill="#ffffff" opacity={isDark ? "0.7" : "0.5"}/>
        <circle cx="24" cy="38" r="1" fill="#ffffff" opacity={isDark ? "0.7" : "0.5"}/>
        <circle cx="32" cy="38" r="1" fill="#ffffff" opacity={isDark ? "0.7" : "0.5"}/>
      </g>
      
      <g>
        <text x="56" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill={`url(#textGradient-${uniqueId})`}>
          Study
        </text>
        <text x="120" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill={`url(#logoGradient2-${uniqueId})`}>
          Pro
        </text>
        
        <text x="56" y="42" fontFamily="Arial, sans-serif" fontSize="10" fill={isDark ? "#9ca3af" : "#6b7280"} opacity="0.8">
          Sua aprovação começa aqui
        </text>
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return animated ? (
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <LogoIcon />
      </motion.div>
    ) : (
      <LogoIcon />
    );
  }

  return animated ? (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <LogoFull />
    </motion.div>
  ) : (
    <LogoFull />
  );
}