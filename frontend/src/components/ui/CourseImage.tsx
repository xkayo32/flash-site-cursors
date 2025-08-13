import { useState } from 'react';
import { getDefaultCourseThumbnail } from '@/utils/defaultImages';

interface CourseImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackCategory?: string;
}

export function CourseImage({ src, alt, className = '', fallbackCategory }: CourseImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get the correct image URL
  const getImageUrl = () => {
    if (!src || imageError) {
      return getDefaultCourseThumbnail(fallbackCategory || alt);
    }

    // If it's already a full URL, use it as is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }

    // If it starts with /, prepend the API base URL
    if (src.startsWith('/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://173.208.151.106:8180';
      return `${apiUrl}${src}`;
    }

    // Otherwise, assume it's a relative path and prepend the API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://173.208.151.106:8180';
    return `${apiUrl}/${src}`;
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`} />
      )}
      <img
        src={getImageUrl()}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </>
  );
}