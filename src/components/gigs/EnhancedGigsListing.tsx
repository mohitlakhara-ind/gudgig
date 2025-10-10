'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Heart,
  ArrowRight,
  Briefcase,
  Calendar,
  Star,
  Eye,
  MessageCircle,
  Bookmark,
  TrendingUp,
  Zap,
  Shield,
  Award,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useGigs } from '@/contexts/GigsContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatGigBudget, getDaysAgo, getGigStatusColor } from '@/hooks/useGigsManager';

// Enhanced categories with better organization
const categories = [
  { value: 'all', label: 'All Categories', icon: '🎯' },
  { value: 'website development', label: 'Website Development', icon: '🌐' },
  { value: 'graphic design', label: 'Graphic Design', icon: '🎨' },
  { value: 'content writing', label: 'Content Writing', icon: '✍️' },
  { value: 'social media management', label: 'Social Media', icon: '📱' },
  { value: 'seo', label: 'SEO & Marketing', icon: '📈' },
  { value: 'app development', label: 'App Development', icon: '📱' },
  { value: 'game development', label: 'Game Development', icon: '🎮' }
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'budget-low', label: 'Lowest Budget' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'bids', label: 'Most Bids' },
  { value: 'views', label: 'Most Views' }
];

export default function EnhancedGigsListing() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, actions, gigsManager } = useGigs();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        actions.addRecentSearch(searchQuery);
        setIsSearching(true);
        gigsManager.fetchGigs({
          category: state.filters.category !== 'all' ? state.filters.category as any : undefined,
          query: searchQuery
        }).finally(() => setIsSearching(false));
      } else {
        gigsManager.fetchGigs({
          category: state.filters.category !== 'all' ? state.filters.category as any : undefined,
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, state.filters.category]); // Remove actions and gigsManager to prevent infinite loop

  const handleSaveGig = async (gigId: string) => {
    if (!user) {
      toast.error('Please login to save gigs');
      router.push('/auth/login');
      return;
    }

    try {
      const isSaved = state.savedGigs.includes(gigId);
      
      if (isSaved) {
        await apiClient.unsaveJob(gigId);
        actions.toggleSavedGig(gigId);
        toast.success('Gig removed from saved');
      } else {
        await apiClient.saveJob(gigId);
        actions.toggleSavedGig(gigId);
        toast.success('Gig saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save gig');
    }
  };

  const handlePlaceBid = (gigId: string) => {
    if (!user) {
      toast.error('Please login to place bids');
      router.push('/auth/login');
      return;
    }
    router.push(`/gigs/${gigId}/bid`);
  };

  const handleGuestBidPrompt = () => {
    toast.error('Please login or register to place bids');
    router.push('/auth/login');
  };

  const handleViewGig = (gigId: string) => {
    router.push(`/gigs/${gigId}`);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '🎯';
  };

  const handleRefresh = () => {
    gigsManager.refresh();
    toast.success('Gigs refreshed');
  };

  return (
    <div className="space-y-6">
          {/* Professional Search and Filters */}
          <Card className="professional-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground text-xl">
                <Search className="h-5 w-5 text-primary" />
                Find Your Perfect Gig
              </CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gigs, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 professional-input"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
            
            <Select 
              value={state.filters.category} 
              onValueChange={(value) => actions.setFilters({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={state.sortBy} 
              onValueChange={actions.setSortBy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setViewMode('grid')}
                >
                  <div className="grid grid-cols-2 gap-1">
                    <div className="w-1 h-1 bg-current rounded"></div>
                    <div className="w-1 h-1 bg-current rounded"></div>
                    <div className="w-1 h-1 bg-current rounded"></div>
                    <div className="w-1 h-1 bg-current rounded"></div>
                  </div>
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setViewMode('list')}
                >
                  <div className="flex flex-col gap-1">
                    <div className="w-3 h-1 bg-current rounded"></div>
                    <div className="w-3 h-1 bg-current rounded"></div>
                    <div className="w-3 h-1 bg-current rounded"></div>
                  </div>
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={gigsManager.isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${gigsManager.isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {gigsManager.gigs.length} gigs found
              {state.filters.category !== 'all' && ` in ${getCategoryLabel(state.filters.category)}`}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Error State */}
      {gigsManager.error && gigsManager.gigs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-destructive mb-4">
              <AlertCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unable to Connect to Server</h3>
              <p className="text-muted-foreground mb-4">{gigsManager.error}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Please check your internet connection and ensure the server is running.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={gigsManager.retry}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!gigsManager.error && gigsManager.gigs.length === 0 && !gigsManager.loading && (
        <Card className="text-center py-16">
          <CardContent>
            <Briefcase className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No gigs found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any gigs matching your criteria. Try adjusting your search or browse all categories.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => {
                setSearchQuery('');
                actions.resetFilters();
              }}>
                Clear Filters
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

              {/* Professional Gigs Grid/List */}
          {gigsManager.gigs.length > 0 && (
            <>
              <div className={state.viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" 
                : "space-y-4"
              }>
                {gigsManager.gigs.map((gig) => (
                  <Card key={gig._id} className="professional-card hover-professional-primary group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <span>{getCategoryIcon(gig.category)}</span>
                          {getCategoryLabel(gig.category)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getGigStatusColor(gig.status || 'active')}`}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {gig.status || 'Active'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors cursor-pointer" 
                                 onClick={() => handleViewGig(gig._id)}>
                        {gig.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveGig(gig._id)}
                        className="shrink-0 h-8 w-8"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            state.savedGigs.includes(gig._id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`} 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewGig(gig._id)}
                        className="shrink-0 h-8 w-8"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {gig.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Skills */}
                  {gig.requirements && gig.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Skills Required:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {gig.requirements.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {gig.requirements.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{gig.requirements.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

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
                        {gig.applicationsCount || 0} applications
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {gig.views || 0} views
                      </span>
                    </div>
                  </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {user ? (
                          <Button 
                            className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={() => handlePlaceBid(gig._id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Place Bid
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        ) : (
                          <Button 
                            className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={handleGuestBidPrompt}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Login to Bid
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleViewGig(gig._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {gigsManager.hasMore && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={gigsManager.loadMoreGigs}
                disabled={gigsManager.loading}
                className="px-8"
              >
                {gigsManager.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Gigs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
