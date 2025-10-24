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
      const response = await apiClient.getProfilePhoto();
      
      if (response.success && response.data) {
        this.cache = response.data;
        this.cacheTimestamp = now;
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch profile photo');
      }
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
      const response = await apiClient.uploadProfilePhoto(file);
      
      if (response.success && response.data) {
        // Update cache with new avatar
        if (this.cache) {
          this.cache.avatar = response.data.avatar;
          this.cache.hasAvatar = true;
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  async deleteProfilePhoto(): Promise<void> {
    try {
      const response = await apiClient.deleteProfilePhoto();
      
      if (response.success) {
        // Update cache to remove avatar
        if (this.cache) {
          this.cache.avatar = null;
          this.cache.hasAvatar = false;
        }
      } else {
        throw new Error(response.message || 'Delete failed');
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
