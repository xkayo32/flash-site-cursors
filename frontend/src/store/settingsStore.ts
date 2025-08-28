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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8180';

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching settings from:', `${API_BASE_URL}/api/v1/settings`);
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(`${API_BASE_URL}/api/v1/settings`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error('Failed to fetch settings');
          }

          const data = await response.json();
          console.log('Settings received:', JSON.stringify(data, null, 2));
          set({ settings: data, isLoading: false });
        } catch (error) {
          console.error('Error fetching settings:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch settings',
            isLoading: false 
          });
        }
      },

      updateSettings: async (section, data) => {
        console.log(`🚀 Starting update for ${section}...`);
        set({ isLoading: true, error: null });
        
        try {
          // Send only the section being updated (simpler approach)
          const payload = {
            [section]: data
          };
          
          console.log(`📤 Sending ${section} settings:`, JSON.stringify(payload, null, 2));
          console.log(`📍 API URL: ${API_BASE_URL}/api/v1/settings`);
          
          const response = await fetch(`${API_BASE_URL}/api/v1/settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
          });

          console.log(`📥 Response status: ${response.status}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response not ok:', errorText);
            throw new Error(`Failed to update settings: ${response.status}`);
          }

          const result = await response.json();
          console.log('✅ Update response:', result);
          
          // Update local state with the response from server
          console.log('🔄 Updating local state...');
          set({
            settings: result.settings,
            isLoading: false
          });
          
          console.log('✅ Settings update completed successfully!');
          
        } catch (error) {
          console.error('❌ Error updating settings:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update settings',
            isLoading: false 
          });
          throw error; // Re-throw so handleSave can catch it
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