import { apiClient } from '@/lib/api';

export interface ProfilePhotoData {
  avatar: string | null;
  hasAvatar: boolean;
  user: {
    name: string;
    email: string;
  };
}

export interface UploadResult {
  avatar: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

class ProfilePhotoService {
  private cache: ProfilePhotoData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getProfilePhoto(forceRefresh = false): Promise<ProfilePhotoData> {
    const now = Date.now();
    
    // Return cached data if it's still valid and not forcing refresh
    if (!forceRefresh && this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // No dedicated endpoint; use current user data as best-effort source
      const user = await apiClient.getCurrentUser().catch(() => null);
      const data: ProfilePhotoData = {
        avatar: (user as any)?.avatar ?? null,
        hasAvatar: !!(user as any)?.avatar,
        user: { name: (user as any)?.name ?? 'User', email: (user as any)?.email ?? '' }
      };
      this.cache = data;
      this.cacheTimestamp = now;
      return data;
    } catch (error) {
      console.error('Error fetching profile photo:', error);
      // Return cached data if available, otherwise return default
      if (this.cache) {
        return this.cache;
      }
      throw error;
    }
  }

  async uploadProfilePhoto(file: File): Promise<UploadResult> {
    try {
      const res = await apiClient.uploadImage(file, { folder: 'avatars' });
      
      if (res.success && res.data) {
        try { await apiClient.updateProfile({ avatar: res.data.url } as any); } catch {}
        // Update cache with new avatar
        if (this.cache) {
          this.cache.avatar = res.data.url;
          this.cache.hasAvatar = true;
        }
        return {
          avatar: res.data.url,
          publicId: res.data.publicId,
          width: res.data.width,
          height: res.data.height,
          format: res.data.format,
          bytes: res.data.bytes
        } as UploadResult;
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  async deleteProfilePhoto(): Promise<void> {
    try {
      await apiClient.updateProfile({ avatar: '' } as any).catch(() => {});
        // Update cache to remove avatar
        if (this.cache) {
          this.cache.avatar = null;
          this.cache.hasAvatar = false;
        }
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      throw error;
    }
  }

  // Utility methods
  getCachedPhoto(): ProfilePhotoData | null {
    return this.cache;
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  // Validation helpers
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please select a valid image file (JPEG, PNG, or WebP)'
      };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 5MB'
      };
    }

    return { valid: true };
  }

  // Get user initials from name
  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

export const profilePhotoService = new ProfilePhotoService();
export default profilePhotoService;
