'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, MapPin, Clock, DollarSign, Building, Trash2, ExternalLink, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SavedGig {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: string;
  postedDate: string;
  savedDate: string;
  description: string;
  tags: string[];
  urgent: boolean;
}

export default function SavedGigsPage() {
  const { user } = useAuth();
  const [savedGigs, setSavedGigs] = useState<SavedGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('saved-date');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [urgentFilter, setUrgentFilter] = useState<string>('all');

  // Fetch real saved gigs from API
  useEffect(() => {
    const fetchSavedGigs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getSavedJobs({
          search: searchTerm || undefined,
          type: filterType !== 'all' ? filterType : undefined,
          location: locationFilter !== 'all' ? locationFilter : undefined,
          urgent: urgentFilter !== 'all' ? urgentFilter === 'urgent' : undefined,
          limit: 50
        });
        
        if (response.success && response.data) {
          console.log('Raw saved jobs response:', response.data); // Debug log
          
          // Transform saved jobs data to saved gigs format
          const savedGigs = response.data.map((savedJob: any) => {
            console.log('Processing saved job:', savedJob); // Debug log
            
            // Handle different response structures
            let jobObj = null;
            let gigId = '';
            
            if (savedJob.jobId && typeof savedJob.jobId === 'object') {
              // jobId is populated
              jobObj = savedJob.jobId;
              gigId = jobObj._id;
            } else if (typeof savedJob.jobId === 'string') {
              // jobId is just a string ID
              gigId = savedJob.jobId;
            } else {
              // Fallback
              gigId = savedJob._id;
            }
            
            const title = jobObj?.title || 'Unknown Gig';
            const company = 'Gigs Mint'; // Default company name
            const location = jobObj?.location || 'Remote';
            const type = jobObj?.category || 'contract';
            const salary = jobObj?.budget ? `₹${jobObj.budget}` : 'Not specified';
            const postedDate = jobObj?.createdAt || savedJob?.createdAt || new Date().toISOString();
            const savedDate = savedJob?.savedAt || savedJob?.createdAt || new Date().toISOString();
            const description = jobObj?.description || '';
            const tags = jobObj?.requirements || jobObj?.skills || [];
            const urgent = false; // We don't have urgent field in Job model
            
            console.log('Transformed gig:', { title, company, location, type, salary }); // Debug log
            
            return {
              id: savedJob._id,
              gigId,
              title,
              company,
              location,
              type,
              salary,
              postedDate,
              savedDate,
              description,
              tags,
              urgent
            } as SavedGig & { gigId: string };
          });
          setSavedGigs(savedGigs);
        } else {
          console.log('No saved jobs found or error:', response); // Debug log
          setSavedGigs([]);
        }
      } catch (error) {
        console.error('Error fetching saved gigs:', error);
        toast.error('Failed to load saved gigs');
        setSavedGigs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedGigs();
  }, [searchTerm, filterType, locationFilter, urgentFilter]);

  const handleRemoveJob = async (jobId: string) => {
    try {
      const response = await apiClient.removeSavedJob(jobId);
      if (response.success) {
        setSavedGigs(prev => prev.filter(job => job.id !== jobId));
        toast.success('Job removed from saved list');
      } else {
        toast.error(response.message || 'Failed to remove job from saved list');
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
      toast.error('Failed to remove job from saved list');
    }
  };

  // Server-side filtering is handled by the API, so we just need client-side sorting
  const sortedJobs = [...savedGigs].sort((a, b) => {
    switch (sortBy) {
      case 'saved-date':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      case 'posted-date':
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'company':
        return a.company.localeCompare(b.company);
      default:
        return 0;
    }
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'part-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'contract':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'remote':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const ts = Date.parse(dateString);
    if (Number.isNaN(ts)) return 'Unknown';
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saved Gigs</h1>
            <p className="text-muted-foreground">Jobs you've bookmarked for later</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Gigs</h1>
          <p className="text-muted-foreground">
            {savedGigs.length} gig{savedGigs.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Button asChild>
          <Link href="/gigs">
            <Search className="h-4 w-4 mr-2" />
            Browse More Jobs
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved gigs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgentFilter} onValueChange={setUrgentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="urgent">Urgent Only</SelectItem>
                  <SelectItem value="normal">Normal Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved-date">Date Saved</SelectItem>
                  <SelectItem value="posted-date">Date Posted</SelectItem>
                  <SelectItem value="title">Job Title</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {sortedJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved gigs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || locationFilter !== 'all' || urgentFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Start saving gigs you're interested in to see them here"
              }
            </p>
            <Button asChild>
              <Link href="/gigs">Browse Gigs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      {job.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getJobTypeColor(job.type)}>
                        {job.type.replace('-', ' ')}
                      </Badge>
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {formatDate(job.postedDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        Saved {formatDate(job.savedDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button asChild size="sm">
                      <Link href={`/gigs/${(job as any).gigId || job.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Gig
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveJob(job.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
