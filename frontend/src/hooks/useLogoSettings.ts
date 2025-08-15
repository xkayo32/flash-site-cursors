import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/contexts/ThemeContext';

// Base URL for static assets (uploads) - WITHOUT /api/v1 prefix
const STATIC_BASE_URL = import.meta.env.VITE_API_URL || 'http://173.208.151.106:8180';

interface LogoSettings {
  logoLight: string | null;
  logoDark: string | null;
  siteName: string;
  isLoading: boolean;
}

export function useLogoSettings(): LogoSettings {
  const { settings, fetchSettings, isLoading } = useSettingsStore();
  const { resolvedTheme } = useTheme();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && !settings) {
      fetchSettings().finally(() => setHasInitialized(true));
    }
  }, [hasInitialized, settings, fetchSettings]);

  // Helper to construct proper image URL
  const getImageUrl = (path: string | undefined | null): string | null => {
    if (!path) return null;
    
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If it starts with /uploads/, prepend the static base URL
    if (path.startsWith('/uploads/')) {
      return `${STATIC_BASE_URL}${path}`;
    }
    
    // Otherwise return the path as is (for local assets)
    return path;
  };

  const logoLight = getImageUrl(settings?.brand?.brand_logo_light);
  const logoDark = getImageUrl(settings?.brand?.brand_logo_dark);
  const siteName = settings?.general?.site_name || 'StudyPro';

  return {
    logoLight,
    logoDark,
    siteName,
    isLoading
  };
}

// Hook to get the appropriate logo based on theme
export function useThemedLogo(): string | null {
  const { logoLight, logoDark } = useLogoSettings();
  const { resolvedTheme } = useTheme();
  
  // Use dark logo in dark theme, light logo in light theme
  const logo = resolvedTheme === 'dark' ? logoDark : logoLight;
  
  // Fallback to the other logo if one is not set
  return logo || logoLight || logoDark;
}