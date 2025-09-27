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
  Download,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  User as UserIcon,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  MoreVertical,
  Loader2,
  Briefcase,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Application, ApplicationsResponse, Job, User as UserType } from '@/types/api';

export default function ViewApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  type EmployerApplication = Application & { job: Job; applicant: UserType };
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    interviewing: 0,
    rejected: 0,
    accepted: 0
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
    fetchApplications();
    fetchStats();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Debounce search and filter changes
    const timeoutId = setTimeout(() => {
      fetchApplications();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sortBy, currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sortBy) params.sortBy = sortBy;

      const response: ApplicationsResponse = await apiClient.getEmployerApplications(params);
      setApplications(response.data as unknown as EmployerApplication[]);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getEmployerApplicationStats();
      if (response.success && response.data) {
        setStats({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          reviewing: response.data.reviewing || 0,
          interviewing: response.data.interviewed || 0,
          rejected: response.data.rejected || 0,
          accepted: response.data.accepted || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch application stats:', err);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      setError(null);
      setSuccess(null);
      
      await apiClient.updateApplicationStatus(applicationId, newStatus);
      setSuccess(`Application ${newStatus} successfully`);
      
      // Refresh data
      fetchApplications();
      fetchStats();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update application status');
    }
  };

  const handleBulkAction = async (action: string, applicationIds: string[]) => {
    try {
      setError(null);
      setSuccess(null);
      
      await apiClient.bulkUpdateApplications(applicationIds, action);
      setSuccess(`Bulk ${action} completed successfully`);
      
      // Refresh data
      fetchApplications();
      fetchStats();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : `Failed to ${action} applications`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interviewing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'interviewing': return <Calendar className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDaysSinceApplied = (appliedDate: string) => {
    const today = new Date();
    const applied = new Date(appliedDate);
    const diffTime = Math.abs(today.getTime() - applied.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <span className="ml-2 text-muted-foreground">Loading applications...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bids & Applications</h1>
          <p className="text-gray-600">
            Review and manage bids for your microjobs as well as traditional applications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Applications</span>
                    <span className="font-bold text-lg">{stats.total}</span>
                  </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm">New</span>
                    </div>
                    <Badge variant="secondary">{stats.pending}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm">Reviewing</span>
                    </div>
                    <Badge variant="secondary">{stats.reviewing}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm">Interviewing</span>
                    </div>
                    <Badge variant="secondary">{stats.interviewing}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Accepted</span>
                    </div>
                    <Badge variant="secondary">{stats.accepted}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <Badge variant="secondary">{stats.rejected}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Applications
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
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
                      placeholder="Search candidates..." 
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="experience">Most Experience</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
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

              {applications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search criteria' 
                      : 'No candidates have applied to your jobs yet'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Link href="/employer/post-job">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {applications.length > 0 && (
                <>
                  {applications.map((application) => (
                    <Card key={application._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-gray-600" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-lg">{(application as any).applicant?.name}</h3>
                                <Badge className={getStatusColor(application.status)}>
                                  {getStatusIcon(application.status)}
                                  <span className="ml-1 capitalize">{application.status}</span>
                                </Badge>
                              </div>

                              <p className="text-gray-600 mb-2">{(application as any).job?.title}</p>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {(application as any).applicant?.location}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {Array.isArray((application as any).applicant?.experience)
                                    ? `${((application as any).applicant?.experience || []).length} roles`
                                    : ((application as any).applicant?.experience || 'Experience not specified')}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Applied {getDaysSinceApplied((application as any).appliedAt)} days ago
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-3">
                                {((application as any).applicant?.skills || []).slice(0, 4).map((skill: any, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {typeof skill === 'string' ? skill : (skill?.name || 'Skill')}
                                  </Badge>
                                ))}
                                {((application as any).applicant?.skills || []).length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{((application as any).applicant?.skills || []).length - 4} more
                                  </Badge>
                                )}
                              </div>

                              {(application.notes && application.notes.length > 0) && (
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                                  <strong>Notes:</strong> {application.notes[application.notes.length - 1].content}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            <div className="flex flex-col space-y-1">
                              <Link href={`/employer/applications/${application._id}`}>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>

                              <Button variant="outline" size="sm" className="bg-transparent">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>

                              {(application as any).applicant?.resume && (
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Resume
                                </Button>
                              )}

                              {/* Portfolio link not available in current schema */}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" className="bg-transparent">
                Load More Applications
              </Button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
