'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  TrendingUp,
  Users,
  Award,
  Shield
} from 'lucide-react';
import EnhancedGigsListing from '@/components/gigs/EnhancedGigsListing';
import { GigsProvider } from '@/contexts/GigsContext';
import { dataService, type ServerStats } from '@/services/dataService';
import { LoadingState } from '@/components/ui/loading-states';

export default function GigsPage() {
  const searchParams = useSearchParams();
  // const initialCategory = searchParams?.get('category') || 'all';
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const serverStats = await dataService.getStats();
        setStats(serverStats);
      } catch (error: unknown) {
        console.error('Failed to fetch stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load statistics');
        setIsOffline(!navigator.onLine);
      } finally {
      setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const retryFetch = () => {
    setError(null);
    setIsOffline(false);
    const fetchStats = async () => {
      try {
        setLoading(true);
        const serverStats = await dataService.getStats();
        setStats(serverStats);
      } catch (error: unknown) {
        console.error('Failed to fetch stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load statistics');
        setIsOffline(!navigator.onLine);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  };

  return (
    <GigsProvider>
      <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <section className="bg-muted py-16">
      <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Discover Amazing Gigs
          </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find the perfect freelance opportunities that match your skills. From quick tasks to long-term projects, 
                start your freelancing journey today.
              </p>
              
              {/* Professional Stats */}
              <LoadingState
                isLoading={loading}
                error={error}
                isOffline={isOffline}
                retry={retryFetch}
                className="mb-12"
              >
                <div className="flex flex-wrap justify-center gap-8">
                  {stats ? (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span className="font-medium">{stats.activeGigs}+ Active Gigs</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="font-medium">{stats.totalFreelancers.toLocaleString()}+ Freelancers</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-medium">{stats.successRate}% Success Rate</span>
                </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-medium">Professional Platform</span>
              </div>
                  )}
            </div>
              </LoadingState>
          </div>
        </div>
      </div>
    </section>

      {/* Enhanced Gigs Listing */}
    <section className="py-12">
      <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <EnhancedGigsListing />
        </div>
      </div>
    </section>
  </div>
      </GigsProvider>
    );
}

