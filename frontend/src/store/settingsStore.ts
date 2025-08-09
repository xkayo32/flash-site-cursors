import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GeneralSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_keywords: string;
  maintenance_mode: boolean;
}

export interface CompanySettings {
  company_name: string;
  company_cnpj: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_zip: string;
  company_phone: string;
  company_email: string;
  company_whatsapp: string;
}

export interface BrandSettings {
  brand_primary_color: string;
  brand_secondary_color: string;
  brand_logo_light: string;
  brand_logo_dark: string;
  brand_favicon: string;
  brand_font_primary: string;
  brand_font_secondary: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
}

export interface EmailSettings {
  from_name: string;
  from_address: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_encryption?: string;
}

export interface SystemSettings {
  general: GeneralSettings;
  company: CompanySettings;
  brand: BrandSettings;
  social: SocialSettings;
  email?: EmailSettings;
}

interface SettingsStore {
  settings: SystemSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (section: keyof SystemSettings, data: any) => Promise<void>;
  updateGeneralSettings: (data: Partial<GeneralSettings>) => Promise<void>;
  updateCompanySettings: (data: Partial<CompanySettings>) => Promise<void>;
  updateBrandSettings: (data: Partial<BrandSettings>) => Promise<void>;
  updateSocialSettings: (data: Partial<SocialSettings>) => Promise<void>;
  uploadLogo: (file: File, type: 'light' | 'dark' | 'favicon') => Promise<string>;
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://173.208.151.106:8180';

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/settings`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch settings');
          }

          const data = await response.json();
          set({ settings: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch settings',
            isLoading: false 
          });
        }
      },

      updateSettings: async (section, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ section, data }),
          });

          if (!response.ok) {
            throw new Error('Failed to update settings');
          }

          const result = await response.json();
          
          // Update local state
          const currentSettings = get().settings;
          if (currentSettings) {
            set({
              settings: {
                ...currentSettings,
                [section]: { ...currentSettings[section], ...data }
              },
              isLoading: false
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update settings',
            isLoading: false 
          });
        }
      },

      updateGeneralSettings: async (data) => {
        await get().updateSettings('general', data);
      },

      updateCompanySettings: async (data) => {
        await get().updateSettings('company', data);
      },

      updateBrandSettings: async (data) => {
        await get().updateSettings('brand', data);
      },

      updateSocialSettings: async (data) => {
        await get().updateSettings('social', data);
      },

      uploadLogo: async (file, type) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('logo', file);
          formData.append('type', type);

          const response = await fetch(`${API_BASE_URL}/api/v1/settings/logo`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload logo');
          }

          const result = await response.json();
          
          // Update the corresponding brand setting
          const currentSettings = get().settings;
          if (currentSettings && result.url) {
            const brandKey = type === 'light' ? 'brand_logo_light' : 
                           type === 'dark' ? 'brand_logo_dark' : 
                           'brand_favicon';
            
            await get().updateBrandSettings({ [brandKey]: result.url });
          }
          
          set({ isLoading: false });
          return result.url;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to upload logo',
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }), // Only persist settings
    }
  )
);