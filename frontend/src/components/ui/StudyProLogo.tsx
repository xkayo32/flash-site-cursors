import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import LogoColorida from '@/assets/Logo_colorida_2.png';

interface StudyProLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const StudyProLogo: React.FC<StudyProLogoProps> = ({ 
  className = '', 
  variant = 'full',
  size = 'md' 
}) => {
  const { resolvedTheme } = useTheme();
  const sizes = {
    sm: { width: 120, height: 40, iconSize: 32 },
    md: { width: 160, height: 50, iconSize: 40 },
    lg: { width: 200, height: 60, iconSize: 48 },
    xl: { width: 240, height: 72, iconSize: 56 }
  };

  const { width, height, iconSize } = sizes[size];
  
  // Usar logo colorida em ambos os temas
  const logoSrc = LogoColorida;

  if (variant === 'icon') {
    return (
      <img
        src={logoSrc}
        alt="StudyPro Logo"
        width={iconSize}
        height={iconSize}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt="StudyPro Logo"
        width={iconSize}
        height={iconSize}
        style={{ objectFit: 'contain' }}
      />
      <div className="flex flex-col">
        <span 
          className="font-police-title tracking-widest"
          style={{ 
            fontSize: `${height * 0.5}px`,
            color: resolvedTheme === 'dark' ? '#ffffff' : '#000000'
          }}
        >
          STUDYPRO
        </span>
      </div>
    </div>
  );
};

export default StudyProLogo;