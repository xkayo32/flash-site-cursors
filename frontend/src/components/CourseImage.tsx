import { useState } from 'react';
import { Shield, Target, Award, Users, BookOpen, Scale, Building, Car } from 'lucide-react';

interface CourseImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackCategory?: string;
}

const getCategoryIcon = (category: string) => {
  const icons = {
    'POLÍCIA FEDERAL': Shield,
    'POLÍCIA MILITAR': Target,
    'POLÍCIA CIVIL': Scale,
    'FORÇAS ARMADAS': Award,
    'RECEITA FEDERAL': Building,
    'TRIBUNAIS': Scale,
    'GUARDA MUNICIPAL': Users,
    'POLÍCIA RODOVIÁRIA FEDERAL': Car,
    'DEFAULT': BookOpen
  };
  
  return icons[category as keyof typeof icons] || icons.DEFAULT;
};

const getCategoryColor = (category: string) => {
  const colors = {
    'POLÍCIA FEDERAL': 'from-blue-900 to-blue-700',
    'POLÍCIA MILITAR': 'from-green-900 to-green-700',
    'POLÍCIA CIVIL': 'from-gray-900 to-gray-700',
    'FORÇAS ARMADAS': 'from-red-900 to-red-700',
    'RECEITA FEDERAL': 'from-purple-900 to-purple-700',
    'TRIBUNAIS': 'from-indigo-900 to-indigo-700',
    'GUARDA MUNICIPAL': 'from-teal-900 to-teal-700',
    'POLÍCIA RODOVIÁRIA FEDERAL': 'from-yellow-900 to-yellow-700',
    'DEFAULT': 'from-gray-800 to-gray-600'
  };
  
  return colors[category as keyof typeof colors] || colors.DEFAULT;
};

export function CourseImage({ src, alt, className = '', fallbackCategory = '' }: CourseImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (imageError || !src) {
    const Icon = getCategoryIcon(fallbackCategory);
    const colorGradient = getCategoryColor(fallbackCategory);
    
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className={`w-full h-full bg-gradient-to-br ${colorGradient} flex items-center justify-center relative`}>
          {/* Tactical pattern background */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.1) 10px,
                rgba(255, 255, 255, 0.1) 20px
              )`
            }}
          />
          
          {/* Icon and text overlay */}
          <div className="relative z-10 text-center text-white">
            <Icon className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <div className="text-xs font-police-subtitle font-bold uppercase tracking-wider px-2">
              {fallbackCategory || 'CURSO'}
            </div>
          </div>
          
          {/* Corner tactical elements */}
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-white opacity-30" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-white opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(fallbackCategory)} flex items-center justify-center`}>
          <div className="text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-xs font-police-subtitle uppercase tracking-wider">
              CARREGANDO
            </div>
          </div>
        </div>
      )}
    </div>
  );
}