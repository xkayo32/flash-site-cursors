import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import LogoColorida from '@/assets/Logo_colorida_2.png';
import { useThemedLogo, useLogoSettings } from '@/hooks/useLogoSettings';

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
  const themedLogo = useThemedLogo();
  const { siteName, isLoading } = useLogoSettings();
  
  const sizes = {
    sm: { width: 120, height: 40, iconSize: 32 },
    md: { width: 160, height: 50, iconSize: 40 },
    lg: { width: 200, height: 60, iconSize: 48 },
    xl: { width: 240, height: 72, iconSize: 56 }
  };

  const { width, height, iconSize } = sizes[size];
  
  // Usar logo configurada no sistema, com fallback para a logo padrão
  const logoSrc = themedLogo || LogoColorida;

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
          {siteName.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default StudyProLogo;