'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Search,
  Filter,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  BookmarkPlus,
  Eye,
  Briefcase,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Calendar,
  Briefcase as BriefcaseIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { SearchJobsRequest } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useGigs, getGigTypeColor, formatGigBudget } from '@/hooks/useGigs';

export default function GigsListing() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sort, setSort] = useState('recent');
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  const searchParams: SearchJobsRequest = {
    query: searchTerm || undefined,
    location: selectedLocation || undefined,
    category: selectedCategory || undefined,
    type: selectedType || undefined,
    sort,
    limit: 10,
  };

  const { gigs, loading, error, pagination, fetchGigs, loadMoreGigs, hasMore } = useGigs({
    initialParams: searchParams,
    autoFetch: false
  });

  useEffect(() => {
    setIsVisible(true);
    fetchGigs(searchParams);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGigs(searchParams);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedLocation, selectedCategory, selectedType, sort]);

  const handleApply = async (jobId: string) => {
    if (!isAuthenticated) {
      router.push('/login?next=/jobs');
      return;
    }
    try {
      setApplyingJobId(jobId);
      setSuccess(null);
      await apiClient.createApplication({ job: jobId, coverLetter: '' });
      setSuccess('Bid submitted successfully!');
      router.push('/applications');
    } catch (err) {
      // noop
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <>
      <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Find Your Next Gig
                </h1>
                <p className="text-primary-foreground text-lg md:text-xl">
                  Discover microjobs and short projects that match your skills
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Briefcase className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{pagination.total}</div>
                <div className="text-primary-foreground text-sm">Active MicroJobs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{Math.min(100, Math.round(((gigs?.length || 0) / Math.max(1, pagination.limit)) * 100))}%</div>
                <div className="text-primary-foreground text-sm">Match Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">—</div>
                <div className="text-primary-foreground text-sm">Avg Delivery Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">—</div>
                <div className="text-primary-foreground text-sm">Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success">
          <CheckCircle className="h-5 w-5 inline mr-2" />
          {success}
        </div>
      )}

      <div className={`mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-400 to-slate-500 rounded-bl-full opacity-20"></div>
          <CardContent className="p-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                <Input
                  placeholder="Search microjobs, companies, skills..."
                  className="pl-10 border-2 focus:border-primary transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="border-2 focus:border-primary">
                  <SelectValue placeholder="Microjob Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote"><Globe className="h-4 w-4 mr-2" /> Remote</SelectItem>
                  <SelectItem value="san-francisco"><MapPin className="h-4 w-4 mr-2" /> San Francisco, CA</SelectItem>
                  <SelectItem value="new-york"><MapPin className="h-4 w-4 mr-2" /> New York, NY</SelectItem>
                  <SelectItem value="austin"><MapPin className="h-4 w-4 mr-2" /> Austin, TX</SelectItem>
                  <SelectItem value="seattle"><MapPin className="h-4 w-4 mr-2" /> Seattle, WA</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-2 focus:border-primary">
                  <SelectValue placeholder="Microjob Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology"><BriefcaseIcon className="h-4 w-4 mr-2" /> Technology</SelectItem>
                  <SelectItem value="Design"><Star className="h-4 w-4 mr-2" /> Design</SelectItem>
                  <SelectItem value="Marketing"><TrendingUp className="h-4 w-4 mr-2" /> Marketing</SelectItem>
                  <SelectItem value="Sales"><Users className="h-4 w-4 mr-2" /> Sales</SelectItem>
                  <SelectItem value="Engineering"><Zap className="h-4 w-4 mr-2" /> Engineering</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="border-2 focus:border-primary">
                  <SelectValue placeholder="Microjob Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="micro-task"><Clock className="h-4 w-4 mr-2" /> Micro-task</SelectItem>
                  <SelectItem value="short-project"><Clock className="h-4 w-4 mr-2" /> Short project</SelectItem>
                  <SelectItem value="hourly"><Clock className="h-4 w-4 mr-2" /> Hourly</SelectItem>
                  <SelectItem value="fixed-price"><Clock className="h-4 w-4 mr-2" /> Fixed-price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="border-2 hover:border-primary bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    {pagination.total} microjobs found
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Sort by:</span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-32 border-2 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent"><Calendar className="h-4 w-4 mr-2" /> Recent</SelectItem>
                    <SelectItem value="salary"><DollarSign className="h-4 w-4 mr-2" /> Budget</SelectItem>
                    <SelectItem value="company"><Building2 className="h-4 w-4 mr-2" /> Client</SelectItem>
                    <SelectItem value="match"><Star className="h-4 w-4 mr-2" /> Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading microjobs...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load microjobs</h3>
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button onClick={() => fetchGigs()} variant="outline" className="bg-transparent">
                Try Again
              </Button>
            </div>
          ) : (gigs?.length || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No microjobs found</h3>
              <p className="text-muted-foreground text-center">Try adjusting your search criteria</p>
            </div>
          ) : (
            gigs.map((job) => (
              <Card key={job._id} className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>

                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        {job.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {job.urgent && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                            <Zap className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                        <Badge className={"border-0"}>
                          {job.category}
                        </Badge>
                        {job.isRemote && (
                          <Badge className="bg-primary/10 text-primary border-blue-200">
                            Remote
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="flex items-center text-foreground mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                          {typeof job.company === 'object' ? job.company.name.slice(0, 2).toUpperCase() : 'CO'}
                        </div>
                        {typeof job.company === 'object' ? job.company.name : 'Client'}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <p className="text-foreground mb-4 line-clamp-2">
                    {user?.subscription?.status === 'active' ? job.description : (job.shortDescription || 'Subscribe to view full gig details.')}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-4">
                    <div className="flex items-center bg-muted px-3 py-1 rounded-full">
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      {job.location}
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full border ${getGigTypeColor(job.type)}`}>
                      <Clock className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center bg-success/10 px-3 py-1 rounded-full">
                      <DollarSign className="h-4 w-4 mr-1 text-success" />
                      {formatGigBudget(job)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-xs text-gray-700">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {job.applicationsCount} bids
                      </span>
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        onClick={() => {
                          if (user?.subscription?.status !== 'active') {
                            router.push('/pricing');
                            return;
                          }
                          handleApply(job._id);
                        }}
                        disabled={applyingJobId === job._id}
                      >
                        {user?.subscription?.status !== 'active' ? 'Subscribe to Bid' : (applyingJobId === job._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Place Bid')}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-bl-full opacity-20"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-muted-foreground">Active MicroJobs</span>
                <span className="font-bold text-primary">{pagination.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-bl-full opacity-20"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-lg">
                <Star className="h-5 w-5 mr-2 text-warning" />
                Popular Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {[
                  { name: 'Technology', count: '3,247', icon: <BriefcaseIcon className="h-5 w-5" /> },
                  { name: 'Design', count: '1,892', icon: <Star className="h-5 w-5" /> },
                  { name: 'Marketing', count: '1,543', icon: <TrendingUp className="h-5 w-5" /> },
                  { name: 'Sales', count: '1,234', icon: <Users className="h-5 w-5" /> },
                  { name: 'Engineering', count: '987', icon: <Zap className="h-5 w-5" /> }
                ].map((category) => (
                  <div key={category.name} className="flex justify-between items-center p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">{category.icon}</span>
                      <span className="text-foreground group-hover:text-primary transition-colors">{category.name}</span>
                    </div>
                    <Badge className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-bl-full opacity-20"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="h-5 w-5 mr-2 text-success" />
                Budget Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Entry Level</span>
                <span className="font-semibold text-foreground">$10 - $25/hr</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-muted-foreground">Mid Level</span>
                <span className="font-semibold text-primary">$25 - $50/hr</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span className="text-muted-foreground">Senior Level</span>
                <span className="font-semibold text-success">$50 - $100/hr</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                <span className="text-muted-foreground">Fixed-price Projects</span>
                <span className="font-semibold text-secondary">$250 - $10k+</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={`text-center mt-12 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {hasMore ? (
          <Button
            onClick={loadMoreGigs}
            variant="outline"
            size="lg"
            className="border-2 hover:border-primary hover:bg-primary/10 transition-all duration-300 transform hover:-translate-y-1"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-5 w-5 mr-2" />
            )}
            Load More MicroJobs
          </Button>
        ) : (
          <div className="text-muted-foreground">
            You've seen all available microjobs
          </div>
        )}
      </div>
    </>
  );
}


