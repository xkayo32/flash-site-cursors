import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface ProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://173.208.151.106:8180';

// Helper function to build full avatar URL
const buildAvatarUrl = (avatar: string | undefined): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith('data:') || avatar.startsWith('http')) {
    return avatar;
  }
  return `${API_BASE_URL}${avatar}`;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }

          const data = await response.json();
          // Build full avatar URL if needed
          if (data.avatar) {
            data.avatar = buildAvatarUrl(data.avatar);
          }
          set({ profile: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch profile',
            isLoading: false 
          });
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to update profile');
          }

          const result = await response.json();
          
          // Update local state
          const currentProfile = get().profile;
          if (currentProfile && result.profile) {
            // Build full avatar URL if avatar is present
            const updatedProfile = { ...result.profile };
            if (updatedProfile.avatar) {
              updatedProfile.avatar = buildAvatarUrl(updatedProfile.avatar);
            }
            
            set({
              profile: { ...currentProfile, ...updatedProfile },
              isLoading: false
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false 
          });
          throw error;
        }
      },

      uploadAvatar: async (file: File) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('avatar', file);

          const response = await fetch(`${API_BASE_URL}/api/v1/profile/avatar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload avatar');
          }

          const result = await response.json();
          
          // Build full avatar URL
          const fullAvatarUrl = buildAvatarUrl(result.url);
          
          // Update the avatar in the current profile
          const currentProfile = get().profile;
          if (currentProfile && result.url) {
            set({
              profile: { ...currentProfile, avatar: fullAvatarUrl },
              isLoading: false
            });
          }
          
          set({ isLoading: false });
          // Return full URL for consistency
          return fullAvatarUrl || result.url;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to upload avatar',
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ profile: state.profile }), // Only persist profile
    }
  )
);