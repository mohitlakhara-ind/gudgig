// Data service for fetching server-sent data
import { apiClient } from '@/lib/api';

export interface ServerStats {
  activeGigs: number;
  totalFreelancers: number;
  successRate: number;
  totalRevenue: number;
  totalBids: number;
  pendingBids: number;
  acceptedBids: number;
  rejectedBids: number;
}

export interface ServerConfig {
  platformName: string;
  platformDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  features: {
    guestBrowsing: boolean;
    bidFees: boolean;
    messaging: boolean;
    notifications: boolean;
  };
}

class DataService {
  private statsCache: ServerStats | null = null;
  private configCache: ServerConfig | null = null;
  private categoriesCache: Array<{ name: string; count: number; icon: string }> | null = null;
  private testimonialsCache: Array<any> | null = null;
  private announcementsCache: Array<any> | null = null;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastFetch = 0;
  private isOnline = true;

  constructor() {
    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.clearCache(); // Clear cache when coming back online
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  private isCacheValid(): boolean {
    const now = Date.now();
    return (now - this.lastFetch) < this.cacheExpiry;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Get platform statistics
  async getStats(): Promise<ServerStats> {
    // Return cached data if still valid
    if (this.statsCache && this.isCacheValid()) {
      return this.statsCache;
    }

    if (!this.isOnline) {
      // Return cached data if offline
      if (this.statsCache) {
        return this.statsCache;
      }
      throw new Error('You are offline and no cached data is available');
    }

    try {
      // Try to fetch from server
      const response = await this.fetchWithTimeout('/api/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.statsCache = data;
        this.lastFetch = Date.now();
        return data;
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to fetch stats from server:', error);
      
      // Return cached data if available
      if (this.statsCache) {
        return this.statsCache;
      }
      
      // Fallback data if no cache available
      return {
        activeGigs: 127,
        totalFreelancers: 1250,
        successRate: 98,
        totalRevenue: 125000,
        totalBids: 3420,
        pendingBids: 156,
        acceptedBids: 2890,
        rejectedBids: 374,
      };
    }
  }

  // Get platform configuration
  async getConfig(): Promise<ServerConfig> {
    if (this.configCache) {
      return this.configCache;
    }

    try {
      const response = await fetch('/api/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.configCache = data;
        return data;
      }
    } catch (error) {
      console.warn('Failed to fetch config from server, using fallback data');
    }

    // Fallback configuration
    return {
      platformName: 'Gigs Mint',
      platformDescription: 'Professional freelancer marketplace connecting talented freelancers with clients seeking quality work.',
      contactEmail: 'support@gigsmint.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Business Street, Suite 100, City, State 12345',
      socialLinks: {
        twitter: 'https://twitter.com/gigsmint',
        linkedin: 'https://linkedin.com/company/gigsmint',
        facebook: 'https://facebook.com/gigsmint',
        instagram: 'https://instagram.com/gigsmint',
      },
      features: {
        guestBrowsing: true,
        bidFees: true,
        messaging: true,
        notifications: true,
      },
    };
  }

  // Get featured categories
  async getFeaturedCategories(): Promise<Array<{ name: string; count: number; icon: string }>> {
    try {
      const response = await fetch('/api/categories/featured', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn('Failed to fetch featured categories from server, using fallback data');
    }

    // Fallback categories
    return [
      { name: 'Web Development', count: 45, icon: '💻' },
      { name: 'Graphic Design', count: 32, icon: '🎨' },
      { name: 'Content Writing', count: 28, icon: '✍️' },
      { name: 'Digital Marketing', count: 24, icon: '📈' },
      { name: 'Mobile Development', count: 19, icon: '📱' },
      { name: 'Data Entry', count: 15, icon: '📊' },
    ];
  }

  // Get recent testimonials
  async getTestimonials(): Promise<Array<{
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar?: string;
  }>> {
    try {
      const response = await fetch('/api/testimonials', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn('Failed to fetch testimonials from server, using fallback data');
    }

    // Fallback testimonials
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Freelance Designer',
        content: 'Gigs Mint has transformed my freelance career. The quality of projects and clients is outstanding.',
        rating: 5,
      },
      {
        id: '2',
        name: 'Michael Chen',
        role: 'Web Developer',
        content: 'I\'ve found amazing long-term clients through this platform. Highly recommended!',
        rating: 5,
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        role: 'Content Writer',
        content: 'The bidding system is fair and transparent. I love working with Gigs Mint.',
        rating: 5,
      },
    ];
  }

  // Get platform announcements
  async getAnnouncements(): Promise<Array<{
    id: string;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error';
    publishedAt: string;
    isActive: boolean;
  }>> {
    try {
      const response = await fetch('/api/announcements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.filter((announcement: any) => announcement.isActive);
      }
    } catch (error) {
      console.warn('Failed to fetch announcements from server, using fallback data');
    }

    // Fallback announcements
    return [
      {
        id: '1',
        title: 'New Payment System',
        content: 'We\'ve upgraded our payment processing for faster and more secure transactions.',
        type: 'success',
        publishedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: '2',
        title: 'Mobile App Coming Soon',
        content: 'Our mobile app is in development and will be available next month.',
        type: 'info',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        isActive: true,
      },
    ];
  }

  // Clear cache (useful for testing or when data needs to be refreshed)
  clearCache(): void {
    this.statsCache = null;
    this.configCache = null;
    this.categoriesCache = null;
    this.testimonialsCache = null;
    this.announcementsCache = null;
    this.lastFetch = 0;
  }

  // Get online status
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Force refresh all data
  async refreshAll(): Promise<void> {
    this.clearCache();
    await Promise.all([
      this.getStats(),
      this.getConfig(),
      this.getFeaturedCategories(),
      this.getTestimonials(),
      this.getAnnouncements(),
    ]);
  }
}

export const dataService = new DataService();
