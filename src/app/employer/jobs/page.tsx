'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Pause,
  Play,
  Building2,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Job, JobsResponse } from '@/types/api';
import { useJobs, getJobStatusColor } from '@/hooks/useJobs';

export default function ManageJobsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pausedJobs: 0,
    draftJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'employer') {
      router.push('/dashboard');
      return;
    }
    fetchJobs();
    fetchStats();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Debounce search and filter changes
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        employer: user?._id,
        limit: 50 // Get more jobs for employer dashboard
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sortBy) params.sortBy = sortBy;

      const response: JobsResponse = await apiClient.getGigs(params);
      setJobs(response.data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getJobStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch job stats:', err);
    }
  };

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      setError(null);
      setSuccess(null);
      
      switch (action) {
        case 'pause':
          await apiClient.updateJob(jobId, { status: 'paused' });
          setSuccess('Job paused successfully');
          break;
        case 'resume':
          await apiClient.updateJob(jobId, { status: 'active' });
          setSuccess('Job resumed successfully');
          break;
        case 'close':
          await apiClient.updateJob(jobId, { status: 'closed' });
          setSuccess('Job closed successfully');
          break;
        case 'delete':
          await apiClient.deleteJob(jobId);
          setSuccess('Job deleted successfully');
          break;
      }
      
      fetchJobs(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : `Failed to ${action} job`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'paused': return <Pause className="h-3 w-3 text-yellow-600" />;
      case 'closed': return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
      case 'draft': return <Edit className="h-3 w-3 text-blue-600" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const expiry = new Date(deadline);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatSalary = (job: Job) => {
    if (job.salary?.min && job.salary?.max) {
      return `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}`;
    } else if (job.salary?.min) {
      return `From ${job.salary.currency}${job.salary.min.toLocaleString()}`;
    } else if (job.salary?.max) {
      return `Up to ${job.salary.currency}${job.salary.max.toLocaleString()}`;
    }
    return 'Salary not disclosed';
  };

  if (!isAuthenticated || user?.role !== 'employer') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading jobs...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage MicroJobs</h1>
            <p className="text-gray-600">
              Track your microjob postings, monitor performance, and manage bids.
            </p>
          </div>

          <Link href="/employer/post-job">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New MicroJob
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MicroJob Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total MicroJobs</span>
                  <span className="font-bold text-lg">{stats.totalJobs}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Active</span>
                    </div>
                    <Badge variant="secondary">{stats.activeJobs}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Pause className="h-3 w-3 text-yellow-600 mr-2" />
                      <span className="text-sm">Paused</span>
                    </div>
                    <Badge variant="secondary">{stats.pausedJobs}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Edit className="h-3 w-3 text-blue-600 mr-2" />
                      <span className="text-sm">Drafts</span>
                    </div>
                    <Badge variant="secondary">{stats.draftJobs}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-sm">Closed</span>
                    </div>
                    <Badge variant="secondary">{stats.closedJobs}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Bids</span>
                  <span className="font-bold">{stats.totalApplications}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Views</span>
                  <span className="font-bold">{stats.totalViews}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Bids/MicroJob</span>
                  <span className="font-bold">
                    {stats.totalJobs > 0 ? Math.round(stats.totalApplications / stats.totalJobs) : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate MicroJob
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Promote MicroJobs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search microjobs..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="applications">Most Bids</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                    <SelectItem value="title">MicroJob Title A-Z</SelectItem>
                  </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Jobs List */}
            <div className="space-y-4">
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

              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No microjobs found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria' : 'Start by posting your first microjob'}
                  </p>
                  <Link href="/employer/post-job">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First MicroJob
                    </Button>
                  </Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <Card key={job._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              {job.featured && (
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  Featured
                                </Badge>
                              )}
                              {job.urgent && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  Urgent
                                </Badge>
                              )}
                              <Badge className={getStatusColor(job.status)}>
                                {getStatusIcon(job.status)}
                                <span className="ml-1 capitalize">{job.status}</span>
                              </Badge>
                            </div>

                            <p className="text-gray-600 mb-2">{job.category}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {job.type}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {formatSalary(job)}
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Calendar className="h-4 w-4 mr-1" />
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                              {job.deadline && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Expires in {getDaysLeft(job.deadline)} days</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center space-x-6 text-sm">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-blue-600" />
                                <span className="font-medium">{job.applicationsCount || 0}</span>
                                <span className="text-gray-500 ml-1">bids</span>
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1 text-green-600" />
                                <span className="font-medium">{job.viewsCount || 0}</span>
                                <span className="text-gray-500 ml-1">views</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          <div className="flex flex-col space-y-1">
                            <Link href={`/employer/jobs/${job._id}`}>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </Link>

                            {job.status === 'active' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleJobAction(job._id, 'pause')}
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </Button>
                            )}

                            {job.status === 'paused' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleJobAction(job._id, 'resume')}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </Button>
                            )}

                            {job.status === 'draft' && (
                              <Link href={`/employer/post-job?edit=${job._id}`}>
                                <Button size="sm">
                                  Publish
                                </Button>
                              </Link>
                            )}

                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleJobAction(job._id, 'delete')}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" className="bg-transparent">
                Load More MicroJobs
              </Button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
