'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Eye, 
  ArrowRight,
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatGigBudget, getDaysAgo } from '@/hooks/useGigsManager';
import type { Job } from '@/types/api';
import CTACard from './CTACard';

// Category mapping for display
const categoryLabels: Record<string, string> = {
  'website development': 'Website Development',
  'graphic design': 'Graphic Design', 
  'content writing': 'Content Writing',
  'social media management': 'Social Media',
  'seo': 'SEO & Marketing',
  'app development': 'App Development',
  'game development': 'Game Development'
};

const categoryIcons: Record<string, string> = {
  'website development': '🌐',
  'graphic design': '🎨',
  'content writing': '✍️',
  'social media management': '📱',
  'seo': '📈',
  'app development': '📱',
  'game development': '🎮'
};

export default function LatestGigs() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestGigs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch latest 5 gigs sorted by recent
        const response = await apiClient.getGigs({ 
          limit: 5,
          page: 1 
        });
        
        if (response.success && response.data) {
          setGigs(response.data);
        } else {
          setError('Failed to fetch gigs');
        }
      } catch (err) {
        console.error('Error fetching latest gigs:', err);
        setError('Unable to load gigs');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestGigs();
  }, []);

  const handleViewGig = (gigId: string) => {
    router.push(`/gigs/${gigId}`);
  };

  const handleViewAllGigs = () => {
    router.push('/gigs');
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || '🎯';
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Latest Leads</h2>
            <p className="text-muted-foreground text-lg">Discover the newest verified client opportunities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="professional-card">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="h-6 w-full bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
                    <div className="flex gap-4">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Latest Leads</h2>
            <p className="text-muted-foreground text-lg">Discover the newest verified client opportunities</p>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unable to Load Leads</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Latest Gigs</h2>
          <p className="text-muted-foreground text-lg">Discover the newest opportunities</p>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gigs.map((gig) => (
            <Card key={gig._id} className="professional-card hover-professional-primary group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <span>{getCategoryIcon(gig.category)}</span>
                    {getCategoryLabel(gig.category)}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-green-600">
                    Active
                  </Badge>
                </div>
                
                <CardTitle 
                  className="text-xl mb-3 group-hover:text-primary transition-colors cursor-pointer line-clamp-2" 
                  onClick={() => handleViewGig(gig._id)}
                >
                  {gig.title}
                </CardTitle>
                
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {gig.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Gig Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {formatGigBudget(gig)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {getDaysAgo(gig.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {gig.applicationsCount || 0} unlocks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {gig.views || 0} views
                    </span>
                  </div>
                </div>

                {/* Skills */}
                {gig.requirements && gig.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Skills Required:</h4>
                    <div className="flex flex-wrap gap-1">
                      {gig.requirements.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {gig.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{gig.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => handleViewGig(gig._id)}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Lead
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {/* CTA Card as 6th item */}
          <CTACard />
        </div>
      </div>
    </section>
  );
}


